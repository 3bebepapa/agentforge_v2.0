/**
 * 세션 관리를 위한 클래스
 * 사용자 세션을 관리하고 세션별 데이터 분리를 지원
 */
export class SessionManager {
  private static instance: SessionManager
  private sessionKey = "agentforge_current_session"
  private sessionsKey = "agentforge_sessions"

  private constructor() {
    this.initializeSession()
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private initializeSession() {
    // 현재 세션이 없으면 새 세션 생성
    if (!localStorage.getItem(this.sessionKey)) {
      this.createNewSession()
    }

    // 세션 목록이 없으면 초기화
    if (!localStorage.getItem(this.sessionsKey)) {
      localStorage.setItem(this.sessionsKey, JSON.stringify([]))
    }
  }

  /**
   * 새 세션을 생성하고 현재 세션으로 설정
   */
  public createNewSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // 세션 목록에 추가
    const sessions = this.getAllSessions()
    sessions.push({
      id: sessionId,
      name: `세션 ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    })

    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions))
    localStorage.setItem(this.sessionKey, sessionId)

    return sessionId
  }

  /**
   * 현재 세션 ID 반환
   */
  public getCurrentSessionId(): string {
    const sessionId = localStorage.getItem(this.sessionKey)
    if (!sessionId) {
      return this.createNewSession()
    }

    // 세션 접근 시간 업데이트
    this.updateSessionAccessTime(sessionId)
    return sessionId
  }

  /**
   * 세션 접근 시간 업데이트
   */
  private updateSessionAccessTime(sessionId: string) {
    const sessions = this.getAllSessions()
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

    if (sessionIndex >= 0) {
      sessions[sessionIndex].lastAccessedAt = new Date().toISOString()
      localStorage.setItem(this.sessionsKey, JSON.stringify(sessions))
    }
  }

  /**
   * 모든 세션 목록 반환
   */
  public getAllSessions(): any[] {
    const sessionsJson = localStorage.getItem(this.sessionsKey)
    return sessionsJson ? JSON.parse(sessionsJson) : []
  }

  /**
   * 특정 세션으로 전환
   */
  public switchSession(sessionId: string): boolean {
    const sessions = this.getAllSessions()
    const sessionExists = sessions.some((s) => s.id === sessionId)

    if (sessionExists) {
      localStorage.setItem(this.sessionKey, sessionId)
      this.updateSessionAccessTime(sessionId)
      return true
    }

    return false
  }

  /**
   * 세션 이름 변경
   */
  public renameSession(sessionId: string, newName: string): boolean {
    const sessions = this.getAllSessions()
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

    if (sessionIndex >= 0) {
      sessions[sessionIndex].name = newName
      localStorage.setItem(this.sessionsKey, JSON.stringify(sessions))
      return true
    }

    return false
  }

  /**
   * 세션 삭제
   * 현재 세션인 경우 다른 세션으로 전환
   */
  public deleteSession(sessionId: string): boolean {
    const sessions = this.getAllSessions()
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)

    if (filteredSessions.length === sessions.length) {
      return false // 세션을 찾지 못함
    }

    localStorage.setItem(this.sessionsKey, JSON.stringify(filteredSessions))

    // 현재 세션이 삭제된 경우 다른 세션으로 전환
    if (this.getCurrentSessionId() === sessionId) {
      if (filteredSessions.length > 0) {
        localStorage.setItem(this.sessionKey, filteredSessions[0].id)
      } else {
        this.createNewSession()
      }
    }

    return true
  }
}
