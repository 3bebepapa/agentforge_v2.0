/**
 * 안전하게 JSON을 파싱하고 일반적인 오류를 자동 수정하는 함수
 */
export function safeParseJSON(jsonString: string): { data: any | null; error: Error | null } {
  if (!jsonString || typeof jsonString !== "string") {
    return { data: null, error: new Error("유효하지 않은 입력") }
  }

  try {
    // 먼저 원본 그대로 파싱 시도
    const parsed = JSON.parse(jsonString.trim())
    return { data: parsed, error: null }
  } catch (originalError) {
    console.log("원본 JSON 파싱 실패, 자동 수정 시도 중...")

    try {
      // 자동 수정 시도
      const fixed = attemptToFixJSON(jsonString)
      const parsed = JSON.parse(fixed)
      console.log("JSON 자동 수정 성공!")
      return { data: parsed, error: null }
    } catch (fixError) {
      console.error("JSON 자동 수정 실패:", fixError)
      return {
        data: null,
        error: new Error(`JSON 파싱 실패: ${originalError.message}`),
      }
    }
  }
}

/**
 * 텍스트에서 JSON 객체나 배열을 추출하는 함수
 */
export function extractJSON(text: string): { json: string | null; error: Error | null } {
  if (!text || typeof text !== "string") {
    return { json: null, error: new Error("유효하지 않은 텍스트") }
  }

  try {
    // 1. JSON_START/JSON_END 마커로 둘러싸인 JSON 추출
    const markerMatch = text.match(/JSON_START\s*([\s\S]*?)\s*JSON_END/)
    if (markerMatch && markerMatch[1]) {
      const jsonCandidate = markerMatch[1].trim()
      if (isValidJSON(jsonCandidate)) {
        return { json: jsonCandidate, error: null }
      }

      // 유효하지 않은 경우 수정 시도
      try {
        const fixed = attemptToFixJSON(jsonCandidate)
        if (isValidJSON(fixed)) {
          return { json: fixed, error: null }
        }
      } catch (e) {
        // 수정 실패 시 계속 진행
      }
    }

    // 2. 코드 블록에서 JSON 추출 (\`\`\`json ... \`\`\`)
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch && codeBlockMatch[1]) {
      const jsonCandidate = codeBlockMatch[1].trim()
      if (isValidJSON(jsonCandidate)) {
        return { json: jsonCandidate, error: null }
      }
    }

    // 3. 중괄호로 둘러싸인 JSON 객체 찾기
    const objectMatches = text.match(/\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\})*)*\})*)*\}/g)
    if (objectMatches) {
      for (const match of objectMatches) {
        if (isValidJSON(match)) {
          return { json: match, error: null }
        }

        // 유효하지 않은 경우 수정 시도
        try {
          const fixed = attemptToFixJSON(match)
          if (isValidJSON(fixed)) {
            return { json: fixed, error: null }
          }
        } catch (e) {
          continue
        }
      }
    }

    // 4. 대괄호로 둘러싸인 JSON 배열 찾기
    const arrayMatches = text.match(/\[(?:[^[\]]|(?:\[(?:[^[\]]|(?:\[[^[\]]*\])*)*\])*)*\]/g)
    if (arrayMatches) {
      for (const match of arrayMatches) {
        if (isValidJSON(match)) {
          return { json: match, error: null }
        }
      }
    }

    return { json: null, error: new Error("텍스트에서 유효한 JSON을 찾을 수 없습니다") }
  } catch (error) {
    return {
      json: null,
      error: error instanceof Error ? error : new Error("JSON 추출 중 오류 발생"),
    }
  }
}

/**
 * JSON 문자열의 일반적인 오류를 수정하는 함수
 */
function attemptToFixJSON(brokenJson: string): string {
  let json = brokenJson.trim()

  // 1. 앞뒤 불필요한 텍스트 제거
  const jsonStart = json.indexOf("{")
  const jsonEnd = json.lastIndexOf("}")
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
    json = json.substring(jsonStart, jsonEnd + 1)
  }

  // 2. 이스케이프 문자 처리
  json = json
    .replace(/\\"/g, '"') // 불필요한 이스케이프 제거
    .replace(/\\n/g, "\\n") // 줄바꿈 문자 정규화
    .replace(/\\t/g, "\\t") // 탭 문자 정규화
    .replace(/\\\\/g, "\\") // 백슬래시 정규화

  // 3. 따옴표 없는 속성명에 따옴표 추가
  json = json.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

  // 4. 작은따옴표를 큰따옴표로 변환 (문자열 값에서만)
  json = json.replace(/:\s*'([^']*)'/g, ': "$1"')

  // 5. 후행 쉼표 제거
  json = json.replace(/,(\s*[}\]])/g, "$1")

  // 6. 중복 쉼표 제거
  json = json.replace(/,+/g, ",")

  // 7. 잘못된 문자 제거 (제어 문자 등)
  json = json.replace(/[\x00-\x1F\x7F]/g, "")

  // 8. 문자열 내부의 따옴표 이스케이프 처리
  json = json.replace(/"([^"]*)"(\s*:\s*)"([^"\\]*(\\.[^"\\]*)*)"(?=\s*[,}])/g, (match, key, colon, value) => {
    const escapedValue = value.replace(/"/g, '\\"')
    return `"${key}"${colon}"${escapedValue}"`
  })

  return json
}

/**
 * 문자열이 유효한 JSON인지 확인하는 함수
 */
export function isValidJSON(jsonString: string): boolean {
  if (!jsonString || typeof jsonString !== "string") {
    return false
  }

  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * JSON 파싱 오류를 자동으로 수정하는 유틸리티
 */
export class JsonErrorFixer {
  /**
   * JSON 문자열의 오류를 수정합니다
   */
  static fixJsonErrors(jsonString: string): string {
    try {
      // 먼저 파싱 시도
      JSON.parse(jsonString)
      return jsonString // 오류가 없으면 원본 반환
    } catch (error) {
      console.log("JSON 오류 감지, 수정 시도 중...", error.message)

      let fixedJson = jsonString

      // 1. 따옴표 오류 수정 (작은따옴표 -> 큰따옴표, 따옴표 없는 속성명에 따옴표 추가)
      fixedJson = this.fixQuotationIssues(fixedJson)

      // 2. 후행 쉼표 제거
      fixedJson = this.removeTrailingCommas(fixedJson)

      // 3. JSON 이후 예상치 못한 문자 제거
      fixedJson = this.removeUnexpectedCharacters(fixedJson)

      // 4. 중괄호 균형 맞추기
      fixedJson = this.balanceBraces(fixedJson)

      try {
        // 수정된 JSON 검증
        JSON.parse(fixedJson)
        console.log("JSON 오류 수정 성공!")
        return fixedJson
      } catch (secondError) {
        console.error("자동 수정 실패:", secondError.message)

        // 5. 더 강력한 수정 시도
        return this.applyAggressiveFixes(jsonString, error.message)
      }
    }
  }

  /**
   * 따옴표 관련 오류 수정
   */
  private static fixQuotationIssues(jsonString: string): string {
    // 1. 작은따옴표를 큰따옴표로 변환
    let result = jsonString.replace(/'/g, '"')

    // 2. 따옴표 없는 속성명에 따옴표 추가 (예: {name: "value"} -> {"name": "value"})
    result = result.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')

    return result
  }

  /**
   * 후행 쉼표 제거
   */
  private static removeTrailingCommas(jsonString: string): string {
    // 객체 끝의 후행 쉼표 제거: ,} -> }
    let result = jsonString.replace(/,(\s*})/g, "$1")

    // 배열 끝의 후행 쉼표 제거: ,] -> ]
    result = result.replace(/,(\s*\])/g, "$1")

    return result
  }

  /**
   * JSON 이후 예상치 못한 문자 제거
   */
  private static removeUnexpectedCharacters(jsonString: string): string {
    // 마지막 중괄호 이후의 모든 문자 제거
    const lastBraceIndex = jsonString.lastIndexOf("}")
    if (lastBraceIndex !== -1 && lastBraceIndex < jsonString.length - 1) {
      return jsonString.substring(0, lastBraceIndex + 1)
    }

    return jsonString
  }

  /**
   * 중괄호 균형 맞추기
   */
  private static balanceBraces(jsonString: string): string {
    let openBraces = 0
    let closeBraces = 0

    // 중괄호 개수 세기
    for (let i = 0; i < jsonString.length; i++) {
      if (jsonString[i] === "{") openBraces++
      if (jsonString[i] === "}") closeBraces++
    }

    let result = jsonString

    // 여는 중괄호가 더 많은 경우
    if (openBraces > closeBraces) {
      const diff = openBraces - closeBraces
      result = result + "}".repeat(diff)
    }
    // 닫는 중괄호가 더 많은 경우
    else if (closeBraces > openBraces) {
      const diff = closeBraces - openBraces
      result = "{".repeat(diff) + result
    }

    return result
  }

  /**
   * 더 강력한 수정 적용
   */
  private static applyAggressiveFixes(jsonString: string, errorMessage: string): string {
    console.log("강력한 수정 적용 중...")

    // 오류 메시지에서 위치 정보 추출
    const positionMatch = errorMessage.match(/position (\d+)/)
    const position = positionMatch ? Number.parseInt(positionMatch[1]) : -1

    if (position > 0) {
      // 오류 위치 주변 문자 검사 및 수정
      const before = jsonString.substring(0, position)
      const after = jsonString.substring(position)

      // 오류 유형에 따른 수정
      if (errorMessage.includes("double-quoted property name")) {
        // 따옴표 오류 - 속성명에 따옴표 추가
        const propertyMatch = after.match(/^\s*([a-zA-Z0-9_$]+)\s*:/)
        if (propertyMatch) {
          const fixedAfter = after.replace(propertyMatch[1], `"${propertyMatch[1]}"`)
          return this.fixJsonErrors(before + fixedAfter)
        }
      } else if (errorMessage.includes("unexpected character")) {
        // 예상치 못한 문자 - 해당 위치의 문자 제거
        return this.fixJsonErrors(before + after.substring(1))
      }
    }

    // 마지막 수단: 유효한 JSON 부분만 추출
    try {
      const validJsonMatch = jsonString.match(/\{[\s\S]*\}/)
      if (validJsonMatch) {
        const extractedJson = validJsonMatch[0]
        return this.fixJsonErrors(extractedJson)
      }
    } catch (e) {
      console.error("유효한 JSON 추출 실패")
    }

    // 모든 시도 실패 시 빈 객체 반환
    return "{}"
  }

  /**
   * Gemini 응답에서 JSON 추출 및 수정
   */
  static extractAndFixJson(response: string): any {
    try {
      // 1. 응답에서 JSON 블록 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("응답에서 JSON을 찾을 수 없습니다")
      }

      const jsonStr = jsonMatch[0]

      // 2. JSON 오류 수정
      const fixedJson = this.fixJsonErrors(jsonStr)

      // 3. JSON 파싱
      return JSON.parse(fixedJson)
    } catch (error) {
      console.error("JSON 추출 및 수정 실패:", error)
      return {} // 빈 객체 반환
    }
  }
}
