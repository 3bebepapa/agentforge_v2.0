/**
 * API 키 관리 및 검증 서비스
 */
export class ApiKeyService {
  private static instance: ApiKeyService
  private apiKeys: Map<string, { valid: boolean; lastChecked: number }> = new Map()

  // 싱글톤 패턴 적용
  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService()
    }
    return ApiKeyService.instance
  }

  /**
   * API 키 유효성 검증
   * @param apiKey 검증할 API 키
   * @returns 유효성 여부
   */
  public async validateApiKey(apiKey: string): Promise<boolean> {
    // 캐시된 결과가 있고 1시간 이내에 검증된 경우 캐시 결과 반환
    const cached = this.apiKeys.get(apiKey)
    if (cached && Date.now() - cached.lastChecked < 3600000) {
      return cached.valid
    }

    try {
      // Gemini API 키 유효성 검사 (간단한 요청 보내기)
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`

      const response = await fetch(testUrl)
      const valid = response.ok

      // 결과 캐싱
      this.apiKeys.set(apiKey, { valid, lastChecked: Date.now() })
      return valid
    } catch (error) {
      console.error("API 키 검증 오류:", error)
      return false
    }
  }

  /**
   * API 키 사용 가능 여부 확인 (할당량 초과 방지)
   * @param apiKey 확인할 API 키
   * @returns 사용 가능 여부
   */
  public async isApiKeyUsable(apiKey: string): Promise<boolean> {
    // 기본적으로 유효성 검사 수행
    const isValid = await this.validateApiKey(apiKey)
    if (!isValid) return false

    // 추가 로직: 할당량 추적 등을 구현할 수 있음
    return true
  }

  /**
   * API 키 등록
   * @param apiKey 등록할 API 키
   * @param valid 유효성 여부
   */
  public registerApiKey(apiKey: string, valid = true): void {
    this.apiKeys.set(apiKey, { valid, lastChecked: Date.now() })
  }
}
