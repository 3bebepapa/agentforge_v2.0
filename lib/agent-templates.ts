import { MarkerType } from "reactflow"
import type { AgentTemplate } from "./agent-types"

// 에이전트 템플릿 정의
export const agentTemplates: AgentTemplate[] = [
  // 단일 에이전트 템플릿
  {
    id: "single-agent",
    name: "단일 에이전트",
    description: "기본적인 단일 LLM 에이전트",
    category: "Basic",
    nodes: [
      {
        id: "node-input",
        type: "input",
        position: { x: 100, y: 200 },
        data: {
          label: "사용자 입력",
          description: "사용자의 질문이나 요청을 입력받습니다",
          type: "input",
          inputs: [],
          outputs: ["text"],
          parameters: {
            inputType: "text",
            inputValue: "",
          },
        },
      },
      {
        id: "node-llm",
        type: "llm",
        position: { x: 400, y: 200 },
        data: {
          label: "LLM 처리",
          description: "Gemini 1.5 Flash로 응답을 생성합니다",
          type: "llm",
          inputs: ["prompt"],
          outputs: ["response"],
          parameters: {
            model: "gemini-1.5-flash",
            temperature: 0.7,
            maxTokens: 1024,
            prompt: "",
          },
        },
      },
      {
        id: "node-output",
        type: "output",
        position: { x: 700, y: 200 },
        data: {
          label: "응답 출력",
          description: "생성된 응답을 출력합니다",
          type: "output",
          inputs: ["text"],
          outputs: [],
          parameters: {},
        },
      },
    ],
    edges: [
      {
        id: "edge-input-llm",
        source: "node-input",
        sourceHandle: "text",
        target: "node-llm",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-llm-output",
        source: "node-llm",
        sourceHandle: "response",
        target: "node-output",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
    ],
  },

  // LLM + 검색 + 요약 템플릿
  {
    id: "llm-search-summarize",
    name: "LLM + 검색 + 요약",
    description: "검색 결과를 활용하여 더 정확한 응답을 생성하고 요약합니다",
    category: "Advanced",
    nodes: [
      {
        id: "node-input",
        type: "input",
        position: { x: 100, y: 200 },
        data: {
          label: "사용자 입력",
          description: "사용자의 질문이나 요청을 입력받습니다",
          type: "input",
          inputs: [],
          outputs: ["text"],
          parameters: {
            inputType: "text",
            inputValue: "",
          },
        },
      },
      {
        id: "node-search",
        type: "tool",
        position: { x: 400, y: 100 },
        data: {
          label: "웹 검색",
          description: "질문에 관련된 정보를 웹에서 검색합니다",
          type: "tool",
          inputs: ["query"],
          outputs: ["results"],
          parameters: {
            toolType: "search",
            query: "",
          },
        },
      },
      {
        id: "node-llm",
        type: "llm",
        position: { x: 400, y: 300 },
        data: {
          label: "LLM 처리",
          description: "검색 결과를 활용하여 응답을 생성합니다",
          type: "llm",
          inputs: ["prompt", "context"],
          outputs: ["response"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.5,
            maxTokens: 1500,
            prompt: "",
          },
        },
      },
      {
        id: "node-summarize",
        type: "process",
        position: { x: 700, y: 200 },
        data: {
          label: "응답 요약",
          description: "생성된 응답을 간결하게 요약합니다",
          type: "text-summarization",
          inputs: ["text"],
          outputs: ["summary"],
          parameters: {
            maxLength: 150,
            format: "paragraph",
          },
        },
      },
      {
        id: "node-output",
        type: "output",
        position: { x: 1000, y: 200 },
        data: {
          label: "요약 출력",
          description: "요약된 응답을 출력합니다",
          type: "output",
          inputs: ["text"],
          outputs: [],
          parameters: {},
        },
      },
    ],
    edges: [
      {
        id: "edge-input-search",
        source: "node-input",
        sourceHandle: "text",
        target: "node-search",
        targetHandle: "query",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-input-llm",
        source: "node-input",
        sourceHandle: "text",
        target: "node-llm",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-search-llm",
        source: "node-search",
        sourceHandle: "results",
        target: "node-llm",
        targetHandle: "context",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-llm-summarize",
        source: "node-llm",
        sourceHandle: "response",
        target: "node-summarize",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-summarize-output",
        source: "node-summarize",
        sourceHandle: "summary",
        target: "node-output",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
    ],
  },

  // LLM + RAG + 벡터검색 템플릿
  {
    id: "llm-rag-vector",
    name: "LLM + RAG + 벡터검색",
    description: "벡터 데이터베이스를 활용한 검색 증강 생성(RAG) 시스템",
    category: "Advanced",
    nodes: [
      {
        id: "node-input",
        type: "input",
        position: { x: 100, y: 200 },
        data: {
          label: "사용자 입력",
          description: "사용자의 질문이나 요청을 입력받습니다",
          type: "input",
          inputs: [],
          outputs: ["text"],
          parameters: {
            inputType: "text",
            inputValue: "",
          },
        },
      },
      {
        id: "node-embedding",
        type: "process",
        position: { x: 400, y: 100 },
        data: {
          label: "임베딩 생성",
          description: "질문을 벡터로 변환합니다",
          type: "embedding-generator",
          inputs: ["text"],
          outputs: ["embedding"],
          parameters: {
            model: "text-embedding-3-large",
            dimensions: 1536,
          },
        },
      },
      {
        id: "node-vector-search",
        type: "tool",
        position: { x: 700, y: 100 },
        data: {
          label: "벡터 검색",
          description: "임베딩을 사용하여 관련 문서를 검색합니다",
          type: "vector-search",
          inputs: ["embedding", "query"],
          outputs: ["documents"],
          parameters: {
            collection: "knowledge_base",
            topK: 5,
            minScore: 0.7,
          },
        },
      },
      {
        id: "node-context-builder",
        type: "process",
        position: { x: 700, y: 300 },
        data: {
          label: "컨텍스트 구성",
          description: "검색된 문서로 컨텍스트를 구성합니다",
          type: "context-builder",
          inputs: ["documents", "query"],
          outputs: ["context"],
          parameters: {
            maxTokens: 3000,
            template: "다음 정보를 바탕으로 질문에 답변하세요:\n\n{documents}\n\n질문: {query}",
          },
        },
      },
      {
        id: "node-llm",
        type: "llm",
        position: { x: 1000, y: 200 },
        data: {
          label: "LLM 처리",
          description: "컨텍스트를 활용하여 응답을 생성합니다",
          type: "llm",
          inputs: ["prompt"],
          outputs: ["response"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.3,
            maxTokens: 1500,
          },
        },
      },
      {
        id: "node-output",
        type: "output",
        position: { x: 1300, y: 200 },
        data: {
          label: "응답 출력",
          description: "생성된 응답을 출력합니다",
          type: "output",
          inputs: ["text"],
          outputs: [],
          parameters: {},
        },
      },
    ],
    edges: [
      {
        id: "edge-input-embedding",
        source: "node-input",
        sourceHandle: "text",
        target: "node-embedding",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-input-vector-search",
        source: "node-input",
        sourceHandle: "text",
        target: "node-vector-search",
        targetHandle: "query",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-embedding-vector-search",
        source: "node-embedding",
        sourceHandle: "embedding",
        target: "node-vector-search",
        targetHandle: "embedding",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-vector-search-context",
        source: "node-vector-search",
        sourceHandle: "documents",
        target: "node-context-builder",
        targetHandle: "documents",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-input-context",
        source: "node-input",
        sourceHandle: "text",
        target: "node-context-builder",
        targetHandle: "query",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-context-llm",
        source: "node-context-builder",
        sourceHandle: "context",
        target: "node-llm",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-llm-output",
        source: "node-llm",
        sourceHandle: "response",
        target: "node-output",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
    ],
  },

  // 멀티 에이전트 (코디네이터 + 코딩 에이전트) 템플릿
  {
    id: "multi-agent-coding",
    name: "코딩 멀티 에이전트",
    description: "코디네이터와 코딩 에이전트가 협력하여 코드를 생성합니다",
    category: "Multi-Agent",
    nodes: [
      {
        id: "node-input",
        type: "input",
        position: { x: 100, y: 300 },
        data: {
          label: "코딩 요청",
          description: "사용자의 코딩 요청을 입력받습니다",
          type: "input",
          inputs: [],
          outputs: ["text"],
          parameters: {
            inputType: "text",
            inputValue: "",
          },
        },
      },
      {
        id: "node-coordinator",
        type: "llm",
        position: { x: 400, y: 150 },
        data: {
          label: "코디네이터",
          description: "작업을 분석하고 하위 작업으로 분할합니다",
          type: "text-generation",
          inputs: ["prompt"],
          outputs: ["text", "tasks"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.2,
            maxTokens: 2000,
            systemPrompt:
              "당신은 코딩 작업을 분석하고 하위 작업으로 분할하는 코디네이터입니다. 각 하위 작업은 명확하고 구체적이어야 합니다.",
          },
        },
      },
      {
        id: "node-task-router",
        type: "process",
        position: { x: 700, y: 150 },
        data: {
          label: "작업 라우터",
          description: "작업을 적절한 에이전트에게 할당합니다",
          type: "task-router",
          inputs: ["tasks"],
          outputs: ["frontend_tasks", "backend_tasks", "database_tasks"],
          parameters: {
            routingLogic:
              "task.category === 'frontend' ? 'frontend_tasks' : task.category === 'backend' ? 'backend_tasks' : 'database_tasks'",
          },
        },
      },
      {
        id: "node-frontend-agent",
        type: "llm",
        position: { x: 1000, y: 50 },
        data: {
          label: "프론트엔드 에이전트",
          description: "프론트엔드 코드를 생성합니다",
          type: "code-generation",
          inputs: ["prompt"],
          outputs: ["code"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.3,
            language: "javascript",
            systemPrompt:
              "당신은 React, HTML, CSS에 전문적인 프론트엔드 개발자입니다. 사용자 친화적이고 반응형 UI를 작성하세요.",
          },
        },
      },
      {
        id: "node-backend-agent",
        type: "llm",
        position: { x: 1000, y: 250 },
        data: {
          label: "백엔드 에이전트",
          description: "백엔드 코드를 생성합니다",
          type: "code-generation",
          inputs: ["prompt"],
          outputs: ["code"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.3,
            language: "javascript",
            systemPrompt: "당신은 Node.js, Express에 전문적인 백엔드 개발자입니다. 효율적이고 안전한 API를 작성하세요.",
          },
        },
      },
      {
        id: "node-database-agent",
        type: "llm",
        position: { x: 1000, y: 450 },
        data: {
          label: "데이터베이스 에이전트",
          description: "데이터베이스 스키마와 쿼리를 생성합니다",
          type: "code-generation",
          inputs: ["prompt"],
          outputs: ["code"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.3,
            language: "sql",
            systemPrompt:
              "당신은 SQL, MongoDB에 전문적인 데이터베이스 전문가입니다. 효율적인 스키마와 쿼리를 작성하세요.",
          },
        },
      },
      {
        id: "node-code-integrator",
        type: "process",
        position: { x: 1300, y: 250 },
        data: {
          label: "코드 통합기",
          description: "생성된 코드를 통합합니다",
          type: "code-integrator",
          inputs: ["frontend_code", "backend_code", "database_code"],
          outputs: ["integrated_code"],
          parameters: {
            format: "markdown",
            includeExplanation: true,
          },
        },
      },
      {
        id: "node-output",
        type: "output",
        position: { x: 1600, y: 250 },
        data: {
          label: "코드 출력",
          description: "통합된 코드를 출력합니다",
          type: "output",
          inputs: ["text"],
          outputs: [],
          parameters: {},
        },
      },
    ],
    edges: [
      {
        id: "edge-input-coordinator",
        source: "node-input",
        sourceHandle: "text",
        target: "node-coordinator",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-coordinator-router",
        source: "node-coordinator",
        sourceHandle: "tasks",
        target: "node-task-router",
        targetHandle: "tasks",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-router-frontend",
        source: "node-task-router",
        sourceHandle: "frontend_tasks",
        target: "node-frontend-agent",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-router-backend",
        source: "node-task-router",
        sourceHandle: "backend_tasks",
        target: "node-backend-agent",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-router-database",
        source: "node-task-router",
        sourceHandle: "database_tasks",
        target: "node-database-agent",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-frontend-integrator",
        source: "node-frontend-agent",
        sourceHandle: "code",
        target: "node-code-integrator",
        targetHandle: "frontend_code",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-backend-integrator",
        source: "node-backend-agent",
        sourceHandle: "code",
        target: "node-code-integrator",
        targetHandle: "backend_code",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-database-integrator",
        source: "node-database-agent",
        sourceHandle: "code",
        target: "node-code-integrator",
        targetHandle: "database_code",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-integrator-output",
        source: "node-code-integrator",
        sourceHandle: "integrated_code",
        target: "node-output",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
    ],
  },

  // React 컴포넌트 생성 에이전트
  {
    id: "react-component-agent",
    name: "React 컴포넌트 생성기",
    description: "사용자 요구사항에 맞는 React 컴포넌트를 생성합니다",
    category: "Development",
    nodes: [
      {
        id: "node-input",
        type: "input",
        position: { x: 100, y: 200 },
        data: {
          label: "컴포넌트 요구사항",
          description: "생성할 React 컴포넌트에 대한 요구사항을 입력받습니다",
          type: "input",
          inputs: [],
          outputs: ["text"],
          parameters: {
            inputType: "text",
            inputValue: "",
          },
        },
      },
      {
        id: "node-requirements-analyzer",
        type: "llm",
        position: { x: 400, y: 100 },
        data: {
          label: "요구사항 분석기",
          description: "컴포넌트 요구사항을 분석합니다",
          type: "text-generation",
          inputs: ["prompt"],
          outputs: ["text", "specs"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.2,
            maxTokens: 1500,
            systemPrompt:
              "당신은 React 컴포넌트 요구사항을 분석하는 전문가입니다. 요구사항을 분석하여 컴포넌트 사양을 JSON 형식으로 제공하세요.",
          },
        },
      },
      {
        id: "node-component-generator",
        type: "llm",
        position: { x: 400, y: 300 },
        data: {
          label: "컴포넌트 생성기",
          description: "React 컴포넌트 코드를 생성합니다",
          type: "code-generation",
          inputs: ["prompt", "specs"],
          outputs: ["code"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.3,
            language: "typescript",
            includeExplanation: true,
            systemPrompt:
              "당신은 React와 TypeScript에 전문적인 프론트엔드 개발자입니다. 주어진 사양에 따라 재사용 가능하고 타입 안전한 React 컴포넌트를 작성하세요.",
          },
        },
      },
      {
        id: "node-style-generator",
        type: "llm",
        position: { x: 700, y: 100 },
        data: {
          label: "스타일 생성기",
          description: "컴포넌트 스타일을 생성합니다",
          type: "code-generation",
          inputs: ["specs"],
          outputs: ["styles"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.4,
            language: "css",
            systemPrompt:
              "당신은 CSS와 Tailwind에 전문적인 UI 디자이너입니다. 주어진 사양에 따라 반응형이고 접근성이 좋은 스타일을 작성하세요.",
          },
        },
      },
      {
        id: "node-test-generator",
        type: "llm",
        position: { x: 700, y: 300 },
        data: {
          label: "테스트 생성기",
          description: "컴포넌트 테스트 코드를 생성합니다",
          type: "code-generation",
          inputs: ["specs", "code"],
          outputs: ["tests"],
          parameters: {
            model: "gemini-1.5-pro",
            temperature: 0.3,
            language: "typescript",
            systemPrompt:
              "당신은 Jest와 React Testing Library에 전문적인 테스트 엔지니어입니다. 주어진 컴포넌트에 대한 포괄적인 테스트를 작성하세요.",
          },
        },
      },
      {
        id: "node-code-integrator",
        type: "process",
        position: { x: 1000, y: 200 },
        data: {
          label: "코드 통합기",
          description: "컴포넌트, 스타일, 테스트 코드를 통합합니다",
          type: "code-integrator",
          inputs: ["code", "styles", "tests"],
          outputs: ["integrated_code"],
          parameters: {
            format: "markdown",
            includeExplanation: true,
          },
        },
      },
      {
        id: "node-output",
        type: "output",
        position: { x: 1300, y: 200 },
        data: {
          label: "컴포넌트 출력",
          description: "통합된 React 컴포넌트 코드를 출력합니다",
          type: "output",
          inputs: ["text"],
          outputs: [],
          parameters: {},
        },
      },
    ],
    edges: [
      {
        id: "edge-input-analyzer",
        source: "node-input",
        sourceHandle: "text",
        target: "node-requirements-analyzer",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-input-generator",
        source: "node-input",
        sourceHandle: "text",
        target: "node-component-generator",
        targetHandle: "prompt",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-analyzer-generator",
        source: "node-requirements-analyzer",
        sourceHandle: "specs",
        target: "node-component-generator",
        targetHandle: "specs",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-analyzer-style",
        source: "node-requirements-analyzer",
        sourceHandle: "specs",
        target: "node-style-generator",
        targetHandle: "specs",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-generator-test",
        source: "node-component-generator",
        sourceHandle: "code",
        target: "node-test-generator",
        targetHandle: "code",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-analyzer-test",
        source: "node-requirements-analyzer",
        sourceHandle: "specs",
        target: "node-test-generator",
        targetHandle: "specs",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-generator-integrator",
        source: "node-component-generator",
        sourceHandle: "code",
        target: "node-code-integrator",
        targetHandle: "code",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-style-integrator",
        source: "node-style-generator",
        sourceHandle: "styles",
        target: "node-code-integrator",
        targetHandle: "styles",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-test-integrator",
        source: "node-test-generator",
        sourceHandle: "tests",
        target: "node-code-integrator",
        targetHandle: "tests",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
      {
        id: "edge-integrator-output",
        source: "node-code-integrator",
        sourceHandle: "integrated_code",
        target: "node-output",
        targetHandle: "text",
        animated: true,
        style: { stroke: "#6366f1" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      },
    ],
  },
]

// 템플릿 카테고리별 조회 함수
export function getTemplatesByCategory(category: string): AgentTemplate[] {
  if (category === "all") {
    return agentTemplates
  }
  return agentTemplates.filter((template) => template.category === category)
}

// 템플릿 ID로 조회 함수
export function getTemplateById(id: string): AgentTemplate | undefined {
  return agentTemplates.find((template) => template.id === id)
}

// 템플릿 검색 함수
export function searchTemplates(query: string): AgentTemplate[] {
  const lowerQuery = query.toLowerCase()
  return agentTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.id.toLowerCase().includes(lowerQuery),
  )
}
