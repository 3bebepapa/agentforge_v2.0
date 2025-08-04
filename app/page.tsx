"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Sparkles, Rocket, X, Code, ExternalLink } from "lucide-react"
import { Dashboard } from "@/components/dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import { useRouter } from "next/navigation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 자동 포커싱
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleSubmit = () => {
    if (prompt.trim()) {
      setShowApiKeyDialog(true)
    }
  }

  const handleApiKeySubmit = (apiKey: string) => {
    setApiKey(apiKey)
    setShowApiKeyDialog(false)
  }

  if (apiKey) {
    return (
      <ThemeProvider>
        <Dashboard apiKey={apiKey} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        {/* Header */}
        <header className="border-b px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AI Works</h1>
            <Badge variant="outline" className="ml-2">
              BETA
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/api-platform">
              <Button variant="outline" size="sm">
                <Code className="w-4 h-4 mr-2" />
                B2B API 플랫폼
              </Button>
            </Link>
            <Link href="https://www.squareai.dev/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Penta AI
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section with Prompt Input */}
        <main className="flex-1 flex items-center justify-center p-4 py-20">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>B2B AI Total Platform</span>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                탈중앙화 AI 통합 허브 플랫폼
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI Works
                </span>
              </h2>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                글로벌 기업을 위한 통합 AI 허브 플랫폼. 협업기반 자율형 에이전트, AI 워크플로우 자동화, MOE 벡터 임베딩
                시스템, AI기반 블록체인 시스템까지 누구나 쉽게 AI 비즈니스를 통합할 수 있습니다.
              </p>
            </div>

            <div className="mb-8">
              <Textarea
                ref={textareaRef}
                placeholder="AI Works에 원하는 작업을 설명해주세요..."
                className="h-24 text-lg shadow-lg"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button className="w-full mt-4 h-12 text-base" onClick={handleSubmit}>
                AI Works 시작하기
              </Button>
            </div>

            {/* Examples Section */}
            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">이런 것들을 만들 수 있어요</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "채팅 컴포넌트 만들어줘",
                  "데이터 분석 워크플로우 생성",
                  "REST API 서버 코드",
                  "이미지 처리 도구",
                  "자동화 스크립트",
                  "스타트업 회사 만들기",
                  "마케팅 전문팀 만들기",
                  "글로벌 영업팀 만들기",
                  "인공지능 개발팀 만들기",
                ].map((example, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-4 py-2 text-sm bg-white/50 hover:bg-white/80 transition-colors cursor-pointer"
                    onClick={() => setPrompt(example)}
                  >
                    "{example}"
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* API Key Dialog */}
        {showApiKeyDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowApiKeyDialog(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">AI Works 키를 입력해주세요</CardTitle>
                <CardDescription>AI Works를 사용하려면 유효한 API 키가 필요합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeyInput onApiKeySet={handleApiKeySubmit} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Zap className="h-8 w-8 text-white" />
                <div>
                  <h4 className="text-xl font-bold">AI Works</h4>
                  <p className="text-gray-400 text-sm">탈중앙화 AI 생태계</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-300 mb-2">연합학습과 블록체인을 통해 더 나은 AI의 미래를 만들어갑니다.</p>
                <p className="text-gray-500 text-sm">© 2018 AI Works. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void
}

const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("") // 빈 문자열로 변경
  const [isValid, setIsValid] = useState(false)

  const validateApiKey = (key: string) => {
    // 기본 Gemini API 키 형식 검증 (AIza로 시작하고 39자리)
    const geminiKeyPattern = /^AIza[0-9A-Za-z_-]{35}$/
    return geminiKeyPattern.test(key)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateApiKey(apiKey)) {
      setIsValid(true)
      onApiKeySet(apiKey)
    } else {
      setIsValid(false)
      alert("올바른 Gemini API 키 형식이 아닙니다.")
    }
  }

  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Gemini API 키</label>
        <Input
          type="password"
          placeholder="Gemini API 키를 입력하세요"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="h-12"
        />
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          API 키는 안전하게 저장되며 서버로 전송되지 않습니다
        </p>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {isValid && (
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription>API 키가 유효합니다. 잠시 후 자동으로 진행됩니다.</AlertDescription>
        </Alert>
      )}

      <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={isValidating || isValid}>
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            검증 중...
          </>
        ) : isValid ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            검증 완료
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-4 w-4" />
            AI Works 시작하기
          </>
        )}
      </Button>
    </div>
  )
}
