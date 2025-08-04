export interface AgentGenerationRequest {
  name: string
  purpose: string
  type: string
  description: string
  requirements: string[]
  targetDomain: string
  complexity: "simple" | "medium" | "complex"
}

export interface Generate\
