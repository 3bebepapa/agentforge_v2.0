/**
 * 프로세스 스튜디오 통합 유틸리티
 * AgentForge와 프로세스 스튜디오 간의 데이터 변환 및 통합 기능 제공
 */
export class ProcessStudioIntegration {
  /**
   * AgentForge 컴포넌트를 프로세스 스튜디오 형식으로 변환
   * @param components AgentForge 컴포넌트 배열
   * @returns 프로세스 스튜디오 형식의 컴포넌트 배열
   */
  static convertComponentsToProcessStudio(components: any[]): any[] {
    if (!components || !Array.isArray(components)) return []

    return components.map((component) => ({
      id: component.id || `comp_${Math.random().toString(36).substring(2, 9)}`,
      name: component.name || "Unnamed Component",
      type: component.type || "custom",
      description: component.description || "",
      features: component.features || [],
      implementation: component.implementation || "",
      config: component.config || {},
      metadata: {
        source: "AgentForge",
        convertedAt: new Date().toISOString(),
      },
    }))
  }

  /**
   * AgentForge 워크플로우를 프로세스 스튜디오 형식으로 변환
   * @param workflows AgentForge 워크플로우 배열
   * @returns 프로세스 스튜디오 형식의 워크플로우 배열
   */
  static convertWorkflowsToProcessStudio(workflows: any[]): any[] {
    if (!workflows || !Array.isArray(workflows)) return []

    return workflows.map((workflow) => ({
      id: workflow.id || `wf_${Math.random().toString(36).substring(2, 9)}`,
      name: workflow.name || "Unnamed Workflow",
      description: workflow.description || "",
      steps: this.convertWorkflowSteps(workflow.steps || []),
      config: workflow.config || {},
      metadata: {
        source: "AgentForge",
        convertedAt: new Date().toISOString(),
      },
    }))
  }

  /**
   * 워크플로우 단계를 프로세스 스튜디오 형식으로 변환
   * @param steps 워크플로우 단계 배열
   * @returns 프로세스 스튜디오 형식의 단계 배열
   */
  private static convertWorkflowSteps(steps: any[]): any[] {
    if (!steps || !Array.isArray(steps)) return []

    return steps.map((step, index) => ({
      id: step.id || `step_${Math.random().toString(36).substring(2, 9)}`,
      name: step.name || `Step ${index + 1}`,
      type: step.type || "task",
      componentRef: step.componentRef || null,
      config: step.config || {},
      inputs: step.inputs || {},
      outputs: step.outputs || {},
      conditions: step.conditions || [],
      position: step.position || { x: index * 200, y: 100 },
    }))
  }

  /**
   * 프로세스 스튜디오 형식의 데이터 생성
   * @param components AgentForge 컴포넌트 배열
   * @param workflows AgentForge 워크플로우 배열
   * @param tasks AgentForge 태스크 배열
   * @returns 프로세스 스튜디오 형식의 데이터
   */
  static createProcessStudioData(components: any[], workflows: any[], tasks: any[]): any {
    return {
      version: "1.0",
      metadata: {
        exportedAt: new Date().toISOString(),
        source: "AgentForge",
        description: "Exported from AgentForge to Process Studio",
      },
      components: this.convertComponentsToProcessStudio(components),
      workflows: this.convertWorkflowsToProcessStudio(workflows),
      tasks: tasks.map((task) => ({
        id: task.id,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        context: task.context,
        metadata: {
          source: "AgentForge",
          exportedAt: new Date().toISOString(),
        },
      })),
    }
  }

  /**
   * 프로세스 스튜디오 형식의 데이터를 AgentForge로 가져오기
   * @param processStudioData 프로세스 스튜디오 데이터
   * @returns AgentForge 형식의 데이터
   */
  static importFromProcessStudio(processStudioData: any): {
    components: any[]
    workflows: any[]
    tasks: any[]
  } {
    if (!processStudioData) {
      return { components: [], workflows: [], tasks: [] }
    }

    // 컴포넌트 변환
    const components = (processStudioData.components || []).map((component: any) => ({
      id: component.id,
      name: component.name,
      type: component.type,
      description: component.description,
      features: component.features || [],
      implementation: component.implementation || "",
      config: component.config || {},
    }))

    // 워크플로우 변환
    const workflows = (processStudioData.workflows || []).map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      steps: (workflow.steps || []).map((step: any) => ({
        id: step.id,
        name: step.name,
        type: step.type,
        componentRef: step.componentRef,
        config: step.config || {},
        inputs: step.inputs || {},
        outputs: step.outputs || {},
      })),
      config: workflow.config || {},
    }))

    // 태스크 변환
    const tasks = (processStudioData.tasks || []).map((task: any) => ({
      id: task.id,
      description: task.description,
      status: task.status,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      context: task.context,
    }))

    return { components, workflows, tasks }
  }
}
