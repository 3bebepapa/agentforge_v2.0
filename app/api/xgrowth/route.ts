import { NextResponse } from "next/server"
import { XGrowthSystem } from "@/lib/XGrowthIntegration"

const xGrowthSystems = new Map<string, XGrowthSystem>()

export async function POST(request: Request) {
  try {
    const { action, config, systemId } = await request.json()

    switch (action) {
      case "initialize":
        const system = new XGrowthSystem(config)
        const id = `xgrowth_${Date.now()}`
        xGrowthSystems.set(id, system)
        return NextResponse.json({ success: true, systemId: id })

      case "execute":
        const targetSystem = xGrowthSystems.get(systemId)
        if (!targetSystem) {
          return NextResponse.json({ success: false, error: "System not found" })
        }

        const results = await targetSystem.executeXGrowthStrategy()
        return NextResponse.json({ success: true, results })

      case "monitor":
        const monitorSystem = xGrowthSystems.get(systemId)
        if (!monitorSystem) {
          return NextResponse.json({ success: false, error: "System not found" })
        }

        const kpis = await monitorSystem.monitorKPIs()
        return NextResponse.json({ success: true, kpis })

      default:
        return NextResponse.json({ success: false, error: "Unknown action" })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const systemId = url.searchParams.get("systemId")

  if (!systemId) {
    return NextResponse.json({
      success: false,
      error: "System ID required",
    })
  }

  const system = xGrowthSystems.get(systemId)
  if (!system) {
    return NextResponse.json({
      success: false,
      error: "System not found",
    })
  }

  const status = await system.monitorKPIs()
  return NextResponse.json({ success: true, status })
}
