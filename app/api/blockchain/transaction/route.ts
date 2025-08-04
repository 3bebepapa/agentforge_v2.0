import { type NextRequest, NextResponse } from "next/server"
import { BlockchainService } from "@/lib/blockchain-service"

export async function POST(request: NextRequest) {
  try {
    const { network, txHash } = await request.json()

    if (!network || !txHash) {
      return NextResponse.json({ error: "Network and transaction hash are required" }, { status: 400 })
    }

    const service = new BlockchainService(network)
    const transaction = await service.getTransaction(txHash)
    const networkInfo = service.getNetworkInfo()

    return NextResponse.json({
      success: true,
      transaction,
      network: networkInfo.name,
      txHash,
    })
  } catch (error) {
    console.error("Transaction query error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Transaction query failed",
      },
      { status: 500 },
    )
  }
}
