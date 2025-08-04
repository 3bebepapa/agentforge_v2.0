/**
 * 안정적인 JSON 파싱 및 직렬화를 위한 서비스
 * 순환 참조 처리, 오류 복구, 대용량 데이터 처리 기능 제공
 */
export class JsonParserService {
  private static instance: JsonParserService

  private constructor() {}

  public static getInstance(): JsonParserService {
    if (!JsonParserService.instance) {
      JsonParserService.instance = new JsonParserService()
    }
    return JsonParserService.instance
  }

  /**
   * 안전하게 JSON 문자열을 파싱하는 메서드
   * 오류 발생 시 복구 시도
   */
  public safelyParseJson(jsonString: string): any {
    if (!jsonString) return null

    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.error("JSON 파싱 오류:", error)

      // 오류 복구 시도
      try {
        // 따옴표 오류 수정 시도
        const fixedJson = this.fixQuotes(jsonString)
        return JSON.parse(fixedJson)
      } catch (secondError) {
        // 마지막 시도: 정규식으로 정리
        try {
          const cleanedJson = this.cleanJsonString(jsonString)
          return JSON.parse(cleanedJson)
        } catch (finalError) {
          console.error("JSON 복구 실패:", finalError)
          // 부분 파싱 시도
          return this.attemptPartialParsing(jsonString)
        }
      }
    }
  }

  /**
   * 안전하게 객체를 JSON 문자열로 변환하는 메서드
   * 순환 참조 처리 및 오류 복구
   */
  public safelyStringifyJson(obj: any, space = 2): string {
    if (obj === undefined || obj === null) return ""

    try {
      // 순환 참조 제거
      const safeObj = this.removeCyclicReferences(obj)
      return JSON.stringify(safeObj, null, space)
    } catch (error) {
      console.error("JSON 직렬화 오류:", error)

      // 오류 복구 시도
      try {
        // 함수 및 특수 객체 제거
        const simplifiedObj = this.simplifyObject(obj)
        return JSON.stringify(simplifiedObj, null, space)
      } catch (secondError) {
        console.error("JSON 직렬화 복구 실패:", secondError)

        // 마지막 시도: 객체를 문자열로 변환
        try {
          return JSON.stringify({
            error: "직렬화 실패",
            message: "객체를 JSON으로 변환할 수 없습니다.",
            objectType: typeof obj,
            isArray: Array.isArray(obj),
            keys: obj ? Object.keys(obj) : [],
          })
        } catch (finalError) {
          return '{"error": "직렬화 실패", "message": "객체를 JSON으로 변환할 수 없습니다."}'
        }
      }
    }
  }

  /**
   * 순환 참조를 제거하는 메서드
   */
  private removeCyclicReferences(obj: any, seen = new WeakMap()): any {
    // 기본 타입이거나 null인 경우 그대로 반환
    if (obj === null || typeof obj !== "object") return obj

    // 이미 처리한 객체인 경우 참조 정보만 반환
    if (seen.has(obj)) {
      return { $ref: "cyclic reference" }
    }

    // 현재 객체 기록
    seen.set(obj, true)

    // 배열인 경우
    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeCyclicReferences(item, seen))
    }

    // 객체인 경우
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      // 함수는 제외
      if (typeof value !== "function") {
        result[key] = this.removeCyclicReferences(value, seen)
      }
    }

    return result
  }

  /**
   * 객체를 단순화하는 메서드
   * 함수, DOM 요소, 특수 객체 등 제거
   */
  private simplifyObject(obj: any): any {
    if (obj === null || obj === undefined) return null

    // 기본 타입은 그대로 반환
    if (typeof obj !== "object") return obj

    // 배열인 경우
    if (Array.isArray(obj)) {
      return obj.map((item) => this.simplifyObject(item))
    }

    // 객체인 경우
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      // 함수, 특수 객체 제외
      if (typeof value !== "function" && typeof value !== "symbol") {
        if (value === null || value === undefined) {
          result[key] = null
        } else if (typeof value === "object") {
          // Date 객체 처리
          if (value instanceof Date) {
            result[key] = value.toISOString()
          } else {
            result[key] = this.simplifyObject(value)
          }
        } else {
          result[key] = value
        }
      }
    }

    return result
  }

  /**
   * 따옴표 오류 수정 시도
   */
  private fixQuotes(jsonString: string): string {
    // 따옴표 오류 수정
    return jsonString
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // 키 따옴표 수정
      .replace(/'/g, '"') // 작은 따옴표를 큰 따옴표로 변환
  }

  /**
   * JSON 문자열 정리
   */
  private cleanJsonString(jsonString: string): string {
    // 주석 제거
    let cleaned = jsonString.replace(/\/\/.*$/gm, "")
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "")

    // 제어 문자 제거
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, "")

    // 후행 쉼표 제거
    cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

    return cleaned
  }

  /**
   * 부분 파싱 시도
   * 최소한의 데이터라도 복구하기 위한 마지막 시도
   */
  private attemptPartialParsing(jsonString: string): any {
    try {
      // 객체 형태 확인
      if (jsonString.trim().startsWith("{")) {
        // 가장 바깥쪽 객체만 추출 시도
        const result: Record<string, any> = {}

        // 키-값 쌍 추출 시도
        const keyValueRegex = /"([^"]+)"\s*:\s*("[^"]*"|[0-9]+|true|false|null|\{[^}]*\}|\[[^\]]*\])/g
        let match

        while ((match = keyValueRegex.exec(jsonString)) !== null) {
          try {
            const key = match[1]
            const value = match[2]

            // 값 파싱 시도
            try {
              result[key] = JSON.parse(value)
            } catch {
              result[key] = value
            }
          } catch (e) {
            // 개별 항목 파싱 실패 무시
          }
        }

        return result
      } else if (jsonString.trim().startsWith("[")) {
        // 배열 형태인 경우
        return []
      }

      // 파싱 실패 시 빈 객체 반환
      return {}
    } catch (error) {
      console.error("부분 파싱 실패:", error)
      return {}
    }
  }
}
