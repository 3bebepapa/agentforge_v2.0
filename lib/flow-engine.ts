import type { NodeInstance, Edge, Workflow } from "./node-types"
import { getNodeDefinition } from "./node-library"

// 워크플로우 실행 엔진
export class FlowEngine {
  private workflow: Workflow
  private nodeInstances: Map<string, NodeInstance>
  private edges: Map<string, Edge>
  private executionState: Map<string, any>
  private executionLog: any[]

  constructor(workflow: Workflow) {
    this.workflow = workflow
    this.nodeInstances = new Map()
    this.edges = new Map()
    this.executionState = new Map()
    this.executionLog = []

    // 노드 인스턴스 및 엣지 초기화
    workflow.nodes.forEach((node) => {
      this.nodeInstances.set(node.id, node)
    })

    workflow.edges.forEach((edge) => {
      this.edges.set(edge.id, edge)
    })
  }

  // 워크플로우 실행
  async execute(initialInputs: Record<string, any> = {}): Promise<Record<string, any>> {
    this.executionState.clear()
    this.executionLog = []

    // 초기 입력 설정
    Object.entries(initialInputs).forEach(([key, value]) => {
      this.executionState.set(key, value)
    })

    // 시작 노드 찾기 (입력 노드 또는 트리거 노드)
    const startNodes = this.findStartNodes()

    if (startNodes.length === 0) {
      throw new Error("시작 노드를 찾을 수 없습니다.")
    }

    // 각 시작 노드에서 실행 시작
    const results: Record<string, any> = {}

    for (const startNode of startNodes) {
      try {
        const nodeResult = await this.executeNode(startNode.id)
        results[startNode.id] = nodeResult
      } catch (error) {
        console.error(`노드 ${startNode.id} 실행 오류:`, error)
        this.logExecution(startNode.id, "error", error.message)
        results[startNode.id] = { error: error.message }
      }
    }

    return {
      results,
      executionLog: this.executionLog,
    }
  }

  // 시작 노드 찾기
  private findStartNodes(): NodeInstance[] {
    // 들어오는 엣지가 없는 노드를 시작 노드로 간주
    const nodesWithIncomingEdges = new Set<string>()

    this.edges.forEach((edge) => {
      nodesWithIncomingEdges.add(edge.target)
    })

    return Array.from(this.nodeInstances.values()).filter((node) => !nodesWithIncomingEdges.has(node.id))
  }

  // 단일 노드 실행
  private async executeNode(nodeId: string, inputs: Record<string, any> = {}): Promise<any> {
    const nodeInstance = this.nodeInstances.get(nodeId)

    if (!nodeInstance) {
      throw new Error(`노드 ${nodeId}를 찾을 수 없습니다.`)
    }

    // 노드 정의 가져오기
    const nodeDefinition = getNodeDefinition(nodeInstance.type)

    if (!nodeDefinition) {
      throw new Error(`노드 유형 ${nodeInstance.type}에 대한 정의를 찾을 수 없습니다.`)
    }

    // 노드 상태 업데이트
    nodeInstance.data.state = {
      status: "running",
      startTime: new Date().toISOString(),
    }

    this.logExecution(nodeId, "start", `노드 ${nodeInstance.type} 실행 시작`)

    try {
      // 노드 입력 수집
      const nodeInputs = { ...inputs }

      // 들어오는 엣지에서 입력 수집
      const incomingEdges = this.getIncomingEdges(nodeId)

      for (const edge of incomingEdges) {
        const sourceNode = this.nodeInstances.get(edge.source)

        if (sourceNode && sourceNode.data.state && sourceNode.data.state.result) {
          const sourceOutput = sourceNode.data.state.result[edge.sourceHandle]

          if (sourceOutput !== undefined) {
            nodeInputs[edge.targetHandle] = sourceOutput
          }
        }
      }

      // 노드 파라미터 가져오기
      const parameters = nodeInstance.data.parameters || {}

      // 노드 실행
      let result

      if (nodeDefinition.execute) {
        // 노드 정의에 실행 함수가 있는 경우
        result = await nodeDefinition.execute(nodeInputs, parameters)
      } else if (nodeDefinition.code) {
        // 코드 문자열이 있는 경우 함수로 변환하여 실행
        try {
          const executeFunction = new Function("inputs", "parameters", nodeDefinition.code)
          result = await executeFunction(nodeInputs, parameters)
        } catch (error) {
          throw new Error(`노드 코드 실행 오류: ${error.message}`)
        }
      } else {
        throw new Error(`노드 ${nodeInstance.type}에 실행 로직이 없습니다.`)
      }

      // 노드 상태 업데이트
      nodeInstance.data.state = {
        status: "success",
        startTime: nodeInstance.data.state.startTime,
        endTime: new Date().toISOString(),
        result,
      }

      this.logExecution(nodeId, "success", `노드 ${nodeInstance.type} 실행 성공`)

      // 다음 노드 실행
      const outgoingEdges = this.getOutgoingEdges(nodeId)

      for (const edge of outgoingEdges) {
        try {
          // 소스 핸들에 해당하는 출력만 다음 노드의 입력으로 전달
          const nextNodeInputs: Record<string, any> = {}

          if (result && result[edge.sourceHandle] !== undefined) {
            nextNodeInputs[edge.targetHandle] = result[edge.sourceHandle]
          }

          await this.executeNode(edge.target, nextNodeInputs)
        } catch (error) {
          console.error(`다음 노드 ${edge.target} 실행 오류:`, error)
          this.logExecution(edge.target, "error", error.message)
        }
      }

      return result
    } catch (error) {
      // 오류 처리
      nodeInstance.data.state = {
        status: "error",
        startTime: nodeInstance.data.state.startTime,
        endTime: new Date().toISOString(),
        error: error.message,
      }

      this.logExecution(nodeId, "error", `노드 ${nodeInstance.type} 실행 오류: ${error.message}`)

      throw error
    }
  }

  // 들어오는 엣지 가져오기
  private getIncomingEdges(nodeId: string): Edge[] {
    return Array.from(this.edges.values()).filter((edge) => edge.target === nodeId)
  }

  // 나가는 엣지 가져오기
  private getOutgoingEdges(nodeId: string): Edge[] {
    return Array.from(this.edges.values()).filter((edge) => edge.source === nodeId)
  }

  // 실행 로그 기록
  private logExecution(nodeId: string, status: "start" | "success" | "error", message: string): void {
    this.executionLog.push({
      timestamp: new Date().toISOString(),
      nodeId,
      status,
      message,
    })
  }

  // 워크플로우 상태 가져오기
  getWorkflowState(): any {
    const nodeStates: Record<string, any> = {}

    this.nodeInstances.forEach((node, id) => {
      nodeStates[id] = node.data.state || { status: "idle" }
    })

    return {
      nodes: nodeStates,
      executionLog: this.executionLog,
    }
  }

  // 워크플로우 재설정
  reset(): void {
    this.nodeInstances.forEach((node) => {
      node.data.state = { status: "idle" }
    })

    this.executionState.clear()
    this.executionLog = []
  }
}

// 워크플로우 생성 함수
export function createWorkflow(name: string, description?: string): Workflow {
  return {
    id: `workflow-${Date.now()}`,
    name,
    description: description || "",
    nodes: [],
    edges: [],
    version: "1.0",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }
}

// 워크플로우 엔진 인스턴스 생성
export function createFlowEngine(workflow: Workflow): FlowEngine {
  return new FlowEngine(workflow)
}
