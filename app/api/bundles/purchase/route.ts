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

    const { bundle_id } = await request.json()

    // Get bundle details
    const { data: bundle } = await supabase.from("file_bundles").select("*").eq("id", bundle_id).single()

    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    // Calculate bundle price
    const bundlePrice = bundle.original_price * (1 - bundle.discount_percentage / 100)

    // Check user balance
    const { data: user } = await supabase.from("users").select("balance").eq("id", session.user_id).single()

    if (!user || user.balance < bundlePrice) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Get bundle items
    const { data: items } = await supabase.from("bundle_items").select("file_id").eq("bundle_id", bundle_id)

    if (!items) {
      return NextResponse.json({ error: "Bundle has no items" }, { status: 400 })
    }

    // Check if user already owns any of these files
    const { data: existingPurchases } = await supabase
      .from("purchases")
      .select("file_id")
      .eq("user_id", session.user_id)
      .in(
        "file_id",
        items.map((i) => i.file_id),
      )

    const ownedFileIds = existingPurchases?.map((p) => p.file_id) || []
    const newFileIds = items.filter((i) => !ownedFileIds.includes(i.file_id)).map((i) => i.file_id)

    if (newFileIds.length === 0) {
      return NextResponse.json({ error: "You already own all files in this bundle" }, { status: 400 })
    }

    // Deduct from buyer
    await supabase
      .from("users")
      .update({ balance: user.balance - bundlePrice })
      .eq("id", session.user_id)

    // Add to creator
    const { data: creator } = await supabase.from("users").select("balance").eq("id", bundle.creator_id).single()

    if (creator) {
      await supabase
        .from("users")
        .update({ balance: creator.balance + bundlePrice })
        .eq("id", bundle.creator_id)
    }

    // Create purchases for each file
    const purchases = newFileIds.map((fileId) => ({
      user_id: session.user_id,
      file_id: fileId,
      amount: bundlePrice / newFileIds.length,
      seller_id: bundle.creator_id,
    }))

    await supabase.from("purchases").insert(purchases)

    // Update bundle sales count
    await supabase
      .from("file_bundles")
      .update({ total_sales: bundle.total_sales + 1 })
      .eq("id", bundle_id)

    return NextResponse.json({ success: true, files_added: newFileIds.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to purchase bundle" }, { status: 500 })
  }
}
