"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Download, Clock, Server, CheckCircle } from "lucide-react"

export default function ExecutionPanel({ results, onClose }) {
  const [activeTab, setActiveTab] = useState("결과")

  if (!results) return null

  return (
    <div className="border-t p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">실행 결과</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="결과">결과</TabsTrigger>
          <TabsTrigger value="단계별">단계별 결과</TabsTrigger>
          <TabsTrigger value="로그">로그</TabsTrigger>
        </TabsList>

        <TabsContent value="결과" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">실행 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-primary/5 rounded-md">
                  <Clock className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-medium">실행 시간</span>
                  <span className="text-lg">{results.executionTime || "3.2"}초</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-primary/5 rounded-md">
                  <Server className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-medium">메모리 사용</span>
                  <span className="text-lg">{results.memoryUsage || "58"}MB</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-primary/5 rounded-md">
                  <CheckCircle className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-medium">상태</span>
                  <span className="text-lg">{results.status || "성공"}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">인사이트</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>고객 문의의 75%가 제품 사용법에 관한 것입니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>반품 관련 문의는 전체의 15%를 차지합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>응답 시간은 평균 2.3초입니다.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  결과 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="단계별" className="space-y-4">
          {results.steps?.map((step, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  {step.name || `단계 ${index + 1}`}
                  <Badge className="ml-2" variant={step.status === "completed" ? "default" : "outline"}>
                    {step.status || "completed"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-muted-foreground">처리 시간:</span>
                    <span className="text-sm ml-1">{step.duration || "600ms"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">메모리 사용량:</span>
                    <span className="text-sm ml-1">{step.memoryUsage || "58MB"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">출력:</span>
                  <pre className="mt-1 text-xs p-2 bg-muted rounded-md overflow-x-auto">
                    {step.output || "고객 의도 분석 단계 실행 결과 데이터"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="로그" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto">
                {results.logs ||
                  `[2025-03-31 17:50:20] INFO: 프로세스 실행 시작
[2025-03-31 17:50:20] INFO: 고객 의도 분석 단계 시작
[2025-03-31 17:50:21] DEBUG: 입력 데이터 처리 중
[2025-03-31 17:50:21] INFO: 고객 의도 분석 완료: 제품 사용법 문의
[2025-03-31 17:50:21] INFO: 관련 지식 검색 단계 시작
[2025-03-31 17:50:22] DEBUG: 지식 베이스 쿼리 실행 중
[2025-03-31 17:50:22] INFO: 관련 문서 5개 검색됨
[2025-03-31 17:50:22] INFO: 응답 생성 단계 시작
[2025-03-31 17:50:23] DEBUG: 컨텍스트 구성 중
[2025-03-31 17:50:23] INFO: 응답 생성 완료
[2025-03-31 17:50:23] INFO: 프로세스 실행 완료 (총 시간: 3.2초)`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
