import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FileDetailContent } from "@/components/marketplace/file-detail-content"

export default async function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch file with seller info
  const { data: file } = await supabase
    .from("files")
    .select("*, profiles(id, username, avatar_url, is_verified, reputation_score, bio, created_at)")
    .eq("id", id)
    .single()

  if (!file) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("files")
    .update({ view_count: file.view_count + 1 })
    .eq("id", id)

  // Check if user has purchased this file
  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("buyer_id", user!.id)
    .eq("file_id", id)
    .single()

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(username, avatar_url, is_verified)")
    .eq("file_id", id)
    .order("created_at", { ascending: false })

  // Fetch user's current balance
  const { data: profile } = await supabase.from("profiles").select("balance, is_admin").eq("id", user!.id).single()

  // Check if favorited
  const { data: favorite } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user!.id)
    .eq("file_id", id)
    .single()

  return (
    <FileDetailContent
      file={file}
      reviews={reviews || []}
      isPurchased={!!purchase}
      isFavorited={!!favorite}
      isOwner={file.user_id === user!.id}
      currentUserId={user!.id}
      userBalance={profile?.balance || 0}
      isAdmin={profile?.is_admin || false}
    />
  )
}
