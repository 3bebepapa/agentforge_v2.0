"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Code, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// HTTP 요청 처리 클래스
class HttpClient {
  async request(method: string, url: string, headers: Record<string, string> = {}, body: any = null) {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }

      if (body) {
        options.body = typeof body === "string" ? body : JSON.stringify(body)
      }

      const response = await fetch(url, options)

      // 응답 데이터 파싱
      let data
      const contentType = response.headers.get("content-type")

      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else if (contentType?.includes("text/xml") || contentType?.includes("application/xml")) {
        const text = await response.text()
        // 간단한 XML 파싱 (실제 구현에서는 더 강력한 XML 파서 사용 권장)
        data = { xml: text, parsed: this.parseXml(text) }
      } else {
        data = await response.text()
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        ok: response.ok,
      }
    } catch (error) {
      throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 간단한 XML 파싱 함수
  private parseXml(xml: string) {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xml, "text/xml")
      return this.xmlToJson(xmlDoc)
    } catch (error) {
      return { error: "XML 파싱 실패" }
    }
  }

  // XML을 JSON으로 변환하는 함수
  private xmlToJson(xml: Document) {
    const result: Record<string, any> = {}

    function traverse(node: Element, obj: Record<string, any>) {
      // 속성 처리
      Array.from(node.attributes).forEach((attr) => {
        obj[`@${attr.name}`] = attr.value
      })

      // 자식 노드 처리
      if (node.hasChildNodes()) {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 1) {
            // 요소 노드
            const childElement = child as Element
            const childName = childElement.nodeName

            if (!obj[childName]) {
              obj[childName] = {}
              traverse(childElement, obj[childName])
            } else if (Array.isArray(obj[childName])) {
              const newChild = {}
              obj[childName].push(newChild)
              traverse(childElement, newChild)
            } else {
              const temp = obj[childName]
              obj[childName] = [temp, {}]
              traverse(childElement, obj[childName][1])
            }
          } else if (child.nodeType === 3 && child.nodeValue?.trim()) {
            // 텍스트 노드
            obj["#text"] = child.nodeValue?.trim()
          }
        })
      }
    }

    if (xml.documentElement) {
      const rootName = xml.documentElement.nodeName
      result[rootName] = {}
      traverse(xml.documentElement, result[rootName])
    }

    return result
  }
}

// 응답 변환 클래스
class ResponseTransformer {
  transform(response: any, transformRules: TransformRules) {
    if (!response || !transformRules) return response

    try {
      const result = JSON.parse(JSON.stringify(response)) // 깊은 복사

      // 필드 이름 변경
      if (transformRules.renameFields) {
        for (const [oldName, newName] of Object.entries(transformRules.renameFields)) {
          if (result.data && oldName in result.data) {
            result.data[newName] = result.data[oldName]
            delete result.data[oldName]
          }
        }
      }

      // 필드 필터링
      if (transformRules.filterFields && Array.isArray(transformRules.filterFields)) {
        if (result.data) {
          const filteredData: Record<string, any> = {}
          transformRules.filterFields.forEach((field) => {
            if (field in result.data) {
              filteredData[field] = result.data[field]
            }
          })
          result.data = filteredData
        }
      }

      // 데이터 변환
      if (transformRules.dataTransformations) {
        for (const [field, transformation] of Object.entries(transformRules.dataTransformations)) {
          if (result.data && field in result.data) {
            const value = result.data[field]

            switch (transformation.type) {
              case "stringToDate":
                result.data[field] = new Date(value)
                break
              case "numberToString":
                result.data[field] = String(value)
                break
              case "stringToNumber":
                result.data[field] = Number(value)
                break
              case "toUpperCase":
                if (typeof value === "string") {
                  result.data[field] = value.toUpperCase()
                }
                break
              case "toLowerCase":
                if (typeof value === "string") {
                  result.data[field] = value.toLowerCase()
                }
                break
            }
          }
        }
      }

      return result
    } catch (error) {
      console.error("Transform error:", error)
      return response // 변환 실패 시 원본 반환
    }
  }
}

// 타입 정의
interface TransformRules {
  renameFields?: Record<string, string>
  filterFields?: string[]
  dataTransformations?: Record<string, { type: string; format?: string }>
}

// 메인 컴포넌트
export default function HttpRequestHandler() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1")
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [body, setBody] = useState("")
  const [transformRules, setTransformRules] = useState(
    '{\n  "renameFields": {\n    "title": "heading",\n    "body": "content"\n  },\n  "filterFields": ["heading", "content", "id"]\n}',
  )

  const [response, setResponse] = useState<any>(null)
  const [transformedResponse, setTransformedResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("request")

  const httpClient = new HttpClient()
  const responseTransformer = new ResponseTransformer()

  const handleSendRequest = async () => {
    setLoading(true)
    setError(null)

    try {
      // 헤더 파싱
      let parsedHeaders = {}
      try {
        parsedHeaders = headers ? JSON.parse(headers) : {}
      } catch (e) {
        throw new Error("헤더 형식이 올바르지 않습니다. 유효한 JSON 형식이어야 합니다.")
      }

      // 바디 파싱
      let parsedBody = null
      if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        try {
          parsedBody = JSON.parse(body)
        } catch (e) {
          throw new Error("요청 바디 형식이 올바르지 않습니다. 유효한 JSON 형식이어야 합니다.")
        }
      }

      // 요청 전송
      const result = await httpClient.request(method, url, parsedHeaders, parsedBody)
      setResponse(result)

      // 응답 변환
      try {
        const rules = transformRules ? JSON.parse(transformRules) : null
        if (rules) {
          const transformed = responseTransformer.transform(result, rules)
          setTransformedResponse(transformed)
        } else {
          setTransformedResponse(result)
        }
      } catch (e) {
        console.error("변환 규칙 파싱 오류:", e)
        setTransformedResponse(result)
        setError("변환 규칙 형식이 올바르지 않습니다. 유효한 JSON 형식이어야 합니다.")
      }

      setActiveTab("response")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">HTTP 요청 처리 및 응답 변환 컴포넌트</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="request">요청 설정</TabsTrigger>
          <TabsTrigger value="response">응답 결과</TabsTrigger>
          <TabsTrigger value="transform">변환 규칙</TabsTrigger>
        </TabsList>

        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>HTTP 요청 설정</CardTitle>
              <CardDescription>요청 메서드, URL, 헤더, 바디를 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">메서드</label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="메서드 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <label className="text-sm font-medium mb-1 block">URL</label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/api/resource"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">헤더 (JSON 형식)</label>
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              {(method === "POST" || method === "PUT" || method === "PATCH") && (
                <div>
                  <label className="text-sm font-medium mb-1 block">요청 바디 (JSON 형식)</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"name": "John Doe", "email": "john@example.com"}'
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendRequest} disabled={loading}>
                {loading ? (
                  <>로딩 중...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    요청 보내기
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="transform">
          <Card>
            <CardHeader>
              <CardTitle>응답 변환 규칙</CardTitle>
              <CardDescription>응답 데이터를 변환하기 위한 규칙을 JSON 형식으로 설정하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={transformRules}
                onChange={(e) => setTransformRules(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">변환 규칙 예시:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <code className="text-xs bg-muted p-1 rounded">renameFields</code>: 필드 이름 변경 (예: title →
                    heading)
                  </li>
                  <li>
                    <code className="text-xs bg-muted p-1 rounded">filterFields</code>: 지정된 필드만 포함
                  </li>
                  <li>
                    <code className="text-xs bg-muted p-1 rounded">dataTransformations</code>: 데이터 타입 변환 (예:
                    문자열 → 날짜)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>원본 응답</CardTitle>
                <CardDescription>서버로부터 받은 원본 응답 데이터</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {response ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={response.ok ? "default" : "destructive"}>
                        {response.status} {response.statusText}
                      </Badge>
                      {response.ok && <Check className="h-4 w-4 text-green-500" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">응답 헤더:</h4>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(response.headers, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">응답 데이터:</h4>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-80">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>요청을 보내면 응답이 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>변환된 응답</CardTitle>
                <CardDescription>변환 규칙이 적용된 응답 데이터</CardDescription>
              </CardHeader>
              <CardContent>
                {transformedResponse ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={transformedResponse.ok ? "default" : "destructive"}>
                        {transformedResponse.status} {transformedResponse.statusText}
                      </Badge>
                      {transformedResponse.ok && <Check className="h-4 w-4 text-green-500" />}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">변환된 데이터:</h4>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-80">
                        {JSON.stringify(transformedResponse.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>요청을 보내면 변환된 응답이 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
