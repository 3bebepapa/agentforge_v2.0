"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Bot, User, Search, AlertCircle, Key, Globe, ExternalLink } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  searchResults?: SearchResult[]
}

interface SearchResult {
  title: string
  url: string
  snippet: string
}

export default function GeminiChatTool() {
  const [apiKey, setApiKey] = useState("")
  const [keyValidated, setKeyValidated] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 로컬 스토리지에서 API 키 불러오기
  useEffect(() => {
    const savedKey = localStorage.getItem("geminiApiKey")
    if (savedKey) {
      setApiKey(savedKey)
      validateApiKey(savedKey)
    }
  }, [])

  // 메시지가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // API 키 유효성 검증
  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setError("API 키를 입력해주세요.")
      setKeyValidated(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
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
                    text: "Hello, are you working?",
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "알 수 없는 오류가 발생했습니다.")
      }

      // API 키가 유효하면 로컬 스토리지에 저장
      localStorage.setItem("geminiApiKey", key)
      setKeyValidated(true)

      // 시작 메시지 추가
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            '안녕하세요! Gemini 1.5 Flash 채팅 도우미입니다. 무엇을 도와드릴까요? 검색이 필요하시면 "검색: 검색어"와 같이 입력해주세요.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
      setKeyValidated(false)
    } finally {
      setLoading(false)
    }
  }

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!input.trim() || loading || !keyValidated) return

    const isSearchQuery = input.toLowerCase().startsWith("검색:")
    const messageId = `msg-${Date.now()}`

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      if (isSearchQuery) {
        // 검색 쿼리 처리
        const searchQuery = input.substring(3).trim()
        await handleSearch(searchQuery, messageId)
      } else {
        // 일반 대화 처리
        await handleNormalChat(input, messageId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")

      // 오류 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // 일반 대화 처리
  const handleNormalChat = async (message: string, messageId: string) => {
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
                  text: message,
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
      throw new Error(errorData.error?.message || "알 수 없는 오류가 발생했습니다.")
    }

    const data = await response.json()

    // 응답에서 텍스트 추출
    let assistantResponse = "응답을 생성할 수 없습니다."
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const textParts = data.candidates[0].content.parts.filter((part: any) => part.text).map((part: any) => part.text)

      assistantResponse = textParts.join("\n")
    }

    // 어시스턴트 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  // 검색 처리
  const handleSearch = async (query: string, messageId: string) => {
    // 검색 중 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: `search-${Date.now()}`,
        role: "assistant",
        content: `"${query}" 검색 결과를 가져오는 중입니다...`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])

    try {
      // DuckDuckGo 검색 결과 스크래핑 (브라우저에서는 CORS 문제로 직접 호출 불가능)
      // 실제 구현에서는 백엔드 API를 통해 검색 결과를 가져와야 함
      // 여기서는 예시 데이터로 대체

      // 실제 구현 시 아래 코드 대신 백엔드 API 호출 필요
      // const searchResults = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      // const data = await searchResults.json();

      // 예시 검색 결과 (실제 구현에서는 제거)
      const mockSearchResults: SearchResult[] = [
        {
          title: `${query}에 관한 검색 결과 1`,
          url: "https://example.com/result1",
          snippet: `이것은 ${query}에 관한 첫 번째 검색 결과입니다. 여기에는 검색어와 관련된 정보가 포함되어 있습니다.`,
        },
        {
          title: `${query} 가이드 및 튜토리얼`,
          url: "https://example.com/result2",
          snippet: `${query}에 대한 종합적인 가이드와 튜토리얼을 제공합니다. 초보자부터 전문가까지 모두를 위한 자료가 있습니다.`,
        },
        {
          title: `${query} 관련 최신 뉴스`,
          url: "https://example.com/result3",
          snippet: `${query}에 관한 최신 뉴스와 업데이트를 확인하세요. 업계 동향과 중요한 발표를 놓치지 마세요.`,
        },
        {
          title: `${query} 문제 해결 방법`,
          url: "https://example.com/result4",
          snippet: `${query} 사용 중 발생할 수 있는 일반적인 문제와 해결 방법을 안내합니다.`,
        },
        {
          title: `${query} 대안 및 비교`,
          url: "https://example.com/result5",
          snippet: `${query}의 대안 제품 및 서비스를 비교 분석합니다. 장단점과 가격 비교를 통해 최선의 선택을 도와드립니다.`,
        },
      ]

      // 검색 결과 요약 생성
      const searchSummary = await summarizeSearchResults(query, mockSearchResults)

      // 검색 결과 메시지 업데이트
      setMessages((prev) => {
        const updatedMessages = [...prev]
        const lastMessageIndex = updatedMessages.length - 1

        // 마지막 메시지가 검색 중 메시지인 경우 업데이트
        if (updatedMessages[lastMessageIndex].content.includes("검색 결과를 가져오는 중")) {
          updatedMessages[lastMessageIndex] = {
            id: `search-results-${Date.now()}`,
            role: "assistant",
            content: searchSummary,
            timestamp: new Date().toLocaleTimeString(),
            searchResults: mockSearchResults,
          }
        }

        return updatedMessages
      })
    } catch (err) {
      throw new Error(`검색 중 오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`)
    }
  }

  // 검색 결과 요약 생성
  const summarizeSearchResults = async (query: string, results: SearchResult[]): Promise<string> => {
    try {
      // 검색 결과를 텍스트로 변환
      const resultsText = results
        .map((result, index) => `${index + 1}. ${result.title}\n   URL: ${result.url}\n   요약: ${result.snippet}`)
        .join("\n\n")

      // Gemini API를 사용하여 검색 결과 요약
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
                    text: `다음은 "${query}"에 대한 검색 결과입니다. 이 결과를 요약하고 중요한 정보를 추출해주세요:\n\n${resultsText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "알 수 없는 오류가 발생했습니다.")
      }

      const data = await response.json()

      // 응답에서 텍스트 추출
      let summary = `"${query}"에 대한 검색 결과:\n\n`
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const textParts = data.candidates[0].content.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)

        summary += textParts.join("\n")
      } else {
        // 요약 실패 시 기본 요약 제공
        summary += results
          .map((result, index) => `${index + 1}. ${result.title} - ${result.snippet.substring(0, 100)}...`)
          .join("\n\n")
      }

      return summary
    } catch (error) {
      console.error("요약 생성 오류:", error)
      // 요약 생성 실패 시 기본 형식으로 결과 반환
      return `"${query}"에 대한 검색 결과:\n\n${results
        .map((result, index) => `${index + 1}. ${result.title}\n   ${result.snippet.substring(0, 150)}...`)
        .join("\n\n")}`
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-6 w-6 mr-2 text-primary" />
            Gemini 1.5 Flash 채팅 도우미
          </CardTitle>
          <CardDescription>
            Gemini 1.5 Flash API를 사용한 채팅 및 검색 도우미입니다. 검색이 필요하면 "검색: 검색어"와 같이 입력하세요.
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue={keyValidated ? "chat" : "setup"} className="flex-1 flex flex-col">
          <TabsList className="mx-4">
            <TabsTrigger value="setup" disabled={loading}>
              <Key className="h-4 w-4 mr-2" />
              API 키 설정
            </TabsTrigger>
            <TabsTrigger value="chat" disabled={!keyValidated || loading}>
              <Bot className="h-4 w-4 mr-2" />
              채팅
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="flex-1 p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gemini API 키 설정</CardTitle>
                <CardDescription>
                  Gemini 1.5 Flash API 키를 입력하세요. API 키는 로컬에 저장되며 서버로 전송되지 않습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Gemini API 키 입력"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={loading}
                  />
                  <Button onClick={() => validateApiKey(apiKey)} disabled={loading || !apiKey.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인"}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {keyValidated && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>API 키가 확인되었습니다. 이제 채팅을 시작할 수 있습니다.</AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>API 키 발급 방법:</p>
                  <ol className="list-decimal pl-5 space-y-1 mt-2">
                    <li>Google AI Studio에 접속합니다.</li>
                    <li>계정을 생성하거나 로그인합니다.</li>
                    <li>API 키 섹션에서 새 API 키를 생성합니다.</li>
                    <li>생성된 API 키를 복사하여 위 입력창에 붙여넣습니다.</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => window.open("https://makersuite.google.com/app/apikey", "_blank")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Google AI Studio 방문
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
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

                        {/* 검색 결과 표시 */}
                        {message.searchResults && (
                          <div className="mt-2 space-y-2">
                            <p className="text-xs text-muted-foreground">검색 결과:</p>
                            {message.searchResults.map((result, index) => (
                              <Card key={index} className="text-xs">
                                <CardContent className="p-2">
                                  <div className="font-medium">{result.title}</div>
                                  <div className="text-muted-foreground text-[10px] truncate">{result.url}</div>
                                  <div className="mt-1">{result.snippet}</div>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-6 p-0 mt-1"
                                    onClick={() => window.open(result.url, "_blank")}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    링크 열기
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-1">{message.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
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

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder={
                    keyValidated
                      ? "메시지를 입력하세요. 검색이 필요하면 '검색: 검색어'와 같이 입력하세요."
                      : "API 키를 먼저 설정해주세요."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || !keyValidated}
                />
                <Button type="submit" disabled={loading || !keyValidated || !input.trim()}>
                  {input.toLowerCase().startsWith("검색:") ? (
                    <Search className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {input.toLowerCase().startsWith("검색:") && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                  <Search className="h-3 w-3 mr-1" />
                  <span>검색 모드: DuckDuckGo에서 검색 결과를 가져옵니다.</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

// 아이콘 컴포넌트
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
