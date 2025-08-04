// 노드 타입 정의
export type NodeType =
  // 입력 노드
  | "trigger" // 트리거 (HTTP, 스케줄, 이벤트 등)
  | "input" // 입력 (파일, 텍스트, 파라미터 등)

  // 처리 노드
  | "llm" // 언어 모델 (OpenAI, Gemini, Claude 등)
  | "memory" // 메모리 (대화 기록, 벡터 저장소 등)
  | "tool" // 도구 (검색, 계산기, 코드 실행 등)
  | "agent" // 에이전트 (ReAct, 함수 호출 등)

  // 데이터 노드
  | "data" // 데이터 처리 (변환, 필터링, 병합 등)
  | "database" // 데이터베이스 (SQL, NoSQL 등)
  | "vectorstore" // 벡터 저장소 (임베딩, 검색 등)

  // 로직 노드
  | "condition" // 조건 (분기, 스위치 등)
  | "loop" // 반복 (맵, 필터, 리듀스 등)

  // 통합 노드
  | "api" // API (HTTP, REST, GraphQL 등)
  | "integration" // 통합 (Slack, GitHub, Google 등)

  // 출력 노드
  | "output" // 출력 (응답, 파일, 시각화 등)
  | "notification" // 알림 (이메일, 메시지 등)

  // 유틸리티 노드
  | "utility" // 유틸리티 (지연, 로깅, 오류 처리 등)
  | "custom" // 사용자 정의 노드

// 노드 카테고리 정의
export type NodeCategory =
  | "Input" // 입력 관련 노드
  | "Processing" // 처리 관련 노드
  | "Data" // 데이터 관련 노드
  | "Logic" // 로직 관련 노드
  | "Integration" // 통합 관련 노드
  | "Output" // 출력 관련 노드
  | "Utility" // 유틸리티 노드

// 파라미터 타입 정의
export type ParameterType =
  | "string" // 문자열
  | "number" // 숫자
  | "boolean" // 불리언
  | "select" // 선택 (드롭다운)
  | "multiselect" // 다중 선택
  | "json" // JSON
  | "code" // 코드 (JavaScript, Python 등)
  | "file" // 파일
  | "date" // 날짜
  | "color" // 색상
  | "secret" // 비밀 값 (API 키 등)
  | "array" // 배열
  | "object" // 객체

// 파라미터 정의
export interface NodeParameter {
  name: string // 파라미터 이름
  type: ParameterType // 파라미터 타입
  label: string // 표시 레이블
  description?: string // 설명
  default?: any // 기본값
  required?: boolean // 필수 여부
  options?: any[] // 선택 옵션 (select, multiselect 타입용)
  placeholder?: string // 입력 필드 플레이스홀더
  validation?: {
    // 유효성 검사 규칙
    pattern?: string // 정규식 패턴
    min?: number // 최소값
    max?: number // 최대값
    minLength?: number // 최소 길이
    maxLength?: number // 최대 길이
  }
  advanced?: boolean // 고급 옵션 여부
  hidden?: boolean // 숨김 여부
  dependsOn?: string // 의존하는 다른 파라미터
  condition?: {
    // 표시 조건
    field: string // 조건 필드
    value: any // 조건 값
  }
}

// 입력/출력 포트 정의
export interface NodePort {
  id: string // 포트 ID
  name: string // 포트 이름
  label: string // 표시 레이블
  type: string // 데이터 타입
  description?: string // 설명
  required?: boolean // 필수 여부
  multiple?: boolean // 다중 연결 허용 여부
  hidden?: boolean // 숨김 여부
}

// 노드 정의
export interface NodeDefinition {
  id: string // 노드 유형 ID
  name: string // 노드 이름
  type: NodeType // 노드 타입
  category: NodeCategory // 노드 카테고리
  description: string // 설명
  icon: string // 아이콘 (Lucide 아이콘 이름)
  color?: string // 색상 (CSS 색상)
  inputs: NodePort[] // 입력 포트
  outputs: NodePort[] // 출력 포트
  parameters: NodeParameter[] // 파라미터
  code?: string // 실행 코드
  template?: string // 템플릿 코드
  examples?: {
    // 예제
    name: string // 예제 이름
    description: string // 예제 설명
    config: Record<string, any> // 예제 구성
  }[]
  documentation?: string // 문서 URL
  version?: string // 버전
  author?: string // 작성자
  tags?: string[] // 태그
  hidden?: boolean // 숨김 여부
  experimental?: boolean // 실험적 기능 여부
  deprecated?: boolean // 사용 중단 여부
  execute?: (inputs: Record<string, any>, parameters: Record<string, any>) => Promise<Record<string, any>> // 실행 함수
}

// 노드 인스턴스 정의
export interface NodeInstance {
  id: string // 인스턴스 ID
  type: string // 노드 유형 ID
  position: {
    // 위치
    x: number
    y: number
  }
  data: {
    // 노드 데이터
    label?: string // 레이블
    parameters: Record<string, any> // 파라미터 값
    inputs: Record<string, any> // 입력 값
    outputs: Record<string, any> // 출력 값
    state?: {
      // 상태
      status?: "idle" | "running" | "success" | "error" // 실행 상태
      error?: string // 오류 메시지
      result?: any // 실행 결과
      startTime?: string // 시작 시간
      endTime?: string // 종료 시간
      duration?: number // 실행 시간 (ms)
    }
  }
  width?: number // 너비
  height?: number // 높이
  selected?: boolean // 선택 여부
  dragging?: boolean // 드래그 중 여부
  resizing?: boolean // 크기 조정 중 여부
}

// 엣지(연결선) 정의
export interface Edge {
  id: string // 엣지 ID
  source: string // 소스 노드 ID
  sourceHandle: string // 소스 포트 ID
  target: string // 타겟 노드 ID
  targetHandle: string // 타겟 포트 ID
  label?: string // 레이블
  type?: string // 타입
  animated?: boolean // 애니메이션 여부
  style?: Record<string, any> // 스타일
  data?: Record<string, any> // 데이터
}

// 워크플로우 정의
export interface Workflow {
  id: string // 워크플로우 ID
  name: string // 워크플로우 이름
  description?: string // 설명
  nodes: NodeInstance[] // 노드 인스턴스
  edges: Edge[] // 엣지
  version: string // 버전
  created: string // 생성 시간
  updated: string // 업데이트 시간
  author?: string // 작성자
  tags?: string[] // 태그
  metadata?: Record<string, any> // 메타데이터
}
