"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Code, FileCode, Play, Save, Folder, File, RefreshCw } from "lucide-react"

export default function CodeBuilderPage() {
  const [code, setCode] = useState(`// 코드를 입력하세요
function hello() {
  console.log("Hello, world!");
}

hello();`)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* 왼쪽 패널: 코드 에디터 */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Code className="h-5 w-5 mr-2 text-primary" />
                    <h2 className="font-semibold">코드빌더</h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      실행
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="code">
                  <TabsList>
                    <TabsTrigger value="code" className="text-xs">
                      <FileCode className="h-3.5 w-3.5 mr-1" />
                      코드
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs">
                      <Play className="h-3.5 w-3.5 mr-1" />
                      미리보기
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="mt-2">
                    <div className="border rounded-md">
                      <div className="bg-muted/30 p-2 border-b text-xs flex items-center">
                        <FileCode className="h-3.5 w-3.5 mr-1" />
                        main.js
                      </div>
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="font-mono text-sm min-h-[500px] border-0 rounded-none"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-2">
                    <div className="border rounded-md p-4 min-h-[500px]">
                      <pre className="font-mono text-sm">{`> Hello, world!`}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* 오른쪽 패널: 파일 탐색기 */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full border-l">
              <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">파일 탐색기</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-37px)]">
                <div className="p-2">
                  <div>
                    <div className="flex items-center p-1.5 rounded-md hover:bg-accent">
                      <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">프로젝트</span>
                    </div>

                    <div className="ml-4 mt-1 space-y-1">
                      <div className="flex items-center p-1.5 rounded-md bg-accent">
                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">main.js</span>
                      </div>
                      <div className="flex items-center p-1.5 rounded-md hover:bg-accent/50">
                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">utils.js</span>
                      </div>
                      <div className="flex items-center p-1.5 rounded-md hover:bg-accent/50">
                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">config.js</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
