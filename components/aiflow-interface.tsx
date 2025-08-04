"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BrainCircuit, Workflow, TestTube, AlertCircle } from "lucide-react"

export function AIFlowInterface({ apiKey = "" }) {
  const [activeTab, setActiveTab] = useState("models")

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">AI Flow</h1>
          <Badge variant="outline">베타</Badge>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>개발 중인 기능</AlertTitle>
          <AlertDescription>AI Flow는 현재 개발 중인 기능입니다. 곧 더 많은 기능이 추가될 예정입니다.</AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="models" className="flex items-center">
              <BrainCircuit className="mr-2 h-4 w-4" />
              AI 모델
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center">
              <Workflow className="mr-2 h-4 w-4" />
              워크플로우
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center">
              <TestTube className="mr-2 h-4 w-4" />
              테스트
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">AI 모델</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>GPT-4</CardTitle>
                  <CardDescription>OpenAI의 최신 대형 언어 모델</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        활성
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">버전:</span>
                      <span className="text-sm">최신</span>
                    </div>
                    <Button className="w-full mt-4">모델 사용</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Claude 3</CardTitle>
                  <CardDescription>Anthropic의 고급 AI 어시스턴트</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        활성
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">버전:</span>
                      <span className="text-sm">Opus</span>
                    </div>
                    <Button className="w-full mt-4">모델 사용</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gemini Pro</CardTitle>
                  <CardDescription>Google의 멀티모달 AI 모델</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        설정 필요
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">버전:</span>
                      <span className="text-sm">1.0</span>
                    </div>
                    <Button className="w-full mt-4">API 키 설정</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">AI 워크플로우</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>텍스트 요약 워크플로우</CardTitle>
                  <CardDescription>긴 텍스트를 요약하는 AI 워크플로우</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">모델:</span>
                      <span className="text-sm">GPT-4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        준비됨
                      </Badge>
                    </div>
                    <Button className="w-full mt-4">워크플로우 실행</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>이미지 분석 워크플로우</CardTitle>
                  <CardDescription>이미지를 분석하고 설명하는 AI 워크플로우</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">모델:</span>
                      <span className="text-sm">Gemini Pro</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        설정 필요
                      </Badge>
                    </div>
                    <Button className="w-full mt-4" disabled>
                      API 키 설정 필요
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">AI 모델 테스트</h2>
            <Card>
              <CardHeader>
                <CardTitle>모델 테스트 도구</CardTitle>
                <CardDescription>다양한 AI 모델의 성능을 테스트하고 비교합니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    이 기능은 현재 개발 중입니다. 곧 사용할 수 있게 될 예정입니다.
                  </p>
                  <Button disabled>테스트 시작</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AIFlowInterface
