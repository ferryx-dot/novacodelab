import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

// Server-side Supabase client for Next.js

type SupabaseAuthUser = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

type SupabaseClient = {
  auth: {
    getUser: () => Promise<{ data: { user: SupabaseAuthUser | null }; error: Error | null }>
  }
  from: (table: string) => SupabaseQueryBuilder
}

type SupabaseQueryBuilder = {
  select: (columns?: string) => SupabaseFilterBuilder
  insert: (data: unknown) => SupabaseFilterBuilder
  update: (data: unknown) => SupabaseFilterBuilder
  delete: () => SupabaseFilterBuilder
  upsert: (data: unknown) => SupabaseFilterBuilder
}

type SupabaseFilterBuilder = {
  eq: (column: string, value: unknown) => SupabaseFilterBuilder
  neq: (column: string, value: unknown) => SupabaseFilterBuilder
  gt: (column: string, value: unknown) => SupabaseFilterBuilder
  gte: (column: string, value: unknown) => SupabaseFilterBuilder
  lt: (column: string, value: unknown) => SupabaseFilterBuilder
  lte: (column: string, value: unknown) => SupabaseFilterBuilder
  like: (column: string, value: string) => SupabaseFilterBuilder
  ilike: (column: string, value: string) => SupabaseFilterBuilder
  is: (column: string, value: unknown) => SupabaseFilterBuilder
  in: (column: string, values: unknown[]) => SupabaseFilterBuilder
  contains: (column: string, value: unknown) => SupabaseFilterBuilder
  order: (column: string, options?: { ascending?: boolean }) => SupabaseFilterBuilder
  limit: (count: number) => SupabaseFilterBuilder
  range: (from: number, to: number) => SupabaseFilterBuilder
  single: () => Promise<{ data: unknown; error: Error | null }>
  maybeSingle: () => Promise<{ data: unknown; error: Error | null }>
  then: (resolve: (result: { data: unknown[]; error: Error | null }) => void) => Promise<void>
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
