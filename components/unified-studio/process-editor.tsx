"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Trash2, ZoomIn, ZoomOut, Maximize } from "lucide-react"

interface ProcessNode {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: Record<string, any>
  status?: "idle" | "running" | "success" | "error"
}

interface ProcessConnection {
  id: string
  from: string
  to: string
  fromPort?: string
  toPort?: string
}

interface ProcessEditorProps {
  nodes?: ProcessNode[]
  connections?: ProcessConnection[]
  onNodesChange?: (nodes: ProcessNode[]) => void
  onConnectionsChange?: (connections: ProcessConnection[]) => void
  onNodeSelect?: (node: ProcessNode | null) => void
  onExecute?: () => void
}

export default function ProcessEditor({
  nodes: initialNodes = [],
  connections: initialConnections = [],
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onExecute,
}: ProcessEditorProps) {
  const [nodes, setNodes] = useState<ProcessNode[]>(initialNodes)
  const [connections, setConnections] = useState<ProcessConnection[]>(initialConnections)
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null)
  const [draggedNode, setDraggedNode] = useState<ProcessNode | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; port: string } | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleNodeDragStart = useCallback((node: ProcessNode, event: React.MouseEvent) => {
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

      setNodes(updatedNodes)
      onNodesChange?.(updatedNodes)
    },
    [draggedNode, dragOffset, nodes, onNodesChange, pan, zoom],
  )

  const handleNodeDragEnd = useCallback(() => {
    setDraggedNode(null)
    setDragOffset({ x: 0, y: 0 })
  }, [])

  const handleNodeSelect = useCallback(
    (node: ProcessNode) => {
      setSelectedNode(node)
      onNodeSelect?.(node)
    },
    [onNodeSelect],
  )

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      const updatedNodes = nodes.filter((node) => node.id !== nodeId)
      const updatedConnections = connections.filter((conn) => conn.from !== nodeId && conn.to !== nodeId)

      setNodes(updatedNodes)
      setConnections(updatedConnections)
      onNodesChange?.(updatedNodes)
      onConnectionsChange?.(updatedConnections)

      if (selectedNode?.id === nodeId) {
        setSelectedNode(null)
        onNodeSelect?.(null)
      }
    },
    [nodes, connections, selectedNode, onNodesChange, onConnectionsChange, onNodeSelect],
  )

  const handleCanvasDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      try {
        const componentData = JSON.parse(event.dataTransfer.getData("application/json"))
        if (!canvasRef.current) return

        const canvasRect = canvasRef.current.getBoundingClientRect()
        const x = (event.clientX - canvasRect.left - pan.x) / zoom
        const y = (event.clientY - canvasRect.top - pan.y) / zoom

        const newNode: ProcessNode = {
          id: `node_${Date.now()}`,
          type: componentData.type || "processor",
          name: componentData.name || "New Node",
          position: { x, y },
          size: { width: 200, height: 100 },
          config: {},
          status: "idle",
        }

        const updatedNodes = [...nodes, newNode]
        setNodes(updatedNodes)
        onNodesChange?.(updatedNodes)
      } catch (error) {
        console.error("Error handling canvas drop:", error)
      }
    },
    [nodes, onNodesChange, pan, zoom],
  )

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getNodeColor = (node: ProcessNode) => {
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Process Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleResetView}>
              <Maximize className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onExecute}>
              <Play className="h-4 w-4 mr-1" />
              Run
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
              {connections.map((connection) => {
                const fromNode = nodes.find((n) => n.id === connection.from)
                const toNode = nodes.find((n) => n.id === connection.to)

                if (!fromNode || !toNode) return null

                const fromX = fromNode.position.x + fromNode.size.width
                const fromY = fromNode.position.y + fromNode.size.height / 2
                const toX = toNode.position.x
                const toY = toNode.position.y + toNode.size.height / 2

                const midX = (fromX + toX) / 2

                return (
                  <g key={connection.id}>
                    <path
                      d={`M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`}
                      stroke="#6b7280"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                )
              })}

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
                onClick={() => handleNodeSelect(node)}
              >
                <div className="p-3 h-full flex flex-col">
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

                  <h4 className="font-medium text-sm mb-1 truncate">{node.name}</h4>

                  {node.status && (
                    <div className="mt-auto">
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
                    </div>
                  )}
                </div>

                {/* Connection ports */}
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer" />
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer" />
              </div>
            ))}
          </div>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-lg font-medium mb-2">Start Building Your Process</p>
                <p className="text-sm">Drag components from the library to create your workflow</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
