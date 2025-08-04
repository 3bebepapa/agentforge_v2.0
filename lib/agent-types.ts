import type { Node, Edge } from "reactflow"

// 에이전트 노드 타입
export type AgentNode = Node<any>

// 에이전트 엣지 타입
export type AgentEdge = Edge<any>

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
export interface AgentExecutionLog {
  timestamp: string
  nodeId: string
  status: "start" | "success" | "error"
  message: string
}

// 에이전트 실행 컨텍스트 타입
export interface AgentExecutionContext {
  apiKey: string
  variables: Record<string, any>
  logs: AgentExecutionLog[]
  results: Record<string, AgentExecutionResult>
}

// 에이전트 노드 파라미터 타입
export interface AgentNodeParameter {
  name: string
  type: "string" | "number" | "boolean" | "select" | "multiselect" | "code" | "json" | "secret"
  label: string
  description: string
  default?: any
  options?: string[]
  required?: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  advanced?: boolean
  dependsOn?: string
  condition?: {
    field: string
    value: string | string[]
  }
}

// 에이전트 노드 입출력 타입
export interface AgentNodeIO {
  id: string
  name: string
  label: string
  type: string
  description: string
  required?: boolean
}

// 에이전트 노드 정의 타입
export interface AgentNodeDefinition {
  id: string
  name: string
  description: string
  category: string
  icon: string
  inputs: AgentNodeIO[]
  outputs: AgentNodeIO[]
  parameters: AgentNodeParameter[]
  execute: (inputs: Record<string, any>, parameters: Record<string, any>) => Promise<Record<string, any>>
  code?: string
}
