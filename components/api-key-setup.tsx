"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2, Zap, Bot, Workflow, Code, Shield, Sparkles, Rocket } from "lucide-react"
import { getLLMService } from "@/lib/llm-service"

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationError("API 키를 입력해주세요.")
      return
    }

    setIsValidating(true)
    setValidationError(null)
    setIsValid(false)

    try {
      const llmService = getLLMService(apiKey)
      const isValid = await llmService.validateApiKey()

      if (isValid) {
        setIsValid(true)
        setTimeout(() => {
          onApiKeySet(apiKey)
        }, 1500)
      } else {
        setValidationError("유효하지 않은 API 키입니다. 다시 확인해주세요.")
      }
    } catch (error) {
      console.error("API 키 검증 오류:", error)
      setValidationError("API 키 검증 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Works</h1>
            <p className="text-sm text-gray-600">AI-Powered Development Platform</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Beta</div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI로 더 빠른 개발을 경험하세요
          </div>

          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            자연어로 설명하면
            <br />
            <span className="text-blue-600">AI가 코드를 생성합니다</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            복잡한 컴포넌트부터 완전한 워크플로우까지, 자연어 설명만으로 AI가 자동으로 생성해드립니다.
          </p>
        </div>

        {/* Feature Cards - AI 에이전트가 첫 번째 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">자율형 AI 에이전트</h3>
            <p className="text-gray-600">
              다양한 작업을 수행하는 자율형 멀티 에이전트를 생성하고, 나만의 AI 팀을 만들어보세요. 에이전트가 협업을
              통해 복잡한 프로젝트를 완성합니다.
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">스마트 코드 생성</h3>
            <p className="text-gray-600">
              자연어 설명을 바탕으로 React, Node.js, Python 등 다양한 언어의 코드를 자동 생성합니다.
            </p>
          </Card>

          <Card className="p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Workflow className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">워크플로우 자동화</h3>
            <p className="text-gray-600">
              복잡한 비즈니스 로직을 워크플로우로 변환하고, 실행 가능한 프로세스를 생성합니다.
            </p>
          </Card>
        </div>

        {/* API Key Section */}
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                시작하기
              </CardTitle>
              <CardDescription>AI Works를 사용하기 위해 API 키를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Works 키</label>
                  <Input
                    type="password"
                    placeholder="AI Works API 키를 입력하세요"
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
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-12 text-base" onClick={validateApiKey} disabled={isValidating || isValid}>
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
            </CardFooter>
          </Card>
        </div>

        {/* Examples Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">이런 것들을 만들 수 있어요</h3>
          <div className="flex flex-wrap justify-center gap-4">
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
              <div
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                "{example}"
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
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
  )
}
