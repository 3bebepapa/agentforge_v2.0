import { type NextRequest, NextResponse } from "next/server"
import { getLLMService } from "@/services/llmService"

export async function POST(request: NextRequest) {
  try {
    const { description, apiKey, category, styling } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "설명이 필요합니다." }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다." }, { status: 400 })
    }

    const llmService = getLLMService(apiKey)

    const prompt = `
다음 요구사항에 맞는 React 컴포넌트를 생성해주세요:

설명: ${description}
카테고리: ${category || "일반"}
스타일링: ${styling || "tailwind"}

요구사항:
1. TypeScript 사용
2. 함수형 컴포넌트
3. 적절한 Props 인터페이스 정의
4. ${styling === "tailwind" ? "Tailwind CSS" : "일반 CSS"} 사용
5. 접근성 고려
6. 반응형 디자인
7. 실제 동작하는 컴포넌트

컴포넌트 코드만 반환해주세요:
`

    const generatedCode = await llmService.generateComponent(prompt)

    const component = {
      id: `comp-${Date.now()}`,
      name: extractComponentName(generatedCode) || "Generated Component",
      description,
      code: generatedCode,
      category: category || "일반",
      styling: styling || "tailwind",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ component })
  } catch (error) {
    console.error("컴포넌트 생성 오류:", error)
    return NextResponse.json({ error: "컴포넌트 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}

function extractComponentName(code: string): string | null {
  const functionMatch = code.match(/function\s+(\w+)/)
  const constMatch = code.match(/const\s+(\w+)\s*=/)
  const exportMatch = code.match(/export\s+(?:default\s+)?(?:function\s+)?(\w+)/)

  return functionMatch?.[1] || constMatch?.[1] || exportMatch?.[1] || null
}
