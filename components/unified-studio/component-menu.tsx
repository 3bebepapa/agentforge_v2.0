"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Database,
  Globe,
  MessageSquare,
  Zap,
  Clock,
  Filter,
  Code,
  Workflow,
  Bot,
  Settings,
} from "lucide-react"

interface Component {
  id: string
  name: string
  type: string
  category: string
  description: string
  icon: React.ReactNode
  tags: string[]
}

const COMPONENT_LIBRARY: Component[] = [
  // Triggers
  {
    id: "http-trigger",
    name: "HTTP Trigger",
    type: "trigger",
    category: "triggers",
    description: "Trigger workflow via HTTP request",
    icon: <Globe className="h-4 w-4" />,
    tags: ["http", "api", "webhook"],
  },
  {
    id: "schedule-trigger",
    name: "Schedule Trigger",
    type: "trigger",
    category: "triggers",
    description: "Trigger workflow on schedule",
    icon: <Clock className="h-4 w-4" />,
    tags: ["cron", "schedule", "timer"],
  },
  {
    id: "event-trigger",
    name: "Event Trigger",
    type: "trigger",
    category: "triggers",
    description: "Trigger on system events",
    icon: <Zap className="h-4 w-4" />,
    tags: ["event", "listener", "reactive"],
  },

  // Data Processing
  {
    id: "data-transformer",
    name: "Data Transformer",
    type: "processor",
    category: "data",
    description: "Transform and manipulate data",
    icon: <Filter className="h-4 w-4" />,
    tags: ["transform", "map", "filter"],
  },
  {
    id: "data-validator",
    name: "Data Validator",
    type: "processor",
    category: "data",
    description: "Validate data against schema",
    icon: <Settings className="h-4 w-4" />,
    tags: ["validate", "schema", "check"],
  },

  // Integrations
  {
    id: "database-connector",
    name: "Database Connector",
    type: "integration",
    category: "integrations",
    description: "Connect to databases",
    icon: <Database className="h-4 w-4" />,
    tags: ["sql", "database", "query"],
  },
  {
    id: "api-client",
    name: "API Client",
    type: "integration",
    category: "integrations",
    description: "Make HTTP API calls",
    icon: <Globe className="h-4 w-4" />,
    tags: ["http", "rest", "api"],
  },
  {
    id: "message-queue",
    name: "Message Queue",
    type: "integration",
    category: "integrations",
    description: "Send/receive messages",
    icon: <MessageSquare className="h-4 w-4" />,
    tags: ["queue", "message", "async"],
  },

  // AI/ML
  {
    id: "llm-processor",
    name: "LLM Processor",
    type: "ai",
    category: "ai",
    description: "Process text with LLM",
    icon: <Bot className="h-4 w-4" />,
    tags: ["llm", "ai", "text"],
  },
  {
    id: "text-analyzer",
    name: "Text Analyzer",
    type: "ai",
    category: "ai",
    description: "Analyze text content",
    icon: <Code className="h-4 w-4" />,
    tags: ["nlp", "analysis", "text"],
  },

  // Logic
  {
    id: "condition",
    name: "Condition",
    type: "logic",
    category: "logic",
    description: "Conditional branching",
    icon: <Workflow className="h-4 w-4" />,
    tags: ["if", "condition", "branch"],
  },
  {
    id: "loop",
    name: "Loop",
    type: "logic",
    category: "logic",
    description: "Iterate over data",
    icon: <Workflow className="h-4 w-4" />,
    tags: ["loop", "iterate", "repeat"],
  },
]

interface ComponentMenuProps {
  onComponentSelect?: (component: Component) => void
  onComponentDrag?: (component: Component, event: React.DragEvent) => void
}

export default function ComponentMenu({ onComponentSelect, onComponentDrag }: ComponentMenuProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All", count: COMPONENT_LIBRARY.length },
    { id: "triggers", name: "Triggers", count: COMPONENT_LIBRARY.filter((c) => c.category === "triggers").length },
    { id: "data", name: "Data", count: COMPONENT_LIBRARY.filter((c) => c.category === "data").length },
    {
      id: "integrations",
      name: "Integrations",
      count: COMPONENT_LIBRARY.filter((c) => c.category === "integrations").length,
    },
    { id: "ai", name: "AI/ML", count: COMPONENT_LIBRARY.filter((c) => c.category === "ai").length },
    { id: "logic", name: "Logic", count: COMPONENT_LIBRARY.filter((c) => c.category === "logic").length },
  ]

  const filteredComponents = COMPONENT_LIBRARY.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || component.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleDragStart = (component: Component, event: React.DragEvent) => {
    event.dataTransfer.setData("application/json", JSON.stringify(component))
    event.dataTransfer.effectAllowed = "copy"
    onComponentDrag?.(component, event)
  }

  const handleComponentClick = (component: Component) => {
    onComponentSelect?.(component)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Component Library</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mx-4 mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="px-4 pb-4">
              <div className="grid gap-2">
                {filteredComponents.map((component) => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(component, e)}
                    onClick={() => handleComponentClick(component)}
                    className="group relative p-3 border rounded-lg cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md">{component.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{component.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {component.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{component.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {component.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {component.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{component.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComponentClick(component)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {filteredComponents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No components found</p>
                  <p className="text-xs">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
