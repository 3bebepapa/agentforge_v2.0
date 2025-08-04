"use client"

// This is a new file, so we'll create the entire component here.
// Assuming necessary imports from Shadcn UI and React are available.

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const CreateAgentForm = () => {
  const [agentName, setAgentName] = useState("")
  const [agentDescription, setAgentDescription] = useState("")
  const [agentType, setAgentType] = useState("general")
  const [agentPrompt, setAgentPrompt] = useState("")

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="agentName">에이전트 이름</Label>
        <Input
          id="agentName"
          placeholder="에이전트 이름을 입력하세요"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agentDescription">에이전트 설명</Label>
        <Textarea
          id="agentDescription"
          placeholder="에이전트의 역할과 능력을 설명하세요"
          value={agentDescription}
          onChange={(e) => setAgentDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agentType">에이전트 유형</Label>
        <Select value={agentType} onValueChange={setAgentType}>
          <SelectTrigger>
            <SelectValue placeholder="에이전트 유형 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">일반 에이전트</SelectItem>
            <SelectItem value="specialized">전문 에이전트</SelectItem>
            <SelectItem value="coordinator">코디네이터</SelectItem>
          </SelectContent>
        </Select>

        {agentType === "coordinator" && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">코디네이터 역할:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>작업 계획 수립 및 팀원 작업 할당</li>
              <li>팀원 간 협업 조율 및 진행 상황 모니터링</li>
              <li>결과물 통합 및 품질 검수</li>
              <li>전체 프로세스 오케스트레이션</li>
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agentPrompt">에이전트 프롬프트 (선택사항)</Label>
        <Textarea
          id="agentPrompt"
          placeholder="에이전트의 행동과 응답 방식을 정의하는 프롬프트를 입력하세요"
          value={agentPrompt}
          onChange={(e) => setAgentPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        {agentType === "coordinator" && !agentPrompt && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              setAgentPrompt(`당신은 팀의 코디네이터입니다. 당신의 역할은 다음과 같습니다:

1. 사용자 요구사항 분석 및 작업 계획 수립
2. 팀원들에게 작업 할당 및 지시
3. 팀원들의 작업 진행 상황 모니터링
4. 팀원들의 결과물 통합 및 품질 검수
5. 전체 프로세스 조율 및 최종 결과물 제출

항상 체계적이고 효율적으로 팀을 이끌어 최상의 결과물을 만들어내세요.`)
            }
          >
            코디네이터 프롬프트 템플릿 사용
          </Button>
        )}
      </div>
    </div>
  )
}

export default CreateAgentForm
