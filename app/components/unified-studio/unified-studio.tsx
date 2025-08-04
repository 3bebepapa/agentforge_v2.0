"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Play, Settings, Braces } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 통합 컴포넌트
import ComponentMenu from "@/components/unified-studio/component-menu"
import ProcessEditor from "@/components/unified-studio/process-editor"
import WorkflowEditor from "@/components/unified-studio/workflow-editor"
import FlowEditor from "@/components/unified-studio/flow-editor"
import PropertiesPanel from "@/components/unified-studio/properties-panel"
import AIAssistant from "@/components/unified-studio/ai-assistant"
import ExecutionPanel from "@/components/unified-studio/execution-panel"

export default function UnifiedStudio() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "process" // process, workflow, flow
  const promptFromParams = searchParams.get("prompt") || ""

  // 통합 상태 관리
  const [name, setName] = useState("새 프로세스")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("sequential")
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [executionResults, setExecutionResults] = useState(null)
  const [activeTab, setActiveTab] = useState(mode)

  // 모드에 따른 제목 설정
  useEffect(() => {
    if (mode === "process") {
      setName("새 프로세스")
    } else if (mode === "workflow") {
      setName("새 워크플로우")
    } else if (mode === "flow") {
      setName("새 플로우")
    }
  }, [mode])

  // 모드 변경 처리
  const handleModeChange = (newMode) => {
    setActiveTab(newMode)
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
          mode: activeTab,
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
          mode: activeTab,
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
          mode: activeTab,
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

  return (
    <div className="flex h-screen">
      {/* 왼쪽 패널: 통합 컴포넌트 메뉴 */}
      <div className="w-80 border-r overflow-y-auto">
        <ComponentMenu
          context={activeTab}
          onSelectComponent={(component) => {
            // 컴포넌트를 노드로 변환하여 추가
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

      {/* 중앙: 통합 에디터 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 도구 모음 */}
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Input className="w-64" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
            <Button onClick={handleExecute}>
              <Play className="mr-2 h-4 w-4" />
              실행
            </Button>
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

        {/* 에디터 영역 */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={handleModeChange} className="w-full">
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="process">프로세스 스튜디오</TabsTrigger>
              <TabsTrigger value="workflow">워크플로우</TabsTrigger>
              <TabsTrigger value="flow">플로우 빌더</TabsTrigger>
            </TabsList>

            <TabsContent value="process" className="flex-1 p-0 m-0">
              <ProcessEditor
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onNodeSelect={setSelectedNode}
              />
            </TabsContent>

            <TabsContent value="workflow" className="flex-1 p-0 m-0">
              <WorkflowEditor
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onNodeSelect={setSelectedNode}
              />
            </TabsContent>

            <TabsContent value="flow" className="flex-1 p-0 m-0">
              <FlowEditor
                nodes={nodes}
                edges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
                onNodeSelect={setSelectedNode}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* 실행 결과 패널 (조건부 렌더링) */}
        {executionResults && <ExecutionPanel results={executionResults} onClose={() => setExecutionResults(null)} />}
      </div>

      {/* 오른쪽 패널: 속성 편집 또는 AI 어시스턴트 */}
      <div className="w-80 border-l overflow-y-auto">
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
