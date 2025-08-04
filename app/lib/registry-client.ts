"use client"

import { useState, useEffect } from "react"

// 워크플로우 타입 정의
export interface Workflow {
  id: string
  name: string
  description: string
  nodes: any[]
  edges: any[]
  createdAt: string
  updatedAt: string
}

// 프롬프트 템플릿 타입 정의
export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  parameters: any[]
  createdAt: string
  updatedAt: string
}

// 통합 설정 타입 정의
export interface Integration {
  id: string
  name: string
  type: string
  config: any
  createdAt: string
  updatedAt: string
}

// 워크플로우 훅
export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const response = await fetch("/api/workflows")
        if (!response.ok) throw new Error("워크플로우 가져오기 실패")
        const data = await response.json()
        setWorkflows(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  return { workflows, loading, error }
}

// 프롬프트 템플릿 훅
export function usePrompts() {
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([
    // 샘플 데이터
    {
      id: "1",
      name: "데이터 분석",
      description: "데이터 분석 작업을 위한 템플릿",
      content: "다음 데이터를 분석하고 인사이트를 제공해주세요: {{data}}",
      parameters: [{ name: "data", type: "string" }],
      createdAt: "2023-06-01T00:00:00Z",
      updatedAt: "2023-06-01T00:00:00Z",
    },
    {
      id: "2",
      name: "코드 생성",
      description: "요구사항에 맞는 코드 생성을 위한 템플릿",
      content: "다음 요구사항에 맞는 {{language}} 코드를 생성해주세요: {{requirements}}",
      parameters: [
        { name: "language", type: "string" },
        { name: "requirements", type: "string" },
      ],
      createdAt: "2023-06-02T00:00:00Z",
      updatedAt: "2023-06-02T00:00:00Z",
    },
    {
      id: "3",
      name: "문서 요약",
      description: "긴 문서를 요약하기 위한 템플릿",
      content: "다음 문서를 {{length}} 단어로 요약해주세요: {{document}}",
      parameters: [
        { name: "length", type: "number" },
        { name: "document", type: "string" },
      ],
      createdAt: "2023-06-03T00:00:00Z",
      updatedAt: "2023-06-03T00:00:00Z",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 실제 API 연동 시 주석 해제
  /*
  useEffect(() => {
    async function fetchPromptTemplates() {
      try {
        setLoading(true);
        const response = await fetch('/api/prompts');
        if (!response.ok) throw new Error('프롬프트 템플릿 가져오기 실패');
        const data = await response.json();
        setPromptTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    fetchPromptTemplates();
  }, []);
  */

  return { promptTemplates, loading, error }
}

// 통합 설정 훅
export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchIntegrations() {
      try {
        const response = await fetch("/api/integrations")
        if (!response.ok) throw new Error("통합 설정 가져오기 실패")
        const data = await response.json()
        setIntegrations(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [])

  return { integrations, loading, error }
}
