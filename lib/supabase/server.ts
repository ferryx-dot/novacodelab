import { cookies } from "next/headers"

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

function createMockClient(): SupabaseClient {
  const createFilterBuilder = (): SupabaseFilterBuilder => {
    const builder: SupabaseFilterBuilder = {
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      like: () => builder,
      ilike: () => builder,
      is: () => builder,
      in: () => builder,
      contains: () => builder,
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: async (resolve) => resolve({ data: [], error: null }),
    }
    return builder
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => createFilterBuilder(),
      insert: () => createFilterBuilder(),
      update: () => createFilterBuilder(),
      delete: () => createFilterBuilder(),
      upsert: () => createFilterBuilder(),
    }),
  }
}

export async function createClient(): Promise<SupabaseClient> {
  try {
    const { createServerClient } = await import("@supabase/ssr")
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
            // Server Component - ignore
          }
        },
      },
    }) as unknown as SupabaseClient
  } catch {
    // Fallback to mock client in preview
    return createMockClient()
  }
}
