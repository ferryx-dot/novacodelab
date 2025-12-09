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
    const { id, title, html_code, css_code, js_code } = body

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from("playgrounds")
        .update({ title, html_code, css_code, js_code, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", session.user_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(data)
    } else {
      // Create new
      const { data, error } = await supabase
        .from("playgrounds")
        .insert({
          user_id: session.user_id,
          title,
          html_code,
          css_code,
          js_code,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to save playground" }, { status: 500 })
  }
}
