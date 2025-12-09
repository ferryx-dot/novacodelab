import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { CommunityChannels } from "@/components/community/community-channels"

export default async function ChannelsPage() {
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

  const { data: user } = await supabase.from("users").select("*").eq("id", session.user_id).single()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch public channels
  const { data: channels } = await supabase
    .from("community_channels")
    .select("*")
    .eq("is_private", false)
    .order("created_at", { ascending: true })

  // Get member counts
  const { data: memberCounts } = await supabase.from("channel_members").select("channel_id")

  const countMap = new Map<string, number>()
  memberCounts?.forEach((m) => {
    countMap.set(m.channel_id, (countMap.get(m.channel_id) || 0) + 1)
  })

  const channelsWithCounts =
    channels?.map((c) => ({
      ...c,
      member_count: countMap.get(c.id) || 0,
    })) || []

  // Create default profile object
  const profile = {
    id: user.id,
    username: user.username,
    avatar_url: user.avatar_url,
    is_admin: user.is_admin,
    is_verified: user.is_verified,
    balance: user.balance,
    total_sales: user.total_sales || 0,
    total_purchases: user.total_purchases || 0,
    files_uploaded: user.files_uploaded || 0,
    messages_sent: user.messages_sent || 0,
    reputation_score: user.reputation_score || 0,
    created_at: user.created_at,
  }

  return <CommunityChannels channels={channelsWithCounts} currentUser={profile as any} />
}
