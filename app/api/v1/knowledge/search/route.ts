import { type NextRequest, NextResponse } from "next/server"

// API 키 검증 함수
function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const apiKey = authHeader.substring(7)
  return apiKey.startsWith("aiw_")
}

// 사용량 추적 함수
async function trackUsage(apiKey: string, endpoint: string) {
  console.log(`API 사용량 추적: ${apiKey} - ${endpoint}`)
}

// 지식베이스 검색 API
export async function GET(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const threshold = Number.parseFloat(searchParams.get("threshold") || "0.7")
    const category = searchParams.get("category")

    // 입력 검증
    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "knowledge.search")

    // 검색 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const searchResults = [
      {
        id: "chunk_1",
        document_id: "doc_1",
        document_title: "Customer Service Guidelines",
        content:
          "고객 서비스 시 항상 정중하고 전문적인 태도를 유지해야 합니다. 고객의 문의사항을 정확히 파악하고 신속하게 해결책을 제시하는 것이 중요합니다.",
        similarity_score: 0.92,
        metadata: {
          page: 3,
          section: "기본 원칙",
          category: "policies",
        },
      },
      {
        id: "chunk_2",
        document_id: "doc_3",
        document_title: "FAQ Database",
        content:
          "자주 묻는 질문: Q: 서비스 이용 중 문제가 발생했을 때는 어떻게 해야 하나요? A: 고객센터(1588-1234)로 연락하시거나 온라인 문의를 통해 도움을 요청하실 수 있습니다.",
        similarity_score: 0.87,
        metadata: {
          page: 1,
          section: "일반 문의",
          category: "support",
        },
      },
      {
        id: "chunk_3",
        document_id: "doc_2",
        document_title: "Product Documentation",
        content:
          "제품 사용법: 1단계 - 전원을 켜고 초기 설정을 진행합니다. 2단계 - 사용자 계정을 생성하거나 기존 계정으로 로그인합니다. 3단계 - 필요한 기능을 선택하여 사용을 시작합니다.",
        similarity_score: 0.81,
        metadata: {
          page: 5,
          section: "시작하기",
          category: "documentation",
        },
      },
    ]

    // 임계값 필터링
    const filteredResults = searchResults.filter((result) => result.similarity_score >= threshold)

    // 카테고리 필터링
    const finalResults = category
      ? filteredResults.filter((result) => result.metadata.category === category)
      : filteredResults

    // 제한 적용
    const limitedResults = finalResults.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: limitedResults,
        total_found: finalResults.length,
        search_time: "0.8s",
        filters: {
          threshold,
          category,
          limit,
        },
      },
    })
  } catch (error) {
    console.error("Knowledge search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 지식베이스 검색 API (POST 방식 - 복잡한 쿼리용)
export async function POST(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const body = await request.json()
    const { query, limit = 10, threshold = 0.7, filters = {}, include_metadata = true, rerank = false } = body

    // 입력 검증
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "knowledge.search.advanced")

    // 고급 검색 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const searchResults = [
      {
        id: "chunk_1",
        document_id: "doc_1",
        document_title: "Customer Service Guidelines",
        content: "고객 서비스 관련 상세 내용...",
        similarity_score: 0.94,
        rerank_score: rerank ? 0.96 : null,
        metadata: include_metadata
          ? {
              page: 3,
              section: "기본 원칙",
              category: "policies",
              tags: ["customer_service", "guidelines"],
              created_at: "2024-01-15T10:30:00Z",
            }
          : null,
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        query,
        results: searchResults,
        total_found: searchResults.length,
        search_time: "1.2s",
        reranked: rerank,
        filters_applied: filters,
      },
    })
  } catch (error) {
    console.error("Advanced knowledge search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
