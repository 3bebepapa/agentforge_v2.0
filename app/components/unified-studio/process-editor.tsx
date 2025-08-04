"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Trash2 } from "lucide-react"

export default function ProcessEditor({ nodes, edges, onNodesChange, onEdgesChange, onNodeSelect }) {
  const [draggedNode, setDraggedNode] = useState(null)

  // 새 노드 추가
  const addNode = () => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: "process",
      data: { label: "새 프로세스" },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
    }
    onNodesChange([...nodes, newNode])
  }

  // 노드 삭제
  const deleteNode = (nodeId) => {
    const newNodes = nodes.filter((node) => node.id !== nodeId)
    onNodesChange(newNodes)

    // 관련 엣지도 제거
    const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    onEdgesChange(newEdges)
  }

  // 노드 드래그 시작
  const handleDragStart = (e, node) => {
    setDraggedNode(node)
    e.dataTransfer.effectAllowed = "move"
  }

  // 노드 드롭
  const handleDrop = (e) => {
    e.preventDefault()
    if (!draggedNode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const updatedNodes = nodes.map((node) => (node.id === draggedNode.id ? { ...node, position: { x, y } } : node))

    onNodesChange(updatedNodes)
    setDraggedNode(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="w-full h-full bg-gray-50 relative">
      {/* 도구 모음 */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Button onClick={addNode} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          노드 추가
        </Button>
      </div>

      {/* 캔버스 */}
      <div className="w-full h-full relative overflow-hidden" onDrop={handleDrop} onDragOver={handleDragOver}>
        {/* 그리드 배경 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* 노드들 */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move shadow-sm hover:shadow-md transition-shadow"
            style={{
              left: node.position.x,
              top: node.position.y,
              width: "150px",
              minHeight: "80px",
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            onClick={() => onNodeSelect(node)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-medium truncate">{node.data.label}</div>
              <div className="flex space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNodeSelect(node)
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNode(node.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500">{node.type}</div>
          </div>
        ))}

        {/* 연결선들 */}
        <svg className="absolute inset-0 pointer-events-none">
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source)
            const targetNode = nodes.find((n) => n.id === edge.target)

            if (!sourceNode || !targetNode) return null

            const x1 = sourceNode.position.x + 75
            const y1 = sourceNode.position.y + 40
            const x2 = targetNode.position.x + 75
            const y2 = targetNode.position.y + 40

            return (
              <line
                key={edge.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            )
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  )
}
