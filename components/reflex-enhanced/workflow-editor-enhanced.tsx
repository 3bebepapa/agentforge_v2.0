/**
 * Reflex 스타일로 개선된 워크플로우 에디터
 * 기존 components/workflow-editor.tsx를 대체
 */

"use client"

import React, { useCallback, useMemo } from "react"
import { useReflexComponent } from "@/components/reflex-core/base-component"
import ReactFlow, {
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from "reactflow"
import "reactflow/dist/style.css"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Save, Plus } from "lucide-react"

// 노드 타입 정의
const nodeTypes = {
  input: "input",
  output: "output",
  llm: "default",
  tool: "default",
  condition: "default",
  transform: "default",
}

export function ReflexWorkflowEditor() {
  const { state, emit } = useReflexComponent("workflow-editor", (globalState) => ({
    workflows: globalState.workflows.list,
    activeWorkflow: globalState.workflows.active,
    nodes: globalState.workflows.nodes,
    edges: globalState.workflows.edges,
    executing: globalState.workflows.executing,
    executionHistory: globalState.workflows.executionHistory,
    loading: globalState.ui.loading.workflowEditor || false,
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(state.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(state.edges)

  const [newWorkflowName, setNewWorkflowName] = React.useState("")
  const [selectedNodeType, setSelectedNodeType] = React.useState("llm")

  // 연결 생성
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        id: `edge_${Date.now()}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      }

      setEdges((eds) => addEdge(newEdge, eds))

      if (state.activeWorkflow) {
        emit("workflow.edge.add", {
          workflowId: state.activeWorkflow.id,
          edge: newEdge,
        })
      }
    },
    [state.activeWorkflow, emit, setEdges],
  )

  // 새 노드 추가
  const addNode = useCallback(() => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: selectedNodeType,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        label: `${selectedNodeType} 노드`,
        type: selectedNodeType,
        config: {},
      },
    }

    setNodes((nds) => [...nds, newNode])

    if (state.activeWorkflow) {
      emit("workflow.node.add", {
        workflowId: state.activeWorkflow.id,
        node: newNode,
      })
    }
  }, [selectedNodeType, state.activeWorkflow, emit, setNodes])

  // 워크플로우 생성
  const createWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) return

    emit("workflow.create", {
      name: newWorkflowName,
      description: `${newWorkflowName} 워크플로우`,
    })

    setNewWorkflowName("")
  }, [newWorkflowName, emit])

  // 워크플로우 실행
  const executeWorkflow = useCallback(() => {
    if (!state.activeWorkflow) return

    emit("workflow.execute", {
      id: state.activeWorkflow.id,
      input: {},
    })
  }, [state.activeWorkflow, emit])

  // 워크플로우 저장
  const saveWorkflow = useCallback(() => {
    if (!state.activeWorkflow) return

    const updatedWorkflow = {
      ...state.activeWorkflow,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    }

    emit("workflow.update", {
      id: state.activeWorkflow.id,
      updates: updatedWorkflow,
    })
  }, [state.activeWorkflow, nodes, edges, emit])

  // 커스텀 노드 컴포넌트
  const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? "border-blue-500" : "border-gray-200"}`}
    >
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500 text-sm">{data.type}</div>
        </div>
      </div>
    </div>
  )

  const nodeTypesConfig = useMemo(
    () => ({
      default: CustomNode,
      input: CustomNode,
      output: CustomNode,
    }),
    [],
  )

  return (
    <div className="h-full flex flex-col">
      {/* 상단 툴바 */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="워크플로우 이름"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                className="w-48"
              />
              <Button onClick={createWorkflow} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                생성
              </Button>
            </div>

            {state.activeWorkflow && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{state.activeWorkflow.name}</Badge>
                <Button onClick={saveWorkflow} size="sm" variant="outline">
                  <Save className="w-4 h-4 mr-1" />
                  저장
                </Button>
                <Button onClick={executeWorkflow} size="sm" disabled={state.executing}>
                  <Play className="w-4 h-4 mr-1" />
                  {state.executing ? "실행 중..." : "실행"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedNodeType} onValueChange={setSelectedNodeType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="input">입력</SelectItem>
                <SelectItem value="llm">LLM</SelectItem>
                <SelectItem value="tool">도구</SelectItem>
                <SelectItem value="condition">조건</SelectItem>
                <SelectItem value="transform">변환</SelectItem>
                <SelectItem value="output">출력</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addNode} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              노드 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 에디터 영역 */}
      <div className="flex-1 flex">
        {/* 워크플로우 캔버스 */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypesConfig}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* 오른쪽 사이드바 */}
        <div className="w-80 border-l bg-gray-50 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">워크플로우 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {state.workflows.length === 0 ? (
                <div className="text-center py-4 text-gray-500">생성된 워크플로우가 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {state.workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        state.activeWorkflow?.id === workflow.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        emit("workflow.update", {
                          id: workflow.id,
                          updates: workflow,
                        })
                      }}
                    >
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-gray-500">노드: {workflow.nodes?.length || 0}개</div>
                      <div className="text-xs text-gray-400">{new Date(workflow.updatedAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 실행 히스토리 */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">실행 히스토리</CardTitle>
            </CardHeader>
            <CardContent>
              {state.executionHistory.length === 0 ? (
                <div className="text-center py-4 text-gray-500">실행 히스토리가 없습니다.</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.executionHistory.map((execution) => (
                    <div key={execution.id} className="p-2 rounded bg-white border">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            execution.status === "success"
                              ? "secondary"
                              : execution.status === "failed"
                                ? "destructive"
                                : "default"
                          }
                        >
                          {execution.status}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {new Date(execution.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                      {execution.error && <div className="text-xs text-red-600 mt-1">{execution.error}</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
