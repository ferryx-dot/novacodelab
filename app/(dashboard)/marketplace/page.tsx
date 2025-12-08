import { createClient } from "@/lib/supabase/server"
import { MarketplaceContent } from "@/components/marketplace/marketplace-content"

export default async function MarketplacePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all active files with seller info
  const { data: files } = await supabase
    .from("files")
    .select("*, profiles(id, username, avatar_url, is_verified, reputation_score)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Fetch trending files (most downloads)
  const { data: trendingFiles } = await supabase
    .from("files")
    .select("*, profiles(id, username, avatar_url, is_verified)")
    .eq("is_active", true)
    .order("download_count", { ascending: false })
    .limit(10)

  // Fetch user's purchases to check what they already own
  const { data: purchases } = await supabase.from("purchases").select("file_id").eq("buyer_id", user!.id)

  const purchasedFileIds = purchases?.map((p) => p.file_id) || []

  // Fetch user's favorites
  const { data: favorites } = await supabase.from("favorites").select("file_id").eq("user_id", user!.id)

  const favoriteFileIds = favorites?.map((f) => f.file_id) || []

  return (
    <MarketplaceContent
      files={files || []}
      trendingFiles={trendingFiles || []}
      purchasedFileIds={purchasedFileIds}
      favoriteFileIds={favoriteFileIds}
      currentUserId={user!.id}
    />
  )
}
