"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code,
  Zap,
  Database,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Cpu,
  Bot,
  Home,
  ExternalLink,
  Workflow,
  Puzzle,
  Layers,
} from "lucide-react"
import Link from "next/link"

export default function ApiPlatformPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-6 flex items-center justify-between">
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
          <Link href="/api-console">
            <Button variant="outline" size="sm">
              <Code className="w-4 h-4 mr-2" />
              API 콘솔
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

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              B2B AI API Platform
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AIWorks API Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              기업을 위한 통합 AI API 플랫폼. 에이전트, 워크플로우, 지식베이스, 자동화 도구를 API로 제공하여 개발자들이
              쉽게 AI 기능을 통합할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/api-console">
              <Button size="lg" className="px-8 py-3">
                <Code className="w-5 h-5 mr-2" />
                API 콘솔 시작하기
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                API 문서 보기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* API Services */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">핵심 API 서비스</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              모든 AI 기능을 RESTful API로 제공하여 개발자들이 쉽게 통합할 수 있습니다.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8 h-auto p-2 bg-gray-100 rounded-xl">
              <TabsTrigger
                value="overview"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">개요</span>
              </TabsTrigger>
              <TabsTrigger
                value="agents"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <Bot className="w-5 h-5" />
                <span className="text-xs font-medium">AI 에이전트</span>
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <Workflow className="w-5 h-5" />
                <span className="text-xs font-medium">자동화 워크플로우</span>
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">지식베이스</span>
              </TabsTrigger>
              <TabsTrigger
                value="integration"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <Puzzle className="w-5 h-5" />
                <span className="text-xs font-medium">통합허브</span>
              </TabsTrigger>
              <TabsTrigger
                value="engines"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <Cpu className="w-5 h-5" />
                <span className="text-xs font-medium">AI 엔진</span>
              </TabsTrigger>
              <TabsTrigger
                value="blockchain"
                className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                <Layers className="w-5 h-5" />
                <span className="text-xs font-medium">AI기반 블록체인</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <Bot className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle>AI 에이전트 API</CardTitle>
                    <CardDescription>자율형 AI 에이전트와 지능형 추론 시스템</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        자율형 에이전트 생성
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        지능형 추론 시스템
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        AI 컴포넌트 자동생성
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <Workflow className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle>자동화 워크플로우 API</CardTitle>
                    <CardDescription>복잡한 비즈니스 프로세스를 완전 자동화</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        워크플로우 실행
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        스케줄링 & 트리거
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        실시간 모니터링
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardHeader>
                    <Database className="w-8 h-8 text-green-600 mb-2" />
                    <CardTitle>지식베이스 API</CardTitle>
                    <CardDescription>기업 지식을 AI가 활용할 수 있도록 하는 API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        문서 업로드/검색
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        벡터 임베딩
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        RAG 통합
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-indigo-200 bg-indigo-50/50">
                  <CardHeader>
                    <Puzzle className="w-8 h-8 text-indigo-600 mb-2" />
                    <CardTitle>통합 허브 API</CardTitle>
                    <CardDescription>다양한 서비스와 도구를 연결하는 API</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        서드파티 연동
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        데이터 동기화
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        웹훅 지원
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <Cpu className="w-8 h-8 text-orange-600 mb-2" />
                    <CardTitle>AI 엔진 API</CardTitle>
                    <CardDescription>EMAI 멀티모달 프레임워크와 고급 AI 엔진</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        EMAI 멀티모달 프레임워크
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        NAS 자동 구조 탐색
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        MoE 전문가 혼합 모델
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-red-200 bg-red-50/50">
                  <CardHeader>
                    <Layers className="w-8 h-8 text-red-600 mb-2" />
                    <CardTitle>AI기반 블록체인 API</CardTitle>
                    <CardDescription>탈중앙화 글로벌 AI모델과 연합학습 시스템</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        탈중앙화 글로벌 AI모델
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        연합학습 기반 지능형 블록체인 시스템
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        Web 3.0 스테이블,결제솔루션
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-6 h-6 mr-2" />
                    AI 에이전트 API
                  </CardTitle>
                  <CardDescription>자율형 AI 에이전트와 지능형 추론 시스템을 구축하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">주요 엔드포인트</h4>
                      <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/agents
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/agents/{"{id}"}
                        </div>
                        <div>
                          <span className="text-orange-600">PUT</span> /api/v1/agents/{"{id}"}
                        </div>
                        <div>
                          <span className="text-purple-600">POST</span> /api/v1/agents/{"{id}"}/chat
                        </div>
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/agents/autonomous
                        </div>
                        <div>
                          <span className="text-blue-600">POST</span> /api/v1/agents/reasoning
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">고급 기능</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          자율형 에이전트 생성/관리
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          지능형 추론 시스템
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          AI 컴포넌트 자동생성
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          다중 LLM 모델 지원
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          커스텀 프롬프트 템플릿
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          외부 도구 통합
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Workflow className="w-6 h-6 mr-2" />
                    자동화 워크플로우 API
                  </CardTitle>
                  <CardDescription>복잡한 비즈니스 프로세스를 완전 자동화하고 관리하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">주요 엔드포인트</h4>
                      <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/workflows
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/workflows/{"{id}"}
                        </div>
                        <div>
                          <span className="text-purple-600">POST</span> /api/v1/workflows/{"{id}"}/execute
                        </div>
                        <div>
                          <span className="text-orange-600">GET</span> /api/v1/workflows/{"{id}"}/status
                        </div>
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/automation/triggers
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/automation/schedules
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">자동화 기능</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          순차/병렬/조건부 실행
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          시간 기반 스케줄링
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          이벤트 트리거
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          실시간 모니터링
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          에러 핸들링 & 재시도
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          조건부 로직
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-6 h-6 mr-2" />
                    지식베이스 API
                  </CardTitle>
                  <CardDescription>기업 지식을 AI가 활용할 수 있도록 하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">주요 엔드포인트</h4>
                      <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/knowledgebases
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/knowledgebases/{"{id}"}
                        </div>
                        <div>
                          <span className="text-purple-600">POST</span> /api/v1/knowledgebases/{"{id}"}/documents
                        </div>
                        <div>
                          <span className="text-orange-600">GET</span> /api/v1/knowledgebases/{"{id}"}/search
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">지원 기능</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          문서 업로드 및 관리
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          벡터 임베딩 생성
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          RAG (Retrieval-Augmented Generation)
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          시맨틱 검색
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Puzzle className="w-6 h-6 mr-2" />
                    통합 허브 API
                  </CardTitle>
                  <CardDescription>모든 서비스와 도구를 하나로 연결하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">주요 엔드포인트</h4>
                      <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/integrations
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/integrations/{"{id}"}
                        </div>
                        <div>
                          <span className="text-purple-600">POST</span> /api/v1/integrations/{"{id}"}/sync
                        </div>
                        <div>
                          <span className="text-orange-600">POST</span> /api/v1/webhooks
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">지원 플랫폼</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Slack, Discord, Teams
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Google Workspace, Office 365
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Salesforce, HubSpot
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          GitHub, GitLab, Jira
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engines" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="w-6 h-6 mr-2" />
                    AI 엔진 API
                  </CardTitle>
                  <CardDescription>Penta Global AI 모델과 고급 AI 엔진을 통합하여 제공하는 API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">주요 엔드포인트</h4>
                      <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/engines/penta-global
                        </div>
                        <div>
                          <span className="text-blue-600">POST</span> /api/v1/engines/emai-multimodal
                        </div>
                        <div>
                          <span className="text-purple-600">POST</span> /api/v1/engines/nas-search
                        </div>
                        <div>
                          <span className="text-orange-600">POST</span> /api/v1/engines/moe-expert
                        </div>
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/engines/aiflow-automation
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/engines/models
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">AI 엔진 기능</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Penta Global AI 모델
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          하이브리드 생성형 AI모델 지원
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          EMAI 멀티모달 프레임워크
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          NAS 자동 구조 탐색
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          MoE 전문가 혼합 모델
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          AIFlow 자동화 엔진
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blockchain" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="w-6 h-6 mr-2" />
                    AI기반 블록체인 API
                  </CardTitle>
                  <CardDescription>탈중앙화된 AI 생태계와 연합학습 기반 블록체인 시스템</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">주요 엔드포인트</h4>
                      <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/blockchain/global-ai-models
                        </div>
                        <div>
                          <span className="text-blue-600">POST</span> /api/v1/blockchain/federated-learning
                        </div>
                        <div>
                          <span className="text-purple-600">POST</span> /api/v1/blockchain/web3-payment
                        </div>
                        <div>
                          <span className="text-orange-600">POST</span> /api/v1/blockchain/smart-contracts
                        </div>
                        <div>
                          <span className="text-green-600">POST</span> /api/v1/blockchain/governance
                        </div>
                        <div>
                          <span className="text-blue-600">GET</span> /api/v1/blockchain/rewards
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">AI기반 블록체인 기능</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          탈중앙화 글로벌 AI모델
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          FedAvg 연합학습 기반 지능형 블록체인 시스템
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Web 3.0 스테이블,결제솔루션
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          스마트 컨트랙트 기반 거버넌스
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          스마트 컨트랙트 자동화
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          실시간 AI 보상 분배 시스템
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Stats - 아래로 이동 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">플랫폼 현황</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">480+</div>
                <div className="text-sm text-gray-600">활성 API 키</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">98.9%</div>
                <div className="text-sm text-gray-600">업타임</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">1.2M+</div>
                <div className="text-sm text-gray-600">월간 API 호출</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">45+</div>
                <div className="text-sm text-gray-600">기업 고객</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">기업급 기능</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              대규모 기업 환경에서 안정적으로 운영할 수 있는 엔터프라이즈 기능을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>보안 & 인증</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    API 키 관리
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    OAuth 2.0 지원
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    IP 화이트리스트
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    데이터 암호화
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>모니터링 & 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    실시간 사용량 추적
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    성능 메트릭
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    오류 로깅
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    커스텀 대시보드
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Cpu className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>확장성 & 성능</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    자동 스케일링
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    로드 밸런싱
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    캐싱 최적화
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    글로벌 CDN
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">API 요금제</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              사용량에 따른 유연한 요금제로 비용 효율적으로 AI 기능을 활용하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>개발 및 테스트용</CardDescription>
                <div className="text-3xl font-bold mt-4">무료</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>월 1,000 API 호출</li>
                  <li>기본 AI 에이전트</li>
                  <li>커뮤니티 지원</li>
                  <li>기본 문서</li>
                </ul>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  시작하기
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">인기</Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>중소기업용</CardDescription>
                <div className="text-3xl font-bold mt-4">
                  $99<span className="text-lg font-normal">/월</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>월 100,000 API 호출</li>
                  <li>고급 AI 에이전트</li>
                  <li>워크플로우 자동화</li>
                  <li>이메일 지원</li>
                  <li>사용량 분석</li>
                </ul>
                <Button className="w-full mt-4">선택하기</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>대기업용</CardDescription>
                <div className="text-3xl font-bold mt-4">맞춤형</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>무제한 API 호출</li>
                  <li>전용 인프라</li>
                  <li>24/7 전담 지원</li>
                  <li>SLA 보장</li>
                  <li>온프레미스 배포</li>
                </ul>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  문의하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-xl mb-8 opacity-90">몇 분 안에 AI API를 통합하고 비즈니스를 혁신하세요</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/api-console">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                <Code className="w-5 h-5 mr-2" />
                API 콘솔 시작
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                영업팀 문의
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
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
