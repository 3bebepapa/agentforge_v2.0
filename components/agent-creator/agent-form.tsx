"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, RefreshCw, Users, User, FileText, Terminal, Plus, X, Settings, Play, Wrench } from "lucide-react"
import { generateAgentPrompt, generateAgentCode, generateTeam } from "@/lib/ai-service"
import { AgentToolsManager } from "@/components/agent-creator/agent-tools-manager"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentFormProps {
  onSubmit: (agentData: AgentData | TeamAgentData) => void
  onCancel: () => void
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

interface AgentData {
  name: string
  type: string
  description: string
  promptTemplate: string
  code: string
  tools: AgentTool[]
  isTeam?: false
}

interface TeamMember {
  name: string
  role: string
  description: string
  promptTemplate: string
  code: string
  tools: AgentTool[]
}

interface TeamAgentData {
  name: string
  purpose: string
  collaborationMethod: string
  members: TeamMember[]
  sharedTools: AgentTool[]
  isTeam: true
}

export function AgentForm({ onSubmit, onCancel }: AgentFormProps) {
  const [agentMode, setAgentMode] = useState<"single" | "team">("single")

  // 단일 에이전트 상태
  const [agentData, setAgentData] = useState<AgentData>({
    name: "",
    type: "자율형 멀티 에이전트",
    description: "",
    promptTemplate: "",
    code: "",
    tools: [],
  })

  // 팀 에이전트 상태
  const [teamData, setTeamData] = useState<Omit<TeamAgentData, "isTeam">>({
    name: "",
    purpose: "",
    collaborationMethod: "",
    members: [],
    sharedTools: [],
  })

  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [isGeneratingTeam, setIsGeneratingTeam] = useState(false)
  const [isGeneratingTools, setIsGeneratingTools] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"console" | "markdown">("console")
  const [showToolDialog, setShowToolDialog] = useState(false)
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null)

  // 단일 에이전트 관련 함수들
  const handleInputChange = (field: keyof AgentData, value: string) => {
    setAgentData((prev) => ({ ...prev, [field]: value }))
  }

  // 팀 에이전트 관련 함수들
  const handleTeamInputChange = (field: keyof Omit<TeamAgentData, "members" | "sharedTools">, value: string) => {
    setTeamData((prev) => ({ ...prev, [field]: value }))
  }

  // 실제 툴 생성 로직
  const generateToolsForAgent = async (description: string, type: string): Promise<AgentTool[]> => {
    console.log("툴 생성 시작:", description, type)
    const tools: AgentTool[] = []

    // 하이브리드 앱 관련 툴들
    if (
      description.includes("하이브리드") ||
      description.includes("앱") ||
      description.includes("모바일") ||
      description.includes("React Native")
    ) {
      tools.push({
        id: `tool-${Date.now()}-1`,
        name: "APK 빌더",
        description: "React Native 앱을 APK로 빌드하는 도구",
        type: "automation",
        code: generateAPKBuilderCode(),
        config: {
          parameters: ["projectPath", "buildType", "outputPath"],
          apiEndpoints: ["/api/build/apk"],
          uiComponents: ["BuildForm", "ProgressIndicator", "DownloadButton"],
        },
        isActive: true,
      })

      tools.push({
        id: `tool-${Date.now()}-2`,
        name: "크로스플랫폼 테스터",
        description: "iOS/Android 동시 테스트 도구",
        type: "ui",
        code: generateCrossPlatformTesterCode(),
        config: {
          parameters: ["testSuite", "platforms", "devices"],
          apiEndpoints: ["/api/test/cross-platform"],
          uiComponents: ["TestRunner", "ResultViewer", "DeviceSelector"],
        },
        isActive: true,
      })

      tools.push({
        id: `tool-${Date.now()}-3`,
        name: "Google API 통합기",
        description: "Google 서비스 API 통합 도구",
        type: "integration",
        code: generateGoogleAPIIntegratorCode(),
        config: {
          parameters: ["apiKey", "serviceType", "credentials"],
          apiEndpoints: ["/api/google/integrate"],
          uiComponents: ["APIKeyManager", "ServiceSelector", "TestConsole"],
        },
        isActive: true,
      })
    }

    // 웹 개발 관련 툴들
    if (
      description.includes("웹") ||
      description.includes("프론트엔드") ||
      description.includes("React") ||
      description.includes("풀스택")
    ) {
      tools.push({
        id: `tool-${Date.now()}-4`,
        name: "컴포넌트 생성기",
        description: "React 컴포넌트 자동 생성 도구",
        type: "ui",
        code: generateComponentGeneratorCode(),
        config: {
          parameters: ["componentName", "props", "styling"],
          apiEndpoints: ["/api/generate/component"],
          uiComponents: ["ComponentForm", "CodePreview", "ExportButton"],
        },
        isActive: true,
      })

      tools.push({
        id: `tool-${Date.now()}-5`,
        name: "웹 배포 도구",
        description: "웹 애플리케이션 자동 배포 도구",
        type: "automation",
        code: generateWebDeploymentCode(),
        config: {
          parameters: ["deployTarget", "buildCommand", "environment"],
          apiEndpoints: ["/api/deploy/web"],
          uiComponents: ["DeployForm", "StatusMonitor", "LogViewer"],
        },
        isActive: true,
      })
    }

    // 기본 툴 (모든 에이전트에게 제공)
    if (tools.length === 0) {
      tools.push({
        id: `tool-${Date.now()}-default`,
        name: "범용 작업 도구",
        description: "다양한 작업을 수행할 수 있는 범용 도구",
        type: "ui",
        code: generateUniversalToolCode(),
        config: {
          parameters: ["taskType", "input", "options"],
          apiEndpoints: ["/api/universal/execute"],
          uiComponents: ["TaskForm", "ResultViewer", "HistoryPanel"],
        },
        isActive: true,
      })
    }

    console.log("생성된 툴 개수:", tools.length)
    return tools
  }

  // AI 에이전트 & 툴 생성 (단일 에이전트용)
  const generatePromptFromDescription = async () => {
    if (!agentData.description || isGeneratingPrompt) return

    console.log("AI 에이전트 생성 시작:", agentData.description)

    setIsGeneratingPrompt(true)
    setIsGeneratingCode(true)
    setIsGeneratingTools(true)

    try {
      // 1. 프롬프트 생성
      console.log("1. 프롬프트 생성 중...")
      const generatedPrompt = await generateAgentPrompt(agentData.description, agentData.type)
      setAgentData((prev) => ({ ...prev, promptTemplate: generatedPrompt }))
      console.log("프롬프트 생성 완료")

      // 2. 코드 생성
      console.log("2. 코드 생성 중...")
      const generatedCode = await generateAgentCode(generatedPrompt, agentData.type, agentData.name || "Agent")
      setAgentData((prev) => ({ ...prev, code: generatedCode }))
      console.log("코드 생성 완료")

      // 3. 툴 생성
      console.log("3. 툴 생성 중...")
      const generatedTools = await generateToolsForAgent(agentData.description, agentData.type)
      console.log("생성된 툴들:", generatedTools)
      setAgentData((prev) => ({ ...prev, tools: generatedTools }))
      console.log("툴 생성 완료, 총", generatedTools.length, "개 툴 생성됨")
    } catch (error) {
      console.error("AI 생성 오류:", error)
      alert("AI 생성 중 오류가 발생했습니다: " + error.message)
    } finally {
      setIsGeneratingPrompt(false)
      setIsGeneratingCode(false)
      setIsGeneratingTools(false)
    }
  }

  // AI 팀 & 툴 생성 (팀 에이전트용)
  const generateTeamFromPurpose = async () => {
    if (!teamData.purpose || isGeneratingTeam) return

    console.log("AI 팀 생성 시작:", teamData.purpose)

    setIsGeneratingTeam(true)
    try {
      const generatedTeam = await generateTeam(teamData.purpose)
      console.log("팀 생성 완료:", generatedTeam)

      // 팀원들에게 적절한 툴 할당
      console.log("팀원별 툴 생성 중...")
      const membersWithTools = await Promise.all(
        generatedTeam.members.map(async (member, index) => {
          console.log(`${index + 1}번째 팀원 툴 생성:`, member.name)
          const memberTools = await generateToolsForAgent(member.description, member.role)
          console.log(`${member.name} 툴 생성 완료:`, memberTools.length, "개")
          return {
            ...member,
            tools: memberTools,
          }
        }),
      )

      // 팀 공유 툴 생성
      console.log("팀 공유 툴 생성 중...")
      const sharedTools = await generateToolsForAgent(teamData.purpose, "team")
      console.log("팀 공유 툴 생성 완료:", sharedTools.length, "개")

      setTeamData((prev) => ({
        ...prev,
        name: generatedTeam.name || prev.name,
        collaborationMethod: generatedTeam.collaborationMethod,
        members: membersWithTools,
        sharedTools: sharedTools,
      }))

      console.log("팀 생성 완전히 완료")
    } catch (error) {
      console.error("팀 생성 오류:", error)
      alert("팀 생성 중 오류가 발생했습니다: " + error.message)
    } finally {
      setIsGeneratingTeam(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (agentMode === "single") {
      onSubmit(agentData)
    } else {
      onSubmit({ ...teamData, isTeam: true })
    }
  }

  const agentTypes = [
    { value: "자율형 멀티 에이전트", label: "자율형 멀티 에이전트" },
    { value: "다른 에이전트와 협업 가능한 자율형 에이전트", label: "다른 에이전트와 협업 가능한 자율형 에이전트" },
  ]

  const exampleTemplates = [
    {
      title: "하이브리드 앱 개발자",
      description:
        "React Native를 사용해 iOS/Android 하이브리드 앱을 개발하고 APK를 자동 생성하며 Google API를 통합하는 에이전트입니다.",
    },
    {
      title: "풀스택 웹 개발자",
      description: "프론트엔드와 백엔드를 모두 개발하며 자동 배포와 API 생성 도구를 사용하는 에이전트입니다.",
    },
    {
      title: "데이터 분석 전문가",
      description: "데이터를 수집, 분석하고 시각화 도구와 보고서 생성기를 사용하는 에이전트입니다.",
    },
  ]

  const exampleTeamPurposes = [
    {
      title: "하이브리드 앱 개발 팀",
      purpose:
        "React Native를 사용해 크로스플랫폼 모바일 앱을 개발하고, APK/IPA 자동 빌드, Google/Apple API 통합, 자동 테스트를 수행하는 팀입니다.",
    },
    {
      title: "웹 애플리케이션 개발 팀",
      purpose: "현대적인 웹 애플리케이션을 설계, 개발, 테스트하고 자동 배포 파이프라인을 구축하는 팀입니다.",
    },
    {
      title: "AI/ML 솔루션 개발 팀",
      purpose:
        "머신러닝 모델을 개발하고 AI 서비스를 구축하며 데이터 파이프라인과 모델 배포 자동화를 담당하는 팀입니다.",
    },
  ]

  // 선택된 팀원 정보
  const selectedMember = selectedMemberIndex !== null ? teamData.members[selectedMemberIndex] : null
  const currentTools =
    agentMode === "single" ? agentData.tools : selectedMember ? selectedMember.tools : teamData.sharedTools
  const currentCode =
    agentMode === "single" ? agentData.code : selectedMember ? selectedMember.code : teamData.collaborationMethod

  return (
    <div className="grid grid-cols-2 gap-6 p-4">
      {/* 왼쪽 폼 영역 - 단일/팀 동일한 구조 */}
      <div className="space-y-6">
        {/* 상단 에이전트 모드 선택 */}
        <div className="flex space-x-2">
          <Button
            variant={agentMode === "single" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAgentMode("single")}
          >
            <User className="h-4 w-4 mr-2" />
            단일 에이전트
          </Button>
          <Button
            variant={agentMode === "team" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAgentMode("team")}
          >
            <Users className="h-4 w-4 mr-2" />팀 에이전트
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름/팀 이름 */}
          <div>
            <Label htmlFor="name">{agentMode === "single" ? "이름" : "팀 이름"}</Label>
            <Input
              id="name"
              value={agentMode === "single" ? agentData.name : teamData.name}
              onChange={(e) => {
                if (agentMode === "single") {
                  handleInputChange("name", e.target.value)
                } else {
                  handleTeamInputChange("name", e.target.value)
                }
              }}
              placeholder={agentMode === "single" ? "에이전트 이름을 입력하세요" : "팀 이름을 입력하세요"}
              className="mt-1"
            />
          </div>

          {/* 유형 (단일 에이전트만) */}
          {agentMode === "single" && (
            <div>
              <Label>유형</Label>
              <Select value={agentData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="에이전트 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 설명/목적 */}
          <div>
            <Label htmlFor="description">{agentMode === "single" ? "설명" : "팀 목적"}</Label>
            <Textarea
              id="description"
              value={agentMode === "single" ? agentData.description : teamData.purpose}
              onChange={(e) => {
                if (agentMode === "single") {
                  handleInputChange("description", e.target.value)
                } else {
                  handleTeamInputChange("purpose", e.target.value)
                }
              }}
              placeholder={
                agentMode === "single"
                  ? "예: React Native를 사용해 하이브리드 앱을 개발하고 APK를 자동 생성하며 Google API를 통합하는 에이전트입니다."
                  : "예: React Native를 사용해 크로스플랫폼 모바일 앱을 개발하고, APK/IPA 자동 빌드, Google/Apple API 통합, 자동 테스트를 수행하는 팀입니다."
              }
              className="mt-1 min-h-[100px]"
            />
            <div className="mt-2">
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={agentMode === "single" ? generatePromptFromDescription : generateTeamFromPurpose}
                disabled={
                  (agentMode === "single" &&
                    (isGeneratingPrompt || isGeneratingCode || isGeneratingTools || !agentData.description)) ||
                  (agentMode === "team" && (isGeneratingTeam || !teamData.purpose))
                }
              >
                {(agentMode === "single" && (isGeneratingPrompt || isGeneratingCode || isGeneratingTools)) ||
                (agentMode === "team" && isGeneratingTeam) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    AI {agentMode === "single" ? "에이전트 & 툴" : "팀 & 툴"} 생성 중...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 mr-2" />
                    AI {agentMode === "single" ? "에이전트 & 툴" : "팀 & 툴"} 생성
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {agentMode === "single"
                  ? "설명을 입력하고 버튼을 클릭하면 AI가 프롬프트, 코드, 전용 툴을 자동으로 생성합니다."
                  : "팀 목적을 입력하고 버튼을 클릭하면 AI가 적합한 팀과 각 팀원의 전용 툴을 자동으로 구성합니다."}
              </p>
            </div>
          </div>

          {/* 프롬프트 템플릿 (단일 에이전트만) */}
          {agentMode === "single" && (
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="promptTemplate">프롬프트 템플릿</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePromptFromDescription}
                  disabled={isGeneratingPrompt || !agentData.description}
                >
                  {isGeneratingPrompt ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" /> 생성 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" /> 재생성
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="promptTemplate"
                value={agentData.promptTemplate}
                onChange={(e) => handleInputChange("promptTemplate", e.target.value)}
                placeholder="AI가 자동으로 생성한 프롬프트가 여기에 표시됩니다."
                className="mt-1 min-h-[120px]"
              />
            </div>
          )}

          {/* 팀원 목록 (팀 에이전트만) */}
          {agentMode === "team" && teamData.members.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>팀 구성원</Label>
                <span className="text-sm text-muted-foreground">{teamData.members.length}명</span>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {teamData.members.map((member, index) => (
                  <Card
                    key={index}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedMemberIndex === index ? "bg-accent border-primary" : ""
                    }`}
                    onClick={() => setSelectedMemberIndex(selectedMemberIndex === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="outline">{member.tools?.length || 0}개 툴</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 예시 템플릿 */}
          <div className="space-y-4">
            <Label>예시 템플릿</Label>
            <div className="space-y-2">
              {(agentMode === "single" ? exampleTemplates : exampleTeamPurposes).map((template, index) => (
                <Card
                  key={index}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => {
                    if (agentMode === "single") {
                      handleInputChange("name", template.title)
                      handleInputChange("description", template.description)
                    } else {
                      handleTeamInputChange("name", template.title)
                      handleTeamInputChange("purpose", template.purpose)
                    }
                  }}
                >
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {agentMode === "single" ? template.description : template.purpose}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                agentMode === "single"
                  ? !agentData.promptTemplate || !agentData.code
                  : !teamData.members.length || !teamData.collaborationMethod
              }
            >
              저장
            </Button>
          </div>
        </form>
      </div>

      {/* 오른쪽 상세 영역 - 단일/팀 동일한 구조 */}
      <div className="space-y-6">
        {/* 툴 섹션 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {agentMode === "single"
                ? `에이전트 툴 (${agentData.tools.length})`
                : selectedMember
                  ? `${selectedMember.name} 툴 (${selectedMember.tools?.length || 0})`
                  : `팀 공유 툴 (${teamData.sharedTools.length})`}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const description =
                    agentMode === "single"
                      ? agentData.description
                      : selectedMember
                        ? selectedMember.description
                        : teamData.purpose

                  if (!description) {
                    alert(`먼저 ${agentMode === "single" ? "에이전트 설명" : "팀 목적"}을 입력해주세요.`)
                    return
                  }

                  setIsGeneratingTools(true)
                  try {
                    const newTools = await generateToolsForAgent(
                      description,
                      agentMode === "single" ? agentData.type : selectedMember ? selectedMember.role : "team",
                    )

                    if (agentMode === "single") {
                      setAgentData((prev) => ({ ...prev, tools: [...prev.tools, ...newTools] }))
                    } else if (selectedMember && selectedMemberIndex !== null) {
                      setTeamData((prev) => ({
                        ...prev,
                        members: prev.members.map((member, index) =>
                          index === selectedMemberIndex ? { ...member, tools: [...member.tools, ...newTools] } : member,
                        ),
                      }))
                    } else {
                      setTeamData((prev) => ({ ...prev, sharedTools: [...prev.sharedTools, ...newTools] }))
                    }

                    console.log("툴 추가 완료:", newTools.length, "개")
                  } catch (error) {
                    console.error("툴 생성 오류:", error)
                    alert("툴 생성 중 오류가 발생했습니다.")
                  } finally {
                    setIsGeneratingTools(false)
                  }
                }}
                disabled={isGeneratingTools || (agentMode === "single" ? !agentData.description : !teamData.purpose)}
              >
                {isGeneratingTools ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    AI 생성
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 mr-1" />
                    AI 생성
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowToolDialog(true)}>
                가져오기
              </Button>
              <Button size="sm" onClick={() => setShowToolDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />새 툴
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 min-h-[200px]">
            {currentTools.length > 0 ? (
              <div className="space-y-3">
                {currentTools.map((tool, index) => (
                  <div key={tool.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{tool.type}</Badge>
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (agentMode === "single") {
                            setAgentData((prev) => ({
                              ...prev,
                              tools: prev.tools.filter((_, i) => i !== index),
                            }))
                          } else if (selectedMember && selectedMemberIndex !== null) {
                            setTeamData((prev) => ({
                              ...prev,
                              members: prev.members.map((member, memberIndex) =>
                                memberIndex === selectedMemberIndex
                                  ? { ...member, tools: member.tools.filter((_, i) => i !== index) }
                                  : member,
                              ),
                            }))
                          } else {
                            setTeamData((prev) => ({
                              ...prev,
                              sharedTools: prev.sharedTools.filter((_, i) => i !== index),
                            }))
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Wrench className="h-12 w-12 mx-auto mb-4" />
                <h4 className="font-medium mb-2">툴이 없습니다</h4>
                <p className="text-sm mb-4">
                  {agentMode === "single"
                    ? "에이전트가 사용할 툴을"
                    : selectedMember
                      ? "팀원이 사용할 툴을"
                      : "팀이 공유할 툴을"}{" "}
                  생성하거나 가져와보세요
                </p>
                <Button
                  onClick={async () => {
                    const description =
                      agentMode === "single"
                        ? agentData.description
                        : selectedMember
                          ? selectedMember.description
                          : teamData.purpose

                    if (!description) {
                      alert(`먼저 ${agentMode === "single" ? "에이전트 설명" : "팀 목적"}을 입력해주세요.`)
                      return
                    }

                    setIsGeneratingTools(true)
                    try {
                      const newTools = await generateToolsForAgent(
                        description,
                        agentMode === "single" ? agentData.type : selectedMember ? selectedMember.role : "team",
                      )

                      if (agentMode === "single") {
                        setAgentData((prev) => ({ ...prev, tools: newTools }))
                      } else if (selectedMember && selectedMemberIndex !== null) {
                        setTeamData((prev) => ({
                          ...prev,
                          members: prev.members.map((member, index) =>
                            index === selectedMemberIndex ? { ...member, tools: newTools } : member,
                          ),
                        }))
                      } else {
                        setTeamData((prev) => ({ ...prev, sharedTools: newTools }))
                      }

                      console.log("툴 생성 완료:", newTools.length, "개")
                    } catch (error) {
                      console.error("툴 생성 오류:", error)
                      alert("툴 생성 중 오류가 발생했습니다.")
                    } finally {
                      setIsGeneratingTools(false)
                    }
                  }}
                  disabled={(agentMode === "single" ? !agentData.description : !teamData.purpose) || isGeneratingTools}
                >
                  {isGeneratingTools ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4 mr-1" />
                      AI로 생성
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 상세 정보 섹션 */}
        <div className="border rounded-md">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">
              {agentMode === "single"
                ? "에이전트 상세"
                : selectedMember
                  ? `${selectedMember.name} 상세`
                  : "팀 협업 방식"}
            </h3>
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
          </div>

          <div className="p-4 relative">
            {agentMode === "single" ? (
              // 단일 에이전트 상세 정보
              outputFormat === "console" ? (
                <Textarea
                  value={agentData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className="font-mono text-sm min-h-[300px] resize-none border-0 focus-visible:ring-0"
                  placeholder="AI가 자동으로 생성한 코드가 여기에 표시됩니다."
                />
              ) : (
                <div className="min-h-[300px] overflow-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(agentData.code) }}
                  />
                </div>
              )
            ) : selectedMember ? (
              // 선택된 팀원의 상세 정보
              outputFormat === "console" ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">역할</h4>
                    <p className="text-sm bg-muted/50 rounded p-2">{selectedMember.role}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">설명</h4>
                    <p className="text-sm bg-muted/50 rounded p-2">{selectedMember.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">프롬프트 템플릿</h4>
                    <Textarea
                      value={selectedMember.promptTemplate}
                      readOnly
                      className="font-mono text-sm min-h-[100px] resize-none"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">코드</h4>
                    <Textarea
                      value={selectedMember.code}
                      readOnly
                      className="font-mono text-sm min-h-[150px] resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] overflow-auto">
                  <div className="prose prose-sm max-w-none">
                    <h4>역할: {selectedMember.role}</h4>
                    <p>{selectedMember.description}</p>
                    <h4>프롬프트 템플릿</h4>
                    <pre className="bg-gray-100 p-4 rounded-md text-xs">{selectedMember.promptTemplate}</pre>
                    <h4>코드</h4>
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedMember.code) }} />
                  </div>
                </div>
              )
            ) : (
              // 팀 협업 방식
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">협업 프로세스</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      {teamData.collaborationMethod || "팀을 생성하면 협업 방식이 표시됩니다."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">팀 구성</h4>
                    <ul className="space-y-1">
                      {teamData.members.map((member, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="font-medium">{member.name}</span>
                          <span className="text-muted-foreground">({member.role})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">공유 리소스</h4>
                    <ul className="space-y-1">
                      <li className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>공유 툴: {teamData.sharedTools.length}개</span>
                      </li>
                      <li className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>
                          전체 툴:{" "}
                          {teamData.members.reduce((acc, member) => acc + (member.tools?.length || 0), 0) +
                            teamData.sharedTools.length}
                          개
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {isGeneratingCode && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm">코드 생성 중...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 툴 관리 다이얼로그 */}
      <Dialog open={showToolDialog} onOpenChange={setShowToolDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>에이전트 툴 관리</DialogTitle>
          </DialogHeader>
          <AgentToolsManager
            tools={currentTools}
            onToolsChange={(tools) => {
              if (agentMode === "single") {
                setAgentData((prev) => ({ ...prev, tools }))
              } else if (selectedMember && selectedMemberIndex !== null) {
                setTeamData((prev) => ({
                  ...prev,
                  members: prev.members.map((member, index) =>
                    index === selectedMemberIndex ? { ...member, tools } : member,
                  ),
                }))
              } else {
                setTeamData((prev) => ({ ...prev, sharedTools: tools }))
              }
            }}
            agentDescription={
              agentMode === "single"
                ? agentData.description
                : selectedMember
                  ? selectedMember.description
                  : teamData.purpose
            }
            agentType={agentMode === "single" ? agentData.type : selectedMember ? selectedMember.role : "team"}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 마크다운 형식으로 변환하는 함수
function formatMarkdown(code: string): string {
  const highlighted = code
    .replace(
      /class\s+(\w+)/g,
      '<strong class="text-blue-600">class</strong> <strong class="text-green-600">$1</strong>',
    )
    .replace(
      /function\s+(\w+)/g,
      '<strong class="text-blue-600">function</strong> <strong class="text-green-600">$1</strong>',
    )
    .replace(
      /const\s+(\w+)/g,
      '<strong class="text-blue-600">const</strong> <strong class="text-purple-600">$1</strong>',
    )
    .replace(/let\s+(\w+)/g, '<strong class="text-blue-600">let</strong> <strong class="text-purple-600">$1</strong>')
    .replace(/var\s+(\w+)/g, '<strong class="text-blue-600">var</strong> <strong class="text-purple-600">$1</strong>')
    .replace(/\/\*\*([\s\S]*?)\*\//g, '<span class="text-green-500">/**$1*/</span>')
    .replace(/\/\/(.*)/g, '<span class="text-gray-500">// $1</span>')
    .replace(/return/g, '<strong class="text-blue-600">return</strong>')
    .replace(/if/g, '<strong class="text-blue-600">if</strong>')
    .replace(/else/g, '<strong class="text-blue-600">else</strong>')
    .replace(/for/g, '<strong class="text-blue-600">for</strong>')
    .replace(/while/g, '<strong class="text-blue-600">while</strong>')
    .replace(/this\./g, '<span class="text-red-500">this.</span>')
    .replace(/\n/g, "<br />")

  return `<pre class="bg-gray-100 p-4 rounded-md">${highlighted}</pre>`
}

// 툴 코드 생성 함수들
function generateAPKBuilderCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function APKBuilder() {
  const [projectPath, setProjectPath] = useState('');
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleBuild = async () => {
    setIsBuilding(true);
    setBuildProgress(0);
    
    const steps = [
      'Dependencies 설치 중...',
      'React Native 번들링...',
      'Android 빌드 시작...',
      'APK 생성 중...',
      '빌드 완료!'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBuildProgress((i + 1) * 20);
    }
    
    setDownloadUrl('/downloads/app-release.apk');
    setIsBuilding(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>APK 빌더</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="프로젝트 경로"
          value={projectPath}
          onChange={(e) => setProjectPath(e.target.value)}
        />
        
        {isBuilding && (
          <div className="space-y-2">
            <Progress value={buildProgress} />
            <p className="text-sm text-muted-foreground">빌드 진행 중... {buildProgress}%</p>
          </div>
        )}
        
        <Button 
          onClick={handleBuild} 
          disabled={!projectPath || isBuilding}
          className="w-full"
        >
          {isBuilding ? '빌드 중...' : 'APK 빌드'}
        </Button>
        
        {downloadUrl && (
          <Button variant="outline" className="w-full bg-transparent">
            <a href={downloadUrl} download>APK 다운로드</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateCrossPlatformTesterCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CrossPlatformTester() {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const platforms = ['iOS', 'Android', 'Web'];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const platform of selectedPlatforms) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTestResults(prev => [...prev, {
        platform,
        status: Math.random() > 0.2 ? 'passed' : 'failed',
        tests: Math.floor(Math.random() * 50) + 20,
        time: Math.floor(Math.random() * 30) + 10
      }]);
    }
    
    setIsRunning(false);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>크로스플랫폼 테스터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">테스트 플랫폼 선택</label>
          <div className="flex gap-2 mt-2">
            {platforms.map(platform => (
              <Button
                key={platform}
                variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPlatforms(prev => 
                    prev.includes(platform) 
                      ? prev.filter(p => p !== platform)
                      : [...prev, platform]
                  );
                }}
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={runTests} 
          disabled={selectedPlatforms.length === 0 || isRunning}
          className="w-full"
        >
          {isRunning ? '테스트 실행 중...' : '테스트 시작'}
        </Button>
        
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">테스트 결과</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span>{result.platform}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {result.tests} tests, {result.time}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateGoogleAPIIntegratorCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GoogleAPIIntegrator() {
  const [apiKey, setApiKey] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const services = [
    'Google Maps API',
    'Google Drive API',
    'Google Sheets API',
    'Google Calendar API',
    'Google Cloud Storage',
    'Firebase Auth'
  ];

  const testConnection = async () => {
    setIsConnecting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3;
    setTestResult(success 
      ? \`✅ \${serviceType} 연결 성공! API 키가 유효합니다.\`
      : \`❌ \${serviceType} 연결 실패. API 키를 확인해주세요.\`
    );
    
    setIsConnecting(false);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Google API 통합기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Google API 키"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger>
            <SelectValue placeholder="서비스 선택" />
          </SelectTrigger>
          <SelectContent>
            {services.map(service => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={testConnection} 
          disabled={!apiKey || !serviceType || isConnecting}
          className="w-full"
        >
          {isConnecting ? '연결 테스트 중...' : '연결 테스트'}
        </Button>
        
        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateComponentGeneratorCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ComponentGenerator() {
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState('');
  const [props, setProps] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const componentTypes = ['Functional Component', 'Class Component', 'Hook', 'Context'];

  const generateComponent = () => {
    const propsArray = props.split(',').map(p => p.trim()).filter(Boolean);
    
    const code = \`import React from 'react';

interface \${componentName}Props {
\${propsArray.map(prop => \`  \${prop}: any;\`).join('\n')}
}

export function \${componentName}({ \${propsArray.join(', ')} }: \${componentName}Props) {
  return (
    <div className="\${componentName.toLowerCase()}">
      <h1>\${componentName} Component</h1>
      \${propsArray.map(prop => \`<p>\${prop}: {\${prop}}</p>\`).join('\n      ')}
    </div>
  );
}\`;
    
    setGeneratedCode(code);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>React 컴포넌트 생성기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="컴포넌트 이름"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        />
        
        <Select value={componentType} onValueChange={setComponentType}>
          <SelectTrigger>
            <SelectValue placeholder="컴포넌트 타입" />
          </SelectTrigger>
          <SelectContent>
            {componentTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Props (쉼표로 구분)"
          value={props}
          onChange={(e) => setProps(e.target.value)}
        />
        
        <Button 
          onClick={generateComponent} 
          disabled={!componentName || !componentType}
          className="w-full"
        >
          컴포넌트 생성
        </Button>
        
        {generatedCode && (
          <Textarea
            value={generatedCode}
            readOnly
            rows={15}
            className="font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateWebDeploymentCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function WebDeployment() {
  const [deployTarget, setDeployTarget] = useState('');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [environment, setEnvironment] = useState('');
  const [deployProgress, setDeployProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');

  const deployTargets = ['Vercel', 'Netlify', 'AWS S3', 'GitHub Pages'];
  const environments = ['production', 'staging', 'development'];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);
    
    const steps = [
      '빌드 시작...',
      '의존성 설치...',
      '애플리케이션 빌드...',
      '배포 준비...',
      '배포 완료!'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeployProgress((i + 1) * 20);
    }
    
    setDeployUrl(\`https://\${deployTarget.toLowerCase()}-app-\${Date.now()}.com\`);
    setIsDeploying(false);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>웹 배포 도구</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={deployTarget} onValueChange={setDeployTarget}>
          <SelectTrigger>
            <SelectValue placeholder="배포 대상 선택" />
          </SelectTrigger>
          <SelectContent>
            {deployTargets.map(target => (
              <SelectItem key={target} value={target}>
                {target}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          placeholder="빌드 명령어"
          value={buildCommand}
          onChange={(e) => setBuildCommand(e.target.value)}
        />
        
        <Select value={environment} onValueChange={setEnvironment}>
          <SelectTrigger>
            <SelectValue placeholder="환경 선택" />
          </SelectTrigger>
          <SelectContent>
            {environments.map(env => (
              <SelectItem key={env} value={env}>
                {env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {isDeploying && (
          <div className="space-y-2">
            <Progress value={deployProgress} />
            <p className="text-sm text-muted-foreground">배포 진행 중... {deployProgress}%</p>
          </div>
        )}
        
        <Button 
          onClick={handleDeploy} 
          disabled={!deployTarget || !environment || isDeploying}
          className="w-full"
        >
          {isDeploying ? '배포 중...' : '배포 시작'}
        </Button>
        
        {deployUrl && (
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">
              배포 완료! <a href={deployUrl} target="_blank" className="underline">{deployUrl}</a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateUniversalToolCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UniversalTool() {
  const [taskType, setTaskType] = useState('');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const taskTypes = [
    '텍스트 처리',
    '데이터 변환',
    '파일 처리',
    '계산',
    '검증',
    '기타'
  ];

  const executeTask = async () => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let taskResult = '';
    switch (taskType) {
      case '텍스트 처리':
        taskResult = \`텍스트 처리 완료:
입력 길이: \${input.length}자
단어 수: \${input.split(' ').length}개
처리된 텍스트: \${input.toUpperCase()}\`;
        break;
      case '데이터 변환':
        taskResult = \`데이터 변환 완료:
원본 형식: 텍스트
변환 형식: JSON
결과: {"data": "\${input}"}\`;
        break;
      case '계산':
        try {
          const calcResult = eval(input);
          taskResult = \`계산 결과: \${calcResult}\`;
        } catch {
          taskResult = '계산 오류: 올바른 수식을 입력해주세요.';
        }
        break;
      default:
        taskResult = \`\${taskType} 작업이 완료되었습니다.
입력: \${input}
처리 시간: 2초\`;
    }
    
    setResult(taskResult);
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>범용 작업 도구</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={taskType} onValueChange={setTaskType}>
          <SelectTrigger>
            <SelectValue placeholder="작업 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            {taskTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Textarea
          placeholder="작업할 내용을 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
        />
        
        <Button 
          onClick={executeTask}
          disabled={!taskType || !input || isProcessing}
          className="w-full"
        >
          {isProcessing ? '처리 중...' : '작업 실행'}
        </Button>
        
        {result && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-2">실행 결과</h4>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}
