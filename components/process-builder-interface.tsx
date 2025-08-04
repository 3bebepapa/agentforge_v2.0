"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAgentState } from "@/hooks/use-agent-state"
import {
  Send,
  Play,
  Save,
  Copy,
  Folder,
  RefreshCw,
  CheckCircle,
  XCircle,
  Terminal,
  FolderTree,
  ChevronRight,
  ChevronLeft,
  Square,
  Plus,
  Settings,
  Workflow,
  Zap,
  Layers,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  processBlocks?: Array<{
    type: string
    name: string
    config: any
  }>
  streaming?: boolean
}

interface ProcessNode {
  id: string
  name: string
  type: string
  description?: string
  config: any
  position: { x: number; y: number }
  inputs: string[]
  outputs: string[]
  status?: "created" | "modified" | "verified" | "tested" | "optimized" | "deployed"
}

interface ProcessFlow {
  id: string
  name: string
  description: string
  nodes: ProcessNode[]
  edges: Array<{
    id: string
    source: string
    target: string
    label?: string
  }>
  createdAt: Date
  lastModified: Date
  status?: "planning" | "coding" | "testing" | "optimizing" | "complete"
}

// 두 가지 export 방식을 모두 지원
export function ProcessBuilderInterface({ apiKey = "" }) {
  const { toast } = useToast()
  const { agents } = useAgentState()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "안녕하세요! 프로세스 빌더입니다. 어떤 프로세스를 만들고 싶으신가요?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null)
  const [activeFlow, setActiveFlow] = useState<ProcessFlow | null>(null)
  const [processAgents, setProcessAgents] = useState<any[]>([])
  const [selectedProcessAgent, setSelectedProcessAgent] = useState<string | null>(null)
  const [executionResult, setExecutionResult] = useState<string>("")
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isFlowExplorerVisible, setIsFlowExplorerVisible] = useState(true)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeTab, setActiveTab] = useState("flow")
  const [previewContent, setPreviewContent] = useState<string>("")
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 프로세스 스트리밍 관련 상태 추가
  const [nodeStreaming, setNodeStreaming] = useState(false)
  const [streamedNodeConfig, setStreamedNodeConfig] = useState("")
  const [streamTarget, setStreamTarget] = useState<string | null>(null)

  // 동시 스트리밍 관련 상태 추가
  const [pendingNodes, setPendingNodes] = useState<ProcessNode[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [workPlan, setWorkPlan] = useState<string>("")
  const [showEmptyState, setShowEmptyState] = useState(true)

  // 에이전트 실행 상태 관리
  const [isAgentRunning, setIsAgentRunning] = useState(false)

  // API 키, DB 사용자 이름, 비밀번호를 환경 변수에서 가져오거나 기본값 설정
  // const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "YOUR_API_KEY"
  // const DB_USER = process.env.NEXT_PUBLIC_DB_USER || "YOUR_DB_USER"
  // const DB_PASSWORD = process.env.NEXT_PUBLIC_DB_PASSWORD || "YOUR_DB_PASSWORD"

  // 에이전트 워크스페이스에서 프로세스 어시스턴트 불러오기
  useEffect(() => {
    // 에이전트 중에서 프로세스 관련 에이전트 필터링
    const processAgents = agents.filter(
      (agent) =>
        agent.type === "specialized" &&
        (agent.name.toLowerCase().includes("프로세스") ||
          agent.name.toLowerCase().includes("process") ||
          agent.description.toLowerCase().includes("프로세스") ||
          agent.description.toLowerCase().includes("process") ||
          agent.description.toLowerCase().includes("워크플로우") ||
          agent.description.toLowerCase().includes("workflow")),
    )

    setProcessAgents(processAgents)

    // 프로세스 에이전트가 있으면 첫 번째 에이전트 선택
    if (processAgents.length > 0 && !selectedProcessAgent) {
      setSelectedProcessAgent(processAgents[0].id)
    }
  }, [agents, selectedProcessAgent])

  // 에이전트 시작/중지 토글
  const toggleAgentRunning = () => {
    setIsAgentRunning(!isAgentRunning)
    toast({
      title: isAgentRunning ? "에이전트 중지됨" : "에이전트 실행 중",
      description: isAgentRunning ? "에이전트가 중지되었습니다." : "에이전트가 실행 중입니다.",
    })
  }

  // 스크롤 함수 정의
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // 메시지가 변경될 때마다 스크롤 조정
  useEffect(() => {
    // 즉시 스크롤 시도
    scrollToBottom()

    // requestAnimationFrame을 사용하여 다음 프레임에서 스크롤
    requestAnimationFrame(scrollToBottom)

    // 약간의 지연 후 한 번 더 스크롤 (비동기 렌더링 이후 확실히 스크롤되도록)
    const timer = setTimeout(scrollToBottom, 100)

    return () => clearTimeout(timer)
  }, [messages, streamingMessage, workPlan, isGeneratingPlan])

  // 메시지에서 프로세스 블록 추출
  const extractProcessBlocks = (content: string) => {
    const processBlockRegex = /\[프로세스\s+노드:\s+([^\]]+)\]\s*\n([\s\S]*?)(?=\[프로세스|$)/g
    const processBlocks = []
    let match

    while ((match = processBlockRegex.exec(content)) !== null) {
      processBlocks.push({
        type: "node",
        name: match[1],
        config: match[2],
      })
    }

    return processBlocks
  }

  // 작업 계획 스트리밍 시뮬레이션
  const simulateWorkPlanStreaming = async (plan: string, signal?: AbortSignal) => {
    setIsGeneratingPlan(true)
    setWorkPlan("")

    const lines = plan.split("\n")

    for (let i = 0; i < lines.length; i++) {
      // 중단 신호 확인
      if (signal?.aborted) {
        throw new DOMException("사용자에 의해 중단됨", "AbortError")
      }

      await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))
      setWorkPlan((prev) => prev + lines[i] + "\n")
    }

    setIsGeneratingPlan(false)
    return plan
  }

  // 스트리밍 시뮬레이션
  const simulateStreaming = async (response: string, signal?: AbortSignal) => {
    setIsStreaming(true)
    setStreamingMessage("")

    const words = response.split(" ")

    for (let i = 0; i < words.length; i++) {
      // 중단 신호 확인
      if (signal?.aborted) {
        throw new DOMException("사용자에 의해 중단됨", "AbortError")
      }

      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 30))
      setStreamingMessage((prev) => prev + words[i] + " ")
    }

    setIsStreaming(false)
    return response
  }

  // 노드 설정 스트리밍 시뮬레이션
  const simulateNodeStreaming = async (node: ProcessNode, signal?: AbortSignal) => {
    setNodeStreaming(true)
    setStreamTarget(node.id)
    setStreamedNodeConfig("")

    const content = JSON.stringify(node.config, null, 2)
    const chars = content.split("")

    for (let i = 0; i < chars.length; i++) {
      // 중단 신호 확인
      if (signal?.aborted) {
        throw new DOMException("사용자에 의해 중단됨", "AbortError")
      }

      await new Promise((resolve) => setTimeout(resolve, 5))
      setStreamedNodeConfig((prev) => prev + chars[i])
    }

    setNodeStreaming(false)
    setStreamTarget(null)
    return content
  }

  // 메시지 전송 중지
  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsProcessing(false)
      setIsStreaming(false)
      setIsGeneratingPlan(false)
      setNodeStreaming(false)

      // 스트리밍 메시지 즉시 업데이트
      setMessages((prev) =>
        prev.map((msg) =>
          msg.streaming ? { ...msg, content: streamingMessage + "\n\n[생성 중단됨]", streaming: false } : msg,
        ),
      )

      toast({
        title: "생성 중단",
        description: "프로세스 생성이 중단되었습니다.",
      })
    }
  }

  // 새 프로세스 플로우 생성
  const createNewFlow = (name: string) => {
    const newFlow: ProcessFlow = {
      id: `flow-${Date.now()}`,
      name: name,
      description: "프로세스 빌더로 생성된 워크플로우입니다.",
      nodes: [],
      edges: [],
      createdAt: new Date(),
      lastModified: new Date(),
    }

    setActiveFlow(newFlow)
    setShowEmptyState(false)

    return newFlow
  }

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // 이미 처리 중이면 중지
    if (isProcessing) {
      handleStopGeneration()
      return
    }

    // 새 AbortController 생성
    const controller = new AbortController()
    setAbortController(controller)

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // 메시지 추가 후 스크롤 시도
    scrollToBottom()
    requestAnimationFrame(scrollToBottom)
    setTimeout(scrollToBottom, 100)

    try {
      // 선택된 프로세스 에이전트 가져오기
      const selectedAgent = processAgents.find((agent) => agent.id === selectedProcessAgent)

      // 프로세스 플로우가 없으면 새 플로우 생성
      if (!activeFlow) {
        createNewFlow("새 워크플로우")
      }

      // 작업 계획 생성 (동시 스트리밍 시작)
      const workPlanText = `
1. 요구사항 분석
2. 프로세스 구조 설계
3. 노드 생성
4. 연결 설정
5. 테스트 및 검증
`

      // 스트리밍 메시지 추가 (작업 계획)
      const streamingMessageObj: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      }

      setMessages((prev) => [...prev, streamingMessageObj])

      // 작업 계획 스트리밍 시작 (0.5초 후)
      setTimeout(() => {
        simulateWorkPlanStreaming(workPlanText, controller.signal).then((plan) => {
          // 작업 계획 스트리밍 완료 후 추가 내용 스트리밍
          const additionalContent = `
### 1. 요구사항 분석 완료

### 2. 프로세스 구조 설계
다음과 같은 프로세스 구조로 구현하겠습니다:
- 데이터 수집 노드: 외부 API에서 데이터 가져오기
- 데이터 변환 노드: 수집된 데이터 가공
- 데이터 저장 노드: 처리된 데이터 저장
`
          simulateStreaming(additionalContent, controller.signal).then((additionalText) => {
            // 스트리밍 메시지 업데이트
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageObj.id ? { ...msg, content: plan + additionalText, streaming: false } : msg,
              ),
            )
            scrollToBottom()
            requestAnimationFrame(scrollToBottom)
          })
        })
      }, 500)

      // 프로세스 노드 생성 요청 처리 (노드 생성 및 스트리밍)
      setTimeout(async () => {
        // 데이터 수집 노드 생성
        const dataCollectionNode: ProcessNode = {
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: "데이터 수집",
          type: "api",
          description: "외부 API에서 데이터를 수집합니다.",
          config: {
            url: "https://api.example.com/data",
            method: "GET",
            headers: {
              Authorization: "Bearer YOUR_API_KEY",
              "Content-Type": "application/json",
            },
            params: {
              limit: 100,
              offset: 0,
            },
            retry: {
              maxAttempts: 3,
              delay: 1000,
            },
          },
          position: { x: 100, y: 100 },
          inputs: [],
          outputs: ["data"],
          status: "created",
        }

        // 프로세스 플로우에 노드 추가
        if (activeFlow) {
          const updatedFlow = {
            ...activeFlow,
            nodes: [...activeFlow.nodes, dataCollectionNode],
            lastModified: new Date(),
          }
          setActiveFlow(updatedFlow)

          // 노드 선택 및 스트리밍 효과 적용
          setSelectedNode(dataCollectionNode)
          setActiveTab("flow")

          // 노드 설정 스트리밍 시작
          await simulateNodeStreaming(dataCollectionNode, controller.signal)

          // 프로세스 블록 내용 추가 (메시지에 프로세스 블록 추가)
          setTimeout(() => {
            const processBlockContent = `
### 3. 노드 생성

[프로세스 노드: 데이터 수집]
유형: API 요청
설명: 외부 API에서 데이터를 수집합니다.
구성:
- URL: https://api.example.com/data
- 메서드: GET
- 헤더:
  - Authorization: Bearer YOUR_API_KEY
  - Content-Type: application/json
- 매개변수:
  - limit: 100
  - offset: 0
- 재시도:
  - 최대 시도: 3
  - 지연: 1000ms
`
            // 메시지 업데이트
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageObj.id
                  ? {
                      ...msg,
                      content: msg.content + processBlockContent,
                      processBlocks: extractProcessBlocks(msg.content + processBlockContent),
                    }
                  : msg,
              ),
            )
            scrollToBottom()
            requestAnimationFrame(scrollToBottom)

            // 데이터 변환 노드 생성 (1초 후)
            setTimeout(async () => {
              const dataTransformNode: ProcessNode = {
                id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: "데이터 변환",
                type: "transform",
                description: "수집된 데이터를 가공합니다.",
                config: {
                  transformations: [
                    {
                      field: "price",
                      operation: "multiply",
                      value: 1.1,
                    },
                    {
                      field: "date",
                      operation: "format",
                      format: "YYYY-MM-DD",
                    },
                    {
                      field: "status",
                      operation: "map",
                      mapping: {
                        "0": "대기중",
                        "1": "처리중",
                        "2": "완료",
                        "3": "오류",
                      },
                    },
                  ],
                  filter: {
                    field: "price",
                    operator: "gt",
                    value: 1000,
                  },
                },
                position: { x: 300, y: 100 },
                inputs: ["data"],
                outputs: ["transformedData"],
                status: "created",
              }

              // 프로세스 플로우에 노드 추가
              if (activeFlow) {
                const updatedFlow = {
                  ...activeFlow,
                  nodes: [...activeFlow.nodes, dataTransformNode],
                  edges: [
                    ...activeFlow.edges,
                    {
                      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      source: dataCollectionNode.id,
                      target: dataTransformNode.id,
                      label: "데이터",
                    },
                  ],
                  lastModified: new Date(),
                }
                setActiveFlow(updatedFlow)

                // 노드 선택 및 스트리밍 효과 적용
                setSelectedNode(dataTransformNode)

                // 노드 설정 스트리밍 시작
                await simulateNodeStreaming(dataTransformNode, controller.signal)

                // 프로세스 블록 내용 추가 (메시지에 프로세스 블록 추가)
                const transformNodeBlock = `
[프로세스 노드: 데이터 변환]
유형: 데이터 변환
설명: 수집된 데이터를 가공합니다.
구성:
- 변환:
  - 가격: 1.1배 증가
  - 날짜: YYYY-MM-DD 형식으로 변환
  - 상태: 코드를 텍스트로 매핑 (0: 대기중, 1: 처리중, 2: 완료, 3: 오류)
- 필터:
  - 가격이 1000 초과인 항목만 처리
`
                // 메시지 업데이트
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageObj.id
                      ? {
                          ...msg,
                          content: msg.content + transformNodeBlock,
                          processBlocks: extractProcessBlocks(msg.content + transformNodeBlock),
                        }
                      : msg,
                  ),
                )
                scrollToBottom()
                requestAnimationFrame(scrollToBottom)

                // 데이터 저장 노드 생성 (1초 후)
                setTimeout(async () => {
                  const dataStorageNode: ProcessNode = {
                    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: "데이터 저장",
                    type: "storage",
                    description: "처리된 데이터를 저장합니다.",
                    config: {
                      storageType: "database",
                      connection: {
                        type: "postgres",
                        host: "db.example.com",
                        port: 5432,
                        database: "analytics",
                        username: "YOUR_DB_USER",
                        password: "YOUR_DB_PASSWORD",
                      },
                      table: "processed_data",
                      options: {
                        upsert: true,
                        batchSize: 100,
                        timestampField: "updated_at",
                      },
                    },
                    position: { x: 500, y: 100 },
                    inputs: ["transformedData"],
                    outputs: ["result"],
                    status: "created",
                  }

                  // 프로세스 플로우에 노드 추가
                  if (activeFlow) {
                    const updatedFlow = {
                      ...activeFlow,
                      nodes: [...activeFlow.nodes, dataStorageNode],
                      edges: [
                        ...activeFlow.edges,
                        {
                          id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          source: dataTransformNode.id,
                          target: dataStorageNode.id,
                          label: "변환된 데이터",
                        },
                      ],
                      lastModified: new Date(),
                    }
                    setActiveFlow(updatedFlow)

                    // 노드 선택 및 스트리밍 효과 적용
                    setSelectedNode(dataStorageNode)

                    // 노드 설정 스트리밍 시작
                    await simulateNodeStreaming(dataStorageNode, controller.signal)

                    // 프로세스 블록 내용 추가 (메시지에 프로세스 블록 추가)
                    const storageNodeBlock = `
[프로세스 노드: 데이터 저장]
유형: 데이터 저장
설명: 처리된 데이터를 저장합니다.
구성:
- 저장소 유형: 데이터베이스
- 연결:
  - 유형: PostgreSQL
  - 호스트: db.example.com
  - 포트: 5432
  - 데이터베이스: analytics
  - 사용자 이름: YOUR_DB_USER
  - 비밀번호: YOUR_DB_PASSWORD
- 테이블: processed_data
- 옵션:
  - 업서트: 활성화
  - 배치 크기: 100
  - 타임스탬프 필드: updated_at

### 4. 연결 설정 완료

### 5. 테스트 및 검증 완료

모든 노드가 성공적으로 생성되었습니다. 이제 프로세스를 실행하거나 필요에 따라 수정할 수 있습니다.
`
                    // 메시지 업데이트
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === streamingMessageObj.id
                          ? {
                              ...msg,
                              content: msg.content + storageNodeBlock,
                              processBlocks: extractProcessBlocks(msg.content + storageNodeBlock),
                            }
                          : msg,
                      ),
                    )
                    scrollToBottom()
                    requestAnimationFrame(scrollToBottom)
                  }
                }, 1000)
              }
            }, 1000)
          }, 1000)
        }
      }, 1000)
    } catch (error) {
      // AbortError는 사용자가 의도적으로 중단한 것이므로 오류 메시지 표시하지 않음
      if (error.name !== "AbortError") {
        console.error("프로세스 생성 오류:", error)
        toast({
          title: "오류 발생",
          description: "프로세스 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        })

        // 오류 메시지 업데이트
        setMessages((prev) =>
          prev.map((msg) =>
            msg.streaming ? { ...msg, content: "프로세스 생성 중 오류가 발생했습니다.", streaming: false } : msg,
          ),
        )
      }
    } finally {
      // 최종 처리는 모든 스트리밍이 완료된 후에 진행
      setTimeout(() => {
        setIsProcessing(false)
        setAbortController(null)
      }, 5000)
    }
  }

  // 프로세스 실행
  const handleExecuteProcess = async (node = selectedNode) => {
    if (!node) return

    setExecutionStatus("running")
    setExecutionResult("프로세스 실행 중...")
    setActiveTab("terminal")

    try {
      // 실제 구현에서는 API 호출 또는 샌드박스 환경에서 실행
      // 여기서는 예시 결과 반환
      await new Promise((resolve) => setTimeout(resolve, 800))

      setExecutionStatus("success")
      const result = `// 실행 결과
[2025-04-01 19:48:00] 프로세스 시작: ${activeFlow?.name}
[2025-04-01 19:48:01] 노드 실행: 데이터 수집 - 성공 (100개 항목 수집)
[2025-04-01 19:48:02] 노드 실행: 데이터 변환 - 성공 (87개 항목 변환)
[2025-04-01 19:48:03] 노드 실행: 데이터 저장 - 성공 (87개 항목 저장)
[2025-04-01 19:48:03] 프로세스 완료: 총 87개 항목 처리됨
`
      setExecutionResult(result)
      setPreviewContent(result)

      toast({
        title: "실행 완료",
        description: "프로세스가 성공적으로 실행되었습니다.",
      })
    } catch (error) {
      console.error("프로세스 실행 오류:", error)
      setExecutionStatus("error")
      setExecutionResult(`오류 발생: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "실행 오류",
        description: "프로세스 실행 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 노드 저장
  const handleSaveNode = () => {
    if (!selectedNode || !activeFlow) return

    // 실제 구현에서는 API 호출 또는 로컬 스토리지에 저장
    toast({
      title: "저장 완료",
      description: `${selectedNode.name} 노드가 저장되었습니다.`,
    })
  }

  // 노드 상태에 따른 아이콘 색상
  const getNodeStatusColor = (status?: string) => {
    switch (status) {
      case "created":
        return "text-blue-500"
      case "modified":
        return "text-yellow-500"
      case "verified":
        return "text-green-500"
      case "tested":
        return "text-purple-500"
      case "optimized":
        return "text-indigo-500"
      default:
        return "text-gray-400"
    }
  }

  // 메시지 렌더링
  const renderMessage = (message: Message) => {
    // 스트리밍 중인 메시지 처리
    if (message.streaming) {
      return (
        <div className="mb-4">
          <div className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role !== "user" && (
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                PB
              </div>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-black text-white"}`}
            >
              <div>
                {isGeneratingPlan ? (
                  <div className="whitespace-pre-wrap">
                    {workPlan}
                    <span className="animate-pulse">▋</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="animate-pulse">▋</span>
                  </div>
                )}
              </div>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                나
              </div>
            )}
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</div>
        </div>
      )
    }

    // 프로세스 블록 정규식
    const processBlockRegex = /\[프로세스\s+노드:\s+([^\]]+)\]\s*\n([\s\S]*?)(?=\[프로세스|$)/g

    // 메시지 내용을 프로세스 블록과 일반 텍스트로 분리
    const parts = []
    let lastIndex = 0
    let match

    // 메시지 내용 복제
    const content = message.content

    // 프로세스 블록 찾기
    while ((match = processBlockRegex.exec(content)) !== null) {
      // 프로세스 블록 앞의 텍스트 추가
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        })
      }

      // 프로세스 블록 추가
      parts.push({
        type: "process",
        name: match[1],
        config: match[2],
      })

      lastIndex = match.index + match[0].length
    }

    // 마지막 텍스트 추가
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      })
    }

    return (
      <div className="mb-4">
        <div className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role !== "user" && (
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">PB</div>
          )}
          <div
            className={`rounded-lg p-3 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-black text-white"}`}
          >
            <div className="space-y-3">
              {parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <div key={index} className="whitespace-pre-wrap">
                      {part.content}
                    </div>
                  )
                } else if (part.type === "process") {
                  return (
                    <div key={index} className="bg-[#1e1e1e] rounded border border-gray-700 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700 bg-[#2d2d2d]">
                        <div className="flex items-center">
                          <Workflow className="h-4 w-4 mr-2" />
                          <span className="font-medium">{part.name || "프로세스 노드"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-gray-700"
                            onClick={() => {
                              navigator.clipboard.writeText(part.config)
                              toast({
                                title: "복사 완료",
                                description: "프로세스 설정이 클립보드에 복사되었습니다.",
                              })
                            }}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">복사</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-gray-700"
                            onClick={() => {
                              // 프로세스 블록에서 노드 생성
                              if (activeFlow) {
                                const newNode = {
                                  id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                  name: part.name,
                                  type: part.name.toLowerCase().includes("수집")
                                    ? "api"
                                    : part.name.toLowerCase().includes("변환")
                                      ? "transform"
                                      : "storage",
                                  description: `${part.name} 노드`,
                                  config: {},
                                  position: {
                                    x: 100 + Math.random() * 200,
                                    y: 100 + Math.random() * 100,
                                  },
                                  inputs: [],
                                  outputs: ["data"],
                                  status: "created" as const,
                                }

                                const updatedFlow = {
                                  ...activeFlow,
                                  nodes: [...activeFlow.nodes, newNode],
                                  lastModified: new Date(),
                                }

                                setActiveFlow(updatedFlow)
                                setSelectedNode(newNode)
                                setActiveTab("flow")

                                toast({
                                  title: "노드 생성 완료",
                                  description: `${newNode.name} 노드가 생성되었습니다.`,
                                })
                              }
                            }}
                          >
                            <Play className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">실행</span>
                          </Button>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="overflow-x-auto p-2">
                          <pre className="leading-6 whitespace-pre text-white">{part.config}</pre>
                        </div>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
          {message.role === "user" && (
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
              나
            </div>
          )}
        </div>
        <div className="text-xs text-center text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</div>
      </div>
    )
  }

  // 플로우 탐색기 토글 버튼
  const toggleFlowExplorer = () => {
    setIsFlowExplorerVisible(!isFlowExplorerVisible)
  }

  // 한글 입력 처리를 위한 함수
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 입력 중에는 Enter 키 처리 방지
    if (e.key === "Enter" && !e.shiftKey) {
      // isComposing 속성으로 한글 조합 중인지 확인
      if (!e.nativeEvent.isComposing) {
        e.preventDefault()
        if (input.trim()) {
          handleSendMessage()
        }
      }
    }
  }

  // 간단한 프로세스 플로우 다이어그램 렌더링
  const renderFlowDiagram = () => {
    if (!activeFlow || !activeFlow.nodes.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Workflow className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">프로세스 노드가 없습니다</h3>
            <p className="text-muted-foreground">채팅에서 프로세스 생성을 요청하면 자동으로 노드가 생성됩니다.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full w-full bg-gray-50 relative p-4 overflow-auto">
        <div className="absolute top-0 left-0 right-0 bottom-0">
          {/* 노드 렌더링 */}
          {activeFlow.nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute p-3 rounded-lg shadow-md w-48 cursor-pointer ${
                selectedNode?.id === node.id ? "ring-2 ring-primary" : ""
              }`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                backgroundColor: node.type === "api" ? "#f0f9ff" : node.type === "transform" ? "#fdf2f8" : "#f0fdf4",
                borderColor: node.type === "api" ? "#bae6fd" : node.type === "transform" ? "#fbcfe8" : "#bbf7d0",
                borderWidth: 1,
              }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {node.type === "api" ? (
                    <Zap className="h-4 w-4 mr-1 text-blue-500" />
                  ) : node.type === "transform" ? (
                    <Settings className="h-4 w-4 mr-1 text-pink-500" />
                  ) : (
                    <Layers className="h-4 w-4 mr-1 text-green-500" />
                  )}
                  <span className="font-medium text-sm truncate">{node.name}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    node.type === "api"
                      ? "bg-blue-50 text-blue-700"
                      : node.type === "transform"
                        ? "bg-pink-50 text-pink-700"
                        : "bg-green-50 text-green-700"
                  }`}
                >
                  {node.type}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 truncate">{node.description}</div>
            </div>
          ))}

          {/* 엣지 렌더링 (간단한 화살표) */}
          {activeFlow.edges.map((edge) => {
            const sourceNode = activeFlow.nodes.find((n) => n.id === edge.source)
            const targetNode = activeFlow.nodes.find((n) => n.id === edge.target)

            if (!sourceNode || !targetNode) return null

            // 소스 노드와 타겟 노드의 중심점 계산
            const sourceX = sourceNode.position.x + 96 // 노드 너비의 절반
            const sourceY = sourceNode.position.y + 30 // 노드 높이의 절반
            const targetX = targetNode.position.x
            const targetY = targetNode.position.y + 30 // 노드 높이의 절반

            return (
              <div key={edge.id} className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <svg width="100%" height="100%" className="absolute top-0 left-0">
                  <defs>
                    <marker
                      id={`arrowhead-${edge.id}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="0"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                  </defs>
                  <path
                    d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    fill="none"
                    markerEnd={`url(#arrowhead-${edge.id})}`}
                  />
                  {edge.label && (
                    <text
                      x={(sourceX + targetX) / 2}
                      y={(sourceY + targetY) / 2 - 5}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="10"
                      className="bg-white px-1"
                    >
                      {edge.label}
                    </text>
                  )}
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    // 전체 컨테이너에 h-screen 적용
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {/* 왼쪽 패널: 채팅 인터페이스 */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="border-b p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Workflow className="h-4 w-4 mr-2 text-primary" />
                <h2 className="font-semibold">프로세스 빌더</h2>
              </div>

              <div className="flex items-center space-x-2">
                {processAgents.length > 0 ? (
                  <>
                    <select
                      className="border rounded px-2 py-1 h-7"
                      value={selectedProcessAgent || ""}
                      onChange={(e) => setSelectedProcessAgent(e.target.value)}
                    >
                      {processAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant={isAgentRunning ? "destructive" : "default"}
                      size="sm"
                      className="h-7"
                      onClick={toggleAgentRunning}
                    >
                      {isAgentRunning ? "중지" : "실행"}
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline">기본 프로세스 어시스턴트</Badge>
                )}
              </div>
            </div>

            <div className="text-muted-foreground">
              프로세스 생성 요청을 입력하세요. 자세한 설명일수록 더 정확한 프로세스가 생성됩니다.
            </div>
          </div>

          {/* 채팅 메시지 영역 - 스크롤 문제 해결을 위한 구조 변경 */}
          <div
            className="flex-1 overflow-y-auto p-2"
            ref={chatContainerRef}
            style={{
              overscrollBehavior: "contain",
              maxHeight: "calc(100vh - 180px)", // 헤더와 입력창 높이를 제외한 값
            }}
          >
            {messages.map((message) => (
              <div key={message.id}>{renderMessage(message)}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-2">
            <div className="flex items-center space-x-2">
              <Textarea
                placeholder="프로세스 생성 요청을 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] max-h-[120px]"
                ref={textareaRef}
              />
              <Button onClick={handleSendMessage} className="h-full" variant={isProcessing ? "destructive" : "default"}>
                {isProcessing ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-muted-foreground">{isProcessing ? "처리 중..." : "준비 완료"}</div>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* 오른쪽 패널: 프로세스 에디터 및 플로우 탐색기 */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="border-b p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Workflow className="h-4 w-4 mr-2 text-primary" />
                <h2 className="font-semibold">{selectedNode ? selectedNode.name : "프로세스 에디터"}</h2>
                {selectedNode?.status && (
                  <Badge variant="outline" className="ml-2">
                    {selectedNode.status}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-7" onClick={handleSaveNode} disabled={!selectedNode}>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  저장
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => handleExecuteProcess()}
                  disabled={!selectedNode || executionStatus === "running"}
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  실행
                </Button>
                <Button variant="outline" size="sm" className="h-7" onClick={toggleFlowExplorer}>
                  {isFlowExplorerVisible ? (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="flow" className="h-7">
                  <Workflow className="h-3.5 w-3.5 mr-1" />
                  플로우
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-7">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  미리보기
                </TabsTrigger>
                <TabsTrigger value="terminal" className="h-7">
                  <Terminal className="h-3.5 w-3.5 mr-1" />
                  터미널
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flow" className="mt-2 h-[calc(100vh-140px)]">
                <ResizablePanelGroup direction="horizontal">
                  {/* 플로우 디렉토리 */}
                  {isFlowExplorerVisible && (
                    <>
                      <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                        <div className="h-full border-r">
                          <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center">
                              <FolderTree className="h-3.5 w-3.5 mr-1" />
                              <span className="font-medium">플로우 탐색기</span>
                            </div>
                            {activeFlow && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  if (activeFlow) {
                                    // 새 노드 생성 (빈 노드)
                                    const newNode: ProcessNode = {
                                      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                      name: `새 노드 ${activeFlow.nodes.length + 1}`,
                                      type: "custom",
                                      description: "새 프로세스 노드",
                                      config: {},
                                      position: { x: 100, y: 100 },
                                      inputs: [],
                                      outputs: ["data"],
                                      status: "created",
                                    }

                                    const updatedFlow = {
                                      ...activeFlow,
                                      nodes: [...activeFlow.nodes, newNode],
                                      lastModified: new Date(),
                                    }

                                    setActiveFlow(updatedFlow)
                                    setSelectedNode(newNode)

                                    toast({
                                      title: "노드 생성",
                                      description: "새 노드가 생성되었습니다.",
                                    })
                                  }
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>

                          <div className="h-[calc(100%-30px)] overflow-y-auto">
                            {showEmptyState && !activeFlow?.nodes?.length ? (
                              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <FolderTree className="h-10 w-10 text-muted-foreground mb-2" />
                                <h3 className="font-medium mb-1">노드가 없습니다</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                  채팅에서 프로세스 생성을 요청하면 자동으로 노드가 생성됩니다.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    createNewFlow("새 워크플로우")
                                    toast({
                                      title: "워크플로우 생성",
                                      description: "새 워크플로우가 생성되었습니다.",
                                    })
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />새 워크플로우 생성
                                </Button>
                              </div>
                            ) : (
                              <div className="p-2">
                                {activeFlow && (
                                  <div>
                                    <div className="flex items-center p-1 rounded-md hover:bg-accent">
                                      <Folder className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                      <span>{activeFlow.name}</span>
                                    </div>

                                    <div className="ml-3 mt-1 space-y-1">
                                      {activeFlow.nodes.map((node) => (
                                        <div
                                          key={node.id}
                                          className={`flex items-center p-1 rounded-md cursor-pointer ${
                                            selectedNode?.id === node.id ? "bg-accent" : "hover:bg-accent/50"
                                          }`}
                                          onClick={() => setSelectedNode(node)}
                                        >
                                          {node.type === "api" ? (
                                            <Zap className={`h-3.5 w-3.5 mr-1 ${getNodeStatusColor(node.status)}`} />
                                          ) : node.type === "transform" ? (
                                            <Settings
                                              className={`h-3.5 w-3.5 mr-1 ${getNodeStatusColor(node.status)}`}
                                            />
                                          ) : (
                                            <Layers className={`h-3.5 w-3.5 mr-1 ${getNodeStatusColor(node.status)}`} />
                                          )}
                                          <span>{node.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </ResizablePanel>

                      <ResizableHandle withHandle />
                    </>
                  )}

                  {/* 프로세스 플로우 에디터 */}
                  <ResizablePanel defaultSize={isFlowExplorerVisible ? 80 : 100}>
                    <div className="h-full flex flex-col">
                      {/* 플로우 다이어그램 */}
                      <div className="flex-1 overflow-hidden border rounded-md">{renderFlowDiagram()}</div>

                      {/* 선택된 노드 설정 */}
                      {selectedNode && (
                        <div className="h-1/3 mt-2 border rounded-md overflow-auto">
                          <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center">
                              {selectedNode.type === "api" ? (
                                <Zap className="h-3.5 w-3.5 mr-1 text-blue-500" />
                              ) : selectedNode.type === "transform" ? (
                                <Settings className="h-3.5 w-3.5 mr-1 text-pink-500" />
                              ) : (
                                <Layers className="h-3.5 w-3.5 mr-1 text-green-500" />
                              )}
                              <span className="font-medium">{selectedNode.name} 설정</span>
                            </div>
                            <Badge variant="outline">{selectedNode.type}</Badge>
                          </div>

                          <div className="p-2">
                            <div className="text-sm text-muted-foreground mb-2">{selectedNode.description}</div>
                            <div className="bg-muted p-2 rounded-md font-mono text-xs overflow-auto max-h-[200px]">
                              {nodeStreaming && streamTarget === selectedNode.id ? (
                                <pre className="whitespace-pre-wrap">
                                  {streamedNodeConfig}
                                  <span className="animate-pulse">▋</span>
                                </pre>
                              ) : (
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(selectedNode.config, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              <TabsContent value="preview" className="mt-2 h-[calc(100vh-140px)]">
                <div className="border rounded-md h-full overflow-auto bg-white">
                  <div className="border-b p-2 flex items-center justify-between bg-gray-50">
                    <div className="font-medium text-gray-700">실행 결과 미리보기</div>
                    {previewContent && (
                      <Button variant="outline" size="sm" className="h-6" onClick={() => setPreviewContent("")}>
                        초기화
                      </Button>
                    )}
                  </div>

                  {previewContent ? (
                    <div className="p-4">
                      <pre className="font-mono whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                        {previewContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[calc(100%-40px)]">
                      <div className="text-center">
                        <Play className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-medium mb-1">미리보기</h3>
                        <p className="text-muted-foreground">프로세스 실행 결과가 여기에 표시됩니다.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="terminal" className="mt-2 h-[calc(100vh-140px)]">
                <div className="border rounded-md bg-[#1e1e1e] text-green-400 p-3 font-mono h-full overflow-auto">
                  <div className="border-b border-gray-700 pb-2 mb-2 text-gray-400">터미널 - 프로세스 실행</div>
                  {executionStatus === "idle" ? (
                    <div className="text-gray-500 flex items-center">
                      <span className="text-green-400 mr-2">$</span>
                      <span>프로세스를 실행하면 결과가 여기에 표시됩니다.</span>
                    </div>
                  ) : executionStatus === "running" ? (
                    <div>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <span className="text-gray-300">run-process {activeFlow?.name}</span>
                      </div>
                      <div className="mt-2 flex items-center text-yellow-300">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                        실행 중...
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <span className="text-gray-300">run-process {activeFlow?.name}</span>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap text-white border-l-2 border-gray-600 pl-2 py-1">
                        {executionResult}
                      </pre>
                      <div className="mt-2 flex items-center">
                        {executionStatus === "success" ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                            <span className="text-green-500">실행 완료 (0 오류)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                            <span className="text-red-500">실행 실패</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

// 기존 import 방식과의 호환성을 위해 default export도 추가
export default ProcessBuilderInterface
