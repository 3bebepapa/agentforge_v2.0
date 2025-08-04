import type { Edge } from "reactflow"
import type { CustomNode } from "./flow-types"
import { getAINodeDefinition } from "./ai-node-library"

// 워크플로우 실행 함수
export async function executeWorkflow(
  nodes: CustomNode[],
  edges: Edge[],
  apiKey: string,
): Promise<Record<string, any>> {
  // API 키 유효성 검사
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API 키가 제공되지 않았습니다.")
  }

  // API 키 유효성 검증
  try {
    const isValid = await validateApiKey(apiKey)
    if (!isValid) {
      throw new Error("API 키가 유효하지 않습니다. 올바른 API 키를 입력해주세요.")
    }
  } catch (error) {
    console.error("API 키 검증 오류:", error)
    throw new Error("API 키 검증 중 오류가 발생했습니다. 올바른 API 키인지 확인해주세요.")
  }

  // 노드 실행 순서 결정 (위상 정렬)
  const executionOrder = topologicalSort(nodes, edges)

  // 실행 결과 저장 객체
  const results: Record<string, any> = {}

  // 노드 순서대로 실행
  for (const nodeId of executionOrder) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) continue

    try {
      // 입력 데이터 수집
      const inputData = collectInputData(node, edges, results)

      // 노드 타입에 따라 실행
      const result = await executeNode(node, inputData, apiKey)

      // 결과 저장
      results[nodeId] = {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error(`노드 실행 오류 (${node.data.label}):`, error)

      // 오류 저장
      results[nodeId] = {
        success: false,
        error: error.message || "노드 실행 중 오류가 발생했습니다.",
      }
    }
  }

  return results
}

// API 키 유효성 검증 함수
async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Gemini API 키 검증 요청
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API 키 검증 실패:", errorData)
      return false
    }

    return true
  } catch (error) {
    console.error("API 키 검증 요청 오류:", error)
    return false
  }
}

// 위상 정렬 함수 (노드 실행 순서 결정)
function topologicalSort(nodes: CustomNode[], edges: Edge[]): string[] {
  // 그래프 구성
  const graph: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}

  // 모든 노드 초기화
  nodes.forEach((node) => {
    graph[node.id] = []
    inDegree[node.id] = 0
  })

  // 엣지 정보로 그래프 구성
  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      graph[edge.source].push(edge.target)
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1
    }
  })

  // 진입 차수가 0인 노드 큐에 추가
  const queue: string[] = []
  Object.keys(inDegree).forEach((nodeId) => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId)
    }
  })

  // 위상 정렬 수행
  const result: string[] = []
  while (queue.length > 0) {
    const nodeId = queue.shift()!
    result.push(nodeId)

    graph[nodeId].forEach((targetId) => {
      inDegree[targetId]--
      if (inDegree[targetId] === 0) {
        queue.push(targetId)
      }
    })
  }

  // 모든 노드가 처리되었는지 확인 (사이클 감지)
  if (result.length !== nodes.length) {
    console.warn("워크플로우에 순환 의존성이 있습니다. 일부 노드가 실행되지 않을 수 있습니다.")
  }

  return result
}

// 입력 데이터 수집 함수
function collectInputData(node: CustomNode, edges: Edge[], results: Record<string, any>): Record<string, any> {
  const inputData: Record<string, any> = {}

  // 현재 노드로 들어오는 엣지 찾기
  const incomingEdges = edges.filter((edge) => edge.target === node.id)

  // 각 엣지에 대해 소스 노드의 결과 데이터 수집
  incomingEdges.forEach((edge) => {
    const sourceNodeId = edge.source
    const sourceHandle = edge.sourceHandle
    const targetHandle = edge.targetHandle

    // 소스 노드의 실행 결과가 있는 경우
    if (results[sourceNodeId]?.success) {
      const sourceData = results[sourceNodeId].data

      // 핸들이 지정된 경우 해당 핸들의 데이터만 가져오기
      if (sourceHandle && targetHandle) {
        inputData[targetHandle] = sourceData[sourceHandle]
      } else {
        // 기본적으로 전체 데이터 사용
        inputData.data = sourceData
      }
    }
  })

  return inputData
}

// 노드 실행 함수
async function executeNode(node: CustomNode, inputData: Record<string, any>, apiKey: string): Promise<any> {
  const { type, parameters } = node.data

  // AI 노드 실행 시도
  const aiNodeDef = getAINodeDefinition(type)
  if (aiNodeDef) {
    // AI 노드 정의가 있는 경우
    return await aiNodeDef.execute(inputData, { ...parameters, apiKey })
  }

  // 기존 노드 타입 처리
  switch (type) {
    case "input":
      return executeInputNode(parameters, inputData)

    case "process":
      return executeProcessNode(parameters, inputData)

    case "llm":
      return executeLLMNode(parameters, inputData, apiKey)

    case "tool":
      return executeToolNode(parameters, inputData, apiKey)

    case "output":
      return executeOutputNode(parameters, inputData)

    default:
      throw new Error(`지원되지 않는 노드 타입: ${type}`)
  }
}

// 입력 노드 실행
function executeInputNode(parameters: any, inputData: Record<string, any>): any {
  const { inputType, inputValue, url, method } = parameters

  // 입력 타입에 따라 처리
  switch (inputType) {
    case "text":
      return inputValue || ""

    case "json":
      try {
        return JSON.parse(inputValue || "{}")
      } catch (error) {
        throw new Error("유효하지 않은 JSON 형식입니다.")
      }

    case "api":
      // 실제 구현에서는 API 호출 로직 구현
      // 여기서는 시뮬레이션만 수행
      return {
        url,
        method,
        message: "API 입력 노드가 실행되었습니다. 실제 API 호출은 구현되지 않았습니다.",
      }

    default:
      return inputValue || ""
  }
}

// 처리 노드 실행
function executeProcessNode(parameters: any, inputData: Record<string, any>): any {
  const { processType, transformFunction, filterCondition } = parameters
  const data = inputData.data || {}

  // 처리 타입에 따라 처리
  switch (processType) {
    case "transform":
      // 변환 함수가 제공된 경우
      if (transformFunction) {
        try {
          // 문자열로 된 함수를 실행 가능한 함수로 변환
          const transformFn = new Function("data", `return (${transformFunction})(data)`)
          return transformFn(data)
        } catch (error) {
          throw new Error("변환 함수 실행 중 오류가 발생했습니다.")
        }
      }
      return data

    case "filter":
      // 필터 조건이 제공된 경우
      if (filterCondition && Array.isArray(data)) {
        try {
          // 문자열로 된 필터 조건을 실행 가능한 함수로 변환
          const filterFn = new Function("item", `return (${filterCondition})(item)`)
          return data.filter((item: any) => filterFn(item))
        } catch (error) {
          throw new Error("필터 조건 실행 중 오류가 발생했습니다.")
        }
      }
      return data

    default:
      return data
  }
}

// LLM 노드 실행
async function executeLLMNode(parameters: any, inputData: Record<string, any>, apiKey: string): Promise<any> {
  const { model, prompt, temperature = 0.7 } = parameters
  const inputText = typeof inputData.data === "string" ? inputData.data : JSON.stringify(inputData.data)

  // 프롬프트 템플릿 처리
  const processedPrompt = prompt ? prompt.replace(/\{input\}/g, inputText) : inputText

  // 모델 선택에 따라 API 엔드포인트 결정
  let modelId
  switch (model) {
    case "gemini-1.5-flash":
      modelId = "gemini-1.5-flash"
      break
    case "gemini-1.5-pro":
      modelId = "gemini-1.5-pro"
      break
    case "gemini-pro":
      modelId = "gemini-pro"
      break
    case "gemini-pro-vision":
      modelId = "gemini-pro-vision"
      break
    default:
      modelId = "gemini-1.5-flash"
  }

  try {
    // Gemini API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
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
                  text: processedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("LLM API 오류:", errorData)
      throw new Error(`LLM API 오류: ${errorData.error?.message || "알 수 없는 오류"}`)
    }

    const data = await response.json()

    // 응답에서 텍스트 추출
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const textParts = data.candidates[0].content.parts.filter((part: any) => part.text).map((part: any) => part.text)

      return textParts.join("\n")
    }

    return "LLM에서 응답을 받았지만 텍스트가 없습니다."
  } catch (error: any) {
    console.error("LLM 노드 실행 오류:", error)
    throw new Error(`LLM 실행 오류: ${error.message}`)
  }
}

// 도구 노드 실행
async function executeToolNode(parameters: any, inputData: Record<string, any>, apiKey: string): Promise<any> {
  const { toolType, query, code } = parameters
  const inputText = typeof inputData.data === "string" ? inputData.data : JSON.stringify(inputData.data)

  switch (toolType) {
    case "search":
      // 검색 도구 시뮬레이션
      return {
        query: query || inputText,
        results: [
          { title: "검색 결과 1", snippet: "이것은 시뮬레이션된 검색 결과입니다." },
          { title: "검색 결과 2", snippet: "실제 검색 기능은 구현되지 않았습니다." },
        ],
      }

    case "code":
      // 코드 실행 시뮬레이션
      const codeToExecute = code || inputText
      return {
        code: codeToExecute,
        result: "코드 실행 결과가 여기에 표시됩니다. (시뮬레이션)",
      }

    default:
      return {
        message: "지원되지 않는 도구 타입입니다.",
      }
  }
}

// 출력 노드 실행
function executeOutputNode(parameters: any, inputData: Record<string, any>): any {
  // 출력 노드는 단순히 입력 데이터를 그대로 반환
  return inputData.data || {}
}
