export interface WorkflowStep {
  id: string
  name: string
  type: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  connections: Array<{
    from: string
    to: string
    condition?: string
  }>
}

export type Workflow = WorkflowDefinition

export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executionHistory: Array<{
    workflowId: string
    executedAt: Date
    status: "success" | "error" | "running"
    result?: any
    error?: string
  }> = []

  async executeWorkflow(workflowId: string, input: any = {}): Promise<any> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const execution = {
      workflowId,
      executedAt: new Date(),
      status: "running" as const,
    }
    this.executionHistory.push(execution)

    try {
      let currentData = input

      // Execute steps in order
      for (const step of workflow.steps) {
        console.log(`Executing step: ${step.name}`)
        currentData = await this.executeStep(step, currentData)
      }

      execution.status = "success"
      execution.result = currentData
      return currentData
    } catch (error) {
      execution.status = "error"
      execution.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  }

  private async executeStep(step: WorkflowStep, input: any): Promise<any> {
    // Simulate step execution based on type
    switch (step.type) {
      case "http-request":
        return this.executeHttpRequest(step.config, input)
      case "data-transform":
        return this.executeDataTransform(step.config, input)
      case "condition":
        return this.executeCondition(step.config, input)
      case "llm":
        return this.executeLLM(step.config, input)
      case "start":
        return this.executeStart(step.config, input)
      case "end":
        return this.executeEnd(step.config, input)
      default:
        console.log(`Unknown step type: ${step.type}`)
        return input
    }
  }

  private async executeHttpRequest(config: any, input: any): Promise<any> {
    const { url, method = "GET", headers = {} } = config

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== "GET" ? JSON.stringify(input) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`)
    }
  }

  private async executeDataTransform(config: any, input: any): Promise<any> {
    const { transformation } = config

    // Simple transformation logic
    if (transformation === "uppercase" && typeof input === "string") {
      return input.toUpperCase()
    }

    if (transformation === "filter" && Array.isArray(input)) {
      return input.filter((item) => item !== null && item !== undefined)
    }

    return input
  }

  private async executeCondition(config: any, input: any): Promise<any> {
    const { condition, trueValue, falseValue } = config

    // Simple condition evaluation
    let result = false
    if (condition === "exists") {
      result = input !== null && input !== undefined
    } else if (condition === "not_empty") {
      result = input && (typeof input !== "object" || Object.keys(input).length > 0)
    }

    return result ? trueValue : falseValue
  }

  private async executeLLM(config: any, input: any): Promise<any> {
    const { prompt, model = "gpt-3.5-turbo" } = config

    // Simulate LLM response
    return {
      response: `AI response to: ${prompt} with input: ${JSON.stringify(input)}`,
      model,
      timestamp: new Date().toISOString(),
    }
  }

  private async executeStart(_config: any, input: any): Promise<any> {
    return input
  }

  private async executeEnd(_config: any, input: any): Promise<any> {
    return input
  }

  saveWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow)
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.workflows.get(id)
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values())
  }

  deleteWorkflow(id: string): boolean {
    return this.workflows.delete(id)
  }

  getExecutionHistory(): Array<{
    workflowId: string
    executedAt: Date
    status: "success" | "error" | "running"
    result?: any
    error?: string
  }> {
    return [...this.executionHistory]
  }

  validateWorkflow(workflow: WorkflowDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!workflow.name) {
      errors.push("Workflow name is required")
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push("Workflow must have at least one step")
    }

    // Validate connections
    for (const connection of workflow.connections) {
      const fromExists = workflow.steps.some((step) => step.id === connection.from)
      const toExists = workflow.steps.some((step) => step.id === connection.to)

      if (!fromExists) {
        errors.push(`Connection references non-existent step: ${connection.from}`)
      }
      if (!toExists) {
        errors.push(`Connection references non-existent step: ${connection.to}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Singleton instance
let workflowEngineInstance: WorkflowEngine | null = null

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance) {
    workflowEngineInstance = new WorkflowEngine()
  }
  return workflowEngineInstance
}

export default WorkflowEngine

/**
 * Generate a workflow from a natural language description
 */
export async function generateWorkflow(description: string): Promise<WorkflowDefinition> {
  // Simple workflow generation based on description
  const workflowId = `workflow-${Date.now()}`

  return {
    id: workflowId,
    name: description.slice(0, 50),
    description: description,
    steps: [
      {
        id: "step-1",
        name: "Start",
        type: "start",
        config: {},
        position: { x: 100, y: 100 },
      },
      {
        id: "step-2",
        name: "Process",
        type: "llm",
        config: { prompt: description },
        position: { x: 300, y: 100 },
      },
      {
        id: "step-3",
        name: "End",
        type: "end",
        config: {},
        position: { x: 500, y: 100 },
      },
    ],
    connections: [
      { from: "step-1", to: "step-2" },
      { from: "step-2", to: "step-3" },
    ],
  }
}

/**
 * Execute a workflow with given input
 */
export async function executeWorkflow(workflow: WorkflowDefinition, input: any = {}): Promise<any> {
  const engine = getWorkflowEngine()
  engine.saveWorkflow(workflow)
  return engine.executeWorkflow(workflow.id, input)
}

/**
 * Generate code from a workflow definition
 */
export function generateCode(workflow: WorkflowDefinition, language: "typescript" | "python" = "typescript"): string {
  if (language === "python") {
    return generatePythonCode(workflow)
  }
  return generateTypeScriptCode(workflow)
}

function generateTypeScriptCode(workflow: WorkflowDefinition): string {
  const code = `
// Generated workflow: ${workflow.name}
// Description: ${workflow.description}

export async function ${workflow.id.replace(/-/g, "_")}(input: any) {
  let result = input;
  
  ${workflow.steps
    .map((step) => {
      if (step.type === "start" || step.type === "end") return ""
      return `
  // Step: ${step.name}
  result = await executeStep_${step.id.replace(/-/g, "_")}(result);
  `
    })
    .join("\n")}
  
  return result;
}

${workflow.steps
  .map((step) => {
    if (step.type === "start" || step.type === "end") return ""
    return `
async function executeStep_${step.id.replace(/-/g, "_")}(input: any) {
  // Type: ${step.type}
  // Config: ${JSON.stringify(step.config, null, 2)}
  console.log("Executing step: ${step.name}");
  return input; // Implement your logic here
}
`
  })
  .join("\n")}
`
  return code
}

function generatePythonCode(workflow: WorkflowDefinition): string {
  const code = `
# Generated workflow: ${workflow.name}
# Description: ${workflow.description}

async def ${workflow.id.replace(/-/g, "_")}(input):
    result = input
    
    ${workflow.steps
      .map((step) => {
        if (step.type === "start" || step.type === "end") return ""
        return `
    # Step: ${step.name}
    result = await execute_step_${step.id.replace(/-/g, "_")}(result)
    `
      })
      .join("\n")}
    
    return result

${workflow.steps
  .map((step) => {
    if (step.type === "start" || step.type === "end") return ""
    return `
async def execute_step_${step.id.replace(/-/g, "_")}(input):
    # Type: ${step.type}
    # Config: ${JSON.stringify(step.config, null, 2)}
    print(f"Executing step: ${step.name}")
    return input  # Implement your logic here
`
  })
  .join("\n")}
`
  return code
}

/**
 * Node executors for different workflow step types
 */
export const nodeExecutors = {
  "http-request": async (config: any, input: any) => {
    const { url, method = "GET", headers = {} } = config
    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(input) : undefined,
    })
    return response.json()
  },

  "data-transform": async (config: any, input: any) => {
    const { transformation } = config
    if (transformation === "uppercase" && typeof input === "string") {
      return input.toUpperCase()
    }
    if (transformation === "filter" && Array.isArray(input)) {
      return input.filter((item) => item !== null && item !== undefined)
    }
    return input
  },

  condition: async (config: any, input: any) => {
    const { condition, trueValue, falseValue } = config
    let result = false
    if (condition === "exists") {
      result = input !== null && input !== undefined
    } else if (condition === "not_empty") {
      result = input && (typeof input !== "object" || Object.keys(input).length > 0)
    }
    return result ? trueValue : falseValue
  },

  llm: async (config: any, input: any) => {
    const { prompt, model = "gpt-3.5-turbo" } = config
    return {
      response: `AI response to: ${prompt} with input: ${JSON.stringify(input)}`,
      model,
      timestamp: new Date().toISOString(),
    }
  },

  start: async (_config: any, input: any) => input,
  end: async (_config: any, input: any) => input,
}
