import { Suspense } from "react"
import { AdminPanel } from "@/components/admin/admin-panel"

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AdminPanel />
    </Suspense>
  )
}
