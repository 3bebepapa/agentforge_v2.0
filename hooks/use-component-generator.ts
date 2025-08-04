"use client"

import { useState, useCallback } from "react"
import { JsonErrorFixer } from "../lib/json-error-fixer"

interface ComponentSpec {
  name: string
  type: string
  description: string
  features: string[]
  [key: string]: any
}

/**
 * Gemini API를 사용하여 컴포넌트를 생성하는 훅
 */
export function useComponentGenerator(apiKey: string) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 컴포넌트 생성 함수
   */
  const generateComponent = useCallback(
    async (specification: ComponentSpec): Promise<string> => {
      setIsGenerating(true)
      setError(null)

      try {
        // 1. 명세를 안전한 JSON으로 변환
        const safeSpec = JSON.stringify(specification, null, 2)

        // 2. 명확한 지시사항이 포함된 프롬프트 작성
        const prompt = `
다음 명세에 맞는 React 컴포넌트를 생성해주세요:
${safeSpec}

응답은 반드시 다음 JSON 형식을 따라야 합니다:
{
  "componentCode": "// 전체 컴포넌트 코드",
  "imports": ["필요한 import 문 목록"],
  "props": [{"name": "propName", "type": "propType"}]
}

중요 지침:
1. 모든 문자열은 큰따옴표로 감싸세요
2. 마지막 항목 뒤에 쉼표를 넣지 마세요
3. componentCode 값에는 전체 컴포넌트 코드를 포함하세요
4. 코드 내 줄바꿈은 \\n으로 이스케이프하세요
`

        // 3. Gemini API 호출
        const response = await callGeminiApi(apiKey, prompt)

        // 4. 응답에서 JSON 추출 및 오류 수정
        const componentData = JsonErrorFixer.extractAndFixJson(response)

        // 5. 컴포넌트 코드 반환
        if (componentData && componentData.componentCode) {
          return componentData.componentCode
        } else {
          throw new Error("생성된 컴포넌트 코드가 없습니다")
        }
      } catch (error) {
        console.error("컴포넌트 생성 오류:", error)
        setError(error.message)

        // 6. 오류 발생 시 재시도 (단순화된 프롬프트 사용)
        return retryComponentGeneration(apiKey, specification)
      } finally {
        setIsGenerating(false)
      }
    },
    [apiKey],
  )

  return { generateComponent, isGenerating, error }
}

/**
 * 컴포넌트 생성 재시도 (단순화된 방식)
 */
async function retryComponentGeneration(apiKey: string, specification: any): Promise<string> {
  console.log("단순화된 방식으로 컴포넌트 생성 재시도 중...")

  // 단순화된 프롬프트
  const simplePrompt = `
다음 명세에 맞는 React 컴포넌트 코드만 생성해주세요. 설명이나 JSON 형식 없이 코드만 반환하세요:
${JSON.stringify(specification, null, 2)}

// 여기서부터 컴포넌트 코드만 작성하세요
`

  try {
    const response = await callGeminiApi(apiKey, simplePrompt)

    // 코드 블록 추출 (```로 감싸진 부분)
    const codeMatch = response.match(/```(?:jsx|tsx)?\s*([\s\S]*?)```/)
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].trim()
    }

    // 코드 블록이 없으면 전체 응답 반환
    return response
  } catch (error) {
    console.error("컴포넌트 재생성 실패:", error)

    // 최후의 수단: 기본 컴포넌트 반환
    return generateFallbackComponent(specification)
  }
}

/**
 * 기본 폴백 컴포넌트 생성
 */
function generateFallbackComponent(specification: any): string {
  const componentName = specification.name || "GeneratedComponent"

  return `
import React from 'react';

interface ${componentName}Props {
  // 기본 props
  className?: string;
}

export default function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    <div className={className}>
      <h2>${componentName}</h2>
      <p>이 컴포넌트는 생성 오류 후 자동으로 생성된 기본 버전입니다.</p>
      <p>원래 의도한 기능: ${specification.description || "명세 없음"}</p>
    </div>
  );
}`
}

/**
 * Gemini API 호출 함수
 */
async function callGeminiApi(apiKey: string, prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API 오류: ${errorData.error?.message || "알 수 없는 오류"}`)
    }

    const data = await response.json()

    // 응답에서 텍스트 추출
    let responseText = ""
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const textParts = data.candidates[0].content.parts.filter((part: any) => part.text).map((part: any) => part.text)

      responseText = textParts.join("\n")
    }

    return responseText
  } catch (error) {
    console.error("Gemini API 호출 오류:", error)
    throw new Error(`Gemini API 호출 실패: ${error.message}`)
  }
}
