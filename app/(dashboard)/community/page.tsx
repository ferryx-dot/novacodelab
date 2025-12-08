import { Suspense } from "react"
import { CommunityChat } from "@/components/community/community-chat"

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <CommunityChat />
    </Suspense>
  )
}
