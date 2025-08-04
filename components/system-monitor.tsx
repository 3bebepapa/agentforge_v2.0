"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Database, Cpu, HardDrive, Network, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { useSystemMonitor } from "@/hooks/use-system-monitor"

export function SystemMonitor() {
  const { systemStatus, serviceStatus, resourceUsage, logs, refreshStatus } = useSystemMonitor()

  const [refreshInterval, setRefreshInterval] = useState<number | null>(null)

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        refreshStatus()
      }, refreshInterval * 1000)

      return () => clearInterval(interval)
    }
  }, [refreshInterval, refreshStatus])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">시스템 모니터링</h2>
        <div className="flex items-center gap-2">
          <select
            className="p-1 text-sm border rounded-md"
            value={refreshInterval?.toString() || ""}
            onChange={(e) => setRefreshInterval(e.target.value ? Number.parseInt(e.target.value) : null)}
          >
            <option value="">자동 새로고침 끄기</option>
            <option value="5">5초마다</option>
            <option value="10">10초마다</option>
            <option value="30">30초마다</option>
            <option value="60">1분마다</option>
          </select>
          <Button size="sm" variant="outline" onClick={refreshStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="mt-2">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="services">서비스</TabsTrigger>
            <TabsTrigger value="resources">리소스</TabsTrigger>
            <TabsTrigger value="logs">로그</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={systemStatus.overall === "healthy" ? "border-green-500" : "border-red-500"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">시스템 상태</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {systemStatus.overall === "healthy" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-semibold capitalize">
                        {systemStatus.overall === "healthy" ? "정상" : "문제 발생"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      마지막 확인: {new Date(systemStatus.lastChecked).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">서비스</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {serviceStatus.filter((s) => s.status === "running").length}/{serviceStatus.length}
                    </div>
                    <p className="text-xs text-muted-foreground">실행 중인 서비스</p>
                    {serviceStatus.some((s) => s.status !== "running") && (
                      <div className="mt-2">
                        <Badge variant="destructive">
                          {serviceStatus.filter((s) => s.status !== "running").length}개 서비스 문제
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">CPU 사용량</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{resourceUsage.cpu}%</div>
                    <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          resourceUsage.cpu > 80
                            ? "bg-red-500"
                            : resourceUsage.cpu > 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${resourceUsage.cpu}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">메모리 사용량</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{resourceUsage.memory}%</div>
                    <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          resourceUsage.memory > 80
                            ? "bg-red-500"
                            : resourceUsage.memory > 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${resourceUsage.memory}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">서비스 상태</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {serviceStatus.slice(0, 5).map((service) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-xs text-muted-foreground">{service.description}</div>
                          </div>
                          <Badge variant={service.status === "running" ? "default" : "destructive"}>
                            {service.status === "running" ? "실행 중" : "중지됨"}
                          </Badge>
                        </div>
                      ))}

                      {serviceStatus.length > 5 && (
                        <Button variant="link" className="text-xs p-0">
                          더 보기 ({serviceStatus.length - 5}개)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">최근 알림</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemStatus.alerts.map((alert, index) => (
                        <div key={index} className="flex items-start">
                          {alert.severity === "critical" ? (
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          ) : alert.severity === "warning" ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}

                      {systemStatus.alerts.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">알림이 없습니다</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="services" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">서비스</th>
                      <th className="text-left p-2">설명</th>
                      <th className="text-left p-2">상태</th>
                      <th className="text-left p-2">업타임</th>
                      <th className="text-left p-2">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceStatus.map((service, index) => (
                      <tr key={service.id} className={index !== serviceStatus.length - 1 ? "border-b" : ""}>
                        <td className="p-2 font-medium">{service.name}</td>
                        <td className="p-2 text-sm">{service.description}</td>
                        <td className="p-2">
                          <Badge variant={service.status === "running" ? "default" : "destructive"}>
                            {service.status === "running" ? "실행 중" : "중지됨"}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">{service.uptime}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              {service.status === "running" ? "재시작" : "시작"}
                            </Button>
                            {service.status === "running" && (
                              <Button variant="outline" size="sm">
                                중지
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="resources" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    CPU 사용량
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>전체 사용량</span>
                        <span>{resourceUsage.cpu}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            resourceUsage.cpu > 80
                              ? "bg-red-500"
                              : resourceUsage.cpu > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${resourceUsage.cpu}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {resourceUsage.cpuCores.map((core, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>코어 {index + 1}</span>
                            <span>{core}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                core > 80 ? "bg-red-500" : core > 60 ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ width: `${core}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <HardDrive className="h-5 w-5 mr-2" />
                    메모리 및 디스크
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">메모리</h4>
                      <div className="flex justify-between mb-1">
                        <span>사용량</span>
                        <span>
                          {resourceUsage.memory}% ({resourceUsage.memoryUsed} / {resourceUsage.memoryTotal})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            resourceUsage.memory > 80
                              ? "bg-red-500"
                              : resourceUsage.memory > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${resourceUsage.memory}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">디스크</h4>
                      <div className="flex justify-between mb-1">
                        <span>사용량</span>
                        <span>
                          {resourceUsage.disk}% ({resourceUsage.diskUsed} / {resourceUsage.diskTotal})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            resourceUsage.disk > 80
                              ? "bg-red-500"
                              : resourceUsage.disk > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${resourceUsage.disk}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Network className="h-5 w-5 mr-2" />
                    네트워크
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">수신</h4>
                        <div className="text-2xl font-bold">{resourceUsage.networkIn}/s</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">송신</h4>
                        <div className="text-2xl font-bold">{resourceUsage.networkOut}/s</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">활성 연결</h4>
                      <div className="text-2xl font-bold">{resourceUsage.connections}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    데이터베이스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">연결 수</h4>
                      <div className="text-2xl font-bold">{resourceUsage.dbConnections}</div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">쿼리 성능</h4>
                      <div className="flex justify-between mb-1">
                        <span>평균 응답 시간</span>
                        <span>{resourceUsage.dbResponseTime}ms</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            resourceUsage.dbResponseTime > 100
                              ? "bg-red-500"
                              : resourceUsage.dbResponseTime > 50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(resourceUsage.dbResponseTime / 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs" className="flex-1 p-0 m-0">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">시스템 로그</h3>
              <div className="flex items-center gap-2">
                <select className="p-1 text-sm border rounded-md">
                  <option value="all">모든 로그</option>
                  <option value="error">오류</option>
                  <option value="warning">경고</option>
                  <option value="info">정보</option>
                </select>
                <Button variant="outline" size="sm">
                  로그 내보내기
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-3 bg-black font-mono text-sm">
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <p
                    key={index}
                    className={
                      log.level === "error"
                        ? "text-red-400"
                        : log.level === "warning"
                          ? "text-yellow-400"
                          : log.level === "info"
                            ? "text-blue-400"
                            : "text-white"
                    }
                  >
                    [{log.timestamp}] [{log.level.toUpperCase()}] {log.message}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
