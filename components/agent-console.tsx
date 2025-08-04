"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Play, RotateCcw, Settings, Bot, Users, Wrench, Code, Loader2, CheckCircle, XCircle } from "lucide-react"

interface Agent {
  id: string
  name: string
  type: string
  description: string
  promptTemplate: string
  code: string
  tools: any[]
  isTeam?: boolean
  members?: any[]
  sharedTools?: any[]
  status: "active" | "inactive" | "running"
}

interface Message {
  id: string
  type: "user" | "agent" | "system" | "tool"
  content: string
  timestamp: Date
  agentName?: string
  toolName?: string
  status?: "success" | "error" | "pending"
}

interface AgentConsoleProps {
  agent: Agent
  apiKey: string
  onClose: () => void
}

export function AgentConsole({ agent, apiKey, onClose }: AgentConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("console")
  const [executionStats, setExecutionStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    executionTime: 0,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 초기 환영 메시지
    addMessage({
      type: "system",
      content: `${agent.name} 에이전트가 활성화되었습니다. 무엇을 도와드릴까요?`,
      agentName: agent.name,
    })
  }, [agent])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isRunning) return

    const userMessage = inputMessage.trim()
    setInputMessage("")

    // 사용자 메시지 추가
    addMessage({
      type: "user",
      content: userMessage,
    })

    setIsRunning(true)
    const startTime = Date.now()

    try {
      if (agent.isTeam) {
        await executeTeamAgent(userMessage)
      } else {
        await executeSingleAgent(userMessage)
      }
    } catch (error) {
      addMessage({
        type: "system",
        content: `오류가 발생했습니다: ${error.message}`,
        status: "error",
      })
      setExecutionStats((prev) => ({
        ...prev,
        failedTasks: prev.failedTasks + 1,
      }))
    } finally {
      setIsRunning(false)
      const executionTime = Date.now() - startTime
      setExecutionStats((prev) => ({
        ...prev,
        totalTasks: prev.totalTasks + 1,
        executionTime: executionTime,
      }))
    }
  }

  const executeSingleAgent = async (input: string) => {
    // 에이전트 처리 시작
    addMessage({
      type: "agent",
      content: `작업을 분석하고 있습니다...`,
      agentName: agent.name,
      status: "pending",
    })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 에이전트 응답 생성 - 개선된 버전
    const response = await generateAgentResponse(input, agent)
    addMessage({
      type: "agent",
      content: response,
      agentName: agent.name,
      status: "success",
    })

    // 툴 사용 시뮬레이션
    if (agent.tools && agent.tools.length > 0 && Math.random() > 0.3) {
      const randomTool = agent.tools[Math.floor(Math.random() * agent.tools.length)]
      await executeAgentTool(randomTool)
    }

    setExecutionStats((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks + 1,
    }))
  }

  const executeTeamAgent = async (input: string) => {
    // 팀 코디네이터 시작
    addMessage({
      type: "agent",
      content: `팀 코디네이터가 작업을 분석하고 팀원들에게 할당하고 있습니다...`,
      agentName: `${agent.name} (코디네이터)`,
      status: "pending",
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 팀원별 작업 실행
    if (agent.members && agent.members.length > 0) {
      for (const member of agent.members) {
        addMessage({
          type: "agent",
          content: `${member.role} 작업을 시작합니다: ${member.description}`,
          agentName: member.name,
          status: "pending",
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))

        // 팀원별 툴 사용
        if (member.tools && member.tools.length > 0) {
          const randomTool = member.tools[Math.floor(Math.random() * member.tools.length)]
          await executeAgentTool(randomTool, member.name)
        }

        const memberResponse = await generateMemberResponse(input, member)
        addMessage({
          type: "agent",
          content: memberResponse,
          agentName: member.name,
          status: "success",
        })
      }
    }

    // 최종 결과 통합
    addMessage({
      type: "agent",
      content: `팀 작업이 완료되었습니다. 모든 팀원의 결과를 통합하여 최종 결과물을 생성했습니다.`,
      agentName: `${agent.name} (코디네이터)`,
      status: "success",
    })

    setExecutionStats((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks + 1,
    }))
  }

  const executeAgentTool = async (tool: any, agentName?: string) => {
    addMessage({
      type: "tool",
      content: `${tool.name} 도구를 실행하고 있습니다...`,
      toolName: tool.name,
      agentName: agentName || agent.name,
      status: "pending",
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const success = Math.random() > 0.2 // 80% 성공률

    if (success) {
      addMessage({
        type: "tool",
        content: `${tool.name} 실행 완료: ${tool.description}`,
        toolName: tool.name,
        agentName: agentName || agent.name,
        status: "success",
      })
    } else {
      addMessage({
        type: "tool",
        content: `${tool.name} 실행 실패: 재시도가 필요합니다.`,
        toolName: tool.name,
        agentName: agentName || agent.name,
        status: "error",
      })
      setExecutionStats((prev) => ({
        ...prev,
        failedTasks: prev.failedTasks + 1,
      }))
    }
  }

  // 개선된 에이전트 응답 생성 함수
  const generateAgentResponse = async (input: string, agent: Agent): Promise<string> => {
    // 입력에 따른 맞춤형 응답 생성
    const lowerInput = input.toLowerCase()

    // 인사말 처리
    if (lowerInput.includes("안녕") || lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return `안녕하세요! 저는 ${agent.name}입니다. ${agent.description} 무엇을 도와드릴까요?`
    }

    // 자기소개 요청 처리
    if (lowerInput.includes("누구") || lowerInput.includes("소개") || lowerInput.includes("who are you")) {
      return `저는 ${agent.name}입니다. ${agent.description}

주요 기능:
- ${agent.type} 역할 수행
- ${agent.tools?.length || 0}개의 전용 툴 보유
- 사용자 요청에 따른 맞춤형 작업 수행

어떤 작업을 도와드릴까요?`
    }

    // 기능 문의 처리
    if (lowerInput.includes("기능") || lowerInput.includes("할 수 있") || lowerInput.includes("도움")) {
      const capabilities = []
      if (agent.description.includes("앱") || agent.description.includes("모바일")) {
        capabilities.push("모바일 앱 개발", "APK 빌드", "크로스플랫폼 테스트")
      }
      if (agent.description.includes("웹") || agent.description.includes("프론트엔드")) {
        capabilities.push("웹 애플리케이션 개발", "React 컴포넌트 생성", "자동 배포")
      }
      if (agent.description.includes("백엔드") || agent.description.includes("API")) {
        capabilities.push("API 개발", "데이터베이스 관리", "서버 구축")
      }
      if (agent.description.includes("데이터") || agent.description.includes("분석")) {
        capabilities.push("데이터 수집", "데이터 분석", "시각화")
      }

      return `제가 도와드릴 수 있는 주요 기능들입니다:

${capabilities.length > 0 ? capabilities.map((cap) => `• ${cap}`).join("\n") : "• 다양한 개발 및 분석 작업"}

구체적인 작업을 요청해주시면 더 자세히 도와드리겠습니다!`
    }

    // 작업 요청 처리
    if (lowerInput.includes("만들") || lowerInput.includes("생성") || lowerInput.includes("개발")) {
      return `"${input}" 작업을 분석했습니다.

다음 단계로 진행하겠습니다:
1. 요구사항 분석 및 계획 수립
2. 필요한 리소스 및 툴 확인
3. 단계별 작업 실행
4. 결과 검증 및 최적화

${agent.tools && agent.tools.length > 0 ? `사용 가능한 ${agent.tools.length}개의 전용 툴을 활용하여 최적의 결과를 제공하겠습니다.` : ""}

작업을 시작하겠습니다!`
    }

    // 기본 응답
    const responses = [
      `"${input}"에 대해 분석한 결과, ${agent.description}의 전문성을 활용하여 최적의 솔루션을 제공하겠습니다.`,
      `요청하신 "${input}" 작업을 수행하기 위해 단계별로 진행하겠습니다. 잠시만 기다려주세요.`,
      `${agent.name}로서 "${input}" 요청을 처리하겠습니다. 제가 가진 전문 지식과 툴을 활용하여 도움을 드리겠습니다.`,
      `"${input}" 작업을 완료했습니다. 결과를 확인해 주세요. 추가로 필요한 사항이 있으시면 언제든 말씀해주세요.`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateMemberResponse = async (input: string, member: any): Promise<string> => {
    return `${member.role}로서 "${input}" 작업의 ${member.description} 부분을 완료했습니다.

수행한 작업:
• 전문 영역에 맞는 분석 및 처리
• 품질 검증 및 최적화
• 팀 협업을 위한 결과 정리

다음 팀원에게 작업을 전달합니다.`
  }

  const handleReset = () => {
    setMessages([])
    setExecutionStats({
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      executionTime: 0,
    })
    addMessage({
      type: "system",
      content: `${agent.name} 에이전트가 재시작되었습니다.`,
      agentName: agent.name,
    })
  }

  const getMessageIcon = (message: Message) => {
    switch (message.type) {
      case "user":
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">U</div>
        )
      case "agent":
        return agent.isTeam ? <Users className="w-5 h-5 text-purple-600" /> : <Bot className="w-5 h-5 text-green-600" />
      case "tool":
        return <Wrench className="w-5 h-5 text-orange-600" />
      case "system":
        return <Settings className="w-5 h-5 text-gray-600" />
      default:
        return <Bot className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="h-[80vh] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {agent.isTeam ? <Users className="h-6 w-6 text-purple-600" /> : <Bot className="h-6 w-6 text-green-600" />}
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
          <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "실행중" : "대기중"}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            리셋
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>

      {/* 실행 통계 */}
      <div className="p-4 bg-muted/50 border-b">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{executionStats.totalTasks}</div>
            <div className="text-xs text-muted-foreground">총 작업</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{executionStats.completedTasks}</div>
            <div className="text-xs text-muted-foreground">완료</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{executionStats.failedTasks}</div>
            <div className="text-xs text-muted-foreground">실패</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{executionStats.executionTime}ms</div>
            <div className="text-xs text-muted-foreground">실행시간</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="console">콘솔</TabsTrigger>
          <TabsTrigger value="tools">툴 ({agent.tools?.length || 0})</TabsTrigger>
          <TabsTrigger value="code">코드</TabsTrigger>
          {agent.isTeam && <TabsTrigger value="team">팀 정보</TabsTrigger>}
        </TabsList>

        <TabsContent value="console" className="flex-1 flex flex-col">
          {/* 메시지 영역 - 스크롤 개선 */}
          <ScrollArea className="flex-1 p-4" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">{getMessageIcon(message)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.agentName || message.toolName || message.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                      {getStatusIcon(message.status)}
                    </div>
                    <div className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 입력 영역 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="에이전트에게 작업을 요청하세요..."
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isRunning}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isRunning || !inputMessage.trim()}>
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">사용 가능한 툴</h4>
            {agent.tools && agent.tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agent.tools.map((tool, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => executeAgentTool(tool)}>
                          <Play className="h-3 w-3 mr-1" />
                          실행
                        </Button>
                        <Badge variant="outline" className="text-xs">
                          {tool.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4" />
                <p>사용 가능한 툴이 없습니다</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="h-4 w-4" />
                에이전트 코드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <pre className="text-xs whitespace-pre-wrap font-mono">{agent.code}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {agent.isTeam && (
          <TabsContent value="team" className="flex-1 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">팀 구성원</h4>
              {agent.members && agent.members.length > 0 ? (
                <div className="space-y-3">
                  {agent.members.map((member, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{member.name}</h5>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{member.description}</p>
                        <div className="text-xs text-muted-foreground">전용 툴: {member.tools?.length || 0}개</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>팀 구성원 정보가 없습니다</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
