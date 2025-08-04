"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import { Database, Github, Slack, Trello, DropletIcon as Dropbox } from "lucide-react"
import type React from "react"
import { getWorkflowEngine, type Workflow, type WorkflowStep } from "@/lib/workflow-engine"

interface Integration {
  id: string
  name: string
  type: string
  description: string
  icon: React.ReactNode
  status: "connected" | "error"
  connectedAt: string
  lastUsed: string | null
  error: string | null
  config?: any
}

interface ConnectedService {
  id: string
  name: string
  type: string
  status: "active" | "inactive"
}

interface AvailableIntegration {
  id: string
  name: string
  type: string
  description: string
  icon: React.ReactNode
  configTemplate: any
}

interface IntegrationHubState {
  integrations: Integration[]
  availableIntegrations: AvailableIntegration[]
  connectedServices: ConnectedService[]
  workflows: Workflow[]
  selectedWorkflowId: string | null
  isCreatingWorkflow: boolean
  isRunningWorkflow: boolean
  workflowResults: Record<string, any>

  // Actions
  addIntegration: (type: string, config?: any) => void
  removeIntegration: (id: string) => void
  createWorkflow: (data: {
    name: string
    description: string
    type: string
    steps?: Array<{
      name: string
      type: string
      config: any
    }>
  }) => void
  selectWorkflow: (id: string | null) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  runWorkflow: (id: string, context?: any) => Promise<any>
}

export function useIntegrationHub() {
  const useStore = create<IntegrationHubState>((set, get) => ({
    integrations: [
      {
        id: "integration-1",
        name: "PostgreSQL 데이터베이스",
        type: "database",
        description: "메인 데이터베이스 연결",
        icon: <Database className="h-5 w-5 text-blue-500" />,
        status: "connected",
        connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
        lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1시간 전
        error: null,
        config: {
          host: "db.example.com",
          port: 5432,
          database: "main",
          username: "user",
          password: "********",
        },
      },
    ],

    availableIntegrations: [
      {
        id: "available-1",
        name: "PostgreSQL",
        type: "database",
        description: "PostgreSQL 데이터베이스 연결",
        icon: <Database className="h-5 w-5 text-blue-500" />,
        configTemplate: {
          host: { type: "string", required: true, default: "localhost" },
          port: { type: "number", required: true, default: 5432 },
          database: { type: "string", required: true },
          username: { type: "string", required: true },
          password: { type: "password", required: true },
        },
      },
      {
        id: "available-2",
        name: "Slack",
        type: "messaging",
        description: "Slack 메시징 통합",
        icon: <Slack className="h-5 w-5 text-green-500" />,
        configTemplate: {
          webhookUrl: { type: "string", required: true },
          channel: { type: "string", required: false },
          username: { type: "string", required: false },
        },
      },
      {
        id: "available-3",
        name: "GitHub",
        type: "development",
        description: "GitHub 저장소 통합",
        icon: <Github className="h-5 w-5 text-gray-800" />,
        configTemplate: {
          token: { type: "password", required: true },
          owner: { type: "string", required: true },
          repo: { type: "string", required: true },
        },
      },
      {
        id: "available-4",
        name: "Trello",
        type: "project",
        description: "Trello 프로젝트 관리 통합",
        icon: <Trello className="h-5 w-5 text-blue-400" />,
        configTemplate: {
          apiKey: { type: "password", required: true },
          token: { type: "password", required: true },
          boardId: { type: "string", required: true },
        },
      },
      {
        id: "available-5",
        name: "Dropbox",
        type: "storage",
        description: "Dropbox 파일 스토리지 통합",
        icon: <Dropbox className="h-5 w-5 text-blue-600" />,
        configTemplate: {
          accessToken: { type: "password", required: true },
          refreshToken: { type: "password", required: true },
          rootFolder: { type: "string", required: false, default: "/" },
        },
      },
    ],

    connectedServices: [
      {
        id: "service-1",
        name: "데이터베이스 서비스",
        type: "database",
        status: "active",
      },
    ],

    workflows: [
      {
        id: "workflow-1",
        name: "데이터 동기화",
        description: "데이터베이스 간 데이터 동기화",
        type: "sequential",
        steps: [
          {
            id: "step-1",
            name: "소스 데이터 조회",
            type: "database",
            config: {
              query: "SELECT * FROM users WHERE updated_at > :lastSyncTime",
              params: { lastSyncTime: "2023-01-01" },
            },
            next: ["step-2"],
          },
          {
            id: "step-2",
            name: "데이터 변환",
            type: "transform",
            config: {
              source: "$.results.step-1",
              transformations: [
                {
                  type: "map",
                  mapping: {
                    id: "item.id",
                    fullName: "item.first_name + ' ' + item.last_name",
                    email: "item.email",
                    updatedAt: "item.updated_at",
                  },
                },
              ],
            },
            next: ["step-3"],
          },
          {
            id: "step-3",
            name: "대상 데이터베이스 업데이트",
            type: "database",
            config: {
              query:
                "INSERT INTO users_sync (id, full_name, email, updated_at) VALUES (:id, :fullName, :email, :updatedAt) ON CONFLICT (id) DO UPDATE SET full_name = :fullName, email = :email, updated_at = :updatedAt",
              params: "$.results.step-2",
            },
            next: [],
          },
        ],
        startStepId: "step-1",
        endStepIds: ["step-3"],
        status: "active",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
      },
    ],

    selectedWorkflowId: null,
    isCreatingWorkflow: false,
    isRunningWorkflow: false,
    workflowResults: {},

    addIntegration: (type, config = {}) =>
      set((state) => {
        const availableIntegration = state.availableIntegrations.find((i) => i.type === type)

        if (!availableIntegration) return state

        // 기본 구성 생성
        const defaultConfig = {}
        for (const [key, value] of Object.entries(availableIntegration.configTemplate)) {
          if (value.default !== undefined) {
            defaultConfig[key] = value.default
          }
        }

        const newIntegration: Integration = {
          id: uuidv4(),
          name: availableIntegration.name,
          type: availableIntegration.type,
          description: availableIntegration.description,
          icon: availableIntegration.icon,
          status: "connected",
          connectedAt: new Date().toISOString(),
          lastUsed: null,
          error: null,
          config: { ...defaultConfig, ...config },
        }

        // 새 서비스 추가
        const newService: ConnectedService = {
          id: uuidv4(),
          name: `${availableIntegration.name} 서비스`,
          type: availableIntegration.type,
          status: "active",
        }

        return {
          integrations: [...state.integrations, newIntegration],
          connectedServices: [...state.connectedServices, newService],
        }
      }),

    removeIntegration: (id) =>
      set((state) => {
        const integration = state.integrations.find((i) => i.id === id)

        if (!integration) return state

        // 관련 서비스 제거
        const newConnectedServices = state.connectedServices.filter(
          (s) => s.type !== integration.type || s.name !== `${integration.name} 서비스`,
        )

        return {
          integrations: state.integrations.filter((i) => i.id !== id),
          connectedServices: newConnectedServices,
        }
      }),

    createWorkflow: (data) =>
      set((state) => {
        const workflowEngine = getWorkflowEngine()

        // 단계 생성
        const steps: WorkflowStep[] =
          data.steps?.map((stepData) =>
            workflowEngine.createStep({
              name: stepData.name,
              type: stepData.type,
              config: stepData.config,
              next: [],
            }),
          ) || []

        // 단계 연결
        if (steps.length > 1) {
          for (let i = 0; i < steps.length - 1; i++) {
            steps[i].next = [steps[i + 1].id]
          }
        }

        // 워크플로우 생성
        const newWorkflow = workflowEngine.createWorkflow({
          name: data.name,
          description: data.description,
          type: data.type as any,
          steps,
        })

        return {
          workflows: [...state.workflows, newWorkflow],
          selectedWorkflowId: newWorkflow.id,
        }
      }),

    selectWorkflow: (id) => set({ selectedWorkflowId: id }),

    updateWorkflow: (id, updates) =>
      set((state) => ({
        workflows: state.workflows.map((workflow) => (workflow.id === id ? { ...workflow, ...updates } : workflow)),
      })),

    deleteWorkflow: (id) =>
      set((state) => ({
        workflows: state.workflows.filter((workflow) => workflow.id !== id),
        selectedWorkflowId: state.selectedWorkflowId === id ? null : state.selectedWorkflowId,
      })),

    runWorkflow: async (id, context = {}) => {
      const { workflows } = get()
      const workflow = workflows.find((w) => w.id === id)

      if (!workflow) {
        throw new Error(`워크플로우를 찾을 수 없음: ${id}`)
      }

      set({ isRunningWorkflow: true })

      try {
        const workflowEngine = getWorkflowEngine()
        const results = await workflowEngine.executeWorkflow(workflow, context)

        set((state) => ({
          workflowResults: {
            ...state.workflowResults,
            [id]: results,
          },
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, lastRun: new Date().toISOString(), results } : w,
          ),
        }))

        return results
      } catch (error) {
        console.error("워크플로우 실행 오류:", error)

        set((state) => ({
          workflowResults: {
            ...state.workflowResults,
            [id]: { error: error.message },
          },
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, lastRun: new Date().toISOString(), results: { error: error.message } } : w,
          ),
        }))

        throw error
      } finally {
        set({ isRunningWorkflow: false })
      }
    },
  }))

  return useStore()
}
