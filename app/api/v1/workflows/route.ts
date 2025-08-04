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

// 워크플로우 생성 API
export async function POST(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, steps, execution_type = "sequential" } = body

    // 입력 검증
    if (!name || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: "Missing required fields: name, steps" }, { status: 400 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "workflows.create")

    // 워크플로우 생성 시뮬레이션
    const workflow = {
      id: `workflow_${Date.now()}`,
      name,
      description: description || "",
      execution_type,
      steps: steps.map((step: any, index: number) => ({
        id: `step_${index + 1}`,
        ...step,
        order: index + 1,
      })),
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        total_executions: 0,
        success_rate: 0,
        avg_execution_time: "0s",
      },
    }

    return NextResponse.json({
      success: true,
      data: workflow,
      message: "Workflow created successfully",
    })
  } catch (error) {
    console.error("Workflow creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 워크플로우 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "workflows.list")

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // 워크플로우 목록 시뮬레이션
    const workflows = [
      {
        id: "workflow_1",
        name: "Customer Data Processing",
        description: "Process and analyze customer data",
        execution_type: "sequential",
        status: "active",
        created_at: "2024-01-15T10:30:00Z",
        last_executed: "2024-01-15T14:20:00Z",
        stats: {
          total_executions: 125,
          success_rate: 98.4,
          avg_execution_time: "2.3s",
        },
      },
      {
        id: "workflow_2",
        name: "Content Generation Pipeline",
        description: "Generate and review content automatically",
        execution_type: "parallel",
        status: "active",
        created_at: "2024-01-14T09:15:00Z",
        last_executed: "2024-01-15T13:45:00Z",
        stats: {
          total_executions: 89,
          success_rate: 96.6,
          avg_execution_time: "4.1s",
        },
      },
      {
        id: "workflow_3",
        name: "Quality Assurance Check",
        description: "Automated quality checks for outputs",
        execution_type: "conditional",
        status: "inactive",
        created_at: "2024-01-13T16:20:00Z",
        last_executed: "2024-01-14T11:30:00Z",
        stats: {
          total_executions: 45,
          success_rate: 100,
          avg_execution_time: "1.8s",
        },
      },
    ]

    // 필터링
    let filteredWorkflows = workflows
    if (status) {
      filteredWorkflows = workflows.filter((workflow) => workflow.status === status)
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedWorkflows = filteredWorkflows.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedWorkflows,
      pagination: {
        page,
        limit,
        total: filteredWorkflows.length,
        pages: Math.ceil(filteredWorkflows.length / limit),
      },
    })
  } catch (error) {
    console.error("Workflow list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
