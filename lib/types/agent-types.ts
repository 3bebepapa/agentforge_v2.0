/**
 * 에이전트 관련 타입 정의
 * 기존의 분산된 에이전트 타입 정의들을 통합
 */

import type { NodeInstance, Edge, WorkflowExecutionLog } from "./core-types"

// 에이전트 타입 정의
export interface Agent {
  id: string
  name: string
  type: "general" | "specialized" | "assistant" | "autonomous" | "team"
  description: string
  code: string
  prompt?: string
  status: "idle" | "running" | "error"
  createdAt: string
  updatedAt: string
  teamId?: string // 팀 ID 필드
}

// 에이전트 노드 타입
export type AgentNode = NodeInstance

// 에이전트 엣지 타입
export type AgentEdge = Edge

// 에이전트 템플릿 타입
export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: AgentNode[]
  edges: AgentEdge[]
}

// 에이전트 실행 결과 타입
export interface AgentExecutionResult {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
}

// 에이전트 실행 상태 타입
export type AgentExecutionStatus = "idle" | "running" | "completed" | "failed"

// 에이전트 실행 로그 타입
export type AgentExecutionLog = WorkflowExecutionLog

// 에이전트 실행 컨텍스트 타입
export interface AgentExecutionContext {
  apiKey: string
  variables: Record<string, any>
  logs: AgentExecutionLog[]
  results: Record<string, AgentExecutionResult>
}

// 콘솔 메시지 타입 정의
export interface ConsoleMessage {
  id: string
  content: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  agentId?: string // 메시지를 보낸 에이전트 ID
}
