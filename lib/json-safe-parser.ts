/**
 * JSON 안전 파서
 * 순환 참조 등의 문제를 해결하여 안전하게 JSON 파싱/직렬화
 */
export class JsonSafeParser {
  /**
   * 객체를 JSON 문자열로 안전하게 변환
   * @param obj 변환할 객체
   * @param replacer 대체 함수
   * @param space 들여쓰기 공백 수
   * @returns JSON 문자열
   */
  static stringify(obj: any, replacer?: (key: string, value: any) => any, space?: number): string {
    try {
      // 순환 참조 처리를 위한 객체 세트
      const seen = new WeakSet()

      // 기본 replacer 함수
      const defaultReplacer = (key: string, value: any) => {
        // 함수는 문자열로 변환
        if (typeof value === "function") {
          return value.toString()
        }

        // undefined는 null로 변환
        if (value === undefined) {
          return null
        }

        // 객체이고 null이 아닌 경우 순환 참조 확인
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular Reference]"
          }
          seen.add(value)
        }

        // 사용자 정의 replacer 적용
        if (replacer) {
          return replacer(key, value)
        }

        return value
      }

      return JSON.stringify(obj, defaultReplacer, space)
    } catch (error) {
      console.error("JSON 직렬화 오류:", error)

      // 오류 발생 시 기본 객체 반환
      return JSON.stringify({
        error: "직렬화 오류 발생",
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * JSON 문자열을 객체로 안전하게 변환
   * @param text JSON 문자열
   * @param reviver 부활 함수
   * @returns 변환된 객체
   */
  static parse(text: string, reviver?: (key: string, value: any) => any): any {
    try {
      return JSON.parse(text, reviver)
    } catch (error) {
      console.error("JSON 파싱 오류:", error)

      // 오류 발생 시 기본 객체 반환
      return {
        error: "파싱 오류 발생",
        message: error instanceof Error ? error.message : String(error),
        originalText: text.length > 100 ? text.substring(0, 100) + "..." : text,
      }
    }
  }
}
