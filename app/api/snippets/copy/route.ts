import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { snippetId } = await request.json()
    const supabase = createAdminClient()

    await supabase.rpc("increment_snippet_copy_count", { snippet_id: snippetId })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
