"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

// 에이전트 타입 정의 수정 - teamId 필드 추가
export interface Agent {
  id: string
  name: string
  type: "general" | "specialized" | "assistant" | "autonomous" | "team" | "custom"
  description: string
  code: string
  prompt?: string
  status: "idle" | "running" | "error" | "active" | "inactive" | "training"
  createdAt: string
  updatedAt: string
  teamId?: string // 팀 ID 필드 추가
  capabilities?: string[]
  lastUsed?: Date
}

// 콘솔 메시지 타입 정의
export interface ConsoleMessage {
  id: string
  content: string
  type: "info" | "warning" | "error" | "success"
  timestamp: string
  agentId?: string // 메시지를 보낸 에이전트 ID
}

// 에이전트 상태 인터페이스 수정
interface AgentState {
  agents: Agent[]
  selectedAgentId: string | null
  isRunning: boolean
  consoleMessages: ConsoleMessage[]
  addAgent: (agent: Omit<Agent, "id" | "createdAt" | "updatedAt" | "status">) => void
  updateAgent: (agentId: string, updates: Partial<Omit<Agent, "id" | "createdAt" | "updatedAt">>) => void
  deleteAgent: (agentId: string) => void
  setSelectedAgentId: (agentId: string | null) => void
  setIsRunning: (isRunning: boolean) => void
  addConsoleMessage: (message: Omit<ConsoleMessage, "id" | "timestamp">) => void
  clearConsoleMessages: () => void
  toggleAgentStatus: (id: string) => void
}

// 초기 에이전트 데이터
const initialAgents: Agent[] = [
  {
    id: "agent-1",
    name: "일반 어시스턴트",
    type: "assistant",
    description: "일반적인 질문에 답변하고 정보를 제공하는 어시스턴트입니다.",
    code: `class GeneralAssistant {
  constructor() {
    this.name = "일반 어시스턴트";
  }

  async process(input) {
    return \`입력: "\${input}"에 대한 응답입니다.\`;
  }
}`,
    prompt: "당신은 일반 어시스턴트입니다. 사용자의 다양한 질문에 친절하고 정확하게 답변해주세요.",
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "agent-2",
    name: "코딩 어시스턴트",
    type: "specialized",
    description: "프로그래밍 관련 질문에 답변하고 코드 예제를 제공하는 어시스턴트입니다.",
    code: `class CodingAssistant {
  constructor() {
    this.name = "코딩 어시스턴트";
  }

  async process(input) {
    return \`입력: "\${input}"에 대한 코딩 관련 응답입니다.\`;
  }
}`,
    prompt: "당신은 코딩 어시스턴트입니다. 프로그래밍 관련 질문에 답변하고 코드 예제를 제공해주세요.",
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "team-1",
    name: "웹 개발 팀",
    type: "team",
    description: "사용자 요구사항에 맞는 웹 애플리케이션을 설계, 개발, 테스트하는 팀입니다.",
    code: `/**
 * 팀 이름: 웹 개발 팀
 * 설명: 사용자 요구사항에 맞는 웹 애플리케이션을 설계, 개발, 테스트하는 팀입니다.
 * 역할: 팀 리더 (코디네이터)
 */
class TeamCoordinator {
  constructor() {
    this.teamName = "웹 개발 팀";
    this.purpose = "사용자 요구사항에 맞는 웹 애플리케이션을 설계, 개발, 테스트";
    this.members = [
      { name: "프론트엔드 개발자", role: "UI/UX 개발" },
      { name: "백엔드 개발자", role: "서버 및 API 개발" },
      { name: "QA 엔지니어", role: "품질 보증 및 테스트" }
    ];
    this.tasks = [];
    this.results = [];
    this.projectStatus = "준비";
  }

  // 사용자 입력 처리 및 작업 조율
  process(input) {
    // 1. 입력 분석
    const analyzedTasks = this.analyzeTasks(input);
    this.tasks = analyzedTasks;
    
    // 2. 작업 할당
    const assignments = this.assignTasks(analyzedTasks);
    
    // 3. 팀원들의 작업 결과 수집
    const memberResults = this.collectResults(assignments);
    this.results = memberResults;
    
    // 4. 결과 통합 및 최종 응답 생성
    return this.generateFinalResponse();
  }

  // 입력을 분석하여 필요한 작업 식별
  analyzeTasks(input) {
    // 입력 분석 로직
    return [
      { id: 1, name: "요구사항 분석", description: "사용자 요청 분석" },
      { id: 2, name: "UI/UX 설계", description: "사용자 인터페이스 설계" },
      { id: 3, name: "백엔드 개발", description: "서버 및 API 개발" }
    ];
  }

  // 작업을 팀원들에게 할당
  assignTasks(tasks) {
    // 작업 할당 로직
    return tasks.map(task => ({
      task: task,
      assignedTo: this.members[task.id % this.members.length].name,
      status: "할당됨"
    }));
  }

  // 팀원들의 작업 결과 수집
  collectResults(assignments) {
    // 결과 수집 로직
    return assignments.map(assignment => ({
      task: assignment.task,
      result: \`\${assignment.assignedTo}의 작업 결과\`,
      status: "완료"
    }));
  }

  // 최종 응답 생성
  generateFinalResponse() {
    // 결과 통합 및 최종 응답 생성
    return \`팀 \${this.teamName}의 최종 결과:\\n\${this.results.map(r => \`- \${r.task.name}: \${r.result}\`).join('\\n')}\`;
  }
}`,
    prompt: `당신은 "웹 개발 팀"의 리더(코디네이터)입니다. 팀의 목적은 "사용자 요구사항에 맞는 웹 애플리케이션을 설계, 개발, 테스트"입니다.

당신의 주요 책임:
1. 사용자 요청을 분석하고 필요한 작업을 식별합니다.
2. 작업을 팀원들에게 효율적으로 할당합니다.
3. 팀원들의 작업을 조율하고 진행 상황을 모니터링합니다.
4. 팀원들의 결과물을 통합하여 일관된 최종 산출물을 생성합니다.
5. 전체 프로젝트의 품질과 일정을 관리합니다.

사용자와의 상호작용에서:
- 명확하고 구조화된 방식으로 정보를 전달하세요.
- 팀의 진행 상황과 결과물에 대해 투명하게 소통하세요.
- 필요한 경우 추가 정보나 명확한 지시를 요청하세요.
- 항상 팀의 목적과 사용자의 요구사항을 최우선으로 고려하세요.`,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "member-1",
    name: "프론트엔드 개발자",
    type: "specialized",
    description: "사용자 인터페이스와 경험을 개발하는 역할을 담당합니다.",
    code: `class FrontendDeveloper {
  constructor() {
    this.name = "프론트엔드 개발자";
    this.role = "UI/UX 개발";
    this.skills = ["HTML", "CSS", "JavaScript", "React"];
  }

  process(input) {
    // 프론트엔드 개발 관련 작업 처리
    return \`UI 컴포넌트 개발: \${input}\`;
  }
  
  // UI 컴포넌트 설계
  designComponent(requirements) {
    return \`요구사항 '\${requirements}'에 맞는 UI 컴포넌트 설계 완료\`;
  }
  
  // 반응형 레이아웃 구현
  implementResponsiveLayout(design) {
    return \`디자인 '\${design}'에 맞는 반응형 레이아웃 구현 완료\`;
  }
  
  // 사용자 경험 최적화
  optimizeUserExperience(component) {
    return \`컴포넌트 '\${component}'의 사용자 경험 최적화 완료\`;
  }
}`,
    prompt: `당신은 "웹 개발 팀"의 프론트엔드 개발자입니다. 사용자 인터페이스와 경험을 개발하는 역할을 담당합니다.

당신의 주요 책임:
1. 사용자 인터페이스(UI) 컴포넌트 개발
2. 반응형 웹 디자인 구현
3. 사용자 경험(UX) 최적화
4. 프론트엔드 성능 향상

당신은 HTML, CSS, JavaScript, React 등의 기술에 전문성을 가지고 있습니다.
팀 리더의 지시에 따라 작업을 수행하고, 결과물을 명확하게 전달하세요.`,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamId: "team-1",
  },
  {
    id: "member-2",
    name: "백엔드 개발자",
    type: "specialized",
    description: "서버 로직과 데이터베이스를 개발하는 역할을 담당합니다.",
    code: `class BackendDeveloper {
  constructor() {
    this.name = "백엔드 개발자";
    this.role = "서버 및 API 개발";
    this.skills = ["Node.js", "Express", "Database", "API"];
  }

  process(input) {
    // 백엔드 개발 관련 작업 처리
    return \`API 개발: \${input}\`;
  }
  
  // API 엔드포인트 설계
  designAPIEndpoint(requirements) {
    return \`요구사항 '\${requirements}'에 맞는 API 엔드포인트 설계 완료\`;
  }
  
  // 데이터베이스 스키마 구현
  implementDatabaseSchema(design) {
    return \`디자인 '\${design}'에 맞는 데이터베이스 스키마 구현 완료\`;
  }
  
  // 서버 로직 최적화
  optimizeServerLogic(component) {
    return \`컴포넌트 '\${component}'의 서버 로직 최적화 완료\`;
  }
}`,
    prompt: `당신은 "웹 개발 팀"의 백엔드 개발자입니다. 서버 로직과 데이터베이스를 개발하는 역할을 담당합니다.

당신의 주요 책임:
1. API 엔드포인트 설계 및 구현
2. 데이터베이스 스키마 설계 및 최적화
3. 서버 로직 개발
4. 백엔드 성능 및 보안 최적화

당신은 Node.js, Express, 데이터베이스, API 설계 등의 기술에 전문성을 가지고 있습니다.
팀 리더의 지시에 따라 작업을 수행하고, 결과물을 명확하게 전달하세요.`,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamId: "team-1",
  },
  {
    id: "member-3",
    name: "QA 엔지니어",
    type: "specialized",
    description: "소프트웨어 품질을 테스트하고 보증하는 역할을 담당합니다.",
    code: `class QAEngineer {
  constructor() {
    this.name = "QA 엔지니어";
    this.role = "품질 보증 및 테스트";
    this.skills = ["테스트 자동화", "버그 추적", "품질 보증"];
  }

  process(input) {
    // QA 관련 작업 처리
    return \`테스트 결과: \${input}\`;
  }
  
  // 테스트 케이스 설계
  designTestCases(requirements) {
    return \`요구사항 '\${requirements}'에 맞는 테스트 케이스 설계 완료\`;
  }
  
  // 버그 식별 및 보고
  identifyAndReportBugs(component) {
    return \`컴포넌트 '\${component}'의 버그 식별 및 보고 완료\`;
  }
  
  // 품질 보증 검증
  verifyQualityAssurance(product) {
    return \`제품 '\${product}'의 품질 보증 검증 완료\`;
  }
}`,
    prompt: `당신은 "웹 개발 팀"의 QA 엔지니어입니다. 소프트웨어 품질을 테스트하고 보증하는 역할을 담당합니다.

당신의 주요 책임:
1. 테스트 케이스 설계 및 실행
2. 버그 식별 및 보고
3. 품질 보증 프로세스 관리
4. 사용자 경험 검증

당신은 테스트 자동화, 버그 추적, 품질 보증 등의 기술에 전문성을 가지고 있습니다.
팀 리더의 지시에 따라 작업을 수행하고, 결과물을 명확하게 전달하세요.`,
    status: "idle",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamId: "team-1",
  },
]

// 초기 콘솔 메시지
const initialConsoleMessages: ConsoleMessage[] = [
  {
    id: `msg-${uuidv4()}`,
    content: "에이전트 콘솔이 초기화되었습니다. 'help' 명령어로 도움말을 확인하세요.",
    type: "info",
    timestamp: new Date().toLocaleTimeString(),
  },
]

// 에이전트 상태 스토어 생성 수정 - addAgent 함수에서 teamId 처리
export const useAgentState = create<AgentState>((set) => ({
  agents: initialAgents,
  selectedAgentId: initialAgents.length > 0 ? initialAgents[0].id : null,
  isRunning: false,
  consoleMessages: initialConsoleMessages,

  addAgent: (agent) => {
    const newAgent: Agent = {
      id: uuidv4(),
      status: "idle",
      ...agent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((state) => {
      // 이미 같은 이름의 에이전트가 있는지 확인
      const isDuplicate = state.agents.some((a) => a.name === agent.name && a.type === agent.type)

      if (isDuplicate) {
        // 중복이면 이름 변경
        newAgent.name = `${agent.name} (${new Date().getTime().toString().slice(-4)})`
      }

      return {
        agents: [...state.agents, newAgent],
        // 새 에이전트가 생성되면 선택
        selectedAgentId: state.selectedAgentId || newAgent.id,
      }
    })

    return newAgent.id
  },

  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates, updatedAt: new Date().toISOString() } : agent,
      ),
    })),

  deleteAgent: (agentId) =>
    set((state) => {
      const agentToDelete = state.agents.find((agent) => agent.id === agentId)
      let newAgents = state.agents.filter((agent) => agent.id !== agentId)

      // 팀 에이전트를 삭제할 경우 팀원들도 함께 삭제
      if (agentToDelete?.type === "team") {
        newAgents = newAgents.filter((agent) => agent.teamId !== agentId)
      }

      return {
        agents: newAgents,
        // 삭제된 에이전트가 선택된 상태였다면 다른 에이전트 선택
        selectedAgentId:
          state.selectedAgentId === agentId ? (newAgents.length > 0 ? newAgents[0].id : null) : state.selectedAgentId,
      }
    }),

  setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),
  setIsRunning: (isRunning) => set({ isRunning }),

  addConsoleMessage: (message: Omit<ConsoleMessage, "id" | "timestamp">) =>
    set((state) => ({
      consoleMessages: [
        ...state.consoleMessages,
        {
          id: `msg-${uuidv4()}`,
          ...message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    })),

  clearConsoleMessages: () =>
    set({
      consoleMessages: [
        {
          id: `msg-${uuidv4()}`,
          content: "에이전트 콘솔이 초기화되었습니다. 'help' 명령어로 도움말을 확인하세요.",
          type: "info",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    }),

  toggleAgentStatus: (id: string) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: agent.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString(),
            }
          : agent,
      ),
    })),
}))
