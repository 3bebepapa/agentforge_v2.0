"use client"

// components/team-form.tsx
import type React from "react"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Agent {
  id: string
  name: string
  description: string
}

interface TeamFormProps {
  availableAgents: Agent[]
  onCreateTeam: (teamName: string, teamDescription: string, selectedAgentIds: string[]) => void
}

const TeamForm: React.FC<TeamFormProps> = ({ availableAgents, onCreateTeam }) => {
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateTeam(teamName, teamDescription, selectedAgents)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 팀 생성 폼에 협업 로직 추가 */}
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="teamName">팀 이름</Label>
          <Input
            id="teamName"
            placeholder="팀 이름을 입력하세요"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamDescription">팀 설명</Label>
          <Textarea
            id="teamDescription"
            placeholder="팀의 목적과 역할을 설명하세요"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>협업 방식</Label>
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-2">이 팀은 다음과 같은 협업 방식으로 작업합니다:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>코디네이터가 사용자 요청을 분석하고 작업 계획을 수립합니다.</li>
              <li>각 전문가 팀원에게 적합한 작업이 할당됩니다.</li>
              <li>팀원들이 각자의 전문 영역에서 작업을 수행합니다.</li>
              <li>코디네이터가 결과물을 통합하고 품질을 검수합니다.</li>
              <li>전체 프로젝트의 통합 상황을 모니터링하고 필요시 조정합니다.</li>
            </ol>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>팀원 선택</Label>
            <div className="text-xs text-muted-foreground">코디네이터는 필수로 포함됩니다</div>
          </div>
          <div className="border rounded-md divide-y">
            {availableAgents.map((agent) => (
              <div key={agent.id} className="flex items-center p-2">
                <Checkbox
                  id={`agent-${agent.id}`}
                  checked={selectedAgents.includes(agent.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedAgents([...selectedAgents, agent.id])
                    } else {
                      setSelectedAgents(selectedAgents.filter((id) => id !== agent.id))
                    }
                  }}
                />
                <label
                  htmlFor={`agent-${agent.id}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                >
                  <div>{agent.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{agent.description}</div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button type="submit">Create Team</button>
    </form>
  )
}

export default TeamForm
