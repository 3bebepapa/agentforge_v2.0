"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  User,
  Send,
  Sparkles,
  Code,
  Workflow,
  Zap,
  Lightbulb,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: Array<{
    label: string
    action: string
    icon?: React.ReactNode
  }>
}

interface AIAssistantProps {
  onSuggestionApply?: (suggestion: string) => void
  onActionExecute?: (action: string) => void
  apiKey?: string
}

const QUICK_ACTIONS = [
  {
    label: "Create HTTP Trigger",
    action: "create-http-trigger",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    label: "Add Data Transformer",
    action: "add-data-transformer",
    icon: <Code className="h-4 w-4" />,
  },
  {
    label: "Generate Workflow",
    action: "generate-workflow",
    icon: <Workflow className="h-4 w-4" />,
  },
  {
    label: "Optimize Flow",
    action: "optimize-flow",
    icon: <Sparkles className="h-4 w-4" />,
  },
]

const SAMPLE_SUGGESTIONS = [
  "How do I connect two nodes?",
  "What's the best way to handle errors?",
  "Can you help me optimize this workflow?",
  "How do I add authentication to my API?",
  "What are the available data transformations?",
]

export default function AIAssistant({ onSuggestionApply, onActionExecute, apiKey }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you build workflows, debug issues, and optimize your processes. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: SAMPLE_SUGGESTIONS.slice(0, 3),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(
      () => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateAIResponse(inputValue),
          timestamp: new Date(),
          suggestions: generateSuggestions(inputValue),
          actions: generateActions(inputValue),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("connect") || lowerInput.includes("node")) {
      return "To connect nodes, drag from an output port (blue circle) on one node to an input port (green circle) on another node. You can also click on an output port and then click on the target input port to create a connection."
    }

    if (lowerInput.includes("error") || lowerInput.includes("debug")) {
      return "For error handling, I recommend adding error handling nodes after critical operations. You can use conditional logic to check for errors and route to different paths. Also, make sure to validate your data at each step."
    }

    if (lowerInput.includes("optimize") || lowerInput.includes("performance")) {
      return "To optimize your workflow: 1) Minimize the number of external API calls, 2) Use parallel processing where possible, 3) Cache frequently used data, 4) Add proper error handling to avoid retries, and 5) Use efficient data transformations."
    }

    if (lowerInput.includes("auth") || lowerInput.includes("security")) {
      return "For authentication, you can add API key validation in your HTTP triggers, use OAuth 2.0 for external services, and implement proper input validation. Consider using environment variables for sensitive data."
    }

    if (lowerInput.includes("transform") || lowerInput.includes("data")) {
      return "Available data transformations include: map (transform each item), filter (remove items based on conditions), reduce (aggregate data), sort (order items), and group (organize by criteria). You can also write custom JavaScript expressions."
    }

    return `I understand you're asking about "${input}". Let me help you with that. Based on your current workflow, I can suggest several approaches. Would you like me to create a specific component or provide more detailed guidance on implementation?`
  }

  const generateSuggestions = (input: string): string[] => {
    const suggestions = [
      "Show me an example",
      "Create this component for me",
      "What are the best practices?",
      "How do I test this?",
      "Are there any alternatives?",
    ]
    return suggestions.slice(0, 3)
  }

  const generateActions = (
    input: string,
  ): Array<{
    label: string
    action: string
    icon?: React.ReactNode
  }> => {
    return [
      {
        label: "Create Component",
        action: "create-component",
        icon: <Code className="h-4 w-4" />,
      },
      {
        label: "Add to Workflow",
        action: "add-to-workflow",
        icon: <Workflow className="h-4 w-4" />,
      },
    ]
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleActionClick = (action: string) => {
    onActionExecute?.(action)
  }

  const handleQuickAction = (action: string) => {
    onActionExecute?.(action)
    setShowQuickActions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {apiKey ? "Connected" : "Demo Mode"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.action)}
                  className="justify-start text-xs h-8"
                >
                  {action.icon}
                  <span className="ml-1 truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="ml-11 space-y-2">
                    <div className="text-xs text-muted-foreground">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs h-7"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="ml-11 space-y-2">
                    <div className="text-xs text-muted-foreground">Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          onClick={() => handleActionClick(action.action)}
                          className="text-xs h-7"
                        >
                          {action.icon}
                          <span className="ml-1">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your workflow..."
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
