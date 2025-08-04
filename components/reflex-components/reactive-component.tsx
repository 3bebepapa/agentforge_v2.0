"use client"

import { useEffect, useState } from "react"
import type { ReflexStyleStateManager } from "@/lib/reflex-style-state"

/**
 * Reflex 스타일 반응형 컴포넌트 베이스
 */
export interface ReactiveComponentProps {
  stateManager: ReflexStyleStateManager
  className?: string
}

export function useReactiveState<T>(
  stateManager: ReflexStyleStateManager,
  selector: (state: any) => T,
): [T, (updates: Partial<any>) => void] {
  const [selectedState, setSelectedState] = useState(() => selector(stateManager.getState()))

  useEffect(() => {
    const unsubscribe = stateManager.subscribe((state) => {
      setSelectedState(selector(state))
    })
    return unsubscribe
  }, [stateManager, selector])

  const updateState = (updates: Partial<any>) => {
    stateManager.setState(updates)
  }

  return [selectedState, updateState]
}

/**
 * 에이전트 상태를 실시간으로 표시하는 컴포넌트
 */
export function ReactiveAgentStatus({ stateManager, className }: ReactiveComponentProps) {
  const [agents, updateState] = useReactiveState(stateManager, (state) => state.agents)

  const [liveMetrics] = useReactiveState(stateManager, (state) => state.liveMetrics)

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">실시간 에이전트 상태</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{liveMetrics.activeUsers}</div>
          <div className="text-sm text-gray-600">활성 사용자</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{liveMetrics.runningAgents}</div>
          <div className="text-sm text-gray-600">실행 중 에이전트</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{liveMetrics.completedTasks}</div>
          <div className="text-sm text-gray-600">완료된 작업</div>
        </div>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="font-medium">{agent.name}</span>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  agent.status === "running"
                    ? "bg-green-500"
                    : agent.status === "idle"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-gray-600">{agent.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
