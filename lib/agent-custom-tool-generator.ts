// 커스텀 툴 생성기 - 마더 에이전트가 사용
import { getLLMService } from "./llm-service"
import type { AgentTool, ToolParameter, TestResult } from "./agent-tool-system"

export interface CustomToolRequest {
  purpose: string
  agentType: string
  agentDescription: string
  requiredFeatures: string[]
  integrationNeeds: string[]
}

export interface CustomToolGenerationResult {
  success: boolean
  tool?: AgentTool
  error?: string
  generationSteps: GenerationStep[]
}

export interface GenerationStep {
  step: number
  name: string
  status: "pending" | "running" | "completed" | "failed"
  description: string
  result?: any
  error?: string
  timestamp: Date
}

export class CustomToolGenerator {
  private llmService: any
  private generationSteps: GenerationStep[] = []

  constructor(apiKey: string) {
    this.llmService = getLLMService(apiKey)
  }

  async generateCustomTool(request: CustomToolRequest): Promise<CustomToolGenerationResult> {
    this.generationSteps = []

    try {
      // 1단계: 요구사항 분석
      await this.addStep(1, "요구사항 분석", "에이전트 목적과 필요 기능을 분석합니다")
      const analysis = await this.analyzeRequirements(request)
      await this.completeStep(1, analysis)

      // 2단계: 툴 설계
      await this.addStep(2, "툴 설계", "커스텀 툴의 구조와 인터페이스를 설계합니다")
      const design = await this.designTool(analysis)
      await this.completeStep(2, design)

      // 3단계: 코드 생성
      await this.addStep(3, "코드 생성", "실제 실행 가능한 툴 코드를 생성합니다")
      const code = await this.generateToolCode(design)
      await this.completeStep(3, { codeLength: code.length })

      // 4단계: 툴 객체 생성
      await this.addStep(4, "툴 객체 생성", "생성된 코드를 툴 객체로 변환합니다")
      const tool = await this.createToolObject(design, code)
      await this.completeStep(4, { toolId: tool.id })

      // 5단계: 초기 테스트
      await this.addStep(5, "초기 테스트", "생성된 툴의 기본 기능을 테스트합니다")
      const testResult = await this.performInitialTest(tool)
      await this.completeStep(5, testResult)

      if (!testResult.passed) {
        // 6단계: 자동 수정
        await this.addStep(6, "자동 수정", "테스트 실패 시 코드를 자동으로 수정합니다")
        const fixedTool = await this.autoFixTool(tool, testResult)
        await this.completeStep(6, { fixed: true })

        return {
          success: true,
          tool: fixedTool,
          generationSteps: this.generationSteps,
        }
      }

      return {
        success: true,
        tool,
        generationSteps: this.generationSteps,
      }
    } catch (error) {
      await this.failCurrentStep(error.message)
      return {
        success: false,
        error: error.message,
        generationSteps: this.generationSteps,
      }
    }
  }

  private async analyzeRequirements(request: CustomToolRequest) {
    const prompt = `
에이전트 커스텀 툴 요구사항을 분석해주세요:

에이전트 목적: ${request.purpose}
에이전트 타입: ${request.agentType}
에이전트 설명: ${request.agentDescription}
필요 기능: ${request.requiredFeatures.join(", ")}
통합 요구사항: ${request.integrationNeeds.join(", ")}

다음 형식으로 분석 결과를 JSON으로 제공해주세요:
{
  "toolName": "툴 이름",
  "toolCategory": "툴 카테고리",
  "primaryFunction": "주요 기능",
  "requiredParameters": ["필요한 파라미터들"],
  "expectedOutput": "예상 출력 형태",
  "complexityLevel": "low|medium|high",
  "estimatedDevelopmentTime": "예상 개발 시간(분)"
}
`

    const response = await this.llmService.generateText(prompt)
    return this.parseJsonResponse(response)
  }

  private async designTool(analysis: any) {
    const prompt = `
다음 분석 결과를 바탕으로 커스텀 툴을 설계해주세요:

${JSON.stringify(analysis, null, 2)}

다음 형식으로 설계 결과를 JSON으로 제공해주세요:
{
  "toolId": "tool-id",
  "toolName": "툴 이름",
  "description": "툴 설명",
  "category": "카테고리",
  "parameters": [
    {
      "name": "파라미터명",
      "type": "string|number|boolean|object|array",
      "required": true|false,
      "description": "파라미터 설명",
      "default": "기본값(선택사항)",
      "validation": {
        "min": 최소값,
        "max": 최대값,
        "pattern": "정규식",
        "enum": ["허용값들"]
      }
    }
  ],
  "returnType": "반환 타입",
  "dependencies": ["필요한 의존성들"],
  "apiEndpoints": ["사용할 API 엔드포인트들"]
}
`

    const response = await this.llmService.generateText(prompt)
    return this.parseJsonResponse(response)
  }

  private async generateToolCode(design: any): Promise<string> {
    const prompt = `
다음 설계를 바탕으로 실행 가능한 TypeScript 코드를 생성해주세요:

${JSON.stringify(design, null, 2)}

다음 요구사항을 만족하는 코드를 작성해주세요:
1. async/await 패턴 사용
2. 에러 핸들링 포함
3. 타입 안전성 보장
4. 실행 시간 측정
5. 결과 검증 로직

코드만 반환해주세요 (설명 없이):
`

    const response = await this.llmService.generateText(prompt)
    return this.cleanCodeResponse(response)
  }

  private async createToolObject(design: any, code: string): Promise<AgentTool> {
    // 동적으로 함수 생성
    const executeFunction = new Function(
      "params",
      `
      return (async function() {
        const startTime = Date.now();
        try {
          ${code}
        } catch (error) {
          return {
            success: false,
            error: error.message,
            executionTime: Date.now() - startTime
          };
        }
      })();
    `,
    )

    const testFunction = async (): Promise<TestResult> => {
      // 기본 테스트 케이스 생성
      const testParams = this.generateTestParameters(design.parameters)
      const result = await executeFunction(testParams)

      return {
        passed: result.success,
        errors: result.success ? [] : [result.error || "Unknown error"],
        warnings: [],
        performance: {
          averageTime: result.executionTime,
          maxTime: result.executionTime,
          minTime: result.executionTime,
        },
      }
    }

    return {
      id: design.toolId,
      name: design.toolName,
      type: "custom",
      category: design.category,
      description: design.description,
      version: "1.0.0",
      parameters: design.parameters,
      dependencies: design.dependencies || [],
      execute: executeFunction,
      test: testFunction,
    }
  }

  private async performInitialTest(tool: AgentTool): Promise<TestResult> {
    try {
      return await tool.test()
    } catch (error) {
      return {
        passed: false,
        errors: [error.message],
        warnings: [],
        performance: {
          averageTime: 0,
          maxTime: 0,
          minTime: 0,
        },
      }
    }
  }

  private async autoFixTool(tool: AgentTool, testResult: TestResult): Promise<AgentTool> {
    const prompt = `
다음 툴에서 테스트 오류가 발생했습니다. 코드를 수정해주세요:

툴 정보:
- 이름: ${tool.name}
- 설명: ${tool.description}
- 파라미터: ${JSON.stringify(tool.parameters)}

테스트 오류:
${testResult.errors.join("\n")}

수정된 실행 코드만 반환해주세요:
`

    const response = await this.llmService.generateText(prompt)
    const fixedCode = this.cleanCodeResponse(response)

    // 수정된 코드로 새 실행 함수 생성
    const fixedExecuteFunction = new Function(
      "params",
      `
      return (async function() {
        const startTime = Date.now();
        try {
          ${fixedCode}
        } catch (error) {
          return {
            success: false,
            error: error.message,
            executionTime: Date.now() - startTime
          };
        }
      })();
    `,
    )

    return {
      ...tool,
      execute: fixedExecuteFunction,
      version: "1.0.1", // 버전 업데이트
    }
  }

  private generateTestParameters(parameters: ToolParameter[]): any {
    const testParams: any = {}

    for (const param of parameters) {
      if (param.required) {
        switch (param.type) {
          case "string":
            testParams[param.name] = param.default || "test"
            break
          case "number":
            testParams[param.name] = param.default || 1
            break
          case "boolean":
            testParams[param.name] = param.default || true
            break
          case "array":
            testParams[param.name] = param.default || []
            break
          case "object":
            testParams[param.name] = param.default || {}
            break
        }
      }
    }

    return testParams
  }

  private parseJsonResponse(response: string): any {
    try {
      // JSON 부분만 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error("JSON 형식을 찾을 수 없습니다")
    } catch (error) {
      throw new Error(`JSON 파싱 오류: ${error.message}`)
    }
  }

  private cleanCodeResponse(response: string): string {
    // 코드 블록에서 실제 코드만 추출
    const codeMatch = response.match(/```(?:typescript|javascript)?\n?([\s\S]*?)\n?```/)
    if (codeMatch) {
      return codeMatch[1].trim()
    }
    return response.trim()
  }

  private async addStep(step: number, name: string, description: string) {
    this.generationSteps.push({
      step,
      name,
      status: "running",
      description,
      timestamp: new Date(),
    })
  }

  private async completeStep(step: number, result: any) {
    const stepIndex = this.generationSteps.findIndex((s) => s.step === step)
    if (stepIndex !== -1) {
      this.generationSteps[stepIndex].status = "completed"
      this.generationSteps[stepIndex].result = result
    }
  }

  private async failCurrentStep(error: string) {
    const runningStep = this.generationSteps.find((s) => s.status === "running")
    if (runningStep) {
      runningStep.status = "failed"
      runningStep.error = error
    }
  }

  getGenerationSteps(): GenerationStep[] {
    return this.generationSteps
  }
}
