"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Bot, Users, Play, Trash2, Edit, Copy, Search } from "lucide-react"
import { AgentForm } from "./agent-creator/agent-form"
import { AgentConsole } from "./agent-console"
import { useToast } from "@/hooks/use-toast"

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
  lastRun?: string
  createdAt: string
}

interface AgentWorkspaceProps {
  apiKey: string
}

export function AgentWorkspace({ apiKey }: AgentWorkspaceProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showConsole, setShowConsole] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "single" | "team">("all")
  const { toast } = useToast()

  // 초기 데이터 로드
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = () => {
    // 로컬 스토리지에서 에이전트 데이터 로드
    const savedAgents = localStorage.getItem("ai-works-agents")
    if (savedAgents) {
      try {
        setAgents(JSON.parse(savedAgents))
      } catch (error) {
        console.error("에이전트 데이터 로드 오류:", error)
      }
    }
  }

  const saveAgents = (newAgents: Agent[]) => {
    localStorage.setItem("ai-works-agents", JSON.stringify(newAgents))
    setAgents(newAgents)
  }

  const handleCreateAgent = (agentData: any) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      ...agentData,
      status: "inactive",
      createdAt: new Date().toISOString(),
    }

    const updatedAgents = [...agents, newAgent]
    saveAgents(updatedAgents)
    setShowCreateDialog(false)

    toast({
      title: "에이전트 생성 완료",
      description: `${newAgent.name}이(가) 성공적으로 생성되었습니다.`,
    })
  }

  const handleRunAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowConsole(true)

    // 에이전트 상태 업데이트
    const updatedAgents = agents.map((a) =>
      a.id === agent.id ? { ...a, status: "running" as const, lastRun: new Date().toISOString() } : a,
    )
    saveAgents(updatedAgents)
  }

  const handleDeleteAgent = (agentId: string) => {
    const updatedAgents = agents.filter((a) => a.id !== agentId)
    saveAgents(updatedAgents)

    toast({
      title: "에이전트 삭제",
      description: "에이전트가 삭제되었습니다.",
    })
  }

  const handleDuplicateAgent = (agent: Agent) => {
    const duplicatedAgent: Agent = {
      ...agent,
      id: `agent-${Date.now()}`,
      name: `${agent.name} (복사본)`,
      status: "inactive",
      createdAt: new Date().toISOString(),
    }

    const updatedAgents = [...agents, duplicatedAgent]
    saveAgents(updatedAgents)

    toast({
      title: "에이전트 복제",
      description: `${duplicatedAgent.name}이(가) 생성되었습니다.`,
    })
  }

  // 필터링된 에이전트 목록
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterType === "all" || (filterType === "single" && !agent.isTeam) || (filterType === "team" && agent.isTeam)

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "활성"
      case "running":
        return "실행중"
      case "inactive":
        return "비활성"
      default:
        return "알 수 없음"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">AI 에이전트</h2>
            <p className="text-muted-foreground">AI 에이전트를 생성하고 관리하세요</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />새 에이전트
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI 에이전트 생성</DialogTitle>
              </DialogHeader>
              <AgentForm onSubmit={handleCreateAgent} onCancel={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="에이전트 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              전체 ({agents.length})
            </Button>
            <Button
              variant={filterType === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("single")}
            >
              <Bot className="h-4 w-4 mr-1" />
              단일 ({agents.filter((a) => !a.isTeam).length})
            </Button>
            <Button
              variant={filterType === "team" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("team")}
            >
              <Users className="h-4 w-4 mr-1" />팀 ({agents.filter((a) => a.isTeam).length})
            </Button>
          </div>
        </div>
      </div>

      {/* 에이전트 목록 */}
      <div className="flex-1 p-6">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {agents.length === 0 ? "에이전트가 없습니다" : "검색 결과가 없습니다"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {agents.length === 0 ? "첫 번째 AI 에이전트를 생성해보세요" : "다른 검색어나 필터를 시도해보세요"}
            </p>
            {agents.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                에이전트 생성
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {agent.isTeam ? (
                        <Users className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Bot className="h-5 w-5 text-blue-600" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{agent.type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>{getStatusText(agent.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{agent.description}</p>

                  {/* 에이전트 정보 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">툴 개수:</span>
                      <span>{agent.tools?.length || 0}개</span>
                    </div>
                    {agent.isTeam && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">팀원:</span>
                        <span>{agent.members?.length || 0}명</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">생성일:</span>
                      <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
                    </div>
                    {agent.lastRun && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">마지막 실행:</span>
                        <span>{new Date(agent.lastRun).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRunAgent(agent)} className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      실행
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicateAgent(agent)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteAgent(agent.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 에이전트 콘솔 */}
      {showConsole && selectedAgent && (
        <Dialog open={showConsole} onOpenChange={setShowConsole}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAgent.isTeam ? <Users className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                {selectedAgent.name} - 실행 콘솔
              </DialogTitle>
            </DialogHeader>
            <AgentConsole agent={selectedAgent} apiKey={apiKey} onClose={() => setShowConsole(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
