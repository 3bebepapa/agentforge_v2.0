"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, X } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

interface ChatInterfaceProps {
  apiKey: string
  onClose: () => void
}

export function ChatInterface({ apiKey, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "안녕하세요! 무엇을 도와드릴까요?",
      role: "assistant",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 새 메시지가 추가될 때마다 스크롤 영역을 아래로 이동
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Gemini API 호출
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: input,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API 오류: ${errorData.error?.message || "알 수 없는 오류"}`)
      }

      const data = await response.json()

      // 응답에서 텍스트 추출
      let assistantResponse = "응답을 생성할 수 없습니다."
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const textParts = data.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)

        assistantResponse = textParts.join("\n")
      }

      // 어시스턴트 메시지 추가
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: assistantResponse,
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      // 오류 메시지 추가
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `오류가 발생했습니다: ${error.message}`,
        role: "assistant",
        timestamp: new Date().toLocaleTimeString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="fixed bottom-0 right-0 w-96 h-[500px] shadow-lg z-20 flex flex-col">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          Gemini 1.5 Flash 채팅
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    {message.role === "user" ? (
                      <User className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    )}
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{message.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 mt-1">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="메시지 입력..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
