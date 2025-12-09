import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
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

    // Get user's referral code
    const { data: user } = await supabase
      .from("users")
      .select("referral_code, total_referral_earnings")
      .eq("id", session.user_id)
      .single()

    // Get referral stats
    const { data: referrals } = await supabase
      .from("referrals")
      .select("*, referred_user:referred_id(username)")
      .eq("referrer_id", session.user_id)
      .order("created_at", { ascending: false })

    const successfulReferrals = referrals?.filter((r) => r.status === "completed") || []

    // Generate the referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://novacodelabs.com"
    const referralLink = user?.referral_code ? `${baseUrl}/ref/${user.referral_code}` : ""

    return NextResponse.json({
      referralCode: user?.referral_code || null,
      referralLink,
      totalReferrals: referrals?.length || 0,
      successfulSignups: successfulReferrals.length,
      totalEarnings: user?.total_referral_earnings || 0,
      conversionRate: referrals?.length ? Math.round((successfulReferrals.length / referrals.length) * 100) : 0,
      recentReferrals: successfulReferrals.slice(0, 5).map((r) => ({
        username: r.referred_user?.username || "Unknown",
        date: new Date(r.completed_at || r.created_at).toLocaleDateString(),
        earned: r.commission_earned,
      })),
    })
  } catch (error) {
    console.error("Referral fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 })
  }
}
