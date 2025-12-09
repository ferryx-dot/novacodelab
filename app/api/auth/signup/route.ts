import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { hashPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        username: username.toLowerCase(),
        password_hash: passwordHash,
        balance: 2500.0,
        is_admin: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating user:", error)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    // Create session
    const sessionToken = await createSession(newUser.id)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        balance: newUser.balance,
      },
    })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
