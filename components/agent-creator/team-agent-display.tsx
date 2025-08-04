"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, User, Settings, Play, Wrench, FileText, Terminal, Edit, X, Plus } from "lucide-react"

interface TeamMember {
  name: string
  role: string
  description: string
  promptTemplate: string
  code: string
  tools: AgentTool[]
}

interface AgentTool {
  id: string
  name: string
  description: string
  type: "api" | "ui" | "automation" | "integration"
  code: string
  config: Record<string, any>
  isActive: boolean
}

interface TeamAgentDisplayProps {
  teamMembers: TeamMember[]
  collaborationMethod: string
  sharedTools: AgentTool[]
  outputFormat: "console" | "markdown"
  onChangeOutputFormat: (format: "console" | "markdown") => void
  onMemberToolsChange: (memberIndex: number, tools: AgentTool[]) => void
  onSharedToolsChange: (tools: AgentTool[]) => void
}

export function TeamAgentDisplay({
  teamMembers,
  collaborationMethod,
  sharedTools,
  outputFormat,
  onChangeOutputFormat,
  onMemberToolsChange,
  onSharedToolsChange,
}: TeamAgentDisplayProps) {
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showToolDialog, setShowToolDialog] = useState(false)
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null)

  const selectedMember = selectedMemberIndex !== null ? teamMembers[selectedMemberIndex] : null

  const handleToolEdit = (memberIndex: number, toolIndex: number) => {
    setSelectedMemberIndex(memberIndex)
    setEditingToolIndex(toolIndex)
    setShowToolDialog(true)
  }

  const handleToolDelete = (memberIndex: number, toolIndex: number) => {
    const member = teamMembers[memberIndex]
    const updatedTools = member.tools.filter((_, index) => index !== toolIndex)
    onMemberToolsChange(memberIndex, updatedTools)
  }

  const handleSharedToolDelete = (toolIndex: number) => {
    const updatedTools = sharedTools.filter((_, index) => index !== toolIndex)
    onSharedToolsChange(updatedTools)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">팀 개요</TabsTrigger>
          <TabsTrigger value="members">팀원 상세</TabsTrigger>
          <TabsTrigger value="tools">공유 툴</TabsTrigger>
          <TabsTrigger value="collaboration">협업 방식</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <CardTitle className="text-sm">{member.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{member.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">전용 툴</span>
                      <Badge variant="secondary">{member.tools.length}개</Badge>
                    </div>

                    {member.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {member.tools.slice(0, 3).map((tool, toolIndex) => (
                          <Badge key={toolIndex} variant="outline" className="text-xs">
                            {tool.name}
                          </Badge>
                        ))}
                        {member.tools.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.tools.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3 bg-transparent"
                    onClick={() => setSelectedMemberIndex(index)}
                  >
                    상세 보기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {sharedTools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4" />팀 공유 툴 ({sharedTools.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sharedTools.map((tool, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tool.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {selectedMember ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedMember.name}</CardTitle>
                      <Button size="sm" variant="outline" onClick={() => setSelectedMemberIndex(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="outline">{selectedMember.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{selectedMember.description}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">프롬프트 템플릿</h4>
                        <div className="bg-gray-50 rounded p-3">
                          <pre className="text-xs whitespace-pre-wrap">{selectedMember.promptTemplate}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">전용 툴 ({selectedMember.tools.length}개)</CardTitle>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />툴 추가
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedMember.tools.map((tool, toolIndex) => (
                        <div key={tool.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {tool.type}
                            </Badge>
                            <span className="text-sm font-medium">{tool.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToolEdit(selectedMemberIndex!, toolIndex)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToolDelete(selectedMemberIndex!, toolIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {selectedMember.tools.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <Wrench className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">전용 툴이 없습니다</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">에이전트 코드</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={outputFormat === "console" ? "default" : "outline"}
                          onClick={() => onChangeOutputFormat("console")}
                        >
                          <Terminal className="h-3 w-3 mr-1" />
                          콘솔
                        </Button>
                        <Button
                          size="sm"
                          variant={outputFormat === "markdown" ? "default" : "outline"}
                          onClick={() => onChangeOutputFormat("markdown")}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          마크다운
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {outputFormat === "console" ? (
                        <pre className="text-xs whitespace-pre-wrap font-mono">{selectedMember.code}</pre>
                      ) : (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: formatMarkdown(selectedMember.code),
                          }}
                        />
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">팀원을 선택하세요</h3>
              <p className="text-muted-foreground">팀 개요에서 팀원을 선택하여 상세 정보를 확인하세요</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">팀 공유 툴</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  공유 툴 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sharedTools.map((tool, index) => (
                  <Card key={tool.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tool.type}</Badge>
                          <h4 className="font-medium">{tool.name}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleSharedToolDelete(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>

                      <div className="bg-gray-50 rounded p-3">
                        <pre className="text-xs whitespace-pre-wrap">{tool.code.substring(0, 200)}...</pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {sharedTools.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">공유 툴이 없습니다</h3>
                    <p className="text-sm">팀이 함께 사용할 공유 툴을 추가해보세요</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">팀 협업 방식</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">협업 프로세스</h4>
                  <p className="text-sm text-blue-800">{collaborationMethod}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">팀 구성</h4>
                    <ul className="space-y-1">
                      {teamMembers.map((member, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="font-medium">{member.name}</span>
                          <span className="text-muted-foreground">({member.role})</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">공유 리소스</h4>
                    <ul className="space-y-1">
                      <li className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>공유 툴: {sharedTools.length}개</span>
                      </li>
                      <li className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>
                          전체 툴:{" "}
                          {teamMembers.reduce((acc, member) => acc + member.tools.length, 0) + sharedTools.length}개
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 툴 편집 다이얼로그 */}
      <Dialog open={showToolDialog} onOpenChange={setShowToolDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>툴 편집</DialogTitle>
          </DialogHeader>
          {selectedMember && editingToolIndex !== null && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedMember.tools[editingToolIndex]?.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedMember.tools[editingToolIndex]?.description}</p>
              </div>

              <Textarea
                value={selectedMember.tools[editingToolIndex]?.code || ""}
                onChange={(e) => {
                  const updatedTools = [...selectedMember.tools]
                  updatedTools[editingToolIndex] = {
                    ...updatedTools[editingToolIndex],
                    code: e.target.value,
                  }
                  onMemberToolsChange(selectedMemberIndex!, updatedTools)
                }}
                rows={15}
                className="font-mono text-sm"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowToolDialog(false)}>
                  취소
                </Button>
                <Button onClick={() => setShowToolDialog(false)}>저장</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 마크다운 형식으로 변환하는 함수
function formatMarkdown(code: string): string {
  const highlighted = code
    .replace(
      /class\s+(\w+)/g,
      '<strong class="text-blue-600">class</strong> <strong class="text-green-600">$1</strong>',
    )
    .replace(
      /function\s+(\w+)/g,
      '<strong class="text-blue-600">function</strong> <strong class="text-green-600">$1</strong>',
    )
    .replace(
      /const\s+(\w+)/g,
      '<strong class="text-blue-600">const</strong> <strong class="text-purple-600">$1</strong>',
    )
    .replace(/let\s+(\w+)/g, '<strong class="text-blue-600">let</strong> <strong class="text-purple-600">$1</strong>')
    .replace(/var\s+(\w+)/g, '<strong class="text-blue-600">var</strong> <strong class="text-purple-600">$1</strong>')
    .replace(/\/\*\*([\s\S]*?)\*\//g, '<span class="text-green-500">/**$1*/</span>')
    .replace(/\/\/(.*)/g, '<span class="text-gray-500">// $1</span>')
    .replace(/return/g, '<strong class="text-blue-600">return</strong>')
    .replace(/if/g, '<strong class="text-blue-600">if</strong>')
    .replace(/else/g, '<strong class="text-blue-600">else</strong>')
    .replace(/for/g, '<strong class="text-blue-600">for</strong>')
    .replace(/while/g, '<strong class="text-blue-600">while</strong>')
    .replace(/this\./g, '<span class="text-red-500">this.</span>')
    .replace(/\n/g, "<br />")

  return `<pre class="bg-gray-100 p-4 rounded-md">${highlighted}</pre>`
}
