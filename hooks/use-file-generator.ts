"use client"

import { useState, useCallback } from "react"
import { FileGenerator } from "@/lib/file-generator"

/**
 * 파일 생성 훅
 * 태스크 결과, 컴포넌트, 워크플로우 등을 파일로 저장하는 기능 제공
 */
export function useFileGenerator() {
  const [savedFiles, setSavedFiles] = useState<Record<string, { filename: string; content: string }>>({})

  /**
   * 태스크 결과   = useState<Record<string, { filename: string; content: string }>>({});
  
  /**
   * 태스크 결과 저장
   * @param taskPlan 태스크 계획 객체
   * @returns 저장된 파일 정보
   */
  const saveTaskResult = useCallback((taskPlan: any) => {
    const result = FileGenerator.saveTaskResult(taskPlan)

    if (result.filename) {
      setSavedFiles((prev) => ({
        ...prev,
        [result.filename]: result,
      }))
    }

    return result
  }, [])

  /**
   * 컴포넌트 저장
   * @param component 컴포넌트 객체
   * @returns 저장된 파일 정보
   */
  const saveComponent = useCallback((component: any) => {
    const result = FileGenerator.saveComponent(component)

    if (result.filename) {
      setSavedFiles((prev) => ({
        ...prev,
        [result.filename]: result,
      }))
    }

    return result
  }, [])

  /**
   * 워크플로우 저장
   * @param workflow 워크플로우 객체
   * @returns 저장된 파일 정보
   */
  const saveWorkflow = useCallback((workflow: any) => {
    const result = FileGenerator.saveWorkflow(workflow)

    if (result.filename) {
      setSavedFiles((prev) => ({
        ...prev,
        [result.filename]: result,
      }))
    }

    return result
  }, [])

  return {
    savedFiles,
    saveTaskResult,
    saveComponent,
    saveWorkflow,
  }
}
