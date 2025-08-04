"use client"
import {
  RefreshCw,
  Zap,
  Database,
  MessageSquare,
  Webhook,
  Clock,
  Globe,
  ArrowRight,
  Server,
  Network,
  Filter,
  SparklesIcon,
  FileText,
  CreditCard,
  Users,
  GitBranch,
  Cloud,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileCode, Plus, X, Play, Code, Search } from "lucide-react"
import { useComponentAutomator } from "@/hooks/use-component-automator"
import { getLLMService } from "@/lib/llm-service"
import { safeParseJSON, extractJSON } from "@/lib/json-error-fixer"

interface ComponentAutomatorProps {
  apiKey?: string
}

// 기본 컴포넌트 목록 정의
const PREDEFINED_COMPONENTS = [
  // 트리거 컴포넌트
  {
    id: "http-trigger",
    name: "HTTP 트리거",
    type: "trigger",
    description: "HTTP 요청을 통해 워크플로우를 트리거합니다.",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    id: "schedule-trigger",
    name: "스케줄 트리거",
    type: "trigger",
    description: "정해진 일정에 따라 워크플로우를 트리거합니다.",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: "webhook-trigger",
    name: "웹훅 트리거",
    type: "trigger",
    description: "외부 서비스의 웹훅을 통해 워크플로우를 트리거합니다.",
    icon: <Webhook className="h-4 w-4" />,
  },
  {
    id: "event-trigger",
    name: "이벤트 트리거",
    type: "trigger",
    description: "시스템 이벤트에 반응하여 워크플로우를 트리거합니다.",
    icon: <Zap className="h-4 w-4" />,
  },

  // LLM 컴포넌트
  {
    id: "openai-llm",
    name: "OpenAI LLM",
    type: "llm",
    description: "OpenAI의 언어 모델을 사용합니다.",
    icon: <SparklesIcon className="h-4 w-4" />,
  },
  {
    id: "google-gemini-llm",
    name: "Google Gemini LLM",
    type: "llm",
    description: "Google의 Gemini 언어 모델을 사용합니다.",
    icon: <SparklesIcon className="h-4 w-4" />,
  },
  {
    id: "huggingface-llm",
    name: "Hugging Face LLM",
    type: "llm",
    description: "Hugging Face의 언어 모델을 사용합니다.",
    icon: <SparklesIcon className="h-4 w-4" />,
  },
  {
    id: "anthropic-claude-llm",
    name: "Anthropic Claude LLM",
    type: "llm",
    description: "Anthropic의 Claude 언어 모델을 사용합니다.",
    icon: <SparklesIcon className="h-4 w-4" />,
  },

  // 데이터 처리 컴포넌트
  {
    id: "data-transformer",
    name: "데이터 변환기",
    type: "data",
    description: "데이터 형식을 변환합니다.",
    icon: <ArrowRight className="h-4 w-4" />,
  },
  {
    id: "data-filter",
    name: "데이터 필터",
    type: "data",
    description: "조건에 따라 데이터를 필터링합니다.",
    icon: <Filter className="h-4 w-4" />,
  },
  {
    id: "data-merger",
    name: "데이터 병합기",
    type: "data",
    description: "여러 데이터 소스를 병합합니다.",
    icon: <Database className="h-4 w-4" />,
  },

  // 통합 컴포넌트
  {
    id: "http-request",
    name: "HTTP 요청",
    type: "integration",
    description: "외부 API에 HTTP 요청을 보냅니다.",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    id: "database-connector",
    name: "데이터베이스 커넥터",
    type: "integration",
    description: "데이터베이스에 연결하고 쿼리를 실행합니다.",
    icon: <Database className="h-4 w-4" />,
  },
  {
    id: "file-storage",
    name: "파일 스토리지",
    type: "integration",
    description: "파일을 저장하고 검색합니다.",
    icon: <Server className="h-4 w-4" />,
  },
  {
    id: "message-queue",
    name: "메시지 큐",
    type: "integration",
    description: "메시지 큐 시스템과 통합합니다.",
    icon: <MessageSquare className="h-4 w-4" />,
  },

  // 외부 API 컴포넌트 추가
  {
    id: "google-sheets-api",
    name: "Google Sheets API",
    type: "integration",
    description: "Google Sheets와 통합하여 데이터를 읽고 쓸 수 있습니다.",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "slack-api",
    name: "Slack API",
    type: "integration",
    description: "Slack과 통합하여 메시지를 보내고 받을 수 있습니다.",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "twitter-api",
    name: "Twitter API",
    type: "integration",
    description: "Twitter와 통합하여 트윗을 읽고 쓸 수 있습니다.",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "stripe-api",
    name: "Stripe API",
    type: "integration",
    description: "결제 처리를 위해 Stripe와 통합합니다.",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    id: "salesforce-api",
    name: "Salesforce API",
    type: "integration",
    description: "Salesforce CRM과 통합합니다.",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "github-api",
    name: "GitHub API",
    type: "integration",
    description: "GitHub 저장소와 통합합니다.",
    icon: <GitBranch className="h-4 w-4" />,
  },
  {
    id: "aws-s3-api",
    name: "AWS S3 API",
    type: "integration",
    description: "AWS S3 스토리지와 통합합니다.",
    icon: <Cloud className="h-4 w-4" />,
  },

  // 로직 컴포넌트
  {
    id: "condition",
    name: "조건문",
    type: "logic",
    description: "조건에 따라 워크플로우 경로를 결정합니다.",
    icon: <ArrowRight className="h-4 w-4" />,
  },
  {
    id: "loop",
    name: "반복문",
    type: "logic",
    description: "데이터 컬렉션을 반복 처리합니다.",
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    id: "switch",
    name: "스위치",
    type: "logic",
    description: "여러 조건에 따라 다른 경로로 분기합니다.",
    icon: <Network className="h-4 w-4" />,
  },

  // 유틸리티 컴포넌트
  {
    id: "delay",
    name: "지연",
    type: "utility",
    description: "지정된 시간 동안 워크플로우를 일시 중지합니다.",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: "logger",
    name: "로거",
    type: "utility",
    description: "워크플로우 실행에 대한 로그 메시지를 기록합니다.",
    icon: <MessageSquare className="h-4 w-4" />,
  },
]

// 컴포넌트 코드 예시 정의
const COMPONENT_CODE_EXAMPLES: Record<string, string> = {
  "http-trigger": `class HttpTrigger {
  constructor() {
    this.name = "HTTP 트리거";
    this.type = "trigger";
  }

  async handleRequest(request) {
    // HTTP 요청 처리 로직
    return {
      success: true,
      data: request.body,
      timestamp: new Date().toISOString()
    };
  }
}

export default HttpTrigger;`,

  "schedule-trigger": `class ScheduleTrigger {
  constructor() {
    this.name = "스케줄 트리거";
    this.type = "trigger";
    this.schedule = "0 * * * *"; // 기본값: 매시간
  }

  setSchedule(cronExpression) {
    this.schedule = cronExpression;
  }

  async execute(context) {
    // 스케줄에 따른 실행 로직
    return {
      success: true,
      timestamp: new Date().toISOString(),
      nextRun: this.getNextRunTime()
    };
  }

  getNextRunTime() {
    // 다음 실행 시간 계산 로직
    return new Date(Date.now() + 3600000).toISOString();
  }
}

export default ScheduleTrigger;`,

  "http-request": `class HttpRequest {
  constructor() {
    this.name = "HTTP 요청";
    this.type = "integration";
  }

  async execute(config) {
    const { url, method = 'GET', headers = {}, body } = config;
    
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP 오류: \${response.status}\`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default HttpRequest;`,

  condition: `class Condition {
  constructor() {
    this.name = "조건문";
    this.type = "logic";
  }

  async evaluate(data, condition) {
    try {
      // 조건식 평가 (안전한 방식으로 구현 필요)
      const result = this.safeEvaluate(condition, data);
      
      return {
        success: true,
        result: !!result,
        path: result ? "true" : "false"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: "false" // 오류 시 기본 경로
      };
    }
  }
  
  safeEvaluate(conditionExpression, context) {
    // 안전한 조건식 평가 로직
    // 실제 구현에서는 보안을 고려한 방식 사용 필요
    const fn = new Function("context", \`with(context) { return \${conditionExpression}; }\`);
    return fn(context);
  }
}

export default Condition;`,

  "data-transformer": `class DataTransformer {
  constructor() {
    this.name = "데이터 변환기";
    this.type = "data";
  }

  async transform(data, transformations) {
    try {
      let result = { ...data };
      
      for (const transformation of transformations) {
        switch (transformation.type) {
          case "map":
            result = this.applyMap(result, transformation.mapping);
            break;
          case "filter":
            result = this.applyFilter(result, transformation.condition);
            break;
          case "reduce":
            result = this.applyReduce(result, transformation.reducer, transformation.initialValue);
            break;
          default:
            throw new Error(\`알 수 없는 변환 유형: \${transformation.type}\`);
        }
      }
      
      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  applyMap(data, mapping) {
    if (Array.isArray(data)) {
      return data.map(item => {
        const result = {};
        for (const [key, value] of Object.entries(mapping)) {
          result[key] = this.evaluateExpression(value, item);
        }
        return result;
      });
    }
    
    const result = {};
    for (const [key, value] of Object.entries(mapping)) {
      result[key] = this.evaluateExpression(value, data);
    }
    return result;
  }
  
  applyFilter(data, condition) {
    if (Array.isArray(data)) {
      return data.filter(item => this.evaluateExpression(condition, item));
    }
    return data;
  }
  
  applyReduce(data, reducer, initialValue) {
    if (Array.isArray(data)) {
      return data.reduce((acc, item) => {
        return this.evaluateExpression(reducer, { acc, item });
      }, initialValue);
    }
    return data;
  }
  
  evaluateExpression(expression, context) {
    // 안전한 표현식 평가 로직
    // 실제 구현에서는 보안을 고려한 방식 사용 필요
    const fn = new Function("context", \`with(context) { return \${expression}; }\`);
    return fn(context);
  }
}

export default DataTransformer;`,

  "openai-llm": `class OpenAILLM {
  constructor() {
    this.name = "OpenAI LLM";
    this.type = "llm";
    this.model = "gpt-4o";
    this.apiKey = null;
    this.baseUrl = "https://api.openai.com/v1";
    this.options = {
      temperature: 0.7,
      max_tokens: 1000
    };
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    return this;
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    return this;
  }

  setModel(model) {
    this.model = model;
    return this;
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  async generateText(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. setApiKey() 메서드를 사용하여 API 키를 설정하세요.");
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiKey}\`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          ...this.options,
          ...options
        })
      };

      console.log(\`OpenAI \${this.model} 모델로 텍스트 생성 중: \${prompt.substring(0, 50)}...\`);
      
      // 실제 구현에서는 API 호출
      // const response = await fetch(\`\${this.baseUrl}/chat/completions\`, requestOptions);
      // const data = await response.json();
      
      // 시뮬레이션된 응답
      const response = \`이것은 "\${prompt.substring(0, 30)}..."에 대한 OpenAI \${this.model} 모델의 응답입니다.\`;
      
      return {
        success: true,
        text: response,
        model: this.model,
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: response.length / 4,
          totalTokens: (prompt.length + response.length) / 4
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async generateChat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. setApiKey() 메서드를 사용하여 API 키를 설정하세요.");
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiKey}\`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          ...this.options,
          ...options
        })
      };

      console.log(\`OpenAI \${this.model} 모델로 채팅 응답 생성 중\`);
      
      // 실제 구현에서는 API 호출
      // const response = await fetch(\`\${this.baseUrl}/chat/completions\`, requestOptions);
      // const data = await response.json();
      
      // 시뮬레이션된 응답
      const lastMessage = messages[messages.length - 1];
      const response = \`이것은 "\${lastMessage.content.substring(0, 30)}..."에 대한 OpenAI \${this.model} 모델의 채팅 응답입니다.\`;
      
      return {
        success: true,
        message: {
          role: "assistant",
          content: response
        },
        model: this.model,
        usage: {
          promptTokens: JSON.stringify(messages).length / 4,
          completionTokens: response.length / 4,
          totalTokens: (JSON.stringify(messages).length + response.length) / 4
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default OpenAILLM;`,

  "google-sheets-api": `class GoogleSheetsAPI {
  constructor() {
    this.name = "Google Sheets API";
    this.type = "integration";
    this.credentials = null;
  }

  setCredentials(credentials) {
    this.credentials = credentials;
  }

  async readSheet(spreadsheetId, range) {
    try {
      console.log(\`Google Sheets API: 스프레드시트 \${spreadsheetId}의 \${range} 범위 읽기\`);
      
      // 실제 구현에서는 Google Sheets API 호출
      // 시뮬레이션된 응답
      const data = [
        ["이름", "이메일", "점수"],
        ["홍길동", "hong@example.com", "85"],
        ["김철수", "kim@example.com", "92"],
        ["이영희", "lee@example.com", "78"]
      ];
      
      return {
        success: true,
        data,
        range,
        spreadsheetId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async writeSheet(spreadsheetId, range, values) {
    try {
      console.log(\`Google Sheets API: 스프레드시트 \${spreadsheetId}의 \${range} 범위에 데이터 쓰기\`);
      
      // 실제 구현에서는 Google Sheets API 호출
      return {
        success: true,
        updatedRange: range,
        updatedRows: values.length,
        updatedColumns: values[0].length,
        spreadsheetId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default GoogleSheetsAPI;`,

  "google-gemini-llm": `class GeminiLLM {
  constructor() {
    this.name = "Google Gemini LLM";
    this.type = "llm";
    this.model = "gemini-1.5-pro";
    this.apiKey = null;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    this.options = {
      temperature: 0.7,
      maxOutputTokens: 1000,
      topK: 40,
      topP: 0.95
    };
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    return this;
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    return this;
  }

  setModel(model) {
    this.model = model;
    return this;
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  async generateText(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. setApiKey() 메서드를 사용하여 API 키를 설정하세요.");
    }

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: this.options.temperature,
            maxOutputTokens: this.options.maxOutputTokens,
            topK: this.options.topK,
            topP: this.options.topP,
            ...options
          }
        })
      };

      console.log(\`Gemini \${this.model} 모델로 텍스트 생성 중: \${prompt.substring(0, 50)}...\`);
      
      // 실제 구현에서는 API 호출
      // const response = await fetch(\`\${this.baseUrl}/models/\${this.model}:generateContent?key=\${this.apiKey}\`, requestOptions);
      // const data = await response.json();
      
      // 시뮬레이션된 응답
      const response = \`이것은 "\${prompt.substring(0, 30)}..."에 대한 Gemini \${this.model} 모델의 응답입니다.\`;
      
      return {
        success: true,
        text: response,
        model: this.model,
        usage: {
          promptTokens: prompt.length / 4,
          completionTokens: response.length / 4,
          totalTokens: (prompt.length + response.length) / 4
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async generateChat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. setApiKey() 메서드를 사용하여 API 키를 설정하세요.");
    }

    try {
      // Gemini 형식으로 메시지 변환
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: this.options.temperature,
            maxOutputTokens: this.options.maxOutputTokens,
            topK: this.options.topK,
            topP: this.options.topP,
            ...options
          }
        })
      };

      console.log(\`Gemini \${this.model} 모델로 채팅 응답 생성 중\`);
      
      // 실제 구현에서는 API 호출
      // const response = await fetch(\`\${this.baseUrl}/models/\${this.model}:generateContent?key=\${this.apiKey}\`, requestOptions);
      // const data = await response.json();
      
      // 시뮬레이션된 응답
      const lastMessage = messages[messages.length - 1];
      const response = \`이것은 "\${lastMessage.content.substring(0, 30)}..."에 대한 Gemini \${this.model} 모델의 채팅 응답입니다.\`;
      
      return {
        success: true,
        message: {
          role: "assistant",
          content: response
        },
        model: this.model,
        usage: {
          promptTokens: JSON.stringify(messages).length / 4,
          completionTokens: response.length / 4,
          totalTokens: (JSON.stringify(messages).length + response.length) / 4
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default GeminiLLM;`,
}

// 컴포넌트 파라미터 예시 정의
const COMPONENT_PARAMETERS_EXAMPLES: Record<string, any[]> = {
  "openai-llm": [
    {
      name: "apiKey",
      type: "string",
      description: "OpenAI API 키",
      required: true,
    },
    {
      name: "model",
      type: "string",
      description: "사용할 OpenAI 모델 (gpt-4o, gpt-3.5-turbo 등)",
      defaultValue: "gpt-4o",
      required: true,
    },
    {
      name: "baseUrl",
      type: "string",
      description: "OpenAI API 기본 URL (기본값: https://api.openai.com/v1)",
      defaultValue: "https://api.openai.com/v1",
      required: false,
    },
    {
      name: "temperature",
      type: "number",
      description: "응답의 창의성 정도 (0.0 ~ 1.0)",
      defaultValue: 0.7,
      required: false,
    },
    {
      name: "maxTokens",
      type: "number",
      description: "생성할 최대 토큰 수",
      defaultValue: 1000,
      required: false,
    },
  ],
}

export function ComponentAutomator({ apiKey }: ComponentAutomatorProps) {
  const {
    components,
    selectedComponentId,
    isGenerating,
    generateComponent,
    selectComponent,
    updateComponent,
    deleteComponent,
  } = useComponentAutomator(apiKey)

  const [activeTab, setActiveTab] = useState("components")
  const [showComponentDialog, setShowComponentDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [componentTypeFilter, setComponentTypeFilter] = useState<string | null>("")
  const [showAIGenerationDialog, setShowAIGenerationDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const [componentFormData, setComponentFormData] = useState({
    name: "",
    type: "agent",
    description: "",
    features: [] as string[],
    code: "",
  })

  const [newFeature, setNewFeature] = useState("")

  const selectedComponent = components.find((c) => c.id === selectedComponentId)
  const selectedPredefinedComponent = PREDEFINED_COMPONENTS.find((c) => c.id === selectedComponentId)

  // 컴포넌트 선택 시 폼 데이터 업데이트
  useEffect(() => {
    if (selectedComponent && editMode) {
      setComponentFormData({
        name: selectedComponent.name,
        type: selectedComponent.type,
        description: selectedComponent.description,
        features: [...selectedComponent.features],
        code: selectedComponent.code,
      })
    }
  }, [selectedComponent, editMode])

  const openCreateComponentDialog = () => {
    setEditMode(false)
    setComponentFormData({
      name: "",
      type: "agent",
      description: "",
      features: [],
      code: "",
    })
    setShowComponentDialog(true)
  }

  const openEditComponentDialog = () => {
    if (!selectedComponent) return

    setEditMode(true)
    setComponentFormData({
      name: selectedComponent.name,
      type: selectedComponent.type,
      description: selectedComponent.description,
      features: [...selectedComponent.features],
      code: selectedComponent.code,
    })
    setShowComponentDialog(true)
  }

  const handleAddFeature = () => {
    if (!newFeature.trim()) return

    setComponentFormData({
      ...componentFormData,
      features: [...componentFormData.features, newFeature.trim()],
    })

    setNewFeature("")
  }

  const handleRemoveFeature = (index: number) => {
    setComponentFormData({
      ...componentFormData,
      features: componentFormData.features.filter((_, i) => i !== index),
    })
  }

  // 코드 생성 함수
  const generateComponentCode = async () => {
    if (!apiKey || !componentFormData.name || !componentFormData.description) return

    try {
      const llmService = getLLMService(apiKey)
      const prompt = `
다음 명세에 맞는 JavaScript 컴포넌트 클래스를 생성해주세요:

이름: ${componentFormData.name}
유형: ${componentFormData.type}
설명: ${componentFormData.description}
기능:
${componentFormData.features.map((f) => `- ${f}`).join("\\n")}

다음 형식으로 코드를 생성해주세요:
1. 클래스 이름은 공백 없이 생성해주세요
2. 주석으로 이름, 설명, 기능을 포함해주세요
3. 생성자에서 필요한 속성을 초기화해주세요
4. 기능에 맞는 메서드를 구현해주세요
5. export default로 클래스를 내보내주세요

코드만 반환해주세요. 설명이나 다른 텍스트는 포함하지 마세요.
`

      const code = await llmService.generateText(prompt)
      setComponentFormData({
        ...componentFormData,
        code,
      })
    } catch (error) {
      console.error("코드 생성 오류:", error)
    }
  }

  // AI 생성 다이얼로그에서 컴포넌트 생성
  const handleAIGeneration = async () => {
    if (!apiKey || !aiPrompt.trim()) return

    setIsGeneratingAI(true)

    try {
      const llmService = getLLMService(apiKey)

      // 더 명확하고 구체적인 프롬프트 작성
      const prompt = `다음 설명을 바탕으로 컴포넌트 명세를 생성해주세요.

사용자 요청: "${aiPrompt}"

아래 JSON 형식으로 정확히 응답해주세요. 다른 텍스트나 설명은 포함하지 마세요.

JSON_START
{
  "name": "컴포넌트 이름 (한글 또는 영문)",
  "type": "컴포넌트 유형 (agent, data, integration, logic, utility, llm, trigger 중 하나)",
  "description": "컴포넌트의 기능과 목적에 대한 상세한 설명",
  "features": [
    "주요 기능 1",
    "주요 기능 2", 
    "주요 기능 3"
  ],
  "code": "완전한 JavaScript 클래스 코드 (export default 포함)"
}
JSON_END

중요 규칙:
1. JSON_START와 JSON_END 사이에만 JSON 데이터를 작성하세요
2. code 필드의 문자열에서 따옴표는 \\\\"로 이스케이프하세요
3. 줄바꿈은 \\\\n으로 표시하세요
4. 유효한 JavaScript 클래스를 생성하세요
5. 반드시 export default를 포함하세요`

      // 실제 LLM 호출
      const response = await llmService.generateText(prompt)
      console.log("AI 응답:", response)

      try {
        // JSON 추출 및 파싱
        const { json: extractedJson, error: extractError } = extractJSON(response)

        if (extractError || !extractedJson) {
          throw new Error(`JSON 추출 실패: ${extractError?.message}`)
        }

        const { data: componentSpec, error: parseError } = safeParseJSON(extractedJson)

        if (parseError || !componentSpec) {
          throw new Error(`JSON 파싱 실패: ${parseError?.message}`)
        }

        // 필수 필드 검증 및 기본값 설정
        const validatedSpec = {
          name: componentSpec.name || `AI 컴포넌트 ${new Date().toLocaleTimeString()}`,
          type: ["agent", "data", "integration", "logic", "utility", "llm", "trigger"].includes(componentSpec.type)
            ? componentSpec.type
            : "utility",
          description: componentSpec.description || `프롬프트: "${aiPrompt}"에 대한 AI 생성 컴포넌트`,
          features:
            Array.isArray(componentSpec.features) && componentSpec.features.length > 0
              ? componentSpec.features
              : ["기본 실행", "로깅"],
          code: componentSpec.code || generateFallbackCode(componentSpec.name || "AIComponent", aiPrompt),
        }

        console.log("검증된 컴포넌트 명세:", validatedSpec)

        // 새 컴포넌트 생성
        await generateComponent(validatedSpec)

        setShowAIGenerationDialog(false)
        setAiPrompt("")
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError)

        // 파싱 실패 시 폴백 컴포넌트 생성
        const fallbackSpec = {
          name: `AI 폴백 컴포넌트 (${new Date().toLocaleTimeString()})`,
          type: "utility",
          description: `프롬프트: "${aiPrompt.substring(0, 100)}..."에 대한 AI 생성 컴포넌트 (JSON 파싱 오류로 인한 폴백)`,
          features: ["기본 실행", "로깅", "오류 처리"],
          code: generateFallbackCode("AIFallbackComponent", aiPrompt),
        }

        await generateComponent(fallbackSpec)
        setShowAIGenerationDialog(false)
        setAiPrompt("")

        alert(`JSON 파싱 오류가 발생했지만 폴백 컴포넌트를 생성했습니다.

오류 내용: ${parseError.message}

원본 응답: ${response.substring(0, 200)}...`)
      }
    } catch (error) {
      console.error("AI 생성 오류:", error)
      alert(`AI 생성 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // 폴백 코드 생성 함수 추가
  const generateFallbackCode = (className: string, prompt: string) => {
    const safeClassName = className.replace(/[^a-zA-Z0-9]/g, "")
    const safePrompt = prompt.replace(/"/g, '\\\\"').replace(/\n/g, "\\\\n")

    return `class ${safeClassName} {
  constructor() {
    this.name = "${className}";
    this.type = "utility";
    this.prompt = "${safePrompt}";
    this.createdAt = new Date().toISOString();
  }
  
  execute(input = {}) {
    try {
      console.log("AI 폴백 컴포넌트 실행:", this.name);
      console.log("원본 프롬프트:", this.prompt);
      console.log("입력 데이터:", input);
      
      return {
        success: true,
        message: "폴백 컴포넌트가 성공적으로 실행되었습니다",
        originalPrompt: this.prompt,
        executedAt: new Date().toISOString(),
        input: input
      };
    } catch (error) {
      console.error("폴백 컴포넌트 실행 오류:", error);
      return {
        success: false,
        error: error.message,
        originalPrompt: this.prompt
      };
    }
  }
  
  getInfo() {
    return {
      name: this.name,
      type: this.type,
      prompt: this.prompt,
      createdAt: this.createdAt
    };
  }
}

export default ${safeClassName};`
  }

  // 필터링된 컴포넌트 목록
  const filteredPredefinedComponents = PREDEFINED_COMPONENTS.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !componentTypeFilter || component.type === componentTypeFilter
    return matchesSearch && matchesType
  })

  const filteredCustomComponents = components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !componentTypeFilter || component.type === componentTypeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="h-full flex">
      {/* 컴포넌트 라이브러리 */}
      <div className="w-80 border-r bg-white">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Component Library</CardTitle>
              <div className="flex gap-1">
                <Dialog open={showAIGenerationDialog} onOpenChange={setShowAIGenerationDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <SparklesIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>AI 컴포넌트 생성</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="ai-prompt">컴포넌트 설명</Label>
                        <Textarea
                          id="ai-prompt"
                          placeholder="예: 이메일을 보내는 컴포넌트를 만들어주세요"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAIGenerationDialog(false)}>
                          취소
                        </Button>
                        <Button onClick={handleAIGeneration} disabled={isGeneratingAI || !aiPrompt.trim()}>
                          {isGeneratingAI ? "생성 중..." : "생성"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" onClick={openCreateComponentDialog}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="컴포넌트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={componentTypeFilter || ""}
                onValueChange={(value) => setComponentTypeFilter(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="타입 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">모든 타입</SelectItem>
                  <SelectItem value="trigger">트리거</SelectItem>
                  <SelectItem value="llm">LLM</SelectItem>
                  <SelectItem value="data">데이터</SelectItem>
                  <SelectItem value="integration">통합</SelectItem>
                  <SelectItem value="logic">로직</SelectItem>
                  <SelectItem value="utility">유틸리티</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="components">기본 컴포넌트</TabsTrigger>
                <TabsTrigger value="custom">사용자 정의</TabsTrigger>
              </TabsList>

              <TabsContent value="components" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="p-4 space-y-2">
                    {filteredPredefinedComponents.map((component) => (
                      <Card
                        key={component.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedComponentId === component.id ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => selectComponent(component.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            {component.icon}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{component.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {component.type}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{component.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="custom" className="mt-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="p-4 space-y-2">
                    {filteredCustomComponents.map((component) => (
                      <Card
                        key={component.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedComponentId === component.id ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => selectComponent(component.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{component.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {component.type}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{component.description}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteComponent(component.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredCustomComponents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileCode className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">사용자 정의 컴포넌트가 없습니다</p>
                        <p className="text-xs">새 컴포넌트를 만들어보세요</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 컴포넌트 상세 정보 */}
      <div className="flex-1">
        {selectedComponent || selectedPredefinedComponent ? (
          <Card className="h-full rounded-none border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedComponent?.name || selectedPredefinedComponent?.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedComponent?.type || selectedPredefinedComponent?.type}</Badge>
                    {selectedComponent && <Badge variant="secondary">사용자 정의</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedComponent && (
                    <Button variant="outline" onClick={openEditComponentDialog}>
                      편집
                    </Button>
                  )}
                  <Button variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    테스트
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">설명</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedComponent?.description || selectedPredefinedComponent?.description}
                    </p>
                  </div>

                  {selectedComponent?.features && selectedComponent.features.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">기능</h3>
                      <ul className="space-y-1">
                        {selectedComponent.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-2">코드</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>
                          {selectedComponent?.code ||
                            COMPONENT_CODE_EXAMPLES[selectedPredefinedComponent?.id || ""] ||
                            "// 코드가 없습니다"}
                        </code>
                      </pre>
                    </div>
                  </div>

                  {testResults && (
                    <div>
                      <h3 className="font-medium mb-2">테스트 결과</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm">
                          <code>{JSON.stringify(testResults, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileCode className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">컴포넌트를 선택하세요</h3>
              <p className="text-sm">왼쪽에서 컴포넌트를 선택하여 상세 정보를 확인하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* 컴포넌트 생성/편집 다이얼로그 */}
      <Dialog open={showComponentDialog} onOpenChange={setShowComponentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "컴포넌트 편집" : "새 컴포넌트 생성"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* 폼 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="component-name">이름</Label>
                <Input
                  id="component-name"
                  value={componentFormData.name}
                  onChange={(e) => setComponentFormData({ ...componentFormData, name: e.target.value })}
                  placeholder="컴포넌트 이름"
                />
              </div>

              <div>
                <Label htmlFor="component-type">타입</Label>
                <Select
                  value={componentFormData.type}
                  onValueChange={(value) => setComponentFormData({ ...componentFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">에이전트</SelectItem>
                    <SelectItem value="trigger">트리거</SelectItem>
                    <SelectItem value="llm">LLM</SelectItem>
                    <SelectItem value="data">데이터</SelectItem>
                    <SelectItem value="integration">통합</SelectItem>
                    <SelectItem value="logic">로직</SelectItem>
                    <SelectItem value="utility">유틸리티</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="component-description">설명</Label>
                <Textarea
                  id="component-description"
                  value={componentFormData.description}
                  onChange={(e) => setComponentFormData({ ...componentFormData, description: e.target.value })}
                  placeholder="컴포넌트 설명"
                  rows={3}
                />
              </div>

              <div>
                <Label>기능</Label>
                <div className="space-y-2">
                  {componentFormData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} disabled className="flex-1" />
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveFeature(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="새 기능 추가"
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                    />
                    <Button size="sm" onClick={handleAddFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 코드 에디터 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>코드</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateComponentCode}
                  disabled={!apiKey || !componentFormData.name || !componentFormData.description}
                >
                  <Code className="h-4 w-4 mr-2" />
                  코드 생성
                </Button>
              </div>
              <Textarea
                value={componentFormData.code}
                onChange={(e) => setComponentFormData({ ...componentFormData, code: e.target.value })}
                placeholder="JavaScript 클래스 코드"
                rows={20}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowComponentDialog(false)}>
              취소
            </Button>
            <Button
              onClick={async () => {
                if (editMode && selectedComponent) {
                  await updateComponent(selectedComponent.id, componentFormData)
                } else {
                  await generateComponent(componentFormData)
                }
                setShowComponentDialog(false)
              }}
              disabled={!componentFormData.name || !componentFormData.description}
            >
              {editMode ? "업데이트" : "생성"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
