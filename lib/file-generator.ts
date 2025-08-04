import { JsonSafeParser } from "./json-safe-parser"
import { FileStorage } from "./file-storage"
import { AiResponseCleaner } from "./ai-response-cleaner"

/**
 * 파일 생성 유틸리티
 * 태스크 결과, 컴포넌트, 워크플로우 등을 파일로 저장
 */
export class FileGenerator {
  /**
   * 태스크 결과를 JSON 파일로 저장
   * @param taskPlan 태스크 계획 객체
   * @returns 저장된 파일 정보
   */
  static saveTaskResult(taskPlan: any): { filename: string; content: string } {
    if (!taskPlan) return { filename: "", content: "" }

    const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")
    const filename = `task_result_${timestamp}.json`

    // 저장할 데이터 준비
    const saveData = {
      id: taskPlan.id,
      description: taskPlan.description,
      status: taskPlan.status,
      createdAt: taskPlan.createdAt,
      completedAt: taskPlan.completedAt || new Date().toISOString(),
      context: taskPlan.context,
      tasks: taskPlan.tasks,
      result: taskPlan.result,
      components: this.extractComponents(taskPlan),
      workflows: this.extractWorkflows(taskPlan),
    }

    // JSON 문자열 생성
    const content = JsonSafeParser.stringify(saveData, null, 2)

    // 파일 저장
    const success = FileStorage.saveFile(filename, content, "application/json")

    if (success) {
      console.log("태스크 결과 저장 완료:", filename)
    } else {
      console.error("태스크 결과 저장 실패:", filename)
    }

    return { filename, content }
  }

  /**
   * 컴포넌트를 파일로 저장
   * @param component 컴포넌트 객체
   * @returns 저장된 파일 정보
   */
  static saveComponent(component: any): { filename: string; content: string } {
    if (!component) return { filename: "", content: "" }

    const componentName = component.name?.replace(/\s+/g, "_").toLowerCase() || "component"
    const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")
    const filename = `${componentName}_${timestamp}.js`

    // 컴포넌트 코드 생성
    let content = ""

    // 컴포넌트 구현 코드가 있는 경우
    if (component.implementation) {
      content = component.implementation
    } else if (component.code) {
      content = component.code
    } else {
      // 기본 컴포넌트 템플릿 생성
      content = `/**
 * ${component.name || "컴포넌트"}
 * ${component.description || ""}
 */
class ${this.toPascalCase(component.name || "Component")} {
  constructor() {
    this.type = "${component.type || "custom"}";
    this.name = "${component.name || "컴포넌트"}";
  }
  
  // 기본 메서드
  async process(input) {
    // 구현 필요
    return input;
  }
  
  // 특성 목록
  getFeatures() {
    return ${JSON.stringify(component.features || [])};
  }
}

module.exports = ${this.toPascalCase(component.name || "Component")};
`
    }

    // 파일 저장
    const success = FileStorage.saveFile(filename, content, "application/javascript")

    if (success) {
      console.log("컴포넌트 저장 완료:", filename)
    } else {
      console.error("컴포넌트 저장 실패:", filename)
    }

    return { filename, content }
  }

  /**
   * 워크플로우를 파일로 저장
   * @param workflow 워크플로우 객체
   * @returns 저장된 파일 정보
   */
  static saveWorkflow(workflow: any): { filename: string; content: string } {
    if (!workflow) return { filename: "", content: "" }

    const workflowName = workflow.name?.replace(/\s+/g, "_").toLowerCase() || "workflow"
    const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")
    const filename = `${workflowName}_${timestamp}.json`

    // 워크플로우 데이터 정리
    const cleanWorkflow = {
      id: workflow.id || `wf_${Math.random().toString(36).substring(2, 9)}`,
      name: workflow.name || "Unnamed Workflow",
      description: workflow.description || "",
      steps: workflow.steps || [],
      createdAt: workflow.createdAt || new Date().toISOString(),
    }

    // JSON 문자열 생성
    const content = JsonSafeParser.stringify(cleanWorkflow, null, 2)

    // 파일 저장
    const success = FileStorage.saveFile(filename, content, "application/json")

    if (success) {
      console.log("워크플로우 저장 완료:", filename)
    } else {
      console.error("워크플로우 저장 실패:", filename)
    }

    return { filename, content }
  }

  /**
   * 문자열을 PascalCase로 변환
   * @param str 변환할 문자열
   * @returns PascalCase 문자열
   */
  private static toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => letter.toUpperCase()).replace(/\s+/g, "")
  }

  /**
   * 태스크 계획에서 컴포넌트 추출
   * @param taskPlan 태스크 계획 객체
   * @returns 컴포넌트 배열
   */
  private static extractComponents(taskPlan: any): any[] {
    if (!taskPlan) return []

    let components: any[] = []

    // 결과에서 컴포넌트 추출
    if (taskPlan.result) {
      const extractedFromResult = AiResponseCleaner.extractComponents(taskPlan.result)
      if (extractedFromResult.length > 0) {
        components = [...components, ...extractedFromResult]
      }
    }

    // 태스크 결과에서 컴포넌트 추출
    if (taskPlan.tasks && Array.isArray(taskPlan.tasks)) {
      for (const task of taskPlan.tasks) {
        if (task.result) {
          // componentSpec 또는 componentId가 있는 경우 컴포넌트로 간주
          if (typeof task.result === "object" && (task.result.componentSpec || task.result.componentId)) {
            const component = task.result.componentSpec || {}
            if (component) {
              components.push(component)
            }
          }

          const extractedFromTask = AiResponseCleaner.extractComponents(task.result)
          if (extractedFromTask.length > 0) {
            components = [...components, ...extractedFromTask]
          }
        }
      }
    }

    // 중복 제거
    const uniqueComponents = components.filter(
      (component, index, self) =>
        index === self.findIndex((c) => (c.id && c.id === component.id) || (c.name && c.name === component.name)),
    )

    return uniqueComponents
  }

  /**
   * 태스크 계획에서 워크플로우 추출
   * @param taskPlan 태스크 계획 객체
   * @returns 워크플로우 배열
   */
  private static extractWorkflows(taskPlan: any): any[] {
    if (!taskPlan) return []

    let workflows: any[] = []

    // 결과에서 워크플로우 추출
    if (taskPlan.result) {
      const extractedFromResult = AiResponseCleaner.extractWorkflows(taskPlan.result)
      if (extractedFromResult.length > 0) {
        workflows = [...workflows, ...extractedFromResult]
      }
    }

    // 태스크 결과에서 워크플로우 추출
    if (taskPlan.tasks && Array.isArray(taskPlan.tasks)) {
      for (const task of taskPlan.tasks) {
        if (task.result) {
          const extractedFromTask = AiResponseCleaner.extractWorkflows(task.result)
          if (extractedFromTask.length > 0) {
            workflows = [...workflows, ...extractedFromTask]
          }
        }
      }
    }

    // 중복 제거
    const uniqueWorkflows = workflows.filter(
      (workflow, index, self) =>
        index === self.findIndex((w) => (w.id && w.id === workflow.id) || (w.name && w.name === workflow.name)),
    )

    return uniqueWorkflows
  }
}
