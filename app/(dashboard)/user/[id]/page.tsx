import { Suspense } from "react"
import { UserProfileView } from "@/components/profile/user-profile-view"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <UserProfileView userId={id} />
    </Suspense>
  )
}
