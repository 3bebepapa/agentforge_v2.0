/**
 * 통합 워크플로우 엔진
 * 기존의 분산된 워크플로우 엔진 관련 코드를 통합
 */

import { v4 as uuidv4 } from "uuid"
import type {
  NodeInstance,
  Edge,
  NodeExecutor,
  NodeExecutionResult,
  ExecutionContext,
  Workflow,
  WorkflowExecutionLog,
  WorkflowExecutionResult,
} from "../types/core-types"

// 워크플로우 엔진 클래스
export class WorkflowEngine {
  private nodeExecutors: Record<string, NodeExecutor> = {}

  constructor() {
    // 기본 실행기 등록은 initialize 메서드에서 수행
  }

  // 노드 실행기 초기화
  initialize(executors: Record<string, NodeExecutor>) {
    this.nodeExecutors = executors
  }

  // 노드 실행기 등록
  registerNodeExecutor(type: string, executor: NodeExecutor): void {
    this.nodeExecutors[type] = executor
  }

  // 워크플로우 실행
  async executeWorkflow(
    workflow: Workflow,
    initialContext: Record<string, any> = {},
  ): Promise<WorkflowExecutionResult> {
    const context: ExecutionContext = {
      nodes: {},
      edges: workflow.edges,
      variables: initialContext,
    }

    const logs: WorkflowExecutionLog[] = []

    try {
      // 시작 노드 찾기 (입력 엣지가 없는 노드)
      const startNodes = this.findStartNodes(workflow)

      if (startNodes.length === 0) {
        throw new Error("시작 노드를 찾을 수 없습니다.")
      }

      // 각 시작 노드부터 실행
      for (const startNode of startNodes) {
        await this.executeNode(startNode, workflow, context, logs)
      }

      return {
        success: true,
        data: this.collectOutputs(workflow, context),
        logs,
        nodeResults: context.nodes,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      logs.push({
        timestamp: new Date().toISOString(),
        nodeId: "workflow",
        status: "error",
        message: errorMessage,
      })

      return {
        success: false,
        error: errorMessage,
        logs,
        nodeResults: context.nodes,
      }
    }
  }

  // 노드 실행
  private async executeNode(
    node: NodeInstance,
    workflow: Workflow,
    context: ExecutionContext,
    logs: WorkflowExecutionLog[],
  ): Promise<NodeExecutionResult> {
    // 이미 실행된 노드는 결과 반환
    if (context.nodes[node.id]) {
      return context.nodes[node.id]
    }

    // 로그 기록
    logs.push({
      timestamp: new Date().toISOString(),
      nodeId: node.id,
      status: "start",
      message: `노드 '${node.data.label || node.type}' 실행 시작`,
    })

    try {
      // 노드 타입에 맞는 실행기 가져오기
      const executor = this.nodeExecutors[node.type]

      if (!executor) {
        throw new Error(`노드 타입 '${node.type}'에 대한 실행기를 찾을 수 없습니다.`)
      }

      // 노드 실행
      const result = await executor.execute(node, context)

      // 결과 저장
      context.nodes[node.id] = result

      // 로그 기록
      logs.push({
        timestamp: new Date().toISOString(),
        nodeId: node.id,
        status: "success",
        message: `노드 '${node.data.label || node.type}' 실행 완료`,
      })

      // 다음 노드 실행
      const nextNodes = this.findNextNodes(node.id, workflow)

      for (const nextNode of nextNodes) {
        // 다음 노드의 모든 입력이 준비되었는지 확인
        const inputNodes = this.findInputNodes(nextNode.id, workflow)
        const allInputsReady = inputNodes.every((inputNode) => context.nodes[inputNode.id]?.success)

        if (allInputsReady) {
          await this.executeNode(nextNode, workflow, context, logs)
        }
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // 오류 결과 저장
      const errorResult: NodeExecutionResult = {
        success: false,
        error: errorMessage,
      }

      context.nodes[node.id] = errorResult

      // 로그 기록
      logs.push({
        timestamp: new Date().toISOString(),
        nodeId: node.id,
        status: "error",
        message: `노드 '${node.data.label || node.type}' 실행 오류: ${errorMessage}`,
      })

      return errorResult
    }
  }

  // 시작 노드 찾기 (입력 엣지가 없는 노드)
  private findStartNodes(workflow: Workflow): NodeInstance[] {
    const targetNodeIds = new Set(workflow.edges.map((edge) => edge.target))
    return workflow.nodes.filter((node) => !targetNodeIds.has(node.id))
  }

  // 다음 노드 찾기 (현재 노드에서 출력 엣지로 연결된 노드)
  private findNextNodes(nodeId: string, workflow: Workflow): NodeInstance[] {
    const nextNodeIds = workflow.edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target)

    return workflow.nodes.filter((node) => nextNodeIds.includes(node.id))
  }

  // 입력 노드 찾기 (현재 노드로 입력 엣지를 보내는 노드)
  private findInputNodes(nodeId: string, workflow: Workflow): NodeInstance[] {
    const inputNodeIds = workflow.edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source)

    return workflow.nodes.filter((node) => inputNodeIds.includes(node.id))
  }

  // 출력 수집 (출력 엣지가 없는 노드의 결과)
  private collectOutputs(workflow: Workflow, context: ExecutionContext): Record<string, any> {
    const sourceNodeIds = new Set(workflow.edges.map((edge) => edge.source))
    const outputNodes = workflow.nodes.filter((node) => !sourceNodeIds.has(node.id))

    const outputs: Record<string, any> = {}

    for (const node of outputNodes) {
      if (context.nodes[node.id]?.success) {
        outputs[node.id] = context.nodes[node.id].data
      }
    }

    return outputs
  }

  // 워크플로우 생성 헬퍼 메서드
  createWorkflow(data: {
    name: string
    description: string
    nodes: NodeInstance[]
    edges: Edge[]
  }): Workflow {
    return {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      nodes: data.nodes,
      edges: data.edges,
      version: "1.0",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
  }

  // 노드 생성 헬퍼 메서드
  createNode(data: {
    type: string
    position: { x: number; y: number }
    data: {
      label?: string
      parameters: Record<string, any>
    }
  }): NodeInstance {
    return {
      id: uuidv4(),
      type: data.type,
      position: data.position,
      data: {
        label: data.data.label,
        parameters: data.data.parameters,
        inputs: {},
        outputs: {},
      },
    }
  }

  // 엣지 생성 헬퍼 메서드
  createEdge(data: {
    source: string
    sourceHandle: string
    target: string
    targetHandle: string
  }): Edge {
    return {
      id: `edge-${uuidv4()}`,
      source: data.source,
      sourceHandle: data.sourceHandle,
      target: data.target,
      targetHandle: data.targetHandle,
    }
  }
}

// 워크플로우 엔진 싱글톤 인스턴스
let workflowEngineInstance: WorkflowEngine | null = null

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance) {
    workflowEngineInstance = new WorkflowEngine()
  }
  return workflowEngineInstance
}
