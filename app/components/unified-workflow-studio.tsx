"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ReactFlow, { Background, Controls, MiniMap, addEdge, applyEdgeChanges, applyNodeChanges, Panel } from "reactflow"
import "reactflow/dist/style.css"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Play, FileSymlink, Settings, Code, Wand2, Layers, MessageSquare, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// 통합 컴포넌트 메뉴 임포트
import ComponentMenu from "@/components/component-menu"
import { PropertiesPanel } from "@/components/properties-panel"
import { createNodeFromComponent } from "@/lib/node-utils"
import { generateWorkflow, executeWorkflow, generateCode } from "@/lib/workflow-engine"
import { WorkflowResultPanel } from "@/components/workflow-result-panel"
import { CodePanel } from "@/components/code-panel"

// 노드 타입 정의
const nodeTypes = {
  // 노드 타입 컴포넌트들 (기존 코드에서 가져옴)
}

export default function UnifiedWorkflowStudio() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const promptFromParams = searchParams.get("prompt") || ""

  // 워크플로우 상태
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [workflowName, setWorkflowName] = useState("새 워크플로우")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [workflowType, setWorkflowType] = useState("sequential")

  // UI 상태
  const [activeTab, setActiveTab] = useState("design")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")

  // 결과 상태
  const [executionResults, setExecutionResults] = useState(null)
  const [generatedCode, setGeneratedCode] = useState(null)

  // 프롬프트 파라미터가 있으면 AI 다이얼로그 표시
  useEffect(() => {
    if (promptFromParams) {
      setAiPrompt(promptFromParams)
      setShowAIDialog(true)
    }
  }, [promptFromParams])

  // 노드 변경 처리
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [])

  // 엣지 변경 처리
  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds))
  }, [])

  // 연결 처리
  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge(connection, eds))
  }, [])

  // 노드 선택 처리
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  // 배경 클릭 처리
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // 컴포넌트 선택 처리
  const handleSelectComponent = useCallback(
    (component) => {
      // 컴포넌트를 노드로 변환하여 추가
      const newNode = createNodeFromComponent(component, {
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 300 + 100,
        },
      })

      setNodes((nds) => [...nds, newNode])

      toast({
        title: "컴포넌트 추가됨",
        description: `${component.name}이(가) 워크플로우에 추가되었습니다.`,
      })
    },
    [toast],
  )

  // AI로 워크플로우 생성
  const handleGenerateWorkflow = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "프롬프트 필요",
        description: "워크플로우 생성을 위한 프롬프트를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateWorkflow(aiPrompt)

      setNodes(result.nodes)
      setEdges(result.edges)
      setWorkflowName(result.name || "새 워크플로우")
      setWorkflowDescription(result.description || "")
      setWorkflowType(result.type || "sequential")

      setShowAIDialog(false)

      toast({
        title: "워크플로우 생성 완료",
        description: "AI가 워크플로우를 생성했습니다. 필요에 따라 수정하세요.",
      })
    } catch (error) {
      toast({
        title: "생성 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // 워크플로우 실행
  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: "노드 필요",
        description: "실행할 워크플로우 노드가 없습니다.",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setActiveTab("results")

    try {
      const results = await executeWorkflow(nodes, edges)
      setExecutionResults(results)

      toast({
        title: "워크플로우 실행 완료",
        description: `${results.steps.length}개 단계가 실행되었습니다.`,
      })
    } catch (error) {
      toast({
        title: "실행 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // 코드 생성
  const handleGenerateCode = async () => {
    if (nodes.length === 0) {
      toast({
        title: "노드 필요",
        description: "코드를 생성할 워크플로우 노드가 없습니다.",
        variant: "destructive",
      })
      return
    }

    setActiveTab("code")

    try {
      const code = await generateCode(nodes, edges, workflowType)
      setGeneratedCode(code)

      toast({
        title: "코드 생성 완료",
        description: "워크플로우 코드가 생성되었습니다.",
      })
    } catch (error) {
      toast({
        title: "코드 생성 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // 워크플로우 저장
  const handleSaveWorkflow = async () => {
    try {
      // API를 통해 워크플로우 저장
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          type: workflowType,
          nodes,
          edges,
        }),
      })

      if (!response.ok) throw new Error("워크플로우 저장 실패")

      const result = await response.json()

      toast({
        title: "워크플로우 저장됨",
        description: `워크플로우 ID: ${result.id}`,
      })
    } catch (error) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // 통합 인터페이스로 내보내기
  const handleExportToIntegratedInterface = () => {
    router.push(`/integrated-interface?workflowId=${encodeURIComponent(workflowName)}`)
  }

  // 에이전트로 내보내기
  const handleExportToAgent = () => {
    router.push(`/agent?workflowId=${encodeURIComponent(workflowName)}`)
  }

  return (
    <div className="flex h-screen">
      {/* 왼쪽 패널: 통합 컴포넌트 메뉴 */}
      <div className="w-80 border-r overflow-y-auto">
        <ComponentMenu
          context="workflow-studio"
          onSelectComponent={handleSelectComponent}
          className="border-0 rounded-none"
        />
      </div>

      {/* 중앙: 워크플로우 에디터 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 도구 모음 */}
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Input
              className="w-64"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="워크플로우 이름"
            />
            <Button variant="outline" onClick={handleSaveWorkflow}>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
            <Button onClick={handleExecuteWorkflow} disabled={isExecuting}>
              <Play className="mr-2 h-4 w-4" />
              실행
            </Button>
            <Button variant="outline" onClick={() => setShowAIDialog(true)}>
              <Wand2 className="mr-2 h-4 w-4" />
              AI 생성
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExportToIntegratedInterface}>
              <FileSymlink className="mr-2 h-4 w-4" />
              통합 인터페이스로 내보내기
            </Button>
            <Button variant="outline" onClick={handleExportToAgent}>
              <MessageSquare className="mr-2 h-4 w-4" />
              에이전트로 내보내기
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              설정
            </Button>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="px-4 pt-2 border-b">
            <TabsTrigger value="design">디자인</TabsTrigger>
            <TabsTrigger value="results">실행 결과</TabsTrigger>
            <TabsTrigger value="code">코드</TabsTrigger>
            <TabsTrigger value="history">기록</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="flex-1 p-0">
            <div className="h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />

                <Panel position="top-right" className="bg-background border rounded-md shadow-sm p-2">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("results")}>
                      <Layers className="mr-2 h-4 w-4" />
                      결과 보기
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleGenerateCode}>
                      <Code className="mr-2 h-4 w-4" />
                      코드 생성
                    </Button>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 p-4 overflow-auto">
            {isExecuting ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>워크플로우 실행 중...</p>
                </div>
              </div>
            ) : executionResults ? (
              <WorkflowResultPanel results={executionResults} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="mb-4">워크플로우를 실행하여 결과를 확인하세요</p>
                  <Button onClick={handleExecuteWorkflow}>
                    <Play className="mr-2 h-4 w-4" />
                    워크플로우 실행
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="flex-1 p-4 overflow-auto">
            {generatedCode ? (
              <CodePanel code={generatedCode} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="mb-4">워크플로우 코드를 생성하세요</p>
                  <Button onClick={handleGenerateCode}>
                    <Code className="mr-2 h-4 w-4" />
                    코드 생성
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 p-4 overflow-auto">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">실행 기록</h3>
                <div className="text-muted-foreground text-center py-8">실행 기록이 없습니다</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 오른쪽 패널: 속성 편집 */}
      <div className="w-80 border-l p-4 overflow-y-auto">
        <h2 className="text-lg font-medium mb-4">속성</h2>
        {selectedNode ? (
          <PropertiesPanel
            node={selectedNode}
            onChange={(updatedData) => {
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id === selectedNode.id) {
                    return { ...n, data: { ...n.data, ...updatedData } }
                  }
                  return n
                }),
              )
            }}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">워크플로우 설명</label>
              <Textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="워크플로우에 대한 설명을 입력하세요"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">워크플로우 유형</label>
              <select
                className="w-full border rounded-md p-2 mt-1"
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
              >
                <option value="sequential">순차 실행</option>
                <option value="parallel">병렬 실행</option>
                <option value="conditional">조건부 실행</option>
              </select>
            </div>

            <div className="text-muted-foreground mt-8">노드를 선택하여 속성을 편집하세요</div>
          </div>
        )}
      </div>

      {/* AI 워크플로우 생성 다이얼로그 */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI로 워크플로우 생성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">프롬프트</label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="원하는 워크플로우를 설명하세요. 예: '새 사용자가 등록하면 환영 이메일을 보내고 CRM에 고객 정보를 추가하는 워크플로우'"
                rows={6}
              />
            </div>

            <div>
              <label className="text-sm font-medium">워크플로우 유형</label>
              <select
                className="w-full border rounded-md p-2 mt-1"
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
              >
                <option value="sequential">순차 실행</option>
                <option value="parallel">병렬 실행</option>
                <option value="conditional">조건부 실행</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                AI가 프롬프트를 분석하여 워크플로우를 자동으로 생성합니다
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              취소
            </Button>
            <Button onClick={handleGenerateWorkflow} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  워크플로우 생성
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
