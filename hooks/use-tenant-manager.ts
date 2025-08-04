"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "readonly"
  status: "active" | "inactive"
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  email: string
  plan: "starter" | "professional" | "enterprise"
  status: "active" | "inactive"
  createdAt: string
  users: User[]
  usage?: {
    apiCalls: number
    storage: number // bytes
  }
  quota?: {
    maxUsers: number
    maxApiCalls: number
    maxStorage: number // bytes
    maxAgents: number
    maxWorkflows: number
  }
}

interface TenantManagerState {
  tenants: Tenant[]
  selectedTenantId: string | null

  // Actions
  createTenant: (data: {
    name: string
    email: string
    plan: string
    adminUser: {
      name: string
      email: string
    }
  }) => void
  selectTenant: (id: string | null) => void
  updateTenant: (id: string, updates: Partial<Omit<Tenant, "id">>) => void
  deleteTenant: (id: string) => void
  addUser: (
    tenantId: string,
    userData: {
      name: string
      email: string
      role: string
    },
  ) => void
  updateTenantStatus: (id: string, status: "active" | "inactive") => void
}

export function useTenantManager() {
  const useStore = create<TenantManagerState>((set, get) => ({
    tenants: [
      {
        id: "tenant-1",
        name: "샘플 기업",
        email: "contact@sample.com",
        plan: "professional",
        status: "active",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 전
        users: [
          {
            id: "user-1",
            name: "관리자",
            email: "admin@sample.com",
            role: "admin",
            status: "active",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "user-2",
            name: "일반 사용자",
            email: "user@sample.com",
            role: "user",
            status: "active",
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        usage: {
          apiCalls: 12500,
          storage: 256 * 1024 * 1024, // 256MB
        },
        quota: {
          maxUsers: 10,
          maxApiCalls: 50000,
          maxStorage: 1024 * 1024 * 1024, // 1GB
          maxAgents: 5,
          maxWorkflows: 10,
        },
      },
    ],
    selectedTenantId: "tenant-1",

    createTenant: (data) =>
      set((state) => {
        const quotaByPlan = {
          starter: {
            maxUsers: 5,
            maxApiCalls: 10000,
            maxStorage: 512 * 1024 * 1024, // 512MB
            maxAgents: 2,
            maxWorkflows: 5,
          },
          professional: {
            maxUsers: 10,
            maxApiCalls: 50000,
            maxStorage: 1024 * 1024 * 1024, // 1GB
            maxAgents: 5,
            maxWorkflows: 10,
          },
          enterprise: {
            maxUsers: 50,
            maxApiCalls: 500000,
            maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
            maxAgents: 20,
            maxWorkflows: 50,
          },
        }

        const newTenant: Tenant = {
          id: uuidv4(),
          name: data.name,
          email: data.email,
          plan: data.plan as any,
          status: "active",
          createdAt: new Date().toISOString(),
          users: [
            {
              id: uuidv4(),
              name: data.adminUser.name,
              email: data.adminUser.email,
              role: "admin",
              status: "active",
              createdAt: new Date().toISOString(),
            },
          ],
          usage: {
            apiCalls: 0,
            storage: 0,
          },
          quota: quotaByPlan[data.plan] || quotaByPlan.starter,
        }

        return {
          tenants: [...state.tenants, newTenant],
          selectedTenantId: state.tenants.length === 0 ? newTenant.id : state.selectedTenantId,
        }
      }),

    selectTenant: (id) => set({ selectedTenantId: id }),

    updateTenant: (id, updates) =>
      set((state) => ({
        tenants: state.tenants.map((tenant) => (tenant.id === id ? { ...tenant, ...updates } : tenant)),
      })),

    deleteTenant: (id) =>
      set((state) => {
        const newTenants = state.tenants.filter((tenant) => tenant.id !== id)
        return {
          tenants: newTenants,
          selectedTenantId:
            state.selectedTenantId === id ? (newTenants.length > 0 ? newTenants[0].id : null) : state.selectedTenantId,
        }
      }),

    addUser: (tenantId, userData) =>
      set((state) => {
        const tenant = state.tenants.find((t) => t.id === tenantId)

        if (!tenant) return state

        const newUser: User = {
          id: uuidv4(),
          name: userData.name,
          email: userData.email,
          role: userData.role as any,
          status: "active",
          createdAt: new Date().toISOString(),
        }

        return {
          tenants: state.tenants.map((t) => (t.id === tenantId ? { ...t, users: [...t.users, newUser] } : t)),
        }
      }),

    updateTenantStatus: (id, status) =>
      set((state) => ({
        tenants: state.tenants.map((tenant) => (tenant.id === id ? { ...tenant, status } : tenant)),
      })),
  }))

  return useStore()
}
