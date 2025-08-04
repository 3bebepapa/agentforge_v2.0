import { type NextRequest, NextResponse } from "next/server"
import { BlockchainService } from "@/lib/blockchain-service"

export async function POST(request: NextRequest) {
  try {
    const { network } = await request.json()

    if (!network) {
      return NextResponse.json({ error: "Network is required" }, { status: 400 })
    }

    const service = new BlockchainService(network)
    const gasPrice = await service.getGasPrice()
    const networkInfo = service.getNetworkInfo()

    return NextResponse.json({
      success: true,
      gasPrice: gasPrice.gwei,
      network: networkInfo.name,
      raw: gasPrice.gasPrice,
    })
  } catch (error) {
    console.error("Gas price query error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gas price query failed",
      },
      { status: 500 },
    )
  }
}
