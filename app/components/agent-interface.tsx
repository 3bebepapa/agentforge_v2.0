"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Play, FileSymlink, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 통합 컴포넌트 메뉴 임포트
import ComponentMenu from "@/components/component-menu"

export default function AgentInterface() {
  const { toast } = useToast()
  const [agentName, setAgentName] = useState("새 에이전트")
  const [agentPrompt, setAgentPrompt] = useState("")
  const [selectedComponents, setSelectedComponents] = useState([])
  const [chatMessages, setChatMessages] = useState([{ role: "system", content: "안녕하세요! 무엇을 도와드릴까요?" }])
  const [userMessage, setUserMessage] = useState("")

  // 컴포넌트 선택 처리
  const handleSelectComponent = (component) => {
    // 선택한 컴포넌트를 에이전트에 추가
    setSelectedComponents((prev) => [...prev, component])

    toast({
      title: "컴포넌트 추가됨",
      description: `${component.name}이(가) 에이전트에 추가되었습니다.`,
    })
  }

  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (!userMessage.trim()) return

    // 사용자 메시지 추가
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // 에이전트 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `에이전트 응답: "${userMessage}"에 대한 답변입니다.`,
        },
      ])
    }, 1000)

    setUserMessage("")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex gap-4">
        {/* 왼쪽: 통합 컴포넌트 메뉴 */}
        <div className="w-80">
          <ComponentMenu context="agent" onSelectComponent={handleSelectComponent} />
        </div>

        {/* 오른쪽: 에이전트 인터페이스 */}
        <div className="flex-1">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>에이전트 인터페이스</CardTitle>
              <CardDescription>에이전트 구성 및 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="design">
                <TabsList className="mb-4">
                  <TabsTrigger value="design">설계</TabsTrigger>
                  <TabsTrigger value="chat">채팅</TabsTrigger>
                  <TabsTrigger value="settings">설정</TabsTrigger>
                </TabsList>

                <TabsContent value="design">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">에이전트 이름</label>
                      <Input
                        placeholder="에이전트 이름을 입력하세요"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">시스템 프롬프트</label>
                      <Textarea
                        placeholder="에이전트의 시스템 프롬프트를 입력하세요"
                        rows={6}
                        value={agentPrompt}
                        onChange={(e) => setAgentPrompt(e.target.value)}
                      />
                    </div>

                    {/* 선택된 컴포넌트 표시 */}
                    {selectedComponents.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">선택된 컴포넌트</label>
                        <div className="mt-2 border rounded-md p-3">
                          {selectedComponents.map((component, index) => (
                            <div key={index} className="flex items-center justify-between py-1 border-b last:border-0">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded-full mr-2">{component.icon}</div>
                                <span>{component.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedComponents((prev) => prev.filter((_, i) => i !== index))
                                }}
                              >
                                제거
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button variant="outline">
                        <FileSymlink className="mr-2 h-4 w-4" />
                        프로세스 스튜디오로 내보내기
                      </Button>

                      <div className="space-x-2">
                        <Button variant="outline">
                          <Save className="mr-2 h-4 w-4" />
                          저장
                        </Button>
                        <Button>
                          <Play className="mr-2 h-4 w-4" />
                          테스트
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chat">
                  <div className="border rounded-md h-[500px] flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto">
                      {chatMessages.map((message, index) => (
                        <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : ""}`}>
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t p-4 flex">
                      <Input
                        placeholder="메시지를 입력하세요..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSendMessage()
                          }
                        }}
                        className="flex-1 mr-2"
                      />
                      <Button onClick={handleSendMessage}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        전송
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">에이전트 설정</h3>

                    <div className="border rounded-md p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">메모리 유형</label>
                          <select className="w-full border rounded-md p-2 mt-1">
                            <option>기본 메모리</option>
                            <option>벡터 메모리</option>
                            <option>대화 메모리</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">최대 토큰</label>
                          <Input type="number" defaultValue={4000} />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Temperature</label>
                          <Input type="number" defaultValue={0.7} step={0.1} min={0} max={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
