import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser, getOrCreateProfile } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { AppLayout } from "@/components/layout/app-layout"
import type { Profile, Notification } from "@/lib/types"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get or create profile for user
  const profile = await getOrCreateProfile(user)

  if (!profile) {
    redirect("/auth/login")
  }

  // Fetch notifications using admin client
  const supabase = createAdminClient()
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <AppLayout profile={profile as Profile} notifications={(notifications as Notification[]) || []}>
      {children}
    </AppLayout>
  )
}
