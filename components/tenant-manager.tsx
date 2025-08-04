"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Building, Settings, CreditCard, Shield, Key } from "lucide-react"
import { useTenantManager } from "@/hooks/use-tenant-manager"

export function TenantManager() {
  const { tenants, selectedTenantId, createTenant, selectTenant, addUser, updateTenantStatus } = useTenantManager()

  const [newTenantData, setNewTenantData] = useState({
    name: "",
    email: "",
    plan: "starter",
    adminName: "",
    adminEmail: "",
  })

  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "user",
  })

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId)

  const handleCreateTenant = () => {
    if (!newTenantData.name || !newTenantData.email || !newTenantData.adminName || !newTenantData.adminEmail) {
      return
    }

    createTenant({
      name: newTenantData.name,
      email: newTenantData.email,
      plan: newTenantData.plan,
      adminUser: {
        name: newTenantData.adminName,
        email: newTenantData.adminEmail,
      },
    })

    // 폼 초기화
    setNewTenantData({
      name: "",
      email: "",
      plan: "starter",
      adminName: "",
      adminEmail: "",
    })
  }

  const handleAddUser = () => {
    if (!selectedTenantId || !newUserData.name || !newUserData.email) {
      return
    }

    addUser(selectedTenantId, {
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
    })

    // 폼 초기화
    setNewUserData({
      name: "",
      email: "",
      role: "user",
    })
  }

  return (
    <div className="h-full flex">
      <div className="w-1/3 border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-4">테넌트 관리</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">새 테넌트 생성</CardTitle>
              <CardDescription>새로운 기업 고객을 추가합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">기업명</label>
                <Input
                  placeholder="기업명 입력"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">기업 이메일</label>
                <Input
                  placeholder="contact@company.com"
                  type="email"
                  value={newTenantData.email}
                  onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">플랜</label>
                <select
                  className="w-full p-2 rounded-md border"
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value })}
                >
                  <option value="starter">스타터</option>
                  <option value="professional">프로페셔널</option>
                  <option value="enterprise">엔터프라이즈</option>
                </select>
              </div>

              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">관리자 계정</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">이름</label>
                  <Input
                    placeholder="관리자 이름"
                    value={newTenantData.adminName}
                    onChange={(e) => setNewTenantData({ ...newTenantData, adminName: e.target.value })}
                  />
                </div>

                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium">이메일</label>
                  <Input
                    placeholder="admin@company.com"
                    type="email"
                    value={newTenantData.adminEmail}
                    onChange={(e) => setNewTenantData({ ...newTenantData, adminEmail: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCreateTenant}
                disabled={
                  !newTenantData.name || !newTenantData.email || !newTenantData.adminName || !newTenantData.adminEmail
                }
              >
                <Building className="mr-2 h-4 w-4" />
                테넌트 생성
              </Button>
            </CardFooter>
          </Card>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h3 className="font-medium text-sm mb-2">테넌트 목록</h3>
            {tenants.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">등록된 테넌트가 없습니다</div>
            ) : (
              tenants.map((tenant) => (
                <Card
                  key={tenant.id}
                  className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedTenantId === tenant.id ? "border-primary" : ""
                  }`}
                  onClick={() => selectTenant(tenant.id)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <Building className="h-4 w-4 mr-2 text-primary" />
                        {tenant.name}
                      </CardTitle>
                      <Badge variant={tenant.status === "active" ? "default" : "destructive"}>
                        {tenant.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      {tenant.email} • {tenant.plan}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 h-full">
        {selectedTenant ? (
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList className="mt-2">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="users">사용자</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
                <TabsTrigger value="billing">결제</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="flex-1 p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">테넌트 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">기업명</h4>
                          <p>{selectedTenant.name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">이메일</h4>
                          <p>{selectedTenant.email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">플랜</h4>
                          <p className="capitalize">{selectedTenant.plan}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">상태</h4>
                          <Badge variant={selectedTenant.status === "active" ? "default" : "destructive"}>
                            {selectedTenant.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">생성일</h4>
                          <p>{new Date(selectedTenant.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">사용자 수</h4>
                          <p>{selectedTenant.users?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">리소스 사용량</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>API 호출</span>
                              <span>
                                {selectedTenant.usage?.apiCalls || 0} / {selectedTenant.quota?.maxApiCalls || 0}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((selectedTenant.usage?.apiCalls || 0) / (selectedTenant.quota?.maxApiCalls || 1)) *
                                      100,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>스토리지</span>
                              <span>
                                {formatBytes(selectedTenant.usage?.storage || 0)} /{" "}
                                {formatBytes(selectedTenant.quota?.maxStorage || 0)}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((selectedTenant.usage?.storage || 0) / (selectedTenant.quota?.maxStorage || 1)) *
                                      100,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">할당량</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>최대 사용자</span>
                            <span>{selectedTenant.quota?.maxUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>최대 에이전트</span>
                            <span>{selectedTenant.quota?.maxAgents || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>최대 워크플로우</span>
                            <span>{selectedTenant.quota?.maxWorkflows || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="users" className="flex-1 p-0 m-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">사용자 추가</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">이름</label>
                          <Input
                            placeholder="사용자 이름"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">이메일</label>
                          <Input
                            placeholder="user@company.com"
                            type="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">역할</label>
                          <select
                            className="w-full p-2 rounded-md border"
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                          >
                            <option value="admin">관리자</option>
                            <option value="user">일반 사용자</option>
                            <option value="readonly">읽기 전용</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleAddUser} disabled={!newUserData.name || !newUserData.email}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        사용자 추가
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-4">사용자 목록</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">이름</th>
                            <th className="text-left p-2">이메일</th>
                            <th className="text-left p-2">역할</th>
                            <th className="text-left p-2">상태</th>
                            <th className="text-left p-2">작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTenant.users?.map((user, index) => (
                            <tr key={user.id} className={index !== selectedTenant.users.length - 1 ? "border-b" : ""}>
                              <td className="p-2">{user.name}</td>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2 capitalize">{user.role}</td>
                              <td className="p-2">
                                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                  {user.status === "active" ? "활성" : "비활성"}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">테넌트 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">테넌트 상태</label>
                        <div className="flex items-center space-x-2">
                          <select
                            className="w-full p-2 rounded-md border"
                            value={selectedTenant.status}
                            onChange={(e) =>
                              updateTenantStatus(selectedTenant.id, e.target.value as "active" | "inactive")
                            }
                          >
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">데이터 보존 기간</label>
                        <select className="w-full p-2 rounded-md border">
                          <option value="30">30일</option>
                          <option value="60">60일</option>
                          <option value="90">90일</option>
                          <option value="180">180일</option>
                          <option value="365">365일</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">보안 설정</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="mfa" className="rounded" />
                            <label htmlFor="mfa">다중 인증(MFA) 필수</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="ip-restrict" className="rounded" />
                            <label htmlFor="ip-restrict">IP 제한 활성화</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="session-timeout" className="rounded" checked />
                            <label htmlFor="session-timeout">세션 타임아웃 (30분)</label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>
                        <Shield className="mr-2 h-4 w-4" />
                        설정 저장
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">API 키 관리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">프로덕션 API 키</h4>
                            <p className="text-xs text-muted-foreground">마지막 사용: 2시간 전</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Key className="mr-2 h-4 w-4" />
                            재생성
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">테스트 API 키</h4>
                            <p className="text-xs text-muted-foreground">마지막 사용: 3일 전</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Key className="mr-2 h-4 w-4" />
                            재생성
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="billing" className="flex-1 p-0 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">구독 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">현재 플랜</h4>
                          <p className="capitalize">{selectedTenant.plan}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">갱신일</h4>
                          <p>2024년 6월 15일</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">결제 상태</h4>
                          <Badge variant="default">정상</Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">결제 방법</h4>
                          <p>신용카드 (1234)</p>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between">
                        <Button variant="outline">플랜 변경</Button>
                        <Button variant="outline">
                          <CreditCard className="mr-2 h-4 w-4" />
                          결제 방법 관리
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">청구 내역</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">날짜</th>
                              <th className="text-left p-2">설명</th>
                              <th className="text-left p-2">금액</th>
                              <th className="text-left p-2">상태</th>
                              <th className="text-left p-2">인보이스</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2">2024-05-15</td>
                              <td className="p-2">월간 구독 - 프로페셔널</td>
                              <td className="p-2">$99.00</td>
                              <td className="p-2">
                                <Badge variant="default">결제 완료</Badge>
                              </td>
                              <td className="p-2">
                                <Button variant="ghost" size="sm">
                                  다운로드
                                </Button>
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">2024-04-15</td>
                              <td className="p-2">월간 구독 - 프로페셔널</td>
                              <td className="p-2">$99.00</td>
                              <td className="p-2">
                                <Badge variant="default">결제 완료</Badge>
                              </td>
                              <td className="p-2">
                                <Button variant="ghost" size="sm">
                                  다운로드
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="p-2">2024-03-15</td>
                              <td className="p-2">월간 구독 - 프로페셔널</td>
                              <td className="p-2">$99.00</td>
                              <td className="p-2">
                                <Badge variant="default">결제 완료</Badge>
                              </td>
                              <td className="p-2">
                                <Button variant="ghost" size="sm">
                                  다운로드
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">테넌트를 선택하세요</h3>
              <p className="text-muted-foreground max-w-md">
                왼쪽 패널에서 테넌트를 선택하거나 새 테넌트를 생성하세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
