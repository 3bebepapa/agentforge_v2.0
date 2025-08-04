"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AINodeTester } from "./ai-node-tester"

interface AINodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeId: string
  apiKey: string
}

export function AINodeDialog({ open, onOpenChange, nodeId, apiKey }: AINodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>AI 노드 테스트</DialogTitle>
        </DialogHeader>
        <AINodeTester nodeId={nodeId} apiKey={apiKey} />
      </DialogContent>
    </Dialog>
  )
}
