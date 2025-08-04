"use client"

interface LLMService {
  validateApiKey(): Promise<boolean>
  generateText(prompt: string): Promise<string>
  generateCode(description: string, language?: string): Promise<string>
  generateComponent(description: string): Promise<string>
}

class GeminiService implements LLMService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch("/api/validate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: this.apiKey }),
      })

      const data = await response.json()
      return data.valid
    } catch (error) {
      console.error("API 키 검증 오류:", error)
      return false
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`,
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
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "응답을 생성할 수 없습니다."
    } catch (error) {
      console.error("텍스트 생성 오류:", error)
      return "텍스트 생성 중 오류가 발생했습니다."
    }
  }

  async generateCode(description: string, language = "javascript"): Promise<string> {
    const prompt = `다음 설명에 맞는 ${language} 코드를 생성해주세요:

설명: ${description}

요구사항:
- 깔끔하고 읽기 쉬운 코드 작성
- 적절한 주석 포함
- 모범 사례 준수
- 코드만 반환 (설명 제외)

코드:`

    return this.generateText(prompt)
  }

  async generateComponent(description: string): Promise<string> {
    const prompt = `다음 설명에 맞는 React 컴포넌트를 생성해주세요:

설명: ${description}

요구사항:
- TypeScript 사용
- 함수형 컴포넌트 사용
- Tailwind CSS 스타일링
- 적절한 props 타입 정의
- 컴포넌트 코드만 반환 (설명 제외)

컴포넌트 코드:`

    return this.generateText(prompt)
  }
}

export function getLLMService(apiKey: string): LLMService {
  return new GeminiService(apiKey)
}

export { GeminiService }
export type { LLMService }
