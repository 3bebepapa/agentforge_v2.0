"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play } from "lucide-react"
import { AICodeUpdater } from "@/components/ai-code-updater"

interface ComponentInputMethodsProps {
  apiKey?: string
  componentCode: string
  onCodeUpdate: (updatedCode: string) => void
}

export function ComponentInputMethods({ apiKey, componentCode, onCodeUpdate }: ComponentInputMethodsProps) {
  const [inputValue, setInputValue] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")

  // 컴포넌트 코드에서 메소드 추출
  const extractMethods = (code: string) => {
    const methodRegex = /(\w+)\s*$$[^)]*$$\s*{/g
    const matches = [...code.matchAll(methodRegex)]

    // 생성자와 일반적인 내장 메소드 제외
    const excludedMethods = ["constructor", "toString", "valueOf"]
    return matches.map((match) => match[1]).filter((method) => !excludedMethods.includes(method))
  }

  const methods = extractMethods(componentCode)

  const handleExecute = () => {
    // 실행 로직 구현 (실제로는 컴포넌트 메소드 실행)
    console.log(`메소드 실행: ${selectedMethod}, 입력값: ${inputValue}`)
    alert(`메소드 실행: ${selectedMethod}, 입력값: ${inputValue}`)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium">입력 값</label>
          <Input placeholder="입력 값" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium">메소드</label>
          <select
            className="w-full p-2 rounded-md border text-sm"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            <option value="">메소드 선택</option>
            {methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <AICodeUpdater apiKey={apiKey} currentCode={componentCode} onCodeUpdate={onCodeUpdate} />
        <Button size="sm" onClick={handleExecute} disabled={!selectedMethod}>
          <Play className="mr-2 h-3 w-3" />
          실행
        </Button>
      </div>
    </div>
  )
}
