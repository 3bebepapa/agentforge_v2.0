"use client"

import { useAgentState } from "./use-agent-state"
import { v4 as uuidv4 } from "uuid"
import { getLLMService } from "../services/llmService"

export const useAgentActions = (apiKey: string) => {
  const {
    agents,
    selectedAgentId,
    isRunning,
    consoleMessages,
    addAgent,
    updateAgent,
    deleteAgent,
    setSelectedAgentId,
    setIsRunning,
    addConsoleMessage,
    clearConsoleMessages,
  } = useAgentState()

  // 에이전트 선택
  const selectAgent = (agentId: string | null) => {
    setSelectedAgentId?.(agentId)
    // 에이전트 선택 시 콘솔 메시지 초기화
    clearConsoleMessages?.()
    // 에이전트 선택 시 실행 상태 초기화
    setIsRunning?.(false)
  }

  // 에이전트 생성
  const createAgent = async (
    name: string,
    type: "general" | "specialized" | "assistant" | "autonomous" | "team",
    description: string,
    code?: string,
    prompt?: string,
    teamId?: string,
  ): Promise<string> => {
    // 기본 코드 생성
    let defaultCode = ""
    let defaultPrompt = ""

    if (type === "team") {
      // 팀 에이전트(코디네이터)용 기본 코드
      defaultCode = `
/**
 * 팀 이름: ${name}
 * 설명: ${description}
 * 역할: 팀 리더 (코디네이터)
 */
class TeamCoordinator {
  constructor() {
    this.teamName = "${name}";
    this.purpose = "${description}";
    this.members = []; // 팀원 목록은 동적으로 업데이트됨
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
      { id: 2, name: "해결책 설계", description: "문제 해결 방법 설계" },
      { id: 3, name: "구현 계획", description: "구현 단계 계획" }
    ];
  }

  // 작업을 팀원들에게 할당
  assignTasks(tasks) {
    // 작업 할당 로직
    return tasks.map(task => ({
      task: task,
      assignedTo: "적합한 팀원",
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

  // 프로젝트 상태 업데이트
  updateProjectStatus(status) {
    this.projectStatus = status;
    return \`프로젝트 상태가 '\${status}'로 업데이트되었습니다.\`;
  }
  
  // 팀원 추가
  addMember(member) {
    this.members.push(member);
    return \`팀원 '\${member.name}'이(가) 추가되었습니다.\`;
  }
  
  // 팀 상태 보고
  getTeamStatus() {
    return {
      name: this.teamName,
      purpose: this.purpose,
      members: this.members,
      currentTasks: this.tasks,
      projectStatus: this.projectStatus
    };
  }
}`

      // 팀 에이전트(코디네이터)용 기본 프롬프트
      defaultPrompt = `당신은 "${name}" 팀의 리더(코디네이터)입니다. 팀의 목적은 "${description}"입니다.

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
- 항상 팀의 목적과 사용자의 요구사항을 최우선으로 고려하세요.`
    } else {
      // 일반 에이전트용 기본 코드
      defaultCode = `
/**
 * 이름: ${name}
 * 설명: ${description}
 */
class ${name.replace(/\s+/g, "")} {
  constructor() {
    this.name = "${name}";
    this.description = "${description}";
    this.memory = [];
  }

  process(input) {
    // 입력 처리 로직
    this.memory.push(input);
    
    // 간단한 응답 생성
    return \`입력 "\${input}"에 대한 응답입니다. 저는 ${description}입니다.\`;
  }
  
  // 유틸리티 메서드
  getMemory() {
    return this.memory;
  }
}`

      // 일반 에이전트용 기본 프롬프트
      defaultPrompt = `당신은 ${name} 에이전트입니다. ${description}

사용자의 요청에 따라 최선의 결과를 제공하세요. 항상 정확하고 유용한 정보만 제공하세요.`
    }

    // 새 에이전트 ID 생성
    const newAgentId = uuidv4()

    // 에이전트 추가
    addAgent?.({
      name,
      type,
      description,
      code: code || defaultCode,
      prompt: prompt || defaultPrompt,
      teamId,
    })

    // 콘솔 메시지 추가
    addConsoleMessage?.({
      content: `에이전트 "${name}"이(가) 생성되었습니다.`,
      type: "success",
    })

    return newAgentId
  }

  const updateAgentInfo = (
    agentId: string,
    updates: Partial<{
      name: string
      type: "general" | "specialized" | "assistant" | "autonomous" | "team"
      description: string
      code: string
      prompt: string
    }>,
  ) => {
    useAgentState.setState({
      agents: agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : agent,
      ),
    })
  }

  const deleteAgentById = (agentId: string) => {
    const newAgents = agents.filter((agent) => agent.id !== agentId)

    useAgentState.setState({
      agents: newAgents,
      selectedAgentId: selectedAgentId === agentId ? (newAgents.length > 0 ? newAgents[0].id : null) : selectedAgentId,
    })
  }

  // 에이전트 시작
  const startAgent = () => {
    if (!selectedAgentId) return

    setIsRunning?.(true)
    addConsoleMessage?.({
      content: "에이전트가 시작되었습니다.",
      type: "info",
    })
  }

  // 에이전트 중지
  const stopAgent = () => {
    if (!selectedAgentId) return

    setIsRunning?.(false)
    addConsoleMessage?.({
      content: "에이전트가 중지되었습니다.",
      type: "info",
    })
  }

  // executeCommand 함수 수정 - agentId 매개변수 추가
  const executeCommand = (content: string, type: "info" | "warning" | "error" | "success", agentId?: string) => {
    const newMessage = {
      id: `msg-${uuidv4()}`,
      content,
      type,
      agentId,
      timestamp: new Date().toLocaleTimeString(),
    }

    useAgentState.setState({
      consoleMessages: [...consoleMessages, newMessage],
    })
  }

  const clearConsole = () => {
    useAgentState.setState({
      consoleMessages: [
        {
          id: `msg-${uuidv4()}`,
          content: "콘솔이 초기화되었습니다.",
          type: "info",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    })
  }

  // Gemini API를 사용하여 에이전트 초기 응답 생성
  const generateInitialResponse = async (agent: any) => {
    try {
      executeCommand("초기 응답 생성 중...", "info")

      const llmService = getLLMService(apiKey)

      // 에이전트 프롬프트 구성
      const systemPrompt =
        agent.prompt ||
        `당신은 ${agent.name}라는 AI 어시스턴트입니다. ${agent.description}

당신의 역할과 책임:
1. 사용자의 질문과 요청을 정확히 이해하고 분석합니다.
2. 당신의 전문 분야에 맞는 고품질 응답을 제공합니다.
3. 필요한 경우 추가 정보를 요청합니다.
4. 항상 정확하고 유용한 정보만 제공합니다.

지금은 사용자와의 첫 상호작용입니다. 자신을 소개하고, 어떤 도움을 줄 수 있는지 설명하세요.
당신의 전문 분야와 능력에 대해 구체적으로 언급하세요.`

      // API 호출
      const response = await llmService.generateText(systemPrompt)

      // 응답 표시
      executeCommand(response, "success")
    } catch (error) {
      console.error("초기 응답 생성 오류:", error)
      executeCommand(
        `초기 응답 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
        "error",
      )
    }
  }

  // Gemini API를 사용하여 사용자 입력에 대한 응답 생성
  const processUserInput = async (input: string) => {
    if (!selectedAgentId || !isRunning) {
      return "에이전트가 실행 중이 아닙니다. 'start' 명령어로 에이전트를 시작하세요."
    }

    try {
      const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)
      if (!selectedAgent) {
        return "선택된 에이전트가 없습니다."
      }

      const llmService = getLLMService(apiKey)

      // 에이전트 프롬프트와 사용자 입력을 결합
      const systemPrompt =
        selectedAgent.prompt ||
        `당신은 ${selectedAgent.name}라는 AI 어시스턴트입니다. ${selectedAgent.description}

당신의 역할과 책임:
1. 사용자의 질문과 요청을 정확히 이해하고 분석합니다.
2. 당신의 전문 분야에 맞는 고품질 응답을 제공합니다.
3. 필요한 경우 추가 정보를 요청합니다.
4. 항상 정확하고 유용한 정보만 제공합니다.`

      // 이전 대화 컨텍스트 구성 (최근 5개 메시지만 포함)
      const recentMessages = consoleMessages
        .filter((msg) => msg.type === "info" || msg.type === "success")
        .slice(-5)
        .map((msg) => msg.content)
        .join("\n\n")

      const prompt = `${systemPrompt}\n\n이전 대화:\n${recentMessages}\n\n사용자: ${input}\n\n어시스턴트:`

      // API 호출
      const response = await llmService.generateText(prompt)

      return response
    } catch (error) {
      console.error("사용자 입력 처리 오류:", error)
      return `오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  // 팀 생성 함수 수정 - 코디네이터 필수 포함 및 협업 로직 추가
  const createTeam = (name: string, description: string, members: string[]) => {
    // 코디네이터가 포함되어 있는지 확인
    const hasCoordinator = members.some((memberId) => {
      const member = agents.find((a) => a.id === memberId)
      return (
        member?.name.toLowerCase().includes("코디네이터") ||
        member?.description.toLowerCase().includes("코디네이터") ||
        member?.description.toLowerCase().includes("조율") ||
        member?.description.toLowerCase().includes("관리")
      )
    })

    // 코디네이터가 없으면 자동으로 코디네이터 생성
    if (!hasCoordinator) {
      // 새 코디네이터 에이전트 생성
      const coordinatorId = `coordinator-${Date.now()}`
      const coordinator = {
        id: coordinatorId,
        name: `${name} 코디네이터`,
        description: `${name} 팀의 작업을 조율하고 전체 프로세스를 관리합니다. 작업 계획 수립, 팀원 간 협업 조율, 결과물 통합 및 품질 검수를 담당합니다.`,
        type: "specialized" as const,
        prompt: `당신은 "${name}" 팀의 코디네이터입니다. 당신의 역할은 다음과 같습니다:
  1. 사용자 요구사항 분석 및 작업 계획 수립
  2. 팀원들에게 작업 할당 및 지시
  3. 팀원들의 작업 진행 상황 모니터링
  4. 팀원들의 결과물 통합 및 품질 검수
  5. 전체 프로세스 조율 및 최종 결과물 제출

  항상 체계적이고 효율적으로 팀을 이끌어 최상의 결과물을 만들어내세요.`,
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // 코디네이터를 에이전트 목록에 추가
      useAgentState.setState((prevState) => ({
        agents: [...prevState.agents, coordinator],
      }))

      // 코디네이터를 팀원 목록에 추가
      members.push(coordinatorId)
    }

    // 팀 생성 로직
    const teamId = `team-${Date.now()}`
    const team = {
      id: teamId,
      name,
      description,
      type: "team" as const,
      prompt: `당신은 "${name}" 팀입니다. 팀의 목적은 "${description}"입니다.
      
  이 팀은 다음과 같은 협업 방식으로 작업합니다:
  1. 코디네이터가 사용자 요청을 분석하고 작업 계획을 수립합니다.
  2. 각 전문가 팀원에게 적합한 작업이 할당됩니다.
  3. 팀원들이 각자의 전문 영역에서 작업을 수행합니다.
  4. 코디네이터가 결과물을 통합하고 품질을 검수합니다.
  5. 전체 프로젝트의 통합 상황을 모니터링하고 필요시 조정합니다.`,
      teamId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 팀을 에이전트 목록에 추가
    useAgentState.setState((prevState) => ({
      agents: [...prevState.agents, team],
    }))

    // 팀원들의 teamId 업데이트
    members.forEach((memberId) => {
      useAgentState.setState((prevState) => ({
        agents: prevState.agents.map((agent) => {
          if (agent.id === memberId) {
            return {
              ...agent,
              teamId,
              updatedAt: new Date(),
            }
          }
          return agent
        }),
      }))
    })

    return team
  }

  return {
    agents,
    selectedAgentId,
    isRunning,
    consoleMessages,
    selectAgent,
    createAgent,
    updateAgent: updateAgentInfo,
    deleteAgent: deleteAgentById,
    startAgent,
    stopAgent,
    executeCommand,
    clearConsole,
    clearConsoleMessages,
    generateInitialResponse,
    processUserInput,
    createTeam,
  }
}
