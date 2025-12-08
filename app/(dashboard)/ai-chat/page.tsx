import { Suspense } from "react"
import { AIChatInterface } from "@/components/ai-chat/ai-chat-interface"

export default function AIChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AIChatInterface />
    </Suspense>
  )
}
