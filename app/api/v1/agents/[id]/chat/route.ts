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

// AI 에이전트와 채팅 API
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // API 키 검증
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { message, conversation_id, stream = false } = body

    // 입력 검증
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 사용량 추적
    const authHeader = request.headers.get("authorization")!
    const apiKey = authHeader.substring(7)
    await trackUsage(apiKey, "agents.chat")

    // 스트리밍 응답 처리
    if (stream) {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        start(controller) {
          // 시뮬레이션된 스트리밍 응답
          const responses = [
            "안녕하세요! ",
            "무엇을 도와드릴까요? ",
            "궁금한 점이 있으시면 ",
            "언제든지 말씀해 주세요.",
          ]

          let index = 0
          const interval = setInterval(() => {
            if (index < responses.length) {
              const chunk = {
                id: `msg_${Date.now()}_${index}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: "gpt-4",
                choices: [
                  {
                    index: 0,
                    delta: {
                      content: responses[index],
                    },
                    finish_reason: null,
                  },
                ],
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
              index++
            } else {
              // 스트림 종료
              const finalChunk = {
                id: `msg_${Date.now()}_final`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: "gpt-4",
                choices: [
                  {
                    index: 0,
                    delta: {},
                    finish_reason: "stop",
                  },
                ],
              }

              controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`))
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              controller.close()
              clearInterval(interval)
            }
          }, 500)
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // 일반 응답 처리
    await new Promise((resolve) => setTimeout(resolve, 1500)) // 응답 지연 시뮬레이션

    const response = {
      id: `msg_${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4",
      agent_id: id,
      conversation_id: conversation_id || `conv_${Date.now()}`,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: `안녕하세요! 저는 ${id} 에이전트입니다. "${message}"에 대해 도움을 드리겠습니다. 무엇을 도와드릴까요?`,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80,
      },
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("Agent chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
