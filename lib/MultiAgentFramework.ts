// Multi-Agent Framework for coordinating multiple AI agents

export interface MultiAgent {
  id: string
  name: string
  role: string
  capabilities: string[]
  status: "idle" | "active" | "busy" | "error"
  performance: {
    tasksCompleted: number
    successRate: number
    averageResponseTime: number
  }
}

export interface AgentTask {
  id: string
  agentId: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed" | "failed"
  createdAt: Date
  completedAt?: Date
  result?: any
  error?: string
}

export class MultiAgentFramework {
  private agents: Map<string, MultiAgent> = new Map()
  private tasks: Map<string, AgentTask> = new Map()
  private taskQueue: AgentTask[] = []

  constructor() {
    this.initializeDefaultAgents()
  }

  private initializeDefaultAgents(): void {
    // Initialize default agents
    const defaultAgents: MultiAgent[] = [
      {
        id: "agent-1",
        name: "Research Agent",
        role: "researcher",
        capabilities: ["web-search", "data-analysis", "summarization"],
        status: "idle",
        performance: {
          tasksCompleted: 0,
          successRate: 100,
          averageResponseTime: 0,
        },
      },
      {
        id: "agent-2",
        name: "Code Agent",
        role: "developer",
        capabilities: ["code-generation", "code-review", "debugging"],
        status: "idle",
        performance: {
          tasksCompleted: 0,
          successRate: 100,
          averageResponseTime: 0,
        },
      },
      {
        id: "agent-3",
        name: "Planning Agent",
        role: "planner",
        capabilities: ["task-planning", "workflow-design", "optimization"],
        status: "idle",
        performance: {
          tasksCompleted: 0,
          successRate: 100,
          averageResponseTime: 0,
        },
      },
    ]

    defaultAgents.forEach((agent) => this.agents.set(agent.id, agent))
  }

  addAgent(agent: MultiAgent): void {
    this.agents.set(agent.id, agent)
  }

  getAgent(id: string): MultiAgent | undefined {
    return this.agents.get(id)
  }

  getAllAgents(): MultiAgent[] {
    return Array.from(this.agents.values())
  }

  removeAgent(id: string): boolean {
    return this.agents.delete(id)
  }

  async assignTask(task: Omit<AgentTask, "id" | "status" | "createdAt">): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTask: AgentTask = {
      ...task,
      id: taskId,
      status: "pending",
      createdAt: new Date(),
    }

    this.tasks.set(taskId, newTask)
    this.taskQueue.push(newTask)

    // Start processing if agent is available
    this.processNextTask()

    return taskId
  }

  private async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) return

    // Sort by priority
    this.taskQueue.sort((a, b) => {
      const priorityWeight = { low: 1, medium: 2, high: 3 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })

    const task = this.taskQueue[0]
    const agent = this.agents.get(task.agentId)

    if (!agent || agent.status !== "idle") return

    // Start task execution
    this.taskQueue.shift()
    task.status = "in-progress"
    agent.status = "active"

    try {
      const startTime = Date.now()

      // Simulate task execution
      const result = await this.executeTask(task, agent)

      const endTime = Date.now()
      const responseTime = endTime - startTime

      task.status = "completed"
      task.completedAt = new Date()
      task.result = result

      // Update agent performance
      agent.performance.tasksCompleted++
      agent.performance.averageResponseTime =
        (agent.performance.averageResponseTime * (agent.performance.tasksCompleted - 1) + responseTime) /
        agent.performance.tasksCompleted
      agent.status = "idle"

      // Process next task
      this.processNextTask()
    } catch (error) {
      task.status = "failed"
      task.error = error instanceof Error ? error.message : String(error)
      agent.status = "error"

      // Update success rate
      const totalTasks = agent.performance.tasksCompleted + 1
      agent.performance.successRate = (agent.performance.successRate * agent.performance.tasksCompleted) / totalTasks
    }
  }

  private async executeTask(task: AgentTask, agent: MultiAgent): Promise<any> {
    // Simulate task execution based on agent role
    console.log(`Agent ${agent.name} executing task: ${task.description}`)

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      taskId: task.id,
      agentId: agent.id,
      result: `Task completed by ${agent.name}`,
      timestamp: new Date().toISOString(),
    }
  }

  getTask(id: string): AgentTask | undefined {
    return this.tasks.get(id)
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
  }

  getTasksByAgent(agentId: string): AgentTask[] {
    return Array.from(this.tasks.values()).filter((task) => task.agentId === agentId)
  }

  getTaskQueue(): AgentTask[] {
    return [...this.taskQueue]
  }

  updateAgentStatus(agentId: string, status: MultiAgent["status"]): boolean {
    const agent = this.agents.get(agentId)
    if (!agent) return false

    agent.status = status
    return true
  }
}

// Singleton instance
let frameworkInstance: MultiAgentFramework | null = null

export function getMultiAgentFramework(): MultiAgentFramework {
  if (!frameworkInstance) {
    frameworkInstance = new MultiAgentFramework()
  }
  return frameworkInstance
}
