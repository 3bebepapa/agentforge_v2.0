"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Save, Settings, History, Zap, LogOut, AlertCircle } from "lucide-react"
import { AgentWorkspace } from "./agent-workspace"
import { ComponentAutomator } from "./component-automator"
import { TenantManager } from "./tenant-manager"
import { SystemMonitor } from "./system-monitor"
import { IntegrationHub } from "./integration-hub"
import { KnowledgeBase } from "./knowledge-base"
import { DeploymentManager } from "./deployment-manager"
import { UnifiedInterface } from "./unified-interface"
import { FlowBuilder } from "./flow-builder"
import { ReactFlowProvider } from "reactflow"
import { CollapsibleSidebar } from "./collapsible-sidebar"
import { CodeBuilderInterface } from "./code-builder-interface"
import { AIFlowInterface } from "./aiflow-interface"
import { ProcessStudio } from "./process-studio"
import { SettingsDialog } from "./settings-dialog"

interface DashboardProps {
  apiKey?: string
  activeTabOverride?: string
}

export function Dashboard({ apiKey = "", activeTabOverride }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(activeTabOverride || "agents")
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [currentApiKey, setCurrentApiKey] = useState(apiKey)

  const handleApiKeyUpdate = (newApiKey: string, model: string) => {
    setCurrentApiKey(newApiKey)
    // Optionally reload components with new API key
  }

  // Safely display API key with substring only if it exists and has sufficient length
  const displayApiKey =
    currentApiKey && currentApiKey.length >= 8
      ? `${currentApiKey.substring(0, 4)}...${currentApiKey.substring(currentApiKey.length - 4)}`
      : "Invalid API Key"

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI Works</h1>
          <Badge variant="outline" className="ml-2">
            프로토타입 0.2.0
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            히스토리
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Button>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
          <Button variant="default" size="sm">
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </header>

      {error && (
        <div className="bg-destructive/10 text-destructive px-6 py-2 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
            닫기
          </Button>
        </div>
      )}

      <div className="flex-1 flex">
        <CollapsibleSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1">
          {activeTab === "unified" && <UnifiedInterface apiKey={currentApiKey} />}
          {activeTab === "agents" && <AgentWorkspace apiKey={currentApiKey} />}
          {activeTab === "components" && <ComponentAutomator apiKey={currentApiKey} />}
          {activeTab === "knowledge" && <KnowledgeBase apiKey={currentApiKey} />}
          {activeTab === "integrations" && <IntegrationHub />}
          {activeTab === "tenants" && <TenantManager />}
          {activeTab === "deployment" && <DeploymentManager apiKey={currentApiKey} />}
          {activeTab === "monitor" && <SystemMonitor />}
          {activeTab === "flowbuilder" && (
            <div className="flex-1 h-full">
              <ReactFlowProvider>
                <FlowBuilder />
              </ReactFlowProvider>
            </div>
          )}
          {activeTab === "workflows" && (
            <div className="flex-1 h-full">
              <ReactFlowProvider>
                <ProcessStudio />
              </ReactFlowProvider>
            </div>
          )}
          {activeTab === "codebuilder" && <CodeBuilderInterface />}
          {activeTab === "aiflow" && <AIFlowInterface />}
        </div>
      </div>

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        currentApiKey={currentApiKey}
        onApiKeyUpdate={handleApiKeyUpdate}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-white" />
            <div>
              <h4 className="text-sm font-bold">AI Works</h4>
              <p className="text-xs text-gray-400">탈중앙화 AI 생태계</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">© 2018 AI Works. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
