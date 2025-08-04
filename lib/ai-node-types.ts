// AI 노드 입출력 타입
export interface AINodeIO {
  id: string
  name: string
  label: string
  type: string
  description: string
  required?: boolean
}

// AI 노드 파라미터 타입
export interface AINodeParameter {
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

// AI 노드 정의 타입
export interface AINodeDefinition {
  id: string
  name: string
  description: string
  category: string
  icon: string
  inputs: AINodeIO[]
  outputs: AINodeIO[]
  parameters: AINodeParameter[]
  execute: (inputs: Record<string, any>, parameters: Record<string, any>) => Promise<Record<string, any>>
  code?: string
}
