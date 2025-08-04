import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json()

    // 실제 구현에서는 정적 분석 도구 사용
    // 여기서는 예시 결과 반환
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 간단한 검증 로직
    const hasErrors = code.includes("undefined") || code.includes("null.") || code.includes("NaN")

    if (hasErrors) {
      return NextResponse.json({
        valid: false,
        issues: [
          {
            line: 10,
            message: "잠재적인 null 참조 오류가 있습니다.",
            severity: "error",
          },
        ],
      })
    }

    return NextResponse.json({
      valid: true,
      issues: [],
    })
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        issues: [
          {
            line: 1,
            message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
            severity: "error",
          },
        ],
      },
      { status: 500 },
    )
  }
}
