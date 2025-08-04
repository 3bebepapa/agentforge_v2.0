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

// 지식베이스 문서 업로드 API
export async function POST(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const metadata = formData.get("metadata") as string

    // 입력 검증
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // 파일 타입 검증
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Allowed: PDF, TXT, DOCX" }, { status: 400 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "knowledge.upload")

    // 파일 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const document = {
      id: `doc_${Date.now()}`,
      title: title || file.name,
      filename: file.name,
      size: file.size,
      type: file.type,
      category: category || "general",
      metadata: metadata ? JSON.parse(metadata) : {},
      status: "processed",
      uploaded_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      embeddings: {
        total_chunks: 45,
        vector_dimension: 1536,
        embedding_model: "text-embedding-ada-002",
      },
      content_stats: {
        word_count: 2450,
        page_count: 12,
        language: "ko",
      },
    }

    return NextResponse.json({
      success: true,
      data: document,
      message: "Document uploaded and processed successfully",
    })
  } catch (error) {
    console.error("Knowledge upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 지식베이스 문서 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "knowledge.list")

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")

    // 문서 목록 시뮬레이션
    const documents = [
      {
        id: "doc_1",
        title: "Customer Service Guidelines",
        filename: "cs_guidelines.pdf",
        category: "policies",
        size: 2450000,
        uploaded_at: "2024-01-15T10:30:00Z",
        status: "processed",
        embeddings: { total_chunks: 45 },
      },
      {
        id: "doc_2",
        title: "Product Documentation",
        filename: "product_docs.docx",
        category: "documentation",
        size: 1850000,
        uploaded_at: "2024-01-14T09:15:00Z",
        status: "processed",
        embeddings: { total_chunks: 32 },
      },
      {
        id: "doc_3",
        title: "FAQ Database",
        filename: "faq.txt",
        category: "support",
        size: 450000,
        uploaded_at: "2024-01-13T16:20:00Z",
        status: "processed",
        embeddings: { total_chunks: 18 },
      },
    ]

    // 필터링
    let filteredDocuments = documents
    if (category) {
      filteredDocuments = documents.filter((doc) => doc.category === category)
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedDocuments,
      pagination: {
        page,
        limit,
        total: filteredDocuments.length,
        pages: Math.ceil(filteredDocuments.length / limit),
      },
      stats: {
        total_documents: documents.length,
        total_embeddings: documents.reduce((sum, doc) => sum + doc.embeddings.total_chunks, 0),
        categories: [...new Set(documents.map((doc) => doc.category))],
      },
    })
  } catch (error) {
    console.error("Knowledge list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
