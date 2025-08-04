import UnifiedStudio from "@/components/unified-studio/unified-studio"

export const metadata = {
  title: "통합 스튜디오 | AgentForge B2B",
  description: "프로세스, 워크플로우, 플로우를 통합 관리하는 스튜디오",
}

export default function UnifiedStudioPage() {
  return (
    <main className="h-screen">
      <UnifiedStudio />
    </main>
  )
}
