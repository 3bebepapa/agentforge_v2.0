"use client"

import { useState } from "react"
import { UnifiedInterface } from "@/components/unified-interface"
import { ApiKeySetup } from "@/components/api-key-setup"
import { ThemeProvider } from "@/components/theme-provider"

export default function UnifiedPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)

  if (!apiKey) {
    return (
      <ThemeProvider>
        <ApiKeySetup onApiKeySet={setApiKey} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <UnifiedInterface apiKey={apiKey} />
    </ThemeProvider>
  )
}
