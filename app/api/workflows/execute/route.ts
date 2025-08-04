import { NextResponse } from "next/server"
import { nodeExecutors } from "@/lib/workflow-engine"

export async function POST(req: Request) {
  try {
    const { nodes, edges } = await req.json()

    if (!nodes || !edges) {
      return NextResponse.json({ error: "노드와 엣지 정보가 필요합니다." }, { status: 400 })
    }

    // 워크플로우 실행 시작 시간
    const startTime = Date.now()

    // 노드 실행 결과 저장
    const nodeResults = new Map()
    const stepResults = []

    // 시작 노드 찾기
    const startNodes = nodes.filter(
      (node) => node.type === "triggerNode" || !edges.some((edge) => edge.target === node.id),
    )

    if (startNodes.length === 0) {
      return NextResponse.json({ error: "시작 노드를 찾을 수 없습니다." }, { status: 400 })
    }

    // 노드 실행 함수
    async function executeNode(node, inputs = {}) {
      // 이미 실행된 노드면 결과 반환
      if (nodeResults.has(node.id)) {
        return nodeResults.get(node.id)
      }

      const nodeType = node.type.replace("Node", "")
      const executor = nodeExecutors[nodeType]

      if (!executor) {
        throw new Error(`${nodeType} 유형의 노드 실행기를 찾을 수 없습니다.`)
      }

      // 노드 실행 시작 시간
      const stepStartTime = Date.now()

      // 노드 실행
      const output = await executor(node, inputs)

      // 노드 실행 종료 시간
      const stepEndTime = Date.now()
      const executionTime = stepEndTime - stepStartTime

      // 결과 저장
      nodeResults.set(node.id, output)

      // 단계 결과 저장
      stepResults.push({
        id: node.id,
        name: node.data.label,
        type: nodeType,
        executionTime,
        memoryUsage: Math.floor(Math.random() * 50) + 10, // 실제로는 메모리 사용량 측정 필요
        status: "completed",
        input: inputs,
        output,
      })

      return output
    }

    // 워크플로우 실행
    for (const startNode of startNodes) {
      await executeNode(startNode)

      // 다음 노드 찾기 및 실행
      const processedNodes = new Set([startNode.id])
      let nodesToProcess = edges
        .filter((edge) => edge.source === startNode.id)
        .map((edge) => nodes.find((node) => node.id === edge.target))

      while (nodesToProcess.length > 0) {
        const nextNodes = []

        for (const node of nodesToProcess) {
          if (processedNodes.has(node.id)) continue

          // 입력 노드 찾기
          const inputEdges = edges.filter((edge) => edge.target === node.id)
          const inputs = {}

          for (const edge of inputEdges) {
            const sourceNode = nodes.find((n) => n.id === edge.source)
            if (sourceNode && nodeResults.has(sourceNode.id)) {
              inputs[sourceNode.id] = nodeResults.get(sourceNode.id)
            }
          }

          // 노드 실행
          await executeNode(node, inputs)
          processedNodes.add(node.id)

          // 다음 노드 찾기
          const outgoingEdges = edges.filter((edge) => edge.source === node.id)
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target)
            if (targetNode && !processedNodes.has(targetNode.id)) {
              nextNodes.push(targetNode)
            }
          }
        }

        nodesToProcess = nextNodes
      }
    }

    // 워크플로우 실행 종료 시간
    const endTime = Date.now()
    const executionTime = (endTime - startTime) / 1000 // 초 단위

    // 결과 반환
    return NextResponse.json({
      executionTime,
      steps: stepResults,
      summary: `워크플로우가 ${executionTime.toFixed(1)}초 동안 ${stepResults.length}개 단계를 실행했습니다.`,
    })
  } catch (error: any) {
    console.error("워크플로우 실행 오류:", error)

    return NextResponse.json({ error: error.message || "워크플로우 실행 중 오류가 발생했습니다." }, { status: 500 })
  }
}
