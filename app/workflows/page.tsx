"use client"

import { ProcessStudio } from "@/components/process-studio"
import { ReactFlowProvider } from "reactflow"

export default function WorkflowsPage() {
  return (
    <div className="h-screen">
      <ReactFlowProvider>
        <ProcessStudio />
      </ReactFlowProvider>
    </div>
  )
}
