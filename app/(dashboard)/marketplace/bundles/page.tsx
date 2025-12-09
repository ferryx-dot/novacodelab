import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { BundlesContent } from "@/components/marketplace/bundles-content"

export default async function BundlesPage() {
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

  // Fetch active bundles
  const { data: bundles } = await supabase
    .from("file_bundles")
    .select("*, users:creator_id(username, avatar_url, is_verified)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Fetch bundle items for each bundle
  const bundleIds = bundles?.map((b) => b.id) || []
  const { data: bundleItems } = await supabase
    .from("bundle_items")
    .select("*, files(id, title, price, category)")
    .in("bundle_id", bundleIds)

  // Map items to bundles
  const bundlesWithItems = bundles?.map((bundle) => ({
    ...bundle,
    items: bundleItems?.filter((item) => item.bundle_id === bundle.id) || [],
    creator: bundle.users,
  }))

  // Fetch user's bundles
  const { data: myBundles } = await supabase
    .from("file_bundles")
    .select("*")
    .eq("creator_id", session.user_id)
    .order("created_at", { ascending: false })

  // Get user's files for creating bundles
  const { data: myFiles } = await supabase
    .from("files")
    .select("id, title, price, category")
    .eq("user_id", session.user_id)
    .eq("is_active", true)

  return (
    <BundlesContent
      bundles={bundlesWithItems || []}
      myBundles={myBundles || []}
      myFiles={myFiles || []}
      currentUserId={session.user_id}
    />
  )
}
