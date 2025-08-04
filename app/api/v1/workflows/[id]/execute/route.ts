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

// 워크플로우 실행 API
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { input_data, async_execution = false } = body

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "workflows.execute")

    const executionId = `exec_${Date.now()}`

    // 비동기 실행 처리
    if (async_execution) {
      // 비동기 실행 시작
      return NextResponse.json({
        success: true,
        data: {
          execution_id: executionId,
          workflow_id: id,
          status: "running",
          started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 30000).toISOString(), // 30초 후
        },
        message: "Workflow execution started asynchronously",
      })
    }

    // 동기 실행 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const execution = {
      execution_id: executionId,
      workflow_id: id,
      status: "completed",
      started_at: new Date(Date.now() - 3000).toISOString(),
      completed_at: new Date().toISOString(),
      execution_time: "3.2s",
      input_data,
      steps: [
        {
          step_id: "step_1",
          name: "Data Validation",
          status: "completed",
          started_at: new Date(Date.now() - 3000).toISOString(),
          completed_at: new Date(Date.now() - 2500).toISOString(),
          execution_time: "0.5s",
          output: {
            validation_result: "passed",
            processed_records: 150,
          },
        },
        {
          step_id: "step_2",
          name: "AI Processing",
          status: "completed",
          started_at: new Date(Date.now() - 2500).toISOString(),
          completed_at: new Date(Date.now() - 1000).toISOString(),
          execution_time: "1.5s",
          output: {
            processed_items: 150,
            ai_insights: ["High engagement rate", "Positive sentiment", "Trending topics identified"],
          },
        },
        {
          step_id: "step_3",
          name: "Result Generation",
          status: "completed",
          started_at: new Date(Date.now() - 1000).toISOString(),
          completed_at: new Date().toISOString(),
          execution_time: "1.0s",
          output: {
            report_generated: true,
            file_url: "https://api.aiworks.com/files/report_123.pdf",
            summary: "Analysis completed successfully with 98.5% accuracy",
          },
        },
      ],
      final_output: {
        success: true,
        total_processed: 150,
        accuracy: 98.5,
        insights_count: 3,
        report_url: "https://api.aiworks.com/files/report_123.pdf",
      },
      usage: {
        compute_time: "3.2s",
        tokens_used: 2450,
        api_calls: 5,
      },
    }

    return NextResponse.json({
      success: true,
      data: execution,
    })
  } catch (error) {
    console.error("Workflow execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
