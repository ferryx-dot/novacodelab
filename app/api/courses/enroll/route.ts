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

    const { course_id } = await request.json()

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", course_id)
      .eq("user_id", session.user_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
    }

    // Check course price
    const { data: course } = await supabase.from("courses").select("price, creator_id").eq("id", course_id).single()

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // If paid course, check balance and deduct
    if (course.price > 0) {
      const { data: user } = await supabase.from("users").select("balance").eq("id", session.user_id).single()

      if (!user || user.balance < course.price) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }

      // Deduct from buyer
      await supabase
        .from("users")
        .update({ balance: user.balance - course.price })
        .eq("id", session.user_id)

      // Add to creator
      const { data: creator } = await supabase.from("users").select("balance").eq("id", course.creator_id).single()

      if (creator) {
        await supabase
          .from("users")
          .update({ balance: creator.balance + course.price })
          .eq("id", course.creator_id)
      }
    }

    // Create enrollment
    const { data, error } = await supabase
      .from("course_enrollments")
      .insert({
        course_id,
        user_id: session.user_id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Increment enrolled count
    await supabase.rpc("increment_course_enrolled_count", { course_id_param: course_id })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
  }
}
