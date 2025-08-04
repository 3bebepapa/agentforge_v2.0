import { JsonSafeParser } from "@/lib/json-safe-parser"
import { AiResponseCleaner } from "@/lib/ai-response-cleaner"

// 기존 코드...

/**
 * AI 응답을 처리하고 JSON으로 변환합니다.
 * @param response AI 응답 텍스트
 * @returns 파싱된 JSON 객체
 */
export async function processAiResponse(response: string): Promise<any> {
  try {
    // 1. AI 응답에서 설명 텍스트 제거
    const cleanedResponse = AiResponseCleaner.cleanJsonResponse(response)

    // 2. JSON 안전 파싱
    const parsedData = JsonSafeParser.parse(cleanedResponse)

    if (!parsedData) {
      console.error("JSON 파싱 실패: 유효한 JSON을 찾을 수 없습니다")
      throw new Error("JSON 파싱 실패: 유효한 JSON을 찾을 수 없습니다")
    }

    return parsedData
  } catch (error) {
    console.error("AI 응답 처리 중 오류:", error)
    throw error
  }
}

/**
 * AI 응답에서 코드 블록을 추출합니다.
 * @param response AI 응답 텍스트
 * @param language 코드 언어 (선택적)
 * @returns 추출된 코드 문자열
 */
export function extractCodeFromAiResponse(response: string, language?: string): string {
  return AiResponseCleaner.extractCodeBlock(response, language)
}

// 기존 코드...
