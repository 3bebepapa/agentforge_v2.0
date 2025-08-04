/**
 * Reflex 스타일 데이터베이스 시스템
 * SQLAlchemy와 유사한 ORM 패턴 구현
 */

// 데이터베이스 모델 베이스 클래스
export abstract class BaseModel {
  id: string
  createdAt: Date
  updatedAt: Date

  constructor() {
    this.id = `${this.constructor.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  // 모델을 JSON으로 직렬화
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      ...this.getFields(),
    }
  }

  // 하위 클래스에서 구현해야 하는 필드 반환 메서드
  protected abstract getFields(): Record<string, any>

  // 모델 업데이트
  update(fields: Partial<this>): void {
    Object.assign(this, fields)
    this.updatedAt = new Date()
  }
}

// 사용자 모델
export class UserModel extends BaseModel {
  apiKey: string
  preferences: {
    theme: "light" | "dark"
    language: "ko" | "en"
    autoSave: boolean
  }
  sessionId: string

  constructor(data: Partial<UserModel> = {}) {
    super()
    this.apiKey = data.apiKey || ""
    this.preferences = data.preferences || {
      theme: "light",
      language: "ko",
      autoSave: true,
    }
    this.sessionId = data.sessionId || `session_${Date.now()}`
  }

  protected getFields(): Record<string, any> {
    return {
      apiKey: this.apiKey,
      preferences: this.preferences,
      sessionId: this.sessionId,
    }
  }
}

// 에이전트 모델
export class AgentModel extends BaseModel {
  name: string
  type: string
  description: string
  prompt: string
  tools: string[]
  status: "idle" | "running" | "completed" | "failed"
  config: Record<string, any>
  userId: string

  constructor(data: Partial<AgentModel> = {}) {
    super()
    this.name = data.name || ""
    this.type = data.type || "general"
    this.description = data.description || ""
    this.prompt = data.prompt || ""
    this.tools = data.tools || []
    this.status = data.status || "idle"
    this.config = data.config || {}
    this.userId = data.userId || ""
  }

  protected getFields(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      description: this.description,
      prompt: this.prompt,
      tools: this.tools,
      status: this.status,
      config: this.config,
      userId: this.userId,
    }
  }
}

// 워크플로우 모델
export class WorkflowModel extends BaseModel {
  name: string
  description: string
  nodes: any[]
  edges: any[]
  status: "draft" | "active" | "paused"
  userId: string

  constructor(data: Partial<WorkflowModel> = {}) {
    super()
    this.name = data.name || ""
    this.description = data.description || ""
    this.nodes = data.nodes || []
    this.edges = data.edges || []
    this.status = data.status || "draft"
    this.userId = data.userId || ""
  }

  protected getFields(): Record<string, any> {
    return {
      name: this.name,
      description: this.description,
      nodes: this.nodes,
      edges: this.edges,
      status: this.status,
      userId: this.userId,
    }
  }
}

// 코드 프로젝트 모델
export class CodeProjectModel extends BaseModel {
  name: string
  description: string
  files: CodeFileModel[]
  userId: string

  constructor(data: Partial<CodeProjectModel> = {}) {
    super()
    this.name = data.name || ""
    this.description = data.description || ""
    this.files = data.files || []
    this.userId = data.userId || ""
  }

  protected getFields(): Record<string, any> {
    return {
      name: this.name,
      description: this.description,
      files: this.files.map((f) => f.toJSON()),
      userId: this.userId,
    }
  }
}

// 코드 파일 모델
export class CodeFileModel extends BaseModel {
  name: string
  path: string
  content: string
  language: string
  projectId: string

  constructor(data: Partial<CodeFileModel> = {}) {
    super()
    this.name = data.name || ""
    this.path = data.path || ""
    this.content = data.content || ""
    this.language = data.language || "typescript"
    this.projectId = data.projectId || ""
  }

  protected getFields(): Record<string, any> {
    return {
      name: this.name,
      path: this.path,
      content: this.content,
      language: this.language,
      projectId: this.projectId,
    }
  }
}

// 데이터베이스 매니저 클래스
export class ReflexDatabaseManager {
  private storage: Map<string, Map<string, BaseModel>> = new Map()
  private indexes: Map<string, Map<string, Set<string>>> = new Map()

  constructor() {
    this.initializeStorage()
    this.loadFromLocalStorage()
  }

  // 스토리지 초기화
  private initializeStorage() {
    this.storage.set("users", new Map())
    this.storage.set("agents", new Map())
    this.storage.set("workflows", new Map())
    this.storage.set("codeProjects", new Map())
    this.storage.set("codeFiles", new Map())

    // 인덱스 초기화
    this.indexes.set("agents_by_user", new Map())
    this.indexes.set("workflows_by_user", new Map())
    this.indexes.set("projects_by_user", new Map())
    this.indexes.set("files_by_project", new Map())
  }

  // localStorage에서 데이터 로드
  private loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem("aiworks_database")
      if (savedData) {
        const data = JSON.parse(savedData)

        // 각 모델 타입별로 데이터 복원
        Object.entries(data).forEach(([tableName, records]) => {
          const table = this.storage.get(tableName)
          if (table) {
            Object.entries(records).forEach(([id, record]) => {
              let model: BaseModel

              switch (tableName) {
                case "users":
                  model = new UserModel(record)
                  break
                case "agents":
                  model = new AgentModel(record)
                  break
                case "workflows":
                  model = new WorkflowModel(record)
                  break
                case "codeProjects":
                  model = new CodeProjectModel(record)
                  break
                case "codeFiles":
                  model = new CodeFileModel(record)
                  break
              }

              model.id = id
              model.createdAt = new Date(record.createdAt)
              model.updatedAt = new Date(record.updatedAt)
              table.set(id, model)
            })
          }
        })

        this.rebuildIndexes()
      }
    } catch (error) {
      console.error("데이터베이스 로드 실패:", error)
    }
  }

  // localStorage에 데이터 저장
  private saveToLocalStorage() {
    try {
      const data: Record<string, Record<string, any>> = {}

      this.storage.forEach((table, tableName) => {
        data[tableName] = {}
        table.forEach((model, id) => {
          data[tableName][id] = model.toJSON()
        })
      })

      localStorage.setItem("aiworks_database", JSON.stringify(data))
    } catch (error) {
      console.error("데이터베이스 저장 실패:", error)
    }
  }

  // 인덱스 재구축
  private rebuildIndexes() {
    // 에이전트 사용자별 인덱스
    const agentsByUser = this.indexes.get("agents_by_user")!
    agentsByUser.clear()
    this.storage.get("agents")!.forEach((agent: AgentModel) => {
      if (!agentsByUser.has(agent.userId)) {
        agentsByUser.set(agent.userId, new Set())
      }
      agentsByUser.get(agent.userId)!.add(agent.id)
    })

    // 워크플로우 사용자별 인덱스
    const workflowsByUser = this.indexes.get("workflows_by_user")!
    workflowsByUser.clear()
    this.storage.get("workflows")!.forEach((workflow: WorkflowModel) => {
      if (!workflowsByUser.has(workflow.userId)) {
        workflowsByUser.set(workflow.userId, new Set())
      }
      workflowsByUser.get(workflow.userId)!.add(workflow.id)
    })

    // 프로젝트 사용자별 인덱스
    const projectsByUser = this.indexes.get("projects_by_user")!
    projectsByUser.clear()
    this.storage.get("codeProjects")!.forEach((project: CodeProjectModel) => {
      if (!projectsByUser.has(project.userId)) {
        projectsByUser.set(project.userId, new Set())
      }
      projectsByUser.get(project.userId)!.add(project.id)
    })

    // 파일 프로젝트별 인덱스
    const filesByProject = this.indexes.get("files_by_project")!
    filesByProject.clear()
    this.storage.get("codeFiles")!.forEach((file: CodeFileModel) => {
      if (!filesByProject.has(file.projectId)) {
        filesByProject.set(file.projectId, new Set())
      }
      filesByProject.get(file.projectId)!.add(file.id)
    })
  }

  // 모델 생성
  create<T extends BaseModel>(tableName: string, model: T): T {
    const table = this.storage.get(tableName)
    if (!table) {
      throw new Error(`테이블 ${tableName}을 찾을 수 없습니다`)
    }

    table.set(model.id, model)
    this.updateIndexes(tableName, model, "create")
    this.saveToLocalStorage()

    return model
  }

  // 모델 조회
  findById<T extends BaseModel>(tableName: string, id: string): T | null {
    const table = this.storage.get(tableName)
    if (!table) return null

    return (table.get(id) as T) || null
  }

  // 모든 모델 조회
  findAll<T extends BaseModel>(tableName: string): T[] {
    const table = this.storage.get(tableName)
    if (!table) return []

    return Array.from(table.values()) as T[]
  }

  // 조건부 조회
  findWhere<T extends BaseModel>(tableName: string, predicate: (model: T) => boolean): T[] {
    const table = this.storage.get(tableName)
    if (!table) return []

    return Array.from(table.values()).filter(predicate) as T[]
  }

  // 사용자별 에이전트 조회
  findAgentsByUser(userId: string): AgentModel[] {
    const agentIds = this.indexes.get("agents_by_user")?.get(userId)
    if (!agentIds) return []

    const agents: AgentModel[] = []
    const agentTable = this.storage.get("agents")!

    agentIds.forEach((id) => {
      const agent = agentTable.get(id) as AgentModel
      if (agent) agents.push(agent)
    })

    return agents
  }

  // 사용자별 워크플로우 조회
  findWorkflowsByUser(userId: string): WorkflowModel[] {
    const workflowIds = this.indexes.get("workflows_by_user")?.get(userId)
    if (!workflowIds) return []

    const workflows: WorkflowModel[] = []
    const workflowTable = this.storage.get("workflows")!

    workflowIds.forEach((id) => {
      const workflow = workflowTable.get(id) as WorkflowModel
      if (workflow) workflows.push(workflow)
    })

    return workflows
  }

  // 프로젝트별 파일 조회
  findFilesByProject(projectId: string): CodeFileModel[] {
    const fileIds = this.indexes.get("files_by_project")?.get(projectId)
    if (!fileIds) return []

    const files: CodeFileModel[] = []
    const fileTable = this.storage.get("codeFiles")!

    fileIds.forEach((id) => {
      const file = fileTable.get(id) as CodeFileModel
      if (file) files.push(file)
    })

    return files
  }

  // 모델 업데이트
  update<T extends BaseModel>(tableName: string, id: string, updates: Partial<T>): T | null {
    const table = this.storage.get(tableName)
    if (!table) return null

    const model = table.get(id) as T
    if (!model) return null

    model.update(updates)
    this.updateIndexes(tableName, model, "update")
    this.saveToLocalStorage()

    return model
  }

  // 모델 삭제
  delete(tableName: string, id: string): boolean {
    const table = this.storage.get(tableName)
    if (!table) return false

    const model = table.get(id)
    if (!model) return false

    table.delete(id)
    this.updateIndexes(tableName, model, "delete")
    this.saveToLocalStorage()

    return true
  }

  // 인덱스 업데이트
  private updateIndexes(tableName: string, model: BaseModel, operation: "create" | "update" | "delete") {
    if (tableName === "agents") {
      const agent = model as AgentModel
      const agentsByUser = this.indexes.get("agents_by_user")!

      if (operation === "delete") {
        agentsByUser.get(agent.userId)?.delete(agent.id)
      } else {
        if (!agentsByUser.has(agent.userId)) {
          agentsByUser.set(agent.userId, new Set())
        }
        agentsByUser.get(agent.userId)!.add(agent.id)
      }
    }

    // 다른 테이블들도 유사하게 처리...
  }

  // 데이터베이스 통계
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {}

    this.storage.forEach((table, tableName) => {
      stats[tableName] = table.size
    })

    return stats
  }

  // 데이터베이스 초기화
  clear(): void {
    this.storage.forEach((table) => table.clear())
    this.indexes.forEach((index) => index.clear())
    localStorage.removeItem("aiworks_database")
  }
}

// 전역 데이터베이스 매니저 인스턴스
let globalDatabaseManager: ReflexDatabaseManager | null = null

export function getGlobalDatabaseManager(): ReflexDatabaseManager {
  if (!globalDatabaseManager) {
    globalDatabaseManager = new ReflexDatabaseManager()
  }
  return globalDatabaseManager
}
