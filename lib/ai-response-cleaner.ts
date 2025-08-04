/**
 * AI 응답 정리 유틸리티
 * AI 응답에서 컴포넌트, 워크플로우 등을 추출하고 정리
 */
export class AiResponseCleaner {
  /**
   * 응답에서 컴포넌트 추출
   * @param response AI 응답
   * @returns 컴포넌트 배열
   */
  static extractComponents(response: any): any[] {
    if (!response) return []

    const components: any[] = []

    try {
      // 객체인 경우
      if (typeof response === "object" && response !== null) {
        // componentSpec이 있는 경우
        if (response.componentSpec) {
          components.push(this.sanitizeComponent(response.componentSpec))
        }

        // componentId와 componentSpec이 있는 경우
        if (response.componentId && response.componentSpec) {
          components.push(
            this.sanitizeComponent({
              id: response.componentId,
              ...response.componentSpec,
            }),
          )
        }

        // 중첩된 객체 탐색
        Object.values(response).forEach((value) => {
          if (typeof value === "object" && value !== null) {
            const nestedComponents = this.extractComponents(value)
            components.push(...nestedComponents)
          }
        })
      }

      // 문자열인 경우 (JSON 파싱 시도)
      if (typeof response === "string") {
        // 피보나치 함수 코드가 포함된 경우 무시
        if (response.includes("function fibonacci")) {
          return []
        }

        try {
          // JSON 문자열 정리 후 파싱
          const cleanedResponse = this.cleanJsonString(response)
          const parsedResponse = JSON.parse(cleanedResponse)
          const nestedComponents = this.extractComponents(parsedResponse)
          components.push(...nestedComponents)
        } catch (error) {
          // JSON 파싱 실패, 컴포넌트 패턴 검색
          const componentPatterns = [
            /"componentSpec"\s*:\s*(\{[\s\S]*?\})/g,
            /"component"\s*:\s*(\{[\s\S]*?\})/g,
            /컴포넌트:\s*(\{[\s\S]*?\})/g,
            /component:\s*(\{[\s\S]*?\})/gi,
          ]

          for (const pattern of componentPatterns) {
            const matches = response.matchAll(pattern)
            for (const match of matches) {
              try {
                const componentData = match[1]
                const cleanedData = this.cleanJsonString(componentData)
                const componentObj = JSON.parse(cleanedData)
                components.push(this.sanitizeComponent(componentObj))
              } catch (e) {
                console.warn("컴포넌트 추출 중 오류:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("컴포넌트 추출 중 오류 발생:", error)
    }

    // 중복 제거
    const uniqueComponents = components.filter(
      (component, index, self) =>
        component &&
        index ===
          self.findIndex(
            (c) =>
              (c && c.id && component.id && c.id === component.id) ||
              (c && c.name && component.name && c.name === component.name),
          ),
    )

    return uniqueComponents
  }

  /**
   * 응답에서 워크플로우 추출
   * @param response AI 응답
   * @returns 워크플로우 배열
   */
  static extractWorkflows(result: any): any[] {
    if (!result) return []

    let workflows: any[] = []

    try {
      // 문자열인 경우 워크플로우 패턴 찾기
      if (typeof result === "string") {
        // 워크플로우 패턴 찾기
        const workflowPatterns = [
          /워크플로우:\s*\{([^}]+)\}/g,
          /workflow:\s*\{([^}]+)\}/gi,
          /워크플로우 단계:\s*\[(.*?)\]/gs,
          /workflow steps:\s*\[(.*?)\]/gis,
          /"workflowSpec"\s*:\s*(\{[\s\S]*?\})/g,
          /"workflow"\s*:\s*(\{[\s\S]*?\})/g,
        ]

        for (const pattern of workflowPatterns) {
          const matches = result.matchAll(pattern)
          for (const match of matches) {
            try {
              // 워크플로우 객체 생성 시도
              const workflowData = match[1]
              const cleanedData = this.cleanJsonString(workflowData)

              try {
                // JSON 파싱 시도
                const parsedWorkflow = JSON.parse(cleanedData)
                workflows.push(this.sanitizeWorkflow(parsedWorkflow))
              } catch (parseError) {
                // 파싱 실패 시 수동 파싱
                const workflowObj = {
                  id: `wf_${Math.random().toString(36).substring(2, 10)}`,
                  name: "추출된 워크플로우",
                  description: "AI 응답에서 추출된 워크플로우",
                  steps: [],
                }

                // 단계 추출 시도
                const stepMatches = workflowData.match(/단계|step|task/gi)
                if (stepMatches) {
                  // 단계가 있는 경우 단계 배열 생성
                  const steps = workflowData
                    .split(/,|\n/)
                    .filter((s) => s.trim())
                    .map((step, index) => {
                      return {
                        id: `step_${index}`,
                        name: step.trim(),
                        description: "",
                      }
                    })

                  if (steps.length > 0) {
                    workflowObj.steps = steps
                    workflows.push(workflowObj)
                  }
                }
              }
            } catch (e) {
              console.warn("워크플로우 추출 중 오류:", e)
            }
          }
        }
      }

      // 객체인 경우 워크플로우 속성 찾기
      if (typeof result === "object" && result !== null) {
        // 직접 워크플로우 객체인 경우
        if (result.steps || result.tasks || result.workflow || result.workflowSteps) {
          const workflowObj = this.sanitizeWorkflow({
            id: result.id || `wf_${Math.random().toString(36).substring(2, 10)}`,
            name: result.name || "추출된 워크플로우",
            description: result.description || "객체에서 추출된 워크플로우",
            steps: [],
          })

          // 단계 배열 찾기
          const steps = result.steps || result.tasks || result.workflow || result.workflowSteps || []
          if (Array.isArray(steps) && steps.length > 0) {
            workflowObj.steps = steps
              .map((step, index) => {
                if (typeof step === "string") {
                  return {
                    id: `step_${index}`,
                    name: step,
                    description: "",
                  }
                } else if (typeof step === "object" && step !== null) {
                  return {
                    id: step.id || `step_${index}`,
                    name: step.name || `단계 ${index + 1}`,
                    description: step.description || "",
                  }
                }
                return null
              })
              .filter(Boolean)

            if (workflowObj.steps.length > 0) {
              workflows.push(workflowObj)
            }
          }
        }

        // 중첩된 객체 검색
        for (const key in result) {
          if (result[key] && typeof result[key] === "object") {
            const nestedWorkflows = this.extractWorkflows(result[key])
            if (nestedWorkflows.length > 0) {
              workflows = [...workflows, ...nestedWorkflows]
            }
          }
        }
      }

      // 워크플로우가 없는 경우 기본 워크플로우 생성
      if (workflows.length === 0 && typeof result === "object" && result !== null) {
        // 태스크 계획에서 기본 워크플로우 생성 시도
        if (result.tasks && Array.isArray(result.tasks) && result.tasks.length > 0) {
          const defaultWorkflow = {
            id: `wf_default_${Math.random().toString(36).substring(2, 10)}`,
            name: "기본 워크플로우",
            description: "태스크 계획에서 생성된 기본 워크플로우",
            steps: result.tasks.map((task: any, index: number) => ({
              id: `step_${index}`,
              name: task.description || `단계 ${index + 1}`,
              description: "",
            })),
          }

          if (defaultWorkflow.steps.length > 0) {
            workflows.push(defaultWorkflow)
          }
        }
      }
    } catch (error) {
      console.error("워크플로우 추출 중 오류:", error)
    }

    // 워크플로우가 없는 경우 기본 워크플로우 생성
    if (workflows.length === 0) {
      workflows.push({
        id: `wf_default_${Math.random().toString(36).substring(2, 10)}`,
        name: "기본 HTTP 워크플로우",
        description: "시스템에서 생성된 기본 HTTP 요청 처리 워크플로우",
        steps: [
          { id: "step_1", name: "요청 수신", description: "HTTP 요청 수신 및 유효성 검증" },
          { id: "step_2", name: "요청 처리", description: "비즈니스 로직 처리" },
          { id: "step_3", name: "응답 변환", description: "응답 데이터 변환" },
          { id: "step_4", name: "응답 반환", description: "HTTP 응답 반환" },
        ],
      })
    }

    return workflows
  }

  /**
   * JSON 문자열 정리
   * @param jsonStr JSON 문자열
   * @returns 정리된 JSON 문자열
   */
  static cleanJsonString(jsonStr: string): string {
    if (!jsonStr) return "{}"

    try {
      // 이스케이프 문자 처리
      let cleaned = jsonStr
        .replace(/\\"/g, '"') // 이스케이프된 따옴표 처리
        .replace(/\\n/g, " ") // 개행 문자 처리
        .replace(/\\t/g, " ") // 탭 문자 처리
        .replace(/\\\\/g, "\\") // 이스케이프된 백슬래시 처리

      // 따옴표 없는 프로퍼티 이름 처리
      cleaned = cleaned.replace(/(\s*)(\w+)(\s*):/g, '$1"$2"$3:')

      // 중첩된 JSON 문자열 처리
      cleaned = cleaned.replace(/"({.*})"/, "$1")
      cleaned = cleaned.replace(/"(\[.*\])"/, "$1")

      // 잘못된 콤마 처리
      cleaned = cleaned.replace(/,\s*}/g, "}")
      cleaned = cleaned.replace(/,\s*\]/g, "]")

      return cleaned
    } catch (error) {
      console.error("JSON 문자열 정리 중 오류:", error)
      return "{}"
    }
  }

  /**
   * 컴포넌트 객체 정리
   * @param component 컴포넌트 객체
   * @returns 정리된 컴포넌트 객체
   */
  static sanitizeComponent(component: any): any {
    if (!component) return null

    try {
      // 기본 ID 생성
      if (!component.id) {
        component.id = `comp_${Math.random().toString(36).substring(2, 10)}`
      }

      // 기본 이름 설정
      if (!component.name) {
        component.name = "이름 없는 컴포넌트"
      }

      // 기본 설명 설정
      if (!component.description) {
        component.description = "설명 없음"
      }

      // 기본 타입 설정
      if (!component.type) {
        component.type = "custom"
      }

      // 기본 기능 배열 설정
      if (!component.features || !Array.isArray(component.features)) {
        component.features = []
      }

      // 코드 필드 정리
      if (component.implementation && !component.code) {
        component.code = component.implementation
      }

      if (!component.code && !component.implementation) {
        component.code = "// 코드 없음"
      }

      return component
    } catch (error) {
      console.error("컴포넌트 정리 중 오류:", error)
      return null
    }
  }

  /**
   * 워크플로우 객체 정리
   * @param workflow 워크플로우 객체
   * @returns 정리된 워크플로우 객체
   */
  static sanitizeWorkflow(workflow: any): any {
    if (!workflow) return null

    try {
      // 기본 ID 생성
      if (!workflow.id) {
        workflow.id = `wf_${Math.random().toString(36).substring(2, 10)}`
      }

      // 기본 이름 설정
      if (!workflow.name) {
        workflow.name = "이름 없는 워크플로우"
      }

      // 기본 설명 설정
      if (!workflow.description) {
        workflow.description = "설명 없음"
      }

      // 기본 단계 배열 설정
      if (!workflow.steps || !Array.isArray(workflow.steps)) {
        workflow.steps = []
      }

      // 단계 정리
      workflow.steps = workflow.steps.map((step: any, index: number) => {
        if (typeof step === "string") {
          return {
            id: `step_${index}`,
            name: step,
            description: "",
          }
        } else if (typeof step === "object" && step !== null) {
          return {
            id: step.id || `step_${index}`,
            name: step.name || `단계 ${index + 1}`,
            description: step.description || "",
          }
        }
        return {
          id: `step_${index}`,
          name: `단계 ${index + 1}`,
          description: "",
        }
      })

      return workflow
    } catch (error) {
      console.error("워크플로우 정리 중 오류:", error)
      return null
    }
  }

  /**
   * 응답에서 피보나치 함수 코드 제거
   * @param response AI 응답
   * @returns 정리된 응답
   */
  static removeFibonacciCode(response: any): any {
    if (!response) return response

    try {
      // 문자열인 경우
      if (typeof response === "string") {
        // 피보나치 함수 코드가 포함된 경우 제거
        if (response.includes("function fibonacci")) {
          return "응답이 정상적으로 처리되지 않았습니다."
        }
        return response
      }

      // 객체인 경우
      if (typeof response === "object" && response !== null) {
        // 배열인 경우
        if (Array.isArray(response)) {
          return response.map((item) => this.removeFibonacciCode(item))
        }

        // 객체인 경우
        const cleanedResponse: Record<string, any> = {}
        for (const [key, value] of Object.entries(response)) {
          cleanedResponse[key] = this.removeFibonacciCode(value)
        }
        return cleanedResponse
      }
    } catch (error) {
      console.error("피보나치 함수 코드 제거 중 오류 발생:", error)
    }

    return response
  }

  /**
   * AI 응답에서 실제 결과 데이터만 추출
   * @param response AI 응답 텍스트
   * @returns 정리된 결과 데이터
   */
  static extractResultData(response: string): any {
    if (!response) return null

    // 설명 텍스트와 JSON 분리
    const parts = response.split(/```json|```/)
    let jsonPart = ""

    // JSON 부분 찾기
    for (const part of parts) {
      if (part.trim().startsWith("{") || part.trim().startsWith("[")) {
        jsonPart = part.trim()
        break
      }
    }

    // JSON 파싱
    try {
      if (jsonPart) {
        const cleanedJson = this.cleanJsonString(jsonPart)
        return JSON.parse(cleanedJson)
      }
    } catch (e) {
      console.error("JSON 파싱 오류:", e)
    }

    // 결과 객체 추출 시도
    try {
      const resultMatch = response.match(/"result"\s*:\s*(\{[\s\S]*?\}|"[^"]*"|\[[^\]]*\])/)
      if (resultMatch && resultMatch[1]) {
        const resultStr = resultMatch[1]

        // 문자열인 경우 따옴표 제거
        if (resultStr.startsWith('"') && resultStr.endsWith('"')) {
          return resultStr.slice(1, -1)
        }

        // 객체나 배열인 경우 파싱
        const cleanedResult = this.cleanJsonString(resultStr)
        return JSON.parse(cleanedResult)
      }
    } catch (e) {
      console.error("결과 추출 오류:", e)
    }

    // 원본 응답 반환
    return response
  }
}
