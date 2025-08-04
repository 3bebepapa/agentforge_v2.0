"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Eye, Code, Workflow } from "lucide-react"
import { FileStorage } from "@/lib/file-storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FileManagerUI() {
  const [files, setFiles] = useState<Record<string, { content: string; type: string; createdAt: string }>>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [fileType, setFileType] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [fileFilter, setFileFilter] = useState<string>("all")

  // 파일 목록 로드
  useEffect(() => {
    loadFiles()
  }, [])

  // 파일 목록 로드 함수 수정
  const loadFiles = () => {
    try {
      const allFiles = FileStorage.getAllFiles()
      console.log("로드된 파일 목록:", Object.keys(allFiles))
      setFiles(allFiles)
    } catch (error) {
      console.error("파일 목록 로드 실패:", error)
      setFiles({})
    }
  }

  // 파일 다운로드 함수 수정
  const handleDownload = (filename: string) => {
    const success = FileStorage.downloadFile(filename)
    if (!success) {
      alert(`파일 다운로드 실패: ${filename}`)
    }
  }

  // 파일 삭제 함수 수정
  const handleDelete = (filename: string) => {
    if (window.confirm(`정말로 "${filename}" 파일을 삭제하시겠습니까?`)) {
      const success = FileStorage.deleteFile(filename)
      if (success) {
        loadFiles()

        if (selectedFile === filename) {
          setSelectedFile(null)
          setFileContent("")
          setFileType("")
        }
      } else {
        alert(`파일 삭제 실패: ${filename}`)
      }
    }
  }

  // 파일 미리보기 함수 수정
  const handlePreview = (filename: string) => {
    const file = FileStorage.getFile(filename)

    if (file) {
      setSelectedFile(filename)
      setFileContent(file.content)
      setFileType(file.type)
      setShowPreview(true)
    } else {
      alert(`파일을 찾을 수 없음: ${filename}`)
    }
  }

  // 파일 타입에 따른 아이콘 반환
  const getFileIcon = (filename: string, type: string) => {
    if (filename.includes("task_result")) {
      return <FileText className="h-4 w-4 text-blue-500" />
    } else if (filename.includes("workflow")) {
      return <Workflow className="h-4 w-4 text-purple-500" />
    } else if (type.includes("javascript")) {
      return <Code className="h-4 w-4 text-yellow-500" />
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // 파일 타입에 따른 배지 텍스트 반환
  const getFileTypeBadge = (filename: string, type: string) => {
    if (filename.includes("task_result")) {
      return "태스크 결과"
    } else if (filename.includes("workflow")) {
      return "워크플로우"
    } else if (type.includes("javascript")) {
      return "컴포넌트"
    } else {
      return "파일"
    }
  }

  // 필터링된 파일 목록
  const filteredFiles = Object.entries(files).filter(([filename, file]) => {
    if (fileFilter === "all") return true
    if (fileFilter === "task" && filename.includes("task_result")) return true
    if (fileFilter === "component" && file.type.includes("javascript")) return true
    if (fileFilter === "workflow" && filename.includes("workflow")) return true
    return false
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">저장된 파일</CardTitle>
            <Tabs value={fileFilter} onValueChange={setFileFilter} className="w-auto">
              <TabsList className="grid grid-cols-4 w-auto">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="task">태스크</TabsTrigger>
                <TabsTrigger value="component">컴포넌트</TabsTrigger>
                <TabsTrigger value="workflow">워크플로우</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>저장된 태스크 결과, 컴포넌트, 워크플로우 파일 목록</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredFiles.length === 0 ? (
              <div className="text-center p-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">저장된 파일 없음</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  아직 저장된 파일이 없습니다. 태스크를 실행하고 결과를 저장해보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map(([filename, file]) => (
                  <div key={filename} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      {getFileIcon(filename, file.type)}
                      <div className="ml-3">
                        <div className="font-medium text-sm">{filename}</div>
                        <div className="text-xs text-muted-foreground">{new Date(file.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{getFileTypeBadge(filename, file.type)}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handlePreview(filename)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(filename)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(filename)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 파일 미리보기 다이얼로그 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile}</DialogTitle>
            <DialogDescription>
              {new Date(files[selectedFile || ""]?.createdAt || "").toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ScrollArea className="h-[500px] border rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm">{fileContent}</pre>
            </ScrollArea>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              닫기
            </Button>
            <Button onClick={() => handleDownload(selectedFile || "")}>
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
