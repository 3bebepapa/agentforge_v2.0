"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Settings, Save, RotateCcw, Copy, Trash2 } from "lucide-react"

interface PropertyField {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "select" | "textarea" | "slider"
  value: any
  options?: string[]
  min?: number
  max?: number
  step?: number
  description?: string
  required?: boolean
}

interface SelectedItem {
  id: string
  name: string
  type: string
  properties: Record<string, any>
  metadata?: Record<string, any>
}

interface PropertiesPanelProps {
  selectedItem?: SelectedItem | null
  onPropertiesChange?: (itemId: string, properties: Record<string, any>) => void
  onItemUpdate?: (itemId: string, updates: Partial<SelectedItem>) => void
  onItemDelete?: (itemId: string) => void
  onItemDuplicate?: (itemId: string) => void
}

const getPropertyFields = (itemType: string, properties: Record<string, any>): PropertyField[] => {
  const baseFields: PropertyField[] = [
    {
      key: "name",
      label: "Name",
      type: "string",
      value: properties.name || "",
      required: true,
      description: "Display name for this item",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      value: properties.description || "",
      description: "Optional description of what this item does",
    },
  ]

  switch (itemType) {
    case "http-trigger":
      return [
        ...baseFields,
        {
          key: "method",
          label: "HTTP Method",
          type: "select",
          value: properties.method || "GET",
          options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          required: true,
        },
        {
          key: "path",
          label: "Path",
          type: "string",
          value: properties.path || "/",
          required: true,
          description: "URL path for the trigger",
        },
        {
          key: "authentication",
          label: "Require Authentication",
          type: "boolean",
          value: properties.authentication || false,
        },
      ]

    case "schedule-trigger":
      return [
        ...baseFields,
        {
          key: "schedule",
          label: "Cron Expression",
          type: "string",
          value: properties.schedule || "0 * * * *",
          required: true,
          description: "Cron expression for scheduling",
        },
        {
          key: "timezone",
          label: "Timezone",
          type: "select",
          value: properties.timezone || "UTC",
          options: ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"],
        },
        {
          key: "enabled",
          label: "Enabled",
          type: "boolean",
          value: properties.enabled !== false,
        },
      ]

    case "http-request":
      return [
        ...baseFields,
        {
          key: "url",
          label: "URL",
          type: "string",
          value: properties.url || "",
          required: true,
          description: "Target URL for the request",
        },
        {
          key: "method",
          label: "Method",
          type: "select",
          value: properties.method || "GET",
          options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        },
        {
          key: "timeout",
          label: "Timeout (seconds)",
          type: "slider",
          value: properties.timeout || 30,
          min: 1,
          max: 300,
          step: 1,
        },
        {
          key: "retries",
          label: "Max Retries",
          type: "number",
          value: properties.retries || 0,
          min: 0,
          max: 10,
        },
      ]

    case "openai-llm":
      return [
        ...baseFields,
        {
          key: "model",
          label: "Model",
          type: "select",
          value: properties.model || "gpt-4o",
          options: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
          required: true,
        },
        {
          key: "temperature",
          label: "Temperature",
          type: "slider",
          value: properties.temperature || 0.7,
          min: 0,
          max: 2,
          step: 0.1,
          description: "Controls randomness in responses",
        },
        {
          key: "maxTokens",
          label: "Max Tokens",
          type: "number",
          value: properties.maxTokens || 1000,
          min: 1,
          max: 4000,
        },
        {
          key: "systemPrompt",
          label: "System Prompt",
          type: "textarea",
          value: properties.systemPrompt || "",
          description: "Instructions for the AI model",
        },
      ]

    case "data-transformer":
      return [
        ...baseFields,
        {
          key: "transformation",
          label: "Transformation Type",
          type: "select",
          value: properties.transformation || "map",
          options: ["map", "filter", "reduce", "sort", "group"],
          required: true,
        },
        {
          key: "expression",
          label: "Expression",
          type: "textarea",
          value: properties.expression || "",
          description: "JavaScript expression for transformation",
        },
        {
          key: "preserveOriginal",
          label: "Preserve Original Data",
          type: "boolean",
          value: properties.preserveOriginal || false,
        },
      ]

    case "condition":
      return [
        ...baseFields,
        {
          key: "condition",
          label: "Condition Expression",
          type: "textarea",
          value: properties.condition || "",
          required: true,
          description: "JavaScript expression that returns true/false",
        },
        {
          key: "trueLabel",
          label: "True Path Label",
          type: "string",
          value: properties.trueLabel || "True",
        },
        {
          key: "falseLabel",
          label: "False Path Label",
          type: "string",
          value: properties.falseLabel || "False",
        },
      ]

    default:
      return baseFields
  }
}

export default function PropertiesPanel({
  selectedItem,
  onPropertiesChange,
  onItemUpdate,
  onItemDelete,
  onItemDuplicate,
}: PropertiesPanelProps) {
  const [localProperties, setLocalProperties] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (selectedItem) {
      setLocalProperties(selectedItem.properties || {})
      setHasChanges(false)
    }
  }, [selectedItem])

  const handlePropertyChange = (key: string, value: any) => {
    const newProperties = { ...localProperties, [key]: value }
    setLocalProperties(newProperties)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (selectedItem && onPropertiesChange) {
      onPropertiesChange(selectedItem.id, localProperties)
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    if (selectedItem) {
      setLocalProperties(selectedItem.properties || {})
      setHasChanges(false)
    }
  }

  const handleDelete = () => {
    if (selectedItem && onItemDelete) {
      onItemDelete(selectedItem.id)
    }
  }

  const handleDuplicate = () => {
    if (selectedItem && onItemDuplicate) {
      onItemDuplicate(selectedItem.id)
    }
  }

  if (!selectedItem) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Item Selected</p>
            <p className="text-sm">Select an item to view and edit its properties</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const propertyFields = getPropertyFields(selectedItem.type, localProperties)

  const renderPropertyField = (field: PropertyField) => {
    switch (field.type) {
      case "string":
        return (
          <Input
            value={field.value || ""}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.description}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={field.value || ""}
            onChange={(e) => handlePropertyChange(field.key, Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        )

      case "boolean":
        return (
          <Switch
            checked={field.value || false}
            onCheckedChange={(checked) => handlePropertyChange(field.key, checked)}
          />
        )

      case "select":
        return (
          <Select value={field.value || ""} onValueChange={(value) => handlePropertyChange(field.key, value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "textarea":
        return (
          <Textarea
            value={field.value || ""}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.description}
            rows={3}
          />
        )

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[field.value || field.min || 0]}
              onValueChange={(values) => handlePropertyChange(field.key, values[0])}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
            />
            <div className="text-sm text-muted-foreground text-center">{field.value || field.min || 0}</div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Properties</CardTitle>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{selectedItem.type}</Badge>
          <span className="text-sm text-muted-foreground truncate">{selectedItem.name}</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-6">
            {/* Basic Properties */}
            <Accordion type="single" defaultValue="basic" collapsible>
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Properties</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {propertyFields.slice(0, 2).map((field) => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.key}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                        </div>
                        {renderPropertyField(field)}
                        {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Configuration */}
              {propertyFields.length > 2 && (
                <AccordionItem value="configuration">
                  <AccordionTrigger>Configuration</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {propertyFields.slice(2).map((field) => (
                        <div key={field.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={field.key}>
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          </div>
                          {renderPropertyField(field)}
                          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Metadata */}
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <AccordionItem value="metadata">
                  <AccordionTrigger>Metadata</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {Object.entries(selectedItem.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={handleDuplicate} className="justify-start bg-transparent">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="justify-start text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
