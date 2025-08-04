/**
 * Reflex 스타일 상태 관리 시스템 - 전체 구현
 * 현재 시스템의 모든 상태를 통합 관리
 */

// 전체 애플리케이션 상태 인터페이스
export interface GlobalAppState {
  // 사용자 관련 상태
  user: {
    id: string | null
    apiKey: string | null
    preferences: {
      theme: "light" | "dark"
      language: "ko" | "en"
      autoSave: boolean
    }
    session: {
      id: string
      startTime: string
      lastActivity: string
    }
  }

  // 에이전트 관련 상태
  agents: {
    list: Agent[]
    active: Agent | null
    creating: boolean
    executing: Record<string, boolean>
    templates: AgentTemplate[]
    tools: AgentTool[]
  }

  // 워크플로우 관련 상태
  workflows: {
    list: Workflow[]
    active: Workflow | null
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
    executing: boolean
    executionHistory: ExecutionResult[]
  }

  // 코드 빌더 상태
  codeBuilder: {
    projects: CodeProject[]
    activeProject: CodeProject | null
    files: CodeFile[]
    activeFile: CodeFile | null
    isGenerating: boolean
    generationHistory: GenerationResult[]
  }

  // 통합 스튜디오 상태
  unifiedStudio: {
    activeTab: "agents" | "workflows" | "code" | "api"
    sidebarOpen: boolean
    panelSizes: Record<string, number>
    recentActions: StudioAction[]
  }

  // API 플랫폼 상태
  apiPlatform: {
    endpoints: APIEndpoint[]
    activeEndpoint: APIEndpoint | null
    testResults: APITestResult[]
    usage: APIUsageStats
  }

  // 실시간 메트릭
  metrics: {
    activeUsers: number
    runningAgents: number
    completedTasks: number
    systemLoad: number
    errorRate: number
    responseTime: number
  }

  // UI 상태
  ui: {
    loading: Record<string, boolean>
    errors: Record<string, string>
    notifications: Notification[]
    modals: Record<string, boolean>
  }
}

// 상태 변경 이벤트 타입
export type StateEvent =
  | { type: "USER_LOGIN"; payload: { apiKey: string } }
  | { type: "AGENT_CREATE"; payload: { agent: Agent } }
  | { type: "AGENT_EXECUTE"; payload: { agentId: string } }
  | { type: "WORKFLOW_UPDATE"; payload: { workflow: Workflow } }
  | { type: "CODE_GENERATE"; payload: { prompt: string; projectId: string } }
  | { type: "METRICS_UPDATE"; payload: Partial<GlobalAppState["metrics"]> }
  | { type: "UI_SET_LOADING"; payload: { key: string; loading: boolean } }
  | { type: "UI_SET_ERROR"; payload: { key: string; error: string } }

// Reflex 스타일 상태 관리자
export class ReflexStateManager {
  private state: GlobalAppState
  private subscribers: Map<string, Set<(state: GlobalAppState) => void>> = new Map()
  private middleware: StateMiddleware[] = []
  private eventQueue: StateEvent[] = []
  private isProcessing = false

  constructor(initialState: GlobalAppState) {
    this.state = initialState
    this.initializeMiddleware()
    this.startEventProcessing()
  }

  // 미들웨어 초기화
  private initializeMiddleware() {
    this.middleware = [
      new LoggingMiddleware(),
      new PersistenceMiddleware(),
      new ValidationMiddleware(),
      new MetricsMiddleware(),
      new WebSocketMiddleware(),
    ]
  }

  // 상태 구독 (컴포넌트별)
  subscribe(componentId: string, callback: (state: GlobalAppState) => void) {
    if (!this.subscribers.has(componentId)) {
      this.subscribers.set(componentId, new Set())
    }
    this.subscribers.get(componentId)!.add(callback)

    return () => {
      const componentSubscribers = this.subscribers.get(componentId)
      if (componentSubscribers) {
        componentSubscribers.delete(callback)
        if (componentSubscribers.size === 0) {
          this.subscribers.delete(componentId)
        }
      }
    }
  }

  // 이벤트 디스패치
  dispatch(event: StateEvent) {
    this.eventQueue.push(event)
    this.processEventQueue()
  }

  // 이벤트 큐 처리
  private async processEventQueue() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!
      await this.processEvent(event)
    }

    this.isProcessing = false
  }

  // 개별 이벤트 처리
  private async processEvent(event: StateEvent) {
    // 미들웨어 전처리
    for (const middleware of this.middleware) {
      event = await middleware.preProcess(event, this.state)
    }

    // 상태 업데이트
    const newState = this.reduceState(this.state, event)

    // 미들웨어 후처리
    for (const middleware of this.middleware) {
      await middleware.postProcess(event, this.state, newState)
    }

    this.state = newState
    this.notifySubscribers()
  }

  // 상태 리듀서
  private reduceState(state: GlobalAppState, event: StateEvent): GlobalAppState {
    switch (event.type) {
      case "USER_LOGIN":
        return {
          ...state,
          user: {
            ...state.user,
            apiKey: event.payload.apiKey,
            session: {
              ...state.user.session,
              startTime: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
            },
          },
        }

      case "AGENT_CREATE":
        return {
          ...state,
          agents: {
            ...state.agents,
            list: [...state.agents.list, event.payload.agent],
            creating: false,
          },
          metrics: {
            ...state.metrics,
            runningAgents: state.metrics.runningAgents + 1,
          },
        }

      case "AGENT_EXECUTE":
        return {
          ...state,
          agents: {
            ...state.agents,
            executing: {
              ...state.agents.executing,
              [event.payload.agentId]: true,
            },
          },
        }

      case "WORKFLOW_UPDATE":
        return {
          ...state,
          workflows: {
            ...state.workflows,
            list: state.workflows.list.map((w) => (w.id === event.payload.workflow.id ? event.payload.workflow : w)),
            active:
              state.workflows.active?.id === event.payload.workflow.id
                ? event.payload.workflow
                : state.workflows.active,
          },
        }

      case "CODE_GENERATE":
        return {
          ...state,
          codeBuilder: {
            ...state.codeBuilder,
            isGenerating: true,
          },
          ui: {
            ...state.ui,
            loading: {
              ...state.ui.loading,
              codeGeneration: true,
            },
          },
        }

      case "METRICS_UPDATE":
        return {
          ...state,
          metrics: {
            ...state.metrics,
            ...event.payload,
          },
        }

      case "UI_SET_LOADING":
        return {
          ...state,
          ui: {
            ...state.ui,
            loading: {
              ...state.ui.loading,
              [event.payload.key]: event.payload.loading,
            },
          },
        }

      case "UI_SET_ERROR":
        return {
          ...state,
          ui: {
            ...state.ui,
            errors: {
              ...state.ui.errors,
              [event.payload.key]: event.payload.error,
            },
          },
        }

      default:
        return state
    }
  }

  // 구독자들에게 알림
  private notifySubscribers() {
    this.subscribers.forEach((componentSubscribers) => {
      componentSubscribers.forEach((callback) => {
        callback(this.state)
      })
    })
  }

  // 현재 상태 반환
  getState(): GlobalAppState {
    return this.state
  }

  // 상태 선택자
  select<T>(selector: (state: GlobalAppState) => T): T {
    return selector(this.state)
  }
}

// 미들웨어 인터페이스
interface StateMiddleware {
  preProcess(event: StateEvent, state: GlobalAppState): Promise<StateEvent>
  postProcess(event: StateEvent, oldState: GlobalAppState, newState: GlobalAppState): Promise<void>
}

// 로깅 미들웨어
class LoggingMiddleware implements StateMiddleware {
  async preProcess(event: StateEvent, state: GlobalAppState): Promise<StateEvent> {
    console.log(`[STATE] Processing event: ${event.type}`, event.payload)
    return event
  }

  async postProcess(event: StateEvent, oldState: GlobalAppState, newState: GlobalAppState): Promise<void> {
    console.log(`[STATE] Event processed: ${event.type}`)
  }
}

// 영속성 미들웨어
class PersistenceMiddleware implements StateMiddleware {
  async preProcess(event: StateEvent, state: GlobalAppState): Promise<StateEvent> {
    return event
  }

  async postProcess(event: StateEvent, oldState: GlobalAppState, newState: GlobalAppState): Promise<void> {
    // 중요한 상태 변경사항을 localStorage에 저장
    const persistentData = {
      user: newState.user,
      agents: newState.agents.list,
      workflows: newState.workflows.list,
      codeBuilder: {
        projects: newState.codeBuilder.projects,
      },
    }

    localStorage.setItem("aiworks_state", JSON.stringify(persistentData))
  }
}

// 검증 미들웨어
class ValidationMiddleware implements StateMiddleware {
  async preProcess(event: StateEvent, state: GlobalAppState): Promise<StateEvent> {
    // 이벤트 유효성 검사
    switch (event.type) {
      case "AGENT_CREATE":
        if (!event.payload.agent.name || !event.payload.agent.type) {
          throw new Error("에이전트 생성에 필요한 정보가 부족합니다")
        }
        break
      case "USER_LOGIN":
        if (!event.payload.apiKey || !event.payload.apiKey.startsWith("AIza")) {
          throw new Error("유효하지 않은 API 키입니다")
        }
        break
    }
    return event
  }

  async postProcess(): Promise<void> {
    // 후처리 검증 로직
  }
}

// 메트릭 미들웨어
class MetricsMiddleware implements StateMiddleware {
  async preProcess(event: StateEvent, state: GlobalAppState): Promise<StateEvent> {
    return event
  }

  async postProcess(event: StateEvent, oldState: GlobalAppState, newState: GlobalAppState): Promise<void> {
    // 메트릭 업데이트
    await fetch("/api/metrics/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: event.type,
        metrics: newState.metrics,
        timestamp: new Date().toISOString(),
      }),
    })
  }
}

// WebSocket 미들웨어
class WebSocketMiddleware implements StateMiddleware {
  private ws: WebSocket | null = null

  constructor() {
    this.initWebSocket()
  }

  private initWebSocket() {
    try {
      this.ws = new WebSocket("ws://localhost:8080/state")
      this.ws.onopen = () => console.log("[WS] 상태 동기화 연결됨")
      this.ws.onclose = () => console.log("[WS] 상태 동기화 연결 해제됨")
    } catch (error) {
      console.error("[WS] WebSocket 연결 실패:", error)
    }
  }

  async preProcess(event: StateEvent, state: GlobalAppState): Promise<StateEvent> {
    return event
  }

  async postProcess(event: StateEvent, oldState: GlobalAppState, newState: GlobalAppState): Promise<void> {
    // 상태 변경을 다른 클라이언트들에게 브로드캐스트
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "STATE_SYNC",
          event: event.type,
          payload: event.payload,
          timestamp: new Date().toISOString(),
        }),
      )
    }
  }
}

// 타입 정의들
interface Agent {
  id: string
  name: string
  type: string
  description: string
  status: "idle" | "running" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}

interface AgentTemplate {
  id: string
  name: string
  description: string
  config: Record<string, any>
}

interface AgentTool {
  id: string
  name: string
  type: string
  config: Record<string, any>
}

interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  status: "draft" | "active" | "paused"
  createdAt: string
  updatedAt: string
}

interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, any>
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

interface ExecutionResult {
  id: string
  workflowId: string
  status: "success" | "failed" | "running"
  result: any
  error?: string
  startTime: string
  endTime?: string
}

interface CodeProject {
  id: string
  name: string
  description: string
  files: CodeFile[]
  createdAt: string
  updatedAt: string
}

interface CodeFile {
  id: string
  name: string
  path: string
  content: string
  language: string
}

interface GenerationResult {
  id: string
  prompt: string
  result: string
  timestamp: string
}

interface StudioAction {
  id: string
  type: string
  description: string
  timestamp: string
}

interface APIEndpoint {
  id: string
  path: string
  method: string
  description: string
  parameters: any[]
}

interface APITestResult {
  id: string
  endpointId: string
  status: number
  response: any
  timestamp: string
}

interface APIUsageStats {
  totalRequests: number
  successRate: number
  averageResponseTime: number
}

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
}

// 전역 상태 관리자 인스턴스
let globalStateManager: ReflexStateManager | null = null

export function getGlobalStateManager(): ReflexStateManager {
  if (!globalStateManager) {
    const initialState: GlobalAppState = {
      user: {
        id: null,
        apiKey: null,
        preferences: {
          theme: "light",
          language: "ko",
          autoSave: true,
        },
        session: {
          id: `session_${Date.now()}`,
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        },
      },
      agents: {
        list: [],
        active: null,
        creating: false,
        executing: {},
        templates: [],
        tools: [],
      },
      workflows: {
        list: [],
        active: null,
        nodes: [],
        edges: [],
        executing: false,
        executionHistory: [],
      },
      codeBuilder: {
        projects: [],
        activeProject: null,
        files: [],
        activeFile: null,
        isGenerating: false,
        generationHistory: [],
      },
      unifiedStudio: {
        activeTab: "agents",
        sidebarOpen: true,
        panelSizes: {},
        recentActions: [],
      },
      apiPlatform: {
        endpoints: [],
        activeEndpoint: null,
        testResults: [],
        usage: {
          totalRequests: 0,
          successRate: 0,
          averageResponseTime: 0,
        },
      },
      metrics: {
        activeUsers: 0,
        runningAgents: 0,
        completedTasks: 0,
        systemLoad: 0,
        errorRate: 0,
        responseTime: 0,
      },
      ui: {
        loading: {},
        errors: {},
        notifications: [],
        modals: {},
      },
    }

    globalStateManager = new ReflexStateManager(initialState)
  }

  return globalStateManager
}
