import type {
  AgentNode,
  AgentEdge,
  AgentExecutionContext,
  AgentExecutionResult,
  AgentExecutionLog,
} from "./agent-types"
import { getAINodeDefinition } from "./ai-node-library"

// 에이전트 실행 엔진
export class AgentExecutor {
  private nodes: AgentNode[]
  private edges: AgentEdge[]
  private context: AgentExecutionContext
  private executionOrder: string[] = []
  private nodeStates: Map<string, "idle" | "running" | "completed" | "failed"> = new Map()

  constructor(nodes: AgentNode[], edges: AgentEdge[], apiKey: string) {
    this.nodes = nodes
    this.edges = edges
    this.context = {
      apiKey,
      variables: {},
      logs: [],
      results: {},
    }
    this.initializeNodeStates()
    this.determineExecutionOrder()
  }

  // 노드 상태 초기화
  private initializeNodeStates() {
    this.nodes.forEach((node) => {
      this.nodeStates.set(node.id, "idle")
    })
  }

  // 실행 순서 결정
  private determineExecutionOrder() {
    // 들어오는 엣지가 없는 노드를 시작 노드로 간주
    const startNodes = this.nodes.filter((node) => !this.edges.some((edge) => edge.target === node.id))

    // 시작 노드부터 BFS로 실행 순서 결정
    const visited = new Set<string>()
    const queue = [...startNodes.map((node) => node.id)]

    while (queue.length > 0) {
      const nodeId = queue.shift()!

      if (visited.has(nodeId)) continue

      visited.add(nodeId)
      this.executionOrder.push(nodeId)

      // 현재 노드에서 나가는 엣지 찾기
      const outgoingEdges = this.edges.filter((edge) => edge.source === nodeId)

      // 다음 노드들을 큐에 추가
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target)
        }
      }
    }
  }

  // 로그 기록
  private logExecution(nodeId: string, status: "start" | "success" | "error", message: string) {
    const log: AgentExecutionLog = {
      timestamp: new Date().toISOString(),
      nodeId,
      status,
      message,
    }
    this.context.logs.push(log)
    console.log(`[${log.status.toUpperCase()}] ${nodeId}: ${message}`)
  }

  // 워크플로우 실행
  async execute(): Promise<Record<string, AgentExecutionResult>> {
    // 모든 노드 상태 초기화
    this.initializeNodeStates()
    this.context.results = {}

    // 실행 순서대로 노드 실행
    for (const nodeId of this.executionOrder) {
      await this.executeNode(nodeId)
    }

    return this.context.results
  }

  // 단일 노드 실행
  private async executeNode(nodeId: string): Promise<void> {
    const node = this.nodes.find((n) => n.id === nodeId)
    if (!node) {
      throw new Error(`노드 ${nodeId}를 찾을 수 없습니다.`)
    }

    // 노드 상태 업데이트
    this.nodeStates.set(nodeId, "running")
    this.logExecution(nodeId, "start", `노드 ${node.data.label} 실행 시작`)

    try {
      // 노드 입력 수집
      const inputs: Record<string, any> = {}

      // 들어오는 엣지에서 입력 수집
      const incomingEdges = this.edges.filter((edge) => edge.target === nodeId)

      for (const edge of incomingEdges) {
        const sourceNode = this.nodes.find((n) => n.id === edge.source)
        if (!sourceNode) continue

        const sourceResult = this.context.results[edge.source]
        if (sourceResult && sourceResult.success) {
          const outputValue = sourceResult.data[edge.sourceHandle]
          if (outputValue !== undefined) {
            inputs[edge.targetHandle] = outputValue
          }
        }
      }

      // 노드 파라미터 가져오기
      const parameters = {
        ...node.data.parameters,
        apiKey: this.context.apiKey,
      }

      // 노드 실행
      let result: Record<string, any>

      // 노드 타입에 따라 실행 방법 결정
      if (node.data.type === "input") {
        // 입력 노드 처리
        result = this.executeInputNode(node.data)
      } else if (node.data.type === "output") {
        // 출력 노드 처리
        result = this.executeOutputNode(inputs)
      } else {
        // AI 노드 또는 기타 노드 처리
        const aiNodeDefinition = getAINodeDefinition(node.data.type)

        if (aiNodeDefinition) {
          // AI 노드 실행
          result = await aiNodeDefinition.execute(inputs, parameters)
        } else {
          // 기본 노드 처리
          result = this.executeDefaultNode(node.data, inputs, parameters)
        }
      }

      // 실행 결과 저장
      this.context.results[nodeId] = {
        success: true,
        data: result,
      }

      // 노드 상태 업데이트
      this.nodeStates.set(nodeId, "completed")
      this.logExecution(nodeId, "success", `노드 ${node.data.label} 실행 완료`)
    } catch (error: any) {
      // 오류 처리
      this.context.results[nodeId] = {
        success: false,
        error: error.message,
      }

      // 노드 상태 업데이트
      this.nodeStates.set(nodeId, "failed")
      this.logExecution(nodeId, "error", `노드 ${node.data.label} 실행 오류: ${error.message}`)
    }
  }

  // 입력 노드 실행
  private executeInputNode(nodeData: any): Record<string, any> {
    const { parameters } = nodeData

    if (parameters.inputType === "text") {
      return { text: parameters.inputValue || "" }
    } else if (parameters.inputType === "json") {
      try {
        const jsonData = JSON.parse(parameters.inputValue || "{}")
        return { data: jsonData }
      } catch (error) {
        throw new Error("JSON 파싱 오류: 유효한 JSON이 아닙니다.")
      }
    } else if (parameters.inputType === "api") {
      // API 호출은 실제로는 fetch 등으로 구현
      return {
        response: {
          message: "API 호출 시뮬레이션",
          url: parameters.url,
        },
      }
    }

    return { text: parameters.inputValue || "" }
  }

  // 출력 노드 실행
  private executeOutputNode(inputs: Record<string, any>): Record<string, any> {
    return { output: inputs.text || inputs.data || "출력 없음" }
  }

  // 기본 노드 실행
  private executeDefaultNode(
    nodeData: any,
    inputs: Record<string, any>,
    parameters: Record<string, any>,
  ): Record<string, any> {
    // 노드 타입에 따라 다른 처리 로직 구현
    const { type } = nodeData

    if (type === "process") {
      if (parameters.processType === "transform") {
        // 변환 함수 실행
        try {
          const transformFunction = new Function("data", parameters.transformFunction || "return data")
          const result = transformFunction(inputs.data || inputs.text)
          return { output: result }
        } catch (error) {
          throw new Error(`변환 함수 실행 오류: ${error.message}`)
        }
      } else if (parameters.processType === "filter") {
        // 필터 함수 실행
        try {
          const filterFunction = new Function("item", parameters.filterCondition || "return true")
          const data = Array.isArray(inputs.data) ? inputs.data : [inputs.data]
          const filtered = data.filter((item) => filterFunction(item))
          return { filtered }
        } catch (error) {
          throw new Error(`필터 함수 실행 오류: ${error.message}`)
        }
      }
    } else if (type === "tool") {
      if (parameters.toolType === "search") {
        // 검색 도구 시뮬레이션
        return {
          results: [
            { title: "검색 결과 1", snippet: "이것은 첫 번째 검색 결과입니다." },
            { title: "검색 결과 2", snippet: "이것은 두 번째 검색 결과입니다." },
          ],
        }
      } else if (parameters.toolType === "code") {
        // 코드 실행 시뮬레이션
        return { result: "코드 실행 결과", logs: ["실행 로그 1", "실행 로그 2"] }
      }
    }

    // 기본 응답
    return { output: "기본 노드 실행 결과" }
  }

  // 실행 로그 가져오기
  getLogs(): AgentExecutionLog[] {
    return this.context.logs
  }

  // 노드 상태 가져오기
  getNodeState(nodeId: string): "idle" | "running" | "completed" | "failed" {
    return this.nodeStates.get(nodeId) || "idle"
  }

  // 모든 노드 상태 가져오기
  getAllNodeStates(): Record<string, "idle" | "running" | "completed" | "failed"> {
    const states: Record<string, "idle" | "running" | "completed" | "failed"> = {}
    this.nodeStates.forEach((state, nodeId) => {
      states[nodeId] = state
    })
    return states
  }

  // 실행 결과 가져오기
  getResults(): Record<string, AgentExecutionResult> {
    return this.context.results
  }
}

// 에이전트 실행 함수
export async function executeAgent(
  nodes: AgentNode[],
  edges: AgentEdge[],
  apiKey: string,
): Promise<Record<string, AgentExecutionResult>> {
  const executor = new AgentExecutor(nodes, edges, apiKey)
  return await executor.execute()
}
