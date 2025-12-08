import { createClient } from "@/lib/supabase/server"
import { ProfileContent } from "@/components/profile/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  // Fetch user's uploads
  const { data: uploads } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // Fetch user's purchases with file info
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, files(*), seller:profiles!purchases_seller_id_fkey(username)")
    .eq("buyer_id", user!.id)
    .order("created_at", { ascending: false })

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, other_party:profiles!transactions_other_party_id_fkey(username)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // Fetch achievements
  const { data: achievements } = await supabase.from("achievements").select("*").eq("user_id", user!.id)

  // Fetch favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*, files(*, profiles(username, avatar_url, is_verified))")
    .eq("user_id", user!.id)

  return (
    <ProfileContent
      profile={profile}
      uploads={uploads || []}
      purchases={purchases || []}
      transactions={transactions || []}
      achievements={achievements || []}
      favorites={favorites || []}
      isOwnProfile={true}
    />
  )
}
