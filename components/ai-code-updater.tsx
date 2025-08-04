"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"
import { getLLMService } from "@/lib/llm-service"

interface AICodeUpdaterProps {
  apiKey?: string
  currentCode: string
  onCodeUpdate: (updatedCode: string) => void
}

export function AICodeUpdater({ apiKey, currentCode, onCodeUpdate }: AICodeUpdaterProps) {
  const [showCodeCompareDialog, setShowCodeCompareDialog] = useState(false)
  const [originalCode, setOriginalCode] = useState("")
  const [updatedCode, setUpdatedCode] = useState("")
  const [codeUpdateDiff, setCodeUpdateDiff] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAICodeUpdate = async () => {
    if (!apiKey || !currentCode) return

    setIsUpdating(true)
    setOriginalCode(currentCode)

    try {
      const llmService = getLLMService(apiKey)
      const prompt = `
다음 컴포넌트 코드를 개선해주세요:

${currentCode}

개선 사항:
1. 코드 품질 및 가독성 향상
2. 오류 처리 개선
3. 성능 최적화
4. 최신 JavaScript/TypeScript 관행 적용

개선된 코드만 반환해주세요. 설명이나 다른 텍스트는 포함하지 마세요.
`

      const updatedCodeResult = await llmService.generateText(prompt)
      setUpdatedCode(updatedCodeResult)

      // 변경 사항 계산
      const diffs = []
      const originalLines = currentCode.split("\n")
      const updatedLines = updatedCodeResult.split("\n")

      // 간단한 차이점 계산 (실제 구현에서는 더 정교한 diff 알고리즘 사용 권장)
      if (originalLines.length !== updatedLines.length) {
        diffs.push(`줄 수 변경: ${originalLines.length} → ${updatedLines.length}`)
      }

      // 주요 변경 사항 감지 (예: 메서드 추가/제거, 주요 로직 변경)
      const originalMethods = currentCode.match(/\w+\s*$$[^)]*$$\s*{/g) || []
      const updatedMethods = updatedCodeResult.match(/\w+\s*$$[^)]*$$\s*{/g) || []

      const addedMethods = updatedMethods.filter((m) => !originalMethods.includes(m))
      const removedMethods = originalMethods.filter((m) => !updatedMethods.includes(m))

      if (addedMethods.length > 0) {
        diffs.push(`추가된 메서드: ${addedMethods.map((m) => m.replace(/\s*{$/, "")).join(", ")}`)
      }

      if (removedMethods.length > 0) {
        diffs.push(`제거된 메서드: ${removedMethods.map((m) => m.replace(/\s*{$/, "")).join(", ")}`)
      }

      // 기타 주요 변경 사항 감지
      if (updatedCodeResult.includes("try") && !currentCode.includes("try")) {
        diffs.push("오류 처리 개선: try-catch 블록 추가")
      }

      if (updatedCodeResult.includes("async") && !currentCode.includes("async")) {
        diffs.push("비동기 처리 개선: async/await 추가")
      }

      setCodeUpdateDiff(diffs.length > 0 ? diffs : ["세부 코드 구조 및 가독성 개선"])
      setShowCodeCompareDialog(true)
    } catch (error) {
      console.error("AI 코드 업데이트 오류:", error)
      alert(`AI 코드 업데이트 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const applyCodeUpdate = () => {
    onCodeUpdate(updatedCode)
    setShowCodeCompareDialog(false)
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleAICodeUpdate} disabled={isUpdating}>
        <Sparkles className="mr-2 h-3 w-3" />
        {isUpdating ? "업데이트 중..." : "AI 코드 업데이트"}
      </Button>

      {/* AI 코드 업데이트 비교 다이얼로그 */}
      <Dialog open={showCodeCompareDialog} onOpenChange={setShowCodeCompareDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI 코드 업데이트 비교</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">기존 코드</h3>
              <div className="bg-muted/30 font-mono text-sm p-4 overflow-auto max-h-[400px]">
                <pre>{originalCode}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">업데이트된 코드</h3>
              <div className="bg-muted/30 font-mono text-sm p-4 overflow-auto max-h-[400px]">
                <pre>{updatedCode}</pre>
              </div>
            </div>
          </div>
          {codeUpdateDiff.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">변경 사항</h3>
              <ul className="space-y-2">
                {codeUpdateDiff.map((diff, index) => (
                  <li key={index} className="text-sm">
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowCodeCompareDialog(false)}>
              취소
            </Button>
            <Button type="button" onClick={applyCodeUpdate}>
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
