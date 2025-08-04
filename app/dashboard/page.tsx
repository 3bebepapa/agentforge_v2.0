"use client"
import { Dashboard } from "@/components/dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <Dashboard apiKey="gemini-default-key" />
    </ThemeProvider>
  )
}
