import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { SnippetsContent } from "@/components/snippets/snippets-content"

export default async function SnippetsPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    redirect("/auth/login")
  }

  const supabase = createAdminClient()

  // Get session
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (!session) {
    redirect("/auth/login")
  }

  // Get user's snippets
  const { data: snippets } = await supabase
    .from("code_snippets")
    .select("*")
    .eq("user_id", session.user_id)
    .order("created_at", { ascending: false })

  // Get public snippets from others
  const { data: publicSnippets } = await supabase
    .from("code_snippets")
    .select("*, users(username, avatar_url)")
    .eq("is_public", true)
    .neq("user_id", session.user_id)
    .order("view_count", { ascending: false })
    .limit(20)

  return (
    <SnippetsContent
      userSnippets={snippets || []}
      publicSnippets={publicSnippets || []}
      currentUserId={session.user_id}
    />
  )
}
