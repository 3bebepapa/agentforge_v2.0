"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Trash } from "lucide-react"

interface PropertiesPanelProps {
  node: any
  onChange: (data: any) => void
}

export function PropertiesPanel({ node, onChange }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("general")

  // 노드 데이터 업데이트 핸들러
  const handleChange = (key: string, value: any) => {
    onChange({ ...node.data, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">
            일반
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">
            고급
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1">
            스타일
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="label">이름</Label>
            <Input
              id="label"
              value={node.data.label || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              placeholder="노드 이름"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={node.data.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="노드 설명"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">유형</Label>
            <Select value={node.type || "default"} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="노드 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">기본</SelectItem>
                <SelectItem value="input">입력</SelectItem>
                <SelectItem value="output">출력</SelectItem>
                <SelectItem value="process">처리</SelectItem>
                <SelectItem value="decision">결정</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input id="id" value={node.id} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">위치</Label>
            <div className="flex space-x-2">
              <Input id="position-x" value={node.position?.x || 0} disabled className="w-1/2" placeholder="X" />
              <Input id="position-y" value={node.position?.y || 0} disabled className="w-1/2" placeholder="Y" />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="draggable"
              checked={node.draggable !== false}
              onCheckedChange={(checked) => handleChange("draggable", checked)}
            />
            <Label htmlFor="draggable">드래그 가능</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="connectable"
              checked={node.connectable !== false}
              onCheckedChange={(checked) => handleChange("connectable", checked)}
            />
            <Label htmlFor="connectable">연결 가능</Label>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">배경색</Label>
            <div className="flex space-x-2">
              <Input
                id="backgroundColor"
                type="color"
                value={node.data.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={node.data.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borderColor">테두리색</Label>
            <div className="flex space-x-2">
              <Input
                id="borderColor"
                type="color"
                value={node.data.borderColor || "#000000"}
                onChange={(e) => handleChange("borderColor", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={node.data.borderColor || "#000000"}
                onChange={(e) => handleChange("borderColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">텍스트색</Label>
            <div className="flex space-x-2">
              <Input
                id="textColor"
                type="color"
                value={node.data.textColor || "#000000"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={node.data.textColor || "#000000"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="width">크기</Label>
            <div className="flex space-x-2">
              <Input
                id="width"
                type="number"
                placeholder="너비"
                value={node.data.width || ""}
                onChange={(e) => handleChange("width", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                className="w-1/2"
              />
              <Input
                id="height"
                type="number"
                placeholder="높이"
                value={node.data.height || ""}
                onChange={(e) => handleChange("height", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                className="w-1/2"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" size="sm" className="text-destructive">
          <Trash className="h-4 w-4 mr-1" />
          삭제
        </Button>
        <Button size="sm">
          <Save className="h-4 w-4 mr-1" />
          적용
        </Button>
      </div>
    </div>
  )
}
