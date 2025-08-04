"use client"

import { useState } from "react"
import { AgentForm } from "@/components/agent-creator/agent-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users, User } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Agent {
  id: string
  name: string
  type: string
  description: string
  promptTemplate: string
  code: string
  createdAt: Date
  isTeam?: false
}

interface TeamMember {
  name: string
  role: string
  description: string
  promptTemplate: string
  code: string
}

interface TeamAgent {
  id: string
  name: string
  purpose: string
  collaborationMethod: string
  members: TeamMember[]
  createdAt: Date
  isTeam: true
}

type AnyAgent = Agent | TeamAgent

export default function AgentCreatorPage() {
  const [agents, setAgents] = useState<AnyAgent[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "single" | "team">("all")

  const handleCreateAgent = () => {
    setIsCreating(true)
  }

  const handleSubmit = (agentData: Omit<Agent, "id" | "createdAt"> | Omit<TeamAgent, "id" | "createdAt">) => {
    const newAgent: AnyAgent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      createdAt: new Date(),
    }

    setAgents((prev) => [...prev, newAgent])
    setIsCreating(false)

    // 여기서 API 호출 등을 통해 서버에 저장할 수 있습니다
    console.log("에이전트 생성됨:", newAgent)
  }

  const handleCancel = () => {
    setIsCreating(false)
  }

  // 필터링된 에이전트 목록
  const filteredAgents = agents.filter((agent) => {
    if (activeTab === "all") return true
    if (activeTab === "single") return !agent.isTeam
    if (activeTab === "team") return agent.isTeam
    return true
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">에이전트 관리</h1>
        {!isCreating && (
          <Button onClick={handleCreateAgent}>
            <PlusCircle className="mr-2 h-4 w-4" />새 에이전트 생성
          </Button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-card border rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">새 에이전트 생성</h2>
          </div>
          <AgentForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      ) : (
        <>
          <Tabs
            value={activeTab}
            onValueChange={(value: "all" | "single" | "team") => setActiveTab(value)}
            className="mb-6"
          >
            <TabsList className="grid w-[400px] grid-cols-3">
              <TabsTrigger value="all">모든 에이전트</TabsTrigger>
              <TabsTrigger value="single">단일 에이전트</TabsTrigger>
              <TabsTrigger value="team">팀 에이전트</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
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
                    <CardDescription>
                      {agent.isTeam ? `${agent.members.length}명의 에이전트로 구성된 팀` : agent.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3 mb-4">{agent.isTeam ? agent.purpose : agent.description}</p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        편집
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">생성된 에이전트가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-1">새 에이전트를 생성하려면 위의 버튼을 클릭하세요.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
