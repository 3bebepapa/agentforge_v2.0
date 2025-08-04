"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Loader2, Search, Wallet, Zap, TrendingUp } from "lucide-react"
import { SUPPORTED_NETWORKS, BlockchainService } from "@/lib/blockchain-service"

interface BlockchainResult {
  type: "balance" | "transaction" | "gasPrice"
  data: any
  network: string
}

export function BlockchainConnector() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum-mainnet")
  const [address, setAddress] = useState("")
  const [txHash, setTxHash] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BlockchainResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBalanceQuery = async () => {
    if (!address.trim()) {
      setError("지갑 주소를 입력해주세요.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const service = new BlockchainService(selectedNetwork)
      const balance = await service.getBalance(address)

      setResult({
        type: "balance",
        data: balance,
        network: selectedNetwork,
      })
    } catch (err: any) {
      setError(err.message || "잔액 조회 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionQuery = async () => {
    if (!txHash.trim()) {
      setError("트랜잭션 해시를 입력해주세요.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const service = new BlockchainService(selectedNetwork)
      const transaction = await service.getTransaction(txHash)

      setResult({
        type: "transaction",
        data: transaction,
        network: selectedNetwork,
      })
    } catch (err: any) {
      setError(err.message || "트랜잭션 조회 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleGasPriceQuery = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const service = new BlockchainService(selectedNetwork)
      const gasPrice = await service.getGasPrice()

      setResult({
        type: "gasPrice",
        data: gasPrice,
        network: selectedNetwork,
      })
    } catch (err: any) {
      setError(err.message || "가스 가격 조회 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openBlockExplorer = (type: "address" | "tx", value: string) => {
    const service = new BlockchainService(selectedNetwork)
    const url = service.getBlockExplorerUrl(type, value)
    window.open(url, "_blank")
  }

  const networkInfo = SUPPORTED_NETWORKS[selectedNetwork]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            블록체인 조회 도구
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 네트워크 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">네트워크 선택</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{network.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {network.nativeCurrency.symbol}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {networkInfo && (
              <div className="text-xs text-gray-500">
                Chain ID: {networkInfo.chainId} | Explorer: {networkInfo.blockExplorer}
              </div>
            )}
          </div>

          {/* 조회 탭 */}
          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="balance" className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                잔액 조회
              </TabsTrigger>
              <TabsTrigger value="transaction" className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                트랜잭션 조회
              </TabsTrigger>
              <TabsTrigger value="gasPrice" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                가스 가격
              </TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">지갑 주소</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0x..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleBalanceQuery} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    조회
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transaction" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">트랜잭션 해시</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0x..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTransactionQuery} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    조회
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gasPrice" className="space-y-4">
              <div className="text-center">
                <Button onClick={handleGasPriceQuery} disabled={loading} size="lg">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  현재 가스 가격 조회
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* 오류 표시 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 결과 표시 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">조회 결과</CardTitle>
              </CardHeader>
              <CardContent>
                {result.type === "balance" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">잔액</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {result.data.balance} {result.data.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(address)}>
                        <Copy className="h-3 w-3 mr-1" />
                        주소 복사
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openBlockExplorer("address", address)}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        익스플로러에서 보기
                      </Button>
                    </div>
                  </div>
                )}

                {result.type === "transaction" && result.data && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <div className="font-mono text-xs break-all">{result.data.from}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <div className="font-mono text-xs break-all">{result.data.to}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <div>{Number.parseInt(result.data.value, 16) / Math.pow(10, 18)} ETH</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Gas Price:</span>
                        <div>{Number.parseInt(result.data.gasPrice, 16) / Math.pow(10, 9)} Gwei</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(txHash)}>
                        <Copy className="h-3 w-3 mr-1" />
                        해시 복사
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openBlockExplorer("tx", txHash)}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        익스플로러에서 보기
                      </Button>
                    </div>
                  </div>
                )}

                {result.type === "gasPrice" && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{result.data.gwei} Gwei</div>
                      <div className="text-sm text-gray-500 mt-1">현재 가스 가격</div>
                    </div>
                    <div className="text-xs text-gray-400 text-center font-mono">Raw: {result.data.gasPrice}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
