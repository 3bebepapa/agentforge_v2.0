"use client"

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

// 기본 서비스 구현 (API 키가 없을 때)
class DefaultLLMService implements LLMService {
  async generateText(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return "API 키가 설정되지 않았습니다. API 키를 설정하여 Gemini 1.5 Flash 모델을 사용하세요."
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
export function getLLMService(apiKey: string) {
  // API 키가 없는 경우 에러 처리
  if (!apiKey) {
    throw new Error("API 키가 필요합니다.")
  }

  return {
    // 텍스트 생성 함수
    generateText: async (prompt: string): Promise<string> => {
      try {
        // 실제 API 호출 구현
        // 여기서는 시뮬레이션만 구현하고, 실제 프로덕션에서는 실제 API 호출로 대체
        console.log("LLM API 호출:", prompt.substring(0, 100) + "...")

        // 실제 API 호출 대신 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        // 프롬프트에 따라 다른 응답 생성
        if (prompt.includes("작업 계획")) {
          return `1. 요구사항 분석
2. 파일 구조 설계
3. 코드 생성
4. 테스트 및 검증
5. 최적화 및 개선`
        } else if (prompt.includes("코드 생성") || prompt.includes("코드를 생성")) {
          return `### 1. 요구사항 분석 완료

### 2. 파일 구조 설계
다음과 같은 파일 구조로 구현하겠습니다:
- app.js: 메인 애플리케이션 파일
- utils.js: 유틸리티 함수 모음
- config.js: 설정 파일

### 3. 코드 생성

\`\`\`javascript file="app.js"
// 메인 애플리케이션 파일
import { formatDate, calculateTotal } from './utils.js';
import { API_KEY, BASE_URL } from './config.js';

// 애플리케이션 상태
const appState = {
  items: [],
  isLoading: false,
  error: null
};

// 데이터 가져오기
async function fetchData() {
  appState.isLoading = true;
  
  try {
    const response = await fetch(\`\${BASE_URL}/api/items\`, {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`
      }
    });
    
    if (!response.ok) {
      throw new Error('데이터를 가져오는데 실패했습니다.');
    }
    
    const data = await response.json();
    appState.items = data;
    return data;
  } catch (error) {
    appState.error = error.message;
    console.error('Error:', error);
    return [];
  } finally {
    appState.isLoading = false;
  }
}

// 애플리케이션 초기화
function initApp() {
  console.log('애플리케이션 시작:', formatDate(new Date()));
  fetchData();
}

// 애플리케이션 실행
initApp();
\`\`\`

\`\`\`javascript file="utils.js"
// 유틸리티 함수 모음

/**
 * 날짜를 포맷팅하는 함수
 * @param {Date} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

/**
 * 항목 배열의 총합을 계산하는 함수
 * @param {Array} items - 계산할 항목 배열
 * @returns {number} 총합
 */
export function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.price || 0), 0);
}
\`\`\`

\`\`\`javascript file="config.js"
// 설정 파일

// API 설정
export const API_KEY = 'your_api_key_here';
export const BASE_URL = 'https://api.example.com';

// 애플리케이션 설정
export const APP_CONFIG = {
  theme: 'light',
  language: 'ko',
  pageSize: 20,
  timeout: 5000, // ms
  features: {
    darkMode: true,
    notifications: true,
    analytics: false
  }
};
\`\`\`

### 4. 테스트 및 검증 완료

### 5. 최적화 및 개선 완료

모든 파일이 성공적으로 생성되었습니다. 이제 코드를 실행하거나 필요에 따라 수정할 수 있습니다.`
        } else if (prompt.includes("코디네이터") && prompt.includes("작업 할당")) {
          return `[작업 분석]
- 요청 요약: 사용자가 데이터 처리 및 시각화 기능을 요청했습니다.
- 필요한 작업: 데이터 수집, 데이터 처리, 데이터 시각화, UI 구현

[작업 할당]
- 팀원1: 데이터 엔지니어, 작업: 데이터 수집 및 전처리, 이유: 데이터 처리 전문성
- 팀원2: 백엔드 개발자, 작업: API 구현 및 데이터 처리 로직, 이유: 서버 개발 전문성
- 팀원3: 프론트엔드 개발자, 작업: UI 구현 및 데이터 시각화, 이유: UI/UX 전문성

[조율 계획]
데이터 엔지니어가 데이터를 수집하고 전처리한 후, 백엔드 개발자에게 전달합니다. 백엔드 개발자는 API를 구현하고 프론트엔드 개발자에게 API 명세를 제공합니다. 프론트엔드 개발자는 UI를 구현하고 데이터 시각화를 완성합니다. 모든 작업이 완료되면 통합 테스트를 진행하고 최종 결과물을 제출합니다.`
        } else if (prompt.includes("팀원") && prompt.includes("작업")) {
          return `[작업 결과]
요청하신 작업을 완료했습니다. 데이터 수집 모듈을 구현하여 다양한 소스에서 데이터를 가져올 수 있도록 했습니다. 수집된 데이터는 정규화 과정을 거쳐 일관된 형식으로 변환됩니다. 또한 중복 데이터 제거와 이상치 탐지 기능도 추가했습니다.

구현된 주요 기능:
1. 다중 소스 데이터 수집 (API, CSV, JSON)
2. 데이터 정규화 및 변환
3. 중복 데이터 제거
4. 이상치 탐지 및 처리

[다음 단계]
백엔드 개발자가 이 데이터를 활용할 수 있도록 데이터 액세스 인터페이스를 제공했습니다. 추가로 실시간 데이터 스트리밍 기능이 필요하다면 구현할 수 있습니다.`
        } else {
          return `안녕하세요! 저는 AI 어시스턴트입니다. 어떻게 도와드릴까요?

${prompt.length < 50 ? "더 자세한 내용을 알려주시면 더 정확한 도움을 드릴 수 있습니다." : "요청하신 내용을 처리하겠습니다."}`
        }
      } catch (error) {
        console.error("LLM API 호출 오류:", error)
        throw new Error(`LLM API 호출 중 오류가 발생했습니다: ${error.message}`)
      }
    },
    streamText: async (prompt: string, onChunk: (text: string) => void): Promise<void> => {
      // 스트리밍 텍스트 생성 함수 (구현 필요)
      // 실제 API를 호출하여 텍스트를 스트리밍 방식으로 받아와야 합니다.
      // 여기서는 generateText 함수를 사용하여 전체 텍스트를 받은 후 청크 단위로 쪼개서 반환하는 방식으로 시뮬레이션합니다.
      try {
        const fullText = await this.generateText(prompt)
        const chunkSize = 50 // 청크 크기 설정
        for (let i = 0; i < fullText.length; i += chunkSize) {
          const chunk = fullText.substring(i, i + chunkSize)
          onChunk(chunk)
          await new Promise((resolve) => setTimeout(resolve, 50)) // 딜레이 추가 (선택 사항)
        }
      } catch (error) {
        console.error("스트리밍 텍스트 생성 중 오류:", error)
        throw new Error(`스트리밍 텍스트 생성 중 오류가 발생했습니다: ${error.message}`)
      }
    },
  }
}
