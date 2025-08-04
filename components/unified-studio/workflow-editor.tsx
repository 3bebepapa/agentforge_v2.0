"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Play, Plus, Trash2, Edit, Copy, ArrowDown, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface WorkflowStep {
  id: string
  name: string
  type: string
  description: string
  config: Record<string, any>
  status?: "pending" | "running" | "success" | "error"
  duration?: number
  error?: string
}

interface WorkflowEditorProps {
  steps?: WorkflowStep[]
  onStepsChange?: (steps: WorkflowStep[]) => void
  onStepSelect?: (step: WorkflowStep | null) => void
  onExecute?: () => void
  isExecuting?: boolean
}

export default function WorkflowEditor({
  steps: initialSteps = [],
  onStepsChange,
  onStepSelect,
  onExecute,
  isExecuting = false,
}: WorkflowEditorProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps)
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [newStepName, setNewStepName] = useState("")

  const handleStepsChange = useCallback(
    (newSteps: WorkflowStep[]) => {
      setSteps(newSteps)
      onStepsChange?.(newSteps)
    },
    [onStepsChange],
  )

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newSteps = Array.from(steps)
    const [reorderedStep] = newSteps.splice(result.source.index, 1)
    newSteps.splice(result.destination.index, 0, reorderedStep)

    handleStepsChange(newSteps)
  }

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      name: newStepName || `Step ${steps.length + 1}`,
      type: "processor",
      description: "New workflow step",
      config: {},
      status: "pending",
    }

    handleStepsChange([...steps, newStep])
    setNewStepName("")
  }

  const handleDeleteStep = (stepId: string) => {
    const newSteps = steps.filter((step) => step.id !== stepId)
    handleStepsChange(newSteps)

    if (selectedStep?.id === stepId) {
      setSelectedStep(null)
      onStepSelect?.(null)
    }
  }

  const handleDuplicateStep = (step: WorkflowStep) => {
    const duplicatedStep: WorkflowStep = {
      ...step,
      id: `step_${Date.now()}`,
      name: `${step.name} (Copy)`,
      status: "pending",
    }

    const stepIndex = steps.findIndex((s) => s.id === step.id)
    const newSteps = [...steps]
    newSteps.splice(stepIndex + 1, 0, duplicatedStep)

    handleStepsChange(newSteps)
  }

  const handleStepSelect = (step: WorkflowStep) => {
    setSelectedStep(step)
    onStepSelect?.(step)
  }

  const handleStepNameEdit = (stepId: string, newName: string) => {
    const newSteps = steps.map((step) => (step.id === stepId ? { ...step, name: newName } : step))
    handleStepsChange(newSteps)
    setEditingStep(null)
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "trigger":
        return "⚡"
      case "processor":
        return "⚙️"
      case "integration":
        return "🔗"
      case "ai":
        return "🤖"
      case "logic":
        return "🔀"
      default:
        return "📦"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "running":
        return "border-l-yellow-500 bg-yellow-50"
      case "success":
        return "border-l-green-500 bg-green-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      default:
        return "border-l-gray-300 bg-white"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workflow Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{steps.length} steps</Badge>
            <Button size="sm" onClick={onExecute} disabled={isExecuting || steps.length === 0}>
              <Play className="h-4 w-4 mr-1" />
              {isExecuting ? "Running..." : "Execute"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Add Step Input */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Input
              placeholder="Enter step name..."
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddStep()}
            />
            <Button onClick={handleAddStep} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Steps List */}
        <ScrollArea className="h-[calc(100vh-250px)]">
          {steps.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg font-medium mb-2">No Steps Yet</p>
              <p className="text-sm">Add your first step to get started</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="workflow-steps">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 space-y-2">
                    {steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border-l-4 rounded-lg border shadow-sm transition-all ${getStatusColor(
                              step.status,
                            )} ${selectedStep?.id === step.id ? "ring-2 ring-blue-500" : ""} ${
                              snapshot.isDragging ? "shadow-lg scale-105" : ""
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center gap-3 cursor-move flex-1"
                                  onClick={() => handleStepSelect(step)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-muted-foreground">{index + 1}</span>
                                    <span className="text-lg">{getStepIcon(step.type)}</span>
                                  </div>

                                  <div className="flex-1">
                                    {editingStep === step.id ? (
                                      <Input
                                        value={step.name}
                                        onChange={(e) => handleStepNameEdit(step.id, e.target.value)}
                                        onBlur={() => setEditingStep(null)}
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            setEditingStep(null)
                                          }
                                        }}
                                        className="h-8"
                                        autoFocus
                                      />
                                    ) : (
                                      <h4 className="font-medium text-sm">{step.name}</h4>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {getStatusIcon(step.status)}

                                  <Badge variant="outline" className="text-xs">
                                    {step.type}
                                  </Badge>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setEditingStep(step.id)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleDuplicateStep(step)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      onClick={() => handleDeleteStep(step.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Step Details */}
                              {step.status === "error" && step.error && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                  {step.error}
                                </div>
                              )}

                              {step.duration && (
                                <div className="mt-2 text-xs text-muted-foreground">Duration: {step.duration}ms</div>
                              )}

                              {/* Connection Line */}
                              {index < steps.length - 1 && (
                                <div className="flex justify-center mt-4">
                                  <div className="w-px h-4 bg-gray-300" />
                                  <ArrowDown className="h-4 w-4 text-gray-400 -mt-2" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
