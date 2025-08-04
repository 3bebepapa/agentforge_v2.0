"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Info, Check, Copy } from "lucide-react"

interface ProcessStudioExporterProps {
  tasks: any[]
  components: any[]
  workflows: any[]
}

export function ProcessStudioExporter({ tasks, components, workflows }: ProcessStudioExporterProps) {
  const [copied, setCopied] = useState(false)

  // 프로세스 스튜디오 형식으로 변환
  const convertToProcessStudioFormat = () => {
    // 프로세스 스튜디오 형식 객체 생성
    const processStudioData = {
      version: "1.0",
      metadata: {
        exportedAt: new Date().toISOString(),
        source: "AgentForge",
      },
      components: components.map((component) => ({
        id: component.id || `comp_${Math.random().toString(36).substring(2, 9)}`,
        name: component.name || "Unnamed Component",
        type: component.type || "custom",
        description: component.description || "",
        features: component.features || [],
        implementation: component.implementation || "",
        config: component.config || {},
      })),
      workflows: workflows.map((workflow) => ({
        id: workflow.id || `wf_${Math.random().toString(36).substring(2, 9)}`,
        name: workflow.name || "Unnamed Workflow",
        description: workflow.description || "",
        steps: workflow.steps || [],
        config: workflow.config || {},
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        context: task.context,
      })),
    }

    return JSON.stringify(processStudioData, null, 2)
  }

  // 내보내기 데이터
  const exportData = convertToProcessStudioFormat()

  // 클립보드에 복사
  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 파일로 다운로드
  const downloadAsFile = () => {
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `process_studio_export_${new Date().toISOString().replace(/:/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">프로세스 스튜디오 내보내기</CardTitle>
          <CardDescription>
            AgentForge에서 생성된 컴포넌트와 워크플로우를 프로세스 스튜디오 형식으로 내보냅니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              이 데이터를 프로세스 스튜디오에 가져오면 컴포넌트와 워크플로우를 시각적으로 편집하고 실행할 수 있습니다.
              프로세스 스튜디오는 AgentForge와 호환되는 별도의 도구입니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="text-sm font-medium">내보내기 요약:</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{components.length}</div>
                <div className="text-sm text-muted-foreground">컴포넌트</div>
              </div>
              <div className="border rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{workflows.length}</div>
                <div className="text-sm text-muted-foreground">워크플로우</div>
              </div>
              <div className="border rounded-md p-3 text-center">
                <div className="text-2xl font-bold">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">태스크</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">내보내기 데이터:</div>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm">{exportData}</pre>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                클립보드에 복사
              </>
            )}
          </Button>
          <Button onClick={downloadAsFile}>
            <Download className="mr-2 h-4 w-4" />
            파일로 다운로드
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
