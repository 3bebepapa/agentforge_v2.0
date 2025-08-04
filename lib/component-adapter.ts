/**
 * 컴포넌트 어댑터 클래스
 * AgentForge 컴포넌트와 프로세스 스튜디오 컴포넌트 간 변환을 지원합니다.
 */
export class ComponentAdapter {
  /**
   * AgentForge 컴포넌트를 프로세스 스튜디오 형식으로 변환
   * @param component AgentForge 컴포넌트
   * @returns 프로세스 스튜디오 형식의 컴포넌트
   */
  static convertToProcessStudioFormat(component: any): any {
    return {
      id: component.id,
      name: component.name,
      type: this.mapComponentType(component.type),
      description: component.description,
      properties: {
        features: component.features,
        implementation: component.implementation,
        metadata: {
          source: "AgentForge",
          originalId: component.id,
        },
      },
      createdAt: component.createdAt || new Date().toISOString(),
    }
  }

  /**
   * 컴포넌트 유형 매핑
   * @param type AgentForge 컴포넌트 유형
   * @returns 프로세스 스튜디오 컴포넌트 유형
   */
  private static mapComponentType(type: string): string {
    switch (type) {
      case "agent":
        return "AGENT"
      case "data":
        return "DATA_PROCESSOR"
      case "integration":
        return "INTEGRATION"
      case "logic":
        return "LOGIC"
      case "utility":
        return "UTILITY"
      default:
        return "CUSTOM"
    }
  }

  /**
   * 프로세스 스튜디오 컴포넌트를 AgentForge 형식으로 변환
   * @param component 프로세스 스튜디오 컴포넌트
   * @returns AgentForge 형식의 컴포넌트
   */
  static convertToAgentForgeFormat(component: any): any {
    return {
      id: component.id,
      name: component.name,
      type: this.mapComponentTypeReverse(component.type),
      description: component.description,
      features: component.properties?.features || [],
      implementation: component.properties?.implementation || "",
      createdAt: component.createdAt || new Date().toISOString(),
    }
  }

  /**
   * 컴포넌트 유형 역매핑
   * @param type 프로세스 스튜디오 컴포넌트 유형
   * @returns AgentForge 컴포넌트 유형
   */
  private static mapComponentTypeReverse(type: string): string {
    switch (type) {
      case "AGENT":
        return "agent"
      case "DATA_PROCESSOR":
        return "data"
      case "INTEGRATION":
        return "integration"
      case "LOGIC":
        return "logic"
      case "UTILITY":
        return "utility"
      default:
        return "custom"
    }
  }
}
