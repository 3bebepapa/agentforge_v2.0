"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, MessageSquare, FileCode, Workflow, Braces, Bot, Filter } from "lucide-react"

// 컴포넌트 타입 정의
type Component = {
  id: string
  name: string
  description: string
  type: string
  category: string
  icon: React.ReactNode
  metadata: Record<string, any>
}

// 컴포넌트 메뉴 속성 정의
type ComponentMenuProps = {
  context: string // process, workflow, flow
  onSelectComponent: (component: Component) => void
  className?: string
}

export default function ComponentMenu({ context, onSelectComponent, className = "" }: ComponentMenuProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [components, setComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [activeTab, setActiveTab] = useState("템플릿")

  // 컴포넌트 목록 가져오기
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch(`/api/components?context=${context}`)
        const data = await response.json()
        setComponents(data)
        setFilteredComponents(data)
      } catch (error) {
        console.error("컴포넌트 로딩 오류:", error)
      }
    }

    fetchComponents()
  }, [context])

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredComponents(components)
      return
    }

    const filtered = components.filter(
      (component) =>
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    setFilteredComponents(filtered)
  }, [searchTerm, components])

  // 컨텍스트에 따른 탭 설정
  const getTabs = () => {
    if (context === "process") {
      return (
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="템플릿">템플릿</TabsTrigger>
          <TabsTrigger value="AI 노드">AI 노드</TabsTrigger>
        </TabsList>
      )
    } else if (context === "workflow") {
      return (
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="템플릿">템플릿</TabsTrigger>
          <TabsTrigger value="노드">노드</TabsTrigger>
          <TabsTrigger value="데이터">데이터</TabsTrigger>
        </TabsList>
      )
    } else {
      return (
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="템플릿">템플릿</TabsTrigger>
          <TabsTrigger value="노드">노드</TabsTrigger>
        </TabsList>
      )
    }
  }

  // 아이콘 매핑
  const getIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />
      case "api":
        return <FileCode className="h-4 w-4" />
      case "agent":
        return <Bot className="h-4 w-4" />
      case "workflow":
        return <Workflow className="h-4 w-4" />
      case "transform":
        return <Filter className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Braces className="h-4 w-4" />
    }
  }

  // 컴포넌트 카드 렌더링
  const renderComponentCard = (component: Component) => (
    <Card
      key={component.id}
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={() => onSelectComponent(component)}
    >
      <CardContent className="p-3 flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-full">{getIcon(component.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate">{component.name}</h3>
            <Badge variant="outline" className="ml-2 text-xs">
              {component.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{component.description}</p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b">
        <Input
          placeholder="컴포넌트 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {getTabs()}

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="템플릿" className="m-0 space-y-2">
            {filteredComponents.filter((c) => c.category === "템플릿").map(renderComponentCard)}
          </TabsContent>

          <TabsContent value="AI 노드" className="m-0 space-y-2">
            {filteredComponents.filter((c) => c.category === "AI").map(renderComponentCard)}
          </TabsContent>

          <TabsContent value="노드" className="m-0 space-y-2">
            {filteredComponents.filter((c) => c.category === "노드").map(renderComponentCard)}
          </TabsContent>

          <TabsContent value="데이터" className="m-0 space-y-2">
            {filteredComponents.filter((c) => c.category === "데이터").map(renderComponentCard)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
