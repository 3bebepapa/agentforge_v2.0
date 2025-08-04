"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Square,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  FileText,
  Terminal,
  Eye,
} from "lucide-react"

interface ExecutionStep {
  id: string
  name: string
  status: "pending" | "running" | "success" | "error" | "skipped"
  startTime?: Date
  endTime?: Date
  duration?: number
  input?: any
  output?: any
  error?: string
  logs?: string[]
}

interface ExecutionResult {
  id: string
  workflowId: string
  workflowName: string
  status: "running" | "success" | "error" | "cancelled"
  startTime: Date
  endTime?: Date
  duration?: number
  steps: ExecutionStep[]
  totalSteps: number
  completedSteps: number
  input?: any
  output?: any
  error?: string
}

interface ExecutionPanelProps {
  execution?: ExecutionResult | null
  onExecute?: () => void
  onStop?: () => void
  onReset?: () => void
  isExecuting?: boolean
}

export default function ExecutionPanel({
  execution,
  onExecute,
  onStop,
  onReset,
  isExecuting = false,
}: ExecutionPanelProps) {
  const [selectedStep, setSelectedStep] = useState<ExecutionStep | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (execution && autoScroll) {
      const runningStep = execution.steps.find((step) => step.status === "running")
      if (runningStep) {
        setSelectedStep(runningStep)
      }
    }
  }, [execution, autoScroll])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "skipped":
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "border-l-yellow-500 bg-yellow-50"
      case "success":
        return "border-l-green-500 bg-green-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      case "skipped":
        return "border-l-gray-300 bg-gray-50"
      default:
        return "border-l-gray-300 bg-white"
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return "-"
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getProgressPercentage = () => {
    if (!execution) return 0
    return (execution.completedSteps / execution.totalSteps) * 100
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Execution
          </CardTitle>
          <div className="flex items-center gap-2">
            {execution && (
              <Badge
                variant={
                  execution.status === "success"
                    ? "default"
                    : execution.status === "error"
                      ? "destructive"
                      : execution.status === "running"
                        ? "secondary"
                        : "outline"
                }
              >
                {execution.status}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={isExecuting ? onStop : onExecute}
              variant={isExecuting ? "destructive" : "default"}
            >
              {isExecuting ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Execute
                </>
              )}
            </Button>
            {execution && !isExecuting && (
              <Button size="sm" variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {execution && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">
                {execution.completedSteps}/{execution.totalSteps} steps
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Started: {execution.startTime.toLocaleTimeString()}</span>
              {execution.duration && <span>Duration: {formatDuration(execution.duration)}</span>}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-120px)]">
        {!execution ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ready to Execute</p>
              <p className="text-sm">Click Execute to run your workflow</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="steps" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="h-[calc(100%-60px)] m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {execution.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`border-l-4 rounded-lg border shadow-sm cursor-pointer transition-all ${getStatusColor(
                        step.status,
                      )} ${selectedStep?.id === step.id ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setSelectedStep(step)}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-muted-foreground">{index + 1}</span>
                            {getStatusIcon(step.status)}
                            <h4 className="font-medium text-sm">{step.name}</h4>
                          </div>
                          {step.duration && (
                            <Badge variant="outline" className="text-xs">
                              {formatDuration(step.duration)}
                            </Badge>
                          )}
                        </div>

                        {step.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            {step.error}
                          </div>
                        )}

                        {step.status === "running" && (
                          <div className="mt-2">
                            <Progress value={50} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="logs" className="h-[calc(100%-60px)] m-0">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-sm space-y-1">
                  {execution.steps.flatMap(
                    (step) =>
                      step.logs?.map((log, index) => (
                        <div key={`${step.id}-${index}`} className="flex gap-2">
                          <span className="text-muted-foreground text-xs">{step.startTime?.toLocaleTimeString()}</span>
                          <span className="text-xs text-blue-600">[{step.name}]</span>
                          <span className="text-xs">{log}</span>
                        </div>
                      )) || [],
                  )}
                  {execution.steps.flatMap((step) => step.logs || []).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No logs available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="data" className="h-[calc(100%-60px)] m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {selectedStep ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <h3 className="font-medium">{selectedStep.name}</h3>
                      </div>

                      {selectedStep.input && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Input Data</h4>
                          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(selectedStep.input, null, 2)}
                          </pre>
                        </div>
                      )}

                      {selectedStep.output && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Output Data</h4>
                          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(selectedStep.output, null, 2)}
                          </pre>
                        </div>
                      )}

                      {!selectedStep.input && !selectedStep.output && (
                        <div className="text-center text-muted-foreground py-4">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No data available for this step</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Select a step to view its data</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
