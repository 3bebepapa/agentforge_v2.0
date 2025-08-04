/**
 * 파일 저장소 유틸리티
 * 브라우저 로컬 스토리지를 사용하여 파일 저장 및 관리
 */
export class FileStorage {
  private static readonly STORAGE_KEY = "agentforge_files"

  /**
   * 파일 저장
   * @param filename 파일명
   * @param content 파일 내용
   * @param type 파일 타입 (MIME 타입)
   * @returns 성공 여부
   */
  static saveFile(filename: string, content: string, type = "application/json"): boolean {
    try {
      // 기존 파일 목록 가져오기
      const files = this.getAllFiles()

      // 새 파일 추가
      files[filename] = {
        content,
        type,
        createdAt: new Date().toISOString(),
      }

      // 저장
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files))

      // 저장 확인
      const savedFiles = localStorage.getItem(this.STORAGE_KEY)
      const parsedFiles = savedFiles ? JSON.parse(savedFiles) : {}

      if (parsedFiles[filename]) {
        console.log(`파일 저장 성공: ${filename}`)
        return true
      } else {
        console.error(`파일 저장 실패 (확인 불가): ${filename}`)
        return false
      }
    } catch (error) {
      console.error(`파일 저장 실패: ${filename}`, error)
      return false
    }
  }

  /**
   * 모든 파일 가져오기
   * @returns 파일 목록 객체
   */
  static getAllFiles(): Record<string, { content: string; type: string; createdAt: string }> {
    try {
      const filesJson = localStorage.getItem(this.STORAGE_KEY)
      return filesJson ? JSON.parse(filesJson) : {}
    } catch (error) {
      console.error("파일 목록 가져오기 실패", error)
      return {}
    }
  }

  /**
   * 파일 가져오기
   * @param filename 파일명
   * @returns 파일 객체 또는 null
   */
  static getFile(filename: string): { content: string; type: string; createdAt: string } | null {
    const files = this.getAllFiles()
    return files[filename] || null
  }

  /**
   * 파일 삭제
   * @param filename 파일명
   * @returns 성공 여부
   */
  static deleteFile(filename: string): boolean {
    try {
      const files = this.getAllFiles()

      if (!files[filename]) {
        return false
      }

      delete files[filename]
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files))

      return true
    } catch (error) {
      console.error(`파일 삭제 실패: ${filename}`, error)
      return false
    }
  }

  /**
   * 파일 다운로드
   * @param filename 파일명
   * @returns 성공 여부
   */
  static downloadFile(filename: string): boolean {
    const file = this.getFile(filename)

    if (!file) {
      console.error(`다운로드할 파일을 찾을 수 없음: ${filename}`)
      return false
    }

    try {
      // Blob 생성
      const blob = new Blob([file.content], { type: file.type })

      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename

      // 클릭 이벤트 발생시켜 다운로드
      document.body.appendChild(a)
      a.click()

      // 정리
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)

      console.log(`파일 다운로드 성공: ${filename}`)
      return true
    } catch (error) {
      console.error(`파일 다운로드 실패: ${filename}`, error)
      return false
    }
  }
}
