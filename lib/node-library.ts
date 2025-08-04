import type { NodeDefinition, NodeCategory, NodeType } from "./node-types"

// 노드 라이브러리 - 모든 사용 가능한 노드 정의
export const nodeLibrary: NodeDefinition[] = [
  // ===== 트리거 노드 =====
  {
    id: "http-trigger",
    name: "HTTP 트리거",
    type: "trigger",
    category: "Input",
    description: "HTTP 요청을 통해 워크플로우를 트리거합니다.",
    icon: "Globe",
    inputs: [],
    outputs: [
      {
        id: "request",
        name: "request",
        label: "요청",
        type: "object",
        description: "HTTP 요청 객체",
      },
      {
        id: "body",
        name: "body",
        label: "본문",
        type: "any",
        description: "요청 본문",
      },
      {
        id: "headers",
        name: "headers",
        label: "헤더",
        type: "object",
        description: "요청 헤더",
      },
      {
        id: "params",
        name: "params",
        label: "파라미터",
        type: "object",
        description: "URL 파라미터",
      },
      {
        id: "query",
        name: "query",
        label: "쿼리",
        type: "object",
        description: "쿼리 파라미터",
      },
    ],
    parameters: [
      {
        name: "method",
        type: "select",
        label: "HTTP 메서드",
        description: "허용할 HTTP 메서드",
        default: "ANY",
        options: ["ANY", "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
        required: true,
      },
      {
        name: "path",
        type: "string",
        label: "경로",
        description: "엔드포인트 경로 (예: /api/webhook)",
        default: "/api/webhook",
        required: true,
      },
      {
        name: "cors",
        type: "boolean",
        label: "CORS 활성화",
        description: "Cross-Origin Resource Sharing 활성화",
        default: true,
      },
      {
        name: "authentication",
        type: "select",
        label: "인증",
        description: "인증 방식",
        default: "none",
        options: ["none", "api-key", "jwt", "basic"],
      },
      {
        name: "apiKey",
        type: "secret",
        label: "API 키",
        description: "API 키 인증에 사용할 키",
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "api-key",
        },
      },
    ],
    code: `
async function execute(inputs, parameters) {
  // 실제 구현에서는 HTTP 요청을 처리하는 로직이 들어갑니다.
  // 여기서는 시뮬레이션된 응답을 반환합니다.
  
  const { method, path } = parameters;
  
  // 시뮬레이션된 요청 객체
  const request = {
    method: method === "ANY" ? "GET" : method,
    path: path,
    timestamp: new Date().toISOString(),
  };
  
  // 시뮬레이션된 요청 본문
  const body = {
    message: "Hello, World!",
    data: { key: "value" },
  };
  
  // 시뮬레이션된 헤더
  const headers = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0",
  };
  
  // 시뮬레이션된 URL 파라미터
  const params = {
    id: "12345",
  };
  
  // 시뮬레이션된 쿼리 파라미터
  const query = {
    filter: "active",
    sort: "desc",
  };
  
  return {
    request,
    body,
    headers,
    params,
    query,
  };
}
`,
    examples: [
      {
        name: "웹훅 수신",
        description: "GitHub 웹훅을 수신하는 HTTP 트리거",
        config: {
          method: "POST",
          path: "/api/github-webhook",
          cors: true,
          authentication: "api-key",
          apiKey: "your-secret-key",
        },
      },
      {
        name: "REST API",
        description: "REST API 엔드포인트",
        config: {
          method: "ANY",
          path: "/api/resources",
          cors: true,
          authentication: "jwt",
        },
      },
    ],
  },

  {
    id: "schedule-trigger",
    name: "스케줄 트리거",
    type: "trigger",
    category: "Input",
    description: "일정에 따라 워크플로우를 트리거합니다.",
    icon: "Clock",
    inputs: [],
    outputs: [
      {
        id: "timestamp",
        name: "timestamp",
        label: "타임스탬프",
        type: "string",
        description: "트리거 시간",
      },
      {
        id: "data",
        name: "data",
        label: "데이터",
        type: "object",
        description: "트리거 데이터",
      },
    ],
    parameters: [
      {
        name: "schedule",
        type: "select",
        label: "스케줄 유형",
        description: "스케줄 유형",
        default: "cron",
        options: ["cron", "interval", "fixed"],
        required: true,
      },
      {
        name: "cron",
        type: "string",
        label: "Cron 표현식",
        description: "Cron 표현식 (예: 0 0 * * * - 매일 자정)",
        default: "0 0 * * *",
        dependsOn: "schedule",
        condition: {
          field: "schedule",
          value: "cron",
        },
      },
      {
        name: "interval",
        type: "number",
        label: "간격 (분)",
        description: "실행 간격 (분)",
        default: 60,
        dependsOn: "schedule",
        condition: {
          field: "schedule",
          value: "interval",
        },
      },
      {
        name: "time",
        type: "string",
        label: "시간",
        description: "실행 시간 (HH:MM 형식)",
        default: "00:00",
        dependsOn: "schedule",
        condition: {
          field: "schedule",
          value: "fixed",
        },
      },
      {
        name: "timezone",
        type: "string",
        label: "시간대",
        description: "시간대 (예: Asia/Seoul)",
        default: "UTC",
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { schedule, cron, interval, time, timezone } = parameters;
  
  // 현재 시간
  const now = new Date();
  
  // 스케줄 정보
  let scheduleInfo;
  if (schedule === "cron") {
    scheduleInfo = { type: "cron", expression: cron };
  } else if (schedule === "interval") {
    scheduleInfo = { type: "interval", minutes: interval };
  } else if (schedule === "fixed") {
    scheduleInfo = { type: "fixed", time: time };
  }
  
  // 다음 실행 시간 계산 (시뮬레이션)
  let nextRun;
  if (schedule === "cron") {
    // 간단한 시뮬레이션: 다음 날 같은 시간
    nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1);
  } else if (schedule === "interval") {
    // 현재 시간 + 간격
    nextRun = new Date(now.getTime() + interval * 60 * 1000);
  } else if (schedule === "fixed") {
    // 다음 날 지정된 시간
    const [hours, minutes] = time.split(":").map(Number);
    nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(hours, minutes, 0, 0);
  }
  
  return {
    timestamp: now.toISOString(),
    data: {
      schedule: scheduleInfo,
      timezone,
      nextRun: nextRun.toISOString(),
    },
  };
}
`,
    examples: [
      {
        name: "일일 작업",
        description: "매일 자정에 실행",
        config: {
          schedule: "cron",
          cron: "0 0 * * *",
          timezone: "Asia/Seoul",
        },
      },
      {
        name: "주기적 확인",
        description: "15분마다 실행",
        config: {
          schedule: "interval",
          interval: 15,
          timezone: "UTC",
        },
      },
    ],
  },

  {
    id: "event-trigger",
    name: "이벤트 트리거",
    type: "trigger",
    category: "Input",
    description: "시스템 이벤트에 반응하여 워크플로우를 트리거합니다.",
    icon: "Zap",
    inputs: [],
    outputs: [
      {
        id: "event",
        name: "event",
        label: "이벤트",
        type: "object",
        description: "이벤트 객체",
      },
      {
        id: "data",
        name: "data",
        label: "데이터",
        type: "any",
        description: "이벤트 데이터",
      },
    ],
    parameters: [
      {
        name: "eventType",
        type: "select",
        label: "이벤트 유형",
        description: "트리거할 이벤트 유형",
        default: "database",
        options: ["database", "auth", "storage", "custom"],
        required: true,
      },
      {
        name: "operation",
        type: "multiselect",
        label: "작업",
        description: "트리거할 작업",
        default: ["create"],
        options: ["create", "update", "delete", "read"],
        dependsOn: "eventType",
        condition: {
          field: "eventType",
          value: "database",
        },
      },
      {
        name: "resource",
        type: "string",
        label: "리소스",
        description: "이벤트 리소스 (예: 테이블 이름, 경로 등)",
        default: "",
        required: true,
      },
      {
        name: "filter",
        type: "code",
        label: "필터",
        description: "이벤트 필터 조건 (JavaScript)",
        default: "// 예: event.data.status === 'active'",
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { eventType, operation, resource, filter } = parameters;
  
  // 시뮬레이션된 이벤트 객체
  const event = {
    id: \`evt_\${Math.random().toString(36).substring(2, 15)}\`,
    type: eventType,
    operation: Array.isArray(operation) ? operation[0] : "create",
    resource: resource,
    timestamp: new Date().toISOString(),
  };
  
  // 시뮬레이션된 이벤트 데이터
  let data;
  if (eventType === "database") {
    data = {
      id: \`rec_\${Math.random().toString(36).substring(2, 10)}\`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: {
        name: "Sample Record",
        status: "active",
        value: Math.floor(Math.random() * 100),
      },
    };
  } else if (eventType === "auth") {
    data = {
      userId: \`user_\${Math.random().toString(36).substring(2, 10)}\`,
      email: "user@example.com",
      action: "login",
      timestamp: new Date().toISOString(),
    };
  } else if (eventType === "storage") {
    data = {
      path: \`/\${resource}/file_\${Math.random().toString(36).substring(2, 10)}.txt\`,
      size: Math.floor(Math.random() * 1000000),
      contentType: "text/plain",
      createdAt: new Date().toISOString(),
    };
  } else {
    data = {
      message: "Custom event triggered",
      details: {
        key: "value",
      },
    };
  }
  
  return {
    event,
    data,
  };
}
`,
    examples: [
      {
        name: "데이터베이스 변경 감지",
        description: "사용자 테이블 변경 시 트리거",
        config: {
          eventType: "database",
          operation: ["create", "update"],
          resource: "users",
          filter: "event.data.fields.status === 'active'",
        },
      },
      {
        name: "인증 이벤트",
        description: "사용자 로그인 시 트리거",
        config: {
          eventType: "auth",
          resource: "users",
          filter: "event.data.action === 'login'",
        },
      },
    ],
  },

  // ===== 입력 노드 =====
  {
    id: "file-input",
    name: "파일 입력",
    type: "input",
    category: "Input",
    description: "파일을 입력으로 받습니다.",
    icon: "File",
    inputs: [],
    outputs: [
      {
        id: "file",
        name: "file",
        label: "파일",
        type: "binary",
        description: "파일 데이터",
      },
      {
        id: "metadata",
        name: "metadata",
        label: "메타데이터",
        type: "object",
        description: "파일 메타데이터",
      },
    ],
    parameters: [
      {
        name: "accept",
        type: "string",
        label: "허용 파일 유형",
        description: "허용할 파일 유형 (MIME 타입 또는 확장자)",
        default: "*/*",
      },
      {
        name: "multiple",
        type: "boolean",
        label: "다중 파일",
        description: "다중 파일 업로드 허용",
        default: false,
      },
      {
        name: "maxSize",
        type: "number",
        label: "최대 크기 (MB)",
        description: "최대 파일 크기 (MB)",
        default: 10,
      },
      {
        name: "source",
        type: "select",
        label: "소스",
        description: "파일 소스",
        default: "upload",
        options: ["upload", "url", "path"],
      },
      {
        name: "url",
        type: "string",
        label: "URL",
        description: "파일 URL",
        dependsOn: "source",
        condition: {
          field: "source",
          value: "url",
        },
      },
      {
        name: "path",
        type: "string",
        label: "경로",
        description: "파일 경로",
        dependsOn: "source",
        condition: {
          field: "source",
          value: "path",
        },
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { accept, multiple, maxSize, source, url, path } = parameters;
  
  // 시뮬레이션된 파일 데이터
  let fileData;
  let metadata;
  
  if (source === "upload") {
    // 업로드된 파일 시뮬레이션
    fileData = "This is simulated file content.";
    metadata = {
      name: "example.txt",
      type: "text/plain",
      size: 28,
      lastModified: new Date().toISOString(),
    };
  } else if (source === "url") {
    // URL에서 가져온 파일 시뮬레이션
    fileData = "This is simulated file content from URL.";
    metadata = {
      name: url ? url.split("/").pop() : "file.txt",
      type: "text/plain",
      size: 38,
      url: url || "https://example.com/file.txt",
      lastModified: new Date().toISOString(),
    };
  } else if (source === "path") {
    // 경로에서 가져온 파일 시뮬레이션
    fileData = "This is simulated file content from path.";
    metadata = {
      name: path ? path.split("/").pop() : "file.txt",
      type: "text/plain",
      size: 39,
      path: path || "/path/to/file.txt",
      lastModified: new Date().toISOString(),
    };
  }
  
  return {
    file: fileData,
    metadata,
  };
}
`,
    examples: [
      {
        name: "이미지 업로드",
        description: "이미지 파일 업로드",
        config: {
          accept: "image/*",
          multiple: false,
          maxSize: 5,
          source: "upload",
        },
      },
      {
        name: "URL에서 파일 가져오기",
        description: "URL에서 파일 가져오기",
        config: {
          source: "url",
          url: "https://example.com/data.csv",
        },
      },
    ],
  },

  {
    id: "text-input",
    name: "텍스트 입력",
    type: "input",
    category: "Input",
    description: "텍스트를 입력으로 받습니다.",
    icon: "Type",
    inputs: [],
    outputs: [
      {
        id: "text",
        name: "text",
        label: "텍스트",
        type: "string",
        description: "입력 텍스트",
      },
    ],
    parameters: [
      {
        name: "text",
        type: "string",
        label: "텍스트",
        description: "입력 텍스트",
        default: "",
      },
      {
        name: "multiline",
        type: "boolean",
        label: "여러 줄",
        description: "여러 줄 텍스트 허용",
        default: false,
      },
      {
        name: "placeholder",
        type: "string",
        label: "플레이스홀더",
        description: "입력 필드 플레이스홀더",
        default: "텍스트를 입력하세요...",
      },
      {
        name: "minLength",
        type: "number",
        label: "최소 길이",
        description: "최소 텍스트 길이",
        default: 0,
      },
      {
        name: "maxLength",
        type: "number",
        label: "최대 길이",
        description: "최대 텍스트 길이",
        default: 1000,
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { text, multiline, minLength, maxLength } = parameters;
  
  // 텍스트 유효성 검사
  if (text.length < minLength) {
    throw new Error(\`텍스트는 최소 \${minLength}자 이상이어야 합니다.\`);
  }
  
  if (maxLength > 0 && text.length > maxLength) {
    throw new Error(\`텍스트는 최대 \${maxLength}자 이하여야 합니다.\`);
  }
  
  return {
    text,
  };
}
`,
    examples: [
      {
        name: "간단한 텍스트",
        description: "단일 줄 텍스트 입력",
        config: {
          text: "안녕하세요",
          multiline: false,
          placeholder: "인사말을 입력하세요",
          minLength: 2,
          maxLength: 100,
        },
      },
      {
        name: "긴 텍스트",
        description: "여러 줄 텍스트 입력",
        config: {
          text: "이것은 여러 줄의\n텍스트 예시입니다.",
          multiline: true,
          placeholder: "내용을 입력하세요...",
          minLength: 10,
          maxLength: 1000,
        },
      },
    ],
  },

  // ===== LLM 노드 =====
  {
    id: "openai-llm",
    name: "OpenAI LLM",
    type: "llm",
    category: "Processing",
    description: "OpenAI의 언어 모델을 사용합니다.",
    icon: "Sparkles",
    inputs: [
      {
        id: "prompt",
        name: "prompt",
        label: "프롬프트",
        type: "string",
        description: "모델에 전달할 프롬프트",
        required: true,
      },
      {
        id: "system",
        name: "system",
        label: "시스템 메시지",
        type: "string",
        description: "시스템 메시지",
        required: false,
      },
      {
        id: "history",
        name: "history",
        label: "대화 기록",
        type: "array",
        description: "이전 대화 기록",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        name: "response",
        label: "응답",
        type: "string",
        description: "모델 응답",
      },
      {
        id: "tokens",
        name: "tokens",
        label: "토큰",
        type: "object",
        description: "토큰 사용량",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 OpenAI 모델",
        default: "gpt-4o",
        options: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
        required: true,
      },
      {
        name: "apiKey",
        type: "secret",
        label: "API 키",
        description: "OpenAI API 키",
        required: true,
      },
      {
        name: "temperature",
        type: "number",
        label: "온도",
        description: "응답의 창의성 정도 (0.0 ~ 2.0)",
        default: 0.7,
        validation: {
          min: 0,
          max: 2,
        },
      },
      {
        name: "maxTokens",
        type: "number",
        label: "최대 토큰",
        description: "생성할 최대 토큰 수",
        default: 1000,
      },
      {
        name: "topP",
        type: "number",
        label: "Top P",
        description: "핵 샘플링 임계값",
        default: 1,
        advanced: true,
      },
      {
        name: "frequencyPenalty",
        type: "number",
        label: "빈도 페널티",
        description: "반복 페널티",
        default: 0,
        advanced: true,
      },
      {
        name: "presencePenalty",
        type: "number",
        label: "존재 페널티",
        description: "새로운 주제 장려",
        default: 0,
        advanced: true,
      },
      {
        name: "streaming",
        type: "boolean",
        label: "스트리밍",
        description: "응답 스트리밍 활성화",
        default: false,
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { prompt, system, history } = inputs;
  const { model, temperature, maxTokens, topP, frequencyPenalty, presencePenalty, streaming } = parameters;
  
  // 실제 구현에서는 OpenAI API를 호출합니다.
  // 여기서는 시뮬레이션된 응답을 반환합니다.
  
  console.log(\`OpenAI \${model} 모델로 텍스트 생성 중: \${prompt.substring(0, 50)}...\`);
  
  // 시뮬레이션된 지연
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 시뮬레이션된 응답
  let response;
  
  if (prompt.toLowerCase().includes("안녕") || prompt.toLowerCase().includes("hello")) {
    response = "안녕하세요! 무엇을 도와드릴까요?";
  } else if (prompt.toLowerCase().includes("날씨")) {
    response = "오늘 날씨는 맑고 온도는 22°C입니다.";
  } else if (prompt.toLowerCase().includes("시간")) {
    response = \`현재 시간은 \${new Date().toLocaleTimeString()}입니다.\`;
  } else if (prompt.toLowerCase().includes("도움말") || prompt.toLowerCase().includes("help")) {
    response = "저는 OpenAI의 언어 모델입니다. 질문이나 요청에 답변해 드릴 수 있습니다.";
  } else {
    response = \`질문: "\${prompt.substring(0, 30)}..."에 대한 답변입니다. 이것은 \${model} 모델의 시뮬레이션된 응답입니다.\`;
  }
  
  // 토큰 사용량 시뮬레이션
  const promptTokens = Math.ceil(prompt.length / 4);
  const responseTokens = Math.ceil(response.length / 4);
  
  return {
    response,
    tokens: {
      prompt: promptTokens,
      completion: responseTokens,
      total: promptTokens + responseTokens,
    },
  };
}
`,
    examples: [
      {
        name: "간단한 질문",
        description: "간단한 질문에 대한 응답",
        config: {
          model: "gpt-4o",
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        name: "창의적 글쓰기",
        description: "창의적인 글쓰기를 위한 설정",
        config: {
          model: "gpt-4o",
          temperature: 1.2,
          maxTokens: 2000,
          topP: 0.9,
        },
      },
    ],
  },

  {
    id: "gemini-llm",
    name: "Google Gemini LLM",
    type: "llm",
    category: "Processing",
    description: "Google의 Gemini 언어 모델을 사용합니다.",
    icon: "Sparkles",
    inputs: [
      {
        id: "prompt",
        name: "prompt",
        label: "프롬프트",
        type: "string",
        description: "모델에 전달할 프롬프트",
        required: true,
      },
      {
        id: "system",
        name: "system",
        label: "시스템 메시지",
        type: "string",
        description: "시스템 메시지",
        required: false,
      },
      {
        id: "history",
        name: "history",
        label: "대화 기록",
        type: "array",
        description: "이전 대화 기록",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        name: "response",
        label: "응답",
        type: "string",
        description: "모델 응답",
      },
      {
        id: "tokens",
        name: "tokens",
        label: "토큰",
        type: "object",
        description: "토큰 사용량",
      },
    ],
    parameters: [
      {
        name: "model",
        type: "select",
        label: "모델",
        description: "사용할 Gemini 모델",
        default: "gemini-1.5-pro",
        options: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
        required: true,
      },
      {
        name: "apiKey",
        type: "secret",
        label: "API 키",
        description: "Google AI API 키",
        required: true,
      },
      {
        name: "temperature",
        type: "number",
        label: "온도",
        description: "응답의 창의성 정도 (0.0 ~ 2.0)",
        default: 0.7,
        validation: {
          min: 0,
          max: 2,
        },
      },
      {
        name: "maxOutputTokens",
        type: "number",
        label: "최대 출력 토큰",
        description: "생성할 최대 토큰 수",
        default: 1000,
      },
      {
        name: "topP",
        type: "number",
        label: "Top P",
        description: "핵 샘플링 임계값",
        default: 0.95,
        advanced: true,
      },
      {
        name: "topK",
        type: "number",
        label: "Top K",
        description: "상위 K개 토큰 샘플링",
        default: 40,
        advanced: true,
      },
      {
        name: "streaming",
        type: "boolean",
        label: "스트리밍",
        description: "응답 스트리밍 활성화",
        default: false,
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { prompt, system, history } = inputs;
  const { model, temperature, maxOutputTokens, topP, topK, streaming } = parameters;
  
  // 실제 구현에서는 Google AI API를 호출합니다.
  // 여기서는 시뮬레이션된 응답을 반환합니다.
  
  console.log(\`Gemini \${model} 모델로 텍스트 생성 중: \${prompt.substring(0, 50)}...\`);
  
  // 시뮬레이션된 지연
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 시뮬레이션된 응답
  let response;
  
  if (prompt.toLowerCase().includes("안녕") || prompt.toLowerCase().includes("hello")) {
    response = "안녕하세요! 무엇을 도와드릴까요?";
  } else if (prompt.toLowerCase().includes("날씨")) {
    response = "오늘 날씨는 맑고 온도는 22°C입니다.";
  } else if (prompt.toLowerCase().includes("시간")) {
    response = \`현재 시간은 \${new Date().toLocaleTimeString()}입니다.\`;
  } else if (prompt.toLowerCase().includes("도움말") || prompt.toLowerCase().includes("help")) {
    response = "저는 Google의 Gemini 언어 모델입니다. 질문이나 요청에 답변해 드릴 수 있습니다.";
  } else {
    response = \`질문: "\${prompt.substring(0, 30)}..."에 대한 답변입니다. 이것은 \${model} 모델의 시뮬레이션된 응답입니다.\`;
  }
  
  // 토큰 사용량 시뮬레이션
  const promptTokens = Math.ceil(prompt.length / 4);
  const responseTokens = Math.ceil(response.length / 4);
  
  return {
    response,
    tokens: {
      prompt: promptTokens,
      completion: responseTokens,
      total: promptTokens + responseTokens,
    },
  };
}
`,
    examples: [
      {
        name: "간단한 질문",
        description: "간단한 질문에 대한 응답",
        config: {
          model: "gemini-1.5-pro",
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      },
      {
        name: "창의적 글쓰기",
        description: "창의적인 글쓰기를 위한 설정",
        config: {
          model: "gemini-1.5-pro",
          temperature: 1.2,
          maxOutputTokens: 2000,
          topP: 0.9,
        },
      },
    ],
  },

  // ===== 데이터베이스 노드 =====
  {
    id: "sql-database",
    name: "SQL 데이터베이스",
    type: "database",
    category: "Data",
    description: "SQL 데이터베이스에 쿼리를 실행합니다.",
    icon: "Database",
    inputs: [
      {
        id: "query",
        name: "query",
        label: "쿼리",
        type: "string",
        description: "실행할 SQL 쿼리",
        required: false,
      },
      {
        id: "params",
        name: "params",
        label: "파라미터",
        type: "object",
        description: "쿼리 파라미터",
        required: false,
      },
    ],
    outputs: [
      {
        id: "results",
        name: "results",
        label: "결과",
        type: "array",
        description: "쿼리 결과",
      },
      {
        id: "metadata",
        name: "metadata",
        label: "메타데이터",
        type: "object",
        description: "쿼리 메타데이터",
      },
    ],
    parameters: [
      {
        name: "connectionType",
        type: "select",
        label: "연결 유형",
        description: "데이터베이스 연결 유형",
        default: "postgres",
        options: ["postgres", "mysql", "sqlite", "mssql", "oracle"],
        required: true,
      },
      {
        name: "host",
        type: "string",
        label: "호스트",
        description: "데이터베이스 호스트",
        default: "localhost",
        dependsOn: "connectionType",
        condition: {
          field: "connectionType",
          value: ["postgres", "mysql", "mssql", "oracle"],
        },
      },
      {
        name: "port",
        type: "number",
        label: "포트",
        description: "데이터베이스 포트",
        dependsOn: "connectionType",
        condition: {
          field: "connectionType",
          value: ["postgres", "mysql", "mssql", "oracle"],
        },
      },
      {
        name: "database",
        type: "string",
        label: "데이터베이스",
        description: "데이터베이스 이름",
        required: true,
      },
      {
        name: "username",
        type: "string",
        label: "사용자 이름",
        description: "데이터베이스 사용자 이름",
        dependsOn: "connectionType",
        condition: {
          field: "connectionType",
          value: ["postgres", "mysql", "mssql", "oracle"],
        },
      },
      {
        name: "password",
        type: "secret",
        label: "비밀번호",
        description: "데이터베이스 비밀번호",
        dependsOn: "connectionType",
        condition: {
          field: "connectionType",
          value: ["postgres", "mysql", "mssql", "oracle"],
        },
      },
      {
        name: "sqlQuery",
        type: "code",
        label: "SQL 쿼리",
        description: "실행할 SQL 쿼리 (입력이 없을 경우 사용)",
        default: "SELECT * FROM users LIMIT 10",
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { query, params } = inputs;
  const { connectionType, host, port, database, username, password, sqlQuery } = parameters;
  
  // 실제 쿼리 결정 (입력 또는 파라미터)
  const finalQuery = query || sqlQuery;
  const finalParams = params || {};
  
  console.log(\`\${connectionType} 데이터베이스에 쿼리 실행: \${finalQuery}\`);
  console.log(\`파라미터: \${JSON.stringify(finalParams)}\`);
  
  // 실제 구현에서는 데이터베이스에 쿼리를 실행합니다.
  // 여기서는 시뮬레이션된 결과를 반환합니다.
  
  // 시뮬레이션된 지연
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 시뮬레이션된 결과
  let results = [];
  let metadata = {
    rowCount: 0,
    fields: [],
    command: "",
    executionTime: 0,
  };
  
  // 쿼리 유형 감지
  const queryType = finalQuery.trim().toLowerCase().split(" ")[0];
  
  if (queryType === "select") {
    // SELECT 쿼리 시뮬레이션
    results = [
      { id: 1, name: "John Doe", email: "john@example.com", created_at: "2023-01-01T00:00:00Z" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", created_at: "2023-01-02T00:00:00Z" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", created_at: "2023-01-03T00:00:00Z" },
    ];
    
    metadata = {
      rowCount: results.length,
      fields: [
        { name: "id", dataType: "integer" },
        { name: "name", dataType: "text" },
        { name: "email", dataType: "text" },
        { name: "created_at", dataType: "timestamp" },
      ],
      command: "SELECT",
      executionTime: 123,
    };
  } else if (queryType === "insert") {
    // INSERT 쿼리 시뮬레이션
    metadata = {
      rowCount: 1,
      fields: [],
      command: "INSERT",
      executionTime: 45,
    };
  } else if (queryType === "update") {
    // UPDATE 쿼리 시뮬레이션
    metadata = {
      rowCount: 1,
      fields: [],
      command: "UPDATE",
      executionTime: 67,
    };
  } else if (queryType === "delete") {
    // DELETE 쿼리 시뮬레이션
    metadata = {
      rowCount: 1,
      fields: [],
      command: "DELETE",
      executionTime: 34,
    };
  } else {
    // 기타 쿼리 시뮬레이션
    metadata = {
      rowCount: 0,
      fields: [],
      command: queryType.toUpperCase(),
      executionTime: 89,
    };
  }
  
  return {
    results,
    metadata,
  };
}
`,
    examples: [
      {
        name: "사용자 조회",
        description: "사용자 테이블에서 데이터 조회",
        config: {
          connectionType: "postgres",
          host: "localhost",
          port: 5432,
          database: "myapp",
          username: "postgres",
          password: "password",
          sqlQuery: "SELECT * FROM users WHERE active = true ORDER BY created_at DESC LIMIT 10",
        },
      },
      {
        name: "데이터 삽입",
        description: "새 레코드 삽입",
        config: {
          connectionType: "mysql",
          host: "db.example.com",
          port: 3306,
          database: "myapp",
          username: "admin",
          password: "password",
          sqlQuery: "INSERT INTO logs (event, user_id, details) VALUES ('login', 123, '{\"ip\": \"192.168.1.1\"}')",
        },
      },
    ],
  },

  // ===== 조건 노드 =====
  {
    id: "condition",
    name: "조건",
    type: "condition",
    category: "Logic",
    description: "조건에 따라 다른 경로로 실행 흐름을 분기합니다.",
    icon: "GitBranch",
    inputs: [
      {
        id: "value",
        name: "value",
        label: "값",
        type: "any",
        description: "평가할 값",
        required: true,
      },
    ],
    outputs: [
      {
        id: "true",
        name: "true",
        label: "참",
        type: "any",
        description: "조건이 참일 때의 출력",
      },
      {
        id: "false",
        name: "false",
        label: "거짓",
        type: "any",
        description: "조건이 거짓일 때의 출력",
      },
      {
        id: "result",
        name: "result",
        label: "결과",
        type: "boolean",
        description: "조건 평가 결과",
      },
    ],
    parameters: [
      {
        name: "condition",
        type: "select",
        label: "조건 유형",
        description: "조건 유형",
        default: "equals",
        options: [
          "equals",
          "notEquals",
          "greaterThan",
          "lessThan",
          "contains",
          "startsWith",
          "endsWith",
          "regex",
          "custom",
        ],
        required: true,
      },
      {
        name: "compareValue",
        type: "string",
        label: "비교 값",
        description: "비교할 값",
        dependsOn: "condition",
        condition: {
          field: "condition",
          value: ["equals", "notEquals", "greaterThan", "lessThan", "contains", "startsWith", "endsWith"],
        },
      },
      {
        name: "caseSensitive",
        type: "boolean",
        label: "대소문자 구분",
        description: "문자열 비교 시 대소문자 구분",
        default: true,
        dependsOn: "condition",
        condition: {
          field: "condition",
          value: ["equals", "notEquals", "contains", "startsWith", "endsWith"],
        },
      },
      {
        name: "pattern",
        type: "string",
        label: "정규식 패턴",
        description: "정규식 패턴",
        dependsOn: "condition",
        condition: {
          field: "condition",
          value: "regex",
        },
      },
      {
        name: "customExpression",
        type: "code",
        label: "사용자 정의 표현식",
        description: "JavaScript 표현식 (value를 사용하여 입력값 참조)",
        default: "value > 0 && value < 100",
        dependsOn: "condition",
        condition: {
          field: "condition",
          value: "custom",
        },
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { value } = inputs;
  const { condition, compareValue, caseSensitive, pattern, customExpression } = parameters;
  
  let result = false;
  
  // 조건 평가
  switch (condition) {
    case "equals":
      if (typeof value === "string" && typeof compareValue === "string" && !caseSensitive) {
        result = value.toLowerCase() === compareValue.toLowerCase();
      } else {
        result = value === compareValue;
      }
      break;
      
    case "notEquals":
      if (typeof value === "string" && typeof compareValue === "string" && !caseSensitive) {
        result = value.toLowerCase() !== compareValue.toLowerCase();
      } else {
        result = value !== compareValue;
      }
      break;
      
    case "greaterThan":
      result = value > compareValue;
      break;
      
    case "lessThan":
      result = value < compareValue;
      break;
      
    case "contains":
      if (typeof value === "string" && typeof compareValue === "string") {
        if (caseSensitive) {
          result = value.includes(compareValue);
        } else {
          result = value.toLowerCase().includes(compareValue.toLowerCase());
        }
      } else if (Array.isArray(value)) {
        result = value.includes(compareValue);
      }
      break;
      
    case "startsWith":
      if (typeof value === "string" && typeof compareValue === "string") {
        if (caseSensitive) {
          result = value.startsWith(compareValue);
        } else {
          result = value.toLowerCase().startsWith(compareValue.toLowerCase());
        }
      }
      break;
      
    case "endsWith":
      if (typeof value === "string" && typeof compareValue === "string") {
        if (caseSensitive) {
          result = value.endsWith(compareValue);
        } else {
          result = value.toLowerCase().endsWith(compareValue.toLowerCase());
        }
      }
      break;
      
    case "regex":
      if (typeof value === "string" && pattern) {
        const regex = new RegExp(pattern);
        result = regex.test(value);
      }
      break;
      
    case "custom":
      if (customExpression) {
        // 안전한 방식으로 표현식 평가
        try {
          // Function 생성자를 사용하여 표현식 평가
          const evalFunction = new Function("value", \`return \${customExpression};\`);
          result = evalFunction(value);
        } catch (error) {
          console.error("표현식 평가 오류:", error);
          throw new Error(\`사용자 정의 표현식 평가 오류: \${error.message}\`);
        }
      }
      break;
  }
  
  // 결과에 따라 출력 설정
  return {
    true: result ? value : undefined,
    false: !result ? value : undefined,
    result,
  };
}
`,
    examples: [
      {
        name: "숫자 비교",
        description: "숫자가 특정 값보다 큰지 확인",
        config: {
          condition: "greaterThan",
          compareValue: "10",
        },
      },
      {
        name: "문자열 검색",
        description: "문자열에 특정 텍스트가 포함되어 있는지 확인",
        config: {
          condition: "contains",
          compareValue: "error",
          caseSensitive: false,
        },
      },
      {
        name: "사용자 정의 조건",
        description: "복잡한 조건 확인",
        config: {
          condition: "custom",
          customExpression: "typeof value === 'object' && value.status === 'active' && value.score > 75",
        },
      },
    ],
  },

  // ===== 데이터 변환 노드 =====
  {
    id: "data-transformer",
    name: "데이터 변환기",
    type: "data",
    category: "Data",
    description: "데이터를 변환, 필터링, 매핑합니다.",
    icon: "FileJson",
    inputs: [
      {
        id: "data",
        name: "data",
        label: "데이터",
        type: "any",
        description: "변환할 데이터",
        required: true,
      },
    ],
    outputs: [
      {
        id: "result",
        name: "result",
        label: "결과",
        type: "any",
        description: "변환된 데이터",
      },
    ],
    parameters: [
      {
        name: "operation",
        type: "select",
        label: "작업",
        description: "수행할 변환 작업",
        default: "map",
        options: ["map", "filter", "sort", "group", "aggregate", "transform", "custom"],
        required: true,
      },
      {
        name: "mapping",
        type: "json",
        label: "매핑",
        description: "필드 매핑 (JSON 객체)",
        default: '{\n  "id": "item.id",\n  "name": "item.name",\n  "email": "item.email"\n}',
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "map",
        },
      },
      {
        name: "filterExpression",
        type: "code",
        label: "필터 표현식",
        description: "필터링 조건 (JavaScript 표현식, item을 사용하여 항목 참조)",
        default: "item.active === true",
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "filter",
        },
      },
      {
        name: "sortField",
        type: "string",
        label: "정렬 필드",
        description: "정렬할 필드",
        default: "name",
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "sort",
        },
      },
      {
        name: "sortDirection",
        type: "select",
        label: "정렬 방향",
        description: "정렬 방향",
        default: "asc",
        options: ["asc", "desc"],
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "sort",
        },
      },
      {
        name: "groupByField",
        type: "string",
        label: "그룹화 필드",
        description: "그룹화할 필드",
        default: "category",
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "group",
        },
      },
      {
        name: "aggregateFunction",
        type: "select",
        label: "집계 함수",
        description: "집계 함수",
        default: "sum",
        options: ["sum", "avg", "min", "max", "count"],
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "aggregate",
        },
      },
      {
        name: "aggregateField",
        type: "string",
        label: "집계 필드",
        description: "집계할 필드",
        default: "amount",
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "aggregate",
        },
      },
      {
        name: "transformExpression",
        type: "code",
        label: "변환 표현식",
        description: "데이터 변환 표현식 (JavaScript 코드, data를 사용하여 입력 데이터 참조)",
        default: "return data.map(item => ({\n  ...item,\n  fullName: `${item.firstName} ${item.lastName}`\n}))",
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "transform",
        },
      },
      {
        name: "customCode",
        type: "code",
        label: "사용자 정의 코드",
        description: "사용자 정의 변환 코드 (JavaScript 코드, data를 사용하여 입력 데이터 참조)",
        default:
          "// 입력 데이터 처리\nconst result = [];\n\n// 데이터 처리 로직\nfor (const item of data) {\n  // 변환 로직\n  result.push({\n    id: item.id,\n    processed: true,\n    value: item.value * 2\n  });\n}\n\nreturn result;",
        dependsOn: "operation",
        condition: {
          field: "operation",
          value: "custom",
        },
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { data } = inputs;
  const {
    operation,
    mapping,
    filterExpression,
    sortField,
    sortDirection,
    groupByField,
    aggregateFunction,
    aggregateField,
    transformExpression,
    customCode
  } = parameters;
  
  // 입력 데이터가 배열인지 확인
  const isArray = Array.isArray(data);
  
  // 결과 변수
  let result;
  
  try {
    switch (operation) {
      case "map":
        if (!isArray) {
          throw new Error("매핑 작업은 배열 데이터가 필요합니다.");
        }
        
        // 매핑 객체 파싱
        let mappingObj;
        try {
          mappingObj = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
        } catch (error) {
          throw new Error(\`매핑 JSON 파싱 오류: \${error.message}\`);
        }
        
        // 데이터 매핑
        result = data.map(item => {
          const mappedItem = {};
          
          for (const [key, expr] of Object.entries(mappingObj)) {
            try {
              // 표현식 평가
              const evalFunction = new Function("item", \`return \${expr};\`);
              mappedItem[key] = evalFunction(item);
            } catch (error) {
              mappedItem[key] = null;
              console.error(\`필드 '\${key}' 매핑 오류: \${error.message}\`);
            }
          }
          
          return mappedItem;
        });
        break;
        
      case "filter":
        if (!isArray) {
          throw new Error("필터 작업은 배열 데이터가 필요합니다.");
        }
        
        // 필터 표현식 평가
        try {
          const filterFunction = new Function("item", \`return \${filterExpression};\`);
          result = data.filter(item => filterFunction(item));
        } catch (error) {
          throw new Error(\`필터 표현식 오류: \${error.message}\`);
        }
        break;
        
      case "sort":
        if (!isArray) {
          throw new Error("정렬 작업은 배열 데이터가 필요합니다.");
        }
        
        // 데이터 정렬
        result = [...data].sort((a, b) => {
          const valueA = a[sortField];
          const valueB = b[sortField];
          
          if (valueA === undefined || valueB === undefined) {
            return 0;
          }
          
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortDirection === 'asc'
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          } else {
            return sortDirection === 'asc'
              ? valueA - valueB
              : valueB - valueA;
          }
        });
        break;
        
      case "group":
        if (!isArray) {
          throw new Error("그룹화 작업은 배열 데이터가 필요합니다.");
        }
        
        // 데이터 그룹화
        result = data.reduce((groups, item) => {
          const key = item[groupByField];
          
          if (!key) {
            return groups;
          }
          
          if (!groups[key]) {
            groups[key] = [];
          }
          
          groups[key].push(item);
          return groups;
        }, {});
        break;
        
      case "aggregate":
        if (!isArray) {
          throw new Error("집계 작업은 배열 데이터가 필요합니다.");
        }
        
        // 데이터 집계
        switch (aggregateFunction) {
          case "sum":
            result = data.reduce((sum, item) => sum + (Number(item[aggregateField]) || 0), 0);
            break;
            
          case "avg":
            if (data.length === 0) {
              result = 0;
            } else {
              const sum = data.reduce((acc, item) => acc + (Number(item[aggregateField]) || 0), 0);
              result = sum / data.length;
            }
            break;
            
          case "min":
            result = data.reduce((min, item) => {
              const value = Number(item[aggregateField]);
              return (value !== undefined && (min === undefined || value < min)) ? value : min;
            }, undefined);
            break;
            
          case "max":
            result = data.reduce((max, item) => {
              const value = Number(item[aggregateField]);
              return (value !== undefined && (max === undefined || value > max)) ? value : max;
            }, undefined);
            break;
            
          case "count":
            result = data.filter(item => item[aggregateField] !== undefined).length;
            break;
            
          default:
            throw new Error(\`지원되지 않는 집계 함수: \${aggregateFunction}\`);
        }
        break;
        
      case "transform":
        // 변환 표현식 평가
        try {
          const transformFunction = new Function("data", transformExpression);
          result = transformFunction(data);
        } catch (error) {
          throw new Error(\`변환 표현식 오류: \${error.message}\`);
        }
        break;
        
      case "custom":
        // 사용자 정의 코드 평가
        try {
          const customFunction = new Function("data", customCode);
          result = customFunction(data);
        } catch (error) {
          throw new Error(\`사용자 정의 코드 오류: \${error.message}\`);
        }
        break;
        
      default:
        throw new Error(\`지원되지 않는 작업: \${operation}\`);
    }
    
    return {
      result,
    };
  } catch (error) {
    console.error("데이터 변환 오류:", error);
    throw error;
  }
}
`,
    examples: [
      {
        name: "필드 매핑",
        description: "데이터 필드 매핑",
        config: {
          operation: "map",
          mapping: {
            id: "item.id",
            fullName: "item.firstName + ' ' + item.lastName",
            email: "item.email",
            isActive: "item.status === 'active'",
          },
        },
      },
      {
        name: "활성 사용자 필터링",
        description: "활성 상태인 사용자만 필터링",
        config: {
          operation: "filter",
          filterExpression: "item.status === 'active' && item.lastLogin > Date.now() - 30 * 24 * 60 * 60 * 1000",
        },
      },
      {
        name: "이름으로 정렬",
        description: "이름 필드로 정렬",
        config: {
          operation: "sort",
          sortField: "name",
          sortDirection: "asc",
        },
      },
    ],
  },

  // ===== HTTP 요청 노드 =====
  {
    id: "http-request",
    name: "HTTP 요청",
    type: "api",
    category: "Integration",
    description: "외부 API에 HTTP 요청을 보냅니다.",
    icon: "Globe",
    inputs: [
      {
        id: "url",
        name: "url",
        label: "URL",
        type: "string",
        description: "요청 URL",
        required: false,
      },
      {
        id: "headers",
        name: "headers",
        label: "헤더",
        type: "object",
        description: "요청 헤더",
        required: false,
      },
      {
        id: "body",
        name: "body",
        label: "본문",
        type: "any",
        description: "요청 본문",
        required: false,
      },
      {
        id: "params",
        name: "params",
        label: "파라미터",
        type: "object",
        description: "쿼리 파라미터",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        name: "response",
        label: "응답",
        type: "any",
        description: "응답 데이터",
      },
      {
        id: "headers",
        name: "headers",
        label: "헤더",
        type: "object",
        description: "응답 헤더",
      },
      {
        id: "status",
        name: "status",
        label: "상태",
        type: "number",
        description: "응답 상태 코드",
      },
    ],
    parameters: [
      {
        name: "method",
        type: "select",
        label: "메서드",
        description: "HTTP 메서드",
        default: "GET",
        options: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
        required: true,
      },
      {
        name: "url",
        type: "string",
        label: "URL",
        description: "요청 URL (입력이 없을 경우 사용)",
        default: "https://api.example.com/data",
      },
      {
        name: "headers",
        type: "json",
        label: "헤더",
        description: "요청 헤더 (JSON 객체)",
        default: '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}',
      },
      {
        name: "body",
        type: "json",
        label: "본문",
        description: "요청 본문 (JSON)",
        default: '{\n  "key": "value"\n}',
        dependsOn: "method",
        condition: {
          field: "method",
          value: ["POST", "PUT", "PATCH"],
        },
      },
      {
        name: "queryParams",
        type: "json",
        label: "쿼리 파라미터",
        description: "URL 쿼리 파라미터 (JSON 객체)",
        default: '{\n  "page": 1,\n  "limit": 10\n}',
      },
      {
        name: "timeout",
        type: "number",
        label: "타임아웃",
        description: "요청 타임아웃 (밀리초)",
        default: 5000,
      },
      {
        name: "retries",
        type: "number",
        label: "재시도",
        description: "실패 시 재시도 횟수",
        default: 0,
      },
      {
        name: "authentication",
        type: "select",
        label: "인증",
        description: "인증 방식",
        default: "none",
        options: ["none", "basic", "bearer", "api-key", "custom"],
      },
      {
        name: "username",
        type: "string",
        label: "사용자 이름",
        description: "기본 인증 사용자 이름",
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "basic",
        },
      },
      {
        name: "password",
        type: "secret",
        label: "비밀번호",
        description: "기본 인증 비밀번호",
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "basic",
        },
      },
      {
        name: "token",
        type: "secret",
        label: "토큰",
        description: "Bearer 토큰",
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "bearer",
        },
      },
      {
        name: "apiKey",
        type: "secret",
        label: "API 키",
        description: "API 키",
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "api-key",
        },
      },
      {
        name: "apiKeyName",
        type: "string",
        label: "API 키 이름",
        description: "API 키 헤더 또는 쿼리 파라미터 이름",
        default: "X-API-Key",
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "api-key",
        },
      },
      {
        name: "apiKeyLocation",
        type: "select",
        label: "API 키 위치",
        description: "API 키 위치",
        default: "header",
        options: ["header", "query"],
        dependsOn: "authentication",
        condition: {
          field: "authentication",
          value: "api-key",
        },
      },
    ],
    code: `
async function execute(inputs, parameters) {
  // 입력 및 파라미터 병합
  const method = parameters.method;
  const url = inputs.url || parameters.url;
  const inputHeaders = inputs.headers || {};
  const paramHeaders = parameters.headers ? (typeof parameters.headers === 'string' ? JSON.parse(parameters.headers) : parameters.headers) : {};
  const headers = { ...paramHeaders, ...inputHeaders };
  const inputBody = inputs.body;
  const paramBody = parameters.body ? (typeof parameters.body === 'string' ? JSON.parse(parameters.body) : parameters.body) : undefined;
  const body = inputBody || paramBody;
  const inputParams = inputs.params || {};
  const paramParams = parameters.queryParams ? (typeof parameters.queryParams === 'string' ? JSON.parse(parameters.queryParams) : parameters.queryParams) : {};
  const queryParams = { ...paramParams, ...inputParams };
  
  // 인증 처리
  if (parameters.authentication === "basic" && parameters.username && parameters.password) {
    const credentials = btoa(\`\${parameters.username}:\${parameters.password}\`);
    headers["Authorization"] = \`Basic \${credentials}\`;
  } else if (parameters.authentication === "bearer" && parameters.token) {
    headers["Authorization"] = \`Bearer \${parameters.token}\`;
  } else if (parameters.authentication === "api-key" && parameters.apiKey) {
    if (parameters.apiKeyLocation === "header") {
      headers[parameters.apiKeyName || "X-API-Key"] = parameters.apiKey;
    } else if (parameters.apiKeyLocation === "query") {
      queryParams[parameters.apiKeyName || "api_key"] = parameters.apiKey;
    }
  }
  
  // URL 쿼리 파라미터 추가
  let fullUrl = url;
  if (Object.keys(queryParams).length > 0) {
    const urlObj = new URL(url);
    for (const [key, value] of Object.entries(queryParams)) {
      urlObj.searchParams.append(key, value);
    }
    fullUrl = urlObj.toString();
  }
  
  console.log(\`HTTP \${method} 요청: \${fullUrl}\`);
  
  // 실제 구현에서는 fetch API를 사용하여 요청을 보냅니다.
  // 여기서는 시뮬레이션된 응답을 반환합니다.
  
  // 시뮬레이션된 지연
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 시뮬레이션된 응답
  let responseData;
  let responseHeaders;
  let statusCode;
  
  // URL에 따라 다른 응답 시뮬레이션
  if (fullUrl.includes("example.com")) {
    responseData = {
      id: 123,
      name: "Example Resource",
      description: "This is a simulated response",
      createdAt: new Date().toISOString(),
    };
    responseHeaders = {
      "content-type": "application/json",
      "cache-control": "max-age=3600",
    };
    statusCode = 200;
  } else if (fullUrl.includes("api.weather")) {
    responseData = {
      location: "Seoul",
      temperature: 22,
      conditions: "Sunny",
      forecast: [
        { day: "Today", high: 24, low: 18, conditions: "Sunny" },
        { day: "Tomorrow", high: 26, low: 19, conditions: "Partly Cloudy" },
      ],
    };
    responseHeaders = {
      "content-type": "application/json",
      "cache-control": "max-age=1800",
    };
    statusCode = 200;
  } else if (method === "POST" || method === "PUT" || method === "PATCH") {
    responseData = {
      success: true,
      message: "Resource updated successfully",
      data: body,
      id: 12345,
    };
    responseHeaders = {
      "content-type": "application/json",
      "location": "/resources/12345",
    };
    statusCode = method === "POST" ? 201 : 200;
  } else if (method === "DELETE") {
    responseData = {
      success: true,
      message: "Resource deleted successfully",
    };
    responseHeaders = {
      "content-type": "application/json",
    };
    statusCode = 204;
  } else {
    responseData = {
      message: "Not found",
    };
    responseHeaders = {
      "content-type": "application/json",
    };
    statusCode = 404;
  }
  
  return {
    response: responseData,
    headers: responseHeaders,
    status: statusCode,
  };
}
`,
    examples: [
      {
        name: "데이터 조회",
        description: "API에서 데이터 조회",
        config: {
          method: "GET",
          url: "https://api.example.com/users",
          queryParams: {
            page: 1,
            limit: 10,
            sort: "name",
          },
          authentication: "bearer",
          token: "your-token-here",
        },
      },
      {
        name: "데이터 생성",
        description: "API에 데이터 생성",
        config: {
          method: "POST",
          url: "https://api.example.com/users",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            name: "John Doe",
            email: "john@example.com",
            role: "user",
          },
          authentication: "api-key",
          apiKey: "your-api-key-here",
          apiKeyName: "X-API-Key",
          apiKeyLocation: "header",
        },
      },
    ],
  },

  // ===== 출력 노드 =====
  {
    id: "response-output",
    name: "응답 출력",
    type: "output",
    category: "Output",
    description: "워크플로우 응답을 생성합니다.",
    icon: "ArrowLeft",
    inputs: [
      {
        id: "data",
        name: "data",
        label: "데이터",
        type: "any",
        description: "응답 데이터",
        required: true,
      },
      {
        id: "metadata",
        name: "metadata",
        label: "메타데이터",
        type: "object",
        description: "응답 메타데이터",
        required: false,
      },
    ],
    outputs: [
      {
        id: "response",
        name: "response",
        label: "응답",
        type: "object",
        description: "최종 응답",
      },
    ],
    parameters: [
      {
        name: "format",
        type: "select",
        label: "형식",
        description: "응답 형식",
        default: "json",
        options: ["json", "text", "html", "xml", "csv"],
        required: true,
      },
      {
        name: "statusCode",
        type: "number",
        label: "상태 코드",
        description: "HTTP 응답 상태 코드",
        default: 200,
      },
      {
        name: "headers",
        type: "json",
        label: "헤더",
        description: "응답 헤더 (JSON 객체)",
        default: '{\n  "Content-Type": "application/json"\n}',
      },
      {
        name: "template",
        type: "code",
        label: "템플릿",
        description: "응답 템플릿 (데이터 변수 사용 가능)",
        default:
          '{\n  "success": true,\n  "data": data,\n  "metadata": metadata || {},\n  "timestamp": new Date().toISOString()\n}',
      },
    ],
    code: `
async function execute(inputs, parameters) {
  const { data, metadata } = inputs;
  const { format, statusCode, headers, template } = parameters;
  
  // 헤더 파싱
  let responseHeaders;
  try {
    responseHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers;
  } catch (error) {
    console.error("헤더 파싱 오류:", error);
    responseHeaders = { "Content-Type": "application/json" };
  }
  
  // 템플릿 평가
  let responseBody;
  try {
    const templateFunction = new Function("data", "metadata", template);
    responseBody = templateFunction(data, metadata);
  } catch (error) {
    console.error("템플릿 평가 오류:", error);
    responseBody = { error: "템플릿 평가 오류", message: error.message };
  }
  
  // 형식에 따른 처리
  let formattedResponse;
  let contentType;
  
  switch (format) {
    case "json":
      formattedResponse = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
      contentType = "application/json";
      break;
      
    case "text":
      formattedResponse = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
      contentType = "text/plain";
      break;
      
    case "html":
      if (typeof responseBody === 'string') {
        formattedResponse = responseBody;
      } else {
        formattedResponse = \`<!DOCTYPE html>
<html>
<head>
  <title>Response</title>
</head>
<body>
  <pre>\${JSON.stringify(responseBody, null, 2)}</pre>
</body>
</html>\`;
      }
      contentType = "text/html";
      break;
      
    case "xml":
      if (typeof responseBody === 'string') {
        formattedResponse = responseBody;
      } else {
        // 간단한 XML 변환 (실제로는 더 복잡한 변환 로직이 필요)
        const jsonToXml = (obj) => {
          let xml = '';
          for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              if (Array.isArray(obj[prop])) {
                for (const item of obj[prop]) {
                  xml += \`<\${prop}>\${typeof item === 'object' ? jsonToXml(item) : item}</\${prop}>\`;
                }
              } else if (typeof obj[prop] === 'object') {
                xml += \`<\${prop}>\${jsonToXml(obj[prop])}</\${prop}>\`;
              } else {
                xml += \`<\${prop}>\${obj[prop]}</\${prop}>\`;
              }
            }
          }
          return xml;
        };
        
        formattedResponse = \`<?xml version="1.0" encoding="UTF-8"?>
<response>
  \${jsonToXml(responseBody)}
</response>\`;
      }
      contentType = "application/xml";
      break;
      
    case "csv":
      if (typeof responseBody === 'string') {
        formattedResponse = responseBody;
      } else if (Array.isArray(responseBody)) {
        // 배열을 CSV로 변환
        if (responseBody.length > 0) {
          const headers = Object.keys(responseBody[0]).join(',');
          const rows = responseBody.map(item => 
            Object.values(item).map(value => 
              typeof value === 'string' ? \`"\${value.replace(/"/g, '""')}"\` : value
            ).join(',')
          );
          formattedResponse = [headers, ...rows].join('\\n');
        } else {
          formattedResponse = '';
        }
      } else {
        formattedResponse = "Error: Cannot convert to CSV";
      }
      contentType = "text/csv";
      break;
      
    default:
      formattedResponse = JSON.stringify(responseBody);
      contentType = "application/json";
  }
  
  // Content-Type 헤더 설정
  if (!responseHeaders["Content-Type"]) {
    responseHeaders["Content-Type"] = contentType;
  }
  
  return {
    response: {
      body: formattedResponse,
      statusCode,
      headers: responseHeaders,
    },
  };
}
`,
    examples: [
      {
        name: "JSON 응답",
        description: "표준 JSON 응답",
        config: {
          format: "json",
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          template: `{
  "success": true,
  "data": data,
  "metadata": {
    ...metadata,
    "timestamp": new Date().toISOString(),
    "version": "1.0"
  }
}`,
        },
      },
      {
        name: "HTML 응답",
        description: "HTML 형식 응답",
        config: {
          format: "html",
          statusCode: 200,
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "max-age=3600",
          },
          template: `const title = "Data Results";
return \`<!DOCTYPE html>
<html>
<head>
  <title>\${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .data { background: #f5f5f5; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>\${title}</h1>
  <div class="data">
    <pre>\${JSON.stringify(data, null, 2)}</pre>
  </div>
  <p>Generated at: \${new Date().toLocaleString()}</p>
</body>
</html>\`;`,
        },
      },
    ],
  },
]

// 노드 라이브러리 조회 함수
export function getNodeDefinition(nodeId: string): NodeDefinition | undefined {
  return nodeLibrary.find((node) => node.id === nodeId)
}

// 카테고리별 노드 조회 함수
export function getNodesByCategory(category: NodeCategory): NodeDefinition[] {
  return nodeLibrary.filter((node) => node.category === category)
}

// 타입별 노드 조회 함수
export function getNodesByType(type: NodeType): NodeDefinition[] {
  return nodeLibrary.filter((node) => node.type === type)
}

// 검색 함수
export function searchNodes(query: string): NodeDefinition[] {
  const lowerQuery = query.toLowerCase()
  return nodeLibrary.filter(
    (node) =>
      node.name.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.id.toLowerCase().includes(lowerQuery),
  )
}
