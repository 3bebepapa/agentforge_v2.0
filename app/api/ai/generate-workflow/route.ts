import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "프롬프트가 필요합니다." }, { status: 400 })
    }

    // AI를 사용하여 워크플로우 생성
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        다음 설명을 기반으로 워크플로우를 생성해주세요. JSON 형식으로 응답해주세요.
        
        설명: ${prompt}
        
        응답 형식:
        {
          "name": "워크플로우 이름",
          "description": "워크플로우 설명",
          "type": "sequential|parallel|conditional",
          "nodes": [
            {
              "id": "node1",
              "type": "triggerNode|databaseNode|apiNode|transformNode|agentNode|conditionNode|actionNode",
              "data": {
                "label": "노드 이름",
                "componentId": "컴포넌트 ID",
                "icon": "아이콘",
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
    console.error("워크플로우 생성 오류:", error)

    return NextResponse.json({ error: error.message || "워크플로우 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
