import type { NextRequest } from "next/server"
import { WebSocketServer } from "ws"

/**
 * Reflex 스타일 실시간 상태 동기화 WebSocket
 */
class StateWebSocketManager {
  private wss: WebSocketServer | null = null
  private clients: Set<any> = new Set()

  initialize() {
    if (this.wss) return

    this.wss = new WebSocketServer({ port: 8080 })

    this.wss.on("connection", (ws) => {
      this.clients.add(ws)
      console.log("클라이언트 연결됨. 총 연결:", this.clients.size)

      ws.on("close", () => {
        this.clients.delete(ws)
        console.log("클라이언트 연결 해제됨. 총 연결:", this.clients.size)
      })

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(message, ws)
        } catch (error) {
          console.error("메시지 파싱 오류:", error)
        }
      })
    })
  }

  private handleMessage(message: any, sender: any) {
    switch (message.type) {
      case "STATE_UPDATE":
        this.broadcastStateUpdate(message.data, sender)
        break
      case "AGENT_STATUS_CHANGE":
        this.broadcastAgentStatusChange(message.data)
        break
      default:
        console.log("알 수 없는 메시지 타입:", message.type)
    }
  }

  // 상태 업데이트를 모든 클라이언트에게 브로드캐스트
  broadcastStateUpdate(stateUpdate: any, sender?: any) {
    const message = JSON.stringify({
      type: "STATE_SYNC",
      data: stateUpdate,
      timestamp: new Date().toISOString(),
    })

    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === 1) {
        client.send(message)
      }
    })
  }

  // 에이전트 상태 변경 브로드캐스트
  broadcastAgentStatusChange(agentData: any) {
    const message = JSON.stringify({
      type: "AGENT_STATUS_UPDATE",
      data: agentData,
      timestamp: new Date().toISOString(),
    })

    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message)
      }
    })
  }
}

const wsManager = new StateWebSocketManager()
wsManager.initialize()

export async function GET(request: NextRequest) {
  return new Response("WebSocket server running on port 8080", { status: 200 })
}
