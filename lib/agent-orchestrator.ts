import { v4 as uuidv4 } from "uuid"
import { getLLMService } from "./llm-service"

// 작업 상태 정의
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed"

// 작업 정의
export interface Task {
  id: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  result?: any
  error?: string
  subtasks?: Task[]
  parentId?: string
}

// 작업 계획 정의
export interface TaskPlan {
  id: string
  description: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
  status: TaskStatus
  context: Record<string, any>
}

// 에이전트 오케스트레이터 클래스
export class AgentOrchestrator {
  private apiKey: string
  private taskPlans: Map<string, TaskPlan>
  private activeAgents: Map<string, any>
  private componentRegistry: Map<string, any>
  private workflowRegistry: Map<string, any>

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.taskPlans = new Map()
    this.activeAgents = new Map()
    this.componentRegistry = new Map()
    this.workflowRegistry = new Map()
  }

  // 작업 계획 생성
  async createTaskPlan(userRequest: string): Promise<string> {
    try {
      const llmService = getLLMService(this.apiKey)

      // LLM을 사용하여 작업 계획 생성
      const prompt = `
사용자 요청: "${userRequest}"

위 요청을 처리하기 위한 단계별 작업 계획을 생성해주세요. 각 단계는 명확하고 실행 가능해야 합니다.
작업 계획은 반드시 다음 JSON 형식으로만 반환해주세요:

{
  "description": "전체 작업 계획 설명",
  "tasks": [
    {
      "description": "작업 1 설명",
      "subtasks": [
        {"description": "하위 작업 1.1 설명"},
        {"description": "하위 작업 1.2 설명"}
      ]
    },
    {"description": "작업 2 설명"},
    {"description": "작업 3 설명"}
  ]
}

중요: 모든 속성명은 반드시 큰따옴표(")로 감싸주세요. 작은따옴표(')는 사용하지 마세요.
중요: 반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트나 설명은 포함하지 마세요.
`

      const response = await llmService.generateText(prompt)
      let taskPlanData

      try {
        // JSON 추출 시도 - 응답에서 JSON 부분만 추출
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : response
        taskPlanData = this.parseJsonSafely(jsonStr)
      } catch (error) {
        console.error("작업 계획 파싱 오류:", error)

        // 파싱 실패 시 기본 작업 계획 생성
        taskPlanData = {
          description: `"${userRequest}" 요청에 대한 작업 계획`,
          tasks: [
            {
              description: "요청 분석 및 이해",
              subtasks: [{ description: "요청 내용 파악" }, { description: "필요한 정보 식별" }],
            },
            {
              description: "필요한 리소스 식별",
              subtasks: [],
            },
            {
              description: "요청 처리 및 결과 생성",
              subtasks: [],
            },
          ],
        }
      }

      // 작업 계획 생성
      const taskPlan: TaskPlan = {
        id: uuidv4(),
        description: taskPlanData.description || `"${userRequest}" 요청에 대한 작업 계획`,
        tasks: this.createTasksFromPlan(taskPlanData.tasks || []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "pending",
        context: {
          userRequest,
          originalPlan: taskPlanData,
        },
      }

      this.taskPlans.set(taskPlan.id, taskPlan)
      return taskPlan.id
    } catch (error) {
      console.error("작업 계획 생성 오류:", error)
      throw error
    }
  }

  // 작업 계획 데이터로부터 작업 객체 생성
  private createTasksFromPlan(taskData: any[]): Task[] {
    if (!Array.isArray(taskData)) {
      // 배열이 아닌 경우 빈 배열 반환
      return []
    }

    return taskData.map((data) => {
      // 데이터가 문자열인 경우 파싱 시도
      if (typeof data === "string") {
        try {
          data = this.parseJsonSafely(data)
        } catch (error) {
          // 파싱 실패 시 기본 객체 생성
          data = { description: data }
        }
      }

      const task: Task = {
        id: uuidv4(),
        description: data.description || "작업",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (data.subtasks && Array.isArray(data.subtasks)) {
        const subtasks = this.createTasksFromPlan(data.subtasks)
        task.subtasks = subtasks

        // 부모 ID 설정
        subtasks.forEach((subtask) => {
          subtask.parentId = task.id
        })
      }

      return task
    })
  }

  // 작업 계획 실행
  async executeTaskPlan(taskPlanId: string): Promise<TaskPlan> {
    const taskPlan = this.taskPlans.get(taskPlanId)
    if (!taskPlan) {
      throw new Error(`작업 계획을 찾을 수 없음: ${taskPlanId}`)
    }

    // 작업 계획 상태 업데이트
    taskPlan.status = "in_progress"
    taskPlan.updatedAt = new Date().toISOString()

    try {
      // 최상위 작업 순차 실행
      for (const task of taskPlan.tasks) {
        await this.executeTask(task, taskPlan.context)
      }

      // 작업 계획 완료 처리
      taskPlan.status = "completed"
      taskPlan.updatedAt = new Date().toISOString()
    } catch (error) {
      // 작업 계획 실패 처리
      taskPlan.status = "failed"
      taskPlan.updatedAt = new Date().toISOString()
      taskPlan.context.error = error.message

      console.error("작업 계획 실행 오류:", error)
    }

    return taskPlan
  }

  // 개별 작업 실행
  private async executeTask(task: Task, context: Record<string, any>): Promise<void> {
    // 작업 상태 업데이트
    task.status = "in_progress"
    task.updatedAt = new Date().toISOString()

    try {
      // 하위 작업이 있는 경우 먼저 실행
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtask of task.subtasks) {
          await this.executeTask(subtask, context)
        }
      } else {
        // 실제 작업 실행 로직
        const result = await this.performTaskAction(task, context)
        task.result = result
      }

      // 작업 완료 처리
      task.status = "completed"
      task.updatedAt = new Date().toISOString()
    } catch (error) {
      // 작업 실패 처리
      task.status = "failed"
      task.error = error.message
      task.updatedAt = new Date().toISOString()

      throw error
    }
  }

  // 작업 실행 로직
  private async performTaskAction(task: Task, context: Record<string, any>): Promise<any> {
    const llmService = getLLMService(this.apiKey)

    // 작업 유형 분석
    const taskType = await this.analyzeTaskType(task.description)

    switch (taskType) {
      case "component_creation":
        return this.handleComponentCreation(task, context, llmService)

      case "workflow_creation":
        return this.handleWorkflowCreation(task, context, llmService)

      case "data_processing":
        return this.handleDataProcessing(task, context, llmService)

      case "integration":
        return this.handleIntegration(task, context, llmService)

      case "analysis":
        return this.handleAnalysis(task, context, llmService)

      default:
        // 기본 작업 처리 - LLM에 위임
        const prompt = `
작업: ${task.description}
컨텍스트: ${JSON.stringify(context)}

위 작업을 수행하고 결과를 JSON 형식으로 반환해주세요:
{
"result": "작업 결과",
"explanation": "결과에 대한 설명"
}

JSON 형식으로만 응답해주세요.
`

        const response = await llmService.generateText(prompt)
        try {
          // JSON 추출 시도
          const jsonMatch = response.match(/\{[\s\S]*\}/)
          const jsonStr = jsonMatch ? jsonMatch[0] : response
          return JSON.parse(jsonStr)
        } catch (error) {
          return { result: response }
        }
    }
  }

  // 작업 유형 분석
  private async analyzeTaskType(description: string): Promise<string> {
    const llmService = getLLMService(this.apiKey)

    const prompt = `
작업 설명: "${description}"

위 작업의 유형을 다음 중에서 선택해주세요:
- component_creation: 컴포넌트 생성 작업
- workflow_creation: 워크플로우 생성 작업
- data_processing: 데이터 처리 작업
- integration: 외부 시스템 통합 작업
- analysis: 데이터 분석 작업
- other: 기타 작업

작업 유형만 반환해주세요.
`

    const response = await llmService.generateText(prompt)
    return response.trim().toLowerCase().split("\n")[0]
  }

  // 컴포넌트 생성 처리
  private async handleComponentCreation(task: Task, context: Record<string, any>, llmService: any): Promise<any> {
    const prompt = `
작업: ${task.description}
컨텍스트: ${JSON.stringify(context)}

위 작업에 필요한 컴포넌트 명세를 JSON 형식으로 생성해주세요:
{
  "name": "컴포넌트 이름",
  "type": "컴포넌트 유형(agent, data, integration, logic, utility 중 하나)",
  "description": "컴포넌트 설명",
  "features": ["기능1", "기능2", "기능3", ...],
  "code": "JavaScript 클래스 코드"
}

중요: 모든 속성명은 반드시 큰따옴표(")로 감싸주세요. 작은따옴표(')는 사용하지 마세요.
코드는 export default를 사용하는 완전한 JavaScript 클래스여야 합니다.
JSON 형식으로만 응답해주세요.
`

    const response = await llmService.generateText(prompt)

    try {
      // JSON 추출 및 안전 파싱
      const jsonString = response.match(/\{[\s\S]*\}/) ? response.match(/\{[\s\S]*\}/)[0] : response
      const componentSpec = this.parseJsonSafely(jsonString)

      // 컴포넌트 레지스트리에 등록
      const componentId = uuidv4()
      this.componentRegistry.set(componentId, {
        id: componentId,
        ...componentSpec,
        createdAt: new Date().toISOString(),
      })

      return {
        componentId,
        componentSpec,
      }
    } catch (error) {
      throw new Error(`컴포넌트 명세 생성 오류: ${error.message}`)
    }
  }

  // 워크플로우 생성 처리
  private async handleWorkflowCreation(task: Task, context: Record<string, any>, llmService: any): Promise<any> {
    // 사용 가능한 컴포넌트 목록 생성
    const availableComponents = Array.from(this.componentRegistry.values()).map((comp) => ({
      id: comp.id,
      name: comp.name,
      type: comp.type,
      description: comp.description,
    }))

    const prompt = `
작업: ${task.description}
컨텍스트: ${JSON.stringify(context)}
사용 가능한 컴포넌트: ${JSON.stringify(availableComponents)}

위 작업에 필요한 워크플로우 명세를 JSON 형식으로 생성해주세요:
{
  "name": "워크플로우 이름",
  "description": "워크플로우 설명",
  "type": "sequential" 또는 "parallel" 또는 "conditional",
  "steps": [
    {
      "name": "단계 이름",
      "type": "단계 유형",
      "componentId": "사용할 컴포넌트 ID",
      "config": { "단계별": "설정" }
    }
  ]
}

중요: 모든 속성명은 반드시 큰따옴표(")로 감싸주세요. 작은따옴표(')는 사용하지 마세요.
JSON 형식으로만 응답해주세요.
`

    const response = await llmService.generateText(prompt)

    try {
      // JSON 추출 및 안전 파싱
      const jsonString = response.match(/\{[\s\S]*\}/) ? response.match(/\{[\s\S]*\}/)[0] : response
      const workflowSpec = this.parseJsonSafely(jsonString)

      // 워크플로우 레지스트리에 등록
      const workflowId = uuidv4()
      this.workflowRegistry.set(workflowId, {
        id: workflowId,
        ...workflowSpec,
        createdAt: new Date().toISOString(),
        status: "active",
      })

      return {
        workflowId,
        workflowSpec,
      }
    } catch (error) {
      throw new Error(`워크플로우 명세 생성 오류: ${error.message}`)
    }
  }

  // 데이터 처리 작업 처리
  private async handleDataProcessing(task: Task, context: Record<string, any>, llmService: any): Promise<any> {
    const prompt = `
작업: ${task.description}
컨텍스트: ${JSON.stringify(context)}

위 작업에 필요한 데이터 처리 로직을 설명하고, 처리 결과를 JSON 형식으로 반환해주세요:
{
  "processDescription": "데이터 처리 방법 설명",
  "result": "처리 결과"
}

중요: 모든 속성명은 반드시 큰따옴표(")로 감싸주세요. 작은따옴표(')는 사용하지 마세요.
JSON 형식으로만 응답해주세요.
`

    const response = await llmService.generateText(prompt)

    try {
      // JSON 추출 및 안전 파싱
      const jsonString = response.match(/\{[\s\S]*\}/) ? response.match(/\{[\s\S]*\}/)[0] : response
      return this.parseJsonSafely(jsonString)
    } catch (error) {
      throw new Error(`데이터 처리 오류: ${error.message}`)
    }
  }

  // 통합 작업 처리
  private async handleIntegration(task: Task, context: Record<string, any>, llmService: any): Promise<any> {
    const prompt = `
작업: ${task.description}
컨텍스트: ${JSON.stringify(context)}

위 작업에 필요한 통합 설정을 JSON 형식으로 생성해주세요:
{
  "integrationType": "통합 유형(database, api, messaging 등)",
  "config": {
    // 통합 설정
  },
  "testResult": "통합 테스트 결과 시뮬레이션"
}

중요: 모든 속성명은 반드시 큰따옴표(")로 감싸주세요. 작은따옴표(')는 사용하지 마세요.
JSON 형식으로만 응답해주세요.
`

    const response = await llmService.generateText(prompt)

    try {
      // JsonSafeParser를 사용하여 안전하게 JSON 파싱
      const jsonString = response.match(/\{[\s\S]*\}/) ? response.match(/\{[\s\S]*\}/)[0] : response
      return this.parseJsonSafely(jsonString)
    } catch (error) {
      throw new Error(`통합 설정 오류: ${error.message}`)
    }
  }

  // 새로운 메서드 추가: JSON을 안전하게 파싱하는 함수
  private parseJsonSafely(jsonString: string): any {
    try {
      // 먼저 일반 파싱 시도
      return JSON.parse(jsonString)
    } catch (error) {
      console.warn("JSON 파싱 오류 감지, 자동 수정 시도 중...", error)

      // 1. 작은따옴표를 큰따옴표로 변환
      let fixedJson = jsonString.replace(/'/g, '"')

      // 2. 객체 키에 따옴표 추가
      fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3')

      // 3. 후행 쉼표 제거
      fixedJson = fixedJson.replace(/,(\s*[\]}])/g, "$1")

      try {
        // 수정된 JSON 파싱
        return JSON.parse(fixedJson)
      } catch (secondError) {
        console.error("JSON 수정 실패:", secondError)
        throw new Error(`JSON 파싱 실패: ${error.message}`)
      }
    }
  }

  // 분석 작업 처리
  private async handleAnalysis(task: Task, context: Record<string, any>, llmService: any): Promise<any> {
    const prompt = `
작업: ${task.description}
컨텍스트: ${JSON.stringify(context)}

위 작업에 필요한 데이터 분석을 수행하고, 분석 결과를 JSON 형식으로 반환해주세요:
{
  "analysisMethod": "분석 방법 설명",
  "findings": [
    "발견 1",
    "발견 2"
  ],
  "recommendations": [
    "추천 1",
    "추천 2"
  ]
}

중요: 모든 속성명은 반드시 큰따옴표(")로 감싸주세요. 작은따옴표(')는 사용하지 마세요.
JSON 형식으로만 응답해주세요.
`

    const response = await llmService.generateText(prompt)

    try {
      // JSON 추출 및 안전 파싱
      const jsonString = response.match(/\{[\s\S]*\}/) ? response.match(/\{[\s\S]*\}/)[0] : response
      return this.parseJsonSafely(jsonString)
    } catch (error) {
      throw new Error(`분석 오류: ${error.message}`)
    }
  }

  // 작업 계획 조회
  getTaskPlan(taskPlanId: string): TaskPlan | undefined {
    return this.taskPlans.get(taskPlanId)
  }

  // 모든 작업 계획 조회
  getAllTaskPlans(): TaskPlan[] {
    return Array.from(this.taskPlans.values())
  }

  // 컴포넌트 조회
  getComponent(componentId: string): any {
    return this.componentRegistry.get(componentId)
  }

  // 모든 컴포넌트 조회
  getAllComponents(): any[] {
    return Array.from(this.componentRegistry.values())
  }

  // 워크플로우 조회
  getWorkflow(workflowId: string): any {
    return this.workflowRegistry.get(workflowId)
  }

  // 모든 워크플로우 조회
  getAllWorkflows(): any[] {
    return Array.from(this.workflowRegistry.values())
  }
}
