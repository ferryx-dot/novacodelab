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

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
