"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Trash2, ZoomIn, ZoomOut, Maximize, Plus, Minus } from "lucide-react"

interface FlowNode {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  data: Record<string, any>
  inputs: Array<{ id: string; name: string; type: string }>
  outputs: Array<{ id: string; name: string; type: string }>
  status?: "idle" | "running" | "success" | "error"
}

interface FlowConnection {
  id: string
  source: string
  sourceOutput: string
  target: string
  targetInput: string
}

interface FlowEditorProps {
  nodes?: FlowNode[]
  connections?: FlowConnection[]
  onNodesChange?: (nodes: FlowNode[]) => void
  onConnectionsChange?: (connections: FlowConnection[]) => void
  onNodeSelect?: (node: FlowNode | null) => void
  onExecute?: () => void
  isExecuting?: boolean
}

export default function FlowEditor({
  nodes: initialNodes = [],
  connections: initialConnections = [],
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onExecute,
  isExecuting = false,
}: FlowEditorProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes)
  const [connections, setConnections] = useState<FlowConnection[]>(initialConnections)
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null)
  const [draggedNode, setDraggedNode] = useState<FlowNode | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string
    outputId: string
    position: { x: number; y: number }
  } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Handle mouse movement for connection drawing
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isConnecting && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setMousePosition({
          x: (event.clientX - rect.left - pan.x) / zoom,
          y: (event.clientY - rect.top - pan.y) / zoom,
        })
      }
    }

    if (isConnecting) {
      document.addEventListener("mousemove", handleMouseMove)
      return () => document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isConnecting, pan, zoom])

  const handleNodesChange = useCallback(
    (newNodes: FlowNode[]) => {
      setNodes(newNodes)
      onNodesChange?.(newNodes)
    },
    [onNodesChange],
  )

  const handleConnectionsChange = useCallback(
    (newConnections: FlowConnection[]) => {
      setConnections(newConnections)
      onConnectionsChange?.(newConnections)
    },
    [onConnectionsChange],
  )

  const handleNodeDragStart = useCallback((node: FlowNode, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setDraggedNode(node)
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
    event.preventDefault()
  }, [])

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent) => {
      if (!draggedNode || !canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newX = (event.clientX - canvasRect.left - dragOffset.x - pan.x) / zoom
      const newY = (event.clientY - canvasRect.top - dragOffset.y - pan.y) / zoom

      const updatedNodes = nodes.map((node) =>
        node.id === draggedNode.id ? { ...node, position: { x: newX, y: newY } } : node,
      )

      handleNodesChange(updatedNodes)
    },
    [draggedNode, dragOffset, nodes, handleNodesChange, pan, zoom],
  )

  const handleNodeDragEnd = useCallback(() => {
    setDraggedNode(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const handleNodeSelect = useCallback(
    (node: FlowNode) => {
      setSelectedNode(node)
      onNodeSelect?.(node)
    },
    [onNodeSelect],
  )

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      const updatedNodes = nodes.filter((node) => node.id !== nodeId)
      const updatedConnections = connections.filter((conn) => conn.source !== nodeId && conn.target !== nodeId)

      handleNodesChange(updatedNodes)
      handleConnectionsChange(updatedConnections)

      if (selectedNode?.id === nodeId) {
        setSelectedNode(null)
        onNodeSelect?.(null)
      }
    },
    [nodes, connections, selectedNode, handleNodesChange, handleConnectionsChange, onNodeSelect],
  )

  const handleOutputClick = useCallback(
    (nodeId: string, outputId: string, event: React.MouseEvent) => {
      event.stopPropagation()

      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const position = {
        x: (event.clientX - rect.left - pan.x) / zoom,
        y: (event.clientY - rect.top - pan.y) / zoom,
      }

      setIsConnecting(true)
      setConnectionStart({ nodeId, outputId, position })
    },
    [pan, zoom],
  )

  const handleInputClick = useCallback(
    (nodeId: string, inputId: string, event: React.MouseEvent) => {
      event.stopPropagation()

      if (isConnecting && connectionStart && connectionStart.nodeId !== nodeId) {
        const newConnection: FlowConnection = {
          id: `conn_${Date.now()}`,
          source: connectionStart.nodeId,
          sourceOutput: connectionStart.outputId,
          target: nodeId,
          targetInput: inputId,
        }

        handleConnectionsChange([...connections, newConnection])
      }

      setIsConnecting(false)
      setConnectionStart(null)
    },
    [isConnecting, connectionStart, connections, handleConnectionsChange],
  )

  const handleCanvasClick = useCallback(() => {
    setIsConnecting(false)
    setConnectionStart(null)
    setSelectedNode(null)
    onNodeSelect?.(null)
  }, [onNodeSelect])

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      try {
        const componentData = JSON.parse(event.dataTransfer.getData("application/json"))
        if (!canvasRef.current) return

        const canvasRect = canvasRef.current.getBoundingClientRect()
        const x = (event.clientX - canvasRect.left - pan.x) / zoom
        const y = (event.clientY - canvasRect.top - pan.y) / zoom

        const newNode: FlowNode = {
          id: `node_${Date.now()}`,
          type: componentData.type || "processor",
          name: componentData.name || "New Node",
          position: { x, y },
          size: { width: 200, height: 120 },
          data: {},
          inputs: [{ id: "input1", name: "Input", type: "any" }],
          outputs: [{ id: "output1", name: "Output", type: "any" }],
          status: "idle",
        }

        handleNodesChange([...nodes, newNode])
      } catch (error) {
        console.error("Error handling canvas drop:", error)
      }
    },
    [nodes, handleNodesChange, pan, zoom],
  )

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getNodeColor = (node: FlowNode) => {
    switch (node.status) {
      case "running":
        return "border-yellow-500 bg-yellow-50"
      case "success":
        return "border-green-500 bg-green-50"
      case "error":
        return "border-red-500 bg-red-50"
      default:
        return "border-gray-300 bg-white"
    }
  }

  const getNodeIcon = (type: string) => {
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

  return (
    <div className="h-full flex">
      {/* Main Canvas */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Flow Editor</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetView}>
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={onExecute} disabled={isExecuting || nodes.length === 0}>
                  <Play className="h-4 w-4 mr-1" />
                  {isExecuting ? "Running..." : "Execute"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <div className="relative h-full overflow-hidden bg-gray-50">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                  transform: `translate(${pan.x}px, ${pan.y}px)`,
                }}
              />

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative h-full w-full cursor-crosshair"
                onDrop={handleCanvasDrop}
                onDragOver={(e) => e.preventDefault()}
                onMouseMove={handleNodeDrag}
                onMouseUp={handleNodeDragEnd}
                onClick={handleCanvasClick}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: "0 0",
                }}
              >
                {/* SVG for connections */}
                <svg
                  ref={svgRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: "100%", height: "100%" }}
                >
                  {/* Existing connections */}
                  {connections.map((connection) => {
                    const sourceNode = nodes.find((n) => n.id === connection.source)
                    const targetNode = nodes.find((n) => n.id === connection.target)

                    if (!sourceNode || !targetNode) return null

                    const sourceX = sourceNode.position.x + sourceNode.size.width
                    const sourceY = sourceNode.position.y + sourceNode.size.height / 2
                    const targetX = targetNode.position.x
                    const targetY = targetNode.position.y + targetNode.size.height / 2

                    const midX = (sourceX + targetX) / 2

                    return (
                      <g key={connection.id}>
                        <path
                          d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY} ${midX} ${targetY} ${targetX} ${targetY}`}
                          stroke="#6b7280"
                          strokeWidth="2"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                        />
                      </g>
                    )
                  })}

                  {/* Temporary connection while dragging */}
                  {isConnecting && connectionStart && (
                    <path
                      d={`M ${connectionStart.position.x} ${connectionStart.position.y} L ${mousePosition.x} ${mousePosition.y}`}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                    />
                  )}

                  {/* Arrow marker definition */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>
                </svg>

                {/* Nodes */}
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute border-2 rounded-lg shadow-sm cursor-move select-none ${getNodeColor(node)} ${
                      selectedNode?.id === node.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: node.size.width,
                      height: node.size.height,
                    }}
                    onMouseDown={(e) => handleNodeDragStart(node, e)}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNodeSelect(node)
                    }}
                  >
                    <div className="p-3 h-full flex flex-col">
                      {/* Node Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getNodeIcon(node.type)}</span>
                          <Badge variant="outline" className="text-xs">
                            {node.type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNodeDelete(node.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Node Title */}
                      <h4 className="font-medium text-sm mb-2 truncate">{node.name}</h4>

                      {/* Node Status */}
                      {node.status && node.status !== "idle" && (
                        <Badge
                          variant={
                            node.status === "success"
                              ? "default"
                              : node.status === "error"
                                ? "destructive"
                                : node.status === "running"
                                  ? "secondary"
                                  : "outline"
                          }
                          className="text-xs"
                        >
                          {node.status}
                        </Badge>
                      )}
                    </div>

                    {/* Input ports */}
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 space-y-1">
                      {node.inputs.map((input) => (
                        <div
                          key={input.id}
                          className="w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600"
                          onClick={(e) => handleInputClick(node.id, input.id, e)}
                          title={input.name}
                        />
                      ))}
                    </div>

                    {/* Output ports */}
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 space-y-1">
                      {node.outputs.map((output) => (
                        <div
                          key={output.id}
                          className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600"
                          onClick={(e) => handleOutputClick(node.id, output.id, e)}
                          title={output.name}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔗</div>
                    <p className="text-lg font-medium mb-2">Start Building Your Flow</p>
                    <p className="text-sm">Drag components from the library to create connections</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 border-l">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Node Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-120px)]">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="node-name">Name</Label>
                    <Input
                      id="node-name"
                      value={selectedNode.name}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((node) =>
                          node.id === selectedNode.id ? { ...node, name: e.target.value } : node,
                        )
                        handleNodesChange(updatedNodes)
                        setSelectedNode({ ...selectedNode, name: e.target.value })
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="node-type">Type</Label>
                    <Select
                      value={selectedNode.type}
                      onValueChange={(value) => {
                        const updatedNodes = nodes.map((node) =>
                          node.id === selectedNode.id ? { ...node, type: value } : node,
                        )
                        handleNodesChange(updatedNodes)
                        setSelectedNode({ ...selectedNode, type: value })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trigger">Trigger</SelectItem>
                        <SelectItem value="processor">Processor</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="ai">AI/ML</SelectItem>
                        <SelectItem value="logic">Logic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Inputs</Label>
                    <div className="space-y-2 mt-2">
                      {selectedNode.inputs.map((input, index) => (
                        <div key={input.id} className="flex items-center gap-2">
                          <Input
                            value={input.name}
                            onChange={(e) => {
                              const updatedInputs = [...selectedNode.inputs]
                              updatedInputs[index] = { ...input, name: e.target.value }
                              const updatedNodes = nodes.map((node) =>
                                node.id === selectedNode.id ? { ...node, inputs: updatedInputs } : node,
                              )
                              handleNodesChange(updatedNodes)
                              setSelectedNode({ ...selectedNode, inputs: updatedInputs })
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updatedInputs = selectedNode.inputs.filter((_, i) => i !== index)
                              const updatedNodes = nodes.map((node) =>
                                node.id === selectedNode.id ? { ...node, inputs: updatedInputs } : node,
                              )
                              handleNodesChange(updatedNodes)
                              setSelectedNode({ ...selectedNode, inputs: updatedInputs })
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newInput = {
                            id: `input_${Date.now()}`,
                            name: `Input ${selectedNode.inputs.length + 1}`,
                            type: "any",
                          }
                          const updatedInputs = [...selectedNode.inputs, newInput]
                          const updatedNodes = nodes.map((node) =>
                            node.id === selectedNode.id ? { ...node, inputs: updatedInputs } : node,
                          )
                          handleNodesChange(updatedNodes)
                          setSelectedNode({ ...selectedNode, inputs: updatedInputs })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Input
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Outputs</Label>
                    <div className="space-y-2 mt-2">
                      {selectedNode.outputs.map((output, index) => (
                        <div key={output.id} className="flex items-center gap-2">
                          <Input
                            value={output.name}
                            onChange={(e) => {
                              const updatedOutputs = [...selectedNode.outputs]
                              updatedOutputs[index] = { ...output, name: e.target.value }
                              const updatedNodes = nodes.map((node) =>
                                node.id === selectedNode.id ? { ...node, outputs: updatedOutputs } : node,
                              )
                              handleNodesChange(updatedNodes)
                              setSelectedNode({ ...selectedNode, outputs: updatedOutputs })
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updatedOutputs = selectedNode.outputs.filter((_, i) => i !== index)
                              const updatedNodes = nodes.map((node) =>
                                node.id === selectedNode.id ? { ...node, outputs: updatedOutputs } : node,
                              )
                              handleNodesChange(updatedNodes)
                              setSelectedNode({ ...selectedNode, outputs: updatedOutputs })
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newOutput = {
                            id: `output_${Date.now()}`,
                            name: `Output ${selectedNode.outputs.length + 1}`,
                            type: "any",
                          }
                          const updatedOutputs = [...selectedNode.outputs, newOutput]
                          const updatedNodes = nodes.map((node) =>
                            node.id === selectedNode.id ? { ...node, outputs: updatedOutputs } : node,
                          )
                          handleNodesChange(updatedNodes)
                          setSelectedNode({ ...selectedNode, outputs: updatedOutputs })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Output
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
