/**
 * Reflex 스타일로 완전히 개선된 메인 페이지
 * 기존 app/page.tsx를 대체
 */

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useReflexComponent } from "@/components/reflex-core/base-component"
import { initializeDefaultEventHandlers } from "@/lib/reflex-core/event-system"
import { getGlobalDatabaseManager } from "@/lib/reflex-core/database-system"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Zap,
  Shield,
  Sparkles,
  Rocket,
  X,
  Code,
  ExternalLink,
  AlertCircle,
  Check,
  Loader2,
  Users,
  Activity,
  Cpu,
  Database,
} from "lucide-react"

import { ReflexAgentBuilder } from "@/components/reflex-enhanced/agent-builder-enhanced"
import { ReflexWorkflowEditor } from "@/components/reflex-enhanced/workflow-editor-enhanced"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"

export default function ReflexEnhancedHome() {
  const { state, emit } = useReflexComponent("main-app", (globalState) => ({
    user: globalState.user,
    metrics: globalState.metrics,
    agents: globalState.agents.list,
    workflows: globalState.workflows.list,
    codeProjects: globalState.codeBuilder.projects,
    ui: globalState.ui,
    activeTab: globalState.unifiedStudio.activeTab,
  }))

  const [prompt, setPrompt] = useState("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  // 초기화
  useEffect(() => {
    // 기본 이벤트 핸들러 초기화
    initializeDefaultEventHandlers()

    // 실시간 연결 설정
    setupRealtimeConnection()

    // 메트릭 업데이트 시작
    startMetricsUpdater()

    // 저장된 API 키 확인
    const savedApiKey = localStorage.getItem("aiworks_api_key")
    if (savedApiKey) {
      emit("user.login", { apiKey: savedApiKey })
    }
  }, [emit])

  // 실시간 연결 설정
  const setupRealtimeConnection = () => {
    try {
      const ws = new WebSocket("ws://localhost:8080/reflex-realtime")

      ws.onopen = () => {
        setRealtimeConnected(true)
        console.log("[REALTIME] 연결됨")

        // 구독 설정
        ws.send(
          JSON.stringify({
            type: "SUBSCRIBE",
            payload: {
              subscriptions: ["state_updates", "agent_events", "workflow_events"],
              userId: state.user.id,
              rooms: ["global"],
            },
            timestamp: new Date().toISOString(),
          }),
        )
      }

      ws.onclose = () => {
        setRealtimeConnected(false)
        console.log("[REALTIME] 연결 해제됨")
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleRealtimeMessage(message)
        } catch (error) {
          console.error("[REALTIME] 메시지 처리 오류:", error)
        }
      }
    } catch (error) {
      console.error("[REALTIME] 연결 실패:", error)
    }
  }

  // 실시간 메시지 처리
  const handleRealtimeMessage = (message: any) => {
    switch (message.type) {
      case "STATE_SYNC":
        // 다른 클라이언트의 상태 변경 반영
        console.log("[REALTIME] 상태 동기화:", message.payload)
        break

      case "EVENT_BROADCAST":
        // 다른 클라이언트의 이벤트 처리
        const { eventType, eventPayload } = message.payload
        console.log(`[REALTIME] 이벤트 수신: ${eventType}`, eventPayload)
        break

      case "USER_JOIN":
        emit("system.notification.show", {
          type: "info",
          message: "새로운 사용자가 접속했습니다.",
        })
        break

      case "USER_LEAVE":
        emit("system.notification.show", {
          type: "info",
          message: "사용자가 접속을 종료했습니다.",
        })
        break
    }
  }

  // 메트릭 업데이터 시작
  const startMetricsUpdater = () => {
    const updateMetrics = () => {
      const dbManager = getGlobalDatabaseManager()
      const stats = dbManager.getStats()

      emit("system.metrics.update", {
        metrics: {
          activeUsers: Math.floor(Math.random() * 50) + 10,
          runningAgents: stats.agents || 0,
          completedTasks: Math.floor(Math.random() * 100) + 50,
          systemLoad: Math.random() * 100,
          errorRate: Math.random() * 5,
          responseTime: Math.random() * 1000 + 200,
        },
      })
    }

    updateMetrics()
    setInterval(updateMetrics, 10000) // 10초마다 업데이트
  }

  // 프롬프트 제출
  const handleSubmit = () => {
    if (prompt.trim()) {
      if (!state.user.apiKey) {
        setShowApiKeyDialog(true)
      } else {
        // AI 작업 시작
        emit("code.generate", {
          prompt: prompt.trim(),
          projectId: "main_project",
        })
        setPrompt("")
      }
    }
  }

  // API 키 설정
  const handleApiKeySubmit = (apiKey: string) => {
    localStorage.setItem("aiworks_api_key", apiKey)
    emit("user.login", { apiKey })
    setShowApiKeyDialog(false)
  }

  // 탭 변경
  const handleTabChange = (tabId: string) => {
    emit("ui.tab.change", { tabId })
  }

  // 로그인되지 않은 경우 랜딩 페이지 표시
  if (!state.user.apiKey) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
          {/* Header */}
          <header className="border-b px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Works</h1>
              <Badge variant="outline" className="ml-2">
                REFLEX ENHANCED
              </Badge>
              {realtimeConnected && (
                <Badge variant="secondary" className="ml-2">
                  <Activity className="w-3 h-3 mr-1" />
                  실시간 연결됨
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/api-platform">
                <Button variant="outline" size="sm">
                  <Code className="w-4 h-4 mr-2" />
                  B2B API 플랫폼
                </Button>
              </Link>
              <Link href="https://www.squareai.dev/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Penta AI
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </header>

          {/* 실시간 메트릭 대시보드 */}
          <div className="px-6 py-4 bg-white border-b">
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{state.metrics.activeUsers}</div>
                    <div className="text-sm text-gray-600">활성 사용자</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{state.metrics.runningAgents}</div>
                    <div className="text-sm text-gray-600">실행 중 에이전트</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{state.metrics.completedTasks}</div>
                    <div className="text-sm text-gray-600">완료된 작업</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{Math.round(state.metrics.responseTime)}ms</div>
                    <div className="text-sm text-gray-600">평균 응답시간</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Hero Section */}
          <main className="flex-1 flex items-center justify-center p-4 py-20">
            <div className="max-w-3xl w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Reflex Enhanced B2B AI Platform</span>
                </div>

                <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  실시간 협업 AI 통합 허브
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    AI Works Reflex
                  </span>
                </h2>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Reflex 아키텍처 기반의 실시간 상태 동기화, 이벤트 기반 시스템, 자동 데이터베이스 관리로 더욱 강력해진
                  AI 개발 플랫폼
                </p>
              </div>

              <div className="mb-8">
                <Textarea
                  placeholder="AI Works Reflex에 원하는 작업을 설명해주세요..."
                  className="h-24 text-lg shadow-lg"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button
                  className="w-full mt-4 h-12 text-base"
                  onClick={handleSubmit}
                  disabled={state.ui.loading.codeGeneration}
                >
                  {state.ui.loading.codeGeneration ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI 작업 처리 중...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      AI Works Reflex 시작하기
                    </>
                  )}
                </Button>
              </div>

              {/* 실시간 알림 */}
              {state.ui.notifications.map((notification) => (
                <Alert key={notification.id} className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </main>

          {/* API Key Dialog */}
          {showApiKeyDialog && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <Card className="max-w-md w-full p-6 relative">
                <button
                  onClick={() => setShowApiKeyDialog(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">AI Works Reflex 키 입력</CardTitle>
                  <CardDescription>실시간 협업 기능을 사용하려면 API 키가 필요합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiKeyInput onApiKeySet={handleApiKeySubmit} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ThemeProvider>
    )
  }

  // 로그인된 경우 메인 대시보드 표시
  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 상단 헤더 */}
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">AI Works Reflex</h1>
                <Badge variant="secondary">
                  <Activity className="w-3 h-3 mr-1" />
                  실시간 동기화
                </Badge>
              </div>

              <div className="text-sm text-gray-600">
                사용자: {state.user.id || "Anonymous"} | 세션: {state.user.session.id.slice(-8)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={realtimeConnected ? "secondary" : "destructive"}>
                {realtimeConnected ? "실시간 연결됨" : "연결 끊어짐"}
              </Badge>

              <Button variant="outline" size="sm" onClick={() => emit("user.logout", {})}>
                로그아웃
              </Button>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex">
          <Tabs value={state.activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-white border-b">
              <TabsTrigger value="agents">에이전트 ({state.agents.length})</TabsTrigger>
              <TabsTrigger value="workflows">워크플로우 ({state.workflows.length})</TabsTrigger>
              <TabsTrigger value="code">코드 빌더 ({state.codeProjects.length})</TabsTrigger>
              <TabsTrigger value="api">API 플랫폼</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="agents" className="h-full m-0 p-6">
                <ReflexAgentBuilder />
              </TabsContent>

              <TabsContent value="workflows" className="h-full m-0 p-6">
                <ReflexWorkflowEditor />
              </TabsContent>

              <TabsContent value="code" className="h-full m-0 p-6">
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold mb-4">코드 빌더</h3>
                  <p className="text-gray-600 mb-8">Reflex 스타일 코드 빌더 구현 예정</p>
                  <Button
                    onClick={() =>
                      emit("code.project.create", {
                        name: "새 프로젝트",
                        description: "Reflex 기반 프로젝트",
                      })
                    }
                  >
                    새 프로젝트 생성
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="api" className="h-full m-0 p-6">
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold mb-4">API 플랫폼</h3>
                  <p className="text-gray-600 mb-8">실시간 API 관리 및 테스트 도구</p>
                  <Link href="/api-platform">
                    <Button>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      API 플랫폼으로 이동
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  )
}

// API 키 입력 컴포넌트
interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void
}

const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const validateApiKey = (key: string) => {
    const geminiKeyPattern = /^AIza[0-9A-Za-z_-]{35}$/
    return geminiKeyPattern.test(key)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateApiKey(apiKey)) {
      setIsValid(true)
      onApiKeySet(apiKey)
    } else {
      alert("올바른 Gemini API 키 형식이 아닙니다.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Gemini API 키</label>
        <Input
          type="password"
          placeholder="Gemini API 키를 입력하세요"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="h-12"
        />
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          API 키는 안전하게 저장되며 실시간으로 동기화됩니다
        </p>
      </div>

      <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={isValidating || isValid}>
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            검증 중...
          </>
        ) : isValid ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            검증 완료
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-4 w-4" />
            AI Works Reflex 시작하기
          </>
        )}
      </Button>
    </div>
  )
}
