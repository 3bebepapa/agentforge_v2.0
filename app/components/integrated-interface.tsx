"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Play, Save, FileSymlink, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 통합 컴포넌트 메뉴 임포트
import ComponentMenu from "@/components/component-menu"

export default function IntegratedInterface() {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [taskName, setTaskName] = useState("")
  const [selectedComponents, setSelectedComponents] = useState([])

  // 컴포넌트 선택 처리
  const handleSelectComponent = (component) => {
    // 선택한 컴포넌트를 작업에 추가
    setSelectedComponents((prev) => [...prev, component])

    // 컴포넌트 유형에 따른 처리
    if (component.type === "llm") {
      toast({
        title: "AI 모델 추가됨",
        description: `${component.name}이(가) 작업에 추가되었습니다.`,
      })
    } else if (component.type === "workflow") {
      toast({
        title: "워크플로우 추가됨",
        description: `${component.name}이(가) 작업에 추가되었습니다.`,
      })
    }
  }

  // 작업 생성 처리
  const handleCreateTask = async () => {
    try {
      // 통합 API를 통해 작업 생성
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: taskName,
          prompt,
          components: selectedComponents.map((c) => c.id),
        }),
      })

      if (!response.ok) throw new Error("작업 생성 실패")

      const result = await response.json()

      toast({
        title: "작업이 생성되었습니다",
        description: `작업 ID: ${result.id}`,
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex gap-4">
        {/* 왼쪽: 통합 컴포넌트 메뉴 */}
        <div className="w-80">
          <ComponentMenu context="integrated-interface" onSelectComponent={handleSelectComponent} />
        </div>

        {/* 오른쪽: 작업 생성 인터페이스 */}
        <div className="flex-1">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>통합 인터페이스</CardTitle>
              <CardDescription>프롬프트 기반 작업 생성 및 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create">
                <TabsList className="mb-4">
                  <TabsTrigger value="create">작업 생성</TabsTrigger>
                  <TabsTrigger value="history">작업 기록</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">작업 이름</label>
                      <Input
                        placeholder="작업 이름을 입력하세요"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">프롬프트</label>
                      <Textarea
                        placeholder="작업 프롬프트를 입력하세요"
                        rows={6}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
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
                      <div className="space-x-2">
                        <Button variant="outline">
                          <FileSymlink className="mr-2 h-4 w-4" />
                          프로세스 스튜디오로 내보내기
                        </Button>
                        <Button variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          고급 설정
                        </Button>
                      </div>

                      <div className="space-x-2">
                        <Button variant="outline">
                          <Save className="mr-2 h-4 w-4" />
                          저장
                        </Button>
                        <Button onClick={handleCreateTask}>
                          <Play className="mr-2 h-4 w-4" />
                          실행
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">최근 작업</h3>

                    <div className="border rounded-md">
                      {/* 작업 기록 테이블 */}
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">이름</th>
                            <th className="px-4 py-2 text-left">생성 시간</th>
                            <th className="px-4 py-2 text-left">상태</th>
                            <th className="px-4 py-2 text-left">작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 샘플 데이터 */}
                          <tr className="border-b">
                            <td className="px-4 py-2">데이터 분석 작업</td>
                            <td className="px-4 py-2">2023-06-15 14:30</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">완료</span>
                            </td>
                            <td className="px-4 py-2">
                              <Button size="sm" variant="ghost">
                                보기
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2">코드 생성 작업</td>
                            <td className="px-4 py-2">2023-06-14 10:15</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">진행 중</span>
                            </td>
                            <td className="px-4 py-2">
                              <Button size="sm" variant="ghost">
                                보기
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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
