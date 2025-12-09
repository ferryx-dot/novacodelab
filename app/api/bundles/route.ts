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
    const { name, description, discount_percentage, file_ids } = body

    if (!file_ids || file_ids.length < 2) {
      return NextResponse.json({ error: "Bundle must contain at least 2 files" }, { status: 400 })
    }

    // Verify user owns all the files
    const { data: files } = await supabase
      .from("files")
      .select("id, price")
      .in("id", file_ids)
      .eq("user_id", session.user_id)

    if (!files || files.length !== file_ids.length) {
      return NextResponse.json({ error: "You must own all files in the bundle" }, { status: 400 })
    }

    // Calculate original price
    const originalPrice = files.reduce((sum, f) => sum + f.price, 0)

    // Create bundle
    const { data: bundle, error: bundleError } = await supabase
      .from("file_bundles")
      .insert({
        creator_id: session.user_id,
        name,
        description,
        discount_percentage,
        original_price: originalPrice,
      })
      .select()
      .single()

    if (bundleError) {
      return NextResponse.json({ error: bundleError.message }, { status: 400 })
    }

    // Add bundle items
    const bundleItems = file_ids.map((fileId: string) => ({
      bundle_id: bundle.id,
      file_id: fileId,
    }))

    const { error: itemsError } = await supabase.from("bundle_items").insert(bundleItems)

    if (itemsError) {
      // Rollback bundle creation
      await supabase.from("file_bundles").delete().eq("id", bundle.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    return NextResponse.json(bundle)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 })
  }
}
