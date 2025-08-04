import { JsonSafeParser } from "./json-safe-parser"

/**
 * AI를 사용하여 컴포넌트를 생성하는 서비스
 */
export class ComponentGenerator {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 컴포넌트 명세를 기반으로 React 컴포넌트 생성
   * @param specification 컴포넌트 명세
   * @returns 생성된 컴포넌트 코드
   */
  async generateComponent(specification: any): Promise<string> {
    try {
      // 1. 명확한 JSON 형식 지정 프롬프트 작성
      const prompt = this.createComponentPrompt(specification)

      // 2. Gemini API 호출
      const response = await this.callGeminiApi(prompt)

      // 3. 응답에서 JSON 추출
      const jsonStr = JsonSafeParser.extractJsonFromText(response)
      if (!jsonStr) {
        throw new Error("응답에서 JSON을 찾을 수 없습니다")
      }

      // 4. 안전하게 JSON 파싱
      const componentData = JsonSafeParser.parse(jsonStr)

      // 5. 컴포넌트 코드 검증 및 반환
      if (!componentData.componentCode) {
        throw new Error("생성된 컴포넌트 코드가 없습니다")
      }

      return componentData.componentCode
    } catch (error) {
      console.error("컴포넌트 생성 오류:", error)

      // 오류 발생 시 재시도 (단순화된 프롬프트 사용)
      return this.retryComponentGeneration(specification, error)
    }
  }

  /**
   * 컴포넌트 생성 프롬프트 작성
   */
  private createComponentPrompt(specification: any): string {
    return `
다음 명세에 맞는 React 컴포넌트를 생성해주세요:
${JSON.stringify(specification, null, 2)}

중요: 응답은 다음 JSON 형식을 정확히 따라야 합니다.
{
  "componentCode": "// 여기에 전체 컴포넌트 코드를 작성하세요",
  "imports": ["필요한 import 문 목록"],
  "props": [{"name": "propName", "type": "propType", "description": "설명"}],
  "features": ["구현된 기능 목록"]
}

JSON 형식을 정확히 지켜주세요:
1. 모든 문자열은 큰따옴표로 감싸세요
2. 마지막 항목 뒤에 쉼표를 넣지 마세요
3. componentCode 내부의 따옴표는 이스케이프 처리하세요 (예: \\")
4. 줄바꿈은 \\n으로 표시하세요

응답은 반드시 유효한 JSON 형식이어야 합니다.
`
  }

  /**
   * 단순화된 프롬프트로 컴포넌트 생성 재시도
   */
  private async retryComponentGeneration(specification: any, originalError: Error): Promise<string> {
    console.log("단순화된 프롬프트로 컴포넌트 생성 재시도 중...")

    const simplifiedPrompt = `
다음 명세에 맞는 React 컴포넌트 코드만 생성해주세요. JSON 형식이 아닌 코드만 반환하세요:
${JSON.stringify(specification, null, 2)}

이전 오류: ${originalError.message}

TypeScript React (.tsx) 형식의 완전한 컴포넌트 코드만 작성해주세요.
`

    try {
      const response = await this.callGeminiApi(simplifiedPrompt)

      // 코드 블록 추출 (```tsx ... ``` 형식)
      const codeBlockRegex = /```tsx?\s*([\s\S]*?)```/
      const codeMatch = response.match(codeBlockRegex)

      if (codeMatch && codeMatch[1]) {
        return codeMatch[1].trim()
      }

      // 코드 블록이 없으면 전체 응답 반환
      return response
    } catch (retryError) {
      console.error("컴포넌트 생성 재시도 실패:", retryError)

      // 최후의 수단: 기본 컴포넌트 템플릿 반환
      return this.createFallbackComponent(specification)
    }
  }

  /**
   * 기본 폴백 컴포넌트 생성
   */
  private createFallbackComponent(specification: any): string {
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
      <p>이 컴포넌트는 오류 발생 후 자동 생성된 기본 버전입니다.</p>
      <p>원래 의도한 기능: ${specification.description || "명세 없음"}</p>
    </div>
  );
}
`
  }

  /**
   * Gemini API 호출
   */
  private async callGeminiApi(prompt: string): Promise<string> {
    try {
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`

      const requestBody = {
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
          topP: 0.95,
          topK: 40,
        },
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini API 오류: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()

      // 응답에서 텍스트 추출
      let generatedText = ""
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const textParts = data.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)

        generatedText = textParts.join("\n")
      }

      return generatedText
    } catch (error) {
      console.error("Gemini API 호출 오류:", error)
      throw error
    }
  }
}
