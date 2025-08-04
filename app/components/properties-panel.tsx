"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 속성 패널 컴포넌트
export function PropertiesPanel({ node, onChange }) {
  // 노드 유형에 따른 속성 렌더링
  const renderProperties = () => {
    switch (node.type) {
      case "promptNode":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="label">레이블</Label>
              <Input id="label" value={node.data.label || ""} onChange={(e) => onChange({ label: e.target.value })} />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="content">프롬프트 내용</Label>
              <Textarea
                id="content"
                rows={6}
                value={node.data.content || ""}
                onChange={(e) => onChange({ content: e.target.value })}
              />
            </div>
          </>
        )

      case "llmNode":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="label">레이블</Label>
              <Input id="label" value={node.data.label || ""} onChange={(e) => onChange({ label: e.target.value })} />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="model">모델</Label>
              <Select value={node.data.model || "gpt-4"} onValueChange={(value) => onChange({ model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={node.data.temperature || 0.7}
                onChange={(e) => onChange({ temperature: Number.parseFloat(e.target.value) })}
              />
            </div>
          </>
        )

      // 다른 노드 유형에 대한 속성 추가
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="label">레이블</Label>
            <Input id="label" value={node.data.label || ""} onChange={(e) => onChange({ label: e.target.value })} />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="font-medium">{node.data.label || node.type}</div>
      {renderProperties()}
    </div>
  )
}
