import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

function generateCode(username: string): string {
  const random = Math.random().toString(36).substring(2, 8)
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}${random}`
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: session } = await supabase
      .from("sessions")
      .select("user_id")
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user
    const { data: user } = await supabase
      .from("users")
      .select("username, referral_code")
      .eq("id", session.user_id)
      .single()

    if (user?.referral_code) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novacodelabs.com"
      return NextResponse.json({
        code: user.referral_code,
        link: `${baseUrl}/ref/${user.referral_code}`,
      })
    }

    // Generate new code
    const code = generateCode(user?.username || "user")

    await supabase.from("users").update({ referral_code: code }).eq("id", session.user_id)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novacodelabs.com"

    return NextResponse.json({
      code,
      link: `${baseUrl}/ref/${code}`,
    })
  } catch (error) {
    console.error("Generate referral code error:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}
