import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

// Simple hash function for passwords (using Web Crypto API)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "novacode_salt_2024")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Generate a secure session token
export function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// User type for our custom auth
export interface AuthUser {
  id: string
  username: string
  balance: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

// Get current user from session
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const supabase = createAdminClient()

    // Get session and user
    const { data: session, error } = await supabase
      .from("sessions")
      .select("*, users(*)")
      .eq("token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !session || !session.users) {
      return null
    }

    return session.users as AuthUser
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}

// Get or create profile for user (bridge between users table and profiles table)
export async function getOrCreateProfile(user: AuthUser) {
  const supabase = createAdminClient()

  // Check if profile exists
  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (existingProfile) {
    return existingProfile
  }

  // Create profile if not exists
  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: user.username,
      balance: user.balance,
      is_admin: user.is_admin,
      avatar_url: null,
      bio: null,
      is_verified: false,
      reputation_score: 0,
      total_sales: 0,
      total_purchases: 0,
      files_uploaded: 0,
      messages_sent: 0,
      storage_used: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating profile:", error)
    // Return a minimal profile object
    return {
      id: user.id,
      username: user.username,
      balance: user.balance,
      is_admin: user.is_admin,
      avatar_url: null,
      bio: null,
      is_verified: false,
      reputation_score: 0,
      total_sales: 0,
      total_purchases: 0,
      files_uploaded: 0,
      messages_sent: 0,
      storage_used: 0,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }

  return newProfile
}

// Create a session for user
export async function createSession(userId: string) {
  const supabase = createAdminClient()
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const { error } = await supabase.from("sessions").insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    console.error("[v0] Failed to create session:", error)
    throw new Error("Failed to create session")
  }

  return token
}

// Delete session (logout)
export async function deleteSession(token: string) {
  const supabase = createAdminClient()
  await supabase.from("sessions").delete().eq("token", token)
}
