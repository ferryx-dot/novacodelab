import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"

    const supabase = createAdminClient()

    let dateFilter = new Date()
    if (period === "week") {
      dateFilter.setDate(dateFilter.getDate() - 7)
    } else if (period === "month") {
      dateFilter.setMonth(dateFilter.getMonth() - 1)
    } else {
      dateFilter = new Date(0) // All time
    }

    // Top Earners - users who made most money from sales
    const { data: topEarners } = await supabase
      .from("transactions")
      .select("user_id, amount, users(username, avatar_url)")
      .eq("type", "sale")
      .gte("created_at", dateFilter.toISOString())

    const earnerMap = new Map<string, { total: number; username: string; avatar_url: string | null }>()
    topEarners?.forEach((t: any) => {
      const existing = earnerMap.get(t.user_id) || {
        total: 0,
        username: t.users?.username || "Unknown",
        avatar_url: t.users?.avatar_url,
      }
      earnerMap.set(t.user_id, { ...existing, total: existing.total + t.amount })
    })

    const topEarnersFormatted = Array.from(earnerMap.entries())
      .map(([user_id, data]) => ({
        rank: 0,
        user_id,
        username: data.username,
        avatar_url: data.avatar_url,
        value: data.total,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }))

    // Most Downloaded Files (with creator info)
    const { data: mostDownloaded } = await supabase
      .from("files")
      .select("user_id, download_count, users(username, avatar_url)")
      .order("download_count", { ascending: false })
      .limit(10)

    const mostDownloadedFormatted = (mostDownloaded || []).map((f: any, i: number) => ({
      rank: i + 1,
      user_id: f.user_id,
      username: f.users?.username || "Unknown",
      avatar_url: f.users?.avatar_url,
      value: f.download_count,
    }))

    // Community Champions - most messages
    const { data: communityChampions } = await supabase
      .from("channel_messages")
      .select("user_id, users(username, avatar_url)")
      .gte("created_at", dateFilter.toISOString())

    const messageMap = new Map<string, { count: number; username: string; avatar_url: string | null }>()
    communityChampions?.forEach((m: any) => {
      const existing = messageMap.get(m.user_id) || {
        count: 0,
        username: m.users?.username || "Unknown",
        avatar_url: m.users?.avatar_url,
      }
      messageMap.set(m.user_id, { ...existing, count: existing.count + 1 })
    })

    const communityChampionsFormatted = Array.from(messageMap.entries())
      .map(([user_id, data]) => ({
        rank: 0,
        user_id,
        username: data.username,
        avatar_url: data.avatar_url,
        value: data.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }))

    // Top Rated Sellers
    const { data: topRated } = await supabase
      .from("files")
      .select("user_id, average_rating, users(username, avatar_url)")
      .gt("total_ratings", 0)
      .order("average_rating", { ascending: false })
      .limit(10)

    const topRatedFormatted = (topRated || []).map((f: any, i: number) => ({
      rank: i + 1,
      user_id: f.user_id,
      username: f.users?.username || "Unknown",
      avatar_url: f.users?.avatar_url,
      value: f.average_rating,
    }))

    // Biggest Spenders
    const { data: biggestSpenders } = await supabase
      .from("transactions")
      .select("user_id, amount, users(username, avatar_url)")
      .eq("type", "purchase")
      .gte("created_at", dateFilter.toISOString())

    const spenderMap = new Map<string, { total: number; username: string; avatar_url: string | null }>()
    biggestSpenders?.forEach((t: any) => {
      const existing = spenderMap.get(t.user_id) || {
        total: 0,
        username: t.users?.username || "Unknown",
        avatar_url: t.users?.avatar_url,
      }
      spenderMap.set(t.user_id, { ...existing, total: existing.total + Math.abs(t.amount) })
    })

    const biggestSpendersFormatted = Array.from(spenderMap.entries())
      .map(([user_id, data]) => ({
        rank: 0,
        user_id,
        username: data.username,
        avatar_url: data.avatar_url,
        value: data.total,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }))

    return NextResponse.json({
      topEarners: topEarnersFormatted,
      mostDownloaded: mostDownloadedFormatted,
      communityChampions: communityChampionsFormatted,
      topRatedSellers: topRatedFormatted,
      biggestSpenders: biggestSpendersFormatted,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({
      topEarners: [],
      mostDownloaded: [],
      communityChampions: [],
      topRatedSellers: [],
      biggestSpenders: [],
    })
  }
}
