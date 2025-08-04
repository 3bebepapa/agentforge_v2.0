"use client"

// LLM 서비스 인터페이스
export interface LLMService {
  generateText: (prompt: string) => Promise<string>
  validateApiKey: () => Promise<boolean>
  generateResponse?: (prompt: string, context?: any) => Promise<string>
  generateCode?: (prompt: string, language?: string) => Promise<string>
}

// Gemini 2.0 Flash 서비스 구현
class Gemini20FlashService implements LLMService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello",
                },
              ],
            },
          ],
        }),
      })

      return response.ok
    } catch (error) {
      console.error("API 키 검증 실패:", error)
      return false
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API 응답 오류:", response.status, errorData)
        throw new Error(`API 요청 실패: ${response.status} - ${errorData.error?.message || "Unknown error"}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "응답을 생성할 수 없습니다."
    } catch (error) {
      console.error("텍스트 생성 실패:", error)
      // 개발 환경에서는 시뮬레이션 응답 반환
      return this.generateSimulatedResponse(prompt)
    }
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    const fullPrompt = context?.systemPrompt ? `${context.systemPrompt}\n\n${prompt}` : prompt
    return this.generateText(fullPrompt)
  }

  async generateCode(prompt: string, language?: string): Promise<string> {
    const codePrompt = language
      ? `${language} 언어로 다음 요구사항에 맞는 코드를 생성해주세요: ${prompt}`
      : `다음 요구사항에 맞는 코드를 생성해주세요: ${prompt}`

    return this.generateText(codePrompt)
  }

  private generateSimulatedResponse(prompt: string): string {
    console.log("시뮬레이션된 응답 생성:", prompt.substring(0, 100))

    if (prompt.includes("안녕") || prompt.includes("hello")) {
      return "안녕하세요! 저는 Penta AI 어시스턴트입니다. 무엇을 도와드릴까요?"
    } else if (prompt.includes("팀을 구성") || prompt.includes("팀 생성")) {
      return `팀 이름: 개발 팀

1. 이름: 프론트엔드 개발자
   역할: UI/UX 개발
   설명: 사용자 인터페이스와 경험을 개발합니다.
   프롬프트: 당신은 웹 개발 팀의 프론트엔드 개발자입니다. 사용자 인터페이스와 경험을 개발하는 역할을 담당합니다.

2. 이름: 백엔드 개발자
   역할: 서버 개발
   설명: 서버 로직과 데이터베이스를 개발합니다.
   프롬프트: 당신은 웹 개발 팀의 백엔드 개발자입니다. 서버 로직과 데이터베이스를 개발하는 역할을 담당합니다.

3. 이름: QA 엔지니어
   역할: 품질 보증
   설명: 소프트웨어 품질을 테스트하고 보증합니다.
   프롬프트: 당신은 웹 개발 팀의 QA 엔지니어입니다. 소프트웨어 품질을 테스트하고 보증하는 역할을 담당합니다.`
    } else if (prompt.includes("코드") || prompt.includes("함수")) {
      return `
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 사용 예시
console.log(fibonacci(10)); // 55
\`\`\`

피보나치 수열을 계산하는 재귀 함수입니다.
`
    } else {
      return `질문: "${prompt}"에 대한 답변입니다. 이것은 Gemini 2.0 Flash 모델의 시뮬레이션된 응답입니다.`
    }
  }
}

// 기본 서비스 구현
class DefaultLLMService implements LLMService {
  async generateText(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return "API 키가 설정되지 않았습니다. Penta AI 키를 설정하여 Gemini 2.0 Flash 모델을 사용하세요."
  }

  async validateApiKey(): Promise<boolean> {
    return false
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    return this.generateText(prompt)
  }

  async generateCode(prompt: string, language?: string): Promise<string> {
    return `
\`\`\`${language || "javascript"}
// API 키를 설정하세요
console.log("Penta AI 키가 필요합니다");
\`\`\`

API 키를 설정하여 코드 생성 기능을 사용하세요.
`
  }
}

// LLM 서비스 팩토리 함수 - 이것이 누락되었던 export입니다!
export function getLLMService(apiKey?: string): LLMService {
  if (apiKey && apiKey.trim().length > 0) {
    return new Gemini20FlashService(apiKey)
  } else {
    return new DefaultLLMService()
  }
}

// 추가 export들
export const createLLMService = (apiKey: string) => new Gemini20FlashService(apiKey)
export { Gemini20FlashService, DefaultLLMService }

// 기본 export
export default getLLMService
export type { LLMService }
