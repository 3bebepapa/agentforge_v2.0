/**
 * Reflex 스타일 실시간 WebSocket 서버
 * 모든 클라이언트 간 실시간 상태 동기화
 */

import type { NextRequest } from "next/server"
import { WebSocketServer, WebSocket } from "ws"

interface ClientConnection {
  id: string
  ws: WebSocket
  userId?: string
  sessionId: string
  connectedAt: Date
  lastActivity: Date
  subscriptions: Set<string>
}

interface RealtimeMessage {
  type: "STATE_SYNC" | "EVENT_BROADCAST" | "USER_JOIN" | "USER_LEAVE" | "HEARTBEAT" | "SUBSCRIBE" | "UNSUBSCRIBE"
  payload: any
  timestamp: string
  clientId?: string
  userId?: string
}

class ReflexRealtimeServer {
  private wss: WebSocketServer | null = null
  private clients: Map<string, ClientConnection> = new Map()
  private rooms: Map<string, Set<string>> = new Map() // roomId -> clientIds
  private userSessions: Map<string, Set<string>> = new Map() // userId -> clientIds

  initialize() {
    if (this.wss) return

    this.wss = new WebSocketServer({
      port: 8080,
      path: "/reflex-realtime",
    })

    this.wss.on("connection", (ws, request) => {
      const clientId = this.generateClientId()
      const sessionId = this.extractSessionId(request)

      const client: ClientConnection = {
        id: clientId,
        ws,
        sessionId,
        connectedAt: new Date(),
        lastActivity: new Date(),
        subscriptions: new Set(),
      }

      this.clients.set(clientId, client)
      console.log(`[REALTIME] 클라이언트 연결: ${clientId} (총 ${this.clients.size}개)`)

      // 연결 확인 메시지 전송
      this.sendToClient(clientId, {
        type: "USER_JOIN",
        payload: { clientId, sessionId },
        timestamp: new Date().toISOString(),
      })

      // 메시지 핸들러
      ws.on("message", (data) => {
        try {
          const message: RealtimeMessage = JSON.parse(data.toString())
          this.handleMessage(clientId, message)
        } catch (error) {
          console.error(`[REALTIME] 메시지 파싱 오류 (${clientId}):`, error)
        }
      })

      // 연결 해제 핸들러
      ws.on("close", () => {
        this.handleDisconnection(clientId)
      })

      // 오류 핸들러
      ws.on("error", (error) => {
        console.error(`[REALTIME] WebSocket 오류 (${clientId}):`, error)
        this.handleDisconnection(clientId)
      })

      // 하트비트 시작
      this.startHeartbeat(clientId)
    })

    // 정리 작업 스케줄러
    setInterval(() => {
      this.cleanupInactiveClients()
    }, 30000) // 30초마다

    console.log("[REALTIME] Reflex 실시간 서버 시작됨 (포트: 8080)")
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private extractSessionId(request: any): string {
    // URL 파라미터나 헤더에서 세션 ID 추출
    const url = new URL(request.url || "", "http://localhost")
    return url.searchParams.get("sessionId") || `session_${Date.now()}`
  }

  private handleMessage(clientId: string, message: RealtimeMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    client.lastActivity = new Date()

    switch (message.type) {
      case "STATE_SYNC":
        this.handleStateSync(clientId, message)
        break

      case "EVENT_BROADCAST":
        this.handleEventBroadcast(clientId, message)
        break

      case "SUBSCRIBE":
        this.handleSubscribe(clientId, message)
        break

      case "UNSUBSCRIBE":
        this.handleUnsubscribe(clientId, message)
        break

      case "HEARTBEAT":
        this.handleHeartbeat(clientId, message)
        break

      default:
        console.warn(`[REALTIME] 알 수 없는 메시지 타입: ${message.type}`)
    }
  }

  private handleStateSync(clientId: string, message: RealtimeMessage) {
    // 상태 변경을 다른 클라이언트들에게 브로드캐스트
    const { stateUpdates, targetUsers, excludeSelf = true } = message.payload

    const broadcastMessage: RealtimeMessage = {
      type: "STATE_SYNC",
      payload: stateUpdates,
      timestamp: new Date().toISOString(),
      clientId,
    }

    if (targetUsers && targetUsers.length > 0) {
      // 특정 사용자들에게만 전송
      targetUsers.forEach((userId: string) => {
        this.broadcastToUser(userId, broadcastMessage, excludeSelf ? clientId : undefined)
      })
    } else {
      // 모든 클라이언트에게 브로드캐스트
      this.broadcastToAll(broadcastMessage, excludeSelf ? clientId : undefined)
    }
  }

  private handleEventBroadcast(clientId: string, message: RealtimeMessage) {
    // 이벤트를 구독자들에게 브로드캐스트
    const { eventType, eventPayload, room } = message.payload

    const broadcastMessage: RealtimeMessage = {
      type: "EVENT_BROADCAST",
      payload: {
        eventType,
        eventPayload,
        sourceClientId: clientId,
      },
      timestamp: new Date().toISOString(),
      clientId,
    }

    if (room) {
      this.broadcastToRoom(room, broadcastMessage, clientId)
    } else {
      this.broadcastToAll(broadcastMessage, clientId)
    }
  }

  private handleSubscribe(clientId: string, message: RealtimeMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    const { subscriptions, userId, rooms } = message.payload

    // 사용자 ID 설정
    if (userId) {
      client.userId = userId
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set())
      }
      this.userSessions.get(userId)!.add(clientId)
    }

    // 구독 추가
    if (subscriptions) {
      subscriptions.forEach((sub: string) => {
        client.subscriptions.add(sub)
      })
    }

    // 룸 참여
    if (rooms) {
      rooms.forEach((roomId: string) => {
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, new Set())
        }
        this.rooms.get(roomId)!.add(clientId)
      })
    }

    console.log(`[REALTIME] 클라이언트 구독 업데이트: ${clientId}`)
  }

  private handleUnsubscribe(clientId: string, message: RealtimeMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    const { subscriptions, rooms } = message.payload

    // 구독 제거
    if (subscriptions) {
      subscriptions.forEach((sub: string) => {
        client.subscriptions.delete(sub)
      })
    }

    // 룸 떠나기
    if (rooms) {
      rooms.forEach((roomId: string) => {
        const room = this.rooms.get(roomId)
        if (room) {
          room.delete(clientId)
          if (room.size === 0) {
            this.rooms.delete(roomId)
          }
        }
      })
    }
  }

  private handleHeartbeat(clientId: string, message: RealtimeMessage) {
    const client = this.clients.get(clientId)
    if (!client) return

    client.lastActivity = new Date()

    // 하트비트 응답
    this.sendToClient(clientId, {
      type: "HEARTBEAT",
      payload: { status: "alive" },
      timestamp: new Date().toISOString(),
    })
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId)
    if (!client) return

    // 사용자 세션에서 제거
    if (client.userId) {
      const userClients = this.userSessions.get(client.userId)
      if (userClients) {
        userClients.delete(clientId)
        if (userClients.size === 0) {
          this.userSessions.delete(client.userId)
        }
      }
    }

    // 모든 룸에서 제거
    this.rooms.forEach((room, roomId) => {
      room.delete(clientId)
      if (room.size === 0) {
        this.rooms.delete(roomId)
      }
    })

    // 클라이언트 제거
    this.clients.delete(clientId)

    console.log(`[REALTIME] 클라이언트 연결 해제: ${clientId} (총 ${this.clients.size}개)`)

    // 다른 클라이언트들에게 알림
    this.broadcastToAll(
      {
        type: "USER_LEAVE",
        payload: { clientId, userId: client.userId },
        timestamp: new Date().toISOString(),
      },
      clientId,
    )
  }

  private sendToClient(clientId: string, message: RealtimeMessage) {
    const client = this.clients.get(clientId)
    if (!client || client.ws.readyState !== WebSocket.OPEN) return

    try {
      client.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error(`[REALTIME] 메시지 전송 실패 (${clientId}):`, error)
      this.handleDisconnection(clientId)
    }
  }

  private broadcastToAll(message: RealtimeMessage, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    })
  }

  private broadcastToUser(userId: string, message: RealtimeMessage, excludeClientId?: string) {
    const userClients = this.userSessions.get(userId)
    if (!userClients) return

    userClients.forEach((clientId) => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    })
  }

  private broadcastToRoom(roomId: string, message: RealtimeMessage, excludeClientId?: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.forEach((clientId) => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    })
  }

  private startHeartbeat(clientId: string) {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId)
      if (!client || client.ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval)
        return
      }

      this.sendToClient(clientId, {
        type: "HEARTBEAT",
        payload: { ping: true },
        timestamp: new Date().toISOString(),
      })
    }, 30000) // 30초마다
  }

  private cleanupInactiveClients() {
    const now = new Date()
    const timeout = 5 * 60 * 1000 // 5분

    this.clients.forEach((client, clientId) => {
      if (now.getTime() - client.lastActivity.getTime() > timeout) {
        console.log(`[REALTIME] 비활성 클라이언트 정리: ${clientId}`)
        this.handleDisconnection(clientId)
      }
    })
  }

  // 서버 통계
  getStats() {
    return {
      totalClients: this.clients.size,
      totalUsers: this.userSessions.size,
      totalRooms: this.rooms.size,
      clientsPerUser: Array.from(this.userSessions.entries()).map(([userId, clients]) => ({
        userId,
        clientCount: clients.size,
      })),
      roomSizes: Array.from(this.rooms.entries()).map(([roomId, clients]) => ({
        roomId,
        clientCount: clients.size,
      })),
    }
  }
}

// 전역 실시간 서버 인스턴스
let realtimeServer: ReflexRealtimeServer | null = null

export function getRealtimeServer(): ReflexRealtimeServer {
  if (!realtimeServer) {
    realtimeServer = new ReflexRealtimeServer()
    realtimeServer.initialize()
  }
  return realtimeServer
}

// API 라우트 핸들러
export async function GET(request: NextRequest) {
  const server = getRealtimeServer()
  const stats = server.getStats()

  return new Response(
    JSON.stringify({
      status: "running",
      stats,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  )
}
