import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const workflowData = await req.json()

    // 워크플로우 저장 로직
    // 실제로는 데이터베이스에 저장

    return NextResponse.json({
      id: `wf_${Date.now()}`,
      ...workflowData,
      createdAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("워크플로우 저장 오류:", error)

    return NextResponse.json({ error: error.message || "워크플로우 저장 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // 워크플로우 목록 조회 로직
    // 실제로는 데이터베이스에서 조회

    return NextResponse.json([
      {
        id: "wf_1",
        name: "사용자 등록 워크플로우",
        description: "새 사용자 등록 및 환영 이메일 발송",
        type: "sequential",
        createdAt: "2023-06-15T10:30:00Z",
      },
      {
        id: "wf_2",
        name: "데이터 동기화 워크플로우",
        description: "CRM과 데이터베이스 간 데이터 동기화",
        type: "parallel",
        createdAt: "2023-06-14T15:45:00Z",
      },
    ])
  } catch (error: any) {
    console.error("워크플로우 조회 오류:", error)

    return NextResponse.json({ error: error.message || "워크플로우 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
