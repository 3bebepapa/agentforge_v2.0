// 에이전트 통합 테스트 시스템
import type { AgentTool, ToolResult } from "./agent-tool-system"

export interface IntegrationTestSuite {
  id: string
  name: string
  description: string
  tools: AgentTool[]
  testScenarios: TestScenario[]
  dependencies: string[]
}

export interface TestScenario {
  id: string
  name: string
  description: string
  steps: TestStep[]
  expectedOutcome: string
  priority: "low" | "medium" | "high" | "critical"
}

export interface TestStep {
  toolId: string
  parameters: any
  expectedResult?: any
  timeout?: number
}

export interface IntegrationTestResult {
  suiteId: string
  passed: boolean
  totalScenarios: number
  passedScenarios: number
  failedScenarios: number
  scenarioResults: ScenarioResult[]
  overallPerformance: {
    totalTime: number
    averageTime: number
    slowestScenario: string
    fastestScenario: string
  }
  recommendations: string[]
}

export interface ScenarioResult {
  scenarioId: string
  passed: boolean
  executionTime: number
  stepResults: StepResult[]
  error?: string
}

export interface StepResult {
  toolId: string
  passed: boolean
  executionTime: number
  result?: ToolResult
  error?: string
}

export class AgentIntegrationTester {
  private testSuites: Map<string, IntegrationTestSuite> = new Map()

  // 통합 테스트 스위트 생성
  createTestSuite(tools: AgentTool[], agentPurpose: string): IntegrationTestSuite {
    const suiteId = `suite-${Date.now()}`

    const testSuite: IntegrationTestSuite = {
      id: suiteId,
      name: `${agentPurpose} 통합 테스트`,
      description: `${agentPurpose} 에이전트의 모든 툴 통합 테스트`,
      tools,
      testScenarios: this.generateTestScenarios(tools, agentPurpose),
      dependencies: this.extractDependencies(tools),
    }

    this.testSuites.set(suiteId, testSuite)
    return testSuite
  }

  // 통합 테스트 실행
  async runIntegrationTest(suiteId: string): Promise<IntegrationTestResult> {
    const testSuite = this.testSuites.get(suiteId)
    if (!testSuite) {
      throw new Error(`테스트 스위트를 찾을 수 없습니다: ${suiteId}`)
    }

    const startTime = Date.now()
    const scenarioResults: ScenarioResult[] = []

    // 각 시나리오 실행
    for (const scenario of testSuite.testScenarios) {
      const scenarioResult = await this.runTestScenario(scenario, testSuite.tools)
      scenarioResults.push(scenarioResult)
    }

    const totalTime = Date.now() - startTime
    const passedScenarios = scenarioResults.filter((r) => r.passed).length
    const failedScenarios = scenarioResults.length - passedScenarios

    // 성능 분석
    const executionTimes = scenarioResults.map((r) => ({ id: r.scenarioId, time: r.executionTime }))
    const slowest = executionTimes.reduce((a, b) => (a.time > b.time ? a : b))
    const fastest = executionTimes.reduce((a, b) => (a.time < b.time ? a : b))

    return {
      suiteId,
      passed: failedScenarios === 0,
      totalScenarios: scenarioResults.length,
      passedScenarios,
      failedScenarios,
      scenarioResults,
      overallPerformance: {
        totalTime,
        averageTime: totalTime / scenarioResults.length,
        slowestScenario: slowest.id,
        fastestScenario: fastest.id,
      },
      recommendations: this.generateRecommendations(scenarioResults, testSuite),
    }
  }

  // 개별 시나리오 실행
  private async runTestScenario(scenario: TestScenario, tools: AgentTool[]): Promise<ScenarioResult> {
    const startTime = Date.now()
    const stepResults: StepResult[] = []
    let scenarioPassed = true
    let scenarioError: string | undefined

    try {
      // 각 스텝 순차 실행
      for (const step of scenario.steps) {
        const stepResult = await this.runTestStep(step, tools)
        stepResults.push(stepResult)

        if (!stepResult.passed) {
          scenarioPassed = false
          if (!scenarioError) {
            scenarioError = `Step ${step.toolId} failed: ${stepResult.error}`
          }
        }
      }
    } catch (error) {
      scenarioPassed = false
      scenarioError = error.message
    }

    return {
      scenarioId: scenario.id,
      passed: scenarioPassed,
      executionTime: Date.now() - startTime,
      stepResults,
      error: scenarioError,
    }
  }

  // 개별 스텝 실행
  private async runTestStep(step: TestStep, tools: AgentTool[]): Promise<StepResult> {
    const startTime = Date.now()

    try {
      const tool = tools.find((t) => t.id === step.toolId)
      if (!tool) {
        throw new Error(`툴을 찾을 수 없습니다: ${step.toolId}`)
      }

      // 타임아웃 설정
      const timeout = step.timeout || 30000 // 기본 30초
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("실행 시간 초과")), timeout)
      })

      const result = (await Promise.race([tool.execute(step.parameters), timeoutPromise])) as ToolResult

      // 예상 결과와 비교 (있는 경우)
      if (step.expectedResult && !this.compareResults(result.data, step.expectedResult)) {
        throw new Error("예상 결과와 다릅니다")
      }

      return {
        toolId: step.toolId,
        passed: result.success,
        executionTime: Date.now() - startTime,
        result,
        error: result.success ? undefined : result.error,
      }
    } catch (error) {
      return {
        toolId: step.toolId,
        passed: false,
        executionTime: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  // 테스트 시나리오 자동 생성
  private generateTestScenarios(tools: AgentTool[], agentPurpose: string): TestScenario[] {
    const scenarios: TestScenario[] = []

    // 1. 개별 툴 테스트 시나리오
    tools.forEach((tool, index) => {
      scenarios.push({
        id: `individual-${tool.id}`,
        name: `${tool.name} 개별 테스트`,
        description: `${tool.name} 툴의 기본 기능을 테스트합니다`,
        priority: "high",
        expectedOutcome: `${tool.name} 툴이 정상적으로 실행되어야 합니다`,
        steps: [
          {
            toolId: tool.id,
            parameters: this.generateTestParameters(tool.parameters),
            timeout: 10000,
          },
        ],
      })
    })

    // 2. 툴 체인 테스트 시나리오 (연관된 툴들)
    const chainScenarios = this.generateChainScenarios(tools, agentPurpose)
    scenarios.push(...chainScenarios)

    // 3. 스트레스 테스트 시나리오
    if (tools.length > 0) {
      scenarios.push({
        id: "stress-test",
        name: "스트레스 테스트",
        description: "모든 툴을 동시에 실행하여 안정성을 테스트합니다",
        priority: "medium",
        expectedOutcome: "모든 툴이 동시 실행되어도 안정적으로 작동해야 합니다",
        steps: tools.map((tool) => ({
          toolId: tool.id,
          parameters: this.generateTestParameters(tool.parameters),
          timeout: 15000,
        })),
      })
    }

    // 4. 에러 핸들링 테스트 시나리오
    scenarios.push({
      id: "error-handling",
      name: "에러 핸들링 테스트",
      description: "잘못된 파라미터로 툴 실행 시 적절한 에러 처리를 테스트합니다",
      priority: "high",
      expectedOutcome: "잘못된 입력에 대해 적절한 에러 메시지를 반환해야 합니다",
      steps: tools.map((tool) => ({
        toolId: tool.id,
        parameters: this.generateInvalidParameters(tool.parameters),
        timeout: 5000,
      })),
    })

    return scenarios
  }

  // 툴 체인 시나리오 생성
  private generateChainScenarios(tools: AgentTool[], agentPurpose: string): TestScenario[] {
    const scenarios: TestScenario[] = []

    // 검색 → 분석 체인
    const searchTool = tools.find((t) => t.category === "search")
    const analysisTool = tools.find((t) => t.category === "media" && t.name.includes("분석"))

    if (searchTool && analysisTool) {
      scenarios.push({
        id: "search-analysis-chain",
        name: "검색-분석 체인 테스트",
        description: "검색 결과를 분석 툴로 처리하는 워크플로우를 테스트합니다",
        priority: "high",
        expectedOutcome: "검색된 데이터가 분석 툴로 성공적으로 전달되어 처리되어야 합니다",
        steps: [
          {
            toolId: searchTool.id,
            parameters: { query: "test data", num: 5 },
            timeout: 10000,
          },
          {
            toolId: analysisTool.id,
            parameters: this.generateTestParameters(analysisTool.parameters),
            timeout: 15000,
          },
        ],
      })
    }

    // 이미지 생성 → 분석 체인
    const imageGenTool = tools.find((t) => t.name.includes("이미지 생성"))
    const imageAnalysisTool = tools.find((t) => t.name.includes("이미지 분석"))

    if (imageGenTool && imageAnalysisTool) {
      scenarios.push({
        id: "image-gen-analysis-chain",
        name: "이미지 생성-분석 체인 테스트",
        description: "생성된 이미지를 분석하는 워크플로우를 테스트합니다",
        priority: "medium",
        expectedOutcome: "생성된 이미지가 분석 툴로 성공적으로 처리되어야 합니다",
        steps: [
          {
            toolId: imageGenTool.id,
            parameters: { prompt: "test image", size: "512x512" },
            timeout: 20000,
          },
          {
            toolId: imageAnalysisTool.id,
            parameters: { imageUrl: "generated_image_url", features: ["LABEL_DETECTION"] },
            timeout: 15000,
          },
        ],
      })
    }

    return scenarios
  }

  // 테스트 파라미터 생성
  private generateTestParameters(parameters: any[]): any {
    const testParams: any = {}

    for (const param of parameters) {
      switch (param.type) {
        case "string":
          testParams[param.name] = param.default || "test"
          break
        case "number":
          testParams[param.name] = param.default || 1
          break
        case "boolean":
          testParams[param.name] = param.default !== undefined ? param.default : true
          break
        case "array":
          testParams[param.name] = param.default || ["test"]
          break
        case "object":
          testParams[param.name] = param.default || { test: "value" }
          break
      }
    }

    return testParams
  }

  // 잘못된 파라미터 생성 (에러 테스트용)
  private generateInvalidParameters(parameters: any[]): any {
    const invalidParams: any = {}

    for (const param of parameters) {
      if (param.required) {
        switch (param.type) {
          case "string":
            invalidParams[param.name] = null // null 값으로 에러 유발
            break
          case "number":
            invalidParams[param.name] = "invalid_number" // 문자열로 에러 유발
            break
          case "boolean":
            invalidParams[param.name] = "invalid_boolean"
            break
          case "array":
            invalidParams[param.name] = "not_an_array"
            break
          case "object":
            invalidParams[param.name] = "not_an_object"
            break
        }
      }
    }

    return invalidParams
  }

  // 의존성 추출
  private extractDependencies(tools: AgentTool[]): string[] {
    const dependencies = new Set<string>()

    tools.forEach((tool) => {
      if (tool.dependencies) {
        tool.dependencies.forEach((dep) => dependencies.add(dep))
      }
    })

    return Array.from(dependencies)
  }

  // 결과 비교
  private compareResults(actual: any, expected: any): boolean {
    // 간단한 깊은 비교 (실제로는 더 정교한 비교 로직 필요)
    return JSON.stringify(actual) === JSON.stringify(expected)
  }

  // 개선 권장사항 생성
  private generateRecommendations(results: ScenarioResult[], testSuite: IntegrationTestSuite): string[] {
    const recommendations: string[] = []

    const failedScenarios = results.filter((r) => !r.passed)
    const slowScenarios = results.filter((r) => r.executionTime > 10000) // 10초 이상

    if (failedScenarios.length > 0) {
      recommendations.push(
        `${failedScenarios.length}개의 시나리오가 실패했습니다. 에러 로그를 확인하고 수정이 필요합니다.`,
      )
    }

    if (slowScenarios.length > 0) {
      recommendations.push(`${slowScenarios.length}개의 시나리오가 느리게 실행됩니다. 성능 최적화를 고려해보세요.`)
    }

    const errorPatterns = this.analyzeErrorPatterns(failedScenarios)
    if (errorPatterns.length > 0) {
      recommendations.push(`공통 오류 패턴: ${errorPatterns.join(", ")}`)
    }

    if (results.length > 0 && failedScenarios.length === 0) {
      recommendations.push("모든 테스트가 통과했습니다! 에이전트가 프로덕션 준비 상태입니다.")
    }

    return recommendations
  }

  // 에러 패턴 분석
  private analyzeErrorPatterns(failedScenarios: ScenarioResult[]): string[] {
    const errorCounts = new Map<string, number>()

    failedScenarios.forEach((scenario) => {
      scenario.stepResults.forEach((step) => {
        if (step.error) {
          const errorType = this.categorizeError(step.error)
          errorCounts.set(errorType, (errorCounts.get(errorType) || 0) + 1)
        }
      })
    })

    return Array.from(errorCounts.entries())
      .filter(([_, count]) => count > 1) // 2번 이상 발생한 에러만
      .map(([error, count]) => `${error} (${count}회)`)
  }

  // 에러 분류
  private categorizeError(error: string): string {
    if (error.includes("timeout") || error.includes("시간 초과")) {
      return "타임아웃 오류"
    } else if (error.includes("API") || error.includes("키")) {
      return "API 연결 오류"
    } else if (error.includes("parameter") || error.includes("파라미터")) {
      return "파라미터 오류"
    } else if (error.includes("network") || error.includes("네트워크")) {
      return "네트워크 오류"
    } else {
      return "기타 오류"
    }
  }

  // 테스트 스위트 조회
  getTestSuite(suiteId: string): IntegrationTestSuite | undefined {
    return this.testSuites.get(suiteId)
  }

  // 모든 테스트 스위트 조회
  getAllTestSuites(): IntegrationTestSuite[] {
    return Array.from(this.testSuites.values())
  }
}
