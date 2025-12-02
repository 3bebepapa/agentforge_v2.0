"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentApiKey?: string
  onApiKeyUpdate?: (apiKey: string, model: string) => void
}

const AVAILABLE_MODELS = [
  { value: "gemini-1.5-flash-latest", label: "Gemini 1.5 Flash (Latest - 추천)" },
  { value: "gemini-1.5-pro-latest", label: "Gemini 1.5 Pro (Latest)" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
]

export function SettingsDialog({ open, onOpenChange, currentApiKey, onApiKeyUpdate }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || "")
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash-latest")
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationMessage, setValidationMessage] = useState("")

  // Load saved settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("penta_api_key") || currentApiKey
      const savedModel = localStorage.getItem("penta_model") || "gemini-1.5-flash-latest"

      if (savedKey) setApiKey(savedKey)
      setSelectedModel(savedModel)
    }
  }, [currentApiKey, open])

  const validateAndSave = async () => {
    if (!apiKey.trim()) {
      setIsValid(false)
      setValidationMessage("API 키를 입력해주세요.")
      return
    }

    setIsValidating(true)
    setIsValid(null)
    setValidationMessage("")

    try {
      const response = await fetch("/api/validate-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey, model: selectedModel }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setIsValid(true)
        setValidationMessage("API 키가 유효합니다.")

        // Save to localStorage
        localStorage.setItem("penta_api_key", apiKey)
        localStorage.setItem("penta_model", selectedModel)

        // Notify parent component
        if (onApiKeyUpdate) {
          onApiKeyUpdate(apiKey, selectedModel)
        }

        // Close dialog after 1.5 seconds
        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
      } else {
        setIsValid(false)
        setValidationMessage(data.message || "API 키 검증에 실패했습니다.")
      }
    } catch (error) {
      setIsValid(false)
      setValidationMessage("API 키 검증 중 오류가 발생했습니다.")
      console.error("API 키 검증 오류:", error)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
          <DialogDescription>Penta API 키와 사용할 Gemini 모델 버전을 설정하세요.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Penta API 키</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isValidating}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Gemini 모델 버전</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isValidating}>
              <SelectTrigger id="model">
                <SelectValue placeholder="모델 선택" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Gemini 1.5 Flash Latest는 안정적이고 빠르며 무료 할당량이 충분합니다.
            </p>
          </div>

          {isValid === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}

          {isValid === true && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>성공</AlertTitle>
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isValidating}>
            취소
          </Button>
          <Button onClick={validateAndSave} disabled={isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검증 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
