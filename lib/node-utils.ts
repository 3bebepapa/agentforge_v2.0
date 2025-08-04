/**
 * 노드 생성 유틸리티 함수
 * @param options 노드 옵션
 * @returns 생성된 노드 객체
 */
export const createNode = (options: any) => {
  const { type, data, position } = options
  return {
    id: options.id || `node_${Math.random().toString(36).substring(2, 9)}`,
    type: type || "default",
    data: data || { label: "새 노드" },
    position: position || { x: 100, y: 100 },
  }
}

/**
 * 엣지 생성 유틸리티 함수
 * @param options 엣지 옵션
 * @returns 생성된 엣지 객체
 */
export const createEdge = (options: any) => {
  const { source, target, type } = options
  return {
    id: options.id || `edge_${Math.random().toString(36).substring(2, 9)}`,
    source: source,
    target: target,
    type: type || "default",
    animated: options.animated || false,
    label: options.label || "",
    style: options.style || {},
  }
}
