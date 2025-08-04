"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Star, Clock, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useComponentRegistry } from "@/lib/component-registry"

// 컴포넌트 아이템 타입 정의
interface ComponentItem {
  id: string
  name: string
  description: string
  category: string
  type: string
  icon: React.ReactNode
  source: "built-in" | "integration-hub" | "custom"
  tags: string[]
  isFavorite: boolean
  lastUsed?: string
}

// 컴포넌트 메뉴 프롭스 타입 정의
interface ComponentMenuProps {
  context?: "integrated-interface" | "agent" | "process-studio" | "flow-builder"
  onSelectComponent: (component: ComponentItem) => void
  className?: string
}

export default function ComponentMenu({
  context = "integrated-interface",
  onSelectComponent,
  className = "",
}: ComponentMenuProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredComponents, setFilteredComponents] = useState<ComponentItem[]>([])

  // 컴포넌트 레지스트리에서 컴포넌트 가져오기
  const { components, isLoading, error } = useComponentRegistry()

  // 컴포넌트 필터링
  useEffect(() => {
    if (!components) return

    let filtered = [...components]

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.description.toLowerCase().includes(query) ||
          comp.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // 카테고리 필터링
    if (activeCategory !== "all") {
      filtered = filtered.filter((comp) => comp.category === activeCategory)
    }

    // 컨텍스트 기반 필터링 (현재 인터페이스에 적합한 컴포넌트만 표시)
    // 실제 구현에서는 컴포넌트 메타데이터에 적합한 컨텍스트 정보가 포함되어야 함

    setFilteredComponents(filtered)
  }, [components, searchQuery, activeCategory, context])

  // 카테고리 목록 생성
  const categories = components ? ["all", ...new Set(components.map((comp) => comp.category))] : ["all"]

  // 컴포넌트 아이템 렌더링
  const renderComponentItem = (component: ComponentItem) => (
    <Card
      key={component.id}
      className="cursor-pointer hover:bg-muted/50 mb-2"
      onClick={() => onSelectComponent(component)}
    >
      <CardContent className="p-3 flex items-center">
        <div className="bg-primary/10 p-2 rounded-full mr-3">{component.icon}</div>
        <div className="flex-1">
          <div className="font-medium">{component.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{component.description}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {component.source === "integration-hub" && (
              <Badge variant="outline" className="text-xs">
                통합 허브
              </Badge>
            )}
            {component.source === "custom" && (
              <Badge variant="outline" className="text-xs">
                사용자 정의
              </Badge>
            )}
            {component.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`border rounded-md ${className}`}>
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="컴포넌트 검색..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveCategory} value={activeCategory}>
        <div className="px-3 pt-2 border-b overflow-x-auto">
          <TabsList className="mb-2 w-full justify-start">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category === "all" ? "전체" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium">
              {isLoading ? "로딩 중..." : `${filteredComponents.length}개 컴포넌트`}
            </div>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Star className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">컴포넌트 로딩 중...</div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">오류: {error}</div>
            ) : filteredComponents.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? "검색 결과가 없습니다." : "컴포넌트가 없습니다."}
              </div>
            ) : (
              <div className="space-y-1">{filteredComponents.map(renderComponentItem)}</div>
            )}
          </ScrollArea>

          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />새 컴포넌트 만들기
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
