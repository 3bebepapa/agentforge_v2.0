"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { SavedFile } from "@/lib/file-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download } from "lucide-react"

interface FilePreviewProps {
  file: SavedFile | null
}

export function FilePreview({ file }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [previewContent, setPreviewContent] = useState<string | React.ReactNode>("")

  useEffect(() => {
    if (!file) return

    try {
      if (file.type === "json") {
        // JSON 파일 미리보기
        const jsonData = JSON.parse(file.content)
        setPreviewContent(
          <pre className="whitespace-pre-wrap text-xs overflow-auto">{JSON.stringify(jsonData, null, 2)}</pre>,
        )
      } else if (file.type === "html") {
        // HTML 파일 미리보기
        setPreviewContent(
          <div className="border p-4 rounded-md bg-white" dangerouslySetInnerHTML={{ __html: file.content }} />,
        )
      } else {
        // 기본 텍스트 미리보기
        setPreviewContent(<pre className="whitespace-pre-wrap text-xs overflow-auto">{file.content}</pre>)
      }
    } catch (error) {
      console.error("파일 미리보기 생성 중 오류가 발생했습니다:", error)
      setPreviewContent(
        <div className="text-destructive">
          파일 미리보기를 생성할 수 없습니다: {error instanceof Error ? error.message : String(error)}
        </div>,
      )
    }
  }, [file])

  if (!file) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center text-muted-foreground flex items-center justify-center h-full">
          미리보기할 파일을 선택하세요.
        </CardContent>
      </Card>
    )
  }

  const handleCopyContent = () => {
    if (!file) return
    navigator.clipboard.writeText(file.content)
    alert("파일 내용이 클립보드에 복사되었습니다.")
  }

  const handleDownloadFile = () => {
    if (!file) return

    const blob = new Blob([file.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{file.name}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyContent}>
              <Copy className="h-4 w-4 mr-2" />
              복사
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadFile}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">미리보기</TabsTrigger>
            <TabsTrigger value="code">코드</TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <TabsContent value="preview" className="h-full m-0 p-0">
              <ScrollArea className="h-[calc(100vh-250px)] border rounded-md p-4">{previewContent}</ScrollArea>
            </TabsContent>
            <TabsContent value="code" className="h-full m-0 p-0">
              <ScrollArea className="h-[calc(100vh-250px)] border rounded-md p-4">
                <pre className="whitespace-pre-wrap text-xs overflow-auto">{file.content}</pre>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
