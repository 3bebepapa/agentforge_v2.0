/**
 * Reflex 스타일 상태 관리 시스템
 * 백엔드와 프론트엔드 상태를 실시간으로 동기화
 */

// Declare Agent and Workflow interfaces or import them
type Agent = {}

type Workflow = {}

export interface AppState {
  // 에이전트 상태
  agents: Agent[]
  activeAgent: Agent | null

  // 워크플로우 상태
  workflows: Workflow[]
  activeWorkflow: Workflow | null

  // 실행 상태
  isExecuting: boolean
  executionResults: any[]

  // UI 상태
  sidebarOpen: boolean
  activeTab: string

  // 실시간 데이터
  liveMetrics: {
    activeUsers: number
    runningAgents: number
    completedTasks: number
  }
}

export class ReflexStyleStateManager {
  private state: AppState
  private subscribers: Set<(state: AppState) => void> = new Set()
  private websocket: WebSocket | null = null

  constructor(initialState: AppState) {
    this.state = initialState
    this.initWebSocket()
  }

  // 상태 구독
  subscribe(callback: (state: AppState) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // 상태 업데이트 (Reflex 스타일)
  setState(updates: Partial<AppState>) {
    this.state = { ...this.state, ...updates }
    this.notifySubscribers()
    this.syncToBackend(updates)
  }

  // 백엔드와 동기화
  private async syncToBackend(updates: Partial<AppState>) {
    try {
      await fetch("/api/state/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error("상태 동기화 실패:", error)
    }
  }

  // WebSocket 초기화 (실시간 업데이트)
  private initWebSocket() {
    this.websocket = new WebSocket("ws://localhost:3000/api/ws/state")

    this.websocket.onmessage = (event) => {
      const updates = JSON.parse(event.data)
      this.state = { ...this.state, ...updates }
      this.notifySubscribers()
    }
  }

  // 구독자들에게 알림
  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.state))
  }

  // 현재 상태 반환
  getState(): AppState {
    return this.state
  }
}
