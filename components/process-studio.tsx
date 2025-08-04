"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Play, Download, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProcessStudioRunner } from "./process-studio-runner"
import { ProcessStudioExporter } from "./process-studio-exporter"
import ComponentMenu from "./component-menu"
import { PropertiesPanel } from "./properties-panel"

interface FlowNode {
  id: string
  type: string
  data: { label: string; [key: string]: any }
  position: { x: number; y: number }
}

interface FlowEdge {
  id: string
  source: string
  target: string
}

// 노드 유틸리티 함수
const createNode = (options: Partial<FlowNode>): FlowNode => {
  const { type, data, position } = options
  return {
    id: `node_${Math.random().toString(36).substring(2, 9)}`,
    type: type || "default",
    data: data || { label: "새 노드" },
    position: position || { x: 100, y: 100 },
  }
}

export function ProcessStudio() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const promptFromParams = searchParams.get("prompt") || ""

  // 워크플로우 상태
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [edges, setEdges] = useState<FlowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [workflowName, setWorkflowName] = useState("새 워크플로우")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [activeTab, setActiveTab] = useState("editor")

  // 프로세스 데이터
  const [processData, setProcessData] = useState({
    version: "1.0",
    metadata: {
      exportedAt: new Date().toISOString(),
      source: "AgentForge",
      description: "AgentForge 프로세스 스튜디오에서 생성된 워크플로우",
    },
    components: [],
    workflows: [
      {
        id: `wf_${Math.random().toString(36).substring(2, 9)}`,
        name: "새 워크플로우",
        description: "새로 생성된 워크플로우",
        steps: [
          { id: "step_1", name: "시작", description: "워크플로우 시작 지점" },
          { id: "step_2", name: "처리", description: "데이터 처리 단계" },
          { id: "step_3", name: "종료", description: "워크플로우 종료 지점" },
        ],
      },
    ],
    tasks: [],
  })

  // 프롬프트 파라미터가 있으면 초기 노드 생성
  useEffect(() => {
    if (promptFromParams) {
      const promptNode = createNode({
        type: "prompt",
        data: { label: "프롬프트", content: promptFromParams },
        position: { x: 250, y: 100 },
      })

      setNodes([promptNode])
    } else {
      // 기본 노드 생성
      setNodes([
        createNode({
          type: "default",
          data: { label: "시작" },
          position: { x: 100, y: 100 },
        }),
        createNode({
          type: "default",
          data: { label: "처리" },
          position: { x: 250, y: 200 },
        }),
        createNode({
          type: "default",
          data: { label: "종료" },
          position: { x: 400, y: 100 },
        }),
      ])
    }
  }, [promptFromParams])

  // 노드 추가
  const addNode = () => {
    const newNode = createNode({
      type: "default",
      data: { label: "새 노드" },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
    })
    setNodes([...nodes, newNode])
  }

  // 컴포넌트 선택 처리
  const handleSelectComponent = (component: any) => {
    const newNode = createNode({
      type: component.type || "default",
      data: {
        label: component.name,
        componentId: component.id,
        ...component.metadata,
      },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
    })

    setNodes([...nodes, newNode])

    setProcessData((prev) => ({
      ...prev,
      components: [...prev.components, component],
    }))

    toast({
      title: "컴포넌트 추가됨",
      description: `${component.name}이(가) 워크플로우에 추가되었습니다.`,
    })
  }

  // 워크플로우 저장
  const saveWorkflow = () => {
    const updatedWorkflow = {
      ...processData.workflows[0],
      name: workflowName,
      description: workflowDescription,
      steps: nodes.map((node) => ({
        id: node.id,
        name: node.data.label,
        type: node.type,
        position: node.position,
        componentRef: node.data.componentId,
      })),
    }

    setProcessData((prev) => ({
      ...prev,
      workflows: [updatedWorkflow],
    }))

    toast({
      title: "워크플로우 저장됨",
      description: "워크플로우가 성공적으로 저장되었습니다.",
    })
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4 py-2 flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="editor">에디터</TabsTrigger>
            <TabsTrigger value="runner">실행기</TabsTrigger>
            <TabsTrigger value="exporter">내보내기</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Input
              className="w-64"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="워크플로우 이름"
            />
            <Button variant="outline" onClick={saveWorkflow}>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
            <Button onClick={() => setActiveTab("runner")}>
              <Play className="mr-2 h-4 w-4" />
              실행
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("exporter")}>
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </Button>
          </div>
        </div>

        <TabsContent value="editor" className="flex-1 flex p-0 m-0">
          {/* 왼쪽 패널: 컴포넌트 메뉴 */}
          <div className="w-64 border-r overflow-y-auto">
            <ComponentMenu
              context="process-studio"
              onSelectComponent={handleSelectComponent}
              className="border-0 rounded-none"
            />
          </div>

          {/* 중앙: 워크플로우 에디터 */}
          <div className="flex-1 bg-gray-50 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10">
              <Button onClick={addNode} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                노드 추가
              </Button>
            </div>

            <div className="h-full p-8">
              <div className="grid grid-cols-4 gap-4 h-full">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedNode?.id === node.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      position: "absolute",
                      left: node.position.x,
                      top: node.position.y,
                      width: "150px",
                      height: "80px",
                    }}
                  >
                    <div className="text-sm font-medium">{node.data.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{node.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 패널: 속성 편집 */}
          <div className="w-64 border-l p-4 overflow-y-auto">
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
              <div className="text-muted-foreground">노드를 선택하여 속성을 편집하세요</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="runner" className="flex-1 p-4 m-0">
          <ProcessStudioRunner processData={processData} />
        </TabsContent>

        <TabsContent value="exporter" className="flex-1 p-4 m-0">
          <ProcessStudioExporter
            tasks={processData.tasks || []}
            components={processData.components || []}
            workflows={processData.workflows || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
