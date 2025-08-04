"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, Users, User, Terminal, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AgentModalProps {
  open: boolean
  onClose: () => void
  onSave: (agentData: any) => void
}

export function AgentModal({ open, onClose, onSave }: AgentModalProps) {
  const [agentMode, setAgentMode] = useState<"single" | "team">("single")
  const [agentData, setAgentData] = useState({
    name: "",
    type: "자율형 멀티 에이전트",
    description: "",
    promptTemplate: "",
    code: "",
  })
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [outputFormat, setOutputFormat] = useState<"console" | "markdown">("console")

  const handleInputChange = (field: string, value: string) => {
    setAgentData((prev) => ({ ...prev, [field]: value }))
  }

  const generatePromptFromDescription = async () => {
    if (!agentData.description || isGeneratingPrompt) return

    setIsGeneratingPrompt(true)
    try {
      // 실제 구현에서는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const generatedPrompt = `당신은 ${agentData.description}입니다. 사용자의 요청에 따라 최선의 결과를 제공하세요.`
      setAgentData((prev) => ({ ...prev, promptTemplate: generatedPrompt }))

      // 프롬프트 생성 후 바로 코드 생성 시작
      setIsGeneratingCode(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const generatedCode = `
/**
 * 이름: ${agentData.name || "Agent"}
 * 설명: ${agentData.description}
 */
class Agent {
  constructor() {
    this.type = "${agentData.type}";
    this.tasks = [];
    this.results = [];
  }

  process(input) {
    this.tasks = this.generateTasks(input);
    this.executeTask();
    return this.generateResults();
  }

  generateTasks(input) {
    // 작업 생성 로직
    return ["작업1", "작업2", "작업3"];
  }

  executeTask() {
    // 작업 실행 로직
    console.log("작업 실행 중...");
  }

  generateResults() {
    // 결과 생성 로직
    return "작업 완료!";
  }
}
`
        setAgentData((prev) => ({ ...prev, code: generatedCode }))
      } catch (error) {
        console.error("코드 생성 오류:", error)
      } finally {
        setIsGeneratingCode(false)
      }
    } catch (error) {
      console.error("프롬프트 생성 오류:", error)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleSubmit = () => {
    onSave(agentData)
    onClose()
  }

  const agentTypes = [
    { value: "자율형 멀티 에이전트", label: "자율형 멀티 에이전트" },
    { value: "다른 에이전트와 협업 가능한 자율형 에이전트", label: "다른 에이전트와 협업 가능한 자율형 에이전트" },
  ]

  const exampleTemplates = [
    {
      title: "개발자 에이전트",
      description: "코드를 작성하고 기술적 문제를 해결하는 에이전트입니다.",
    },
    {
      title: "코디네이터 에이전트",
      description: "다른 에이전트들의 작업을 조율하고 관리하는 에이전트입니다.",
    },
    {
      title: "데이터 분석 에이전트",
      description: "데이터를 분석하고 인사이트를 도출하는 에이전트입니다.",
    },
  ]

  // 마크다운 형식으로 변환하는 함수
  function formatMarkdown(code: string): string {
    // 간단한 마크다운 변환
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
      .replace(/\/\*\*([\s\S]*?)\*\//g, '<span class="text-green-500">/**$1*/</span>')
      .replace(/\/\/(.*)/g, '<span class="text-gray-500">// $1</span>')
      .replace(/return/g, '<strong class="text-blue-600">return</strong>')
      .replace(/this\./g, '<span class="text-red-500">this.</span>')
      .replace(/\n/g, "<br />")

    return `<pre class="bg-gray-100 p-4 rounded-md">${highlighted}</pre>`
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 에이전트 생성</DialogTitle>
        </DialogHeader>

        {/* 상단 에이전트 모드 선택 버튼 */}
        <div className="flex space-x-2 mb-6">
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

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={agentData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="에이전트 이름"
                className="mt-1"
              />
            </div>

            <div>
              <Label>유형</Label>
              <RadioGroup
                value={agentData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                className="mt-2 space-y-2"
              >
                {agentTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={agentData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="에이전트 설명"
                className="mt-1 min-h-[100px]"
              />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  onClick={generatePromptFromDescription}
                  disabled={isGeneratingPrompt || isGeneratingCode || !agentData.description}
                >
                  {isGeneratingPrompt || isGeneratingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> AI 에이전트 생성 중...
                    </>
                  ) : (
                    <>AI 에이전트 생성</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  설명을 입력하고 버튼을 클릭하면 AI가 프롬프트와 코드를 생성합니다.
                </p>
              </div>
            </div>

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
                placeholder="에이전트 프롬프트 템플릿 (자동 생성되거나 직접 작성)"
                className="mt-1 min-h-[120px]"
              />
            </div>

            <div className="space-y-4">
              <Label>예시 템플릿</Label>
              <div className="space-y-2">
                {exampleTemplates.map((template, index) => (
                  <Card
                    key={index}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => {
                      handleInputChange("name", template.title)
                      handleInputChange("description", template.description)
                    }}
                  >
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="border rounded-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">코드</h3>
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
                <Tabs defaultValue="editor" className="w-auto ml-2">
                  <TabsList className="grid w-[180px] grid-cols-2">
                    <TabsTrigger value="editor">코드 편집</TabsTrigger>
                    <TabsTrigger value="settings">코드 설정</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="relative">
              {outputFormat === "console" ? (
                <Textarea
                  value={agentData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className="font-mono text-sm p-4 min-h-[500px] resize-none border-0 focus-visible:ring-0"
                  placeholder="에이전트 코드 (자동 생성되거나 직접 작성)"
                />
              ) : (
                <div className="p-4 min-h-[500px] overflow-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(agentData.code) }}
                  />
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

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="button" onClick={handleSubmit}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
