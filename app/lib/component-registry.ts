"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageSquare, Database, Code, FileText, ArrowRightLeft, Globe, Zap, Cpu, Workflow } from "lucide-react"

// 컴포넌트 아이템 타입 정의
interface ComponentItem {
  id: string
  name: string
  description: string
  category: string
  type: string
  icon: React.ReactNode
  source: "built-in" | "integration-hub" | "custom"
  tags: string[]
  isFavorite: boolean
  lastUsed?: string
  contexts: string[] // 사용 가능한 컨텍스트 (integrated-interface, agent, process-studio, flow-builder)
  metadata: Record<string, any> // 추가 메타데이터
}

// 컴포넌트 레지스트리 훅
export function useComponentRegistry() {
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 실제 구현에서는 API 호출로 대체
    const fetchComponents = async () => {
      try {
        setIsLoading(true)

        // 샘플 데이터 (실제 구현에서는 API 호출)
        const sampleComponents: ComponentItem[] = [
          // AI 모델 컴포넌트
          {
            id: "gpt-4",
            name: "GPT-4",
            description: "OpenAI의 GPT-4 대규모 언어 모델",
            category: "AI 모델",
            type: "llm",
            icon: <MessageSquare className="h-4 w-4" />,
            source: "integration-hub",
            tags: ["openai", "llm", "text-generation"],
            isFavorite: true,
            lastUsed: "2023-06-15T14:30:00Z",
            contexts: ["integrated-interface", "agent", "process-studio", "flow-builder"],
            metadata: {
              provider: "openai",
              version: "4",
              inputType: "text",
              outputType: "text",
              parameters: {
                temperature: { type: "number", default: 0.7, min: 0, max: 2 },
                maxTokens: { type: "number", default: 1000, min: 1, max: 8000 },
              },
            },
          },
          {
            id: "claude-3",
            name: "Claude 3",
            description: "Anthropic의 Claude 3 대규모 언어 모델",
            category: "AI 모델",
            type: "llm",
            icon: <MessageSquare className="h-4 w-4" />,
            source: "integration-hub",
            tags: ["anthropic", "llm", "text-generation"],
            isFavorite: false,
            lastUsed: "2023-06-14T10:15:00Z",
            contexts: ["integrated-interface", "agent", "process-studio", "flow-builder"],
            metadata: {
              provider: "anthropic",
              version: "3",
              inputType: "text",
              outputType: "text",
              parameters: {
                temperature: { type: "number", default: 0.7, min: 0, max: 1 },
                maxTokens: { type: "number", default: 1000, min: 1, max: 100000 },
              },
            },
          },

          // 데이터베이스 컴포넌트
          {
            id: "postgres",
            name: "PostgreSQL",
            description: "강력한 오픈소스 관계형 데이터베이스",
            category: "데이터베이스",
            type: "database",
            icon: <Database className="h-4 w-4" />,
            source: "integration-hub",
            tags: ["database", "sql", "relational"],
            isFavorite: true,
            lastUsed: "2023-06-13T09:45:00Z",
            contexts: ["process-studio", "flow-builder"],
            metadata: {
              type: "relational",
              operations: ["query", "insert", "update", "delete"],
              parameters: {
                connection: { type: "string", format: "connection-string" },
                query: { type: "string", format: "sql" },
              },
            },
          },
          {
            id: "mongodb",
            name: "MongoDB",
            description: "유연한 문서 기반 NoSQL 데이터베이스",
            category: "데이터베이스",
            type: "database",
            icon: <Database className="h-4 w-4" />,
            source: "integration-hub",
            tags: ["database", "nosql", "document"],
            isFavorite: false,
            contexts: ["process-studio", "flow-builder"],
            metadata: {
              type: "document",
              operations: ["find", "insert", "update", "delete"],
              parameters: {
                connection: { type: "string", format: "connection-string" },
                query: { type: "object", format: "json" },
              },
            },
          },

          // 코드 실행 컴포넌트
          {
            id: "python-executor",
            name: "Python 실행기",
            description: "Python 코드 실행",
            category: "코드 실행",
            type: "code",
            icon: <Code className="h-4 w-4" />,
            source: "built-in",
            tags: ["code", "python", "execution"],
            isFavorite: false,
            contexts: ["agent", "process-studio", "flow-builder"],
            metadata: {
              language: "python",
              version: "3.9",
              inputType: "code",
              outputType: "any",
              parameters: {
                code: { type: "string", format: "python" },
                timeout: { type: "number", default: 30, min: 1, max: 300 },
              },
            },
          },
          {
            id: "javascript-executor",
            name: "JavaScript 실행기",
            description: "JavaScript 코드 실행",
            category: "코드 실행",
            type: "code",
            icon: <Code className="h-4 w-4" />,
            source: "built-in",
            tags: ["code", "javascript", "execution"],
            isFavorite: true,
            lastUsed: "2023-06-12T16:20:00Z",
            contexts: ["agent", "process-studio", "flow-builder"],
            metadata: {
              language: "javascript",
              version: "ES2021",
              inputType: "code",
              outputType: "any",
              parameters: {
                code: { type: "string", format: "javascript" },
                timeout: { type: "number", default: 30, min: 1, max: 300 },
              },
            },
          },

          // 파일 처리 컴포넌트
          {
            id: "file-reader",
            name: "파일 읽기",
            description: "로컬 또는 원격 파일 읽기",
            category: "파일 처리",
            type: "file",
            icon: <FileText className="h-4 w-4" />,
            source: "built-in",
            tags: ["file", "io", "read"],
            isFavorite: false,
            contexts: ["integrated-interface", "process-studio", "flow-builder"],
            metadata: {
              operations: ["read"],
              supportedFormats: ["text", "json", "csv", "xml", "binary"],
              parameters: {
                path: { type: "string" },
                format: { type: "string", enum: ["text", "json", "csv", "xml", "binary"] },
              },
            },
          },
          {
            id: "file-writer",
            name: "파일 쓰기",
            description: "로컬 또는 원격 파일 쓰기",
            category: "파일 처리",
            type: "file",
            icon: <FileText className="h-4 w-4" />,
            source: "built-in",
            tags: ["file", "io", "write"],
            isFavorite: false,
            contexts: ["process-studio", "flow-builder"],
            metadata: {
              operations: ["write"],
              supportedFormats: ["text", "json", "csv", "xml", "binary"],
              parameters: {
                path: { type: "string" },
                content: { type: "any" },
                format: { type: "string", enum: ["text", "json", "csv", "xml", "binary"] },
              },
            },
          },

          // 데이터 변환 컴포넌트
          {
            id: "json-transformer",
            name: "JSON 변환기",
            description: "JSON 데이터 구조 변환",
            category: "데이터 변환",
            type: "transform",
            icon: <ArrowRightLeft className="h-4 w-4" />,
            source: "built-in",
            tags: ["transform", "json", "data"],
            isFavorite: false,
            contexts: ["process-studio", "flow-builder"],
            metadata: {
              inputType: "json",
              outputType: "json",
              parameters: {
                template: { type: "string", format: "json" },
                mapping: { type: "object" },
              },
            },
          },

          // HTTP 요청 컴포넌트
          {
            id: "http-request",
            name: "HTTP 요청",
            description: "HTTP API 호출",
            category: "API",
            type: "http",
            icon: <Globe className="h-4 w-4" />,
            source: "built-in",
            tags: ["http", "api", "request"],
            isFavorite: true,
            lastUsed: "2023-06-11T11:30:00Z",
            contexts: ["agent", "process-studio", "flow-builder"],
            metadata: {
              methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
              parameters: {
                url: { type: "string", format: "url" },
                method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
                headers: { type: "object" },
                body: { type: "any" },
              },
            },
          },

          // 워크플로우 컴포넌트
          {
            id: "workflow-executor",
            name: "워크플로우 실행기",
            description: "저장된 워크플로우 실행",
            category: "워크플로우",
            type: "workflow",
            icon: <Workflow className="h-4 w-4" />,
            source: "built-in",
            tags: ["workflow", "execution", "orchestration"],
            isFavorite: false,
            contexts: ["integrated-interface", "agent", "process-studio", "flow-builder"],
            metadata: {
              parameters: {
                workflowId: { type: "string" },
                inputs: { type: "object" },
              },
            },
          },

          // 에이전트 컴포넌트
          {
            id: "agent-executor",
            name: "에이전트 실행기",
            description: "에이전트 실행",
            category: "에이전트",
            type: "agent",
            icon: <Cpu className="h-4 w-4" />,
            source: "built-in",
            tags: ["agent", "execution", "ai"],
            isFavorite: true,
            lastUsed: "2023-06-10T15:45:00Z",
            contexts: ["integrated-interface", "process-studio", "flow-builder"],
            metadata: {
              parameters: {
                agentId: { type: "string" },
                inputs: { type: "object" },
              },
            },
          },

          // 사용자 정의 컴포넌트 예시
          {
            id: "custom-data-processor",
            name: "커스텀 데이터 처리기",
            description: "사용자 정의 데이터 처리 로직",
            category: "사용자 정의",
            type: "custom",
            icon: <Zap className="h-4 w-4" />,
            source: "custom",
            tags: ["custom", "data", "processing"],
            isFavorite: false,
            contexts: ["process-studio", "flow-builder"],
            metadata: {
              author: "사용자1",
              version: "1.0.0",
              parameters: {
                config: { type: "object" },
                data: { type: "any" },
              },
            },
          },
        ]

        setComponents(sampleComponents)
        setError(null)
      } catch (err) {
        console.error("컴포넌트 로딩 오류:", err)
        setError("컴포넌트를 로드하는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchComponents()
  }, [])

  // 컴포넌트 추가 함수
  const addComponent = async (component: Omit<ComponentItem, "id">) => {
    try {
      // 실제 구현에서는 API 호출
      const newId = `custom_${Date.now()}`
      const newComponent: ComponentItem = {
        ...component,
        id: newId,
        source: "custom",
        isFavorite: false,
      }

      setComponents((prev) => [...prev, newComponent])
      return newId
    } catch (err) {
      console.error("컴포넌트 추가 오류:", err)
      throw new Error("컴포넌트를 추가하는 중 오류가 발생했습니다.")
    }
  }

  // 컴포넌트 업데이트 함수
  const updateComponent = async (id: string, updates: Partial<ComponentItem>) => {
    try {
      // 실제 구현에서는 API 호출
      setComponents((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
    } catch (err) {
      console.error("컴포넌트 업데이트 오류:", err)
      throw new Error("컴포넌트를 업데이트하는 중 오류가 발생했습니다.")
    }
  }

  // 컴포넌트 삭제 함수
  const deleteComponent = async (id: string) => {
    try {
      // 실제 구현에서는 API 호출
      setComponents((prev) => prev.filter((comp) => comp.id !== id))
    } catch (err) {
      console.error("컴포넌트 삭제 오류:", err)
      throw new Error("컴포넌트를 삭제하는 중 오류가 발생했습니다.")
    }
  }

  return {
    components,
    isLoading,
    error,
    addComponent,
    updateComponent,
    deleteComponent,
  }
}
