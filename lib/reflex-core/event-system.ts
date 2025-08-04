/**
 * Reflex 스타일 이벤트 처리 시스템
 * 모든 사용자 상호작용과 시스템 이벤트를 통합 관리
 */

import { getGlobalStateManager, type StateEvent } from "./state-system"

// 이벤트 핸들러 타입
export type EventHandler<T = any> = (payload: T, context: EventContext) => Promise<void> | void

// 이벤트 컨텍스트
export interface EventContext {
  userId?: string
  sessionId: string
  timestamp: string
  source: "user" | "system" | "api"
  metadata?: Record<string, any>
}

// 이벤트 정의
export interface AppEvent {
  // 사용자 이벤트
  "user.login": { apiKey: string }
  "user.logout": {}
  "user.preferences.update": { preferences: any }

  // 에이전트 이벤트
  "agent.create": { name: string; type: string; config: any }
  "agent.update": { id: string; updates: any }
  "agent.delete": { id: string }
  "agent.execute": { id: string; input: any }
  "agent.stop": { id: string }

  // 워크플로우 이벤트
  "workflow.create": { name: string; description: string }
  "workflow.update": { id: string; updates: any }
  "workflow.delete": { id: string }
  "workflow.execute": { id: string; input: any }
  "workflow.node.add": { workflowId: string; node: any }
  "workflow.node.update": { workflowId: string; nodeId: string; updates: any }
  "workflow.node.delete": { workflowId: string; nodeId: string }
  "workflow.edge.add": { workflowId: string; edge: any }
  "workflow.edge.delete": { workflowId: string; edgeId: string }

  // 코드 빌더 이벤트
  "code.project.create": { name: string; description: string }
  "code.project.delete": { id: string }
  "code.file.create": { projectId: string; name: string; content: string }
  "code.file.update": { projectId: string; fileId: string; content: string }
  "code.file.delete": { projectId: string; fileId: string }
  "code.generate": { prompt: string; projectId: string; fileId?: string }
  "code.execute": { projectId: string; fileId: string }

  // API 플랫폼 이벤트
  "api.endpoint.test": { endpointId: string; parameters: any }
  "api.key.validate": { apiKey: string }
  "api.usage.track": { endpointId: string; userId: string }

  // 시스템 이벤트
  "system.metrics.update": { metrics: any }
  "system.error": { error: string; context: any }
  "system.notification.show": { type: string; message: string }
  "system.notification.dismiss": { id: string }

  // UI 이벤트
  "ui.modal.open": { modalId: string; props?: any }
  "ui.modal.close": { modalId: string }
  "ui.sidebar.toggle": {}
  "ui.tab.change": { tabId: string }
  "ui.theme.change": { theme: "light" | "dark" }
}

// 이벤트 시스템 클래스
export class ReflexEventSystem {
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private stateManager = getGlobalStateManager()
  private eventHistory: Array<{ event: string; payload: any; context: EventContext }> = []

  // 이벤트 핸들러 등록
  on<K extends keyof AppEvent>(eventName: K, handler: EventHandler<AppEvent[K]>): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }

    this.handlers.get(eventName)!.add(handler)

    // 구독 해제 함수 반환
    return () => {
      const eventHandlers = this.handlers.get(eventName)
      if (eventHandlers) {
        eventHandlers.delete(handler)
        if (eventHandlers.size === 0) {
          this.handlers.delete(eventName)
        }
      }
    }
  }

  // 이벤트 발생
  async emit<K extends keyof AppEvent>(
    eventName: K,
    payload: AppEvent[K],
    context?: Partial<EventContext>,
  ): Promise<void> {
    const eventContext: EventContext = {
      sessionId: this.stateManager.getState().user.session.id,
      timestamp: new Date().toISOString(),
      source: "user",
      ...context,
    }

    // 이벤트 히스토리에 추가
    this.eventHistory.push({
      event: eventName,
      payload,
      context: eventContext,
    })

    // 상태 업데이트 이벤트 생성
    const stateEvent = this.mapToStateEvent(eventName, payload)
    if (stateEvent) {
      this.stateManager.dispatch(stateEvent)
    }

    // 등록된 핸들러들 실행
    const handlers = this.handlers.get(eventName)
    if (handlers) {
      const promises = Array.from(handlers).map((handler) => Promise.resolve(handler(payload, eventContext)))
      await Promise.all(promises)
    }
  }

  // 이벤트를 상태 이벤트로 매핑
  private mapToStateEvent(eventName: string, payload: any): StateEvent | null {
    switch (eventName) {
      case "user.login":
        return { type: "USER_LOGIN", payload }

      case "agent.create":
        return {
          type: "AGENT_CREATE",
          payload: {
            agent: {
              id: `agent_${Date.now()}`,
              name: payload.name,
              type: payload.type,
              description: payload.config?.description || "",
              status: "idle" as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }

      case "agent.execute":
        return { type: "AGENT_EXECUTE", payload: { agentId: payload.id } }

      case "workflow.update":
        return { type: "WORKFLOW_UPDATE", payload: { workflow: payload } }

      case "code.generate":
        return { type: "CODE_GENERATE", payload }

      case "system.metrics.update":
        return { type: "METRICS_UPDATE", payload: payload.metrics }

      case "ui.modal.open":
        return {
          type: "UI_SET_LOADING",
          payload: { key: `modal_${payload.modalId}`, loading: true },
        }

      default:
        return null
    }
  }

  // 이벤트 히스토리 조회
  getEventHistory(limit?: number): Array<{ event: string; payload: any; context: EventContext }> {
    return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory]
  }

  // 특정 이벤트 타입의 히스토리 조회
  getEventHistoryByType(eventType: string): Array<{ event: string; payload: any; context: EventContext }> {
    return this.eventHistory.filter((item) => item.event === eventType)
  }
}

// 전역 이벤트 시스템 인스턴스
let globalEventSystem: ReflexEventSystem | null = null

export function getGlobalEventSystem(): ReflexEventSystem {
  if (!globalEventSystem) {
    globalEventSystem = new ReflexEventSystem()
  }
  return globalEventSystem
}

// 이벤트 핸들러 데코레이터
export function EventHandler<K extends keyof AppEvent>(eventName: K) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const eventSystem = getGlobalEventSystem()
      eventSystem.on(eventName, originalMethod.bind(this))
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 사전 정의된 이벤트 핸들러들
export class DefaultEventHandlers {
  private eventSystem = getGlobalEventSystem()

  constructor() {
    this.registerDefaultHandlers()
  }

  private registerDefaultHandlers() {
    // 에이전트 생성 후 처리
    this.eventSystem.on("agent.create", async (payload, context) => {
      console.log(`에이전트 생성됨: ${payload.name}`)

      // 알림 표시
      await this.eventSystem.emit("system.notification.show", {
        type: "success",
        message: `에이전트 "${payload.name}"이 생성되었습니다.`,
      })
    })

    // 에이전트 실행 시작
    this.eventSystem.on("agent.execute", async (payload, context) => {
      console.log(`에이전트 실행 시작: ${payload.id}`)

      // 로딩 상태 설정
      await this.eventSystem.emit("ui.modal.open", {
        modalId: "agent-execution",
        props: { agentId: payload.id },
      })
    })

    // 워크플로우 노드 추가
    this.eventSystem.on("workflow.node.add", async (payload, context) => {
      console.log(`워크플로우 노드 추가: ${payload.node.type}`)

      // 워크플로우 업데이트 이벤트 발생
      const state = getGlobalStateManager().getState()
      const workflow = state.workflows.list.find((w) => w.id === payload.workflowId)

      if (workflow) {
        const updatedWorkflow = {
          ...workflow,
          nodes: [...workflow.nodes, payload.node],
          updatedAt: new Date().toISOString(),
        }

        await this.eventSystem.emit("workflow.update", {
          id: workflow.id,
          updates: updatedWorkflow,
        })
      }
    })

    // 코드 생성 완료
    this.eventSystem.on("code.generate", async (payload, context) => {
      console.log(`코드 생성 요청: ${payload.prompt}`)

      try {
        // 실제 코드 생성 로직 (AI 서비스 호출)
        const response = await fetch("/api/ai/generate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: payload.prompt,
            projectId: payload.projectId,
            fileId: payload.fileId,
          }),
        })

        const result = await response.json()

        if (result.success) {
          await this.eventSystem.emit("system.notification.show", {
            type: "success",
            message: "코드가 성공적으로 생성되었습니다.",
          })
        }
      } catch (error) {
        await this.eventSystem.emit("system.error", {
          error: "코드 생성 실패",
          context: { payload, error },
        })
      }
    })

    // 시스템 오류 처리
    this.eventSystem.on("system.error", async (payload, context) => {
      console.error("시스템 오류:", payload.error, payload.context)

      await this.eventSystem.emit("system.notification.show", {
        type: "error",
        message: payload.error,
      })
    })

    // 메트릭 업데이트
    this.eventSystem.on("system.metrics.update", async (payload, context) => {
      // 메트릭 데이터를 서버에 전송
      try {
        await fetch("/api/metrics/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: payload.metrics,
            timestamp: context.timestamp,
          }),
        })
      } catch (error) {
        console.error("메트릭 업데이트 실패:", error)
      }
    })
  }
}

// 기본 이벤트 핸들러 초기화
export function initializeDefaultEventHandlers() {
  new DefaultEventHandlers()
}
