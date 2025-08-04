"use client"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Server,
  Cloud,
  Database,
  Monitor,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
} from "lucide-react"

interface DeploymentManagerProps {
  apiKey?: string
}

export function DeploymentManager({ apiKey }: DeploymentManagerProps) {
  const [deployments, setDeployments] = useState([
    {
      id: "deploy-1",
      name: "프로덕션 환경",
      type: "container",
      status: "running",
      version: "1.0.0",
      lastDeployed: "2023-08-15T14:30:00Z",
      resources: {
        cpu: 65,
        memory: 48,
        storage: 32,
      },
      services: [
        { name: "API 서버", status: "running" },
        { name: "워크플로우 엔진", status: "running" },
        { name: "데이터베이스", status: "running" },
        { name: "벡터 저장소", status: "running" },
      ],
    },
    {
      id: "deploy-2",
      name: "스테이징 환경",
      type: "serverless",
      status: "running",
      version: "1.1.0-beta",
      lastDeployed: "2023-09-01T10:15:00Z",
      resources: {
        cpu: 35,
        memory: 22,
        storage: 18,
      },
      services: [
        { name: "API 서버", status: "running" },
        { name: "워크플로우 엔진", status: "running" },
        { name: "데이터베이스", status: "running" },
      ],
    },
    {
      id: "deploy-3",
      name: "개발 환경",
      type: "on-premise",
      status: "stopped",
      version: "1.2.0-dev",
      lastDeployed: "2023-09-10T09:45:00Z",
      resources: {
        cpu: 0,
        memory: 0,
        storage: 15,
      },
      services: [
        { name: "API 서버", status: "stopped" },
        { name: "워크플로우 엔진", status: "stopped" },
        { name: "데이터베이스", status: "stopped" },
      ],
    },
  ])

  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>("deploy-1")
  const [activeTab, setActiveTab] = useState("overview")
  const [isDeploying, setIsDeploying] = useState(false)

  const selectedDeployment = deployments.find((d) => d.id === selectedDeploymentId)

  const handleStartDeployment = (id: string) => {
    setDeployments(
      deployments.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "running",
              resources: { ...d.resources, cpu: 45, memory: 30 },
              services: d.services.map((s) => ({ ...s, status: "running" })),
            }
          : d,
      ),
    )
  }

  const handleStopDeployment = (id: string) => {
    setDeployments(
      deployments.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "stopped",
              resources: { ...d.resources, cpu: 0, memory: 0 },
              services: d.services.map((s) => ({ ...s, status: "stopped" })),
            }
          : d,
      ),
    )
  }

  const handleDeploy = () => {
    if (!selectedDeployment) return

    setIsDeploying(true)

    // Simulate deployment
    setTimeout(() => {
      setDeployments(
        deployments.map((d) =>
          d.id === selectedDeploymentId
            ? {
                ...d,
                version: incrementVersion(d.version),
                lastDeployed: new Date().toISOString(),
                status: "running",
              }
            : d,
        ),
      )
      setIsDeploying(false)
    }, 3000)
  }

  // Helper function to increment version
  const incrementVersion = (version: string): string => {
    const parts = version.split(".")
    if (parts.length === 3) {
      const lastPart = parts[2]
      if (lastPart.includes("-")) {
        const [num, tag] = lastPart.split("-")
        return `${parts[0]}.${parts[1]}.${Number.parseInt(num) + 1}-${tag}`
      } else {
        return `${parts[0]}.${parts[1]}.${Number.parseInt(lastPart) + 1}`
      }
    }
    return version
  }

  return (
    <div className="h-full flex">
      <div className="w-1/3 border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-4">배포 관리</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">컨테이너</CardTitle>
                  <Server className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">1</p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">서버리스</CardTitle>
                  <Cloud className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">1</p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">온프레미스</CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">1</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-sm mb-2">배포 환경</h3>
            {deployments.map((deployment) => (
              <Card
                key={deployment.id}
                className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                  selectedDeploymentId === deployment.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedDeploymentId(deployment.id)}
              >
                <CardHeader className="p-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center">
                      {deployment.type === "container" && <Server className="h-4 w-4 mr-2 text-primary" />}
                      {deployment.type === "serverless" && <Cloud className="h-4 w-4 mr-2 text-primary" />}
                      {deployment.type === "on-premise" && <Database className="h-4 w-4 mr-2 text-primary" />}
                      {deployment.name}
                    </CardTitle>
                    <Badge variant={deployment.status === "running" ? "default" : "secondary"}>
                      {deployment.status === "running" ? "실행 중" : "중지됨"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    버전: {deployment.version} • 마지막 배포: {new Date(deployment.lastDeployed).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 h-full">
        {selectedDeployment ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="font-semibold">{selectedDeployment.name}</h2>
                <Badge variant="outline" className="ml-2">
                  {selectedDeployment.type}
                </Badge>
                <Badge variant={selectedDeployment.status === "running" ? "default" : "secondary"} className="ml-2">
                  {selectedDeployment.status === "running" ? "실행 중" : "중지됨"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {selectedDeployment.status === "running" ? (
                  <Button variant="outline" size="sm" onClick={() => handleStopDeployment(selectedDeployment.id)}>
                    <Pause className="mr-2 h-4 w-4" />
                    중지
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleStartDeployment(selectedDeployment.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    시작
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  새로고침
                </Button>
                <Button
                  variant={isDeploying ? "secondary" : "default"}
                  size="sm"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                >
                  {isDeploying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      배포 중...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      배포
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border-b px-4">
              <TabsList className="mt-2">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="services">서비스</TabsTrigger>
                <TabsTrigger value="logs">로그</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="flex-1 p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">배포 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">이름</h4>
                          <p>{selectedDeployment.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">유형</h4>
                          <p className="capitalize">{selectedDeployment.type}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">버전</h4>
                          <p>{selectedDeployment.version}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">상태</h4>
                          <Badge variant={selectedDeployment.status === "running" ? "default" : "secondary"}>
                            {selectedDeployment.status === "running" ? "실행 중" : "중지됨"}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">마지막 배포</h4>
                          <p>{new Date(selectedDeployment.lastDeployed).toLocaleString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">서비스 수</h4>
                          <p>{selectedDeployment.services.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">리소스 사용량</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU</span>
                          <span>{selectedDeployment.resources.cpu}%</span>
                        </div>
                        <Progress value={selectedDeployment.resources.cpu} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>메모리</span>
                          <span>{selectedDeployment.resources.memory}%</span>
                        </div>
                        <Progress value={selectedDeployment.resources.memory} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>스토리지</span>
                          <span>{selectedDeployment.resources.storage}%</span>
                        </div>
                        <Progress value={selectedDeployment.resources.storage} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">서비스 상태</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedDeployment.services.map((service, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              {service.status === "running" ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <span>{service.name}</span>
                            </div>
                            <Badge variant={service.status === "running" ? "default" : "secondary"}>
                              {service.status === "running" ? "실행 중" : "중지됨"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="services" className="flex-1 p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDeployment.services.map((service, index) => (
                      <Card key={index}>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{service.name}</CardTitle>
                            <Badge variant={service.status === "running" ? "default" : "secondary"}>
                              {service.status === "running" ? "실행 중" : "중지됨"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">상태 모니터링</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">
                                업타임: {service.status === "running" ? "2일 5시간" : "0"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <div className="flex gap-2">
                            {service.status === "running" ? (
                              <Button variant="outline" size="sm" className="flex-1">
                                <Pause className="mr-2 h-4 w-4" />
                                중지
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="flex-1">
                                <Play className="mr-2 h-4 w-4" />
                                시작
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="flex-1">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              재시작
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="logs" className="flex-1 p-0 m-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-sm">배포 로그</h3>
                  <div className="flex items-center gap-2">
                    <select className="p-1 text-sm border rounded-md">
                      <option value="all">모든 로그</option>
                      <option value="error">오류</option>
                      <option value="warning">경고</option>
                      <option value="info">정보</option>
                    </select>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      로그 다운로드
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-3 bg-black font-mono text-sm">
                  <div className="space-y-1">
                    <p className="text-blue-400">
                      [2023-09-15 10:30:15] [INFO] 배포 시작: {selectedDeployment.name} v{selectedDeployment.version}
                    </p>
                    <p className="text-white">[2023-09-15 10:30:18] [INFO] 서비스 중지 중...</p>
                    <p className="text-white">[2023-09-15 10:30:20] [INFO] 데이터베이스 백업 생성</p>
                    <p className="text-yellow-400">[2023-09-15 10:30:25] [WARNING] 일부 연결이 아직 활성 상태입니다</p>
                    <p className="text-white">[2023-09-15 10:30:30] [INFO] 새 버전 파일 업로드 중</p>
                    <p className="text-white">[2023-09-15 10:30:45] [INFO] 구성 파일 업데이트</p>
                    <p className="text-white">[2023-09-15 10:30:50] [INFO] 서비스 시작 중...</p>
                    <p className="text-red-400">[2023-09-15 10:30:55] [ERROR] 데이터베이스 연결 실패</p>
                    <p className="text-white">[2023-09-15 10:31:00] [INFO] 재시도 중...</p>
                    <p className="text-white">[2023-09-15 10:31:05] [INFO] 데이터베이스 연결 성공</p>
                    <p className="text-white">[2023-09-15 10:31:10] [INFO] 모든 서비스 시작됨</p>
                    <p className="text-green-400">
                      [2023-09-15 10:31:15] [SUCCESS] 배포 완료: {selectedDeployment.name} v{selectedDeployment.version}
                    </p>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">배포 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">이름</label>
                        <Input value={selectedDeployment.name} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">환경 유형</label>
                        <select className="w-full p-2 rounded-md border" value={selectedDeployment.type}>
                          <option value="container">컨테이너</option>
                          <option value="serverless">서버리스</option>
                          <option value="on-premise">온프레미스</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">자동 스케일링</label>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="auto-scaling" className="rounded" />
                          <label htmlFor="auto-scaling">자동 스케일링 활성화</label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">리소스 제한</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs">최대 CPU</label>
                            <Input type="number" value="4" />
                          </div>
                          <div>
                            <label className="text-xs">최대 메모리 (GB)</label>
                            <Input type="number" value="8" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        설정 저장
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">환경 변수</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium">NODE_ENV</h4>
                            <p className="text-xs text-muted-foreground">production</p>
                          </div>
                          <Button variant="outline" size="sm">
                            편집
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium">DATABASE_URL</h4>
                            <p className="text-xs text-muted-foreground">postgres://user:****@host:5432/db</p>
                          </div>
                          <Button variant="outline" size="sm">
                            편집
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium">REDIS_URL</h4>
                            <p className="text-xs text-muted-foreground">redis://host:6379</p>
                          </div>
                          <Button variant="outline" size="sm">
                            편집
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium">VECTOR_DB_URL</h4>
                            <p className="text-xs text-muted-foreground">http://host:6333</p>
                          </div>
                          <Button variant="outline" size="sm">
                            편집
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        환경 변수 추가
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">배포 환경을 선택하세요</h3>
              <p className="text-muted-foreground max-w-md">
                왼쪽 패널에서 배포 환경을 선택하거나 새 배포 환경을 생성하세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
