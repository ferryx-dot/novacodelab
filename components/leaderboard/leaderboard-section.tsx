"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, Download, MessageSquare, Star, DollarSign, Crown, Medal, Award } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  value: number
  badges?: string[]
}

interface LeaderboardData {
  topEarners: LeaderboardEntry[]
  mostDownloaded: LeaderboardEntry[]
  communityChampions: LeaderboardEntry[]
  topRatedSellers: LeaderboardEntry[]
  biggestSpenders: LeaderboardEntry[]
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />
    default:
      return <span className="w-5 h-5 text-center text-sm font-bold text-muted-foreground">#{rank}</span>
  }
}

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30"
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30"
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30"
    default:
      return ""
  }
}

export function LeaderboardSection() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("week")
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboards?period=${period}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch leaderboards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboards()
  }, [period])

  const LeaderboardCard = ({
    title,
    icon: Icon,
    entries,
    valueFormatter,
    iconColor,
  }: {
    title: string
    icon: React.ElementType
    entries: LeaderboardEntry[]
    valueFormatter: (value: number) => string
    iconColor: string
  }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.slice(0, 5).map((entry) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${getRankBg(entry.rank)}`}
          >
            <div className="w-6 flex justify-center">{getRankIcon(entry.rank)}</div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{entry.username}</p>
            </div>
            <span className="font-semibold text-sm text-primary">{valueFormatter(entry.value)}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No data yet</p>}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboards
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboards
        </h2>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LeaderboardCard
          title="Top Earners"
          icon={TrendingUp}
          entries={data?.topEarners || []}
          valueFormatter={formatCurrency}
          iconColor="text-green-500"
        />
        <LeaderboardCard
          title="Most Downloaded"
          icon={Download}
          entries={data?.mostDownloaded || []}
          valueFormatter={(v) => `${v} downloads`}
          iconColor="text-blue-500"
        />
        <LeaderboardCard
          title="Community Champions"
          icon={MessageSquare}
          entries={data?.communityChampions || []}
          valueFormatter={(v) => `${v} messages`}
          iconColor="text-purple-500"
        />
        <LeaderboardCard
          title="Top Rated Sellers"
          icon={Star}
          entries={data?.topRatedSellers || []}
          valueFormatter={(v) => `${v.toFixed(1)} stars`}
          iconColor="text-yellow-500"
        />
        <LeaderboardCard
          title="Biggest Spenders"
          icon={DollarSign}
          entries={data?.biggestSpenders || []}
          valueFormatter={formatCurrency}
          iconColor="text-pink-500"
        />
      </div>
    </div>
  )
}
