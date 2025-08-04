"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Wrench, Plus, Play, X, Edit, Download, Sparkles, Code, Loader2, FileCode, Zap } from "lucide-react"
import { useComponentAutomator } from "@/hooks/use-component-automator"

interface AgentTool {
  id: string
  name: string
  description: string
  type: "api" | "ui" | "automation" | "integration"
  code: string
  config: Record<string, any>
  isActive: boolean
}

interface AgentToolsManagerProps {
  tools: AgentTool[]
  onToolsChange: (tools: AgentTool[]) => void
  agentDescription: string
  agentType: string
}

export function AgentToolsManager({ tools, onToolsChange, agentDescription, agentType }: AgentToolsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    type: "ui" as const,
    code: "",
  })

  // 컴포넌트 자동화 툴 연동
  const { components, generateComponent, selectComponent } = useComponentAutomator()

  // AI 툴 생성
  const generateAITools = async () => {
    setIsGenerating(true)
    try {
      const generatedTools = await generateToolsForAgent(agentDescription, agentType)
      onToolsChange([...tools, ...generatedTools])
    } catch (error) {
      console.error("AI 툴 생성 오류:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 에이전트별 툴 생성 로직
  const generateToolsForAgent = async (description: string, type: string): Promise<AgentTool[]> => {
    const generatedTools: AgentTool[] = []

    if (description.includes("하이브리드") || description.includes("앱") || description.includes("모바일")) {
      generatedTools.push({
        id: `tool-${Date.now()}-1`,
        name: "APK 빌더",
        description: "React Native 앱을 APK로 빌드하는 도구",
        type: "automation",
        code: generateAPKBuilderCode(),
        config: {
          parameters: ["projectPath", "buildType", "outputPath"],
          apiEndpoints: ["/api/build/apk"],
          uiComponents: ["BuildForm", "ProgressIndicator", "DownloadButton"],
        },
        isActive: true,
      })

      generatedTools.push({
        id: `tool-${Date.now()}-2`,
        name: "크로스플랫폼 테스터",
        description: "iOS/Android 동시 테스트 도구",
        type: "ui",
        code: generateCrossPlatformTesterCode(),
        config: {
          parameters: ["testSuite", "platforms", "devices"],
          apiEndpoints: ["/api/test/cross-platform"],
          uiComponents: ["TestRunner", "ResultViewer", "DeviceSelector"],
        },
        isActive: true,
      })

      generatedTools.push({
        id: `tool-${Date.now()}-3`,
        name: "Google API 통합기",
        description: "Google 서비스 API 통합 도구",
        type: "integration",
        code: generateGoogleAPIIntegratorCode(),
        config: {
          parameters: ["apiKey", "serviceType", "credentials"],
          apiEndpoints: ["/api/google/integrate"],
          uiComponents: ["APIKeyManager", "ServiceSelector", "TestConsole"],
        },
        isActive: true,
      })
    }

    if (description.includes("웹") || description.includes("프론트엔드") || description.includes("React")) {
      generatedTools.push({
        id: `tool-${Date.now()}-4`,
        name: "컴포넌트 생성기",
        description: "React 컴포넌트 자동 생성 도구",
        type: "ui",
        code: generateComponentGeneratorCode(),
        config: {
          parameters: ["componentName", "props", "styling"],
          apiEndpoints: ["/api/generate/component"],
          uiComponents: ["ComponentForm", "CodePreview", "ExportButton"],
        },
        isActive: true,
      })
    }

    if (description.includes("백엔드") || description.includes("API") || description.includes("서버")) {
      generatedTools.push({
        id: `tool-${Date.now()}-5`,
        name: "API 엔드포인트 생성기",
        description: "REST API 엔드포인트 자동 생성",
        type: "automation",
        code: generateAPIEndpointGeneratorCode(),
        config: {
          parameters: ["endpoint", "method", "schema"],
          apiEndpoints: ["/api/generate/endpoint"],
          uiComponents: ["EndpointForm", "SchemaEditor", "TestClient"],
        },
        isActive: true,
      })
    }

    if (description.includes("데이터") || description.includes("분석") || description.includes("차트")) {
      generatedTools.push({
        id: `tool-${Date.now()}-6`,
        name: "데이터 시각화 도구",
        description: "데이터를 차트로 시각화하는 도구",
        type: "ui",
        code: generateDataVisualizationCode(),
        config: {
          parameters: ["dataSource", "chartType", "options"],
          apiEndpoints: ["/api/data/visualize"],
          uiComponents: ["ChartBuilder", "DataUploader", "ExportChart"],
        },
        isActive: true,
      })
    }

    return generatedTools
  }

  // 새 툴 생성
  const handleCreateTool = () => {
    if (!newTool.name || !newTool.description) return

    const tool: AgentTool = {
      id: `tool-${Date.now()}`,
      name: newTool.name,
      description: newTool.description,
      type: newTool.type,
      code: newTool.code || generateBasicToolCode(newTool.name, newTool.type),
      config: {
        parameters: [],
        apiEndpoints: [],
        uiComponents: [],
      },
      isActive: true,
    }

    onToolsChange([...tools, tool])
    setNewTool({ name: "", description: "", type: "ui", code: "" })
    setShowCreateDialog(false)
  }

  // 컴포넌트 자동화 툴에서 가져오기
  const handleImportFromComponents = (componentId: string) => {
    const component = components.find((c) => c.id === componentId)
    if (!component) return

    const tool: AgentTool = {
      id: `tool-${Date.now()}`,
      name: component.name,
      description: component.description,
      type: "ui",
      code: component.code,
      config: {
        parameters: component.features,
        apiEndpoints: [],
        uiComponents: [component.name],
      },
      isActive: true,
    }

    onToolsChange([...tools, tool])
    setShowImportDialog(false)
  }

  // 툴 편집
  const handleEditTool = (tool: AgentTool) => {
    setEditingTool(tool)
    setShowEditDialog(true)
  }

  // 툴 삭제
  const handleDeleteTool = (toolId: string) => {
    onToolsChange(tools.filter((t) => t.id !== toolId))
  }

  // 툴 활성화/비활성화
  const handleToggleTool = (toolId: string) => {
    onToolsChange(tools.map((t) => (t.id === toolId ? { ...t, isActive: !t.isActive } : t)))
  }

  return (
    <div className="space-y-4">
      {/* 툴 목록 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">에이전트 툴 ({tools.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateAITools} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                AI 생성
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                AI 생성
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            <Download className="h-4 w-4 mr-1" />
            가져오기
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />새 툴
          </Button>
        </div>
      </div>

      {/* 툴 목록 */}
      {tools.length > 0 ? (
        <div className="space-y-3">
          {tools.map((tool) => (
            <Card key={tool.id} className={`${!tool.isActive ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tool.type}</Badge>
                    <h4 className="font-medium">{tool.name}</h4>
                    {tool.isActive && (
                      <Badge variant="default" className="text-xs">
                        활성화
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleToggleTool(tool.id)}>
                      <Zap className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditTool(tool)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteTool(tool.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>

                {/* 툴 미리보기 */}
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">코드 미리보기</span>
                    <Button size="sm" variant="ghost">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                  <pre className="text-xs overflow-hidden">{tool.code.substring(0, 150)}...</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">툴이 없습니다</h3>
          <p className="text-muted-foreground mb-4">에이전트가 사용할 툴을 생성하거나 가져와보세요</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={generateAITools} disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-1" />
              AI로 생성
            </Button>
            <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              직접 생성
            </Button>
          </div>
        </div>
      )}

      {/* 새 툴 생성 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>새 툴 생성</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="기본 정보" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="기본 정보">기본 정보</TabsTrigger>
              <TabsTrigger value="코드">코드</TabsTrigger>
              <TabsTrigger value="설정">설정</TabsTrigger>
            </TabsList>

            <TabsContent value="기본 정보" className="space-y-4">
              <div>
                <label className="text-sm font-medium">툴 이름</label>
                <Input
                  value={newTool.name}
                  onChange={(e) => setNewTool((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="툴 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">설명</label>
                <Textarea
                  value={newTool.description}
                  onChange={(e) => setNewTool((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="툴의 기능과 용도를 설명하세요"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">툴 타입</label>
                <Select
                  value={newTool.type}
                  onValueChange={(value: any) => setNewTool((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="툴 타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui">UI 컴포넌트</SelectItem>
                    <SelectItem value="api">API 도구</SelectItem>
                    <SelectItem value="automation">자동화 도구</SelectItem>
                    <SelectItem value="integration">통합 도구</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="코드" className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">코드</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setNewTool((prev) => ({
                      ...prev,
                      code: generateBasicToolCode(prev.name, prev.type),
                    }))
                  }
                >
                  <Code className="h-4 w-4 mr-1" />
                  기본 코드 생성
                </Button>
              </div>
              <Textarea
                value={newTool.code}
                onChange={(e) => setNewTool((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="툴의 코드를 입력하세요"
                rows={15}
                className="font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="설정" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">자동 실행</span>
                  <Button variant="outline" size="sm">
                    활성화
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">에러 시 재시도</span>
                  <Button variant="outline" size="sm">
                    설정
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">실시간 코드 업데이트</span>
                  <Button variant="outline" size="sm">
                    설정
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">로그 레벨</span>
                  <Select defaultValue="Info">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Debug">Debug</SelectItem>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreateTool}>생성</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 컴포넌트 가져오기 다이얼로그 */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>컴포넌트 자동화 툴에서 가져오기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {components.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {components.map((component) => (
                    <Card key={component.id} className="cursor-pointer hover:bg-accent">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                            <div className="flex gap-1 mt-2">
                              {component.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleImportFromComponents(component.id)}>
                            가져오기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <FileCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">가져올 수 있는 컴포넌트가 없습니다</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 툴 편집 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>툴 편집</DialogTitle>
          </DialogHeader>
          {editingTool && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">툴 이름</label>
                <Input
                  value={editingTool.name}
                  onChange={(e) => setEditingTool((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">설명</label>
                <Textarea
                  value={editingTool.description}
                  onChange={(e) => setEditingTool((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">코드</label>
                <Textarea
                  value={editingTool.code}
                  onChange={(e) => setEditingTool((prev) => (prev ? { ...prev, code: e.target.value } : null))}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  취소
                </Button>
                <Button
                  onClick={() => {
                    if (editingTool) {
                      onToolsChange(tools.map((t) => (t.id === editingTool.id ? editingTool : t)))
                      setShowEditDialog(false)
                      setEditingTool(null)
                    }
                  }}
                >
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 기본 툴 코드 생성 함수
function generateBasicToolCode(name: string, type: string): string {
  const componentName = name.replace(/\s+/g, "")

  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ${componentName}() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');

  const handleExecute = async () => {
    setIsProcessing(true);
    try {
      // 툴 실행 로직
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult('작업이 완료되었습니다!');
    } catch (error) {
      setResult('오류가 발생했습니다: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>${name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="입력값을 넣어주세요" />
        <Button 
          onClick={handleExecute} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? '처리 중...' : '실행'}
        </Button>
        {result && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ${componentName};`
}

// 툴 코드 생성 함수들
function generateAPKBuilderCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function APKBuilder() {
  const [projectPath, setProjectPath] = useState('');
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleBuild = async () => {
    setIsBuilding(true);
    setBuildProgress(0);
    
    const steps = [
      'Dependencies 설치 중...',
      'React Native 번들링...',
      'Android 빌드 시작...',
      'APK 생성 중...',
      '빌드 완료!'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBuildProgress((i + 1) * 20);
    }
    
    setDownloadUrl('/downloads/app-release.apk');
    setIsBuilding(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>APK 빌더</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="프로젝트 경로"
          value={projectPath}
          onChange={(e) => setProjectPath(e.target.value)}
        />
        
        {isBuilding && (
          <div className="space-y-2">
            <Progress value={buildProgress} />
            <p className="text-sm text-muted-foreground">빌드 진행 중... {buildProgress}%</p>
          </div>
        )}
        
        <Button 
          onClick={handleBuild} 
          disabled={!projectPath || isBuilding}
          className="w-full"
        >
          {isBuilding ? '빌드 중...' : 'APK 빌드'}
        </Button>
        
        {downloadUrl && (
          <Button variant="outline" className="w-full bg-transparent">
            <a href={downloadUrl} download>APK 다운로드</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateCrossPlatformTesterCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CrossPlatformTester() {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const platforms = ['iOS', 'Android', 'Web'];

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const platform of selectedPlatforms) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTestResults(prev => [...prev, {
        platform,
        status: Math.random() > 0.2 ? 'passed' : 'failed',
        tests: Math.floor(Math.random() * 50) + 20,
        time: Math.floor(Math.random() * 30) + 10
      }]);
    }
    
    setIsRunning(false);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>크로스플랫폼 테스터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">테스트 플랫폼 선택</label>
          <div className="flex gap-2 mt-2">
            {platforms.map(platform => (
              <Button
                key={platform}
                variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPlatforms(prev => 
                    prev.includes(platform) 
                      ? prev.filter(p => p !== platform)
                      : [...prev, platform]
                  );
                }}
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={runTests} 
          disabled={selectedPlatforms.length === 0 || isRunning}
          className="w-full"
        >
          {isRunning ? '테스트 실행 중...' : '테스트 시작'}
        </Button>
        
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">테스트 결과</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span>{result.platform}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={result.status === 'passed' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {result.tests} tests, {result.time}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateGoogleAPIIntegratorCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GoogleAPIIntegrator() {
  const [apiKey, setApiKey] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const services = [
    'Google Maps API',
    'Google Drive API',
    'Google Sheets API',
    'Google Calendar API',
    'Google Cloud Storage',
    'Firebase Auth'
  ];

  const testConnection = async () => {
    setIsConnecting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3;
    setTestResult(success 
      ? \`✅ \${serviceType} 연결 성공! API 키가 유효합니다.\`
      : \`❌ \${serviceType} 연결 실패. API 키를 확인해주세요.\`
    );
    
    setIsConnecting(false);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Google API 통합기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Google API 키"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger>
            <SelectValue placeholder="서비스 선택" />
          </SelectTrigger>
          <SelectContent>
            {services.map(service => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={testConnection} 
          disabled={!apiKey || !serviceType || isConnecting}
          className="w-full"
        >
          {isConnecting ? '연결 테스트 중...' : '연결 테스트'}
        </Button>
        
        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateComponentGeneratorCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ComponentGenerator() {
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState('');
  const [props, setProps] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const componentTypes = ['Functional Component', 'Class Component', 'Hook', 'Context'];

  const generateComponent = () => {
    const propsArray = props.split(',').map(p => p.trim()).filter(Boolean);
    
    const code = \`import React from 'react';

interface \${componentName}Props {
\${propsArray.map(prop => \`  \${prop}: any;\`).join('\\n')}
}

export function \${componentName}({ \${propsArray.join(', ')} }: \${componentName}Props) {
  return (
    <div className="\${componentName.toLowerCase()}">
      <h1>\${componentName} Component</h1>
      \${propsArray.map(prop => \`<p>\${prop}: {\${prop}}</p>\`).join('\\n      ')}
    </div>
  );
}\`;
    
    setGeneratedCode(code);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>React 컴포넌트 생성기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="컴포넌트 이름"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        />
        
        <Select value={componentType} onValueChange={setComponentType}>
          <SelectTrigger>
            <SelectValue placeholder="컴포넌트 타입" />
          </SelectTrigger>
          <SelectContent>
            {componentTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Props (쉼표로 구분)"
          value={props}
          onChange={(e) => setProps(e.target.value)}
        />
        
        <Button 
          onClick={generateComponent} 
          disabled={!componentName || !componentType}
          className="w-full"
        >
          컴포넌트 생성
        </Button>
        
        {generatedCode && (
          <Textarea
            value={generatedCode}
            readOnly
            rows={15}
            className="font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateAPIEndpointGeneratorCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function APIEndpointGenerator() {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('');
  const [schema, setSchema] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const generateEndpoint = () => {
    const code = \`// \${endpoint} API 엔드포인트
import { NextRequest, NextResponse } from 'next/server';

export async function \${method}(request: NextRequest) {
  try {
    \${method === 'GET' ? \`
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await fetchData(id);
    return NextResponse.json({ success: true, data });
    \` : \`
    const body = await request.json();
    const result = await processData(body);
    return NextResponse.json({ success: true, result });
    \`}
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}\`;
    
    setGeneratedCode(code);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API 엔드포인트 생성기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="엔드포인트 경로 (예: /api/users)"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
        
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger>
            <SelectValue placeholder="HTTP 메서드" />
          </SelectTrigger>
          <SelectContent>
            {methods.map(m => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={generateEndpoint} 
          disabled={!endpoint || !method}
          className="w-full"
        >
          API 엔드포인트 생성
        </Button>
        
        {generatedCode && (
          <Textarea
            value={generatedCode}
            readOnly
            rows={20}
            className="font-mono text-sm"
          />
        )}
      </CardContent>
    </Card>
  );
}`
}

function generateDataVisualizationCode(): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DataVisualization() {
  const [dataSource, setDataSource] = useState('');
  const [chartType, setChartType] = useState('');
  const [chartData, setChartData] = useState(null);

  const chartTypes = ['Bar Chart', 'Line Chart', 'Pie Chart', 'Scatter Plot'];

  const generateChart = () => {
    // 샘플 데이터 생성
    const sampleData = Array.from({ length: 10 }, (_, i) => ({
      x: i + 1,
      y: Math.floor(Math.random() * 100)
    }));
    
    setChartData(sampleData);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>데이터 시각화 도구</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="데이터 소스 URL"
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value)}
        />
        
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger>
            <SelectValue placeholder="차트 타입" />
          </SelectTrigger>
          <SelectContent>
            {chartTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={generateChart} 
          disabled={!dataSource || !chartType}
          className="w-full"
        >
          차트 생성
        </Button>
        
        {chartData && (
          <div className="p-4 border rounded-md">
            <h4 className="font-medium mb-2">{chartType}</h4>
            <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
              <span className="text-sm text-muted-foreground">
                차트 미리보기 ({chartData.length}개 데이터 포인트)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}`
}
