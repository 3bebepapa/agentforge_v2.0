"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Zap,
  MessageSquare,
  Workflow,
  Package,
  Play,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Brain,
  Save,
  Download,
} from "lucide-react"
import { AgentOrchestrator, type TaskPlan, type Task } from "@/lib/agent-orchestrator"
import { FileManagerUI } from "@/components/file-manager-ui"
import { useFileGenerator } from "@/hooks/use-file-generator"
import { ProcessStudioExporter } from "@/components/process-studio-exporter"
import { ProcessStudioRunner } from "@/components/process-studio-runner"
import { AiResponseCleaner } from "@/lib/ai-response-cleaner"
import { HistoryMenu } from "@/components/history-menu"
import { FileManager } from "@/lib/file-manager"

interface UnifiedInterfaceProps {
  apiKey: string
}

export function UnifiedInterface({ apiKey }: UnifiedInterfaceProps) {
  const [userRequest, setUserRequest] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator | null>(null)
  const [currentTaskPlan, setCurrentTaskPlan] = useState<TaskPlan | null>(null)
  const [taskHistory, setTaskHistory] = useState<TaskPlan[]>([])
  const [activeTab, setActiveTab] = useState("request")
  const [error, setError] = useState<string | null>(null)
  const { savedFiles, saveTaskResult, saveComponent, saveWorkflow } = useFileGenerator()
  const [showExporter, setShowExporter] = useState(false)
  const [extractedComponents, setExtractedComponents] = useState<any[]>([])
  const [extractedWorkflows, setExtractedWorkflows] = useState<any[]>([])
  const [processStudioData, setProcessStudioData] = useState<any>(null)

  // 오케스트레이터 초기화
  useEffect(() => {
    if (apiKey) {
      try {
        const newOrchestrator = new AgentOrchestrator(apiKey)
        setOrchestrator(newOrchestrator)
        setError(null)
      } catch (err) {
        console.error("오케스트레이터 초기화 오류:", err)
        setError("오케스트레이터를 초기화하는 중 오류가 발생했습니다.")
      }
    }
  }, [apiKey])

  // 기존 작업 기록 로드
  useEffect(() => {
    try {
      // FileManager를 사용하여 작업 기록 로드
      const fileManager = FileManager.getInstance()
      const savedTasks = fileManager.getAllTasks()

      if (savedTasks.length > 0) {
        const loadedTasks: TaskPlan[] = []

        // 각 작업 데이터 로드
        savedTasks.forEach((taskInfo: any) => {
          try {
            const taskData = fileManager.loadTask(taskInfo.id)
            if (taskData) {
              loadedTasks.push(taskData)
            }
          } catch (e) {
            console.error("작업 데이터 로드 오류:", e)
          }
        })

        if (loadedTasks.length > 0) {
          setTaskHistory(loadedTasks)
        }
      }
    } catch (e) {
      console.error("작업 기록 로드 오류:", e)
    }
  }, [])

  // 사용자 요청 처리
  const handleUserRequest = async () => {
    if (!userRequest.trim() || !orchestrator) return

    setIsProcessing(true)
    setActiveTab("execution")
    setError(null)
    setExtractedComponents([])
    setExtractedWorkflows([])

    try {
      // 작업 계획 생성
      const taskPlanId = await orchestrator.createTaskPlan(userRequest)
      let taskPlan = orchestrator.getTaskPlan(taskPlanId)

      if (taskPlan) {
        setCurrentTaskPlan({ ...taskPlan })

        // 작업 계획 실행
        taskPlan = await orchestrator.executeTaskPlan(taskPlanId)

        // 결과 데이터 추출 및 정리
        const components = extractComponentsFromTaskPlan(taskPlan)
        const workflows = extractWorkflowsFromTaskPlan(taskPlan)

        setExtractedComponents(components)
        setExtractedWorkflows(workflows)
        setCurrentTaskPlan({ ...taskPlan })

        // 작업 기록 업데이트
        setTaskHistory((prev) => [{ ...taskPlan! }, ...prev])

        // 작업 결과 자동 저장
        if (taskPlan.status === "completed") {
          try {
            // 태스크 결과 저장
            const fileManager = FileManager.getInstance()
            const taskResult = fileManager.saveTaskResult(taskPlan)
            console.log("태스크 결과 저장됨:", taskResult)

            // 컴포넌트 저장
            if (components.length > 0) {
              components.forEach((component) => {
                if (component) {
                  const componentResult = fileManager.saveComponent(component)
                  console.log("컴포넌트 저장됨:", componentResult)
                }
              })
            }

            // 워크플로우 저장
            if (workflows.length > 0) {
              workflows.forEach((workflow) => {
                if (workflow) {
                  const workflowResult = fileManager.saveWorkflow(workflow)
                  console.log("워크플로우 저장됨:", workflowResult)
                }
              })
            }

            // 프로세스 스튜디오 데이터 생성
            const processData = {
              version: "1.0",
              name: `${userRequest.substring(0, 30)}${userRequest.length > 30 ? "..." : ""}`,
              description: taskPlan.description,
              metadata: {
                exportedAt: new Date().toISOString(),
                source: "AgentForge",
              },
              components: components,
              workflows: workflows,
              tasks: [taskPlan],
            }
            setProcessStudioData(processData)

            // 작업 기록 업데이트 (중요: 저장 후 기록 업데이트)
            setTaskHistory((prev) => [{ ...taskPlan! }, ...prev])

            // 자동으로 프로세스 실행 탭으로 이동
            setActiveTab("runner")
          } catch (saveError) {
            console.error("결과 저장 중 오류:", saveError)
          }
        }
      }
    } catch (error) {
      console.error("요청 처리 오류:", error)
      setError(`요청 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // 태스크 계획에서 컴포넌트 추출
  const extractComponentsFromTaskPlan = (taskPlan: any): any[] => {
    if (!taskPlan) return []

    let components: any[] = []

    // 결과에서 컴포넌트 추출
    if (taskPlan.result) {
      // componentSpec이 직접 있는 경우
      if (typeof taskPlan.result === "object" && taskPlan.result.componentSpec) {
        components.push(taskPlan.result.componentSpec)
      }

      const extractedFromResult = AiResponseCleaner.extractComponents(taskPlan.result)
      if (extractedFromResult.length > 0) {
        components = [...components, ...extractedFromResult]
      }
    }

    // 태스크 결과에서 컴포넌트 추출
    if (taskPlan.tasks && Array.isArray(taskPlan.tasks)) {
      for (const task of taskPlan.tasks) {
        if (task.result) {
          // componentSpec 또는 componentId가 있는 경우 컴포넌트로 간주
          if (typeof task.result === "object") {
            if (task.result.componentSpec) {
              components.push(task.result.componentSpec)
            } else if (task.result.componentId && task.result.name) {
              // componentId가 있지만 componentSpec이 없는 경우 컴포넌트 객체 생성
              components.push({
                id: task.result.componentId,
                name: task.result.name,
                description: task.result.description || "",
                type: task.result.type || "custom",
                features: task.result.features || [],
                code: task.result.code || task.result.implementation || "",
              })
            }
          }

          const extractedFromTask = AiResponseCleaner.extractComponents(task.result)
          if (extractedFromTask.length > 0) {
            components = [...components, ...extractedFromTask]
          }
        }

        // 하위 태스크 확인
        if (task.subtasks && Array.isArray(task.subtasks)) {
          for (const subtask of task.subtasks) {
            if (subtask.result) {
              // componentSpec 확인
              if (typeof subtask.result === "object" && subtask.result.componentSpec) {
                components.push(subtask.result.componentSpec)
              }

              const extractedFromSubtask = AiResponseCleaner.extractComponents(subtask.result)
              if (extractedFromSubtask.length > 0) {
                components = [...components, ...extractedFromSubtask]
              }
            }
          }
        }
      }
    }

    // 중복 제거
    const uniqueComponents = components.filter(
      (component, index, self) =>
        index === self.findIndex((c) => (c.id && c.id === component.id) || (c.name && c.name === component.name)),
    )

    return uniqueComponents
  }

  // 태스크 계획에서 워크플로우 추출
  const extractWorkflowsFromTaskPlan = (taskPlan: any): any[] => {
    if (!taskPlan) return []

    let workflows: any[] = []

    // 결과에서 워크플로우 추출
    if (taskPlan.result) {
      // workflowSpec이 직접 있는 경우
      if (typeof taskPlan.result === "object" && taskPlan.result.workflowSpec) {
        workflows.push(taskPlan.result.workflowSpec)
      }

      const extractedFromResult = AiResponseCleaner.extractWorkflows(taskPlan.result)
      if (extractedFromResult.length > 0) {
        workflows = [...workflows, ...extractedFromResult]
      }
    }

    // 태스크 결과에서 워크플로우 추출
    if (taskPlan.tasks && Array.isArray(taskPlan.tasks)) {
      for (const task of taskPlan.tasks) {
        if (task.result) {
          // workflowSpec 또는 workflowId가 있는 경우 워크플로우로 간주
          if (typeof task.result === "object") {
            if (task.result.workflowSpec) {
              workflows.push(task.result.workflowSpec)
            } else if (task.result.workflowId && task.result.name) {
              // workflowId가 있지만 workflowSpec이 없는 경우 워크플로우 객체 생성
              workflows.push({
                id: task.result.workflowId,
                name: task.result.name,
                description: task.result.description || "",
                steps: task.result.steps || [],
                config: task.result.config || {},
              })
            }
          }

          const extractedFromTask = AiResponseCleaner.extractWorkflows(task.result)
          if (extractedFromTask.length > 0) {
            workflows = [...workflows, ...extractedFromTask]
          }
        }

        // 하위 태스크 확인
        if (task.subtasks && Array.isArray(task.subtasks)) {
          for (const subtask of task.subtasks) {
            if (subtask.result) {
              // workflowSpec 확인
              if (typeof subtask.result === "object" && subtask.result.workflowSpec) {
                workflows.push(subtask.result.workflowSpec)
              }

              const extractedFromSubtask = AiResponseCleaner.extractWorkflows(subtask.result)
              if (extractedFromSubtask.length > 0) {
                workflows = [...workflows, ...extractedFromSubtask]
              }
            }
          }
        }
      }
    }

    // 중복 제거
    const uniqueWorkflows = workflows.filter(
      (workflow, index, self) =>
        index === self.findIndex((w) => (w.id && w.id === workflow.id) || (w.name && w.name === workflow.name)),
    )

    return uniqueWorkflows
  }

  // 작업 상태에 따른 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  // 작업 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료"
      case "in_progress":
        return "진행 중"
      case "failed":
        return "실패"
      case "pending":
        return "대기 중"
      default:
        return "알 수 없음"
    }
  }

  // 작업 렌더링
  const renderTask = (task: Task, level = 0) => {
    return (
      <div key={task.id} className="mb-2">
        <div
          className={`flex items-start p-2 rounded-md ${
            task.status === "completed"
              ? "bg-green-500/10"
              : task.status === "in_progress"
                ? "bg-blue-500/10"
                : task.status === "failed"
                  ? "bg-red-500/10"
                  : "bg-gray-500/10"
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {task.status === "completed" && <Check className="h-4 w-4 text-green-500 mr-2" />}
                {task.status === "in_progress" && <RefreshCw className="h-4 w-4 text-blue-500 mr-2 animate-spin" />}
                {task.status === "failed" && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                {task.status === "pending" && <Clock className="h-4 w-4 text-gray-500 mr-2" />}
                <span className="font-medium">{task.description}</span>
              </div>
              <Badge variant={getStatusBadgeVariant(task.status)}>{getStatusText(task.status)}</Badge>
            </div>

            {task.result && (
              <div className="mt-2 text-sm">
                <div className="bg-muted p-2 rounded-md">
                  {typeof task.result === "object" ? (
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(task.result, null, 2)}</pre>
                  ) : (
                    <p>{String(task.result)}</p>
                  )}
                </div>
              </div>
            )}

            {task.error && (
              <div className="mt-2 text-sm text-red-500">
                <div className="bg-red-500/10 p-2 rounded-md">
                  <p>{task.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-1">{task.subtasks.map((subtask) => renderTask(subtask, level + 1))}</div>
        )}
      </div>
    )
  }

  // 컴포넌트 렌더링
  const renderComponents = () => {
    if (extractedComponents.length === 0) {
      return <p className="text-sm text-muted-foreground">생성된 컴포넌트가 없습니다.</p>
    }

    return extractedComponents.map((component, index) => (
      <div key={index} className="border p-3 rounded-md">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium">{component.name || "이름 없음"}</span>
          </div>
          <Badge variant="outline">{component.type || "유형 없음"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{component.description || "설명 없음"}</p>
        {component.features && component.features.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-medium mb-1">기능:</h5>
            <div className="flex flex-wrap gap-1">
              {component.features.map((feature: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    ))
  }

  // 워크플로우 렌더링
  const renderWorkflows = () => {
    if (extractedWorkflows.length === 0) {
      return <p className="text-sm text-muted-foreground">생성된 워크플로우가 없습니다.</p>
    }

    return extractedWorkflows.map((workflow, index) => (
      <div key={index} className="border p-3 rounded-md">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Workflow className="h-4 w-4 text-primary mr-2" />
            <span className="font-medium">{workflow.name || "이름 없음"}</span>
          </div>
          <Badge variant="outline">{workflow.type || "유형 없음"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{workflow.description || "설명 없음"}</p>
        {workflow.steps && workflow.steps.length > 0 && (
          <div className="mt-2">
            <h5 className="text-xs font-medium mb-1">단계:</h5>
            <div className="text-xs space-y-1">
              {workflow.steps.map((step: any, index: number) => (
                <div key={index} className="flex items-center">
                  <span className="text-muted-foreground mr-2">{index + 1}.</span>
                  <span>{step.name || `단계 ${index + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ))
  }

  // 결과 저장 기능
  const handleSaveResult = () => {
    if (!currentTaskPlan) return

    try {
      // 태스크 결과 저장
      const fileManager = FileManager.getInstance()
      const taskResult = fileManager.saveTaskResult(currentTaskPlan)
      console.log("태스크 결과 저장됨:", taskResult)

      // 컴포넌트 저장
      if (extractedComponents.length > 0) {
        extractedComponents.forEach((component) => {
          if (component) {
            const componentResult = fileManager.saveComponent(component)
            console.log("컴포넌트 저장됨:", componentResult)
          }
        })
      }

      // 워크플로우 저장
      if (extractedWorkflows.length > 0) {
        extractedWorkflows.forEach((workflow) => {
          if (workflow) {
            const workflowResult = fileManager.saveWorkflow(workflow)
            console.log("워크플로우 저장됨:", workflowResult)
          }
        })
      }

      // 프로세스 스튜디오 데이터 업데이트 (중요: 저장 후 데이터 업데이트)
      const processData = {
        version: "1.0",
        name: currentTaskPlan.description || `프로세스 ${new Date().toLocaleTimeString()}`,
        description: currentTaskPlan.description,
        metadata: {
          exportedAt: new Date().toISOString(),
          source: "AgentForge",
        },
        components: extractedComponents,
        workflows: extractedWorkflows,
        tasks: [currentTaskPlan],
      }
      setProcessStudioData(processData)

      // 저장 성공 메시지
      alert("결과가 파일로 저장되었습니다.")

      // 자동으로 프로세스 실행 탭으로 이동
      setActiveTab("runner")
    } catch (error) {
      console.error("결과 저장 중 오류가 발생했습니다:", error)
      alert(`결과 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 프로세스 스튜디오 내보내기 표시
  const handleShowExporter = () => {
    setShowExporter(true)
    setActiveTab("export")
  }

  // 프로세스 스튜디오 실행 표시
  const handleShowRunner = () => {
    if (!processStudioData && currentTaskPlan) {
      // 프로세스 스튜디오 데이터 생성
      const processData = {
        version: "1.0",
        name: currentTaskPlan.description,
        description: currentTaskPlan.description,
        metadata: {
          exportedAt: new Date().toISOString(),
          source: "AgentForge",
        },
        components: extractedComponents,
        workflows: extractedWorkflows,
        tasks: [currentTaskPlan],
      }
      setProcessStudioData(processData)
    }

    setActiveTab("runner")
  }

  // 기록에서 태스크 선택
  const handleSelectTask = (task: TaskPlan) => {
    setCurrentTaskPlan(task)

    // 컴포넌트와 워크플로우 추출
    const components = extractComponentsFromTaskPlan(task)
    const workflows = extractWorkflowsFromTaskPlan(task)

    setExtractedComponents(components)
    setExtractedWorkflows(workflows)

    // 프로세스 스튜디오 데이터 생성
    const processData = {
      version: "1.0",
      name: task.description,
      description: task.description,
      metadata: {
        exportedAt: new Date().toISOString(),
        source: "AgentForge",
      },
      components: components,
      workflows: workflows,
      tasks: [task],
    }
    setProcessStudioData(processData)

    // 자동으로 프로세스 실행 탭으로 이동하도록 변경
    setActiveTab("runner")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-primary mr-2" />
          <h2 className="font-semibold">통합 인터페이스</h2>
        </div>
        <div className="flex items-center gap-2">
          <HistoryMenu taskHistory={taskHistory} onSelectTask={handleSelectTask} />
          <Button variant="outline" size="sm" onClick={handleSaveResult} disabled={!currentTaskPlan}>
            <Save className="mr-2 h-4 w-4" />
            결과 저장
          </Button>
          <Button variant="outline" size="sm" onClick={handleShowExporter} disabled={!currentTaskPlan}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button variant="outline" size="sm" onClick={handleShowRunner} disabled={!currentTaskPlan}>
            <Play className="mr-2 h-4 w-4" />
            실행
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="mt-2">
            <TabsTrigger value="request" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              요청
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center">
              <Play className="h-4 w-4 mr-2" />
              실행
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              결과
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              파일
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              기록
            </TabsTrigger>
            {showExporter && (
              <TabsTrigger value="export" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </TabsTrigger>
            )}
            {processStudioData && (
              <TabsTrigger value="runner" className="flex items-center">
                <Play className="h-4 w-4 mr-2" />
                프로세스 실행
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="request" className="flex-1 p-0 m-0">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">요청 입력</CardTitle>
                <CardDescription>자연어로 요청을 입력하면 시스템이 자동으로 처리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="예: '고객 데이터를 분석하고 주간 보고서를 생성해줘' 또는 '외부 API에서 날씨 데이터를 가져와 처리하는 컴포넌트를 만들어줘'"
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  rows={6}
                  className="mb-4"
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setUserRequest("고객 데이터를 분석하고 주간 보고서를 생성해줘")}
                  >
                    데이터 분석 예시
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setUserRequest("HTTP 요청을 처리하고 응답을 변환하는 컴포넌트를 만들어줘")}
                  >
                    컴포넌트 생성 예시
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      setUserRequest("데이터베이스에서 사용자 정보를 가져와 이메일을 보내는 워크플로우를 만들어줘")
                    }
                  >
                    워크플로우 생성 예시
                  </Badge>
                </div>

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    자세한 요청일수록 더 정확한 결과를 얻을 수 있습니다. 필요한 컴포넌트, 워크플로우, 통합 등을
                    구체적으로 설명해보세요.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleUserRequest} disabled={!userRequest.trim() || isProcessing}>
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      AI 자동화 작업하기
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execution" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!currentTaskPlan ? (
                <div className="text-center p-8 border rounded-lg">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">실행 중인 작업 없음</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    요청을 입력하고 처리 버튼을 클릭하여 작업을 시작하세요.
                  </p>
                  <Button onClick={() => setActiveTab("request")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    요청 입력으로 이동
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">작업 계획: {currentTaskPlan.description}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(currentTaskPlan.status)}>
                          {getStatusText(currentTaskPlan.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">사용자 요청</h4>
                        <p className="bg-muted p-2 rounded-md">{currentTaskPlan.context.userRequest}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">작업 진행 상황</h4>
                        <div className="space-y-2">
                          {currentTaskPlan.tasks && currentTaskPlan.tasks.length > 0 ? (
                            currentTaskPlan.tasks.map((task) => renderTask(task))
                          ) : (
                            <p className="text-sm text-muted-foreground">작업이 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={handleSaveResult}
                        disabled={currentTaskPlan.status !== "completed"}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        결과 저장하기
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="results" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!currentTaskPlan || currentTaskPlan.status !== "completed" ? (
                <div className="text-center p-8 border rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">완료된 작업 결과 없음</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    작업이 완료되면 여기에 결과가 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">작업 결과 요약</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">생성된 컴포넌트</h4>
                          <div className="space-y-2">{renderComponents()}</div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">생성된 워크플로우</h4>
                          <div className="space-y-2">{renderWorkflows()}</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button className="flex-1 mr-2" onClick={handleSaveResult}>
                        <Save className="mr-2 h-4 w-4" />
                        결과 저장하기
                      </Button>
                      <Button
                        className="flex-1 ml-2"
                        variant="outline"
                        onClick={() => {
                          // 파일 저장 후 파일 탭으로 이동
                          handleSaveResult()
                          setActiveTab("files")
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        파일 목록 보기
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="files" className="flex-1 p-0 m-0">
          <div className="p-4">
            <FileManagerUI />
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-0 m-0">
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">작업 기록</CardTitle>
                <CardDescription>이전에 실행한 작업 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {taskHistory.length === 0 ? (
                    <div className="text-center p-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">작업 기록 없음</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        아직 실행한 작업이 없습니다. 요청을 입력하고 처리해보세요.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {taskHistory.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted"
                          onClick={() => handleSelectTask(task)}
                        >
                          <div className="flex items-center">
                            {task.status === "completed" && <Check className="h-4 w-4 text-green-500 mr-2" />}
                            {task.status === "in_progress" && <RefreshCw className="h-4 w-4 text-blue-500 mr-2" />}
                            {task.status === "failed" && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                            <div>
                              <div className="font-medium">{task.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(task.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(task.status)}>{getStatusText(task.status)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="flex-1 p-0 m-0">
          <div className="p-4">
            {currentTaskPlan ? (
              <ProcessStudioExporter
                tasks={[currentTaskPlan]}
                components={extractedComponents}
                workflows={extractedWorkflows}
              />
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">내보낼 데이터 없음</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  먼저 작업을 실행하고 결과를 생성해야 프로세스 스튜디오로 내보낼 수 있습니다.
                </p>
                <Button onClick={() => setActiveTab("request")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  요청 입력으로 이동
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="runner" className="flex-1 p-0 m-0">
          <div className="p-4">
            {processStudioData ? (
              <ProcessStudioRunner processData={processStudioData} />
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">실행할 프로세스 없음</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  먼저 작업을 실행하고 결과를 생성해야 프로세스를 실행할 수 있습니다.
                </p>
                <Button onClick={() => setActiveTab("request")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  요청 입력으로 이동
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
