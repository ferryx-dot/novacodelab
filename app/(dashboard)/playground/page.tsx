import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { PlaygroundEditor } from "@/components/playground/playground-editor"

export default async function PlaygroundPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  // Playground can work without login for basic use
  let userId: string | null = null

  if (sessionToken) {
    const supabase = createAdminClient()
    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    userId = session?.user_id || null
  }

  return <PlaygroundEditor userId={userId} />
}
