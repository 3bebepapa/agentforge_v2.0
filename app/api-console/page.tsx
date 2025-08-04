"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Code,
  Copy,
  Play,
  Key,
  BarChart3,
  Book,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Home,
  ExternalLink,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function APIConsolePage() {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState("agents")
  const [requestBody, setRequestBody] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usage, setUsage] = useState({
    totalCalls: 12450,
    monthlyLimit: 100000,
    successRate: 99.2,
  })

  // API 키 생성
  const generateApiKey = () => {
    const newKey = `aiw_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setApiKey(newKey)
  }

  // API 호출 시뮬레이션
  const testApiCall = async () => {
    if (!apiKey) {
      alert("API 키를 먼저 생성해주세요.")
      return
    }

    setIsLoading(true)

    // 시뮬레이션 지연
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResponse = {
      agents: {
        success: true,
        data: {
          id: "agent_123",
          name: "Customer Service Agent",
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
          model: "gpt-4",
          prompt: "You are a helpful customer service agent...",
        },
      },
      workflows: {
        success: true,
        data: {
          id: "workflow_456",
          name: "Data Processing Pipeline",
          status: "running",
          steps: 5,
          completed_steps: 3,
          estimated_completion: "2024-01-15T11:00:00Z",
        },
      },
      knowledge: {
        success: true,
        data: {
          id: "kb_789",
          documents: 1250,
          total_size: "2.5GB",
          last_updated: "2024-01-15T09:45:00Z",
          embeddings: 45000,
        },
      },
    }

    setResponse(JSON.stringify(mockResponse[selectedEndpoint as keyof typeof mockResponse], null, 2))
    setIsLoading(false)
  }

  const apiEndpoints = {
    agents: {
      name: "AI 에이전트",
      method: "POST",
      url: "/api/v1/agents",
      description: "새로운 AI 에이전트를 생성합니다",
      example: {
        name: "Customer Service Agent",
        model: "gpt-4",
        prompt: "You are a helpful customer service agent...",
        tools: ["web_search", "knowledge_base"],
      },
    },
    workflows: {
      name: "워크플로우",
      method: "POST",
      url: "/api/v1/workflows/execute",
      description: "워크플로우를 실행합니다",
      example: {
        workflow_id: "workflow_123",
        input_data: {
          text: "Process this document",
          options: { format: "json" },
        },
      },
    },
    knowledge: {
      name: "지식베이스",
      method: "GET",
      url: "/api/v1/knowledge/search",
      description: "지식베이스에서 정보를 검색합니다",
      example: {
        query: "customer support policies",
        limit: 10,
        threshold: 0.8,
      },
    },
  }

  useEffect(() => {
    const endpoint = apiEndpoints[selectedEndpoint as keyof typeof apiEndpoints]
    setRequestBody(JSON.stringify(endpoint.example, null, 2))
  }, [selectedEndpoint])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - 메인과 동일한 스타일 */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI Works</h1>
          <Badge variant="outline" className="ml-2">
            BETA
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              메인으로
            </Button>
          </Link>
          <Link href="/api-platform">
            <Button variant="outline" size="sm">
              <Code className="w-4 h-4 mr-2" />
              B2B API 플랫폼
            </Button>
          </Link>
          <Link href="https://www.squareai.dev/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Penta AI
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AIWorks API 콘솔</h1>
            <p className="text-gray-600">API를 테스트하고 통합을 시작하세요</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* API 키 관리 */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    API 키 관리
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>API 키</Label>
                    <div className="flex mt-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        placeholder="API 키를 생성하세요"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={generateApiKey} className="flex-1">
                      키 생성
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(apiKey)}
                      disabled={!apiKey}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  {apiKey && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>API 키가 생성되었습니다. 안전한 곳에 보관하세요.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* 사용량 통계 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    사용량 통계
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>월간 API 호출</span>
                      <span>
                        {usage.totalCalls.toLocaleString()} / {usage.monthlyLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(usage.totalCalls / usage.monthlyLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{usage.successRate}%</div>
                      <div className="text-xs text-gray-600">성공률</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">45ms</div>
                      <div className="text-xs text-gray-600">평균 응답시간</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API 테스트 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    API 테스트
                  </CardTitle>
                  <CardDescription>실제 API 엔드포인트를 테스트해보세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="agents">AI 에이전트</TabsTrigger>
                      <TabsTrigger value="workflows">워크플로우</TabsTrigger>
                      <TabsTrigger value="knowledge">지식베이스</TabsTrigger>
                    </TabsList>

                    {Object.entries(apiEndpoints).map(([key, endpoint]) => (
                      <TabsContent key={key} value={key} className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                          <Badge variant={endpoint.method === "POST" ? "default" : "secondary"}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm">{endpoint.url}</code>
                        </div>

                        <p className="text-sm text-gray-600">{endpoint.description}</p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>요청 본문</Label>
                            <Textarea
                              value={requestBody}
                              onChange={(e) => setRequestBody(e.target.value)}
                              className="mt-1 font-mono text-sm"
                              rows={12}
                            />
                          </div>

                          <div>
                            <Label>응답</Label>
                            <ScrollArea className="mt-1 h-[300px] w-full border rounded p-3 bg-gray-50">
                              {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                  <span className="ml-2">API 호출 중...</span>
                                </div>
                              ) : response ? (
                                <pre className="text-sm font-mono">{response}</pre>
                              ) : (
                                <div className="text-gray-500 text-sm">API를 호출하면 응답이 여기에 표시됩니다</div>
                              )}
                            </ScrollArea>
                          </div>
                        </div>

                        <Button onClick={testApiCall} disabled={isLoading || !apiKey} className="w-full">
                          <Play className="w-4 h-4 mr-2" />
                          API 호출 테스트
                        </Button>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* 빠른 시작 가이드 */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="w-5 h-5 mr-2" />
                    빠른 시작 가이드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">API 키 생성</h4>
                        <p className="text-sm text-gray-600">위의 "키 생성" 버튼을 클릭하여 API 키를 생성하세요.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">API 테스트</h4>
                        <p className="text-sm text-gray-600">
                          원하는 엔드포인트를 선택하고 "API 호출 테스트" 버튼을 클릭하세요.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">통합 시작</h4>
                        <p className="text-sm text-gray-600">API 문서를 참고하여 애플리케이션에 통합하세요.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">cURL 예제</h4>
                    <code className="text-sm bg-blue-100 p-2 rounded block overflow-x-auto">
                      {`curl -X POST https://api.aiworks.com/v1/agents \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody}'`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - 메인과 동일한 스타일 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
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
