"use client"
import { Button } from "@/components/ui/button"
import { MessageSquare, Database, Code, FileText, Filter, ArrowRightLeft, Globe, Clock } from "lucide-react"

// 노드 유형 정의
const nodeTypes = [
  { id: "prompt", name: "프롬프트", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "llm", name: "LLM", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "database", name: "데이터베이스", icon: <Database className="h-4 w-4" /> },
  { id: "code", name: "코드 실행", icon: <Code className="h-4 w-4" /> },
  { id: "file", name: "파일", icon: <FileText className="h-4 w-4" /> },
  { id: "filter", name: "필터", icon: <Filter className="h-4 w-4" /> },
  { id: "transform", name: "변환", icon: <ArrowRightLeft className="h-4 w-4" /> },
  { id: "http", name: "HTTP 요청", icon: <Globe className="h-4 w-4" /> },
  { id: "delay", name: "지연", icon: <Clock className="h-4 w-4" /> },
]

// 노드 패널 컴포넌트
export function NodePanel({ onAddNode }) {
  return (
    <div className="space-y-2">
      {nodeTypes.map((nodeType) => (
        <Button
          key={nodeType.id}
          variant="outline"
          className="w-full justify-start"
          onClick={() => onAddNode(nodeType.id)}
        >
          {nodeType.icon}
          <span className="ml-2">{nodeType.name}</span>
        </Button>
      ))}
    </div>
  )
}
