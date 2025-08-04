/**
 * 컴포넌트 관련 타입 정의
 * 기존의 분산된 컴포넌트 타입 정의들을 통합
 */

// 컴포넌트 타입 정의
export interface Component {
  id: string
  name: string
  type: string
  description: string
  features: string[]
  code: string
  createdAt: string
  updatedAt: string
  validationResult: {
    isValid: boolean
    qualityScore: number
    errors: string[]
    warnings: string[]
  }
}

// 컴포넌트 명세 타입 정의
export interface ComponentSpec {
  name: string
  type: string
  description: string
  features: string[]
  code?: string
}

// 컴포넌트 유효성 검사 결과 타입 정의
export interface ComponentValidationResult {
  isValid: boolean
  qualityScore: number
  errors: string[]
  warnings: string[]
}
