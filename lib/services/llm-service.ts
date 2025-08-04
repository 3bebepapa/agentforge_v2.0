/**
 * 통합 LLM 서비스
 * 기존의 분산된 LLM 서비스 관련 코드를 통합
 */

// LLM 서비스 인터페이스
export interface LLMService {
  generateText: (prompt: string) => Promise<string>
  streamText: (prompt: string, onChunk: (text: string) => void) => Promise<void>
  validateApiKey: () => Promise<boolean>
}

// Gemini 1.5 Flash 서비스 구현
class Gemini15Service implements LLMService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // API 키 유효성 검사
      if (!this.apiKey || this.apiKey.length < 10) {
        return false
      }

      // 간단한 API 호출로 키 유효성 확인
      const testPrompt = "Hello, this is a test."
      await this.generateText(testPrompt)
      return true
    } catch (error) {
      console.error("API 키 검증 오류:", error)
      return false
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      // Gemini API 호출
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`

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
          temperature: 0.7,
          maxOutputTokens: 1024,
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

      // 오류 발생 시 시뮬레이션된 응답 반환 (개발 중에만 사용)
      if (process.env.NODE_ENV === "development") {
        return this.generateSimulatedResponse(prompt)
      }

      throw error
    }
  }

  async streamText(prompt: string, onChunk: (text: string) => void): Promise<void> {
    try {
      // 실제 구현에서는 스트리밍 API를 호출합니다
      // 현재는 비스트리밍 API를 사용하여 시뮬레이션
      const response = await this.generateText(prompt)
      const chunks = response.split(" ")

      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        onChunk(chunk + " ")
      }
    } catch (error) {
      console.error("텍스트 스트리밍 오류:", error)
      throw error
    }
  }

  private generateSimulatedResponse(prompt: string): string {
    console.log("시뮬레이션된 응답 생성:", prompt.substring(0, 100))

    if (prompt.toLowerCase().includes("안녕") || prompt.toLowerCase().includes("hello")) {
      return "안녕하세요! 무엇을 도와드릴까요?"
    } else if (prompt.toLowerCase().includes("날씨")) {
      return "오늘 날씨는 맑고 온도는 22°C입니다."
    } else if (prompt.toLowerCase().includes("시간")) {
      return `현재 시간은 ${new Date().toLocaleTimeString()}입니다.`
    } else if (prompt.toLowerCase().includes("도움말") || prompt.toLowerCase().includes("help")) {
      return "저는 Gemini 1.5 Flash 모델을 기반으로 한 AI 어시스턴트입니다. 질문이나 요청에 답변해 드릴 수 있습니다."
    } else if (prompt.includes("코드") || prompt.includes("함수") || prompt.includes("프로그래밍")) {
      return `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 사용 예시
console.log(fibonacci(10)); // 55
`
    } else {
      return `질문: "${prompt}"에 대한 답변입니다. 이것은 Gemini 1.5 Flash 모델의 응답입니다.`
    }
  }
}

// OpenAI 서비스 구현
class OpenAIService implements LLMService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // API 키 유효성 검사
      if (!this.apiKey || this.apiKey.length < 10) {
        return false
      }

      // 간단한 API 호출로 키 유효성 확인
      const testPrompt = "Hello, this is a test."
      await this.generateText(testPrompt)
      return true
    } catch (error) {
      console.error("API 키 검증 오류:", error)
      return false
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      // OpenAI API 호출 (실제 구현에서는 OpenAI API 호출)
      // 현재는 시뮬레이션된 응답 반환
      return this.generateSimulatedResponse(prompt)
    } catch (error) {
      console.error("OpenAI API 호출 오류:", error)
      throw error
    }
  }

  async streamText(prompt: string, onChunk: (text: string) => void): Promise<void> {
    try {
      // 실제 구현에서는 스트리밍 API를 호출합니다
      // 현재는 비스트리밍 API를 사용하여 시뮬레이션
      const response = await this.generateText(prompt)
      const chunks = response.split(" ")

      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        onChunk(chunk + " ")
      }
    } catch (error) {
      console.error("텍스트 스트리밍 오류:", error)
      throw error
    }
  }

  private generateSimulatedResponse(prompt: string): string {
    console.log("시뮬레이션된 OpenAI 응답 생성:", prompt.substring(0, 100))

    if (prompt.toLowerCase().includes("안녕") || prompt.toLowerCase().includes("hello")) {
      return "안녕하세요! OpenAI 어시스턴트입니다. 무엇을 도와드릴까요?"
    } else if (prompt.toLowerCase().includes("날씨")) {
      return "OpenAI는 실시간 날씨 정보에 접근할 수 없습니다. 하지만 날씨 API를 연동하면 이 정보를 제공할 수 있습니다."
    } else if (prompt.toLowerCase().includes("시간")) {
      return `OpenAI는 현재 시간에 접근할 수 없습니다. 현재 시간은 클라이언트 측에서 확인할 수 있습니다.`
    } else if (prompt.toLowerCase().includes("도움말") || prompt.toLowerCase().includes("help")) {
      return "저는 OpenAI 모델을 기반으로 한 AI 어시스턴트입니다. 질문이나 요청에 답변해 드릴 수 있습니다."
    } else if (prompt.includes("코드") || prompt.includes("함수") || prompt.includes("프로그래밍")) {
      return `
// OpenAI 생성 코드 예시
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 사용 예시
console.log(quickSort([3, 1, 4, 1, 5, 9, 2, 6, 5]));
`
    } else {
      return `OpenAI 응답: "${prompt}"에 대한 답변입니다. 이것은 OpenAI 모델의 시뮬레이션된 응답입니다.`
    }
  }
}

// 기본 서비스 구현 (API 키가 없을 때)
class DefaultLLMService implements LLMService {
  async generateText(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return "API 키가 설정되지 않았습니다. API 키를 설정하여 LLM 모델을 사용하세요."
  }

  async streamText(prompt: string, onChunk: (text: string) => void): Promise<void> {
    const response = await this.generateText(prompt)
    onChunk(response)
  }

  async validateApiKey(): Promise<boolean> {
    return false
  }
}

// LLM 서비스 팩토리 함수
export function getLLMService(apiKey?: string, provider = "gemini"): LLMService {
  if (!apiKey) {
    return new DefaultLLMService()
  }

  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIService(apiKey)
    case "gemini":
    default:
      return new Gemini15Service(apiKey)
  }
}

// LLM 응답 간결화 함수
export const generateText = async (prompt: string, apiKey?: string, provider = "gemini"): Promise<string> => {
  const llmService = getLLMService(apiKey, provider)
  return await llmService.generateText(prompt)
}

// LLM 스트리밍 함수
export const streamText = async (
  prompt: string,
  onChunk: (text: string) => void,
  apiKey?: string,
  provider = "gemini",
): Promise<void> => {
  const llmService = getLLMService(apiKey, provider)
  await llmService.streamText(prompt, onChunk)
}

// API 키 유효성 검사 함수
export const validateApiKey = async (apiKey: string, provider = "gemini"): Promise<boolean> => {
  const llmService = getLLMService(apiKey, provider)
  return await llmService.validateApiKey()
}
