"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAgentState } from "@/hooks/use-agent-state"
import { getLLMService } from "@/lib/llm-service"
import {
  Send,
  Code,
  FileCode,
  Play,
  Save,
  Copy,
  Folder,
  RefreshCw,
  CheckCircle,
  XCircle,
  Terminal,
  FolderTree,
  FileText,
  ChevronRight,
  ChevronLeft,
  Square,
  Plus,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  codeBlocks?: Array<{
    language: string
    code: string
    fileName?: string
  }>
  streaming?: boolean
}

interface CodeFile {
  id: string
  name: string
  path: string
  language: string
  content: string
  lastModified: Date
  status?: "created" | "modified" | "verified" | "tested" | "optimized" | "deployed"
}

interface CodeProject {
  id: string
  name: string
  description: string
  files: CodeFile[]
  createdAt: Date
  lastModified: Date
  status?: "planning" | "coding" | "testing" | "optimizing" | "complete"
}

// 두 가지 export 방식을 모두 지원
export function CodeBuilderInterface({ apiKey = "" }) {
  const { toast } = useToast()
  const { agents } = useAgentState()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: "안녕하세요! 코드빌더입니다. 어떤 프로세스를 만들고 싶으신가요?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null)
  const [activeProject, setActiveProject] = useState<CodeProject | null>(null)
  const [codeAgents, setCodeAgents] = useState<any[]>([])
  const [selectedCodeAgent, setSelectedCodeAgent] = useState<string | null>(null)
  const [executionResult, setExecutionResult] = useState<string>("")
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "error">("idle")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isFileExplorerVisible, setIsFileExplorerVisible] = useState(true)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeTab, setActiveTab] = useState("code")
  const [previewContent, setPreviewContent] = useState<string>("")
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 파일 스트리밍 관련 상태 추가
  const [fileStreaming, setFileStreaming] = useState(false)
  const [streamedFileContent, setStreamedFileContent] = useState("")
  const [streamTarget, setStreamTarget] = useState<string | null>(null)

  // 동시 스트리밍 관련 상태 추가
  const [pendingFiles, setPendingFiles] = useState<CodeFile[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [workPlan, setWorkPlan] = useState<string>("")
  const [showEmptyState, setShowEmptyState] = useState(true)

  // 에이전트 실행 상태 관리
  const [isAgentRunning, setIsAgentRunning] = useState(false)

  // 에이전트 워크스페이스에서 코드 어시스턴트 불러오기
  useEffect(() => {
    // 에이전트 중에서 코딩 관련 에이전트 필터링
    const codingAgents = agents.filter(
      (agent) =>
        agent.type === "specialized" &&
        (agent.name.toLowerCase().includes("코드") ||
          agent.name.toLowerCase().includes("code") ||
          agent.description.toLowerCase().includes("코드") ||
          agent.description.toLowerCase().includes("code") ||
          agent.description.toLowerCase().includes("프로그래밍") ||
          agent.description.toLowerCase().includes("개발")),
    )

    setCodeAgents(codingAgents)

    // 코드 에이전트가 있으면 첫 번째 에이전트 선택
    if (codingAgents.length > 0 && !selectedCodeAgent) {
      setSelectedCodeAgent(codingAgents[0].id)
    }
  }, [agents, selectedCodeAgent])

  // 에이전트 시작/중지 토글
  const toggleAgentRunning = () => {
    setIsAgentRunning(!isAgentRunning)
    toast({
      title: isAgentRunning ? "에이전트 중지됨" : "에이전트 실행 중",
      description: isAgentRunning ? "에이전트가 중지되었습니다." : "에이전트가 실행 중입니다.",
    })
  }

  // 스크롤 함수 정의
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // 메시지가 변경될 때마다 스크롤 조정
  useEffect(() => {
    // 즉시 스크롤 시도
    scrollToBottom()

    // requestAnimationFrame을 사용하여 다음 프레임에서 스크롤
    requestAnimationFrame(scrollToBottom)

    // 약간의 지연 후 한 번 더 스크롤 (비동기 렌더링 이후 확실히 스크롤되도록)
    const timer = setTimeout(scrollToBottom, 100)

    return () => clearTimeout(timer)
  }, [messages, streamingMessage, workPlan, isGeneratingPlan])

  // 메시지에서 코드 블록 추출
  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)(?:\s+file="([^"]+)")?\n([\s\S]*?)```/g
    const codeBlocks = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1],
        fileName: match[2] || undefined,
        code: match[3],
      })
    }

    return codeBlocks
  }

  // 작업 계획 스트리밍 시뮬레이션
  const simulateWorkPlanStreaming = async (plan: string, signal?: AbortSignal) => {
    setIsGeneratingPlan(true)
    setWorkPlan("")

    const lines = plan.split("\n")

    for (let i = 0; i < lines.length; i++) {
      // 중단 신호 확인
      if (signal?.aborted) {
        throw new DOMException("사용자에 의해 중단됨", "AbortError")
      }

      await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))
      setWorkPlan((prev) => prev + lines[i] + "\n")
    }

    setIsGeneratingPlan(false)
    return plan
  }

  // 스트리밍 시뮬레이션
  const simulateStreaming = async (response: string, signal?: AbortSignal) => {
    setIsStreaming(true)
    setStreamingMessage("")

    const words = response.split(" ")

    for (let i = 0; i < words.length; i++) {
      // 중단 신호 확인
      if (signal?.aborted) {
        throw new DOMException("사용자에 의해 중단됨", "AbortError")
      }

      await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 30))
      setStreamingMessage((prev) => prev + words[i] + " ")
    }

    setIsStreaming(false)
    return response
  }

  // 파일 스트리밍 시뮬레이션
  const simulateFileStreaming = async (file: CodeFile, signal?: AbortSignal) => {
    setFileStreaming(true)
    setStreamTarget(file.id)
    setStreamedFileContent("")

    const content = file.content
    const chars = content.split("")

    for (let i = 0; i < chars.length; i++) {
      // 중단 신호 확인
      if (signal?.aborted) {
        throw new DOMException("사용자에 의해 중단됨", "AbortError")
      }

      await new Promise((resolve) => setTimeout(resolve, 5))
      setStreamedFileContent((prev) => prev + chars[i])
    }

    setFileStreaming(false)
    setStreamTarget(null)
    return content
  }

  // 메시지 전송 중지
  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsProcessing(false)
      setIsStreaming(false)
      setIsGeneratingPlan(false)
      setFileStreaming(false)

      // 스트리밍 메시지 즉시 업데이트
      setMessages((prev) =>
        prev.map((msg) =>
          msg.streaming ? { ...msg, content: streamingMessage + "\n\n[생성 중단됨]", streaming: false } : msg,
        ),
      )

      toast({
        title: "생성 중단",
        description: "코드 생성이 중단되었습니다.",
      })
    }
  }

  // 새 프로젝트 생성
  const createNewProject = (name: string) => {
    const newProject: CodeProject = {
      id: `project-${Date.now()}`,
      name: name,
      description: "코드빌더로 생성된 프로젝트입니다.",
      files: [],
      createdAt: new Date(),
      lastModified: new Date(),
    }

    setActiveProject(newProject)
    setShowEmptyState(false)

    return newProject
  }

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // 이미 처리 중이면 중지
    if (isProcessing) {
      handleStopGeneration()
      return
    }

    // 새 AbortController 생성
    const controller = new AbortController()
    setAbortController(controller)

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // 메시지 추가 후 스크롤 시도
    scrollToBottom()
    requestAnimationFrame(scrollToBottom)
    setTimeout(scrollToBottom, 100)

    try {
      // 선택된 코드 에이전트 가져오기
      const selectedAgent = codeAgents.find((agent) => agent.id === selectedCodeAgent)

      // 프로젝트가 없으면 새 프로젝트 생성
      if (!activeProject) {
        createNewProject("새 프로젝트")
      }

      // 스트리밍 메시지 추가
      const streamingMessageObj: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      }

      setMessages((prev) => [...prev, streamingMessageObj])

      // 에이전트가 실행 중이고 선택된 에이전트가 있는 경우 실제 API 호출
      if (isAgentRunning && selectedAgent && apiKey) {
        try {
          const llmService = getLLMService(apiKey)

          // 작업 계획 생성
          const planPrompt = `당신은 코드 생성 전문가입니다. 다음 요청에 대한 작업 계획을 수립하세요:
          
사용자 요청: "${input}"

다음 형식으로 작업 계획을 제공하세요:
1. 요구사항 분석
2. 파일 구조 설계
3. 코드 생성
4. 테스트 및 검증
5. 최적화 및 개선`

          // 작업 계획 생성 및 스트리밍
          const workPlanText = await llmService.generateText(planPrompt)
          await simulateWorkPlanStreaming(workPlanText, controller.signal)

          // 코드 생성 요청
          const codePrompt = `당신은 코드 생성 전문가입니다. 다음 요청에 대한 코드를 생성하세요:
          
사용자 요청: "${input}"

작업 계획:
${workPlanText}

파일 구조를 설계하고 각 파일의 코드를 생성하세요. 각 코드 블록은 다음 형식으로 제공하세요:
\`\`\`언어 file="파일명.확장자"
// 코드 내용
\`\`\`

설명과 함께 코드를 제공하세요.`

          // 코드 생성 및 스트리밍
          const codeResponse = await llmService.generateText(codePrompt)

          // 코드 블록 추출
          const codeBlocks = extractCodeBlocks(codeResponse)

          // 스트리밍 메시지 업데이트
          await simulateStreaming(codeResponse, controller.signal)

          // 스트리밍 메시지 업데이트
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageObj.id
                ? {
                    ...msg,
                    content: codeResponse,
                    codeBlocks: codeBlocks,
                    streaming: false,
                  }
                : msg,
            ),
          )

          // 코드 블록에서 파일 생성
          for (const codeBlock of codeBlocks) {
            if (codeBlock.fileName && activeProject) {
              const newFile: CodeFile = {
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: codeBlock.fileName,
                path: "/",
                language: codeBlock.language,
                content: codeBlock.code,
                lastModified: new Date(),
                status: "created",
              }

              // 프로젝트에 파일 추가
              const updatedProject = {
                ...activeProject,
                files: [...activeProject.files, newFile],
                lastModified: new Date(),
              }
              setActiveProject(updatedProject)

              // 파일 선택 및 스트리밍 효과 적용
              setSelectedFile(newFile)
              setActiveTab("code")

              // 파일 내용 스트리밍 시작
              await simulateFileStreaming(newFile, controller.signal)
            }
          }

          scrollToBottom()
          requestAnimationFrame(scrollToBottom)
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("API 호출 오류:", error)

            // 오류 메시지 업데이트
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageObj.id
                  ? {
                      ...msg,
                      content: `코드 생성 중 오류가 발생했습니다: ${error.message}`,
                      streaming: false,
                    }
                  : msg,
              ),
            )
          }
        }
      } else {
        // 에이전트가 실행 중이 아닌 경우 시뮬레이션 코드 실행 (기존 코드 유지)
        // 작업 계획 생성 (동시 스트리밍 시작)
        const workPlanText = `
1. 요구사항 분석
2. 파일 구조 설계
3. 코드 생성
4. 테스트 및 검증
5. 최적화 및 개선
`

        // 작업 계획 스트리밍 시작 (0.5초 후)
        setTimeout(() => {
          simulateWorkPlanStreaming(workPlanText, controller.signal).then((plan) => {
            // 작업 계획 스트리밍 완료 후 추가 내용 스트리밍
            const additionalContent = `
### 1. 요구사항 분석 완료

### 2. 파일 구조 설계
다음과 같은 파일 구조로 구현하겠습니다:
- app.js: 메인 애플리케이션 파일
- utils.js: 유틸리티 함수 모음
- config.js: 설정 파일
`
            simulateStreaming(additionalContent, controller.signal).then((additionalText) => {
              // 스트리밍 메시지 업데이트
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMessageObj.id
                    ? { ...msg, content: plan + additionalText, streaming: false }
                    : msg,
                ),
              )
              scrollToBottom()
              requestAnimationFrame(scrollToBottom)
            })
          })
        }, 500)

        // 코드 생성 요청 처리 (파일 생성 및 스트리밍)
        setTimeout(async () => {
          // 파일 생성 (app.js)
          const newFile: CodeFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: "app.js",
            path: "/",
            language: "javascript",
            content: `// 메인 애플리케이션 파일
import { formatDate, calculateTotal } from './utils.js';
import { API_KEY, BASE_URL } from './config.js';

// 애플리케이션 상태
const appState = {
  items: [],
  isLoading: false,
  error: null
};

// 데이터 가져오기
async function fetchData() {
  appState.isLoading = true;
  
  try {
    const response = await fetch(\`\${BASE_URL}/api/items\`, {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`
      }
    });
    
    if (!response.ok) {
      throw new Error('데이터를 가져오는데 실패했습니다.');
    }
    
    const data = await response.json();
    appState.items = data;
    return data;
  } catch (error) {
    appState.error = error.message;
    console.error('Error:', error);
    return [];
  } finally {
    appState.isLoading = false;
  }
}

// 애플리케이션 초기화
function initApp() {
  console.log('애플리케이션 시작:', formatDate(new Date()));
  fetchData();
}

// 애플리케이션 실행
initApp();`,
            lastModified: new Date(),
            status: "created",
          }

          // 프로젝트에 파일 추가
          if (activeProject) {
            const updatedProject = {
              ...activeProject,
              files: [...activeProject.files, newFile],
              lastModified: new Date(),
            }
            setActiveProject(updatedProject)

            // 파일 선택 및 스트리밍 효과 적용
            setSelectedFile(newFile)
            setActiveTab("code")

            // 파일 내용 스트리밍 시작
            await simulateFileStreaming(newFile, controller.signal)

            // 코드 블록 내용 추가 (메시지에 코드 블록 추가)
            setTimeout(() => {
              const codeBlockContent = `
### 3. 코드 생성

\`\`\`javascript file="app.js"
// 메인 애플리케이션 파일
import { formatDate, calculateTotal } from './utils.js';
import { API_KEY, BASE_URL } from './config.js';

// 애플리케이션 상태
const appState = {
  items: [],
  isLoading: false,
  error: null
};

// 데이터 가져오기
async function fetchData() {
  appState.isLoading = true;
  
  try {
    const response = await fetch(\`\${BASE_URL}/api/items\`, {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`
      }
    });
    
    if (!response.ok) {
      throw new Error('데이터를 가져오는데 실패했습니다.');
    }
    
    const data = await response.json();
    appState.items = data;
    return data;
  } catch (error) {
    appState.error = error.message;
    console.error('Error:', error);
    return [];
  } finally {
    appState.isLoading = false;
  }
}

// 애플리케이션 초기화
function initApp() {
  console.log('애플리케이션 시작:', formatDate(new Date()));
  fetchData();
}

// 애플리케이션 실행
initApp();
\`\`\`
`
              // 메시지 업데이트
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMessageObj.id
                    ? {
                        ...msg,
                        content: msg.content + codeBlockContent,
                        codeBlocks: extractCodeBlocks(msg.content + codeBlockContent),
                      }
                    : msg,
                ),
              )
              scrollToBottom()
              requestAnimationFrame(scrollToBottom)

              // utils.js 파일 생성 (1초 후)
              setTimeout(async () => {
                const utilsFile: CodeFile = {
                  id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: "utils.js",
                  path: "/",
                  language: "javascript",
                  content: `// 유틸리티 함수 모음

/**
 * 날짜를 포맷팅하는 함수
 * @param {Date} date - 포맷팅할 날짜
 * @param {Date} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

/**
 * 항목 배열의 총합을 계산하는 함수
 * @param {Array} items - 계산할 항목 배열
 * @returns {number} 총합
 */
export function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.price || 0), 0);
}`,
                  lastModified: new Date(),
                  status: "created",
                }

                // 프로젝트에 파일 추가
                if (activeProject) {
                  const updatedProject = {
                    ...activeProject,
                    files: [...activeProject.files, utilsFile],
                    lastModified: new Date(),
                  }
                  setActiveProject(updatedProject)

                  // 파일 선택 및 스트리밍 효과 적용
                  setSelectedFile(utilsFile)

                  // 파일 내용 스트리밍 시작
                  await simulateFileStreaming(utilsFile, controller.signal)

                  // 코드 블록 내용 추가 (메시지에 코드 블록 추가)
                  const utilsCodeBlock = `
\`\`\`javascript file="utils.js"
// 유틸리티 함수 모음

/**
 * 날짜를 포맷팅하는 함수
 * @param {Date} date - 포맷팅할 날짜
 * @param {Date} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

/**
 * 항목 배열의 총합을 계산하는 함수
 * @param {Array} items - 계산할 항목 배열
 * @returns {number} 총합
 */
export function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.price || 0), 0);
}
\`\`\`
`
                  // 메시지 업데이트
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === streamingMessageObj.id
                        ? {
                            ...msg,
                            content: msg.content + utilsCodeBlock,
                            codeBlocks: extractCodeBlocks(msg.content + utilsCodeBlock),
                          }
                        : msg,
                    ),
                  )
                  scrollToBottom()
                  requestAnimationFrame(scrollToBottom)

                  // config.js 파일 생성 (1초 후)
                  setTimeout(async () => {
                    const configFile: CodeFile = {
                      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      name: "config.js",
                      path: "/",
                      language: "javascript",
                      content: `// 설정 파일

// API 설정
export const API_KEY = 'your_api_key_here';
export const BASE_URL = 'https://api.example.com';

// 애플리케이션 설정
export const APP_CONFIG = {
  theme: 'light',
  language: 'ko',
  pageSize: 20,
  timeout: 5000, // ms
  features: {
    darkMode: true,
    notifications: true,
    analytics: false
  }
};`,
                      lastModified: new Date(),
                      status: "created",
                    }

                    // 프로젝트에 파일 추가
                    if (activeProject) {
                      const updatedProject = {
                        ...activeProject,
                        files: [...activeProject.files, configFile],
                        lastModified: new Date(),
                      }
                      setActiveProject(updatedProject)

                      // 파일 선택 및 스트리밍 효과 적용
                      setSelectedFile(configFile)

                      // 파일 내용 스트리밍 시작
                      await simulateFileStreaming(configFile, controller.signal)

                      // 코드 블록 내용 추가 (메시지에 코드 블록 추가)
                      const configCodeBlock = `
\`\`\`javascript file="config.js"
// 설정 파일

// API 설정
export const API_KEY = 'your_api_key_here';
export const BASE_URL = 'https://api.example.com';

// 애플리케이션 설정
export const APP_CONFIG = {
  theme: 'light',
  language: 'ko',
  pageSize: 20,
  timeout: 5000, // ms
  features: {
    darkMode: true,
    notifications: true,
    analytics: false
  }
};
\`\`\`

### 4. 테스트 및 검증 완료

### 5. 최적화 및 개선 완료

모든 파일이 성공적으로 생성되었습니다. 이제 코드를 실행하거나 필요에 따라 수정할 수 있습니다.
`
                      // 메시지 업데이트
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === streamingMessageObj.id
                            ? {
                                ...msg,
                                content: msg.content + configCodeBlock,
                                codeBlocks: extractCodeBlocks(msg.content + configCodeBlock),
                              }
                            : msg,
                        ),
                      )
                      scrollToBottom()
                      requestAnimationFrame(scrollToBottom)
                    }
                  }, 1000)
                }
              }, 1000)
            }, 1000)
          }
        }, 1000)
      }
    } catch (error) {
      // AbortError는 사용자가 의도적으로 중단한 것이므로 오류 메시지 표시하지 않음
      if (error.name !== "AbortError") {
        console.error("코드 생성 오류:", error)
        toast({
          title: "오류 발생",
          description: "코드 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        })

        // 오류 메시지 업데이트
        setMessages((prev) =>
          prev.map((msg) =>
            msg.streaming ? { ...msg, content: "코드 생성 중 오류가 발생했습니다.", streaming: false } : msg,
          ),
        )
      }
    } finally {
      // 최종 처리는 모든 스트리밍이 완료된 후에 진행
      setTimeout(() => {
        setIsProcessing(false)
        setAbortController(null)
      }, 5000)
    }
  }

  // 파일 확장자 가져오기
  const getFileExtension = (language: string) => {
    const extensionMap: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
      cpp: "cpp",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      html: "html",
      css: "css",
      json: "json",
      yaml: "yml",
      markdown: "md",
      jsx: "jsx",
      tsx: "tsx",
    }

    return extensionMap[language.toLowerCase()] || "txt"
  }

  // 코드 실행
  const handleExecuteCode = async (file = selectedFile) => {
    if (!file) return

    setExecutionStatus("running")
    setExecutionResult("코드 실행 중...")
    setActiveTab("terminal")

    try {
      // 실제 구현에서는 API 호출 또는 샌드박스 환경에서 실행
      // 여기서는 예시 결과 반환
      await new Promise((resolve) => setTimeout(resolve, 800))

      setExecutionStatus("success")
      const result = `// 실행 결과
애플리케이션 시작: 2025년 4월 1일 오후 7:48
총 3개 항목, 합계: 150
`
      setExecutionResult(result)
      setPreviewContent(result)

      toast({
        title: "실행 완료",
        description: "코드가 성공적으로 실행되었습니다.",
      })
    } catch (error) {
      console.error("코드 실행 오류:", error)
      setExecutionStatus("error")
      setExecutionResult(`오류 발생: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "실행 오류",
        description: "코드 실행 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 코드 복사
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "복사 완료",
      description: "코드가 클립보드에 복사되었습니다.",
    })
  }

  // 파일 저장
  const handleSaveFile = () => {
    if (!selectedFile || !activeProject) return

    // 실제 구현에서는 API 호출 또는 로컬 스토리지에 저장
    toast({
      title: "저장 완료",
      description: `${selectedFile.name} 파일이 저장되었습니다.`,
    })
  }

  // 파일 상태에 따른 아이콘 색상
  const getFileStatusColor = (status?: string) => {
    switch (status) {
      case "created":
        return "text-blue-500"
      case "modified":
        return "text-yellow-500"
      case "verified":
        return "text-green-500"
      case "tested":
        return "text-purple-500"
      case "optimized":
        return "text-indigo-500"
      default:
        return "text-gray-400"
    }
  }

  // 메시지 렌더링
  const renderMessage = (message: Message) => {
    // 스트리밍 중인 메시지 처리
    if (message.streaming) {
      return (
        <div className="mb-4">
          <div className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role !== "user" && (
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                CB
              </div>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-black text-white"}`}
            >
              <div>
                {isGeneratingPlan ? (
                  <div className="whitespace-pre-wrap">
                    {workPlan}
                    <span className="animate-pulse">▋</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="animate-pulse">▋</span>
                  </div>
                )}
              </div>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                나
              </div>
            )}
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</div>
        </div>
      )
    }

    // 코드 블록 정규식
    const codeBlockRegex = /```(\w+)(?:\s+file="([^"]+)")?\n([\s\S]*?)```/g

    // 메시지 내용을 코드 블록과 일반 텍스트로 분리
    const parts = []
    let lastIndex = 0
    let match

    // 메시지 내용 복제
    const content = message.content

    // 코드 블록 찾기
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 코드 블록 앞의 텍스트 추가
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        })
      }

      // 코드 블록 추가
      parts.push({
        type: "code",
        language: match[1],
        fileName: match[2] || undefined,
        code: match[3],
      })

      lastIndex = match.index + match[0].length
    }

    // 마지막 텍스트 추가
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      })
    }

    return (
      <div className="mb-4">
        <div className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role !== "user" && (
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">CB</div>
          )}
          <div
            className={`rounded-lg p-3 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-black text-white"}`}
          >
            <div className="space-y-3">
              {parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <div key={index} className="whitespace-pre-wrap">
                      {part.content}
                    </div>
                  )
                } else if (part.type === "code") {
                  return (
                    <div key={index} className="bg-[#1e1e1e] rounded border border-gray-700 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700 bg-[#2d2d2d]">
                        <div className="flex items-center">
                          <FileCode className="h-4 w-4 mr-2" />
                          <span className="font-medium">{part.fileName || `${part.language} 코드`}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-gray-700"
                            onClick={() => handleCopyCode(part.code)}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">복사</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-gray-700"
                            onClick={() => {
                              // 코드 블록에서 파일 생성
                              if (activeProject) {
                                const newFile = {
                                  id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                  name: part.fileName || `generated-${Date.now()}.${getFileExtension(part.language)}`,
                                  path: "/",
                                  language: part.language,
                                  content: part.code,
                                  lastModified: new Date(),
                                  status: "created" as const,
                                }

                                const updatedProject = {
                                  ...activeProject,
                                  files: [...activeProject.files, newFile],
                                  lastModified: new Date(),
                                }

                                setActiveProject(updatedProject)
                                setSelectedFile(newFile)
                                setActiveTab("code")

                                // 파일 내용 스트리밍 효과 적용
                                simulateFileStreaming(newFile)

                                toast({
                                  title: "파일 생성 완료",
                                  description: `${newFile.name} 파일이 생성되었습니다.`,
                                })
                              }
                            }}
                          >
                            <Play className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">실행</span>
                          </Button>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="overflow-x-auto p-2">
                          <div className="flex">
                            {/* 줄 번호 */}
                            <div className="pr-4 text-gray-500 select-none text-right min-w-[40px]">
                              {part.code.split("\n").map((_, i) => (
                                <div key={i} className="leading-6">
                                  {i + 1}
                                </div>
                              ))}
                            </div>

                            {/* 코드 내용 */}
                            <div className="flex-1">
                              <pre className="leading-6 whitespace-pre text-white">{part.code}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
          {message.role === "user" && (
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
              나
            </div>
          )}
        </div>
        <div className="text-xs text-center text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</div>
      </div>
    )
  }

  // 파일 탐색기 토글 버튼
  const toggleFileExplorer = () => {
    setIsFileExplorerVisible(!isFileExplorerVisible)
  }

  // 한글 입력 처리를 위한 함수
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 입력 중에는 Enter 키 처리 방지
    if (e.key === "Enter" && !e.shiftKey) {
      // isComposing 속성으로 한글 조합 중인지 확인
      if (!e.nativeEvent.isComposing) {
        e.preventDefault()
        if (input.trim()) {
          handleSendMessage()
        }
      }
    }
  }

  return (
    // 전체 컨테이너에 h-screen 적용
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {/* 왼쪽 패널: 채팅 인터페이스 */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="border-b p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-primary" />
                <h2 className="font-semibold">코드빌더</h2>
              </div>

              <div className="flex items-center space-x-2">
                {codeAgents.length > 0 ? (
                  <>
                    <select
                      className="border rounded px-2 py-1 h-7"
                      value={selectedCodeAgent || ""}
                      onChange={(e) => setSelectedCodeAgent(e.target.value)}
                    >
                      {codeAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant={isAgentRunning ? "destructive" : "default"}
                      size="sm"
                      className="h-7"
                      onClick={toggleAgentRunning}
                    >
                      {isAgentRunning ? "중지" : "실행"}
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline">기본 코드 어시스턴트</Badge>
                )}
              </div>
            </div>

            <div className="text-muted-foreground">
              코드 생성 요청을 입력하세요. 자세한 설명일수록 더 정확한 코드가 생성됩니다.
            </div>
          </div>

          {/* 채팅 메시지 영역 - 스크롤 문제 해결을 위한 구조 변경 */}
          <div
            className="flex-1 overflow-y-auto p-2"
            ref={chatContainerRef}
            style={{
              overscrollBehavior: "contain",
              maxHeight: "calc(100vh - 180px)", // 헤더와 입력창 높이를 제외한 값
            }}
          >
            {messages.map((message) => (
              <div key={message.id}>{renderMessage(message)}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-2">
            <div className="flex items-center space-x-2">
              <Textarea
                placeholder="코드 생성 요청을 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] max-h-[120px]"
                ref={textareaRef}
              />
              <Button onClick={handleSendMessage} className="h-full" variant={isProcessing ? "destructive" : "default"}>
                {isProcessing ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-muted-foreground">{isProcessing ? "처리 중..." : "준비 완료"}</div>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* 오른쪽 패널: 코드 에디터 및 파일 탐색기 */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full flex flex-col">
          <div className="border-b p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FileCode className="h-4 w-4 mr-2 text-primary" />
                <h2 className="font-semibold">{selectedFile ? selectedFile.name : "코드 에디터"}</h2>
                {selectedFile?.status && (
                  <Badge variant="outline" className="ml-2">
                    {selectedFile.status}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-7" onClick={handleSaveFile} disabled={!selectedFile}>
                  <Save className="h-3.5 w-3.5 mr-1" />
                  저장
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => handleExecuteCode()}
                  disabled={!selectedFile || executionStatus === "running"}
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  실행
                </Button>
                <Button variant="outline" size="sm" className="h-7" onClick={toggleFileExplorer}>
                  {isFileExplorerVisible ? (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="code" className="h-7">
                  <FileCode className="h-3.5 w-3.5 mr-1" />
                  코드
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-7">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  미리보기
                </TabsTrigger>
                <TabsTrigger value="terminal" className="h-7">
                  <Terminal className="h-3.5 w-3.5 mr-1" />
                  터미널
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="mt-2 h-[calc(100vh-140px)]">
                <ResizablePanelGroup direction="horizontal">
                  {/* 파일 디렉토리 - 코드뷰 왼쪽으로 이동 */}
                  {isFileExplorerVisible && (
                    <>
                      <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                        <div className="h-full border-r overflow-hidden">
                          <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center">
                              <FolderTree className="h-3.5 w-3.5 mr-1" />
                              <span className="font-medium">파일 탐색기</span>
                            </div>
                            {activeProject && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  if (activeProject) {
                                    // 새 파일 생성 (빈 파일)
                                    const newFile: CodeFile = {
                                      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                      name: `new-file-${activeProject.files.length + 1}.js`,
                                      path: "/",
                                      language: "javascript",
                                      content: "// 새 파일",
                                      lastModified: new Date(),
                                      status: "created",
                                    }

                                    const updatedProject = {
                                      ...activeProject,
                                      files: [...activeProject.files, newFile],
                                      lastModified: new Date(),
                                    }

                                    setActiveProject(updatedProject)
                                    setSelectedFile(newFile)

                                    toast({
                                      title: "파일 생성",
                                      description: "새 파일이 생성되었습니다.",
                                    })
                                  }
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>

                          <div className="h-[calc(100%-30px)] overflow-y-auto">
                            {showEmptyState && !activeProject?.files?.length ? (
                              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <FolderTree className="h-10 w-10 text-muted-foreground mb-2" />
                                <h3 className="font-medium mb-1">파일이 없습니다</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                  채팅에서 코드 생성을 요청하면 자동으로 파일이 생성됩니다.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    createNewProject("새 프로젝트")
                                    toast({
                                      title: "프로젝트 생성",
                                      description: "새 프로젝트가 생성되었습니다.",
                                    })
                                  }}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />새 프로젝트 생성
                                </Button>
                              </div>
                            ) : (
                              <div className="p-2">
                                {activeProject && (
                                  <div>
                                    <div className="flex items-center p-1 rounded-md hover:bg-accent">
                                      <Folder className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                      <span>{activeProject.name}</span>
                                    </div>

                                    <div className="ml-3 mt-1 space-y-1">
                                      {activeProject.files.map((file) => (
                                        <div
                                          key={file.id}
                                          className={`flex items-center p-1 rounded-md cursor-pointer ${
                                            selectedFile?.id === file.id ? "bg-accent" : "hover:bg-accent/50"
                                          }`}
                                          onClick={() => setSelectedFile(file)}
                                        >
                                          <FileText className={`h-3.5 w-3.5 mr-1 ${getFileStatusColor(file.status)}`} />
                                          <span>{file.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </ResizablePanel>

                      <ResizableHandle withHandle />
                    </>
                  )}

                  {/* 코드 에디터 */}
                  <ResizablePanel defaultSize={isFileExplorerVisible ? 80 : 100}>
                    {selectedFile ? (
                      <div className="h-full w-full relative border rounded-md overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[#1e1e1e] text-white overflow-auto p-4 font-mono">
                          {/* 줄 번호 및 코드 내용 */}
                          <div className="flex">
                            {/* 줄 번호 */}
                            <div className="pr-4 text-gray-500 select-none text-right min-w-[40px]">
                              {(fileStreaming && streamTarget === selectedFile.id
                                ? streamedFileContent
                                : selectedFile.content
                              )
                                .split("\n")
                                .map((_, i) => (
                                  <div key={i} className="leading-6">
                                    {i + 1}
                                  </div>
                                ))}
                            </div>

                            {/* 코드 내용 */}
                            <div className="flex-1 overflow-x-auto">
                              <pre className="leading-6 whitespace-pre">
                                {fileStreaming && streamTarget === selectedFile.id
                                  ? streamedFileContent
                                  : selectedFile.content}
                                {fileStreaming && streamTarget === selectedFile.id && (
                                  <span className="animate-pulse">▋</span>
                                )}
                              </pre>
                            </div>
                          </div>
                        </div>

                        {/* 실제 편집 가능한 텍스트 영역 (투명하게 설정) */}
                        <Textarea
                          value={selectedFile.content}
                          onChange={(e) => {
                            if (activeProject) {
                              const updatedFiles = activeProject.files.map((file) =>
                                file.id === selectedFile.id
                                  ? { ...file, content: e.target.value, lastModified: new Date(), status: "modified" }
                                  : file,
                              )

                              setActiveProject({
                                ...activeProject,
                                files: updatedFiles,
                                lastModified: new Date(),
                              })

                              setSelectedFile({
                                ...selectedFile,
                                content: e.target.value,
                                lastModified: new Date(),
                                status: "modified",
                              })
                            }
                          }}
                          className="absolute top-0 left-0 w-full h-full opacity-0 font-mono resize-none focus-visible:ring-0 cursor-text"
                          disabled={fileStreaming && streamTarget === selectedFile.id}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-white border rounded-md">
                        <div className="text-center">
                          <FileCode className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <h3 className="font-medium mb-1">파일이 선택되지 않았습니다</h3>
                          <p className="text-gray-400">
                            왼쪽 파일 탐색기에서 파일을 선택하거나 채팅에서 코드를 생성하세요.
                          </p>
                        </div>
                      </div>
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              <TabsContent value="preview" className="mt-2 h-[calc(100vh-140px)]">
                <div className="border rounded-md h-full overflow-auto bg-white">
                  <div className="border-b p-2 flex items-center justify-between bg-gray-50">
                    <div className="font-medium text-gray-700">실행 결과 미리보기</div>
                    {previewContent && (
                      <Button variant="outline" size="sm" className="h-6" onClick={() => setPreviewContent("")}>
                        초기화
                      </Button>
                    )}
                  </div>

                  {previewContent ? (
                    <div className="p-4">
                      <pre className="font-mono whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                        {previewContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[calc(100%-40px)]">
                      <div className="text-center">
                        <Play className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-medium mb-1">미리보기</h3>
                        <p className="text-muted-foreground">코드 실행 결과가 여기에 표시됩니다.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="terminal" className="mt-2 h-[calc(100vh-140px)]">
                <div className="border rounded-md bg-[#1e1e1e] text-green-400 p-3 font-mono h-full overflow-auto">
                  <div className="border-b border-gray-700 pb-2 mb-2 text-gray-400">터미널 - Node.js</div>
                  {executionStatus === "idle" ? (
                    <div className="text-gray-500 flex items-center">
                      <span className="text-green-400 mr-2">$</span>
                      <span>코드를 실행하면 결과가 여기에 표시됩니다.</span>
                    </div>
                  ) : executionStatus === "running" ? (
                    <div>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <span className="text-gray-300">node {selectedFile?.name}</span>
                      </div>
                      <div className="mt-2 flex items-center text-yellow-300">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                        실행 중...
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <span className="text-gray-300">node {selectedFile?.name}</span>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap text-white border-l-2 border-gray-600 pl-2 py-1">
                        {executionResult}
                      </pre>
                      <div className="mt-2 flex items-center">
                        {executionStatus === "success" ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                            <span className="text-green-500">실행 완료 (0 오류)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 text-red-500 mr-1" />
                            <span className="text-red-500">실행 실패</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

// 기존 import 방식과의 호환성을 위해 default export도 추가
export default CodeBuilderInterface
