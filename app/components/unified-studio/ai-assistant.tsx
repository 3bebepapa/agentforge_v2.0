"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send } from "lucide-react"

export default function AIAssistant({ onGenerate, initialPrompt = "" }) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState([
    "고객 문의 처리 프로세스 생성",
    "데이터베이스 동기화 워크플로우 생성",
    "이메일 마케팅 자동화 플로우 생성",
    "사용자 등록 및 온보딩 프로세스 생성",
  ])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      await onGenerate(prompt)
    } catch (error) {
      console.error("AI 생성 오류:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion)
  }

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-lg font-medium mb-4">AI 어시스턴트</h2>

      <div className="mb-4">
        <Textarea
          placeholder="원하는 프로세스, 워크플로우, 플로우를 설명해주세요..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="mb-4">
        {isGenerating ? (
          <>생성 중...</>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            AI로 생성
          </>
        )}
      </Button>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium mb-2">추천 프롬프트</h3>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm">{suggestion}</span>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
