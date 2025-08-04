"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Settings, ArrowUp, ArrowDown, X } from "lucide-react"

export default function WorkflowEditor({ nodes, edges, onNodesChange, onEdgesChange, onNodeSelect }) {
  // 노드 위로 이동
  const moveNodeUp = (index) => {
    if (index <= 0) return

    const newNodes = [...nodes]
    const temp = newNodes[index]
    newNodes[index] = newNodes[index - 1]
    newNodes[index - 1] = temp

    onNodesChange(newNodes)
  }

  // 노드 아래로 이동
  const moveNodeDown = (index) => {
    if (index >= nodes.length - 1) return

    const newNodes = [...nodes]
    const temp = newNodes[index]
    newNodes[index] = newNodes[index + 1]
    newNodes[index + 1] = temp

    onNodesChange(newNodes)
  }

  // 노드 제거
  const removeNode = (index) => {
    const newNodes = nodes.filter((_, i) => i !== index)
    onNodesChange(newNodes)

    // 관련 엣지도 제거
    const nodeId = nodes[index].id
    const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    onEdgesChange(newEdges)
  }

  // 노드 선택
  const selectNode = (node) => {
    onNodeSelect(node)
  }

  return (
    <div className="w-full h-full bg-gray-50 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">워크플로우 노드</h3>

        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
            왼쪽 메뉴에서 컴포넌트를 선택하여 워크플로우를 구성하세요
          </div>
        ) : (
          <div className="space-y-2">
            {nodes.map((node, index) => (
              <Card
                key={node.id}
                className={`overflow-hidden cursor-pointer transition-colors ${
                  node.id === onNodeSelect?.id ? "border-primary" : ""
                }`}
                onClick={() => selectNode(node)}
              >
                <div className="flex border-b">
                  <div className="p-3 flex items-center space-x-3 flex-1">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <div className="w-4 h-4 bg-primary/20 rounded"></div>
                    </div>
                    <div>
                      <h4 className="font-medium">{node.data.label}</h4>
                      <p className="text-xs text-muted-foreground">{node.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => moveNodeUp(index)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => moveNodeDown(index)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => selectNode(node)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNode(index)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
