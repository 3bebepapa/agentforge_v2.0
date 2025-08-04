"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, Check, AlertCircle, RefreshCw, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileManager } from "@/lib/file-manager"

interface HistoryMenuProps {
  taskHistory: any[]
  onSelectTask: (task: any) => void
}

export function HistoryMenu({ taskHistory, onSelectTask }: HistoryMenuProps) {
  const [open, setOpen] = useState(false)

  // 작업 상태에 따른 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // 작업 상태에 따른 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  // 작업 상태에 따른 한글 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료"
      case "in_progress":
        return "진행 중"
      case "failed":
        return "실패"
      case "pending":
        return "대기 중"
      default:
        return "알 수 없음"
    }
  }

  // 작업 선택 처리 개선
  const handleSelectTask = (task: any) => {
    console.log("기록에서 작업 선택:", task)

    // 작업 데이터가 완전하지 않은 경우 전체 데이터 로드 시도
    if (!task.tasks || !Array.isArray(task.tasks)) {
      try {
        const fileManager = FileManager.getInstance()
        const fullTaskData = fileManager.loadTask(task.id)

        if (fullTaskData) {
          console.log("전체 작업 데이터 로드 성공:", fullTaskData)
          onSelectTask(fullTaskData)
        } else {
          console.warn("전체 작업 데이터를 로드할 수 없어 요약 데이터 사용:", task)
          onSelectTask(task)
        }
      } catch (error) {
        console.error("작업 데이터 로드 중 오류:", error)
        onSelectTask(task)
      }
    } else {
      onSelectTask(task)
    }

    setOpen(false)
  }

  // 작업 상태 표시 개선
  const renderTaskStatus = (task: any) => {
    // 작업 상태에 따른 아이콘 및 텍스트 표시
    return (
      <div className="flex items-center">
        {getStatusIcon(task.status)}
        <Badge variant={getStatusBadgeVariant(task.status)} className="ml-2">
          {getStatusText(task.status)}
        </Badge>
      </div>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          기록
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <DropdownMenuLabel>작업 기록</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {taskHistory.length === 0 ? (
            <div className="text-center p-4">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">작업 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {taskHistory.map((task) => (
                <DropdownMenuItem
                  key={task.id}
                  className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectTask(task)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 mr-2">
                      <div className="font-medium truncate">{task.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(task.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {renderTaskStatus(task)}
                  </div>

                  {task.context?.userRequest && (
                    <div className="text-xs text-muted-foreground mt-1 truncate w-full">
                      요청: {task.context.userRequest.substring(0, 50)}
                      {task.context.userRequest.length > 50 ? "..." : ""}
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
