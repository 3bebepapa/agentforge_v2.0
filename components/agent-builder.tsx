"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  type Connection,
  type Node,
  Handle,
  Position,
  type NodeTypes,
  type NodeProps,
  useReactFlow,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Save,
  Play,
  Trash,
  FileJson,
  X,
  Database,
  Bot,
  Code,
  Workflow,
  MessageSquare,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Copy,
  Upload,
  BarChart,
  Globe,
  Image,
  User,
  Send,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { executeAgent } from "@/lib/agent-executor"
import type { AgentNode, AgentEdge } from "@/lib/agent-types"
import { agentTemplates, getTemplateById, searchTemplates } from "@/lib/agent-templates"
import { getAINodeDefinition } from "@/lib/ai-node-library"

// 노드 컴포넌트들
function InputNode({ data, selected, id }: NodeProps<any>) {
  return (
    <NodeCard
      title={data.label}
      type="입력"
      icon={<Database className="h-4 w-4 text-blue-500" />}
      selected={selected}
      color="bg-blue-50 dark:bg-blue-900/20"
      borderColor={selected ? "border-blue-500" : "border-blue-200 dark:border-blue-800"}
      isLoading={data.isLoading}
      error={data.error}
      result={data.result}
    >
      <div className="text-xs text-gray-500 dark:text-gray-400">{data.description || "데이터 입력 노드"}</div>

      {/* 출력 핸들 */}
      {data.outputs &&
        data.outputs.map((output: string, index: number) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={output}
            style={{
              background: "#4ade80",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}
    </NodeCard>
  )
}

function ProcessNode({ data, selected, id }: NodeProps<any>) {
  return (
    <NodeCard
      title={data.label}
      type="처리"
      icon={<Code className="h-4 w-4 text-purple-500" />}
      selected={selected}
      color="bg-purple-50 dark:bg-purple-900/20"
      borderColor={selected ? "border-purple-500" : "border-purple-200 dark:border-purple-800"}
      isLoading={data.isLoading}
      error={data.error}
      result={data.result}
    >
      <div className="text-xs text-gray-500 dark:text-gray-400">{data.description || "데이터 처리 노드"}</div>

      {/* 입력 핸들 */}
      {data.inputs &&
        data.inputs.map((input: string, index: number) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={input}
            style={{
              background: "#60a5fa",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}

      {/* 출력 핸들 */}
      {data.outputs &&
        data.outputs.map((output: string, index: number) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={output}
            style={{
              background: "#4ade80",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}
    </NodeCard>
  )
}

function OutputNode({ data, selected, id }: NodeProps<any>) {
  return (
    <NodeCard
      title={data.label}
      type="출력"
      icon={<FileJson className="h-4 w-4 text-green-500" />}
      selected={selected}
      color="bg-green-50 dark:bg-green-900/20"
      borderColor={selected ? "border-green-500" : "border-green-200 dark:border-green-800"}
      isLoading={data.isLoading}
      error={data.error}
      result={data.result}
    >
      <div className="text-xs text-gray-500 dark:text-gray-400">{data.description || "결과 출력 노드"}</div>

      {/* 입력 핸들 */}
      {data.inputs &&
        data.inputs.map((input: string, index: number) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={input}
            style={{
              background: "#60a5fa",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}
    </NodeCard>
  )
}

function LLMNode({ data, selected, id }: NodeProps<any>) {
  // 아이콘 결정
  let icon = <Bot className="h-4 w-4 text-amber-500" />

  if (data.type === "text-generation") {
    icon = <MessageSquare className="h-4 w-4 text-amber-500" />
  } else if (data.type === "text-summarization") {
    icon = <FileText className="h-4 w-4 text-amber-500" />
  } else if (data.type === "sentiment-analysis") {
    icon = <BarChart className="h-4 w-4 text-amber-500" />
  } else if (data.type === "code-generation") {
    icon = <Code className="h-4 w-4 text-amber-500" />
  } else if (data.type === "translation") {
    icon = <Globe className="h-4 w-4 text-amber-500" />
  } else if (data.type === "image-analysis") {
    icon = <Image className="h-4 w-4 text-amber-500" />
  }

  return (
    <NodeCard
      title={data.label}
      type="LLM"
      icon={icon}
      selected={selected}
      color="bg-amber-50 dark:bg-amber-900/20"
      borderColor={selected ? "border-amber-500" : "border-amber-200 dark:border-amber-800"}
      isLoading={data.isLoading}
      error={data.error}
      result={data.result}
    >
      <div className="text-xs text-gray-500 dark:text-gray-400">{data.description || "언어 모델 노드"}</div>

      {/* 입력 핸들 */}
      {data.inputs &&
        data.inputs.map((input: string, index: number) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={input}
            style={{
              background: "#60a5fa",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}

      {/* 출력 핸들 */}
      {data.outputs &&
        data.outputs.map((output: string, index: number) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={output}
            style={{
              background: "#4ade80",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}
    </NodeCard>
  )
}

function ToolNode({ data, selected, id }: NodeProps<any>) {
  return (
    <NodeCard
      title={data.label}
      type="도구"
      icon={<Workflow className="h-4 w-4 text-indigo-500" />}
      selected={selected}
      color="bg-indigo-50 dark:bg-indigo-900/20"
      borderColor={selected ? "border-indigo-500" : "border-indigo-200 dark:border-indigo-800"}
      isLoading={data.isLoading}
      error={data.error}
      result={data.result}
    >
      <div className="text-xs text-gray-500 dark:text-gray-400">{data.description || "도구 노드"}</div>

      {/* 입력 핸들 */}
      {data.inputs &&
        data.inputs.map((input: string, index: number) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={input}
            style={{
              background: "#60a5fa",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}

      {/* 출력 핸들 */}
      {data.outputs &&
        data.outputs.map((output: string, index: number) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={output}
            style={{
              background: "#4ade80",
              top: `${50 + index * 20}%`,
              width: 8,
              height: 8,
            }}
          />
        ))}
    </NodeCard>
  )
}

// 공통 노드 카드 컴포넌트
function NodeCard({
  title,
  type,
  icon,
  selected,
  color,
  borderColor,
  children,
  isLoading,
  error,
  result,
}: {
  title: string
  type: string
  icon: React.ReactNode
  selected: boolean
  color: string
  borderColor: string
  children: React.ReactNode
  isLoading?: boolean
  error?: string
  result?: any
}) {
  return (
    <div className={`rounded-md shadow-sm ${color} ${borderColor} border-2 w-48`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {icon}
            <div className="font-medium text-sm ml-2">{title}</div>
          </div>
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        </div>
        {children}

        {/* 실행 상태 표시 */}
        {isLoading && (
          <div className="mt-2 flex items-center text-xs text-blue-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            실행 중...
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center text-xs text-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error.length > 30 ? error.substring(0, 30) + "..." : error}
          </div>
        )}

        {result && !error && !isLoading && (
          <div className="mt-2 flex items-center text-xs text-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            실행 완료
          </div>
        )}
      </div>
    </div>
  )
}

// 노드 타입 정의
const nodeTypes: NodeTypes = {
  input: InputNode,
  process: ProcessNode,
  output: OutputNode,
  llm: LLMNode,
  tool: ToolNode,
}

// 메인 에이전트 빌더 컴포넌트
export function AgentBuilder() {
  // 노드 및 엣지 상태
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // UI 상태
  const [selectedNode, setSelectedNode] = useState<Node<any> | null>(null)
  const [sidebarTab, setSidebarTab] = useState("templates")
  const [templateCategory, setTemplateCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [agentName, setAgentName] = useState("새 에이전트")
  const [agentDescription, setAgentDescription] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({})
  const [importData, setImportData] = useState("")
  const [showExecutionPanel, setShowExecutionPanel] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [chatInput, setChatInput] = useState("")

  // ReactFlow 인스턴스
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()

  // API 키 로컬 스토리지에서 불러오기
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // 노드 선택 처리
  const onNodeClick = useCallback((_, node: Node<any>) => {
    setSelectedNode(node)
    setShowRightPanel(true)
  }, [])

  // 배경 클릭 처리
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setShowRightPanel(false)
  }, [])

  // 엣지 연결 처리
  const onConnect = useCallback(
    (params: Connection) => {
      // 소스와 타겟이 같은 노드인 경우 연결 방지
      if (params.source === params.target) {
        return
      }

      // 이미 존재하는 연결인지 확인
      const connectionExists = edges.some(
        (edge) =>
          edge.source === params.source &&
          edge.target === params.target &&
          edge.sourceHandle === params.sourceHandle &&
          edge.targetHandle === params.targetHandle,
      )

      if (connectionExists) {
        return
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `edge-${uuidv4()}`,
            animated: true,
            style: { stroke: "#6366f1" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#6366f1",
            },
          },
          eds,
        ),
      )
    },
    [edges, setEdges],
  )

  // 템플릿 적용 처리
  const onApplyTemplate = useCallback(
    (templateId: string) => {
      if (!reactFlowInstance) return

      const template = getTemplateById(templateId)
      if (!template) return

      // 기존 노드와 엣지 초기화
      setNodes([])
      setEdges([])

      // 템플릿의 노드와 엣지 적용
      setTimeout(() => {
        setNodes(template.nodes)
        setEdges(template.edges)
        setAgentName(template.name)
        setAgentDescription(template.description)
      }, 100)
    },
    [reactFlowInstance, setNodes, setEdges],
  )

  // 노드 삭제 처리
  const onDeleteNode = useCallback(() => {
    if (!selectedNode) return

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))

    setSelectedNode(null)
    setShowRightPanel(false)
  }, [selectedNode, setNodes, setEdges])

  // API 키 유효성 검사
  const validateApiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      // Gemini API 키 검증 요청
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API 키 검증 실패:", errorData)
        setApiKeyError(`API 오류: ${errorData.error?.message || "API key not valid"}`)
        return false
      }

      setApiKeyError(null)
      return true
    } catch (error) {
      console.error("API 키 검증 요청 오류:", error)
      setApiKeyError("API 키 검증 중 오류가 발생했습니다.")
      return false
    }
  }, [])

  // 에이전트 실행 처리
  const onRunAgent = useCallback(async () => {
    if (!apiKey) {
      setShowApiKeyDialog(true)
      return
    }

    // API 키 유효성 검사
    const isValid = await validateApiKey(apiKey)
    if (!isValid) {
      setShowApiKeyDialog(true)
      return
    }

    setIsRunning(true)
    setShowExecutionPanel(true)

    // 모든 노드의 상태 초기화
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isLoading: true,
          error: undefined,
          result: undefined,
        },
      })),
    )

    try {
      // 에이전트 실행
      const results = await executeAgent(nodes as AgentNode[], edges as AgentEdge[], apiKey)

      // 실행 결과 저장
      setExecutionResults(results)

      // 각 노드의 실행 결과 업데이트
      setNodes((nds) =>
        nds.map((node) => {
          const result = results[node.id]

          return {
            ...node,
            data: {
              ...node.data,
              isLoading: false,
              error: result?.error,
              result: result?.success ? result.data : undefined,
            },
          }
        }),
      )
    } catch (error: any) {
      console.error("에이전트 실행 오류:", error)

      // 오류 상태 업데이트
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isLoading: false,
            error: "에이전트 실행 중 오류가 발생했습니다.",
          },
        })),
      )
    } finally {
      setIsRunning(false)
    }
  }, [nodes, edges, apiKey, setNodes, validateApiKey])

  // API 키 저장 처리
  const onSaveApiKey = useCallback(async () => {
    // API 키 유효성 검사
    const isValid = await validateApiKey(apiKey)
    if (isValid) {
      localStorage.setItem("gemini-api-key", apiKey)
      setShowApiKeyDialog(false)
    }
  }, [apiKey, validateApiKey])

  // 에이전트 저장 처리
  const onSaveAgent = useCallback(() => {
    const agent = {
      name: agentName,
      description: agentDescription,
      nodes,
      edges,
    }

    // JSON으로 변환하여 다운로드
    const dataStr = JSON.stringify(agent, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `${agentName.replace(/\s+/g, "-").toLowerCase()}-agent.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    setShowSaveDialog(false)
  }, [agentName, agentDescription, nodes, edges])

  // 에이전트 가져오기 처리
  const onImportAgent = useCallback(() => {
    try {
      const agent = JSON.parse(importData)

      if (agent.nodes && agent.edges) {
        setNodes(agent.nodes)
        setEdges(agent.edges)
        setAgentName(agent.name || "가져온 에이전트")
        setAgentDescription(agent.description || "")

        setShowImportDialog(false)
        setImportData("")
      } else {
        alert("유효하지 않은 에이전트 데이터입니다.")
      }
    } catch (error) {
      alert("에이전트 데이터를 파싱할 수 없습니다.")
    }
  }, [importData, setNodes, setEdges])

  // 노드 파라미터 업데이트 처리
  const updateNodeParameter = useCallback(
    (nodeId: string, paramName: string, value: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                parameters: {
                  ...node.data.parameters,
                  [paramName]: value,
                },
              },
            }
          }
          return node
        }),
      )

      // 선택된 노드도 업데이트
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: {
            ...selectedNode.data,
            parameters: {
              ...selectedNode.data.parameters,
              [paramName]: value,
            },
          },
        })
      }
    },
    [setNodes, selectedNode],
  )

  // 채팅 인터페이스 토글
  const toggleChatInterface = useCallback(() => {
    if (!apiKey) {
      setShowApiKeyDialog(true)
      return
    }

    setShowChatInterface((prev) => !prev)
  }, [apiKey])

  // 채팅 입력 처리
  const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim() || !apiKey) return

    // 입력 노드 찾기
    const inputNode = nodes.find((node) => node.type === "input")
    if (!inputNode) return

    // 입력 노드의 값 업데이트
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === inputNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              parameters: {
                ...node.data.parameters,
                inputValue: chatInput,
              },
            },
          }
        }
        return node
      }),
    )

    // 에이전트 실행
    setChatInput("")
    await onRunAgent()
  }, [chatInput, apiKey, nodes, setNodes, onRunAgent])

  // 필터링된 템플릿
  const filteredTemplates = searchTemplates(searchQuery).filter(
    (template) => templateCategory === "all" || template.category === templateCategory,
  )

  // 템플릿 카테고리 목록
  const templateCategories = ["all", ...Array.from(new Set(agentTemplates.map((t) => t.category)))]

  // 노드 파라미터 렌더링
  const renderNodeParameters = () => {
    if (!selectedNode || !selectedNode.data.parameters) return null

    const { parameters, type } = selectedNode.data

    switch (type) {
      case "input":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>입력 타입</Label>
              <Select
                value={parameters.inputType || "text"}
                onValueChange={(value) => updateNodeParameter(selectedNode.id, "inputType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="입력 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">텍스트</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {parameters.inputType === "api" ? (
              <>
                <div className="space-y-2">
                  <Label>API URL</Label>
                  <Input
                    value={parameters.url || ""}
                    onChange={(e) => updateNodeParameter(selectedNode.id, "url", e.target.value)}
                    placeholder="https://api.example.com/data"
                  />
                </div>
                <div className="space-y-2">
                  <Label>메서드</Label>
                  <Select
                    value={parameters.method || "GET"}
                    onValueChange={(value) => updateNodeParameter(selectedNode.id, "method", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="HTTP 메서드 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>입력 값</Label>
                <Textarea
                  value={parameters.inputValue || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "inputValue", e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
        )

      case "llm":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>모델</Label>
              <Select
                value={parameters.model || "gemini-1.5-flash"}
                onValueChange={(value) => updateNodeParameter(selectedNode.id, "model", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Temperature</Label>
                <span className="text-xs text-muted-foreground">{parameters.temperature || 0.7}</span>
              </div>
              <Slider
                value={[parameters.temperature || 0.7]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => updateNodeParameter(selectedNode.id, "temperature", value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>프롬프트</Label>
              <Textarea
                value={parameters.prompt || ""}
                onChange={(e) => updateNodeParameter(selectedNode.id, "prompt", e.target.value)}
                rows={4}
              />
            </div>

            {parameters.systemPrompt !== undefined && (
              <div className="space-y-2">
                <Label>시스템 프롬프트</Label>
                <Textarea
                  value={parameters.systemPrompt || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "systemPrompt", e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
        )

      case "text-generation":
      case "text-summarization":
      case "sentiment-analysis":
      case "code-generation":
      case "translation":
      case "image-analysis":
        // AI 노드 정의 가져오기
        const aiNodeDefinition = getAINodeDefinition(type)
        if (!aiNodeDefinition) {
          return <div className="text-sm text-muted-foreground">노드 정의를 찾을 수 없습니다.</div>
        }

        return (
          <div className="space-y-4">
            {aiNodeDefinition.parameters.map((param) => {
              if (param.type === "select") {
                return (
                  <div key={param.name} className="space-y-2">
                    <Label>{param.label}</Label>
                    <Select
                      value={parameters[param.name] || param.default}
                      onValueChange={(value) => updateNodeParameter(selectedNode.id, param.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`${param.label} 선택`} />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {param.description && <p className="text-xs text-muted-foreground">{param.description}</p>}
                  </div>
                )
              } else if (param.type === "number") {
                return (
                  <div key={param.name} className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{param.label}</Label>
                      <span className="text-xs text-muted-foreground">{parameters[param.name] || param.default}</span>
                    </div>
                    <Slider
                      value={[parameters[param.name] || param.default]}
                      min={param.validation?.min || 0}
                      max={param.validation?.max || 1}
                      step={0.1}
                      onValueChange={(value) => updateNodeParameter(selectedNode.id, param.name, value[0])}
                    />
                    {param.description && <p className="text-xs text-muted-foreground">{param.description}</p>}
                  </div>
                )
              } else if (param.type === "boolean") {
                return (
                  <div key={param.name} className="flex items-center justify-between">
                    <Label>{param.label}</Label>
                    <input
                      type="checkbox"
                      checked={parameters[param.name] || param.default}
                      onChange={(e) => updateNodeParameter(selectedNode.id, param.name, e.target.checked)}
                    />
                    {param.description && <p className="text-xs text-muted-foreground">{param.description}</p>}
                  </div>
                )
              } else {
                return (
                  <div key={param.name} className="space-y-2">
                    <Label>{param.label}</Label>
                    <Input
                      value={parameters[param.name] || param.default || ""}
                      onChange={(e) => updateNodeParameter(selectedNode.id, param.name, e.target.value)}
                      type={param.type === "secret" ? "password" : "text"}
                    />
                    {param.description && <p className="text-xs text-muted-foreground">{param.description}</p>}
                  </div>
                )
              }
            })}
          </div>
        )

      case "process":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>처리 타입</Label>
              <Select
                value={parameters.processType || "transform"}
                onValueChange={(value) => updateNodeParameter(selectedNode.id, "processType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="처리 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transform">변환</SelectItem>
                  <SelectItem value="filter">필터</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {parameters.processType === "transform" ? (
              <div className="space-y-2">
                <Label>변환 함수</Label>
                <Textarea
                  value={parameters.transformFunction || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "transformFunction", e.target.value)}
                  rows={4}
                  placeholder="data => { ... }"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>필터 조건</Label>
                <Textarea
                  value={parameters.filterCondition || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "filterCondition", e.target.value)}
                  rows={4}
                  placeholder="item => item.value > 10"
                />
              </div>
            )}
          </div>
        )

      case "tool":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>도구 타입</Label>
              <Select
                value={parameters.toolType || "search"}
                onValueChange={(value) => updateNodeParameter(selectedNode.id, "toolType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="도구 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="search">웹 검색</SelectItem>
                  <SelectItem value="code">코드 실행</SelectItem>
                  <SelectItem value="vector-search">벡터 검색</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {parameters.toolType === "search" ? (
              <div className="space-y-2">
                <Label>검색어</Label>
                <Input
                  value={parameters.query || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "query", e.target.value)}
                  placeholder="검색어 입력"
                />
              </div>
            ) : parameters.toolType === "code" ? (
              <div className="space-y-2">
                <Label>코드</Label>
                <Textarea
                  value={parameters.code || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "code", e.target.value)}
                  rows={4}
                  placeholder="print('Hello, World!')"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>컬렉션</Label>
                <Input
                  value={parameters.collection || ""}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "collection", e.target.value)}
                  placeholder="벡터 데이터베이스 컬렉션"
                />
                <Label>상위 K</Label>
                <Input
                  type="number"
                  value={parameters.topK || 5}
                  onChange={(e) => updateNodeParameter(selectedNode.id, "topK", Number.parseInt(e.target.value))}
                  placeholder="검색할 문서 수"
                />
              </div>
            )}
          </div>
        )

      default:
        return <div className="text-sm text-muted-foreground">이 노드 유형에는 구성 가능한 파라미터가 없습니다.</div>
    }
  }

  // 노드 실행 결과 렌더링
  const renderNodeResult = () => {
    if (!selectedNode || !selectedNode.data.result) return null

    const { result } = selectedNode.data

    return (
      <Card className="mt-4">
        <CardHeader className="py-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>실행 결과</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(typeof result === "string" ? result : JSON.stringify(result, null, 2))
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {typeof result === "string" ? (
              <div className="whitespace-pre-wrap text-sm">{result}</div>
            ) : (
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  // 실행 결과 패널 렌더링
  const renderExecutionPanel = () => {
    if (!showExecutionPanel) return null

    // 출력 노드 찾기
    const outputNodes = nodes.filter((node) => node.type === "output")

    return (
      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-background border-l border-t shadow-lg z-10 flex flex-col">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-medium text-sm">실행 결과</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowExecutionPanel(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {outputNodes.length > 0 ? (
            <div className="space-y-4">
              {outputNodes.map((node) => (
                <div key={node.id} className="space-y-2">
                  <div className="font-medium text-sm">{node.data.label}</div>
                  {node.data.isLoading ? (
                    <div className="flex items-center text-sm text-blue-500">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      실행 중...
                    </div>
                  ) : node.data.error ? (
                    <div className="text-sm text-red-500">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      {node.data.error}
                    </div>
                  ) : node.data.result ? (
                    <div className="p-3 bg-muted rounded-md">
                      {typeof node.data.result === "string" ? (
                        <div className="whitespace-pre-wrap text-sm">{node.data.result}</div>
                      ) : (
                        <pre className="text-xs overflow-auto">{JSON.stringify(node.data.result, null, 2)}</pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">결과 없음</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              출력 노드가 없습니다. 에이전트에 출력 노드를 추가하세요.
            </div>
          )}
        </ScrollArea>
      </div>
    )
  }

  // 채팅 인터페이스 렌더링
  const renderChatInterface = () => {
    if (!showChatInterface) return null

    // 출력 노드 찾기
    const outputNode = nodes.find((node) => node.type === "output")
    const outputResult = outputNode?.data?.result?.output || outputNode?.data?.result || "아직 결과가 없습니다."

    return (
      <div className="fixed bottom-0 right-0 w-96 h-[500px] shadow-lg z-20 flex flex-col bg-background border rounded-md">
        <div className="py-3 px-4 border-b flex flex-row items-center justify-between">
          <div className="text-base flex items-center font-semibold">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            {agentName} 채팅
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowChatInterface(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <div className="whitespace-pre-wrap text-sm">
                      안녕하세요! {agentName}입니다. 무엇을 도와드릴까요?
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            {chatInput.trim() !== "" && (
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[80%] flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="rounded-lg px-3 py-2 bg-primary text-primary-foreground">
                      <div className="whitespace-pre-wrap text-sm">{chatInput}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isRunning && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            {outputResult && !isRunning && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <div className="whitespace-pre-wrap text-sm">
                        {typeof outputResult === "string" ? outputResult : JSON.stringify(outputResult, null, 2)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleChatSubmit()
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="메시지 입력..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isRunning}
            />
            <Button type="submit" size="icon" disabled={isRunning || !chatInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* 좌측 사이드바 */}
      <div className={`border-r bg-background ${showSidebar ? "w-72" : "w-12"}`}>
        <div className="p-4 flex flex-col h-full">
          {showSidebar ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">에이전트 빌더</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Input
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />

              <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="templates">템플릿</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="flex-1 mt-4">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {templateCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={templateCategory === category ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setTemplateCategory(category)}
                      >
                        {category === "all" ? "전체" : category}
                      </Badge>
                    ))}
                  </div>

                  <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="space-y-3 pr-4">
                      {filteredTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => onApplyTemplate(template.id)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base flex items-center">{template.name}</CardTitle>
                            <CardDescription className="text-xs">{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {template.nodes.length} 노드 | {template.edges.length} 연결
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="mb-4">
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* 상단 툴바 */}
        <div className="border-b p-4 flex items-center justify-between bg-background">
          <div className="flex items-center">
            <Bot className="h-5 w-5 text-primary mr-2" />
            <h2 className="font-semibold">{agentName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              가져오기
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              API 키
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
              <Save className="mr-2 h-4 w-4" />
              저장
            </Button>
            <Button variant="outline" size="sm" onClick={toggleChatInterface}>
              <MessageSquare className="mr-2 h-4 w-4" />
              채팅
            </Button>
            <Button
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              onClick={onRunAgent}
              disabled={isRunning || nodes.length === 0}
            >
              {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              {isRunning ? "실행 중..." : "실행"}
            </Button>
          </div>
        </div>

        <div className="flex flex-1">
          {/* 플로우 에디터 */}
          <div className="flex-1" ref={reactFlowWrapper}>
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
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: "#6366f1" },
              }}
            >
              <Background />
              <Controls />
              <Panel position="bottom-center" className="bg-background/80 p-2 rounded-t-md shadow-md">
                <div className="text-xs text-muted-foreground">
                  {nodes.length} 노드 | {edges.length} 연결
                </div>
              </Panel>
            </ReactFlow>
          </div>

          {/* 노드 속성 패널 */}
          {showRightPanel && (
            <div className="w-80 border-l bg-background p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{selectedNode?.data.label}</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={onDeleteNode}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(false)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="properties">
                <TabsList className="w-full">
                  <TabsTrigger value="properties" className="flex-1">
                    속성
                  </TabsTrigger>
                  <TabsTrigger value="connections" className="flex-1">
                    연결
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>노드 이름</Label>
                    <Input
                      value={selectedNode?.data.label || ""}
                      onChange={(e) => {
                        if (!selectedNode) return

                        setNodes((nds) =>
                          nds.map((node) => {
                            if (node.id === selectedNode.id) {
                              return {
                                ...node,
                                data: {
                                  ...node.data,
                                  label: e.target.value,
                                },
                              }
                            }
                            return node
                          }),
                        )
                        setSelectedNode({
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            label: e.target.value,
                          },
                        })
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>설명</Label>
                    <Textarea
                      value={selectedNode?.data.description || ""}
                      onChange={(e) => {
                        if (!selectedNode) return

                        setNodes((nds) =>
                          nds.map((node) => {
                            if (node.id === selectedNode.id) {
                              return {
                                ...node,
                                data: {
                                  ...node.data,
                                  description: e.target.value,
                                },
                              }
                            }
                            return node
                          }),
                        )
                        setSelectedNode({
                          ...selectedNode,
                          data: {
                            ...selectedNode.data,
                            description: e.target.value,
                          },
                        })
                      }}
                      rows={3}
                    />
                  </div>

                  {/* 노드 타입별 속성 필드 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">노드 파라미터</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">{renderNodeParameters()}</CardContent>
                  </Card>

                  {/* 노드 실행 결과 */}
                  {renderNodeResult()}

                  {/* 노드 오류 */}
                  {selectedNode?.data.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{selectedNode.data.error}</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="connections" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">입력</h4>
                    {selectedNode?.data.inputs && selectedNode.data.inputs.length > 0 ? (
                      <div className="space-y-2">
                        {selectedNode.data.inputs.map((input: string) => (
                          <div key={input} className="flex items-center p-2 border rounded-md">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-sm">{input}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">입력 없음</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">출력</h4>
                    {selectedNode?.data.outputs && selectedNode.data.outputs.length > 0 ? (
                      <div className="space-y-2">
                        {selectedNode.data.outputs.map((output: string) => (
                          <div key={output} className="flex items-center p-2 border rounded-md">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">{output}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">출력 없음</div>
                    )}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">연결된 노드</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {edges.filter((e) => e.source === selectedNode?.id || e.target === selectedNode?.id).length >
                      0 ? (
                        <div className="space-y-2">
                          {edges
                            .filter((e) => e.source === selectedNode?.id)
                            .map((e) => {
                              const targetNode = nodes.find((n) => n.id === e.target)
                              return (
                                <div key={e.id} className="text-sm flex items-center">
                                  <span className="text-green-500 mr-1">{e.sourceHandle}</span>
                                  <ChevronRight className="h-3 w-3 mx-1" />
                                  <span>{targetNode?.data.label || "알 수 없는 노드"}</span>
                                  <span className="text-blue-500 ml-1">({e.targetHandle})</span>
                                </div>
                              )
                            })}
                          {edges
                            .filter((e) => e.target === selectedNode?.id)
                            .map((e) => {
                              const sourceNode = nodes.find((n) => n.id === e.source)
                              return (
                                <div key={e.id} className="text-sm flex items-center">
                                  <span>{sourceNode?.data.label || "알 수 없는 노드"}</span>
                                  <span className="text-green-500 ml-1">({e.sourceHandle})</span>
                                  <ChevronRight className="h-3 w-3 mx-1" />
                                  <span className="text-blue-500 mr-1">{e.targetHandle}</span>
                                </div>
                              )
                            })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">연결된 노드 없음</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* 실행 결과 패널 */}
      {renderExecutionPanel()}

      {/* 채팅 인터페이스 */}
      {renderChatInterface()}

      {/* API 키 다이얼로그 */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API 키 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API 키</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Gemini API 키 입력"
              />
              {apiKeyError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiKeyError}</AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
                에서 API 키를 발급받을 수 있습니다.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              취소
            </Button>
            <Button onClick={onSaveApiKey}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 저장 다이얼로그 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>에이전트 저장</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">이름</Label>
              <Input
                id="agent-name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="에이전트 이름"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-description">설명</Label>
              <Textarea
                id="agent-description"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="에이전트 설명"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              취소
            </Button>
            <Button onClick={onSaveAgent}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 가져오기 다이얼로그 */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>에이전트 가져오기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-data">에이전트 JSON</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="에이전트 JSON 데이터 붙여넣기"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              취소
            </Button>
            <Button onClick={onImportAgent}>가져오기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
