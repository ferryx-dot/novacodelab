"use client"

// Hybrid Supabase client that works in both preview and production
// Uses @supabase/ssr when available (production), falls back to mock (preview)

type SupabaseAuthUser = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

type SupabaseSession = {
  user: SupabaseAuthUser
  access_token: string
  refresh_token: string
}

type SupabaseClient = {
  auth: {
    signInWithPassword: (credentials: {
      email: string
      password: string
    }) => Promise<{ data: { user: SupabaseAuthUser | null; session: SupabaseSession | null }; error: Error | null }>
    signUp: (credentials: {
      email: string
      password: string
      options?: { data?: Record<string, unknown>; emailRedirectTo?: string }
    }) => Promise<{ data: { user: SupabaseAuthUser | null; session: SupabaseSession | null }; error: Error | null }>
    signOut: () => Promise<{ error: Error | null }>
    getUser: () => Promise<{ data: { user: SupabaseAuthUser | null }; error: Error | null }>
    getSession: () => Promise<{ data: { session: SupabaseSession | null }; error: Error | null }>
    onAuthStateChange: (callback: (event: string, session: SupabaseSession | null) => void) => {
      data: { subscription: { unsubscribe: () => void } }
    }
  }
  from: (table: string) => SupabaseQueryBuilder
  channel: (name: string) => SupabaseChannel
  removeChannel: (channel: SupabaseChannel) => void
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

type SupabaseChannel = {
  on: (
    event: string,
    filter: { event: string; schema?: string; table?: string; filter?: string },
    callback: (payload: { new: unknown; old: unknown; eventType: string }) => void,
  ) => SupabaseChannel
  subscribe: (callback?: (status: string) => void) => SupabaseChannel
  unsubscribe: () => void
}

let client: SupabaseClient | null = null

// Check if we're in a real Vercel deployment (not preview)
function isProduction() {
  return typeof window !== "undefined" && !window.location.hostname.includes("vusercontent.net")
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
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: new Error("Preview mode - deploy to Vercel to use authentication"),
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: new Error("Preview mode - deploy to Vercel to use authentication"),
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => createFilterBuilder(),
      insert: () => createFilterBuilder(),
      update: () => createFilterBuilder(),
      delete: () => createFilterBuilder(),
      upsert: () => createFilterBuilder(),
    }),
    channel: () => ({
      on: function () {
        return this
      },
      subscribe: function () {
        return this
      },
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  }
}

export function createClient(): SupabaseClient {
  if (client) return client

  // In v0 preview, use mock client
  if (!isProduction()) {
    client = createMockClient()
    return client
  }

  // In production, try to use real Supabase
  try {
    // Dynamic import to avoid build issues in preview
    const { createBrowserClient } = require("@supabase/ssr")
    client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    return client as SupabaseClient
  } catch {
    // Fallback to mock if Supabase isn't available
    client = createMockClient()
    return client
  }
}
