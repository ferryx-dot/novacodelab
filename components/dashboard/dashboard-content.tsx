"use client"

import Link from "next/link"
import type { Profile, Transaction, MarketplaceFile, Achievement } from "@/lib/types"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Code2,
  Store,
  Users,
  Upload,
  ShoppingCart,
  DollarSign,
  FileUp,
  MessageSquare,
  TrendingUp,
  Star,
  Crown,
  BadgeCheck,
  ArrowRight,
  Flame,
  FileCode,
  Briefcase,
} from "lucide-react"
import { LeaderboardSection } from "@/components/leaderboard/leaderboard-section"

interface DashboardContentProps {
  profile: Profile
  transactions: Transaction[]
  trendingFiles: (MarketplaceFile & {
    profiles: { username: string; avatar_url: string | null; is_verified: boolean }
  })[]
  achievements: Achievement[]
}

export function DashboardContent({ profile, transactions, trendingFiles, achievements }: DashboardContentProps) {
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const quickActions = [
    { href: "/ai-studio", label: "AI Code Studio", icon: Code2, color: "bg-blue-500/10 text-blue-500" },
    { href: "/marketplace", label: "Marketplace", icon: Store, color: "bg-green-500/10 text-green-500" },
    { href: "/community", label: "Community Chat", icon: Users, color: "bg-purple-500/10 text-purple-500" },
    { href: "/snippets", label: "Code Snippets", icon: FileCode, color: "bg-cyan-500/10 text-cyan-500" },
    { href: "/jobs", label: "Job Board", icon: Briefcase, color: "bg-amber-500/10 text-amber-500" },
    { href: "/marketplace/upload", label: "Upload File", icon: Upload, color: "bg-orange-500/10 text-orange-500" },
  ]

  const stats = [
    { label: "Total Purchases", value: profile.total_purchases, icon: ShoppingCart },
    { label: "Total Sales", value: formatCurrency(profile.total_sales), icon: DollarSign },
    { label: "Files Uploaded", value: profile.files_uploaded, icon: FileUp },
    { label: "Messages Sent", value: profile.messages_sent, icon: MessageSquare },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {profile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {greeting()}, {profile.username}
              {profile.is_admin && (
                <span className="inline-flex items-center text-yellow-500">
                  <Crown className="w-5 h-5" />
                  <BadgeCheck className="w-5 h-5 text-primary" />
                </span>
              )}
              {!profile.is_admin && profile.is_verified && <BadgeCheck className="w-5 h-5 text-primary" />}
            </h1>
            <p className="text-muted-foreground">Welcome back to NovaCode Labs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-primary">
              {profile.is_admin ? "∞" : formatCurrency(profile.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="bg-card/50 border-border/50 hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <LeaderboardSection />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </div>
            <Link href="/profile/transactions">
              <Button variant="ghost" size="sm" className="text-primary">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Start by browsing the marketplace!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === "sale" || tx.type === "gift" || tx.type === "topup"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.created_at)} at {formatTime(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        tx.type === "sale" || tx.type === "gift" || tx.type === "topup"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {tx.type === "sale" || tx.type === "gift" || tx.type === "topup" ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending on Marketplace */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Trending on Marketplace
              </CardTitle>
              <CardDescription>Top files this week</CardDescription>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="text-primary">
                Browse <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {trendingFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Store className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No files yet</p>
                <p className="text-sm">Be the first to upload!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trendingFiles.map((file, index) => (
                  <Link key={file.id} href={`/marketplace/${file.id}`}>
                    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{file.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{file.profiles?.username}</span>
                            {file.profiles?.is_verified && <BadgeCheck className="w-3 h-3 text-primary" />}
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              {file.average_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">{formatCurrency(file.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Achievements</CardTitle>
            <CardDescription>Badges you have earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => (
                <Badge key={achievement.id} variant="secondary" className="px-3 py-1.5 text-sm">
                  <Star className="w-4 h-4 mr-1.5 text-yellow-500" />
                  {achievement.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
