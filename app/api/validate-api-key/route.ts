import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, message: "API 키가 필요합니다." }, { status: 400 })
    }

    // Gemini API 키 검증
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello, this is a test.",
                },
              ],
            },
          ],
        }),
      },
    )

    if (response.ok) {
      const data = await response.json()
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return NextResponse.json({ valid: true, message: "API 키가 유효합니다." })
      }
    }

    return NextResponse.json({ valid: false, message: "유효하지 않은 API 키입니다." }, { status: 401 })
  } catch (error) {
    console.error("API 키 검증 오류:", error)
    return NextResponse.json({ valid: false, message: "API 키 검증 중 오류가 발생했습니다." }, { status: 500 })
  }
}
