"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Database, Globe, MessageSquare, FileText, RefreshCw, Settings, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 중앙 레지스트리 API 클라이언트
import { useIntegrations } from "@/lib/registry-client"

// 통합 유형 정의
const integrationTypes = [
  { id: "database", name: "데이터베이스", icon: <Database className="h-5 w-5" /> },
  { id: "api", name: "API", icon: <Globe className="h-5 w-5" /> },
  { id: "llm", name: "LLM", icon: <MessageSquare className="h-5 w-5" /> },
  { id: "file", name: "파일 스토리지", icon: <FileText className="h-5 w-5" /> },
]

export default function IntegrationHub() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("connections")

  // 중앙 레지스트리에서 데이터 가져오기
  const { integrations } = useIntegrations()

  // 샘플 통합 데이터
  const sampleIntegrations = [
    {
      id: "1",
      name: "PostgreSQL 데이터베이스",
      type: "database",
      status: "active",
      lastUsed: "2023-06-15T14:30:00Z",
    },
    {
      id: "2",
      name: "OpenAI API",
      type: "llm",
      status: "active",
      lastUsed: "2023-06-14T10:15:00Z",
    },
    {
      id: "3",
      name: "S3 스토리지",
      type: "file",
      status: "inactive",
      lastUsed: "2023-06-10T09:45:00Z",
    },
  ]

  // 통합 추가 처리
  const handleAddIntegration = async (type) => {
    // 통합 추가 모달 표시 또는 페이지 이동
    window.location.href = `/integration-hub/new?type=${type}`
  }

  // 통합 테스트 처리
  const handleTestIntegration = async (id) => {
    try {
      // 통합 API를 통해 통합 테스트
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("통합 테스트 실패")

      toast({
        title: "통합 테스트 성공",
        description: "연결이 정상적으로 작동합니다.",
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>통합 허브</CardTitle>
          <CardDescription>외부 시스템 연동 관리</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connections" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="connections">연결</TabsTrigger>
              <TabsTrigger value="templates">템플릿</TabsTrigger>
              <TabsTrigger value="logs">로그</TabsTrigger>
            </TabsList>

            <TabsContent value="connections">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">연결 관리</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => setActiveTab("templates")}>
                      <PlusCircle className="mr-2 h-4 w-4" />새 연결
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {sampleIntegrations.map((integration) => {
                    const typeInfo = integrationTypes.find((t) => t.id === integration.type)

                    return (
                      <Card key={integration.id} className="overflow-hidden">
                        <div className="flex border-b">
                          <div className="p-4 flex items-center space-x-4 flex-1">
                            <div className="bg-primary/10 p-2 rounded-full">{typeInfo?.icon}</div>
                            <div>
                              <h4 className="font-medium">{integration.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {typeInfo?.name} • {integration.status === "active" ? "활성" : "비활성"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center p-4 space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleTestIntegration(integration.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              테스트
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="mr-2 h-4 w-4" />
                              설정
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="text-sm">
                            <p>마지막 사용: {new Date(integration.lastUsed).toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">통합 템플릿</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrationTypes.map((type) => (
                    <Card
                      key={type.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleAddIntegration(type.id)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">{type.icon}</div>
                          <CardTitle className="text-base">{type.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          추가
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">통합 로그</h3>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">시간</th>
                        <th className="px-4 py-2 text-left">통합</th>
                        <th className="px-4 py-2 text-left">이벤트</th>
                        <th className="px-4 py-2 text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 샘플 데이터 */}
                      <tr className="border-b">
                        <td className="px-4 py-2">2023-06-15 14:35</td>
                        <td className="px-4 py-2">PostgreSQL 데이터베이스</td>
                        <td className="px-4 py-2">쿼리 실행</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">성공</span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2">2023-06-15 14:30</td>
                        <td className="px-4 py-2">OpenAI API</td>
                        <td className="px-4 py-2">모델 호출</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">성공</span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2">2023-06-15 14:25</td>
                        <td className="px-4 py-2">S3 스토리지</td>
                        <td className="px-4 py-2">파일 업로드</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">실패</span>
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
  )
}
