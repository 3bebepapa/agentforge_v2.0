/**
 * 태스크 내보내기 유틸리티
 * AgentForge 태스크를 프로세스 스튜디오 형식으로 변환합니다.
 */
export class TaskExporter {
  /**
   * AgentForge 태스크를 프로세스 스튜디오 형식으로 변환
   * @param task AgentForge 태스크 객체
   * @returns 프로세스 스튜디오 형식의 태스크 객체
   */
  static convertToProcessStudioFormat(task: any): any {
    // 기본 변환 로직
    const convertedTask = {
      id: task.id,
      name: task.description,
      type: "task",
      status: this.mapTaskStatus(task.status),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      properties: {
        result: task.result,
        error: task.error,
        metadata: {
          source: "AgentForge",
          originalId: task.id,
        },
      },
      children: [],
    }

    // 하위 태스크 변환
    if (task.subtasks && Array.isArray(task.subtasks)) {
      convertedTask.children = task.subtasks.map((subtask: any) => this.convertToProcessStudioFormat(subtask))
    }

    return convertedTask
  }

  /**
   * 태스크 상태 매핑
   * @param status AgentForge 태스크 상태
   * @returns 프로세스 스튜디오 태스크 상태
   */
  private static mapTaskStatus(status: string): string {
    switch (status) {
      case "pending":
        return "PENDING"
      case "in_progress":
        return "RUNNING"
      case "completed":
        return "COMPLETED"
      case "failed":
        return "FAILED"
      default:
        return "UNKNOWN"
    }
  }

  /**
   * 태스크를 JSON 파일로 내보내기
   * @param task 내보낼 태스크
   * @returns JSON 문자열
   */
  static exportToJson(task: any): string {
    const convertedTask = this.convertToProcessStudioFormat(task)
    return JSON.stringify(convertedTask, null, 2)
  }
}
