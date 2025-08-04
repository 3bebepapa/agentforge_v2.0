"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Save,
  Play,
  Settings,
  Braces,
  FolderOpen,
  Code,
  TestTube,
  Rocket,
  Plus,
  Bot,
  Workflow,
  Users,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 통합 컴포넌트
import ComponentMenu from "@/components/unified-studio/component-menu"
import ProcessEditor from "@/components/unified-studio/process-editor"
import WorkflowEditor from "@/components/unified-studio/workflow-editor"
import FlowEditor from "@/components/unified-studio/flow-editor"
import PropertiesPanel from "@/components/unified-studio/properties-panel"
import AIAssistant from "@/components/unified-studio/ai-assistant"
import ExecutionPanel from "@/components/unified-studio/execution-panel"

// 에이전트 관련 컴포넌트 추가
import { AgentWorkspace } from "@/components/agent-workspace"
import { ComponentAutomator } from "@/components/component-automator"

export default function UnifiedStudio() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "process"
  const promptFromParams = searchParams.get("prompt") || ""

  // 통합 상태 관리
  const [name, setName] = useState("새 프로젝트")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("sequential")
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [executionResults, setExecutionResults] = useState(null)
  const [activeTab, setActiveTab] = useState("design")
  const [activeMode, setActiveMode] = useState(mode)

  // 프로젝트 관리 상태
  const [projects, setProjects] = useState([
    { id: "1", name: "마케팅 자동화", type: "workflow", status: "active" },
    { id: "2", name: "데이터 분석 파이프라인", type: "process", status: "draft" },
    { id: "3", name: "고객 서비스 봇", type: "agent", status: "deployed" },
    { id: "4", name: "컨텐츠 생성 팀", type: "team", status: "active" },
    { id: "5", name: "API 통합 컴포넌트", type: "component", status: "ready" },
  ])

  // API 키 상태 (실제로는 상위에서 전달받아야 함)
  const [apiKey, setApiKey] = useState("")

  // 모드에 따른 제목 설정
  useEffect(() => {
    if (mode === "process") {
      setName("새 프로세스")
    } else if (mode === "workflow") {
      setName("새 워크플로우")
    } else if (mode === "flow") {
      setName("새 플로우")
    } else if (mode === "agent") {
      setName("새 에이전트")
    } else if (mode === "team") {
      setName("새 팀")
    } else if (mode === "component") {
      setName("새 컴포넌트")
    }
  }, [mode])

  // 모드 변경 처리
  const handleModeChange = (newMode) => {
    setActiveMode(newMode)
    router.push(`/unified-studio?mode=${newMode}`)
  }

  // 저장 처리
  const handleSave = async () => {
    try {
      const response = await fetch("/api/unified-studio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          type,
          nodes,
          edges,
          mode: activeMode,
        }),
      })

      if (!response.ok) {
        throw new Error("저장 실패")
      }

      const result = await response.json()

      toast({
        title: "저장 성공",
        description: `${name}이(가) 저장되었습니다.`,
      })

      return result
    } catch (error) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // 실행 처리
  const handleExecute = async () => {
    try {
      const response = await fetch("/api/unified-studio/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          type,
          nodes,
          edges,
          mode: activeMode,
        }),
      })

      if (!response.ok) {
        throw new Error("실행 실패")
      }

      const result = await response.json()
      setExecutionResults(result)

      toast({
        title: "실행 성공",
        description: `${name} 실행이 완료되었습니다.`,
      })

      return result
    } catch (error) {
      toast({
        title: "실행 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // AI 어시스턴트 토글
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant)
  }

  // AI 생성 처리
  const handleAIGenerate = async (prompt) => {
    try {
      const response = await fetch("/api/unified-studio/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode: activeMode,
        }),
      })

      if (!response.ok) {
        throw new Error("AI 생성 실패")
      }

      const result = await response.json()

      // 생성된 결과로 상태 업데이트
      setName(result.name)
      setDescription(result.description)
      setType(result.type)
      setNodes(result.nodes)
      setEdges(result.edges)

      toast({
        title: "AI 생성 성공",
        description: `${result.name}이(가) 생성되었습니다.`,
      })

      return result
    } catch (error) {
      toast({
        title: "AI 생성 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // 프로젝트 타입별 아이콘
  const getProjectIcon = (type) => {
    switch (type) {
      case "workflow":
        return <Workflow className="h-4 w-4 text-blue-500" />
      case "process":
        return <Settings className="h-4 w-4 text-green-500" />
      case "agent":
        return <Bot className="h-4 w-4 text-purple-500" />
      case "team":
        return <Users className="h-4 w-4 text-orange-500" />
      case "component":
        return <Code className="h-4 w-4 text-indigo-500" />
      default:
        return <FolderOpen className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 왼쪽 사이드바: 프로젝트 관리 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">통합 스튜디오</h2>
          <Button className="w-full mt-2" onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />새 프로젝트
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{project.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getProjectIcon(project.type)}
                        <span className="text-xs text-gray-500">{project.type}</span>
                      </div>
                    </div>
                    <Badge variant={project.status === "deployed" ? "default" : "secondary"}>{project.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 컴포넌트 메뉴 */}
        <div className="border-t">
          <ComponentMenu
            context={activeMode}
            onSelectComponent={(component) => {
              const newNode = {
                id: `node-${Date.now()}`,
                type: component.type,
                data: {
                  label: component.name,
                  componentId: component.id,
                  ...component.metadata,
                },
                position: {
                  x: Math.random() * 300 + 100,
                  y: Math.random() * 300 + 100,
                },
              }

              setNodes((nds) => [...nds, newNode])

              toast({
                title: "컴포넌트 추가됨",
                description: `${component.name}이(가) 추가되었습니다.`,
              })
            }}
          />
        </div>
      </div>

      {/* 중앙: 메인 작업 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 도구 모음 */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Input
              className="w-64"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프로젝트 이름"
            />
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                저장
              </Button>
              <Button onClick={handleExecute}>
                <Play className="mr-2 h-4 w-4" />
                실행
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={toggleAIAssistant}>
              <Braces className="mr-2 h-4 w-4" />
              AI 어시스턴트
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              설정
            </Button>
          </div>
        </div>

        {/* 모드 선택 탭 - 확장된 버전 */}
        <div className="bg-white border-b border-gray-200 px-4">
          <Tabs value={activeMode} onValueChange={handleModeChange}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="process">
                <Settings className="h-4 w-4 mr-1" />
                프로세스
              </TabsTrigger>
              <TabsTrigger value="workflow">
                <Workflow className="h-4 w-4 mr-1" />
                워크플로우
              </TabsTrigger>
              <TabsTrigger value="flow">
                <Zap className="h-4 w-4 mr-1" />
                플로우
              </TabsTrigger>
              <TabsTrigger value="agent">
                <Bot className="h-4 w-4 mr-1" />
                에이전트
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-1" />팀
              </TabsTrigger>
              <TabsTrigger value="component">
                <Code className="h-4 w-4 mr-1" />
                컴포넌트
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 작업 탭 */}
        <div className="bg-white border-b border-gray-200 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="design">
                <FolderOpen className="h-4 w-4 mr-2" />
                디자인
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-2" />
                코드
              </TabsTrigger>
              <TabsTrigger value="test">
                <TestTube className="h-4 w-4 mr-2" />
                테스트
              </TabsTrigger>
              <TabsTrigger value="deploy">
                <Rocket className="h-4 w-4 mr-2" />
                배포
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="design" className="h-full m-0">
              <div className="h-full">
                {activeMode === "process" && (
                  <ProcessEditor
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={setNodes}
                    onEdgesChange={setEdges}
                    onNodeSelect={setSelectedNode}
                  />
                )}
                {activeMode === "workflow" && (
                  <WorkflowEditor
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={setNodes}
                    onEdgesChange={setEdges}
                    onNodeSelect={setSelectedNode}
                  />
                )}
                {activeMode === "flow" && (
                  <FlowEditor
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={setNodes}
                    onEdgesChange={setEdges}
                    onNodeSelect={setSelectedNode}
                  />
                )}
                {activeMode === "agent" && (
                  <div className="h-full">
                    <AgentWorkspace apiKey={apiKey} />
                  </div>
                )}
                {activeMode === "team" && (
                  <div className="p-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />팀 에이전트 설정
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">팀 이름</label>
                          <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">팀 목적</label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="이 팀이 수행할 작업과 목표를 설명하세요"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">협업 방식</label>
                          <select className="w-full mt-1 p-2 border rounded">
                            <option value="sequential">순차 실행</option>
                            <option value="parallel">병렬 실행</option>
                            <option value="collaborative">협업 실행</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                {activeMode === "component" && (
                  <div className="h-full">
                    <ComponentAutomator apiKey={apiKey} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="code" className="h-full m-0">
              <div className="p-8">
                <Card>
                  <CardHeader>
                    <CardTitle>생성된 코드</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                      <code>{`// 생성된 코드가 여기에 표시됩니다
export function ${name.replace(/\s+/g, "")}() {
  // ${activeMode} 로직
  return {
    name: "${name}",
    description: "${description}",
    type: "${activeMode}",
    nodes: ${JSON.stringify(nodes, null, 2)},
    edges: ${JSON.stringify(edges, null, 2)}
  }
}`}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="test" className="h-full m-0">
              <div className="p-8">
                <Card>
                  <CardHeader>
                    <CardTitle>테스트 실행</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button onClick={handleExecute}>
                        <Play className="h-4 w-4 mr-2" />
                        테스트 실행
                      </Button>
                      {executionResults && (
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <pre>{JSON.stringify(executionResults, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deploy" className="h-full m-0">
              <div className="p-8">
                <Card>
                  <CardHeader>
                    <CardTitle>배포 설정</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">배포 환경</label>
                        <select className="w-full mt-1 p-2 border rounded">
                          <option>개발 환경</option>
                          <option>스테이징 환경</option>
                          <option>프로덕션 환경</option>
                        </select>
                      </div>
                      <Button>
                        <Rocket className="h-4 w-4 mr-2" />
                        배포하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 실행 결과 패널 (조건부 렌더링) */}
        {executionResults && <ExecutionPanel results={executionResults} onClose={() => setExecutionResults(null)} />}
      </div>

      {/* 오른쪽 패널: 속성 편집 또는 AI 어시스턴트 */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        {showAIAssistant ? (
          <AIAssistant onGenerate={handleAIGenerate} initialPrompt={promptFromParams} />
        ) : (
          <PropertiesPanel
            node={selectedNode}
            onChange={(updatedData) => {
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id === selectedNode?.id) {
                    return { ...n, data: { ...n.data, ...updatedData } }
                  }
                  return n
                }),
              )
            }}
          />
        )}
      </div>
    </div>
  )
}
