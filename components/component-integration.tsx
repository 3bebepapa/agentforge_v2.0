"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Workflow, Bot, Code, Database, MessageSquare, FileText, BarChart, Globe, Image } from "lucide-react"
import { useComponentAutomator } from "@/hooks/use-component-automator"
import { agentTemplates } from "@/lib/agent-templates"

interface ComponentIntegrationProps {
  apiKey?: string
}

export function ComponentIntegration({ apiKey }: ComponentIntegrationProps) {
  const [activeTab, setActiveTab] = useState("agents")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const {
    components,
    selectedComponentId,
    isGenerating,
    generateComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
  } = useComponentAutomator(apiKey)

  // 에이전트 템플릿 카테고리 목록
  const agentCategories = ["all", ...Array.from(new Set(agentTemplates.map((t) => t.category)))]

  // 필터링된 에이전트 템플릿
  const filteredAgentTemplates = agentTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // 필터링된 컴포넌트
  const filteredComponents = components.filter(
    (component) =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // 에이전트를 컴포넌트로 변환
  const convertAgentToComponent = async (templateId: string) => {
    const template = agentTemplates.find((t) => t.id === templateId)
    if (!template) return

    // 컴포넌트 생성
    await generateComponent({
      name: template.name,
      type: "agent",
      description: template.description,
      features: [`${template.nodes.length} 노드`, `${template.edges.length} 연결`, template.category],
      code: JSON.stringify({ nodes: template.nodes, edges: template.edges }, null, 2),
    })
  }

  // 아이콘 결정 함수
  const getIconForCategory = (category: string) => {
    switch (category) {
      case "Basic":
        return <Bot className="h-4 w-4 text-blue-500" />
      case "Advanced":
        return <Workflow className="h-4 w-4 text-purple-500" />
      case "Multi-Agent":
        return <MessageSquare className="h-4 w-4 text-amber-500" />
      case "Development":
        return <Code className="h-4 w-4 text-green-500" />
      case "Text Generation":
        return <MessageSquare className="h-4 w-4 text-amber-500" />
      case "Summarization":
        return <FileText className="h-4 w-4 text-indigo-500" />
      case "Text Analysis":
        return <BarChart className="h-4 w-4 text-red-500" />
      case "Code Generation":
        return <Code className="h-4 w-4 text-green-500" />
      case "Translation":
        return <Globe className="h-4 w-4 text-cyan-500" />
      case "Vision":
        return <Image className="h-4 w-4 text-pink-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">통합 컴포넌트 대시보드</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agents">에이전트</TabsTrigger>
          <TabsTrigger value="components">컴포넌트</TabsTrigger>
        </TabsList>

        <div className="mt-4 mb-6">
          <Input placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <TabsContent value="agents" className="mt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {agentCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "전체" : category}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgentTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getIconForCategory(template.category)}
                        <CardTitle className="text-lg ml-2">{template.name}</CardTitle>
                      </div>
                      <Badge>{template.category}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{template.nodes.length} 노드</Badge>
                        <Badge variant="outline">{template.edges.length} 연결</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => convertAgentToComponent(template.id)}
                      disabled={isGenerating}
                    >
                      컴포넌트로 추가
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="components" className="mt-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComponents.map((component) => (
                <Card
                  key={component.id}
                  className={`overflow-hidden ${selectedComponentId === component.id ? "border-primary" : ""}`}
                  onClick={() => selectComponent(component.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {component.type === "agent" ? (
                          <Bot className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Database className="h-4 w-4 text-purple-500" />
                        )}
                        <CardTitle className="text-lg ml-2">{component.name}</CardTitle>
                      </div>
                      <Badge>{component.type}</Badge>
                    </div>
                    <CardDescription>{component.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {component.features.map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteComponent(component.id)
                      }}
                    >
                      삭제
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/agent-builder?load=${component.id}`
                      }}
                    >
                      편집
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
