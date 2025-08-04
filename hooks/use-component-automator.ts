"use client"

import { useState, useCallback } from "react"
import { getLLMService } from "@/services/llmService"

export interface Component {
  id: string
  name: string
  description: string
  code: string
  props: Record<string, any>
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ComponentGenerationRequest {
  description: string
  category?: string
  props?: Record<string, any>
  styling?: "tailwind" | "css" | "styled-components"
}

export function useComponentAutomator(apiKey: string) {
  const [components, setComponents] = useState<Component[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const llmService = getLLMService(apiKey)

  const generateComponent = useCallback(
    async (request: ComponentGenerationRequest): Promise<Component | null> => {
      setIsGenerating(true)
      setError(null)

      try {
        const prompt = `
다음 요구사항에 맞는 React 컴포넌트를 생성해주세요:

설명: ${request.description}
카테고리: ${request.category || "일반"}
스타일링: ${request.styling || "tailwind"}

요구사항:
1. TypeScript 사용
2. 함수형 컴포넌트
3. 적절한 Props 인터페이스 정의
4. ${request.styling === "tailwind" ? "Tailwind CSS" : "일반 CSS"} 사용
5. 접근성 고려
6. 반응형 디자인

컴포넌트 코드만 반환해주세요 (설명 제외):
`

        const generatedCode = await llmService.generateComponent(prompt)

        const newComponent: Component = {
          id: `comp-${Date.now()}`,
          name: extractComponentName(generatedCode) || "Generated Component",
          description: request.description,
          code: generatedCode,
          props: request.props || {},
          category: request.category || "일반",
          tags: extractTags(request.description),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        setComponents((prev) => [...prev, newComponent])
        return newComponent
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "컴포넌트 생성 중 오류가 발생했습니다"
        setError(errorMessage)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    [llmService],
  )

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents((prev) =>
      prev.map((comp) =>
        comp.id === id
          ? {
              ...comp,
              ...updates,
              updatedAt: new Date(),
            }
          : comp,
      ),
    )
  }, [])

  const deleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id))
  }, [])

  const getComponentsByCategory = useCallback(
    (category: string) => {
      return components.filter((comp) => comp.category === category)
    },
    [components],
  )

  const searchComponents = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase()
      return components.filter(
        (comp) =>
          comp.name.toLowerCase().includes(lowercaseQuery) ||
          comp.description.toLowerCase().includes(lowercaseQuery) ||
          comp.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
      )
    },
    [components],
  )

  return {
    components,
    isGenerating,
    error,
    generateComponent,
    updateComponent,
    deleteComponent,
    getComponentsByCategory,
    searchComponents,
  }
}

function extractComponentName(code: string): string | null {
  const functionMatch = code.match(/function\s+(\w+)/)
  const constMatch = code.match(/const\s+(\w+)\s*=/)
  const exportMatch = code.match(/export\s+(?:default\s+)?(?:function\s+)?(\w+)/)

  return functionMatch?.[1] || constMatch?.[1] || exportMatch?.[1] || null
}

function extractTags(description: string): string[] {
  const commonTags = [
    "button",
    "form",
    "input",
    "modal",
    "card",
    "table",
    "list",
    "navigation",
    "header",
    "footer",
    "sidebar",
    "dashboard",
    "chart",
    "graph",
  ]

  const descriptionLower = description.toLowerCase()
  return commonTags.filter((tag) => descriptionLower.includes(tag))
}
