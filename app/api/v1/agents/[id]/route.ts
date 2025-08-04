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

// 특정 AI 에이전트 조회 API
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const { id } = params

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "agents.get")

    // 에이전트 조회 시뮬레이션
    const agent = {
      id,
      name: "Customer Service Agent",
      model: "gpt-4",
      prompt: "You are a helpful customer service agent. Always be polite and professional.",
      tools: ["web_search", "knowledge_base", "email"],
      status: "active",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      stats: {
        total_conversations: 1250,
        avg_response_time: "1.2s",
        satisfaction_rate: 4.8,
      },
    }

    return NextResponse.json({
      success: true,
      data: agent,
    })
  } catch (error) {
    console.error("Agent get error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// AI 에이전트 업데이트 API
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { name, model, prompt, tools, status } = body

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "agents.update")

    // 에이전트 업데이트 시뮬레이션
    const updatedAgent = {
      id,
      name: name || "Customer Service Agent",
      model: model || "gpt-4",
      prompt: prompt || "You are a helpful customer service agent.",
      tools: tools || ["web_search", "knowledge_base"],
      status: status || "active",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: updatedAgent,
      message: "Agent updated successfully",
    })
  } catch (error) {
    console.error("Agent update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// AI 에이전트 삭제 API
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const { id } = params

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "agents.delete")

    // 에이전트 삭제 시뮬레이션
    return NextResponse.json({
      success: true,
      message: `Agent ${id} deleted successfully`,
    })
  } catch (error) {
    console.error("Agent delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
