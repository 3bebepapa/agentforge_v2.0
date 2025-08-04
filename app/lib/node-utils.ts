// 노드 유틸리티 함수

import { nanoid } from "nanoid"

// 기본 노드 생성
export function createNode(options: any) {
  const { type, data, position } = options

  return {
    id: nanoid(),
    type: type || "default",
    data: data || {},
    position: position || { x: 0, y: 0 },
  }
}

// 컴포넌트에서 노드 생성
export function createNodeFromComponent(component: any, options: any = {}) {
  const { position } = options

  // 컴포넌트 유형에 따른 노드 유형 매핑
  const nodeTypeMap: Record<string, string> = {
    database: "databaseNode",
    api: "apiNode",
    transform: "transformNode",
    agent: "agentNode",
    condition: "conditionNode",
    trigger: "triggerNode",
    action: "actionNode",
  }

  const nodeType = nodeTypeMap[component.type] || "defaultNode"

  return createNode({
    type: nodeType,
    data: {
      label: component.name,
      componentId: component.id,
      icon: component.icon,
      ...component.metadata,
    },
    position,
  })
}

// 노드 연결 가능 여부 확인
export function canConnect(sourceNode: any, targetNode: any) {
  // 연결 가능 여부 로직
  return true
}

// 워크플로우 유효성 검사
export function validateWorkflow(nodes: any[], edges: any[]) {
  // 워크플로우 유효성 검사 로직
  const errors = []

  // 시작 노드 확인
  const startNodes = nodes.filter((node) => node.type === "triggerNode")
  if (startNodes.length === 0) {
    errors.push("워크플로우에 시작 노드가 없습니다.")
  }

  // 연결되지 않은 노드 확인
  const connectedNodeIds = new Set()
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  const disconnectedNodes = nodes.filter((node) => node.type !== "triggerNode" && !connectedNodeIds.has(node.id))

  if (disconnectedNodes.length > 0) {
    errors.push(`${disconnectedNodes.length}개의 연결되지 않은 노드가 있습니다.`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
