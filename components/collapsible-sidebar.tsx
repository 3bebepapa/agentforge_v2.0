"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Bot,
  Workflow,
  Code,
  Puzzle,
  BookOpen,
  Activity,
  Rocket,
  Layers,
  Zap,
  GitBranch,
  Building,
} from "lucide-react"

interface CollapsibleSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function CollapsibleSidebar({ activeTab, onTabChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: "unified",
      label: "통합 인터페이스",
      icon: Layers,
      description: "모든 기능을 한 곳에서",
      badge: "NEW",
    },
    {
      id: "agents",
      label: "AI 에이전트",
      icon: Bot,
      description: "AI 에이전트 생성 및 관리",
    },
    {
      id: "components",
      label: "컴포넌트 자동화",
      icon: Code,
      description: "React 컴포넌트 자동 생성",
    },
    {
      id: "workflows",
      label: "프로세스 스튜디오",
      icon: Workflow,
      description: "비즈니스 프로세스 설계",
      badge: "BETA",
    },
    {
      id: "flowbuilder",
      label: "플로우 빌더",
      icon: GitBranch,
      description: "워크플로우 시각적 설계",
    },
    {
      id: "codebuilder",
      label: "코드 빌더",
      icon: Code,
      description: "AI 코드 생성 도구",
    },
    {
      id: "aiflow",
      label: "AI 플로우",
      icon: Zap,
      description: "AI 기반 자동화 플로우",
      badge: "HOT",
    },
  ]

  const secondaryItems = [
    {
      id: "knowledge",
      label: "지식베이스",
      icon: BookOpen,
      description: "문서 및 지식 관리",
    },
    {
      id: "integrations",
      label: "통합 허브",
      icon: Puzzle,
      description: "외부 서비스 연동",
    },
    {
      id: "tenants",
      label: "테넌트 관리",
      icon: Building,
      description: "멀티 테넌트 환경",
    },
    {
      id: "deployment",
      label: "배포 관리",
      icon: Rocket,
      description: "애플리케이션 배포",
    },
    {
      id: "monitor",
      label: "시스템 모니터",
      icon: Activity,
      description: "시스템 상태 모니터링",
    },
  ]

  const MenuItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={`w-full justify-start h-auto p-3 ${isCollapsed ? "px-2" : ""}`}
      onClick={() => onTabChange(item.id)}
    >
      <item.icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} flex-shrink-0`} />
      {!isCollapsed && (
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
        </div>
      )}
    </Button>
  )

  return (
    <div className={`bg-white border-r transition-all duration-300 ${isCollapsed ? "w-16" : "w-80"}`}>
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h3 className="font-semibold">메뉴</h3>
            <p className="text-sm text-muted-foreground">AI Works 기능들</p>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* 주요 기능 */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">주요 기능</h4>
              </div>
            )}
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} isActive={activeTab === item.id} />
            ))}
          </div>

          <Separator className="my-4" />

          {/* 부가 기능 */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">부가 기능</h4>
              </div>
            )}
            {secondaryItems.map((item) => (
              <MenuItem key={item.id} item={item} isActive={activeTab === item.id} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
