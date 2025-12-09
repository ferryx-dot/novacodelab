"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  DollarSign,
  Upload,
  MessageSquare,
  ShoppingCart,
  Download,
  Crown,
  BadgeCheck,
  Medal,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"

interface LeaderboardUser {
  id: string
  username: string
  avatar_url: string | null
  is_verified: boolean
  total_sales?: number
  files_uploaded?: number
  messages_sent?: number
  total_purchases?: number
}

interface TopFile {
  id: string
  title: string
  download_count: number
  users?: { username: string }
}

interface LeaderboardPageProps {
  topEarners: LeaderboardUser[]
  topUploaders: LeaderboardUser[]
  topChatters: LeaderboardUser[]
  topBuyers: LeaderboardUser[]
  topFiles: TopFile[]
  currentUserId: string
}

function getRankBadge(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />
  return <span className="text-muted-foreground font-mono">#{rank}</span>
}

function LeaderboardList({
  users,
  valueKey,
  formatValue,
  currentUserId,
}: {
  users: LeaderboardUser[]
  valueKey: keyof LeaderboardUser
  formatValue: (v: number) => string
  currentUserId: string
}) {
  return (
    <div className="space-y-2">
      {users.map((user, index) => {
        const isCurrentUser = user.id === currentUserId
        const value = (user[valueKey] as number) || 0

        return (
          <Link key={user.id} href={`/profile/${user.id}`}>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent/50 ${
                isCurrentUser ? "bg-primary/10 border border-primary/30" : ""
              } ${index < 3 ? "bg-accent/30" : ""}`}
            >
              <div className="w-8 text-center">{getRankBadge(index + 1)}</div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{user.username}</span>
                  {user.is_verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
              <span className="font-bold text-primary">{formatValue(value)}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export function LeaderboardPage({
  topEarners,
  topUploaders,
  topChatters,
  topBuyers,
  topFiles,
  currentUserId,
}: LeaderboardPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground">See who's making waves on NovaCode Labs</p>
      </div>

      <Tabs defaultValue="earners">
        <TabsList className="flex-wrap">
          <TabsTrigger value="earners" className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Top Earners
          </TabsTrigger>
          <TabsTrigger value="uploaders" className="flex items-center gap-1">
            <Upload className="w-4 h-4" />
            Top Uploaders
          </TabsTrigger>
          <TabsTrigger value="chatters" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Top Chatters
          </TabsTrigger>
          <TabsTrigger value="buyers" className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            Top Buyers
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            Popular Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earners">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Top Earners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                users={topEarners}
                valueKey="total_sales"
                formatValue={(v) => formatCurrency(v)}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploaders">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Top Uploaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                users={topUploaders}
                valueKey="files_uploaded"
                formatValue={(v) => `${v} files`}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatters">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Top Chatters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                users={topChatters}
                valueKey="messages_sent"
                formatValue={(v) => `${v.toLocaleString()} msgs`}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                Top Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                users={topBuyers}
                valueKey="total_purchases"
                formatValue={(v) => `${v} purchases`}
                currentUserId={currentUserId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Most Downloaded Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topFiles.map((file, index) => (
                  <Link key={file.id} href={`/marketplace/${file.id}`}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent/50 ${
                        index < 3 ? "bg-accent/30" : ""
                      }`}
                    >
                      <div className="w-8 text-center">{getRankBadge(index + 1)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.title}</p>
                        <p className="text-sm text-muted-foreground">by {file.users?.username}</p>
                      </div>
                      <span className="font-bold text-primary flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {file.download_count.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
