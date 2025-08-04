"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Database, Bot, Code, Zap, MessageSquare, FileText, Workflow } from "lucide-react"

// 컴포넌트 타입 정의
interface Component {
  id: string
  name: string
  type: string
  description: string
  tags: string[]
  metadata?: any
}

// 샘플 컴포넌트 데이터
const sampleComponents: Component[] = [
  {
    id: "comp_1",
    name: "데이터베이스 커넥터",
    type: "database",
    description: "다양한 데이터베이스에 연결하고 쿼리를 실행합니다.",
    tags: ["데이터베이스", "SQL", "연결"],
  },
  {
    id: "comp_2",
    name: "GPT 에이전트",
    type: "agent",
    description: "GPT 기반 AI 에이전트를 생성하고 관리합니다.",
    tags: ["AI", "GPT", "에이전트"],
  },
  {
    id: "comp_3",
    name: "코드 실행기",
    type: "code",
    description: "다양한 언어의 코드를 실행하고 결과를 반환합니다.",
    tags: ["코드", "실행", "개발"],
  },
  {
    id: "comp_4",
    name: "API 통합",
    type: "api",
    description: "외부 API와 통합하여 데이터를 주고받습니다.",
    tags: ["API", "통합", "HTTP"],
  },
  {
    id: "comp_5",
    name: "데이터 변환기",
    type: "transform",
    description: "다양한 형식의 데이터를 변환하고 처리합니다.",
    tags: ["데이터", "변환", "처리"],
  },
  {
    id: "comp_6",
    name: "챗봇 인터페이스",
    type: "chat",
    description: "대화형 챗봇 인터페이스를 제공합니다.",
    tags: ["챗봇", "대화", "인터페이스"],
  },
  {
    id: "comp_7",
    name: "문서 처리기",
    type: "document",
    description: "문서를 처리하고 정보를 추출합니다.",
    tags: ["문서", "처리", "추출"],
  },
  {
    id: "comp_8",
    name: "워크플로우 관리자",
    type: "workflow",
    description: "복잡한 워크플로우를 관리하고 실행합니다.",
    tags: ["워크플로우", "관리", "자동화"],
  },
]

// 컴포넌트 아이콘 매핑
const componentIcons = {
  database: <Database className="h-4 w-4" />,
  agent: <Bot className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  api: <Zap className="h-4 w-4" />,
  transform: <Workflow className="h-4 w-4" />,
  chat: <MessageSquare className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  workflow: <Workflow className="h-4 w-4" />,
  default: <Plus className="h-4 w-4" />,
}

interface ComponentMenuProps {
  context?: string
  onSelectComponent?: (component: Component) => void
  className?: string
}

export default function ComponentMenu({ context = "default", onSelectComponent, className = "" }: ComponentMenuProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // 컴포넌트 필터링
  const filteredComponents = sampleComponents.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab = activeTab === "all" || component.type === activeTab

    return matchesSearch && matchesTab
  })

  // 컴포넌트 선택 처리
  const handleSelectComponent = (component: Component) => {
    if (onSelectComponent) {
      onSelectComponent(component)
    }
  }

  return (
    <Card className={`border rounded-lg ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">컴포넌트 메뉴</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="컴포넌트 검색..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                전체
              </TabsTrigger>
              <TabsTrigger value="agent" className="flex-1">
                에이전트
              </TabsTrigger>
              <TabsTrigger value="database" className="flex-1">
                데이터
              </TabsTrigger>
              <TabsTrigger value="api" className="flex-1">
                API
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {filteredComponents.length > 0 ? (
                  filteredComponents.map((component) => (
                    <ComponentItem
                      key={component.id}
                      component={component}
                      onSelect={() => handleSelectComponent(component)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="agent" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {filteredComponents.filter((c) => c.type === "agent").length > 0 ? (
                  filteredComponents
                    .filter((c) => c.type === "agent")
                    .map((component) => (
                      <ComponentItem
                        key={component.id}
                        component={component}
                        onSelect={() => handleSelectComponent(component)}
                      />
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    에이전트 컴포넌트가 없습니다. 다른 카테고리를 선택하세요.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="database" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {filteredComponents.filter((c) => c.type === "database").length > 0 ? (
                  filteredComponents
                    .filter((c) => c.type === "database")
                    .map((component) => (
                      <ComponentItem
                        key={component.id}
                        component={component}
                        onSelect={() => handleSelectComponent(component)}
                      />
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    데이터베이스 컴포넌트가 없습니다. 다른 카테고리를 선택하세요.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="api" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {filteredComponents.filter((c) => c.type === "api").length > 0 ? (
                  filteredComponents
                    .filter((c) => c.type === "api")
                    .map((component) => (
                      <ComponentItem
                        key={component.id}
                        component={component}
                        onSelect={() => handleSelectComponent(component)}
                      />
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    API 컴포넌트가 없습니다. 다른 카테고리를 선택하세요.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// 컴포넌트 아이템 컴포넌트
function ComponentItem({ component, onSelect }) {
  return (
    <div className="border rounded-md p-3 hover:bg-accent hover:cursor-pointer transition-colors" onClick={onSelect}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="mr-2 bg-primary/10 p-1.5 rounded-md">
            {componentIcons[component.type] || componentIcons.default}
          </div>
          <div className="font-medium">{component.name}</div>
        </div>
        <Badge variant="outline">{component.type}</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
      <div className="flex flex-wrap gap-1">
        {component.tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
