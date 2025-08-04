"use client"

import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar } from "@/components/ui/avatar"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  Workflow,
  Plus,
  Puzzle,
  Link,
  Database,
  MessageSquare,
  FileCode,
  Cloud,
  Check,
  AlertCircle,
  Loader2,
  Github,
  Slack,
  Trello,
  DropletIcon as Dropbox,
  Play,
  ArrowRight,
  Settings,
  Trash,
  Save,
  RefreshCw,
  Edit,
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  Cog,
  Layers,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { getLLMService } from "@/lib/llm-service"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: string
}

export function IntegrationHub() {
  // 통합 상태
  const [integrations, setIntegrations] = useState([
    {
      id: "integration-1",
      name: "PostgreSQL 데이터베이스",
      type: "database",
      description: "메인 데이터베이스 연결",
      icon: <Database className="h-5 w-5 text-blue-500" />,
      status: "connected",
      connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전
      error: null,
      config: {
        host: "db.example.com",
        port: 5432,
        database: "main",
        username: "user",
        password: "********",
      },
    },
  ])

  // 사용 가능한 통합
  const [availableIntegrations, setAvailableIntegrations] = useState([
    {
      id: "available-1",
      name: "PostgreSQL",
      type: "database",
      description: "PostgreSQL 데이터베이스 연결",
      icon: <Database className="h-5 w-5 text-blue-500" />,
      configTemplate: {
        host: { type: "string", required: true, default: "localhost" },
        port: { type: "number", required: true, default: 5432 },
        database: { type: "string", required: true },
        username: { type: "string", required: true },
        password: { type: "password", required: true },
      },
    },
    {
      id: "available-2",
      name: "MySQL",
      type: "database",
      description: "MySQL 데이터베이스 연결",
      icon: <Database className="h-5 w-5 text-orange-500" />,
      configTemplate: {
        host: { type: "string", required: true, default: "localhost" },
        port: { type: "number", required: true, default: 3306 },
        database: { type: "string", required: true },
        username: { type: "string", required: true },
        password: { type: "password", required: true },
      },
    },
    {
      id: "available-3",
      name: "MongoDB",
      type: "database",
      description: "MongoDB 데이터베이스 연결",
      icon: <Database className="h-5 w-5 text-green-500" />,
      configTemplate: {
        connectionString: { type: "string", required: true, default: "mongodb://localhost:27017" },
        database: { type: "string", required: true },
        username: { type: "string", required: false },
        password: { type: "password", required: false },
      },
    },
    {
      id: "available-4",
      name: "Slack",
      type: "messaging",
      description: "Slack 메시징 통합",
      icon: <Slack className="h-5 w-5 text-green-500" />,
      configTemplate: {
        webhookUrl: { type: "string", required: true },
        channel: { type: "string", required: false },
        username: { type: "string", required: false },
      },
    },
    {
      id: "available-5",
      name: "Discord",
      type: "messaging",
      description: "Discord 메시징 통합",
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      configTemplate: {
        webhookUrl: { type: "string", required: true },
        username: { type: "string", required: false },
      },
    },
    {
      id: "available-6",
      name: "GitHub",
      type: "development",
      description: "GitHub 저장소 통합",
      icon: <Github className="h-5 w-5 text-gray-800" />,
      configTemplate: {
        token: { type: "password", required: true },
        owner: { type: "string", required: true },
        repo: { type: "string", required: true },
      },
    },
    {
      id: "available-7",
      name: "GitLab",
      type: "development",
      description: "GitLab 저장소 통합",
      icon: <FileCode className="h-5 w-5 text-orange-600" />,
      configTemplate: {
        token: { type: "password", required: true },
        projectId: { type: "string", required: true },
      },
    },
    {
      id: "available-8",
      name: "Trello",
      type: "project",
      description: "Trello 프로젝트 관리 통합",
      icon: <Trello className="h-5 w-5 text-blue-400" />,
      configTemplate: {
        apiKey: { type: "password", required: true },
        token: { type: "password", required: true },
        boardId: { type: "string", required: true },
      },
    },
    {
      id: "available-9",
      name: "AWS S3",
      type: "cloud",
      description: "AWS S3 스토리지 통합",
      icon: <Cloud className="h-5 w-5 text-yellow-600" />,
      configTemplate: {
        accessKeyId: { type: "string", required: true },
        secretAccessKey: { type: "password", required: true },
        region: { type: "string", required: true, default: "us-east-1" },
        bucket: { type: "string", required: true },
      },
    },
    {
      id: "available-10",
      name: "Dropbox",
      type: "cloud",
      description: "Dropbox 파일 스토리지 통합",
      icon: <Dropbox className="h-5 w-5 text-blue-600" />,
      configTemplate: {
        accessToken: { type: "password", required: true },
        refreshToken: { type: "password", required: true },
        rootFolder: { type: "string", required: false, default: "/" },
      },
    },
  ])

  // 연결된 서비스
  const [connectedServices, setConnectedServices] = useState([
    {
      id: "service-1",
      name: "데이터베이스 서비스",
      type: "database",
      status: "active",
    },
  ])

  // 워크플로우
  const [workflows, setWorkflows] = useState([
    {
      id: "workflow-1",
      name: "데이터 동기화",
      description: "데이터베이스 간 데이터 동기화",
      type: "sequential",
      steps: [
        {
          id: "step-1",
          name: "소스 데이터 조회",
          type: "database",
          config: {
            query: "SELECT * FROM users WHERE updated_at > :lastSyncTime",
            params: { lastSyncTime: "2023-01-01" },
          },
          next: ["step-2"],
        },
        {
          id: "step-2",
          name: "데이터 변환",
          type: "transform",
          config: {
            source: "$.results.step-1",
            transformations: [
              {
                type: "map",
                mapping: {
                  id: "item.id",
                  fullName: "item.first_name + ' ' + item.last_name",
                  email: "item.email",
                  updatedAt: "item.updated_at",
                },
              },
            ],
          },
          next: ["step-3"],
        },
        {
          id: "step-3",
          name: "대상 데이터베이스 업데이트",
          type: "database",
          config: {
            query:
              "INSERT INTO users_sync (id, full_name, email, updated_at) VALUES (:id, :fullName, :email, :updatedAt) ON CONFLICT (id) DO UPDATE SET full_name = :fullName, email = :email, updated_at = :updatedAt",
            params: "$.results.step-2",
          },
          next: [],
        },
      ],
      startStepId: "step-1",
      endStepIds: ["step-3"],
      status: "active",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
    },
    {
      id: "workflow-2",
      name: "고객 데이터 분석",
      description: "고객 데이터를 분석하고 인사이트를 Slack으로 전송",
      type: "sequential",
      steps: [
        {
          id: "step-1",
          name: "고객 데이터 조회",
          type: "database",
          config: {
            query: "SELECT * FROM customers WHERE created_at > :lastAnalysisDate",
            params: { lastAnalysisDate: "2023-01-01" },
          },
          next: ["step-2"],
        },
        {
          id: "step-2",
          name: "데이터 분석",
          type: "agent",
          config: { agentId: "customer-data-analyzer" },
          next: ["step-3"],
        },
        {
          id: "step-3",
          name: "Slack 알림 전송",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["analytics-team"],
            message: "고객 데이터 분석 결과: {insights}",
          },
          next: [],
        },
      ],
      startStepId: "step-1",
      endStepIds: ["step-3"],
      status: "active",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    },
    {
      id: "workflow-3",
      name: "이슈 자동 처리",
      description: "GitHub 이슈를 자동으로 분류하고 담당자 할당",
      type: "conditional",
      steps: [
        {
          id: "step-1",
          name: "GitHub 이슈 조회",
          type: "development",
          config: {
            action: "getIssues",
            repo: "organization/repo",
            state: "open",
            labels: "",
          },
          next: ["step-2"],
        },
        {
          id: "step-2",
          name: "이슈 분류",
          type: "agent",
          config: { agentId: "issue-classifier" },
          next: ["step-3"],
        },
        {
          id: "step-3",
          name: "우선순위 확인",
          type: "condition",
          config: { condition: "data.priority > 7" },
          next: ["step-4a", "step-4b"],
        },
        {
          id: "step-4a",
          name: "긴급 이슈 처리",
          type: "notification",
          config: {
            channel: "slack",
            recipients: ["urgent-team"],
            message: "긴급 이슈 발생: {issue.title}",
          },
          next: [],
        },
        {
          id: "step-4b",
          name: "일반 이슈 할당",
          type: "development",
          config: {
            action: "assignIssue",
            issueId: "{issue.id}",
            assignee: "{assignee}",
          },
          next: [],
        },
      ],
      startStepId: "step-1",
      endStepIds: ["step-4a", "step-4b"],
      status: "active",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 전
    },
  ])

  // 상태 변수
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>("integration-1")
  const [activeTab, setActiveTab] = useState("integrations")
  const [activeIntegrationType, setActiveIntegrationType] = useState<string | null>(null)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [selectedIntegrationType, setSelectedIntegrationType] = useState("")
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, any>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false)
  const [workflowResults, setWorkflowResults] = useState<any>(null)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    type: "sequential",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [workflowSettings, setWorkflowSettings] = useState({
    name: "",
    description: "",
    type: "sequential",
    status: "active",
  })

  // 프로세스 빌더 상태
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "안녕하세요! 프로세스 빌더입니다. 어떤 프로세스를 만들고 싶으신가요?",
      role: "assistant",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProcess, setCurrentProcess] = useState<any>(null)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [processSteps, setProcessSteps] = useState<any[]>([])
  const [processExecutionResults, setProcessExecutionResults] = useState<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 메시지가 추가될 때마다 스크롤 영역을 아래로 이동
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages])

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId)
  const selectedIntegration = integrations.find((i) => i.id === selectedIntegrationId)

  // 필터링된 통합 목록
  const filteredIntegrations = availableIntegrations.filter((integration) => {
    if (activeIntegrationType && integration.type !== activeIntegrationType) {
      return false
    }
    if (searchQuery) {
      return (
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  // 통합 연결 다이얼로그 열기
  const handleOpenIntegrationDialog = (type: string) => {
    const integration = availableIntegrations.find((i) => i.type === type)
    if (!integration) return

    setSelectedIntegrationType(type)
    setConnectionError(null)

    // 기본 구성 생성
    const defaultConfig: Record<string, any> = {}
    for (const [key, value] of Object.entries(integration.configTemplate)) {
      if (value.default !== undefined) {
        defaultConfig[key] = value.default
      } else {
        defaultConfig[key] = ""
      }
    }

    setIntegrationConfig(defaultConfig)
    setShowIntegrationDialog(true)
  }

  // 특정 통합 연결 다이얼로그 열기
  const handleOpenSpecificIntegrationDialog = (integrationId: string) => {
    const integration = availableIntegrations.find((i) => i.id === integrationId)
    if (!integration) return

    setSelectedIntegrationType(integration.type)
    setConnectionError(null)

    // 기본 구성 생성
    const defaultConfig: Record<string, any> = {}
    for (const [key, value] of Object.entries(integration.configTemplate)) {
      if (value.default !== undefined) {
        defaultConfig[key] = value.default
      } else {
        defaultConfig[key] = ""
      }
    }

    setIntegrationConfig(defaultConfig)
    setShowIntegrationDialog(true)
  }

  // 통합 추가
  const handleAddIntegration = () => {
    setIsConnecting(true)
    setConnectionError(null)

    // 통합 연결 시뮬레이션
    setTimeout(() => {
      const integration = availableIntegrations.find((i) => i.type === selectedIntegrationType)
      if (!integration) {
        setConnectionError("통합을 찾을 수 없습니다.")
        setIsConnecting(false)
        return
      }

      // 필수 필드 검증
      for (const [key, value] of Object.entries(integration.configTemplate)) {
        if (value.required && (!integrationConfig[key] || integrationConfig[key].trim() === "")) {
          setConnectionError(`${key} 필드는 필수입니다.`)
          setIsConnecting(false)
          return
        }
      }

      // 새 통합 생성
      const newIntegration = {
        id: `integration-${Date.now()}`,
        name: `${integration.name} 연결`,
        type: integration.type,
        description: integration.description,
        icon: integration.icon,
        status: "connected" as const,
        connectedAt: new Date().toISOString(),
        lastUsed: null,
        error: null,
        config: { ...integrationConfig },
      }

      // 새 서비스 추가
      const newService = {
        id: `service-${Date.now()}`,
        name: `${integration.name} 서비스`,
        type: integration.type,
        status: "active" as const,
      }

      setIntegrations([...integrations, newIntegration])
      setConnectedServices([...connectedServices, newService])
      setSelectedIntegrationId(newIntegration.id)
      setShowIntegrationDialog(false)
      setIsConnecting(false)
    }, 2000)
  }

  // 통합 제거
  const handleRemoveIntegration = (id: string) => {
    const integration = integrations.find((i) => i.id === id)
    if (!integration) return

    // 관련 서비스 제거
    const newConnectedServices = connectedServices.filter(
      (s) => !(s.type === integration.type && s.name === `${integration.name.split(" ")[0]} 서비스`),
    )

    setIntegrations(integrations.filter((i) => i.id !== id))
    setConnectedServices(newConnectedServices)

    if (selectedIntegrationId === id) {
      setSelectedIntegrationId(integrations.length > 1 ? integrations[0].id : null)
    }
  }

  // 통합 테스트
  const handleTestIntegration = (id: string) => {
    const integration = integrations.find((i) => i.id === id)
    if (!integration) return

    // 테스트 시뮬레이션
    const updatedIntegrations = integrations.map((i) =>
      i.id === id
        ? {
            ...i,
            status: "connected" as const,
            lastUsed: new Date().toISOString(),
            error: null,
          }
        : i,
    )

    setIntegrations(updatedIntegrations)
  }

  // 워크플로우 실행
  const handleRunWorkflow = (id: string) => {
    const workflow = workflows.find((w) => w.id === id)
    if (!workflow) return

    setIsRunningWorkflow(true)
    setWorkflowResults(null)

    // 워크플로우 실행 시뮬레이션
    setTimeout(() => {
      const results = {
        success: true,
        executionTime: "2.8초",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2800).toISOString(),
        steps: workflow.steps.map((step, index) => ({
          id: step.id,
          name: step.name,
          status: "completed",
          startTime: new Date(Date.now() + index * 800).toISOString(),
          endTime: new Date(Date.now() + (index + 1) * 800).toISOString(),
          output: {
            data: `${step.name} 단계 실행 결과 데이터`,
            metadata: {
              processingTime: Math.floor(Math.random() * 500) + 100,
              memoryUsage: Math.floor(Math.random() * 30) + 5 + "MB",
            },
          },
        })),
        output: {
          summary: "워크플로우가 성공적으로 실행되었습니다.",
          data: {
            processedItems: Math.floor(Math.random() * 50) + 10,
            successRate: "97.2%",
          },
        },
      }

      setWorkflowResults(results)
      setIsRunningWorkflow(false)
    }, 3000)
  }

  // 새 워크플로우 생성
  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) return

    const newId = `workflow-${workflows.length + 1}`
    const newWorkflowItem = {
      id: newId,
      name: newWorkflow.name,
      description: newWorkflow.description,
      type: newWorkflow.type as "sequential" | "parallel" | "conditional",
      steps: [],
      startStepId: "",
      endStepIds: [],
      status: "active" as const,
      createdAt: new Date().toISOString(),
    }

    setWorkflows([...workflows, newWorkflowItem])
    setSelectedWorkflowId(newId)
    setShowWorkflowDialog(false)

    // 폼 초기화
    setNewWorkflow({
      name: "",
      description: "",
      type: "sequential",
    })
  }

  // 워크플로우 삭제
  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter((workflow) => workflow.id !== id))
    setSelectedWorkflowId(null)
  }

  // 구성 필드 렌더링
  const renderConfigField = (key: string, field: any) => {
    return (
      <div key={key} className="space-y-2">
        <label className="text-sm font-medium">
          {key}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Input
          type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
          placeholder={`${key} 입력`}
          value={integrationConfig[key] || ""}
          onChange={(e) =>
            setIntegrationConfig({
              ...integrationConfig,
              [key]: field.type === "number" ? Number(e.target.value) : e.target.value,
            })
          }
        />
      </div>
    )
  }

  // 프로세스 빌더 - 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // 사용자 요청 처리
      await processUserRequest(input)
    } catch (error) {
      console.error("요청 처리 오류:", error)

      // 오류 메시지 추가
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  // 사용자 요청 처리
  const processUserRequest = async (userInput: string) => {
    // LLM 서비스 가져오기
    const llmService = getLLMService("your-api-key") // 실제 구현에서는 API 키를 전달

    // 1. 요청 분석 단계
    setProcessingStage("analyzing")
    addAssistantMessage("요청을 분석 중입니다...")

    // 요청 분석 프롬프트
    const analysisPrompt = `
사용자 요청: "${userInput}"

이 요청을 분석하여 다음 정보를 JSON 형식으로 반환해주세요:
{
  "requestType": "프로세스 생성 요청 유형 (workflow, integration, automation 등)",
  "processName": "생성할 프로세스 이름",
  "processDescription": "프로세스 설명",
  "processType": "sequential, parallel, conditional 중 하나",
  "requiredIntegrations": ["필요한 통합 유형 목록"],
  "estimatedSteps": ["예상되는 단계 목록"]
}

JSON 형식으로만 응답해주세요.
`

    try {
      const analysisResponse = await llmService.generateText(analysisPrompt)

      // JSON 파싱
      let analysisData
      try {
        // JSON 응답에서 JSON 부분만 추출
        const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : analysisResponse
        analysisData = JSON.parse(jsonStr)
      } catch (error) {
        console.error("분석 응답 파싱 오류:", error)
        // 기본 분석 데이터 사용
        analysisData = {
          requestType: "workflow",
          processName: userInput.includes("프로세스")
            ? userInput.split("프로세스")[0].trim() + " 프로세스"
            : "새 프로세스",
          processDescription: "사용자 요청에 따라 생성된 자동화 프로세스",
          processType: "sequential",
          requiredIntegrations: [],
          estimatedSteps: ["데이터 수집", "데이터 처리", "결과 생성"],
        }
      }

      // 분석 결과 표시
      addAssistantMessage(`요청 분석이 완료되었습니다. "${analysisData.processName}" 프로세스를 생성합니다.`)

      // 2. 프로세스 설계 단계
      setProcessingStage("designing")
      addAssistantMessage("프로세스를 설계 중입니다...")

      // 프로세스 설계 프롬프트
      const designPrompt = `
사용자 요청: "${userInput}"
분석 결과: ${JSON.stringify(analysisData)}

위 정보를 바탕으로 상세한 프로세스 워크플로우를 설계해주세요. 다음 JSON 형식으로 반환해주세요:
{
  "name": "${analysisData.processName}",
  "description": "${analysisData.processDescription}",
  "type": "${analysisData.processType}",
  "steps": [
    {
      "name": "단계 이름",
      "type": "단계 유형(agent, database, transform, condition, notification 중 하나)",
      "description": "단계 설명",
      "config": {
        // 단계 유형에 따른 설정
      }
    }
  ],
  "requiredIntegrations": [
    {
      "type": "통합 유형",
      "name": "통합 이름",
      "description": "통합 설명"
    }
  ]
}

최소 3개, 최대 5개의 단계를 포함하는 워크플로우를 생성해주세요.
JSON 형식만 반환하고 다른 설명은 포함하지 마세요.
`

      const designResponse = await llmService.generateText(designPrompt)

      // JSON 파싱
      let processDesign
      try {
        // JSON 응답에서 JSON 부분만 추출
        const jsonMatch = designResponse.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : designResponse
        processDesign = JSON.parse(jsonStr)
      } catch (error) {
        console.error("설계 응답 파싱 오류:", error)
        // 기본 프로세스 설계 사용
        processDesign = {
          name: analysisData.processName,
          description: analysisData.processDescription,
          type: analysisData.processType,
          steps: [
            {
              name: "데이터 수집",
              type: "agent",
              description: "필요한 데이터를 수집합니다",
              config: { agentId: "data-collector" },
            },
            {
              name: "데이터 처리",
              type: "agent",
              description: "수집된 데이터를 처리합니다",
              config: { agentId: "data-processor" },
            },
            {
              name: "결과 생성",
              type: "agent",
              description: "처리된 데이터로 결과를 생성합니다",
              config: { agentId: "result-generator" },
            },
          ],
          requiredIntegrations: [],
        }
      }

      // 설계 결과 표시
      setCurrentProcess(processDesign)
      setProcessSteps(processDesign.steps)

      const stepsDescription = processDesign.steps
        .map((step: any, index: number) => `${index + 1}. ${step.name}: ${step.description || step.type} 유형`)
        .join("\n")

      addAssistantMessage(
        `프로세스 설계가 완료되었습니다.\n\n**${processDesign.name}**\n${processDesign.description}\n\n**단계:**\n${stepsDescription}`,
      )

      // 사용자 확인 요청
      addAssistantMessage("이 프로세스를 생성하시겠습니까? '예'라고 답하시면 프로세스를 생성하고 실행합니다.")

      // 프로세스 생성 및 실행은 사용자 확인 후 handleConfirmProcess 함수에서 처리
    } catch (error) {
      console.error("프로세스 생성 오류:", error)
      addAssistantMessage("프로세스 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  // 프로세스 확인 및 실행
  const handleConfirmProcess = async () => {
    if (!currentProcess) return

    try {
      // 3. 프로세스 생성 단계
      setProcessingStage("creating")
      addAssistantMessage("프로세스를 생성 중입니다...")

      // 필요한 통합 생성
      if (currentProcess.requiredIntegrations && currentProcess.requiredIntegrations.length > 0) {
        for (const integration of currentProcess.requiredIntegrations) {
          // 이미 존재하는 통합인지 확인
          const existingIntegration = integrations.find((i) => i.type === integration.type)
          if (!existingIntegration) {
            // 새 통합 생성
            const newIntegration = {
              id: `integration-${Date.now()}-${integration.type}`,
              name: integration.name,
              type: integration.type,
              description: integration.description,
              icon: <Database className="h-5 w-5 text-blue-500" />, // 기본 아이콘
              status: "connected" as const,
              connectedAt: new Date().toISOString(),
              lastUsed: null,
              error: null,
              config: {},
            }

            setIntegrations((prev) => [...prev, newIntegration])

            // 새 서비스 추가
            const newService = {
              id: `service-${Date.now()}-${integration.type}`,
              name: `${integration.name} 서비스`,
              type: integration.type,
              status: "active" as const,
            }

            setConnectedServices((prev) => [...prev, newService])
          }
        }
      }

      // 새 워크플로우 생성
      const newWorkflowId = `workflow-${Date.now()}`
      const newWorkflowItem = {
        id: newWorkflowId,
        name: currentProcess.name,
        description: currentProcess.description,
        type: currentProcess.type as "sequential" | "parallel" | "conditional",
        steps: currentProcess.steps.map((step: any) => ({
          id: `step-${uuidv4()}`,
          name: step.name,
          type: step.type,
          config: step.config || {},
          next: [],
        })),
        startStepId: `step-${uuidv4()}`,
        endStepIds: [],
        status: "active" as const,
        createdAt: new Date().toISOString(),
      }

      // 워크플로우 추가
      setWorkflows((prev) => [...prev, newWorkflowItem])
      setSelectedWorkflowId(newWorkflowId)

      addAssistantMessage(`"${currentProcess.name}" 프로세스가 성공적으로 생성되었습니다.`)

      // 4. 프로세스 실행 단계
      setProcessingStage("executing")
      addAssistantMessage("프로세스를 실행 중입니다...")

      // 실행 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 실행 결과 생성
      const executionResults = {
        success: true,
        executionTime: "3.5초",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3500).toISOString(),
        steps: currentProcess.steps.map((step: any, index: number) => ({
          id: `exec-${index}`,
          name: step.name,
          status: "completed",
          startTime: new Date(Date.now() + index * 1000).toISOString(),
          endTime: new Date(Date.now() + (index + 1) * 1000).toISOString(),
          output: {
            data: `${step.name} 단계 실행 결과 데이터`,
            metadata: {
              processingTime: Math.floor(Math.random() * 1000) + 200,
              memoryUsage: Math.floor(Math.random() * 50) + 10 + "MB",
            },
          },
        })),
        output: {
          summary: "프로세스가 성공적으로 실행되었습니다.",
          data: {
            processedItems: Math.floor(Math.random() * 100) + 50,
            successRate: "98.5%",
            insights: [
              "프로세스 실행 중 발견된 인사이트 1",
              "프로세스 실행 중 발견된 인사이트 2",
              "프로세스 실행 중 발견된 인사이트 3",
            ],
          },
        },
      }

      setProcessExecutionResults(executionResults)

      // 실행 결과 표시
      const stepsResults = executionResults.steps
        .map(
          (step: any, index: number) => `${index + 1}. ${step.name}: 완료 (${step.output.metadata.processingTime}ms)`,
        )
        .join("\n")

      addAssistantMessage(
        `프로세스 실행이 완료되었습니다.\n\n**실행 시간:** ${executionResults.executionTime}\n**성공률:** ${executionResults.output.data.successRate}\n\n**단계 결과:**\n${stepsResults}\n\n**요약:** ${executionResults.output.summary}`,
      )

      // 5. 완료 단계
      setProcessingStage("completed")
      addAssistantMessage("프로세스 생성 및 실행이 모두 완료되었습니다. 다른 프로세스를 생성하시겠습니까?")
    } catch (error) {
      console.error("프로세스 실행 오류:", error)
      addAssistantMessage("프로세스 실행 중 오류가 발생했습니다. 다시 시도해주세요.")
      setProcessingStage(null)
    }
  }

  // 어시스턴트 메시지 추가
  const addAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      content,
      role: "assistant",
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, assistantMessage])
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="border-b px-4">
        <TabsList className="mt-2">
          <TabsTrigger value="integrations">통합</TabsTrigger>
          <TabsTrigger value="workflows">워크플로우</TabsTrigger>
          <TabsTrigger value="services">서비스</TabsTrigger>
          <TabsTrigger value="process-builder">프로세스 빌더</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="integrations" className="flex-1 p-0 m-0">
        <div className="h-full flex">
          <div className="w-1/3 border-r h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-4">사용 가능한 통합</h2>
              <Input
                placeholder="통합 검색..."
                className="mb-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={activeIntegrationType === "database" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setActiveIntegrationType(activeIntegrationType === "database" ? null : "database")}
                >
                  <Database className="mr-2 h-4 w-4" />
                  데이터베이스
                </Button>
                <Button
                  variant={activeIntegrationType === "messaging" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setActiveIntegrationType(activeIntegrationType === "messaging" ? null : "messaging")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  메시징
                </Button>
                <Button
                  variant={activeIntegrationType === "development" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() =>
                    setActiveIntegrationType(activeIntegrationType === "development" ? null : "development")
                  }
                >
                  <FileCode className="mr-2 h-4 w-4" />
                  개발 도구
                </Button>
                <Button
                  variant={activeIntegrationType === "cloud" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setActiveIntegrationType(activeIntegrationType === "cloud" ? null : "cloud")}
                >
                  <Cloud className="mr-2 h-4 w-4" />
                  클라우드
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {filteredIntegrations.map((integration) => {
                  const isConnected = integrations.some(
                    (i) => i.type === integration.type && i.name.includes(integration.name),
                  )

                  return (
                    <Card key={integration.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center">
                            {integration.icon}
                            <span className="ml-2">{integration.name}</span>
                          </CardTitle>
                          <Badge variant={isConnected ? "default" : "outline"}>
                            {isConnected ? "연결됨" : "사용 가능"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <CardDescription>{integration.description}</CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          variant={isConnected ? "outline" : "default"}
                          size="sm"
                          className="w-full"
                          onClick={() => handleOpenSpecificIntegrationDialog(integration.id)}
                        >
                          {isConnected ? "설정 보기" : "연결"}
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-4">연결된 통합</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">총 통합</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">{integrations.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">활성 워크플로우</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">{workflows.filter((w) => w.status === "active").length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm">연결된 서비스</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">{connectedServices.length}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {integrations.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg">
                    <Puzzle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">연결된 통합이 없습니다</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      왼쪽 패널에서 통합을 선택하여 연결하세요. 통합을 통해 외부 서비스와 연결하고 워크플로우를 구성할
                      수 있습니다.
                    </p>
                    <Button onClick={() => handleOpenIntegrationDialog("database")}>
                      <Plus className="mr-2 h-4 w-4" />
                      통합 추가
                    </Button>
                  </div>
                ) : selectedIntegration ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center">
                          {selectedIntegration.icon}
                          <span className="ml-2">{selectedIntegration.name}</span>
                        </CardTitle>
                        <Badge variant={selectedIntegration.status === "connected" ? "default" : "destructive"}>
                          {selectedIntegration.status === "connected" ? "연결됨" : "오류"}
                        </Badge>
                      </div>
                      <CardDescription>{selectedIntegration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">연결 정보</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">연결 ID:</span>
                              <span className="ml-2">{selectedIntegration.id.substring(0, 8)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">상태:</span>
                              <span className="ml-2 capitalize">{selectedIntegration.status}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">연결 시간:</span>
                              <span className="ml-2">{new Date(selectedIntegration.connectedAt).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">마지막 사용:</span>
                              <span className="ml-2">
                                {selectedIntegration.lastUsed
                                  ? new Date(selectedIntegration.lastUsed).toLocaleString()
                                  : "없음"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">구성 정보</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(selectedIntegration.config).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="ml-2">
                                  {key.toLowerCase().includes("password") ||
                                  key.toLowerCase().includes("token") ||
                                  key.toLowerCase().includes("key")
                                    ? "********"
                                    : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedIntegration.status === "connected" ? (
                          <div className="flex items-center text-green-500">
                            <Check className="h-4 w-4 mr-2" />
                            <span>정상 작동 중</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>{selectedIntegration.error || "연결 오류"}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleTestIntegration(selectedIntegration.id)}>
                        <Link className="mr-2 h-4 w-4" />
                        테스트
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveIntegration(selectedIntegration.id)}
                      >
                        연결 해제
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  integrations.map((integration) => (
                    <Card
                      key={integration.id}
                      className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                        selectedIntegrationId === integration.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedIntegrationId(integration.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center">
                            {integration.icon}
                            <span className="ml-2">{integration.name}</span>
                          </CardTitle>
                          <Badge variant={integration.status === "connected" ? "default" : "destructive"}>
                            {integration.status === "connected" ? "연결됨" : "오류"}
                          </Badge>
                        </div>
                        <CardDescription>{integration.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">연결 정보</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">연결 ID:</span>
                                <span className="ml-2">{integration.id.substring(0, 8)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">상태:</span>
                                <span className="ml-2 capitalize">{integration.status}</span>
                              </div>
                            </div>
                          </div>

                          {integration.status === "connected" ? (
                            <div className="flex items-center text-green-500">
                              <Check className="h-4 w-4 mr-2" />
                              <span>정상 작동 중</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-500">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              <span>{integration.error || "연결 오류"}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTestIntegration(integration.id)
                          }}
                        >
                          <Link className="mr-2 h-4 w-4" />
                          테스트
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveIntegration(integration.id)
                          }}
                        >
                          연결 해제
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="workflows" className="flex-1 p-0 m-0">
        <div className="h-full flex">
          <div className="w-1/3 border-r h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">워크플로우</h2>
                <Button size="sm" onClick={() => setShowWorkflowDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />새 워크플로우
                </Button>
              </div>

              <Input placeholder="워크플로우 검색..." className="mb-4" />
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <h3 className="font-medium text-sm mb-2">워크플로우 목록</h3>
                {workflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedWorkflowId === workflow.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedWorkflowId(workflow.id)}
                  >
                    <CardHeader className="p-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <Workflow className="h-4 w-4 mr-2 text-primary" />
                          {workflow.name}
                        </CardTitle>
                        <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                          {workflow.status === "active" ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1">{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-3 pt-0 flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          // 워크플로우 편집 기능 추가
                          setWorkflowSettings({
                            name: workflow.name,
                            description: workflow.description,
                            type: workflow.type,
                            status: workflow.status,
                          })
                          setSelectedWorkflowId(workflow.id)
                          setActiveTab("workflows")
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWorkflow(workflow.id)
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 h-full">
            {selectedWorkflow ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <h2 className="font-semibold">{selectedWorkflow.name}</h2>
                    <Badge variant="outline" className="ml-2">
                      {selectedWorkflow.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      저장
                    </Button>
                    <Button
                      variant={isRunningWorkflow ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleRunWorkflow(selectedWorkflow.id)}
                      disabled={isRunningWorkflow}
                    >
                      {isRunningWorkflow ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          실행 중...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          실행
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="design" className="flex-1 flex flex-col">
                  <div className="border-b px-4">
                    <TabsList className="mt-2">
                      <TabsTrigger value="design">디자인</TabsTrigger>
                      <TabsTrigger value="settings">설정</TabsTrigger>
                      <TabsTrigger value="results">결과</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="design" className="flex-1 p-0 m-0">
                    <div className="h-full flex flex-col">
                      <div className="p-4 border-b">
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          단계 추가
                        </Button>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="p-4">
                          <div className="space-y-4">
                            {selectedWorkflow.steps.map((step, index) => (
                              <div key={step.id} className="space-y-2">
                                <Card>
                                  <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-2">
                                          {index + 1}
                                        </span>
                                        {step.name}
                                      </CardTitle>
                                      <Badge variant="outline">{step.type}</Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-2">
                                    <div className="text-sm text-muted-foreground">
                                      {step.type === "agent" && (
                                        <div>
                                          <span>에이전트: </span>
                                          <span>{step.config?.agentId || "에이전트 없음"}</span>
                                        </div>
                                      )}
                                      {step.type === "database" && (
                                        <div className="font-mono text-xs overflow-hidden text-ellipsis">
                                          {step.config?.query || "쿼리 없음"}
                                        </div>
                                      )}
                                      {step.type === "transform" && (
                                        <div>
                                          <span>소스: </span>
                                          <span className="font-mono text-xs">
                                            {step.config?.source || "소스 없음"}
                                          </span>
                                        </div>
                                      )}
                                      {step.type === "condition" && (
                                        <div>
                                          <span>조건: </span>
                                          <span className="font-mono text-xs">
                                            {step.config?.condition || "조건 없음"}
                                          </span>
                                        </div>
                                      )}
                                      {step.type === "notification" && (
                                        <div>
                                          <span>채널: </span>
                                          <span>{step.config?.channel || "채널 없음"}</span>
                                        </div>
                                      )}
                                      {step.type === "development" && (
                                        <div>
                                          <span>액션: </span>
                                          <span>{step.config?.action || "액션 없음"}</span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                  <CardFooter className="p-4 pt-0 flex justify-between">
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm">
                                        <Settings className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Plus className="mr-2 h-4 w-4" />
                                      다음 단계 추가
                                    </Button>
                                  </CardFooter>
                                </Card>

                                {index < selectedWorkflow.steps.length - 1 && (
                                  <div className="flex justify-center">
                                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="flex-1 p-0 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">워크플로우 설정</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">이름</label>
                              <Input
                                placeholder="워크플로우 이름"
                                value={workflowSettings.name}
                                onChange={(e) => setWorkflowSettings({ ...workflowSettings, name: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">설명</label>
                              <Textarea
                                placeholder="워크플로우 설명"
                                value={workflowSettings.description}
                                onChange={(e) =>
                                  setWorkflowSettings({ ...workflowSettings, description: e.target.value })
                                }
                                rows={3}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">유형</label>
                              <select
                                className="w-full p-2 rounded-md border"
                                value={workflowSettings.type}
                                onChange={(e) => setWorkflowSettings({ ...workflowSettings, type: e.target.value })}
                              >
                                <option value="sequential">순차 실행</option>
                                <option value="parallel">병렬 실행</option>
                                <option value="conditional">조건부 실행</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">상태</label>
                              <select
                                className="w-full p-2 rounded-md border"
                                value={workflowSettings.status}
                                onChange={(e) => setWorkflowSettings({ ...workflowSettings, status: e.target.value })}
                              >
                                <option value="active">활성</option>
                                <option value="inactive">비활성</option>
                              </select>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button>
                              <Save className="mr-2 h-4 w-4" />
                              설정 저장
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="results" className="flex-1 p-0 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-4">
                        {!workflowResults ? (
                          <div className="text-center p-8 border rounded-lg">
                            <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">실행 결과 없음</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                              워크플로우를 실행하여 결과를 확인하세요.
                            </p>
                            <Button onClick={() => handleRunWorkflow(selectedWorkflow.id)} disabled={isRunningWorkflow}>
                              <Play className="mr-2 h-4 w-4" />
                              워크플로우 실행
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Card>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">실행 결과</CardTitle>
                                  <Badge variant={workflowResults.success ? "default" : "destructive"}>
                                    {workflowResults.success ? "성공" : "실패"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">실행 시간</h4>
                                    <p>{workflowResults.executionTime}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">시작 시간</h4>
                                    <p>{new Date(workflowResults.startTime).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">종료 시간</h4>
                                    <p>{new Date(workflowResults.endTime).toLocaleString()}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-2">요약</h4>
                                  <p>{workflowResults.output.summary}</p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-2">처리 항목</h4>
                                  <p>{workflowResults.output.data.processedItems}개</p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-2">성공률</h4>
                                  <p>{workflowResults.output.data.successRate}</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">단계별 결과</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {workflowResults.steps.map((stepResult: any, index: number) => (
                                    <div key={stepResult.id} className="border rounded-md p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">
                                          {index + 1}. {stepResult.name}
                                        </h4>
                                        <Badge variant="outline">{stepResult.status}</Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                        <div>
                                          <span className="text-muted-foreground">처리 시간:</span>
                                          <span className="ml-1">{stepResult.output.metadata.processingTime}ms</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">메모리 사용량:</span>
                                          <span className="ml-1">{stepResult.output.metadata.memoryUsage}</span>
                                        </div>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">출력:</span>
                                        <span className="ml-1">{stepResult.output.data}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">워크플로우를 선택하세요</h3>
                  <p className="text-muted-foreground max-w-md">
                    왼쪽 패널에서 워크플로우를 선택하거나 새 워크플로우를 생성하세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="services" className="flex-1 p-0 m-0">
        <div className="h-full flex">
          <div className="w-1/3 border-r h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-4">서비스 유형</h2>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  데이터베이스
                </Button>
                <Button variant="outline" className="justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  메시징
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileCode className="mr-2 h-4 w-4" />
                  개발 도구
                </Button>
                <Button variant="outline" className="justify-start">
                  <Cloud className="mr-2 h-4 w-4" />
                  클라우드
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <h3 className="font-medium text-sm mb-2">연결된 서비스</h3>
                {connectedServices.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground text-sm">연결된 서비스가 없습니다</div>
                ) : (
                  connectedServices.map((service) => (
                    <Card key={service.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center">
                            {service.type === "database" && <Database className="h-4 w-4 mr-2 text-blue-500" />}
                            {service.type === "messaging" && <MessageSquare className="h-4 w-4 mr-2 text-green-500" />}
                            {service.type === "development" && <FileCode className="h-4 w-4 mr-2 text-gray-800" />}
                            {service.type === "cloud" && <Cloud className="h-4 w-4 mr-2 text-blue-600" />}
                            {service.name}
                          </CardTitle>
                          <Badge variant={service.status === "active" ? "default" : "secondary"}>
                            {service.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 h-full">
            {connectedServices.length > 0 ? (
              <div className="p-4">
                <h2 className="font-semibold mb-4">서비스 상세 정보</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">데이터베이스 서비스</CardTitle>
                    <CardDescription>PostgreSQL 데이터베이스 연결을 통한 서비스</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">서비스 ID</h4>
                        <p>service-1</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">유형</h4>
                        <p>데이터베이스</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">상태</h4>
                        <Badge variant="default">활성</Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">연결된 통합</h4>
                        <p>PostgreSQL 데이터베이스</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">사용 통계</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-muted/30">
                          <CardContent className="p-3">
                            <div className="text-xs text-muted-foreground">쿼리 수</div>
                            <div className="text-xl font-bold">1,245</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent className="p-3">
                            <div className="text-xs text-muted-foreground">평균 응답 시간</div>
                            <div className="text-xl font-bold">45ms</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent className="p-3">
                            <div className="text-xs text-muted-foreground">오류율</div>
                            <div className="text-xl font-bold">0.2%</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">연결 정보</h4>
                      <div className="bg-muted p-3 rounded-md font-mono text-xs">
                        <div>Host: db.example.com</div>
                        <div>Port: 5432</div>
                        <div>Database: main</div>
                        <div>Username: user</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      새로고침
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      설정
                    </Button>
                  </CardFooter>
                </Card>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">연결된 워크플로우</h3>
                  <div className="space-y-2">
                    <Card>
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center">
                            <Workflow className="h-4 w-4 mr-2 text-primary" />
                            데이터 동기화
                          </CardTitle>
                          <Badge variant="default">활성</Badge>
                        </div>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center">
                            <Workflow className="h-4 w-4 mr-2 text-primary" />
                            고객 데이터 분석
                          </CardTitle>
                          <Badge variant="default">활성</Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">서비스 연결</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    통합을 통해 외부 서비스를 연결하고 워크플로우에서 활용할 수 있습니다.
                  </p>
                  <Button onClick={() => setActiveTab("integrations")}>
                    <Plus className="mr-2 h-4 w-4" />
                    서비스 연결
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="process-builder" className="flex-1 p-0 m-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-2">프로세스 빌더</h2>
                <p className="text-sm text-muted-foreground">
                  대화를 통해 프로세스를 생성하고 실행할 수 있습니다. 원하는 프로세스를 설명해보세요.
                </p>
              </div>

              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[90%] ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="h-8 w-8 mt-1">
                          {message.role === "user" ? (
                            <User className="h-5 w-5 text-primary-foreground" />
                          ) : (
                            <Bot className="h-5 w-5 text-primary-foreground" />
                          )}
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{message.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8 mt-1">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </Avatar>
                        <div className="rounded-lg px-3 py-2 bg-muted">
                          <Loader2 className="h-4 w-4 animate-spin" />
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

                    // 사용자가 "예"라고 응답하면 프로세스 확인 및 실행
                    if (input.toLowerCase() === "예" && currentProcess) {
                      handleConfirmProcess()
                    } else {
                      handleSendMessage()
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="메시지 입력..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isProcessing}
                  />
                  <Button type="submit" size="icon" disabled={isProcessing || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold mb-2">프로세스 시각화</h2>
                <div className="flex items-center gap-2">
                  {processingStage && (
                    <Badge variant="outline" className="text-xs">
                      {processingStage === "analyzing" && "분석 중"}
                      {processingStage === "designing" && "설계 중"}
                      {processingStage === "creating" && "생성 중"}
                      {processingStage === "executing" && "실행 중"}
                      {processingStage === "completed" && "완료됨"}
                    </Badge>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {!currentProcess ? (
                    <div className="text-center p-8 border rounded-lg">
                      <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">프로세스 생성 대기 중</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        왼쪽 채팅에서 원하는 프로세스를 설명해주세요. AI가 자동으로 프로세스를 생성합니다.
                      </p>
                      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <Card className="bg-muted/30">
                          <CardContent className="p-3 text-center">
                            <Cog className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-sm font-medium">프로세스 생성</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent className="p-3 text-center">
                            <Layers className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-sm font-medium">통합 연결</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent className="p-3 text-center">
                            <Play className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="text-sm font-medium">자동 실행</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{currentProcess.name}</CardTitle>
                          <CardDescription>{currentProcess.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge>{currentProcess.type}</Badge>
                            {processingStage === "completed" && (
                              <Badge variant="success" className="bg-green-500">
                                완료됨
                              </Badge>
                            )}
                            {processingStage === "executing" && (
                              <Badge variant="outline" className="animate-pulse">
                                실행 중
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-medium mb-2">프로세스 단계</h3>
                              <div className="space-y-4">
                                {processSteps.map((step, index) => (
                                  <div key={index} className="space-y-2">
                                    <Card
                                      className={`border ${
                                        processExecutionResults?.steps?.[index]?.status === "completed"
                                          ? "border-green-500"
                                          : ""
                                      }`}
                                    >
                                      <CardHeader className="p-3 pb-2">
                                        <div className="flex items-center justify-between">
                                          <CardTitle className="text-sm flex items-center">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs mr-2">
                                              {index + 1}
                                            </span>
                                            {step.name}
                                          </CardTitle>
                                          <Badge variant="outline">{step.type}</Badge>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-1">
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                        {processExecutionResults?.steps?.[index] && (
                                          <div className="mt-2 pt-2 border-t text-xs">
                                            <div className="flex justify-between text-muted-foreground">
                                              <span>
                                                처리 시간:{" "}
                                                {
                                                  processExecutionResults?.steps?.[index]?.output?.metadata
                                                    ?.processingTime
                                                }
                                                ms
                                              </span>
                                              <span>
                                                메모리:{" "}
                                                {processExecutionResults?.steps?.[index]?.output?.metadata?.memoryUsage}
                                              </span>
                                            </div>
                                            <div className="mt-1">
                                              <span className="text-muted-foreground">결과:</span>
                                              <span className="ml-1">
                                                {processExecutionResults?.steps?.[index]?.output?.data}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {index < processSteps.length - 1 && (
                                      <div className="flex justify-center">
                                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {processExecutionResults && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">실행 결과</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">실행 시간</h4>
                                      <p>{processExecutionResults.executionTime}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">처리 항목</h4>
                                      <p>{processExecutionResults.output.data.processedItems}개</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">성공률</h4>
                                      <p>{processExecutionResults.output.data.successRate}</p>
                                    </div>
                                  </div>

                                  {processExecutionResults.output.data.insights && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">인사이트</h4>
                                      <ul className="list-disc pl-5 space-y-1">
                                        {processExecutionResults.output.data.insights.map(
                                          (insight: string, index: number) => (
                                            <li key={index} className="text-sm">
                                              {insight}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {currentProcess.requiredIntegrations && currentProcess.requiredIntegrations.length > 0 && (
                              <div>
                                <h3 className="text-sm font-medium mb-2">필요한 통합</h3>
                                <div className="grid grid-cols-2 gap-2">
                                  {currentProcess.requiredIntegrations.map((integration: any, index: number) => (
                                    <Card key={index}>
                                      <CardHeader className="p-3">
                                        <CardTitle className="text-sm">{integration.name}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-0">
                                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>

      {/* 통합 구성 다이얼로그 */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>통합 구성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedIntegrationType && (
              <>
                <p className="text-sm text-muted-foreground">
                  {availableIntegrations.find((i) => i.type === selectedIntegrationType)?.description}
                </p>

                {connectionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{connectionError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  {Object.entries(
                    availableIntegrations.find((i) => i.type === selectedIntegrationType)?.configTemplate || {},
                  ).map(([key, field]) => renderConfigField(key, field))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntegrationDialog(false)} disabled={isConnecting}>
              취소
            </Button>
            <Button onClick={handleAddIntegration} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  연결 중...
                </>
              ) : (
                "연결"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 워크플로우 생성 다이얼로그 */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 워크플로우 생성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이름</label>
              <Input
                placeholder="워크플로우 이름"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">설명</label>
              <Textarea
                placeholder="워크플로우 설명"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">유형</label>
              <select
                className="w-full p-2 rounded-md border"
                value={newWorkflow.type}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, type: e.target.value })}
              >
                <option value="sequential">순차 실행</option>
                <option value="parallel">병렬 실행</option>
                <option value="conditional">조건부 실행</option>
              </select>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // AI로 워크플로우 생성 기능
                if (!newWorkflow.name) return

                // 간단한 시뮬레이션 (실제로는 LLM 호출)
                setTimeout(() => {
                  const aiGeneratedWorkflow = {
                    ...newWorkflow,
                    description: newWorkflow.description || `${newWorkflow.name}을 위한 자동 생성된 워크플로우`,
                    steps: [
                      {
                        id: "step-1",
                        name: "데이터 수집",
                        type: "agent",
                        config: { agentId: "data-collector" },
                      },
                      {
                        id: "step-2",
                        name: "데이터 처리",
                        type: "agent",
                        config: { agentId: "data-processor" },
                      },
                      {
                        id: "step-3",
                        name: "결과 저장",
                        type: "database",
                        config: { query: "INSERT INTO results (data) VALUES (:data)" },
                      },
                    ],
                  }

                  setNewWorkflow(aiGeneratedWorkflow)
                }, 1000)
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI로 워크플로우 생성
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={!newWorkflow.name}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
