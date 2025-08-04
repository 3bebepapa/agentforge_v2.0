import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 필요합니다." }, { status: 400 })
    }

    // 모드에 따른 프롬프트 조정
    let systemPrompt = ""
    if (mode === "process") {
      systemPrompt =
        "고객 문의 처리 프로세스를 생성합니다. 고객 의도 분석, 관련 지식 검색, 응답 생성 등의 단계를 포함합니다."
    } else if (mode === "workflow") {
      systemPrompt =
        "데이터 처리 워크플로우를 생성합니다. 데이터 소스 연결, 데이터 변환, 데이터베이스 업데이트 등의 단계를 포함합니다."
    } else {
      systemPrompt = "간단한 플로우를 생성합니다. 순차적인 단계로 구성된 플로우를 생성합니다."
    }

    // AI를 사용하여 워크플로우 생성
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        ${systemPrompt}
        
        다음 설명을 기반으로 ${mode === "process" ? "프로세스" : mode === "workflow" ? "워크플로우" : "플로우"}를 생성해주세요. JSON 형식으로 응답해주세요.
        
        설명: ${prompt}
        
        응답 형식:
        {
          "name": "이름",
          "description": "설명",
          "type": "sequential|parallel|conditional",
          "nodes": [
            {
              "id": "node1",
              "type": "agent|database|api|transform|condition|trigger|action",
              "data": {
                "label": "노드 이름",
                "componentId": "컴포넌트 ID",
                // 기타 노드별 메타데이터
              },
              "position": { "x": 100, "y": 100 }
            }
            // 추가 노드
          ],
          "edges": [
            {
              "id": "edge1",
              "source": "node1",
              "target": "node2",
              "type": "default|conditional"
            }
            // 추가 엣지
          ]
        }
      `,
    })

    // AI 응답을 JSON으로 파싱
    const workflowData = JSON.parse(text)

    return NextResponse.json(workflowData)
  } catch (error: any) {
    console.error("생성 오류:", error)

    return NextResponse.json({ error: error.message || "생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
