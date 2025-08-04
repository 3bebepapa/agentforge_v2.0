import { type NextRequest, NextResponse } from "next/server"
import { AgentToolSystem } from "@/lib/agent-tool-system"

export async function POST(request: NextRequest) {
  try {
    const { toolName, parameters } = await request.json()

    if (!toolName) {
      return NextResponse.json({ error: "Tool name is required" }, { status: 400 })
    }

    const toolSystem = new AgentToolSystem()
    const result = await toolSystem.executeTool(toolName, parameters || {})

    return NextResponse.json(result)
  } catch (error) {
    console.error("Tool execution error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Tool execution failed",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const toolSystem = new AgentToolSystem()
    const tools = toolSystem.getAvailableTools()

    return NextResponse.json({
      success: true,
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
    })
  } catch (error) {
    console.error("Error fetching tools:", error)
    return NextResponse.json({ error: "Failed to fetch available tools" }, { status: 500 })
  }
}
