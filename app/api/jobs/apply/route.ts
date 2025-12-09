import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { job_id, cover_message, proposed_amount, proposed_timeline } = body

    // Check if already applied
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", job_id)
      .eq("applicant_id", session.user_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        job_id,
        applicant_id: session.user_id,
        cover_message,
        proposed_amount,
        proposed_timeline,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 })
  }
}
