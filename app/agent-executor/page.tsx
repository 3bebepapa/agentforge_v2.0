"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Play, Users, User, Terminal, FileText } from "lucide-react"
import { AgentConsole } from "@/components/agent-console"

interface Agent {
  id: string
  name: string
  type: string
  description: string
  promptTemplate: string
  code: string
  tools: AgentTool[]
  isTeam: boolean
  members?: TeamMember[]
  sharedTools?: AgentTool[]
  collaborationMethod?: string
  status: "active" | "inactive" | "running"
}

interface AgentTool {
  id: string
  name: string
  description: string
  type: "api" | "ui" | "automation" | "integration"
  code: string
  config: Record<string, any>
  isActive: boolean
}

interface TeamMember {
  name: string
  role: string
  description: string
  promptTemplate: string
  code: string
  tools: AgentTool[]
}

// 실제 구현에서는 데이터베이스나 상태 관리 라이브러리에서 가져올 것입니다
const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "데이터 분석 팀",
    type: "팀",
    description: "데이터를 수집, 분석하고 인사이트를 도출하여 보고서를 작성하는 팀입니다.",
    promptTemplate: "",
    code: "",
    tools: [],
    isTeam: true,
    status: "active",
    members: [
      {
        name: "데이터 수집 에이전트",
        role: "데이터 수집 전문가",
        description: "다양한 소스에서 데이터를 수집하고 통합하는 에이전트입니다.",
        promptTemplate: "",
        code: "",
        tools: [],
      },
      {
        name: "데이터 분석 에이전트",
        role: "데이터 분석 전문가",
        description: "수집된 데이터를 분석하고 인사이트를 도출하는 에이전트입니다.",
        promptTemplate: "",
        code: "",
        tools: [],
      },
      {
        name: "보고서 작성 에이전트",
        role: "보고서 작성 전문가",
        description: "분석 결과를 바탕으로 보고서를 작성하는 에이전트입니다.",
        promptTemplate: "",
        code: "",
        tools: [],
      },
    ],
    collaborationMethod:
      "이 팀은 데이터 수집 → 전처리 → 분석 → 시각화 → 보고서 작성의 파이프라인으로 작업합니다. 각 에이전트는 자신의 전문 영역에서 작업을 수행하고, 코디네이터가 전체 프로세스를 조율합니다.",
    sharedTools: [],
  },
  {
    id: "agent-2",
    name: "마누스 에이전트",
    type: "자율형 멀티 에이전트",
    description:
      "마누스쿨로 추론 로직을 구현하는 에이전트로, 사용자가 작업을 입력하면 작업단계를 생성하고 스스로 작업수행을 할 수 있습니다.",
    promptTemplate: "",
    code: "",
    tools: [],
    isTeam: false,
    status: "active",
    sharedTools: [],
  },
]

export default function AgentExecutorPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [task, setTask] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"single" | "team">("team")
  const [outputFormat, setOutputFormat] = useState<"console" | "markdown">("console")
  const [showConsole, setShowConsole] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = () => {
    try {
      const stored = localStorage.getItem("agentforge-agents")
      if (stored) {
        const parsedAgents = JSON.parse(stored).map((agent: any) => ({
          ...agent,
          status: agent.status || "active",
        }))
        setAgents(parsedAgents)
      } else {
        setAgents(mockAgents)
      }
    } catch (error) {
      console.error("에이전트 목록 로드 오류:", error)
      setAgents(mockAgents)
    }
  }

  const handleAgentUpdate = (agentId: string, updates: Partial<Agent>) => {
    const updatedAgents = agents.map((agent) => (agent.id === agentId ? { ...agent, ...updates } : agent))
    setAgents(updatedAgents)
    localStorage.setItem("agentforge-agents", JSON.stringify(updatedAgents))
  }

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)

  const handleExecute = async () => {
    if (!selectedAgent || !task) return

    setIsExecuting(true)
    setExecutionResults(null)

    // 실제 구현에서는 API 호출 등을 통해 에이전트를 실행할 것입니다
    try {
      // 실행 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 3000))

      if (selectedAgent.isTeam) {
        setExecutionResults(`
# 팀 실행 결과: ${selectedAgent.name}

## 작업 요약
작업: ${task}

## 팀 멤버별 실행 결과

### ${selectedAgent.members?.[0].name}
${selectedAgent.members?.[0].role}로서 다음 작업을 수행했습니다:
- 요청된 데이터 소스 식별 및 접근
- 필요한 데이터 수집 및 정리
- 데이터 형식 통일 및 전처리

### ${selectedAgent.members?.[1].name}
${selectedAgent.members?.[1].role}로서 다음 작업을 수행했습니다:
- 데이터 패턴 분석
- 통계적 유의성 검증
- 주요 인사이트 도출

### ${selectedAgent.members?.[2].name}
${selectedAgent.members?.[2].role}로서 다음 작업을 수행했습니다:
- 분석 결과 정리
- 시각적 자료 생성
- 최종 보고서 작성

## 최종 결과
${task}에 대한 분석이 완료되었습니다. 주요 인사이트와 권장사항이 포함된 보고서가 생성되었습니다.
        `)
      } else {
        setExecutionResults(`
# 에이전트 실행 결과: ${selectedAgent.name}

## 작업 요약
작업: ${task}

## 실행 단계
1. 작업 분석 및 계획 수립
2. 필요한 정보 수집
3. 단계별 작업 실행
4. 결과 검증 및 최적화

## 최종 결과
${task}에 대한 작업이 성공적으로 완료되었습니다.
        `)
      }
    } catch (error) {
      console.error("에이전트 실행 오류:", error)
      setExecutionResults("에이전트 실행 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsExecuting(false)
    }
  }

  const handleStartConsole = () => {
    if (selectedAgent) {
      setShowConsole(true)
    }
  }

  // 마크다운 형식으로 변환하는 함수
  function formatMarkdown(text: string): string {
    // 마크다운 변환 (실제로는 더 복잡한 마크다운 라이브러리를 사용할 수 있습니다)
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium my-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, "<br /><br />")
  }

  // 필터링된 에이전트 목록
  const filteredAgents = agents.filter((agent) => {
    if (activeTab === "single") return !agent.isTeam
    if (activeTab === "team") return agent.isTeam
    return true
  })

  if (showConsole && selectedAgent) {
    return (
      <div className="h-screen bg-background">
        <AgentConsole agent={selectedAgent} apiKey="demo-key" onClose={() => setShowConsole(false)} />
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">에이전트 실행</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>에이전트 선택</CardTitle>
                <CardDescription>실행할 에이전트를 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={(value: "single" | "team") => setActiveTab(value)}
                  className="mb-4"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">단일 에이전트</TabsTrigger>
                    <TabsTrigger value="team">팀 에이전트</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  {filteredAgents.map((agent) => (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer hover:bg-accent transition-colors ${
                        selectedAgentId === agent.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedAgentId(agent.id)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <Badge variant="outline">
                            {agent.isTeam ? (
                              <>
                                <Users className="h-3 w-3 mr-1" /> 팀
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" /> 단일
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {agent.isTeam ? `${agent.members?.length}명의 에이전트로 구성된 팀` : agent.type}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>작업 입력</CardTitle>
                <CardDescription>
                  {selectedAgent
                    ? `${selectedAgent.name}에게 수행할 작업을 입력하세요`
                    : "먼저 왼쪽에서 에이전트를 선택하세요"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="수행할 작업을 상세히 설명해주세요..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="min-h-[100px]"
                    disabled={!selectedAgent}
                  />

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleStartConsole} disabled={!selectedAgent}>
                      <Terminal className="h-4 w-4 mr-2" />
                      채팅 시작
                    </Button>
                    <Button onClick={handleExecute} disabled={!selectedAgent || !task || isExecuting}>
                      {isExecuting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> 실행 중...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" /> 실행
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {executionResults && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>실행 결과</CardTitle>
                    <CardDescription>{selectedAgent?.name}의 작업 실행 결과입니다</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={outputFormat === "console" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOutputFormat("console")}
                    >
                      <Terminal className="h-4 w-4 mr-1" />
                      콘솔
                    </Button>
                    <Button
                      variant={outputFormat === "markdown" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOutputFormat("markdown")}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      마크다운
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {outputFormat === "console" ? (
                    <div className="whitespace-pre-wrap border p-4 rounded-md bg-muted/50">{executionResults}</div>
                  ) : (
                    <div className="border p-4 rounded-md bg-muted/50">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(executionResults) }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
