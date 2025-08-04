"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Workflow, WorkflowStep } from "@/lib/workflow-engine"
import { WorkflowIcon, Plus, ArrowRight, Settings, Play, Trash, Save, AlertCircle, Check, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface WorkflowEditorProps {
  workflow: Workflow
  onSave: (workflow: Workflow) => void
  onRun: (workflow: Workflow) => Promise<any>
  isRunning: boolean
  lastRunResult?: any
}

export function WorkflowEditor({ workflow, onSave, onRun, isRunning, lastRunResult }: WorkflowEditorProps) {
  const [editedWorkflow, setEditedWorkflow] = useState<Workflow>({ ...workflow })
  const [activeTab, setActiveTab] = useState("design")
  const [showStepDialog, setShowStepDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null)
  const [isNewStep, setIsNewStep] = useState(false)
  const [stepPosition, setStepPosition] = useState<{ afterId?: string }>({})

  // 워크플로우 변경 시 상태 업데이트
  useEffect(() => {
    setEditedWorkflow({ ...workflow })
  }, [workflow])

  // 워크플로우 메타데이터 업데이트
  const updateWorkflowMeta = (field: string, value: any) => {
    setEditedWorkflow((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 단계 추가 다이얼로그 열기
  const openAddStepDialog = (afterId?: string) => {
    setCurrentStep({
      id: uuidv4(),
      name: "",
      type: "http",
      config: {},
      next: [],
    })
    setIsNewStep(true)
    setStepPosition({ afterId })
    setShowStepDialog(true)
  }

  // 단계 편집 다이얼로그 열기
  const openEditStepDialog = (stepId: string) => {
    const step = editedWorkflow.steps.find((s) => s.id === stepId)
    if (step) {
      setCurrentStep({ ...step })
      setIsNewStep(false)
      setShowStepDialog(true)
    }
  }

  // 단계 저장
  const saveStep = () => {
    if (!currentStep) return

    let updatedSteps = [...editedWorkflow.steps]

    if (isNewStep) {
      // 새 단계 추가
      if (stepPosition.afterId) {
        // 특정 단계 뒤에 추가
        const afterIndex = updatedSteps.findIndex((s) => s.id === stepPosition.afterId)
        if (afterIndex !== -1) {
          // 다음 단계 연결 업데이트
          const afterStep = { ...updatedSteps[afterIndex] }
          currentStep.next = [...afterStep.next]
          afterStep.next = [currentStep.id]
          updatedSteps[afterIndex] = afterStep

          // 새 단계 삽입
          updatedSteps.splice(afterIndex + 1, 0, currentStep)
        } else {
          updatedSteps.push(currentStep)
        }
      } else {
        // 첫 번째 단계로 추가
        if (updatedSteps.length > 0) {
          currentStep.next = [updatedSteps[0].id]
        }
        updatedSteps.unshift(currentStep)
      }
    } else {
      // 기존 단계 업데이트
      updatedSteps = updatedSteps.map((step) => (step.id === currentStep.id ? currentStep : step))
    }

    // 시작 단계 업데이트
    let startStepId = editedWorkflow.startStepId
    if (isNewStep && !stepPosition.afterId && updatedSteps.length > 0) {
      startStepId = updatedSteps[0].id
    }

    // 종료 단계 업데이트
    const endStepIds = updatedSteps.filter((step) => !step.next || step.next.length === 0).map((step) => step.id)

    setEditedWorkflow((prev) => ({
      ...prev,
      steps: updatedSteps,
      startStepId,
      endStepIds,
    }))

    setShowStepDialog(false)
  }

  // 단계 삭제
  const deleteStep = (stepId: string) => {
    const stepIndex = editedWorkflow.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const step = editedWorkflow.steps[stepIndex]
    let updatedSteps = [...editedWorkflow.steps]

    // 이전 단계 찾기
    const prevSteps = updatedSteps.filter((s) => s.next.includes(stepId))

    // 이전 단계의 next 업데이트
    updatedSteps = updatedSteps.map((s) => {
      if (s.next.includes(stepId)) {
        return {
          ...s,
          next: s.next.flatMap((nextId) => (nextId === stepId ? step.next : [nextId])),
        }
      }
      return s
    })

    // 단계 제거
    updatedSteps = updatedSteps.filter((s) => s.id !== stepId)

    // 시작 단계 업데이트
    let startStepId = editedWorkflow.startStepId
    if (stepId === startStepId && updatedSteps.length > 0) {
      startStepId = updatedSteps[0].id
    }

    // 종료 단계 업데이트
    const endStepIds = updatedSteps.filter((step) => !step.next || step.next.length === 0).map((step) => step.id)

    setEditedWorkflow((prev) => ({
      ...prev,
      steps: updatedSteps,
      startStepId,
      endStepIds,
    }))
  }

  // 워크플로우 저장
  const handleSave = () => {
    onSave(editedWorkflow)
  }

  // 워크플로우 실행
  const handleRun = async () => {
    try {
      await onRun(editedWorkflow)
    } catch (error) {
      console.error("워크플로우 실행 오류:", error)
    }
  }

  // 단계 유형에 따른 구성 UI 렌더링
  const renderStepConfig = () => {
    if (!currentStep) return null

    switch (currentStep.type) {
      case "http":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://api.example.com/endpoint"
                value={currentStep.config?.url || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, url: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">메서드</label>
              <Select
                value={currentStep.config?.method || "GET"}
                onValueChange={(value) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, method: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="메서드 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">헤더 (JSON)</label>
              <Textarea
                placeholder='{"Content-Type": "application/json"}'
                value={currentStep.config?.headers ? JSON.stringify(currentStep.config.headers, null, 2) : ""}
                onChange={(e) => {
                  try {
                    const headers = e.target.value ? JSON.parse(e.target.value) : {}
                    setCurrentStep({
                      ...currentStep,
                      config: { ...currentStep.config, headers },
                    })
                  } catch (error) {
                    // JSON 파싱 오류 무시
                  }
                }}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">본문 (JSON)</label>
              <Textarea
                placeholder='{"key": "value"}'
                value={currentStep.config?.body ? JSON.stringify(currentStep.config.body, null, 2) : ""}
                onChange={(e) => {
                  try {
                    const body = e.target.value ? JSON.parse(e.target.value) : null
                    setCurrentStep({
                      ...currentStep,
                      config: { ...currentStep.config, body },
                    })
                  } catch (error) {
                    // JSON 파싱 오류 무시
                  }
                }}
                rows={5}
              />
            </div>
          </div>
        )

      case "database":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">쿼리</label>
              <Textarea
                placeholder="SELECT * FROM users WHERE id = :userId"
                value={currentStep.config?.query || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, query: e.target.value },
                  })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">파라미터 (JSON 또는 컨텍스트 참조)</label>
              <Textarea
                placeholder='{"userId": 123} 또는 $.results.previous-step'
                value={
                  typeof currentStep.config?.params === "string"
                    ? currentStep.config.params
                    : JSON.stringify(currentStep.config?.params || {}, null, 2)
                }
                onChange={(e) => {
                  try {
                    // 컨텍스트 참조 문자열인지 확인
                    if (e.target.value.startsWith("$.")) {
                      setCurrentStep({
                        ...currentStep,
                        config: { ...currentStep.config, params: e.target.value },
                      })
                    } else {
                      // JSON 파싱 시도
                      const params = e.target.value ? JSON.parse(e.target.value) : {}
                      setCurrentStep({
                        ...currentStep,
                        config: { ...currentStep.config, params },
                      })
                    }
                  } catch (error) {
                    // JSON 파싱 오류 무시
                  }
                }}
                rows={3}
              />
            </div>
          </div>
        )

      case "transform":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">소스 데이터</label>
              <Input
                placeholder="$.results.previous-step"
                value={currentStep.config?.source || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, source: e.target.value },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                이전 단계의 결과를 참조하려면 $.results.step-id 형식을 사용하세요.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">변환 (JSON)</label>
              <Textarea
                placeholder={`[
  {
    "type": "map",
    "mapping": {
      "id": "item.id",
      "name": "item.first_name + ' ' + item.last_name"
    }
  }
]`}
                value={
                  currentStep.config?.transformations ? JSON.stringify(currentStep.config.transformations, null, 2) : ""
                }
                onChange={(e) => {
                  try {
                    const transformations = e.target.value ? JSON.parse(e.target.value) : []
                    setCurrentStep({
                      ...currentStep,
                      config: { ...currentStep.config, transformations },
                    })
                  } catch (error) {
                    // JSON 파싱 오류 무시
                  }
                }}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">지원되는 변환 유형: map, filter, reduce</p>
            </div>
          </div>
        )

      case "condition":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">소스 데이터</label>
              <Input
                placeholder="$.results.previous-step"
                value={currentStep.config?.source || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, source: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">조건 (JavaScript 표현식)</label>
              <Textarea
                placeholder="data.length > 0 && data[0].status === 'active'"
                value={currentStep.config?.condition || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, condition: e.target.value },
                  })
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                조건이 true이면 첫 번째 다음 단계로, false이면 두 번째 다음 단계로 진행합니다.
              </p>
            </div>
          </div>
        )

      case "delay":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">지연 시간 (밀리초)</label>
              <Input
                type="number"
                placeholder="1000"
                value={currentStep.config?.duration || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, duration: e.target.value },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">1000 = 1초, 60000 = 1분</p>
            </div>
          </div>
        )

      case "notification":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">채널</label>
              <Select
                value={currentStep.config?.channel || "email"}
                onValueChange={(value) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, channel: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="채널 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">이메일</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">수신자</label>
              <Textarea
                placeholder="user@example.com, another@example.com"
                value={
                  Array.isArray(currentStep.config?.recipients)
                    ? currentStep.config.recipients.join(", ")
                    : currentStep.config?.recipients || ""
                }
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: {
                      ...currentStep.config,
                      recipients: e.target.value
                        .split(",")
                        .map((r) => r.trim())
                        .filter(Boolean),
                    },
                  })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">메시지</label>
              <Textarea
                placeholder="알림 메시지 내용"
                value={currentStep.config?.message || ""}
                onChange={(e) =>
                  setCurrentStep({
                    ...currentStep,
                    config: { ...currentStep.config, message: e.target.value },
                  })
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                컨텍스트 변수를 사용하려면 {"{variable}"} 형식을 사용하세요.
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>지원되지 않는 단계 유형입니다.</p>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-semibold">{editedWorkflow.name || "새 워크플로우"}</h2>
          <Badge variant="outline" className="ml-2">
            {editedWorkflow.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={handleRun}
            disabled={isRunning || editedWorkflow.steps.length === 0}
          >
            {isRunning ? (
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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
              <Button variant="outline" size="sm" onClick={() => openAddStepDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                단계 추가
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {editedWorkflow.steps.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg">
                    <WorkflowIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">워크플로우가 비어 있습니다</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      워크플로우에 단계를 추가하여 시작하세요. 각 단계는 특정 작업을 수행하며 순차적으로 실행됩니다.
                    </p>
                    <Button onClick={() => openAddStepDialog()}>
                      <Plus className="mr-2 h-4 w-4" />첫 번째 단계 추가
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editedWorkflow.steps.map((step, index) => (
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
                              {step.type === "http" && (
                                <div>
                                  <span className="font-medium">{step.config?.method || "GET"}</span>
                                  <span className="mx-2">→</span>
                                  <span>{step.config?.url || "URL 없음"}</span>
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
                                  <span className="font-mono text-xs">{step.config?.source || "소스 없음"}</span>
                                </div>
                              )}

                              {step.type === "condition" && (
                                <div>
                                  <span>조건: </span>
                                  <span className="font-mono text-xs">{step.config?.condition || "조건 없음"}</span>
                                </div>
                              )}

                              {step.type === "delay" && (
                                <div>
                                  <span>지연: </span>
                                  <span>{step.config?.duration || 0}ms</span>
                                </div>
                              )}

                              {step.type === "notification" && (
                                <div>
                                  <span>채널: </span>
                                  <span>{step.config?.channel || "채널 없음"}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditStepDialog(step.id)}>
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => deleteStep(step.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openAddStepDialog(step.id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              다음 단계 추가
                            </Button>
                          </CardFooter>
                        </Card>

                        {index < editedWorkflow.steps.length - 1 && (
                          <div className="flex justify-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                      value={editedWorkflow.name}
                      onChange={(e) => updateWorkflowMeta("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">설명</label>
                    <Textarea
                      placeholder="워크플로우 설명"
                      value={editedWorkflow.description}
                      onChange={(e) => updateWorkflowMeta("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">유형</label>
                    <Select
                      value={editedWorkflow.type}
                      onValueChange={(value: any) => updateWorkflowMeta("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">순차 실행</SelectItem>
                        <SelectItem value="parallel">병렬 실행</SelectItem>
                        <SelectItem value="conditional">조건부 실행</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {editedWorkflow.type === "sequential" && "단계가 순차적으로 실행됩니다."}
                      {editedWorkflow.type === "parallel" && "가능한 단계가 병렬로 실행됩니다."}
                      {editedWorkflow.type === "conditional" && "조건에 따라 다른 경로로 실행됩니다."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">상태</label>
                    <Select
                      value={editedWorkflow.status}
                      onValueChange={(value: any) => updateWorkflowMeta("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">고급 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">워크플로우 ID</label>
                    <Input value={editedWorkflow.id} disabled />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">생성 시간</label>
                    <Input value={new Date(editedWorkflow.createdAt).toLocaleString()} disabled />
                  </div>

                  {editedWorkflow.lastRun && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">마지막 실행</label>
                      <Input value={new Date(editedWorkflow.lastRun).toLocaleString()} disabled />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="results" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!lastRunResult ? (
                <div className="text-center p-8 border rounded-lg">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">실행 결과 없음</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    워크플로우를 실행하여 결과를 확인하세요.
                  </p>
                  <Button onClick={handleRun} disabled={isRunning || editedWorkflow.steps.length === 0}>
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
                        <Badge variant={lastRunResult.success ? "default" : "destructive"}>
                          {lastRunResult.success ? "성공" : "실패"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lastRunResult.success ? (
                        <div className="space-y-4">
                          <div className="flex items-center text-green-500">
                            <Check className="h-4 w-4 mr-2" />
                            <span>워크플로우가 성공적으로 실행되었습니다.</span>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">단계별 결과</h4>
                            <div className="border rounded-md overflow-hidden">
                              <pre className="p-4 text-xs overflow-auto max-h-96">
                                {JSON.stringify(lastRunResult.results, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center text-red-500">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>워크플로우 실행 중 오류가 발생했습니다.</span>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">오류 메시지</h4>
                            <div className="border rounded-md overflow-hidden bg-red-50 dark:bg-red-950">
                              <pre className="p-4 text-xs text-red-600 dark:text-red-400 overflow-auto">
                                {lastRunResult.error}
                              </pre>
                            </div>
                          </div>

                          {lastRunResult.context && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">컨텍스트</h4>
                              <div className="border rounded-md overflow-hidden">
                                <pre className="p-4 text-xs overflow-auto max-h-96">
                                  {JSON.stringify(lastRunResult.context, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* 단계 편집 다이얼로그 */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isNewStep ? "단계 추가" : "단계 편집"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">이름</label>
              <Input
                placeholder="단계 이름"
                value={currentStep?.name || ""}
                onChange={(e) => setCurrentStep((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">유형</label>
              <Select
                value={currentStep?.type || "http"}
                onValueChange={(value) =>
                  setCurrentStep((prev) => (prev ? { ...prev, type: value, config: {} } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP 요청</SelectItem>
                  <SelectItem value="database">데이터베이스</SelectItem>
                  <SelectItem value="transform">데이터 변환</SelectItem>
                  <SelectItem value="condition">조건</SelectItem>
                  <SelectItem value="delay">지연</SelectItem>
                  <SelectItem value="notification">알림</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">구성</h4>
              {renderStepConfig()}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              취소
            </Button>
            <Button onClick={saveStep}>{isNewStep ? "추가" : "저장"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
