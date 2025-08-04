"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CodePanel({ code }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("javascript")
  const [copied, setCopied] = useState(false)

  // 코드 복사
  const handleCopyCode = () => {
    const codeText = code[activeTab] || ""
    navigator.clipboard.writeText(codeText)
    setCopied(true)

    toast({
      title: "복사됨",
      description: "코드가 클립보드에 복사되었습니다.",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  // 코드 다운로드
  const handleDownloadCode = () => {
    const codeText = code[activeTab] || ""
    const fileExtension =
      activeTab === "javascript" ? "js" : activeTab === "python" ? "py" : activeTab === "typescript" ? "ts" : "txt"

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(codeText)
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `workflow.${fileExtension}`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    toast({
      title: "다운로드 시작",
      description: `워크플로우 코드가 ${fileExtension} 파일로 다운로드됩니다.`,
    })
  }

  // 코드 라인 번호 렌더링 함수
  const renderCodeWithLineNumbers = (codeText) => {
    if (!codeText) return <div className="text-gray-400">해당 언어로 생성된 코드가 없습니다.</div>

    const lines = codeText.split("\n")

    return (
      <div className="flex">
        {/* 라인 번호 */}
        <div className="pr-4 text-gray-500 select-none text-right min-w-[40px]">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* 코드 내용 */}
        <div className="flex-1 overflow-x-auto">
          <pre className="leading-6 whitespace-pre">{codeText}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">생성된 코드</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCopyCode}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "복사됨" : "코드 복사"}
          </Button>
          <Button variant="outline" onClick={handleDownloadCode}>
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-[#1e1e1e] text-white p-4 rounded-md text-xs overflow-auto max-h-[600px]">
            {renderCodeWithLineNumbers(code[activeTab])}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>이 코드는 워크플로우를 기반으로 자동 생성되었습니다. 필요에 따라 수정하여 사용하세요.</p>
      </div>
    </div>
  )
}
