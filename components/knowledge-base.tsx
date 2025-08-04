"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Database, FileText, Search, Upload, Plus, Trash, FileUp, MessageSquare } from "lucide-react"

interface KnowledgeBaseProps {
  apiKey?: string
}

export function KnowledgeBase({ apiKey }: KnowledgeBaseProps) {
  const [documents, setDocuments] = useState([
    {
      id: "doc-1",
      title: "제품 반품 정책",
      content: "제품 구매 후 30일 이내에 영수증과 함께 반품하시면 전액 환불해 드립니다...",
      type: "policy",
      tags: ["반품", "환불", "정책"],
      createdAt: "2023-05-15T09:30:00Z",
    },
    {
      id: "doc-2",
      title: "고객 서비스 매뉴얼",
      content: "고객 문의 응대 시 항상 친절하고 명확하게 답변해야 합니다...",
      type: "manual",
      tags: ["고객 서비스", "매뉴얼", "응대"],
      createdAt: "2023-06-20T14:45:00Z",
    },
    {
      id: "doc-3",
      title: "제품 사양서: 스마트 홈 허브",
      content: "스마트 홈 허브는 다양한 IoT 기기를 연결하고 제어할 수 있는 중앙 장치입니다...",
      type: "specification",
      tags: ["제품", "스마트 홈", "사양"],
      createdAt: "2023-07-10T11:15:00Z",
    },
  ])

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    type: "policy",
    tags: "",
  })
  const [activeTab, setActiveTab] = useState("documents")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [ragQuery, setRagQuery] = useState("")

  const selectedDocument = documents.find((d) => d.id === selectedDocumentId)

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreateDocument = () => {
    if (!newDocument.title || !newDocument.content) return

    const newDoc = {
      id: `doc-${documents.length + 1}`,
      title: newDocument.title,
      content: newDocument.content,
      type: newDocument.type,
      tags: newDocument.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    }

    setDocuments([...documents, newDoc])
    setSelectedDocumentId(newDoc.id)

    // Reset form
    setNewDocument({
      title: "",
      content: "",
      type: "policy",
      tags: "",
    })
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
    if (selectedDocumentId === id) {
      setSelectedDocumentId(null)
    }
  }

  const handleExecuteRAGQuery = () => {
    if (!ragQuery.trim()) return

    // Simulate RAG query execution
    setTimeout(() => {
      setQueryResult({
        answer:
          "제품 반품은 구매 후 30일 이내에 영수증과 함께 가능합니다. 전액 환불이 가능하며, 제품에 손상이 없어야 합니다.",
        sources: [
          { documentId: "doc-1", title: "제품 반품 정책", relevance: 0.95 },
          { documentId: "doc-3", title: "제품 사양서: 스마트 홈 허브", relevance: 0.42 },
        ],
      })
    }, 1500)
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={25} minSize={20}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-4">지식 베이스</h2>
            <Input
              placeholder="문서 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="documents" className="flex-1">
                  문서
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1">
                  업로드
                </TabsTrigger>
                <TabsTrigger value="rag" className="flex-1">
                  RAG 쿼리
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {activeTab === "documents" && (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                        selectedDocumentId === doc.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedDocumentId(doc.id)}
                    >
                      <CardHeader className="p-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-primary" />
                            {doc.title}
                          </CardTitle>
                          <Badge variant="outline">{doc.type}</Badge>
                        </div>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {doc.content.substring(0, 100)}...
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-3 pt-0 flex justify-between">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === "upload" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">새 문서 추가</CardTitle>
                    <CardDescription>지식 베이스에 새 문서를 추가합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">제목</label>
                      <Input
                        placeholder="문서 제목"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">내용</label>
                      <Textarea
                        placeholder="문서 내용"
                        value={newDocument.content}
                        onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                        rows={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">유형</label>
                      <select
                        className="w-full p-2 rounded-md border"
                        value={newDocument.type}
                        onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                      >
                        <option value="policy">정책</option>
                        <option value="manual">매뉴얼</option>
                        <option value="specification">사양서</option>
                        <option value="faq">FAQ</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">태그 (쉼표로 구분)</label>
                      <Input
                        placeholder="태그1, 태그2, 태그3"
                        value={newDocument.tags}
                        onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <FileUp className="mr-2 h-4 w-4" />
                      파일 업로드
                    </Button>
                    <Button onClick={handleCreateDocument} disabled={!newDocument.title || !newDocument.content}>
                      <Plus className="mr-2 h-4 w-4" />
                      문서 추가
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {activeTab === "rag" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">RAG 쿼리</CardTitle>
                    <CardDescription>지식 베이스를 기반으로 질문에 답변합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">질문</label>
                      <Textarea
                        placeholder="질문을 입력하세요..."
                        value={ragQuery}
                        onChange={(e) => setRagQuery(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {queryResult && (
                      <div className="space-y-2 border rounded-md p-3">
                        <h4 className="text-sm font-medium">답변</h4>
                        <p className="text-sm">{queryResult.answer}</p>

                        <h4 className="text-sm font-medium mt-4">참조 문서</h4>
                        <ul className="space-y-1">
                          {queryResult.sources.map((source: any, index: number) => (
                            <li key={index} className="text-sm flex items-center justify-between">
                              <span>{source.title}</span>
                              <Badge variant="outline">{(source.relevance * 100).toFixed(0)}%</Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleExecuteRAGQuery} disabled={!ragQuery.trim()}>
                      <Search className="mr-2 h-4 w-4" />
                      쿼리 실행
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={75}>
        {selectedDocument ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="font-semibold">{selectedDocument.title}</h2>
                <Badge variant="outline" className="ml-2">
                  {selectedDocument.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  RAG 쿼리
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  내보내기
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{selectedDocument.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    생성일: {new Date(selectedDocument.createdAt).toLocaleString()}
                  </p>
                  <div className="prose max-w-none">
                    <p>{selectedDocument.content}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">문서를 선택하세요</h3>
              <p className="text-muted-foreground max-w-md">왼쪽 패널에서 문서를 선택하거나 새 문서를 추가하세요.</p>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
