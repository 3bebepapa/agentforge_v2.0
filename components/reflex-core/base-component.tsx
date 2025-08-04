/**
 * Reflex 스타일 베이스 컴포넌트 시스템
 * 모든 컴포넌트가 상속받을 기본 클래스
 */

"use client"

import React, { useEffect, useState, useCallback } from "react"
import { getGlobalStateManager, getGlobalEventSystem, type GlobalAppState } from "@/lib/reflex-core/state-system"
import type { AppEvent } from "@/lib/reflex-core/event-system"

// 베이스 컴포넌트 Props
export interface BaseComponentProps {
  id?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

// 상태 선택자 타입
export type StateSelector<T> = (state: GlobalAppState) => T

// 베이스 컴포넌트 훅
export function useReflexComponent<T>(componentId: string, stateSelector: StateSelector<T>) {
  const stateManager = getGlobalStateManager()
  const eventSystem = getGlobalEventSystem()

  const [selectedState, setSelectedState] = useState<T>(() => stateSelector(stateManager.getState()))

  // 상태 구독
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(componentId, (state) => {
      const newSelectedState = stateSelector(state)
      setSelectedState(newSelectedState)
    })

    return unsubscribe
  }, [componentId, stateSelector, stateManager])

  // 이벤트 발생 함수
  const emit = useCallback(
    <K extends keyof AppEvent>(eventName: K, payload: AppEvent[K]) => {
      eventSystem.emit(eventName, payload, {
        source: "user",
        metadata: { componentId },
      })
    },
    [eventSystem, componentId],
  )

  // 상태 업데이트 함수
  const updateState = useCallback((updates: Partial<GlobalAppState>) => {
    // 직접 상태 업데이트보다는 이벤트를 통한 업데이트 권장
    console.warn("직접 상태 업데이트는 권장되지 않습니다. 이벤트를 사용하세요.")
  }, [])

  return {
    state: selectedState,
    emit,
    updateState,
  }
}

// 베이스 컴포넌트 클래스
export abstract class ReflexComponent<
  P extends BaseComponentProps = BaseComponentProps,
  S = any,
> extends React.Component<P, S> {
  protected componentId: string
  protected stateManager = getGlobalStateManager()
  protected eventSystem = getGlobalEventSystem()
  private unsubscribe?: () => void

  constructor(props: P) {
    super(props)
    this.componentId = props.id || `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  componentDidMount() {
    this.unsubscribe = this.stateManager.subscribe(this.componentId, (state) => {
      this.onStateChange(state)
    })
    this.onComponentMounted()
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    this.onComponentUnmounted()
  }

  // 상태 변경 시 호출되는 메서드 (하위 클래스에서 구현)
  protected abstract onStateChange(state: GlobalAppState): void

  // 컴포넌트 마운트 시 호출 (하위 클래스에서 선택적 구현)
  protected onComponentMounted(): void {}

  // 컴포넌트 언마운트 시 호출 (하위 클래스에서 선택적 구현)
  protected onComponentUnmounted(): void {}

  // 이벤트 발생
  protected emit<K extends keyof AppEvent>(eventName: K, payload: AppEvent[K]): void {
    this.eventSystem.emit(eventName, payload, {
      source: "user",
      metadata: { componentId: this.componentId },
    })
  }

  // 현재 상태 조회
  protected getState(): GlobalAppState {
    return this.stateManager.getState()
  }

  // 상태 선택
  protected select<T>(selector: StateSelector<T>): T {
    return selector(this.getState())
  }
}
