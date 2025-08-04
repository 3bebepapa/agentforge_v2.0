"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FileManager, type SavedFile } from "@/lib/file-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Trash2, Eye, Download, Code } from "lucide-react"

interface FileListProps {
  onSelectFile?: (file: SavedFile) => void
  onViewCode?: (file: SavedFile) => void
  onPreviewFile?: (file: SavedFile) => void
}

export function FileList({ onSelectFile, onViewCode, onPreviewFile }: FileListProps) {
  const [files, setFiles] = useState<SavedFile[]>([])
  const fileManager = FileManager.getInstance()

  const loadFiles = () => {
    const allFiles = fileManager.getAllFiles()
    setFiles(allFiles.sort((a, b) => b.createdAt - a.createdAt))
  }

  useEffect(() => {
    loadFiles()

    // 5초마다 파일 목록 갱신
    const interval = setInterval(loadFiles, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("정말 이 파일을 삭제하시겠습니까?")) {
      fileManager.deleteFile(id)
      loadFiles()
    }
  }

  const handleDownloadFile = (file: SavedFile, e: React.MouseEvent) => {
    e.stopPropagation()

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

  const handleViewCode = (file: SavedFile, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewCode) onViewCode(file)
  }

  const handlePreviewFile = (file: SavedFile, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreviewFile) onPreviewFile(file)
  }

  const getFileIcon = (file: SavedFile) => {
    // 메타데이터 기반 아이콘
    if (file.metadata?.type === "component") {
      return <FileText className="h-4 w-4 text-blue-500" />
    } else if (file.metadata?.type === "workflow") {
      return <FileText className="h-4 w-4 text-green-500" />
    } else if (file.metadata?.type === "taskResult") {
      return <FileText className="h-4 w-4 text-purple-500" />
    }

    // 파일 타입 기반 아이콘
    switch (file.type) {
      case "json":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "js":
      case "ts":
        return <FileText className="h-4 w-4 text-yellow-500" />
      case "html":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "css":
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">저장된 파일</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {files.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">저장된 파일이 없습니다</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">작업 결과를 저장하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 cursor-pointer"
                  onClick={() => onSelectFile && onSelectFile(file)}
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(file.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleViewCode && handleViewCode(file, e)}
                      title="코드 보기"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handlePreviewFile && handlePreviewFile(file, e)}
                      title="미리보기"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => handleDownloadFile(file, e)} title="다운로드">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => handleDeleteFile(file.id, e)} title="삭제">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
