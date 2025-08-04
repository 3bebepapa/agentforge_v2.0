"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ApiKeyManagerProps {
  onApiKeyChange: (key: string) => void
  defaultApiKey?: string
}

export function ApiKeyManager({ onApiKeyChange, defaultApiKey }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState(defaultApiKey || "")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 저장된 API 키 불러오기
    const savedKey = localStorage.getItem("gemini_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      onApiKeyChange(savedKey)
      setIsValid(true)
    }
  }, [onApiKeyChange])

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("API 키를 입력해주세요.")
      setIsValid(false)
      return
    }

    setIsLoading(true)
    try {
      // API 키 유효성 검사 (간단한 요청 보내기)
      const response = await fetch("/api/validate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setIsValid(true)
        setErrorMessage("")
        localStorage.setItem("gemini_api_key", apiKey)
        onApiKeyChange(apiKey)
      } else {
        setIsValid(false)
        setErrorMessage(data.message || "API 키가 유효하지 않습니다.")
      }
    } catch (error) {
      setIsValid(false)
      setErrorMessage("API 키 검증 중 오류가 발생했습니다.")
      console.error("API 키 검증 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API 키 설정</CardTitle>
        <CardDescription>Gemini API 키를 입력하여 서비스를 이용하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Gemini API 키</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="API 키를 입력하세요"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {isValid === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {isValid === true && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>성공</AlertTitle>
              <AlertDescription>API 키가 유효합니다.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={validateApiKey} disabled={isLoading} className="w-full">
          {isLoading ? "검증 중..." : "API 키 검증 및 저장"}
        </Button>
      </CardFooter>
    </Card>
  )
}
