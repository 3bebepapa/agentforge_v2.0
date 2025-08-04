"use client"

import { create } from "zustand"

interface SystemStatus {
  overall: "healthy" | "degraded" | "down"
  lastChecked: string
  alerts: {
    severity: "info" | "warning" | "critical"
    message: string
    timestamp: string
  }[]
}

interface ServiceStatus {
  id: string
  name: string
  description: string
  status: "running" | "stopped" | "error"
  uptime: string
}

interface ResourceUsage {
  cpu: number
  cpuCores: number[]
  memory: number
  memoryUsed: string
  memoryTotal: string
  disk: number
  diskUsed: string
  diskTotal: string
  networkIn: string
  networkOut: string
  connections: number
  dbConnections: number
  dbResponseTime: number
}

interface Log {
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  service: string
  message: string
}

interface SystemMonitorState {
  systemStatus: SystemStatus
  serviceStatus: ServiceStatus[]
  resourceUsage: ResourceUsage
  logs: Log[]

  // Actions
  refreshStatus: () => void
}

export function useSystemMonitor() {
  const useStore = create<SystemMonitorState>((set, get) => ({
    systemStatus: {
      overall: "healthy",
      lastChecked: new Date().toISOString(),
      alerts: [
        {
          severity: "info",
          message: "시스템이 정상적으로 작동 중입니다",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
        },
      ],
    },

    serviceStatus: [
      {
        id: "service-1",
        name: "API 서버",
        description: "메인 API 서비스",
        status: "running",
        uptime: "5일 3시간",
      },
      {
        id: "service-2",
        name: "데이터베이스",
        description: "PostgreSQL 데이터베이스",
        status: "running",
        uptime: "5일 3시간",
      },
      {
        id: "service-3",
        name: "캐시 서버",
        description: "Redis 캐시 서버",
        status: "running",
        uptime: "2일 7시간",
      },
      {
        id: "service-4",
        name: "작업 큐",
        description: "백그라운드 작업 처리",
        status: "running",
        uptime: "5일 2시간",
      },
      {
        id: "service-5",
        name: "스토리지 서비스",
        description: "파일 스토리지 서비스",
        status: "running",
        uptime: "5일 3시간",
      },
      {
        id: "service-6",
        name: "로그 수집기",
        description: "시스템 로그 수집 및 분석",
        status: "running",
        uptime: "5일 1시간",
      },
    ],

    resourceUsage: {
      cpu: 35,
      cpuCores: [40, 30, 25, 45],
      memory: 42,
      memoryUsed: "3.4GB",
      memoryTotal: "8GB",
      disk: 65,
      diskUsed: "130GB",
      diskTotal: "200GB",
      networkIn: "1.2MB",
      networkOut: "0.8MB",
      connections: 128,
      dbConnections: 24,
      dbResponseTime: 45,
    },

    logs: [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        level: "info",
        service: "API 서버",
        message: "API 서버가 정상적으로 작동 중입니다",
      },
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        level: "info",
        service: "데이터베이스",
        message: "데이터베이스 연결 풀 최적화 완료",
      },
      {
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: "warning",
        service: "스토리지 서비스",
        message: "디스크 공간이 65%를 초과했습니다",
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        level: "info",
        service: "작업 큐",
        message: "대기 중인 작업 수: 12",
      },
      {
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        level: "error",
        service: "로그 수집기",
        message: "로그 파일 회전 중 오류 발생",
      },
      {
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        level: "info",
        service: "API 서버",

        message: "API 요청 처리량: 초당 250개",
      },
      {
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        level: "debug",
        service: "캐시 서버",
        message: "캐시 적중률: 85%",
      },
    ],

    refreshStatus: () => {
      // 실제 구현에서는 API 호출로 최신 상태 가져오기
      // 여기서는 시뮬레이션

      // CPU 사용량 업데이트 (20-60% 범위)
      const newCpu = Math.floor(20 + Math.random() * 40)
      const newCpuCores = Array(4)
        .fill(0)
        .map(() => Math.floor(15 + Math.random() * 50))

      // 메모리 사용량 업데이트 (30-70% 범위)
      const newMemory = Math.floor(30 + Math.random() * 40)

      // 디스크 사용량 업데이트 (60-70% 범위, 천천히 증가)
      const currentDisk = get().resourceUsage.disk
      const newDisk = Math.min(70, currentDisk + (Math.random() > 0.7 ? 1 : 0))

      // 네트워크 사용량 업데이트
      const newNetworkIn = `${(0.8 + Math.random() * 0.8).toFixed(1)}MB`
      const newNetworkOut = `${(0.5 + Math.random() * 0.6).toFixed(1)}MB`

      // 연결 수 업데이트
      const newConnections = Math.floor(100 + Math.random() * 50)
      const newDbConnections = Math.floor(20 + Math.random() * 10)

      // DB 응답 시간 업데이트 (30-60ms 범위)
      const newDbResponseTime = Math.floor(30 + Math.random() * 30)

      // 서비스 상태 업데이트 (가끔 서비스 중단 시뮬레이션)
      const newServiceStatus = [...get().serviceStatus]
      if (Math.random() > 0.9) {
        const randomServiceIndex = Math.floor(Math.random() * newServiceStatus.length)
        newServiceStatus[randomServiceIndex] = {
          ...newServiceStatus[randomServiceIndex],
          status: Math.random() > 0.5 ? "error" : "stopped",
        }
      }

      // 시스템 상태 업데이트
      const hasDownService = newServiceStatus.some((s) => s.status !== "running")
      const newSystemStatus = {
        ...get().systemStatus,
        overall: hasDownService ? "degraded" : "healthy",
        lastChecked: new Date().toISOString(),
      }

      // 가끔 새 알림 추가
      if (Math.random() > 0.7) {
        const alertTypes = [
          {
            severity: "info" as const,
            message: "시스템 성능이 정상 범위 내에 있습니다",
          },
          {
            severity: "info" as const,
            message: "자동 백업이 성공적으로 완료되었습니다",
          },
          {
            severity: "warning" as const,
            message: "API 요청량이 평소보다 20% 증가했습니다",
          },
          {
            severity: "warning" as const,
            message: "디스크 공간이 70%를 초과했습니다",
          },
        ]

        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)]

        newSystemStatus.alerts = [
          {
            severity: randomAlert.severity,
            message: randomAlert.message,
            timestamp: new Date().toISOString(),
          },
          ...newSystemStatus.alerts.slice(0, 4), // 최대 5개 알림 유지
        ]
      }

      // 새 로그 추가
      const logTypes = [
        {
          level: "info" as const,
          service: "API 서버",
          message: "API 요청 처리량: 초당 " + Math.floor(200 + Math.random() * 100) + "개",
        },
        {
          level: "info" as const,
          service: "데이터베이스",
          message: "쿼리 캐시 적중률: " + Math.floor(70 + Math.random() * 20) + "%",
        },
        {
          level: "debug" as const,
          service: "캐시 서버",
          message: "캐시 메모리 사용량: " + Math.floor(40 + Math.random() * 30) + "%",
        },
        {
          level: "warning" as const,
          service: "스토리지 서비스",
          message: "파일 업로드 지연 시간 증가: " + Math.floor(100 + Math.random() * 100) + "ms",
        },
      ]

      const randomLog = logTypes[Math.floor(Math.random() * logTypes.length)]
      const newLogs = [
        {
          timestamp: new Date().toISOString(),
          level: randomLog.level,
          service: randomLog.service,
          message: randomLog.message,
        },
        ...get().logs.slice(0, 49), // 최대 50개 로그 유지
      ]

      set({
        systemStatus: newSystemStatus,
        serviceStatus: newServiceStatus,
        resourceUsage: {
          cpu: newCpu,
          cpuCores: newCpuCores,
          memory: newMemory,
          memoryUsed: `${(newMemory * 0.08).toFixed(1)}GB`,
          memoryTotal: "8GB",
          disk: newDisk,
          diskUsed: `${Math.floor(newDisk * 2)}GB`,
          diskTotal: "200GB",
          networkIn: newNetworkIn,
          networkOut: newNetworkOut,
          connections: newConnections,
          dbConnections: newDbConnections,
          dbResponseTime: newDbResponseTime,
        },
        logs: newLogs,
      })
    },
  }))

  return useStore()
}
