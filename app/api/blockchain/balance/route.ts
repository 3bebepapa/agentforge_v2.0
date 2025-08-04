import { type NextRequest, NextResponse } from "next/server"
import { BlockchainService } from "@/lib/blockchain-service"

export async function POST(request: NextRequest) {
  try {
    const { network, address } = await request.json()

    if (!network || !address) {
      return NextResponse.json({ error: "Network and address are required" }, { status: 400 })
    }

    const service = new BlockchainService(network)
    const balance = await service.getBalance(address)
    const networkInfo = service.getNetworkInfo()

    return NextResponse.json({
      success: true,
      balance: balance.balance,
      symbol: balance.symbol,
      network: networkInfo.name,
      address,
    })
  } catch (error) {
    console.error("Balance query error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Balance query failed",
      },
      { status: 500 },
    )
  }
}
