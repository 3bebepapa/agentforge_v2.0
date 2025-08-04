import type { Node, Edge } from "reactflow"

// 노드 데이터 타입
export interface NodeData {
  label: string
  description?: string
  type: NodeType
  inputs?: string[]
  outputs?: string[]
  parameters?: Record<string, any>
  isLoading?: boolean
  error?: string
  result?: any
}

// 노드 타입
export type NodeType = "input" | "process" | "output" | "llm" | "tool"

// 커스텀 노드 타입 (ReactFlow Node 확장)
export type CustomNode = Node<NodeData>

// 실행 컨텍스트 타입
export interface ExecutionContext {
  nodes: Record<string, NodeExecutionResult>
  edges: Edge[]
  apiKey?: string
}

// 노드 실행 결과 타입
export interface NodeExecutionResult {
  success: boolean
  data?: any
  error?: string
}

// 노드 실행기 인터페이스
export interface NodeExecutor {
  execute(node: CustomNode, context: ExecutionContext): Promise<NodeExecutionResult>
}

// 워크플로우 타입
export interface Workflow {
  id: string
  name: string
  description: string
  nodes: CustomNode[]
  edges: Edge[]
  createdAt?: string
  updatedAt?: string
}
