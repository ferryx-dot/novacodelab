import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { LeaderboardPage } from "@/components/leaderboard/leaderboard-page"

export default async function Leaderboard() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    redirect("/auth/login")
  }

  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch top earners
  const { data: topEarners } = await supabase
    .from("users")
    .select("id, username, avatar_url, is_verified, total_sales")
    .order("total_sales", { ascending: false })
    .limit(50)

  // Fetch top uploaders
  const { data: topUploaders } = await supabase
    .from("users")
    .select("id, username, avatar_url, is_verified, files_uploaded")
    .order("files_uploaded", { ascending: false })
    .limit(50)

  // Fetch top chatters
  const { data: topChatters } = await supabase
    .from("users")
    .select("id, username, avatar_url, is_verified, messages_sent")
    .order("messages_sent", { ascending: false })
    .limit(50)

  // Fetch top buyers
  const { data: topBuyers } = await supabase
    .from("users")
    .select("id, username, avatar_url, is_verified, total_purchases")
    .order("total_purchases", { ascending: false })
    .limit(50)

  // Fetch most downloaded files
  const { data: topFiles } = await supabase
    .from("files")
    .select("id, title, download_count, user_id, users:user_id(username)")
    .eq("is_active", true)
    .order("download_count", { ascending: false })
    .limit(20)

  return (
    <LeaderboardPage
      topEarners={topEarners || []}
      topUploaders={topUploaders || []}
      topChatters={topChatters || []}
      topBuyers={topBuyers || []}
      topFiles={topFiles || []}
      currentUserId={session.user_id}
    />
  )
}
