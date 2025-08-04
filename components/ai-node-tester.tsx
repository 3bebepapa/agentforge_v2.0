"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, Copy, AlertCircle, CheckCircle2 } from "lucide-react"
import { getAINodeDefinition } from "@/lib/ai-node-library"
import type { AINodeParameter } from "@/lib/ai-node-types"

interface AINodeTesterProps {
  nodeId: string
  apiKey: string
}

export function AINodeTester({ nodeId, apiKey }: AINodeTesterProps) {
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // AI 노드 정의 가져오기
  const nodeDef = getAINodeDefinition(nodeId)

  if (!nodeDef) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>노드 정의를 찾을 수 없습니다: {nodeId}</AlertDescription>
      </Alert>
    )
  }

  // 노드 실행 처리
  const handleRunNode = async () => {
    if (!apiKey) {
      setError("API 키가 필요합니다.")
      return
    }

    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      // 노드 실행
      const nodeResult = await nodeDef.execute(inputs, { ...parameters, apiKey })
      setResult(nodeResult)
    } catch (err: any) {
      console.error("노드 실행 오류:", err)
      setError(err.message || "노드 실행 중 오류가 발생했습니다.")
    } finally {
      setIsRunning(false)
    }
  }

  // 입력 값 업데이트 처리
  const handleInputChange = (inputId: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [inputId]: value,
    }))
  }

  // 파라미터 값 업데이트 처리
  const handleParameterChange = (paramName: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }))
  }

  // 파라미터 렌더링
  const renderParameterInput = (param: AINodeParameter) => {
    switch (param.type) {
      case "select":
        return (
          <Select
            value={parameters[param.name] || param.default || ""}
            onValueChange={(value) => handleParameterChange(param.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`${param.label} 선택`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">{parameters[param.name] || param.default}</span>
            </div>
            <Slider
              value={[parameters[param.name] || param.default || 0]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => handleParameterChange(param.name, value[0])}
            />
          </div>
        )

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={param.name}
              checked={parameters[param.name] || param.default || false}
              onChange={(e) => handleParameterChange(param.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor={param.name} className="text-sm">
              {param.label}
            </label>
          </div>
        )

      default:
        return (
          <Input
            value={parameters[param.name] || param.default || ""}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.description}
          />
        )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{nodeDef.name} 테스트</CardTitle>
        <CardDescription>{nodeDef.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inputs">
          <TabsList className="w-full">
            <TabsTrigger value="inputs" className="flex-1">
              입력
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex-1">
              파라미터
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1">
              결과
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-4 mt-4">
            {nodeDef.inputs.map((input) => (
              <div key={input.id} className="space-y-2">
                <Label htmlFor={input.id}>
                  {input.label}
                  {input.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {input.type === "string" ? (
                  <Textarea
                    id={input.id}
                    value={inputs[input.id] || ""}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    placeholder={input.description}
                    rows={4}
                  />
                ) : (
                  <Input
                    id={input.id}
                    value={inputs[input.id] || ""}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    placeholder={input.description}
                  />
                )}
                <p className="text-xs text-muted-foreground">{input.description}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4 mt-4">
            {nodeDef.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name}>
                  {param.label}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderParameterInput(param)}
                <p className="text-xs text-muted-foreground">{param.description}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            {isRunning ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">실행 중...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">실행 완료</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    복사
                  </Button>
                </div>

                <ScrollArea className="h-[300px] border rounded-md p-4">
                  {nodeDef.outputs.map((output) => (
                    <div key={output.id} className="mb-4">
                      <h4 className="font-medium text-sm mb-1">{output.label}</h4>
                      {typeof result[output.id] === "string" ? (
                        <div className="whitespace-pre-wrap text-sm">{result[output.id]}</div>
                      ) : (
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                          {JSON.stringify(result[output.id], null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>노드를 실행하여 결과를 확인하세요.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleRunNode} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                실행 중...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                노드 실행
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
