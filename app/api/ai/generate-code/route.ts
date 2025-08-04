import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { nodes, edges, type } = await req.json()

    if (!nodes || !edges) {
      return NextResponse.json({ error: "노드와 엣지 정보가 필요합니다." }, { status: 400 })
    }

    // 워크플로우 정보를 문자열로 변환
    const workflowStr = JSON.stringify({ nodes, edges, type }, null, 2)

    // AI를 사용하여 코드 생성
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        다음 워크플로우 정보를 기반으로 실행 가능한 코드를 생성해주세요.
        JavaScript, TypeScript, Python 세 가지 언어로 생성해주세요.
        
        워크플로우 정보:
        ${workflowStr}
        
        응답 형식:
        {
          "javascript": "// JavaScript 코드\n...",
          "typescript": "// TypeScript 코드\n...",
          "python": "# Python 코드\n..."
        }
      `,
    })

    // AI 응답을 JSON으로 파싱
    const codeData = JSON.parse(text)

    return NextResponse.json(codeData)
  } catch (error: any) {
    console.error("코드 생성 오류:", error)

    return NextResponse.json({ error: error.message || "코드 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
