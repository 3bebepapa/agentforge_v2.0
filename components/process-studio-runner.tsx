"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RefreshCw, Check, AlertCircle, Clock, Info, RotateCcw } from "lucide-react"

interface ProcessStudioRunnerProps {
  processData: any
}

export function ProcessStudioRunner({ processData }: ProcessStudioRunnerProps) {
  const [activeProcess, setActiveProcess] = useState<any>(null)
  const [processStatus, setProcessStatus] = useState<"idle" | "running" | "paused" | "completed" | "error">("idle")
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("execution")
  const [executionTime, setExecutionTime] = useState<number>(0)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [autoRetry, setAutoRetry] = useState<boolean>(true)
  const [feedbackLoop, setFeedbackLoop] = useState<boolean>(true)
  const maxRetries = 3

  // 마누스 루프 상태
  const [learningData, setLearningData] = useState<any[]>([])
  const [optimizationStatus, setOptimizationStatus] = useState<"idle" | "learning" | "optimized">("idle")

  // 실행 결과 저장
  const [executionResults, setExecutionResults] = useState<any[]>([])

  // 로그 스크롤 참조
  const logScrollRef = useRef<HTMLDivElement>(null)

  // 프로세스 데이터가 변경되면 초기화
  useEffect(() => {
    if (processData) {
      console.log("프로세스 데이터 로드:", processData)

      // 워크플로우 데이터 확인 및 로그
      if (processData.workflows && processData.workflows.length > 0) {
        const workflow = processData.workflows[0]
        console.log("워크플로우 로드:", workflow)

        if (workflow.steps && Array.isArray(workflow.steps)) {
          console.log("워크플로우 단계 수:", workflow.steps.length)
        } else {
          console.warn("워크플로우에 단계가 없거나 배열이 아닙니다.")

          // 기본 단계 생성
          if (!workflow.steps || !Array.isArray(workflow.steps)) {
            workflow.steps = [
              { id: "step_1", name: "요청 수신", description: "HTTP 요청 수신 및 유효성 검증" },
              { id: "step_2", name: "요청 처리", description: "비즈니스 로직 처리" },
              { id: "step_3", name: "응답 변환", description: "응답 데이터 변환" },
              { id: "step_4", name: "응답 반환", description: "HTTP 응답 반환" },
            ]
          }
        }
      } else {
        console.warn("프로세스에 워크플로우가 없습니다. 기본 워크플로우를 생성합니다.")

        // 기본 워크플로우 생성
        processData.workflows = [
          {
            id: `wf_default_${Date.now()}`,
            name: "기본 HTTP 워크플로우",
            description: "시스템에서 생성된 기본 HTTP 요청 처리 워크플로우",
            steps: [
              { id: "step_1", name: "요청 수신", description: "HTTP 요청 수신 및 유효성 검증" },
              { id: "step_2", name: "요청 처리", description: "비즈니스 로직 처리" },
              { id: "step_3", name: "응답 변환", description: "응답 데이터 변환" },
              { id: "step_4", name: "응답 반환", description: "HTTP 응답 반환" },
            ],
          },
        ]
      }

      setActiveProcess(processData)
      resetProcess()
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [processData])

  // 로그가 추가될 때 스크롤 자동 이동
  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight
    }
  }, [logs])

  // 프로세스 초기화
  const resetProcess = () => {
    setProcessStatus("idle")
    setCurrentStep(0)
    setLogs([])
    setExecutionTime(0)
    setRetryCount(0)
    setExecutionResults([])
    setOptimizationStatus("idle")

    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
  }

  // 프로세스 실행
  const runProcess = () => {
    if (!activeProcess) return

    if (processStatus === "paused") {
      setProcessStatus("running")
      addLog("프로세스 실행 재개")

      // 타이머 재시작
      const newTimer = setInterval(() => {
        setExecutionTime((prev) => prev + 1)
      }, 1000)
      setTimer(newTimer)

      return
    }

    resetProcess()
    setProcessStatus("running")
    addLog("프로세스 실행 시작")

    // 마누스 루프 초기화
    if (feedbackLoop) {
      addLog("마누스 루프 활성화: 실행 결과를 분석하여 프로세스를 최적화합니다.")
      setLearningData([])
    }

    // 타이머 시작
    const newTimer = setInterval(() => {
      setExecutionTime((prev) => prev + 1)
    }, 1000)
    setTimer(newTimer)

    // 첫 단계 실행
    executeNextStep()
  }

  // 프로세스 일시 중지
  const pauseProcess = () => {
    if (processStatus !== "running") return

    setProcessStatus("paused")
    addLog("프로세스 일시 중지")

    // 타이머 중지
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
  }

  // 다음 단계 실행
  const executeNextStep = () => {
    if (!activeProcess || !activeProcess.workflows || !activeProcess.workflows.length) {
      addLog("워크플로우 데이터가 없습니다. 프로세스를 초기화합니다.")
      resetProcess()
      return
    }

    const workflow = activeProcess.workflows[0]
    if (!workflow.steps || !Array.isArray(workflow.steps) || workflow.steps.length === 0) {
      addLog("워크플로우에 단계가 없습니다. 프로세스를 완료합니다.")
      completeProcess()
      return
    }

    if (currentStep >= workflow.steps.length) {
      completeProcess()
      return
    }

    const step = workflow.steps[currentStep]
    const stepName = step.name || `단계 ${currentStep + 1}`
    addLog(`단계 실행: ${stepName}`)

    // 단계 실행 시뮬레이션 (실제로는 여기서 단계 로직 실행)
    setTimeout(() => {
      if (processStatus !== "running") return

      // 성공 확률 (데모용)
      // 마누스 루프가 활성화되고 최적화된 경우 성공 확률 증가
      const baseSuccessRate = optimizationStatus === "optimized" ? 0.98 : 0.9
      const success = Math.random() < baseSuccessRate

      if (success) {
        // 성공 처리
        addLog(`단계 완료: ${stepName}`)

        // 실행 결과 저장 (마누스 루프용)
        const result = {
          stepId: step.id,
          stepName: stepName,
          status: "success",
          executionTime: Math.floor(Math.random() * 500) + 100, // 시뮬레이션된 실행 시간 (ms)
          data: { success: true },
        }
        setExecutionResults((prev) => [...prev, result])

        // 마누스 루프 학습 데이터 수집
        if (feedbackLoop) {
          setLearningData((prev) => [
            ...prev,
            {
              step: step,
              result: result,
              timestamp: Date.now(),
            },
          ])
        }

        // 다음 단계로 이동
        setCurrentStep((prev) => prev + 1)

        // 다음 단계 실행
        if (currentStep + 1 < workflow.steps.length) {
          executeNextStep()
        } else {
          completeProcess()
        }
      } else {
        // 실패 처리
        addLog(`단계 실패: ${stepName} - 오류 발생`)

        // 실행 결과 저장 (마누스 루프용)
        const result = {
          stepId: step.id,
          stepName: stepName,
          status: "error",
          error: "단계 실행 중 오류가 발생했습니다.",
          executionTime: Math.floor(Math.random() * 500) + 100, // 시뮬레이션된 실행 시간 (ms)
        }
        setExecutionResults((prev) => [...prev, result])

        // 마누스 루프 학습 데이터 수집
        if (feedbackLoop) {
          setLearningData((prev) => [
            ...prev,
            {
              step: step,
              result: result,
              timestamp: Date.now(),
            },
          ])
        }

        // 자동 재시도 확인
        if (autoRetry && retryCount < maxRetries) {
          handleRetry()
        } else {
          setProcessStatus("error")

          // 타이머 중지
          if (timer) {
            clearInterval(timer)
            setTimer(null)
          }
        }
      }
    }, 1500) // 1.5초 후 다음 단계 실행 (데모용)
  }

  // 단계 재시도
  const handleRetry = () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)

    const workflow = activeProcess.workflows[0]
    const step = workflow.steps[currentStep]
    const stepName = step.name || `단계 ${currentStep + 1}`

    addLog(`단계 재시도 (${newRetryCount}/${maxRetries}): ${stepName}`)

    // 지연 후 재시도
    setTimeout(() => {
      if (processStatus !== "running") return
      executeNextStep()
    }, 2000) // 2초 후 재시도
  }

  // 프로세스 완료
  const completeProcess = () => {
    setProcessStatus("completed")
    addLog("프로세스 실행 완료")

    // 마누스 루프 최적화 시작
    if (feedbackLoop && learningData.length > 0) {
      optimizeProcess()
    }

    // 타이머 중지
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
  }

  // 마누스 루프 프로세스 최적화
  const optimizeProcess = () => {
    addLog("마누스 루프: 프로세스 최적화 시작")
    setOptimizationStatus("learning")

    // 최적화 시뮬레이션 (실제로는 여기서 AI 기반 최적화 수행)
    setTimeout(() => {
      // 실패한 단계 분석
      const failedSteps = learningData.filter((data) => data.result.status === "error")

      if (failedSteps.length > 0) {
        addLog(`마누스 루프: ${failedSteps.length}개의 실패한 단계 발견`)

        // 워크플로우 최적화 (시뮬레이션)
        const workflow = activeProcess.workflows[0]
        const optimizedWorkflow = { ...workflow }

        // 실패한 단계에 대한 최적화 적용
        failedSteps.forEach((failedData) => {
          const stepIndex = optimizedWorkflow.steps.findIndex((s) => s.id === failedData.step.id)
          if (stepIndex >= 0) {
            addLog(`마누스 루프: '${failedData.step.name}' 단계 최적화`)

            // 최적화된 단계로 교체 (시뮬레이션)
            optimizedWorkflow.steps[stepIndex] = {
              ...optimizedWorkflow.steps[stepIndex],
              optimized: true,
              description: `${optimizedWorkflow.steps[stepIndex].description || ""} (최적화됨)`,
            }
          }
        })

        // 최적화된 워크플로우 적용
        const updatedProcess = { ...activeProcess }
        updatedProcess.workflows[0] = optimizedWorkflow
        setActiveProcess(updatedProcess)

        addLog("마누스 루프: 프로세스 최적화 완료")
      } else {
        addLog("마누스 루프: 모든 단계가 성공적으로 실행되었습니다. 최적화가 필요하지 않습니다.")
      }

      setOptimizationStatus("optimized")
    }, 3000) // 3초 후 최적화 완료 (시뮬레이션)
  }

  // 로그 추가
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  // 실행 시간 포맷
  const formatExecutionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 상태에 따른 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "running":
        return "secondary"
      case "completed":
        return "default"
      case "error":
        return "destructive"
      case "paused":
        return "outline"
      default:
        return "outline"
    }
  }

  // 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "idle":
        return "대기 중"
      case "running":
        return "실행 중"
      case "paused":
        return "일시 중지"
      case "completed":
        return "완료"
      case "error":
        return "오류"
      default:
        return "알 수 없음"
    }
  }

  if (!activeProcess) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">실행할 프로세스 없음</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">프로세스를 생성하거나 선택하여 실행하세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">프로세스 실행: {activeProcess.name || "이름 없는 프로세스"}</CardTitle>
            <div className="flex items-center space-x-2">
              {optimizationStatus === "optimized" && (
                <Badge variant="outline" className="bg-green-50">
                  최적화됨
                </Badge>
              )}
              <Badge variant={getStatusBadgeVariant(processStatus)}>{getStatusText(processStatus)}</Badge>
            </div>
          </div>
          <CardDescription>{activeProcess.description || "설명 없음"}</CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={runProcess}
                disabled={processStatus === "running" || processStatus === "completed"}
              >
                <Play className="h-4 w-4 mr-1" />
                {processStatus === "paused" ? "계속" : "실행"}
              </Button>

              <Button size="sm" variant="outline" onClick={pauseProcess} disabled={processStatus !== "running"}>
                <Pause className="h-4 w-4 mr-1" />
                일시 중지
              </Button>

              <Button size="sm" variant="outline" onClick={resetProcess} disabled={processStatus === "idle"}>
                <RefreshCw className="h-4 w-4 mr-1" />
                초기화
              </Button>

              {processStatus === "error" && (
                <Button size="sm" variant="outline" onClick={handleRetry} disabled={retryCount >= maxRetries}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  재시도 ({retryCount}/{maxRetries})
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm">{formatExecutionTime(executionTime)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRetry}
                    onChange={(e) => setAutoRetry(e.target.checked)}
                    className="mr-1"
                  />
                  자동 재시도
                </label>

                <label className="text-sm flex items-center">
                  <input
                    type="checkbox"
                    checked={feedbackLoop}
                    onChange={(e) => setFeedbackLoop(e.target.checked)}
                    className="mr-1"
                  />
                  마누스 루프
                </label>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="execution">실행</TabsTrigger>
              <TabsTrigger value="logs">로그</TabsTrigger>
              <TabsTrigger value="details">상세 정보</TabsTrigger>
              {feedbackLoop && <TabsTrigger value="manus">마누스 루프</TabsTrigger>}
            </TabsList>

            <TabsContent value="execution" className="m-0">
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">워크플로우 진행 상황</h4>

                  {activeProcess.workflows && activeProcess.workflows.length > 0 ? (
                    <div className="space-y-2">
                      {activeProcess.workflows[0].steps?.map((step: any, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center p-2 rounded-md ${
                            index < currentStep
                              ? "bg-green-500/10"
                              : index === currentStep && processStatus === "running"
                                ? "bg-blue-500/10"
                                : index === currentStep && processStatus === "error"
                                  ? "bg-red-500/10"
                                  : "bg-gray-500/10"
                          }`}
                        >
                          <div className="mr-2">
                            {index < currentStep && <Check className="h-4 w-4 text-green-500" />}
                            {index === currentStep && processStatus === "running" && (
                              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                            )}
                            {index === currentStep && processStatus === "error" && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            {(index > currentStep ||
                              (index === currentStep && processStatus !== "running" && processStatus !== "error")) && (
                              <Clock className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center">
                              {step.name || `단계 ${index + 1}`}
                              {step.optimized && (
                                <Badge variant="outline" className="ml-2 text-xs bg-green-50">
                                  최적화됨
                                </Badge>
                              )}
                            </div>
                            {step.description && (
                              <div className="text-xs text-muted-foreground">{step.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">워크플로우 단계가 없습니다.</p>
                  )}
                </div>

                {processStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      프로세스 실행 중 오류가 발생했습니다. 로그를 확인하고 다시 시도하세요.
                    </AlertDescription>
                  </Alert>
                )}

                {processStatus === "completed" && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      프로세스가 성공적으로 완료되었습니다.
                      {optimizationStatus === "optimized" && " 마누스 루프를 통해 프로세스가 최적화되었습니다."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="m-0">
              <ScrollArea className="h-[300px] border rounded-md p-3" ref={logScrollRef}>
                {logs.length > 0 ? (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">로그가 없습니다.</p>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="m-0">
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">컴포넌트</h4>

                  {activeProcess.components && activeProcess.components.length > 0 ? (
                    <div className="space-y-2">
                      {activeProcess.components.map((component: any, index: number) => (
                        <div key={index} className="flex items-center p-2 rounded-md bg-muted">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{component.name || `컴포넌트 ${index + 1}`}</div>
                            {component.description && (
                              <div className="text-xs text-muted-foreground">{component.description}</div>
                            )}
                          </div>
                          <Badge variant="outline">{component.type || "유형 없음"}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">사용된 컴포넌트가 없습니다.</p>
                  )}
                </div>

                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">실행 결과</h4>

                  {executionResults.length > 0 ? (
                    <div className="space-y-2">
                      {executionResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md ${
                            result.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{result.stepName}</div>
                            <Badge variant={result.status === "success" ? "default" : "destructive"}>
                              {result.status === "success" ? "성공" : "실패"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">실행 시간: {result.executionTime}ms</div>
                          {result.error && <div className="text-xs text-red-500 mt-1">{result.error}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">실행 결과가 없습니다.</p>
                  )}
                </div>

                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">설정</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">버전</span>
                      <span className="text-sm font-medium">{activeProcess.version || "1.0"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">생성 시간</span>
                      <span className="text-sm font-medium">
                        {activeProcess.metadata?.exportedAt
                          ? new Date(activeProcess.metadata.exportedAt).toLocaleString()
                          : "알 수 없음"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">소스</span>
                      <span className="text-sm font-medium">{activeProcess.metadata?.source || "알 수 없음"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manus" className="m-0">
              <div className="space-y-3">
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">마누스 루프 상태</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">상태</span>
                      <Badge
                        variant={
                          optimizationStatus === "idle"
                            ? "outline"
                            : optimizationStatus === "learning"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {optimizationStatus === "idle"
                          ? "대기 중"
                          : optimizationStatus === "learning"
                            ? "학습 중"
                            : "최적화됨"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">수집된 데이터</span>
                      <span className="text-sm font-medium">{learningData.length}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">최적화된 단계</span>
                      <span className="text-sm font-medium">
                        {(activeProcess.workflows &&
                          activeProcess.workflows[0]?.steps?.filter((s: any) => s.optimized).length) ||
                          0}
                        개
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">마누스 루프 설명</h4>

                  <div className="text-sm space-y-2">
                    <p>
                      마누스 루프는 프로세스 실행 결과를 분석하여 자동으로 최적화하는 피드백 시스템입니다. 실행 중
                      발생한 오류와 성능 데이터를 수집하여 프로세스를 개선합니다.
                    </p>
                    <p>
                      1. <strong>데이터 수집</strong>: 각 단계의 실행 결과와 성능 데이터를 수집합니다.
                    </p>
                    <p>
                      2. <strong>분석 및 학습</strong>: 수집된 데이터를 분석하여 문제점을 식별합니다.
                    </p>
                    <p>
                      3. <strong>최적화</strong>: 분석 결과를 바탕으로 프로세스를 자동으로 최적화합니다.
                    </p>
                  </div>
                </div>

                {learningData.length > 0 && (
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-2">수집된 학습 데이터</h4>

                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {learningData.map((data, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-md ${
                              data.result.status === "success" ? "bg-green-500/10" : "bg-red-500/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">{data.step.name}</div>
                              <Badge variant={data.result.status === "success" ? "default" : "destructive"}>
                                {data.result.status === "success" ? "성공" : "실패"}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              수집 시간: {new Date(data.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          <div className="flex items-center text-xs text-muted-foreground">
            <Info className="h-3 w-3 mr-1" />
            프로세스 스튜디오에서 생성된 프로세스를 실행하고 모니터링합니다.
            {feedbackLoop && " 마누스 루프를 통해 프로세스가 자동으로 최적화됩니다."}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
