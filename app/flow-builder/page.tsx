"use client"

import { Dashboard } from "@/components/dashboard"

export default function FlowBuilderPage() {
  return (
    <div className="h-screen">
      <Dashboard activeTabOverride="flowbuilder" />
    </div>
  )
}
