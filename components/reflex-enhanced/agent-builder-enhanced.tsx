/**
 * Reflex 스타일로 개선된 에이전트 빌더
 * 기존 components/agent-builder.tsx를 대체
 */

"use client"

import React from "react"
import { useReflexComponent } from "@/components/reflex-core/base-component"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Play, Square, Trash2 } from "lucide-react"

export function ReflexAgentBuilder() {
  const { state, emit } = useReflexComponent("agent-builder", (globalState) => ({
    agents: globalState.agents.list,
    activeAgent: globalState.agents.active,
    isCreating: globalState.agents.creating,
    executing: globalState.agents.executing,
    templates: globalState.agents.templates,
    tools: globalState.agents.tools,
    loading: globalState.ui.loading.agentBuilder || false,
    errors: globalState.ui.errors.agentBuilder,
  }))

  const [formData, setFormData] = React.useState({
    name: "",
    type: "general",
    description: "",
    prompt: "",
    tools: [] as string[],
    config: {},
  })

  // 에이전트 생성
  const handleCreateAgent = async () => {
    if (!formData.name.trim()) {
      emit("system.notification.show", {
        type: "error",
        message: "에이전트 이름을 입력해주세요.",
      })
      return
    }

    emit("agent.create", {
      name: formData.name,
      type: formData.type,
      config: {
        description: formData.description,
        prompt: formData.prompt,
        tools: formData.tools,
        ...formData.config,
      },
    })

    // 폼 초기화
    setFormData({
      name: "",
      type: "general",
      description: "",
      prompt: "",
      tools: [],
      config: {},
    })
  }

  // 에이전트 실행
  const handleExecuteAgent = (agentId: string) => {
    emit("agent.execute", {
      id: agentId,
      input: {},
    })
  }

  // 에이전트 중지
  const handleStopAgent = (agentId: string) => {
    emit("agent.stop", { id: agentId })
  }

  // 에이전트 삭제
  const handleDeleteAgent = (agentId: string) => {
    emit("agent.delete", { id: agentId })
  }

  return (
    <div className="h-full flex gap-6">
      {/* 왼쪽: 에이전트 생성 폼 */}
      <div className="w-1/3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />새 에이전트 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">에이전트 이름</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="에이전트 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="text-sm font-medium">에이전트 타입</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반</SelectItem>
                  <SelectItem value="coding">코딩</SelectItem>
                  <SelectItem value="analysis">분석</SelectItem>
                  <SelectItem value="creative">창작</SelectItem>
                  <SelectItem value="research">연구</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">설명</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="에이전트의 역할과 기능을 설명하세요"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">시스템 프롬프트</label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
                placeholder="에이전트의 행동 방식을 정의하는 프롬프트를 입력하세요"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">사용 가능한 도구</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {state.tools.map((tool) => (
                  <Badge
                    key={tool.id}
                    variant={formData.tools.includes(tool.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tools: prev.tools.includes(tool.id)
                          ? prev.tools.filter((t) => t !== tool.id)
                          : [...prev.tools, tool.id],
                      }))
                    }}
                  >
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleCreateAgent} disabled={state.isCreating || state.loading} className="w-full">
              {state.isCreating || state.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  에이전트 생성
                </>
              )}
            </Button>

            {state.errors && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{state.errors}</div>}
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽: 에이전트 목록 */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>생성된 에이전트 ({state.agents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {state.agents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">생성된 에이전트가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {state.agents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{agent.name}</h3>
                          <Badge variant="outline">{agent.type}</Badge>
                          <Badge
                            variant={
                              agent.status === "running"
                                ? "default"
                                : agent.status === "completed"
                                  ? "secondary"
                                  : agent.status === "failed"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {agent.status === "running" && state.executing[agent.id] ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                실행 중
                              </>
                            ) : (
                              agent.status
                            )}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{agent.description}</p>

                        <div className="text-xs text-gray-500">생성: {new Date(agent.createdAt).toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {agent.status === "running" || state.executing[agent.id] ? (
                          <Button size="sm" variant="outline" onClick={() => handleStopAgent(agent.id)}>
                            <Square className="w-4 h-4 mr-1" />
                            중지
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleExecuteAgent(agent.id)}>
                            <Play className="w-4 h-4 mr-1" />
                            실행
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
