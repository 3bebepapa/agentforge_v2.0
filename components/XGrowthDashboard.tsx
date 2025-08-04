"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { XGrowthSystem } from "@/lib/XGrowthIntegration"

export default function XGrowthDashboard() {
  const [xGrowthSystem, setXGrowthSystem] = useState<XGrowthSystem | null>(null)
  const [kpiStatus, setKpiStatus] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<string>("idle")

  useEffect(() => {
    // X-Growth 시스템 초기화
    const system = new XGrowthSystem({
      tier: "premium",
      motherAccount: {
        handle: "@crypto_brand",
        niche: "Web3",
        brandVoice: "professional",
      },
      targetAudience: {
        keywords: ["DeFi", "SocialFi", "Web3", "Crypto"],
        demographics: { age: "25-45", location: "global" },
        interests: ["blockchain", "cryptocurrency", "NFT"],
      },
    })

    setXGrowthSystem(system)
  }, [])

  const handleStartXGrowth = async () => {
    if (!xGrowthSystem) return

    setIsRunning(true)
    setCurrentPhase("phase1")

    try {
      const results = await xGrowthSystem.executeXGrowthStrategy()
      console.log("X-Growth Results:", results)

      // KPI 모니터링
      const kpis = await xGrowthSystem.monitorKPIs()
      setKpiStatus(kpis)
    } catch (error) {
      console.error("X-Growth execution failed:", error)
    } finally {
      setIsRunning(false)
      setCurrentPhase("idle")
    }
  }

  const handleMonitorKPIs = async () => {
    if (!xGrowthSystem) return

    const kpis = await xGrowthSystem.monitorKPIs()
    setKpiStatus(kpis)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">X-Growth Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleStartXGrowth} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
            {isRunning ? "Running..." : "Start X-Growth"}
          </Button>
          <Button onClick={handleMonitorKPIs} variant="outline">
            Monitor KPIs
          </Button>
        </div>
      </div>

      {/* 현재 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? `Running: ${currentPhase}` : "Idle"}
            </Badge>
            <span className="text-sm text-gray-600">Premium Tier: 1 Mother + 10 Child Accounts</span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 대시보드 */}
      {kpiStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current: {kpiStatus.followerGrowth.current}</span>
                  <span>Target: {kpiStatus.followerGrowth.target}</span>
                </div>
                <Progress value={kpiStatus.followerGrowth.achievement} />
                <p className="text-sm text-gray-600">
                  {kpiStatus.followerGrowth.achievement.toFixed(1)}% of target achieved
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current: {(kpiStatus.engagementRate.current * 100).toFixed(2)}%</span>
                  <span>Target: {(kpiStatus.engagementRate.target * 100).toFixed(2)}%</span>
                </div>
                <Progress value={kpiStatus.engagementRate.achievement} />
                <p className="text-sm text-gray-600">
                  {kpiStatus.engagementRate.achievement.toFixed(1)}% of target achieved
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impression Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current: {(kpiStatus.impressionGrowth.current * 100).toFixed(1)}%</span>
                  <span>Target: {(kpiStatus.impressionGrowth.target * 100).toFixed(1)}%</span>
                </div>
                <Progress value={kpiStatus.impressionGrowth.achievement} />
                <p className="text-sm text-gray-600">
                  {kpiStatus.impressionGrowth.achievement.toFixed(1)}% of target achieved
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3단계 전략 진행 상황 */}
      <Card>
        <CardHeader>
          <CardTitle>X-Growth Strategy Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={currentPhase === "phase1" ? "default" : "secondary"}>Phase 1: Target Following</Badge>
              <span className="text-sm">Child accounts follow 100-200 Web3 targets each</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={currentPhase === "phase2" ? "default" : "secondary"}>Phase 2: Daily Engagement</Badge>
              <span className="text-sm">Strategic interactions with target audience</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={currentPhase === "phase3" ? "default" : "secondary"}>Phase 3: Mother Amplification</Badge>
              <span className="text-sm">Child accounts amplify mother account content</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mother Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Handle:</strong> @crypto_brand
              </p>
              <p>
                <strong>Niche:</strong> Web3
              </p>
              <p>
                <strong>Voice:</strong> Professional
              </p>
              <Badge variant="outline">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Child Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Count:</strong> 10 (Premium Tier)
              </p>
              <p>
                <strong>Status:</strong> All Active
              </p>
              <p>
                <strong>Personalities:</strong> Friendly, Casual, Professional
              </p>
              <div className="flex gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    Child {i + 1}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
