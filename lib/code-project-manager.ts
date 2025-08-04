/**
 * 코드 프로젝트 관리 클래스
 * 프로젝트 생성, 파일 관리, 저장 등의 기능 제공
 */
export class CodeProjectManager {
  private projects: Map<string, any> = new Map()

  /**
   * 새 프로젝트 생성
   * @param name 프로젝트 이름
   * @param description 프로젝트 설명
   * @returns 생성된 프로젝트 ID
   */
  createProject(name: string, description: string): string {
    const id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.projects.set(id, {
      id,
      name,
      description,
      files: [],
      createdAt: new Date(),
      lastModified: new Date(),
    })

    return id
  }

  /**
   * 프로젝트 가져오기
   * @param id 프로젝트 ID
   * @returns 프로젝트 객체 또는 undefined
   */
  getProject(id: string): any {
    return this.projects.get(id)
  }

  /**
   * 모든 프로젝트 가져오기
   * @returns 프로젝트 배열
   */
  getAllProjects(): any[] {
    return Array.from(this.projects.values())
  }

  /**
   * 프로젝트에 파일 추가
   * @param projectId 프로젝트 ID
   * @param fileName 파일 이름
   * @param content 파일 내용
   * @param language 파일 언어
   * @returns 생성된 파일 ID 또는 null
   */
  addFile(projectId: string, fileName: string, content: string, language: string): string | null {
    const project = this.projects.get(projectId)
    if (!project) return null

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const file = {
      id: fileId,
      name: fileName,
      path: "/",
      language,
      content,
      lastModified: new Date(),
    }

    project.files.push(file)
    project.lastModified = new Date()

    return fileId
  }

  /**
   * 파일 업데이트
   * @param projectId 프로젝트 ID
   * @param fileId 파일 ID
   * @param updates 업데이트할 필드
   * @returns 성공 여부
   */
  updateFile(
    projectId: string,
    fileId: string,
    updates: Partial<{ name: string; content: string; language: string }>,
  ): boolean {
    const project = this.projects.get(projectId)
    if (!project) return false

    const fileIndex = project.files.findIndex((file: any) => file.id === fileId)
    if (fileIndex === -1) return false

    project.files[fileIndex] = {
      ...project.files[fileIndex],
      ...updates,
      lastModified: new Date(),
    }

    project.lastModified = new Date()

    return true
  }

  /**
   * 파일 삭제
   * @param projectId 프로젝트 ID
   * @param fileId 파일 ID
   * @returns 성공 여부
   */
  deleteFile(projectId: string, fileId: string): boolean {
    const project = this.projects.get(projectId)
    if (!project) return false

    const fileIndex = project.files.findIndex((file: any) => file.id === fileId)
    if (fileIndex === -1) return false

    project.files.splice(fileIndex, 1)
    project.lastModified = new Date()

    return true
  }

  /**
   * 프로젝트 삭제
   * @param id 프로젝트 ID
   * @returns 성공 여부
   */
  deleteProject(id: string): boolean {
    return this.projects.delete(id)
  }

  /**
   * 프로젝트 내보내기
   * @param id 프로젝트 ID
   * @returns 프로젝트 데이터 객체 또는 null
   */
  exportProject(id: string): any | null {
    const project = this.projects.get(id)
    if (!project) return null

    return {
      ...project,
      exportedAt: new Date(),
    }
  }
}
