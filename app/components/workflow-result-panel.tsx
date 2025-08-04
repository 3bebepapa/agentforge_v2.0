"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WorkflowResultPanel({ results }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("summary")
  const [copiedStep, setCopiedStep] = useState(null)

  // 결과 복사
  const handleCopyResult = (stepId, content) => {
    navigator.clipboard.writeText(content)
    setCopiedStep(stepId)

    toast({
      title: "복사됨",
      description: "결과가 클립보드에 복사되었습니다.",
    })

    setTimeout(() => setCopiedStep(null), 2000)
  }

  // 결과 다운로드
  const handleDownloadResults = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `workflow-results-${new Date().toISOString()}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    toast({
      title: "다운로드 시작",
      description: "워크플로우 결과 파일이 다운로드됩니다.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">실행 결과</h2>
        <Button variant="outline" onClick={handleDownloadResults}>
          <Download className="mr-2 h-4 w-4" />
          결과 다운로드
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>실행 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">실행 시간</div>
              <div className="text-2xl font-bold">{results.executionTime || "0"}초</div>
            </div>
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">단계 수</div>
              <div className="text-2xl font-bold">{results.steps?.length || 0}</div>
            </div>
            <div className="border rounded-md p-3">
              <div className="text-sm text-muted-foreground">상태</div>
              <div className="text-2xl font-bold text-green-500">완료</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">요약</div>
            <p>{results.summary || "워크플로우가 성공적으로 실행되었습니다."}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">단계별 결과</TabsTrigger>
          <TabsTrigger value="raw">원시 데이터</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          {results.steps?.map((step, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                    {step.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        step.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : step.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {step.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyResult(step.id, JSON.stringify(step.output, null, 2))}
                    >
                      {copiedStep === step.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">처리 시간</div>
                    <div>{step.executionTime || "0"}ms</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">메모리 사용</div>
                    <div>{step.memoryUsage || "0"}MB</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">출력</div>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                      {JSON.stringify(step.output, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[500px]">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
