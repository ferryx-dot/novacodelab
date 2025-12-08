import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, other_party:profiles!transactions_other_party_id_fkey(username, avatar_url)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch trending files
  const { data: trendingFiles } = await supabase
    .from("files")
    .select("*, profiles(username, avatar_url, is_verified)")
    .eq("is_active", true)
    .order("download_count", { ascending: false })
    .limit(5)

  // Fetch user's achievements
  const { data: achievements } = await supabase.from("achievements").select("*").eq("user_id", user!.id)

  return (
    <DashboardContent
      profile={profile}
      transactions={transactions || []}
      trendingFiles={trendingFiles || []}
      achievements={achievements || []}
    />
  )
}
