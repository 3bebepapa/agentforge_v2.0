"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Play, Settings, FileSymlink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ComponentMenu from "@/components/component-menu"

export function FlowBuilder() {
  const { toast } = useToast()
  const [flowName, setFlowName] = useState("새 플로우")
  const [selectedComponents, setSelectedComponents] = useState([])

  // 컴포넌트 선택 처리
  const handleSelectComponent = (component) => {
    setSelectedComponents((prev) => [...prev, component])

    toast({
      title: "컴포넌트 추가됨",
      description: `${component.name}이(가) 플로우에 추가되었습니다.`,
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex gap-4">
        {/* 왼쪽: 통합 컴포넌트 메뉴 */}
        <div className="w-80">
          <ComponentMenu context="flow-builder" onSelectComponent={handleSelectComponent} />
        </div>

        {/* 오른쪽: 플로우 빌더 인터페이스 */}
        <div className="flex-1">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>플로우 빌더</CardTitle>
              <CardDescription>시각적 플로우 구성 및 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Input
                    className="w-64"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    placeholder="플로우 이름"
                  />
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                  <Button>
                    <Play className="mr-2 h-4 w-4" />
                    실행
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <FileSymlink className="mr-2 h-4 w-4" />
                    프로세스 스튜디오로 내보내기
                  </Button>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="design">
                <TabsList className="mb-4">
                  <TabsTrigger value="design">디자인</TabsTrigger>
                  <TabsTrigger value="preview">미리보기</TabsTrigger>
                  <TabsTrigger value="code">코드</TabsTrigger>
                </TabsList>

                <TabsContent value="design">
                  <div className="border rounded-md p-4 min-h-[400px]">
                    {selectedComponents.length === 0 ? (
                      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                        왼쪽 메뉴에서 컴포넌트를 선택하여 플로우를 구성하세요
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">플로우 구성</h3>

                        {/* 선택된 컴포넌트 표시 */}
                        <div className="space-y-2">
                          {selectedComponents.map((component, index) => (
                            <Card key={index} className="overflow-hidden">
                              <div className="flex border-b">
                                <div className="p-3 flex items-center space-x-3 flex-1">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <div className="w-4 h-4 bg-primary/20 rounded"></div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{component.name}</h4>
                                    <p className="text-xs text-muted-foreground">{component.category}</p>
                                  </div>
                                </div>
                                <div className="flex items-center p-3 space-x-2">
                                  <Button size="sm" variant="outline">
                                    설정
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive bg-transparent"
                                    onClick={() => {
                                      setSelectedComponents((prev) => prev.filter((_, i) => i !== index))
                                    }}
                                  >
                                    제거
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="border rounded-md p-4 min-h-[400px]">
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      플로우 미리보기
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code">
                  <div className="border rounded-md p-4 min-h-[400px]">
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      플로우 코드 보기
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
