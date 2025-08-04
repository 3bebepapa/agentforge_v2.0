"use client"

import { useEffect, useState } from "react"
import { ReflexStyleStateManager } from "@/lib/reflex-style-state"
import { ReactiveAgentStatus } from "@/components/reflex-components/reactive-component"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/**
 * Reflex 스타일이 적용된 통합 스튜디오
 */
export function ReflexEnhancedStudio() {
  const [stateManager] = useState(
    () =>
      new ReflexStyleStateManager({
        agents: [],
        activeAgent: null,
        workflows: [],
        activeWorkflow: null,
        isExecuting: false,
        executionResults: [],
        sidebarOpen: true,
        activeTab: "agents",
        liveMetrics: {
          activeUsers: 0,
          runningAgents: 0,
          completedTasks: 0,
        },
      }),
  )

  const [state, setState] = useState(stateManager.getState())

  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState)
    return unsubscribe
  }, [stateManager])

  const handleCreateAgent = () => {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: `새 에이전트 ${state.agents.length + 1}`,
      status: "idle" as const,
      type: "general",
      description: "AI 에이전트",
      createdAt: new Date().toISOString(),
    }

    stateManager.setState({
      agents: [...state.agents, newAgent],
      liveMetrics: {
        ...state.liveMetrics,
        runningAgents: state.liveMetrics.runningAgents + 1,
      },
    })
  }

  const handleExecuteWorkflow = () => {
    stateManager.setState({
      isExecuting: true,
      liveMetrics: {
        ...state.liveMetrics,
        completedTasks: state.liveMetrics.completedTasks + 1,
      },
    })

    // 시뮬레이션: 3초 후 실행 완료
    setTimeout(() => {
      stateManager.setState({
        isExecuting: false,
        executionResults: [
          ...state.executionResults,
          {
            id: Date.now(),
            result: "워크플로우 실행 완료",
            timestamp: new Date().toISOString(),
          },
        ],
      })
    }, 3000)
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 왼쪽: 실시간 상태 패널 */}
      <div className="w-80 bg-white border-r p-4">
        <ReactiveAgentStatus stateManager={stateManager} className="mb-4" />

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleCreateAgent} className="w-full">
              새 에이전트 생성
            </Button>

            <Button
              onClick={handleExecuteWorkflow}
              disabled={state.isExecuting}
              variant="outline"
              className="w-full bg-transparent"
            >
              {state.isExecuting ? "실행 중..." : "워크플로우 실행"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 중앙: 메인 작업 영역 */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reflex 스타일 통합 스튜디오</h1>
          <div className="flex items-center space-x-2">
            <Badge variant={state.isExecuting ? "default" : "secondary"}>
              {state.isExecuting ? "실행 중" : "대기 중"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>에이전트 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {state.agents.length === 0 ? (
                <p className="text-gray-500">생성된 에이전트가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {state.agents.map((agent) => (
                    <div key={agent.id} className="p-2 bg-gray-50 rounded flex justify-between">
                      <span>{agent.name}</span>
                      <Badge variant="outline">{agent.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>실행 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {state.executionResults.length === 0 ? (
                <p className="text-gray-500">실행 결과가 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.executionResults.map((result) => (
                    <div key={result.id} className="p-2 bg-green-50 rounded">
                      <div className="font-medium">{result.result}</div>
                      <div className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</div>
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
