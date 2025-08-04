import { type NextRequest, NextResponse } from "next/server"

// API 키 검증 함수
function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const apiKey = authHeader.substring(7)
  // 실제 구현에서는 데이터베이스에서 API 키 검증
  return apiKey.startsWith("aiw_")
}

// 사용량 추적 함수
async function trackUsage(apiKey: string, endpoint: string) {
  // 실제 구현에서는 데이터베이스에 사용량 기록
  console.log(`API 사용량 추적: ${apiKey} - ${endpoint}`)
}

// AI 에이전트 생성 API
export async function POST(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const body = await request.json()
    const { name, model, prompt, tools = [] } = body

    // 입력 검증
    if (!name || !model || !prompt) {
      return NextResponse.json({ error: "Missing required fields: name, model, prompt" }, { status: 400 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "agents.create")

    // AI 에이전트 생성 시뮬레이션
    const agent = {
      id: `agent_${Date.now()}`,
      name,
      model,
      prompt,
      tools,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      api_key: apiKey.substring(0, 8) + "...", // 보안을 위해 일부만 표시
    }

    return NextResponse.json({
      success: true,
      data: agent,
      message: "AI agent created successfully",
    })
  } catch (error) {
    console.error("Agent creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// AI 에이전트 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "agents.list")

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // 에이전트 목록 시뮬레이션
    const agents = [
      {
        id: "agent_1",
        name: "Customer Service Agent",
        model: "gpt-4",
        status: "active",
        created_at: "2024-01-15T10:30:00Z",
        last_used: "2024-01-15T14:20:00Z",
      },
      {
        id: "agent_2",
        name: "Data Analysis Agent",
        model: "gpt-4",
        status: "active",
        created_at: "2024-01-14T09:15:00Z",
        last_used: "2024-01-15T13:45:00Z",
      },
      {
        id: "agent_3",
        name: "Content Writer Agent",
        model: "gpt-3.5-turbo",
        status: "inactive",
        created_at: "2024-01-13T16:20:00Z",
        last_used: "2024-01-14T11:30:00Z",
      },
    ]

    // 필터링
    let filteredAgents = agents
    if (status) {
      filteredAgents = agents.filter((agent) => agent.status === status)
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedAgents,
      pagination: {
        page,
        limit,
        total: filteredAgents.length,
        pages: Math.ceil(filteredAgents.length / limit),
      },
    })
  } catch (error) {
    console.error("Agent list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
