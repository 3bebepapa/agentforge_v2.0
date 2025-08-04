import { JsonParserService } from "./json-parser-service"
import { SessionManager } from "./session-manager"

export interface SavedFile {
  id: string
  name: string
  type: string
  content: string
  createdAt: number
  sessionId?: string
  metadata?: Record<string, any>
}

export class FileManager {
  private static instance: FileManager
  private storageKey = "agentforge_saved_files"
  private componentsKey = "agentforge_components"
  private workflowsKey = "agentforge_workflows"
  private tasksKey = "agentforge_tasks"
  private retryCount = 3 // 저장 재시도 횟수
  private jsonParser: JsonParserService
  private sessionManager: SessionManager

  private constructor() {
    // 스토리지 초기화
    this.initializeStorage()
    this.jsonParser = JsonParserService.getInstance()
    this.sessionManager = SessionManager.getInstance()
  }

  private initializeStorage() {
    // 저장소 초기화
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }
    if (!localStorage.getItem(this.componentsKey)) {
      localStorage.setItem(this.componentsKey, JSON.stringify([]))
    }
    if (!localStorage.getItem(this.workflowsKey)) {
      localStorage.setItem(this.workflowsKey, JSON.stringify([]))
    }
    if (!localStorage.getItem(this.tasksKey)) {
      localStorage.setItem(this.tasksKey, JSON.stringify([]))
    }
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager()
    }
    return FileManager.instance
  }

  public saveFile(name: string, type: string, content: string, metadata?: Record<string, any>): SavedFile {
    const files = this.getAllFiles()

    // 현재 세션 ID 가져오기
    const sessionId = this.sessionManager.getCurrentSessionId()

    const newFile: SavedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      type,
      content,
      createdAt: Date.now(),
      sessionId,
      metadata,
    }

    files.push(newFile)

    try {
      localStorage.setItem(this.storageKey, this.jsonParser.safelyStringifyJson(files))
    } catch (error) {
      console.error("파일 저장 중 오류:", error)
      // 내용 크기 줄이기 시도
      if (content.length > 10000) {
        newFile.content = content.substring(0, 10000) + "... (내용이 너무 커서 잘렸습니다)"
        files[files.length - 1] = newFile
        localStorage.setItem(this.storageKey, this.jsonParser.safelyStringifyJson(files))
      }
    }

    return newFile
  }

  public getAllFiles(): SavedFile[] {
    const filesJson = localStorage.getItem(this.storageKey)
    if (!filesJson) return []

    try {
      return this.jsonParser.safelyParseJson(filesJson)
    } catch (error) {
      console.error("파일 목록을 불러오는 중 오류가 발생했습니다:", error)
      return []
    }
  }

  public getFileById(id: string): SavedFile | null {
    const files = this.getAllFiles()
    return files.find((file) => file.id === id) || null
  }

  public deleteFile(id: string): boolean {
    const files = this.getAllFiles()
    const filteredFiles = files.filter((file) => file.id !== id)

    if (filteredFiles.length === files.length) {
      return false // 파일을 찾지 못함
    }

    localStorage.setItem(this.storageKey, this.jsonParser.safelyStringifyJson(filteredFiles))
    return true
  }

  public updateFile(id: string, updates: Partial<Omit<SavedFile, "id" | "createdAt">>): SavedFile | null {
    const files = this.getAllFiles()
    const fileIndex = files.findIndex((file) => file.id === id)

    if (fileIndex === -1) {
      return null // 파일을 찾지 못함
    }

    const updatedFile = {
      ...files[fileIndex],
      ...updates,
    }

    files[fileIndex] = updatedFile
    localStorage.setItem(this.storageKey, this.jsonParser.safelyStringifyJson(files))

    return updatedFile
  }

  // 현재 세션의 파일만 가져오기
  public getCurrentSessionFiles(): SavedFile[] {
    const allFiles = this.getAllFiles()
    const currentSessionId = this.sessionManager.getCurrentSessionId()
    return allFiles.filter((file) => file.sessionId === currentSessionId)
  }

  // 태스크 결과 저장 (개선된 버전)
  public saveTaskResult(taskPlan: any): string {
    if (!taskPlan) {
      console.error("유효하지 않은 태스크 계획: null 또는 undefined")
      throw new Error("유효하지 않은 태스크 계획")
    }

    try {
      // 태스크 ID 확인
      if (!taskPlan.id) {
        taskPlan.id = `task_${Math.random().toString(36).substring(2, 10)}`
      }

      // 현재 세션 ID 추가
      taskPlan.sessionId = this.sessionManager.getCurrentSessionId()

      console.log("태스크 저장 시작:", taskPlan.id)

      // 파일명 생성
      const filename = `task_${taskPlan.id}.json`

      // 저장 전 태스크 데이터 정리
      const cleanTaskPlan = this.cleanTaskPlanForStorage(taskPlan)

      // 저장 시도 (재시도 로직 포함)
      return this.saveWithRetry(filename, cleanTaskPlan, this.tasksKey, "태스크")
    } catch (error) {
      console.error("태스크 저장 중 오류:", error)
      throw error
    }
  }

  // 재시도 로직이 포함된 저장 함수
  private saveWithRetry(filename: string, data: any, listKey: string, itemType: string): string {
    let attempts = 0
    let lastError: any = null

    while (attempts < this.retryCount) {
      try {
        attempts++
        console.log(`${itemType} 저장 시도 ${attempts}/${this.retryCount}`)

        // 데이터 직렬화
        let content: string
        try {
          content = this.jsonParser.safelyStringifyJson(data)
        } catch (jsonError) {
          console.error(`${itemType} JSON 직렬화 오류:`, jsonError)

          // 순환 참조 제거 시도
          const safeData = this.removeCyclicReferences(data)
          content = JSON.stringify(safeData, null, 2)
        }

        try {
          // 로컬 스토리지에 저장
          localStorage.setItem(filename, content)
        } catch (storageError) {
          // 스토리지 용량 초과 시 데이터 크기 줄이기
          console.warn("스토리지 저장 실패, 데이터 크기 줄이기 시도:", storageError)

          if (content.length > 500000) {
            // 매우 큰 데이터인 경우 더 적극적으로 줄이기
            const reducedData = this.aggressivelyReduceDataSize(data)
            content = JSON.stringify(reducedData, null, 2)
          } else {
            // 일반적인 크기 줄이기
            const reducedData = this.reduceDataSize(data)
            content = JSON.stringify(reducedData, null, 2)
          }

          localStorage.setItem(filename, content)
        }

        // 저장된 목록 업데이트
        this.updateSavedItemsList(filename, data, listKey)

        console.log(`${itemType} 저장 완료:`, filename)
        return filename
      } catch (error) {
        lastError = error
        console.error(`${itemType} 저장 시도 ${attempts} 실패:`, error)

        // 데이터 크기 줄이기
        if (attempts < this.retryCount) {
          console.log(`${itemType} 데이터 크기 줄이기 시도`)
          data = this.aggressivelyReduceDataSize(data)
        }
      }
    }

    // 모든 시도 실패 후 오류 기록
    console.error(`${itemType} 저장 실패 (${this.retryCount}회 시도 후):`, lastError)
    throw new Error(`${itemType} 저장 실패: ${lastError?.message || "알 수 없는 오류"}`)
  }

  // 저장된 항목 목록 업데이트
  private updateSavedItemsList(filename: string, item: any, listKey: string) {
    try {
      const listJson = localStorage.getItem(listKey)
      const list = listJson ? this.jsonParser.safelyParseJson(listJson) : []

      // 현재 세션 ID 가져오기
      const sessionId = this.sessionManager.getCurrentSessionId()

      // 이미 있는 항목인지 확인
      const existingIndex = list.findIndex((i: any) => i.filename === filename || (item.id && i.id === item.id))

      if (existingIndex >= 0) {
        // 기존 항목 업데이트
        list[existingIndex] = {
          filename,
          id: item.id,
          name: item.name || "이름 없음",
          type: item.type || "unknown",
          description: item.description || "설명 없음",
          sessionId,
          updatedAt: Date.now(),
        }
      } else {
        // 새 항목 추가
        list.push({
          filename,
          id: item.id,
          name: item.name || "이름 없음",
          type: item.type || "unknown",
          description: item.description || "설명 없음",
          sessionId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      // 목록 저장
      localStorage.setItem(listKey, this.jsonParser.safelyStringifyJson(list))
    } catch (error) {
      console.error(`저장된 항목 목록 업데이트 중 오류:`, error)
      // 실패해도 계속 진행 (비치명적 오류)
    }
  }

  // 순환 참조 제거
  private removeCyclicReferences(obj: any, seen = new WeakMap()): any {
    // 기본 타입이거나 null인 경우 그대로 반환
    if (obj === null || typeof obj !== "object") return obj

    // 이미 처리한 객체인 경우 참조 정보만 반환
    if (seen.has(obj)) {
      return { $ref: "cyclic reference" }
    }

    // 현재 객체 기록
    seen.set(obj, true)

    // 배열인 경우
    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeCyclicReferences(item, seen))
    }

    // 객체인 경우
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      // 함수는 제외
      if (typeof value !== "function") {
        result[key] = this.removeCyclicReferences(value, seen)
      }
    }

    return result
  }

  // 데이터 크기 줄이기
  private reduceDataSize(data: any): any {
    if (!data) return data

    // 객체가 아닌 경우 그대로 반환
    if (typeof data !== "object") return data

    // 배열인 경우
    if (Array.isArray(data)) {
      // 배열이 너무 크면 일부만 유지
      if (data.length > 50) {
        return data.slice(0, 50).concat([{ $truncated: `${data.length - 50}개 항목이 생략됨` }])
      }
      return data.map((item) => this.reduceDataSize(item))
    }

    // 객체인 경우
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      // 큰 문자열 줄이기
      if (typeof value === "string" && value.length > 1000) {
        result[key] = value.substring(0, 1000) + "... (생략됨)"
      }
      // 함수 제외
      else if (typeof value !== "function") {
        result[key] = this.reduceDataSize(value)
      }
    }

    return result
  }

  // 더 적극적인 데이터 크기 줄이기 메서드
  private aggressivelyReduceDataSize(data: any): any {
    if (!data) return data

    // 객체가 아닌 경우 그대로 반환
    if (typeof data !== "object") return data

    // 배열인 경우
    if (Array.isArray(data)) {
      // 배열이 너무 크면 일부만 유지 (더 적극적으로)
      if (data.length > 20) {
        return data.slice(0, 20).concat([{ $truncated: `${data.length - 20}개 항목이 생략됨` }])
      }
      return data.map((item) => this.aggressivelyReduceDataSize(item))
    }

    // 객체인 경우
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      // 큰 문자열 줄이기 (더 적극적으로)
      if (typeof value === "string" && value.length > 500) {
        result[key] = value.substring(0, 500) + "... (생략됨)"
      }
      // 함수 제외
      else if (typeof value !== "function") {
        // 중요하지 않은 필드 제외
        if (!["code", "implementation", "rawContent", "fullText", "originalResponse"].includes(key)) {
          result[key] = this.aggressivelyReduceDataSize(value)
        } else {
          // 중요하지 않은 큰 필드는 요약 정보만 저장
          result[key] = typeof value === "string" ? `(생략됨: ${value.length}자)` : "(생략된 콘텐츠)"
        }
      }
    }

    return result
  }

  // 태스크 데이터 정리 메서드
  private cleanTaskPlanForStorage(taskPlan: any): any {
    // 깊은 복사를 통해 원본 데이터 보존
    const cleanPlan = JSON.parse(JSON.stringify(this.removeCyclicReferences(taskPlan)))

    // 필수 필드 확인 및 기본값 설정
    if (!cleanPlan.description) {
      cleanPlan.description = `태스크 ${new Date().toLocaleTimeString()}`
    }

    if (!cleanPlan.createdAt) {
      cleanPlan.createdAt = new Date().toISOString()
    }

    if (!cleanPlan.updatedAt) {
      cleanPlan.updatedAt = new Date().toISOString()
    }

    if (!cleanPlan.status) {
      cleanPlan.status = "completed"
    }

    if (!cleanPlan.context) {
      cleanPlan.context = {}
    }

    // 태스크 배열 확인
    if (!Array.isArray(cleanPlan.tasks)) {
      cleanPlan.tasks = []
    }

    return cleanPlan
  }

  // 현재 세션의 태스크만 가져오기
  public getCurrentSessionTasks(): any[] {
    const allTasks = this.getAllTasks()
    const currentSessionId = this.sessionManager.getCurrentSessionId()
    return allTasks.filter((task) => task.sessionId === currentSessionId)
  }

  // 태스크 목록 가져오기
  public getAllTasks(): any[] {
    try {
      const listJson = localStorage.getItem(this.tasksKey)
      return listJson ? this.jsonParser.safelyParseJson(listJson) : []
    } catch (error) {
      console.error("태스크 목록 로드 중 오류:", error)
      return []
    }
  }

  // 태스크 로드 메서드
  public loadTask(id: string): any {
    try {
      // 태스크 목록에서 파일명 찾기
      const tasks = this.getAllTasks()
      const task = tasks.find((t) => t.id === id)

      if (!task) {
        console.error(`ID가 ${id}인 태스크를 찾을 수 없습니다.`)
        return null
      }

      // 파일 로드
      const fileContent = localStorage.getItem(task.filename)
      if (!fileContent) {
        console.error(`태스크 파일을 찾을 수 없습니다: ${task.filename}`)
        return null
      }

      return this.jsonParser.safelyParseJson(fileContent)
    } catch (error) {
      console.error(`태스크 로드 중 오류 (ID: ${id}):`, error)
      return null
    }
  }

  // 샘플 태스크 생성 (테스트용)
  public createSampleTasks(): void {
    const sampleTasks = [
      {
        id: "task_sample_1",
        description: "HTTP 요청 처리 및 응답 변환 컴포넌트",
        status: "completed",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        context: {
          userRequest: "HTTP 요청을 처리하고 응답을 변환하는 컴포넌트를 만들어줘",
        },
        tasks: [
          {
            id: "subtask_1",
            name: "요청 처리 모듈 설계",
            status: "completed",
          },
          {
            id: "subtask_2",
            name: "응답 변환 모듈 구현",
            status: "completed",
          },
          {
            id: "subtask_3",
            name: "에러 처리 로직 추가",
            status: "completed",
          },
        ],
        result: {
          componentId: "comp_http_handler",
          componentSpec: {
            name: "HttpRequestHandler",
            type: "integration",
            description: "HTTP 요청을 수신하고 처리하며, 응답을 변환하는 컴포넌트",
          },
        },
      },
      {
        id: "task_sample_2",
        description: "자바스크립트로 버튼 생성 컴포넌트",
        status: "completed",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        context: {
          userRequest: "자바스크립트를 사용하여 버튼을 만드는 작업 계획",
        },
        tasks: [
          {
            id: "subtask_1",
            name: "버튼 UI 디자인",
            status: "completed",
          },
          {
            id: "subtask_2",
            name: "클릭 이벤트 처리",
            status: "completed",
          },
        ],
        result: {
          componentId: "comp_button_creator",
          componentSpec: {
            name: "ButtonCreator",
            type: "ui",
            description: "HTML 페이지에 버튼을 추가하고 자바스크립트 이벤트 리스너를 추가하는 에이전트",
          },
        },
      },
    ]

    // 샘플 태스크 저장
    sampleTasks.forEach((task) => {
      try {
        this.saveTaskResult(task)
      } catch (error) {
        console.error("샘플 태스크 저장 중 오류:", error)
      }
    })

    console.log("샘플 태스크가 생성되었습니다.")
  }

  // 컴포넌트 저장 메서드
  public saveComponent(component: any): string {
    if (!component) {
      console.error("유효하지 않은 컴포넌트: null 또는 undefined")
      throw new Error("유효하지 않은 컴포넌트")
    }

    try {
      // 컴포넌트 ID 확인
      if (!component.id) {
        component.id = `comp_${Math.random().toString(36).substring(2, 10)}`
      }

      // 현재 세션 ID 추가
      component.sessionId = this.sessionManager.getCurrentSessionId()

      console.log("컴포넌트 저장 시작:", component.id)

      // 파일명 생성
      const filename = `component_${component.id}.json`

      // 저장 시도 (재시도 로직 포함)
      return this.saveWithRetry(filename, component, this.componentsKey, "컴포넌트")
    } catch (error) {
      console.error("컴포넌트 저장 중 오류:", error)
      throw error
    }
  }

  // 컴포넌트 목록 가져오기
  public getAllComponents(): any[] {
    try {
      const listJson = localStorage.getItem(this.componentsKey)
      return listJson ? this.jsonParser.safelyParseJson(listJson) : []
    } catch (error) {
      console.error("컴포넌트 목록 로드 중 오류:", error)
      return []
    }
  }

  // 현재 세션의 컴포넌트만 가져오기
  public getCurrentSessionComponents(): any[] {
    const allComponents = this.getAllComponents()
    const currentSessionId = this.sessionManager.getCurrentSessionId()
    return allComponents.filter((component) => component.sessionId === currentSessionId)
  }

  // 컴포넌트 로드 메서드
  public loadComponent(id: string): any {
    try {
      // 컴포넌트 목록에서 파일명 찾기
      const components = this.getAllComponents()
      const component = components.find((c) => c.id === id)

      if (!component) {
        console.error(`ID가 ${id}인 컴포넌트를 찾을 수 없습니다.`)
        return null
      }

      // 파일 로드
      const fileContent = localStorage.getItem(component.filename)
      if (!fileContent) {
        console.error(`컴포넌트 파일을 찾을 수 없습니다: ${component.filename}`)
        return null
      }

      return this.jsonParser.safelyParseJson(fileContent)
    } catch (error) {
      console.error(`컴포넌트 로드 중 오류 (ID: ${id}):`, error)
      return null
    }
  }

  // 워크플로우 저장 메서드
  public saveWorkflow(workflow: any): string {
    if (!workflow) {
      console.error("유효하지 않은 워크플로우: null 또는 undefined")
      throw new Error("유효하지 않은 워크플로우")
    }

    try {
      // 워크플로우 ID 확인
      if (!workflow.id) {
        workflow.id = `workflow_${Math.random().toString(36).substring(2, 10)}`
      }

      // 현재 세션 ID 추가
      workflow.sessionId = this.sessionManager.getCurrentSessionId()

      console.log("워크플로우 저장 시작:", workflow.id)

      // 파일명 생성
      const filename = `workflow_${workflow.id}.json`

      // 저장 시도 (재시도 로직 포함)
      return this.saveWithRetry(filename, workflow, this.workflowsKey, "워크플로우")
    } catch (error) {
      console.error("워크플로우 저장 중 오류:", error)
      throw error
    }
  }

  // 워크플로우 목록 가져오기
  public getAllWorkflows(): any[] {
    try {
      const listJson = localStorage.getItem(this.workflowsKey)
      return listJson ? this.jsonParser.safelyParseJson(listJson) : []
    } catch (error) {
      console.error("워크플로우 목록 로드 중 오류:", error)
      return []
    }
  }

  // 현재 세션의 워크플로우만 가져오기
  public getCurrentSessionWorkflows(): any[] {
    const allWorkflows = this.getAllWorkflows()
    const currentSessionId = this.sessionManager.getCurrentSessionId()
    return allWorkflows.filter((workflow) => workflow.sessionId === currentSessionId)
  }

  // 워크플로우 로드 메서드
  public loadWorkflow(id: string): any {
    try {
      // 워크플로우 목록에서 파일명 찾기
      const workflows = this.getAllWorkflows()
      const workflow = workflows.find((w) => w.id === id)

      if (!workflow) {
        console.error(`ID가 ${id}인 워크플로우를 찾을 수 없습니다.`)
        return null
      }

      // 파일 로드
      const fileContent = localStorage.getItem(workflow.filename)
      if (!fileContent) {
        console.error(`워크플로우 파일을 찾을 수 없습니다: ${workflow.filename}`)
        return null
      }

      return this.jsonParser.safelyParseJson(fileContent)
    } catch (error) {
      console.error(`워크플로우 로드 중 오류 (ID: ${id}):`, error)
      return null
    }
  }
}
