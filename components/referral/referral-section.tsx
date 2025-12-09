"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, LinkIcon, Copy, Check, DollarSign, UserPlus, Trophy, Gift, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"

interface ReferralData {
  referralCode: string
  referralLink: string
  totalReferrals: number
  successfulSignups: number
  totalEarnings: number
  conversionRate: number
  recentReferrals: Array<{
    username: string
    date: string
    earned: number
  }>
}

const MILESTONES = [
  { count: 5, bonus: 50, badge: null },
  { count: 10, bonus: 150, badge: null },
  { count: 50, bonus: 1000, badge: "Influencer" },
]

export function ReferralSection() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const res = await fetch("/api/referrals")
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch referral data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const handleCopy = async () => {
    if (data) {
      await navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateNewCode = async () => {
    try {
      const res = await fetch("/api/referrals/generate", { method: "POST" })
      const json = await res.json()
      setData((prev) => (prev ? { ...prev, referralCode: json.code, referralLink: json.link } : null))
    } catch (error) {
      console.error("Failed to generate referral code:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Link</label>
            <div className="flex gap-2">
              <Input readOnly value={data?.referralLink || "Generate a referral link"} className="font-mono text-sm" />
              <Button onClick={handleCopy} disabled={!data?.referralLink}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {!data?.referralCode && (
              <Button onClick={generateNewCode} variant="outline" className="mt-2 bg-transparent">
                <LinkIcon className="w-4 h-4 mr-2" />
                Generate Referral Link
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Total Invites</span>
              </div>
              <p className="text-2xl font-bold">{data?.totalReferrals || 0}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Signups</span>
              </div>
              <p className="text-2xl font-bold">{data?.successfulSignups || 0}</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Earned</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(data?.totalEarnings || 0)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm">Conversion</span>
              </div>
              <p className="text-2xl font-bold">{data?.conversionRate || 0}%</p>
            </div>
          </div>

          {/* Reward Info */}
          <div className="p-4 border rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-semibold">Earn $100 per referral!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              When someone signs up using your referral link, you earn $100 automatically credited to your account.
            </p>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Milestones
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {MILESTONES.map((milestone) => {
                const achieved = (data?.successfulSignups || 0) >= milestone.count
                return (
                  <div
                    key={milestone.count}
                    className={`p-3 rounded-lg border ${
                      achieved ? "bg-green-500/10 border-green-500/30" : "bg-muted/50"
                    }`}
                  >
                    <p className="font-bold">{milestone.count} referrals</p>
                    <p className="text-sm text-green-500">+{formatCurrency(milestone.bonus)} bonus</p>
                    {milestone.badge && (
                      <Badge className="mt-1" variant={achieved ? "default" : "secondary"}>
                        {milestone.badge}
                      </Badge>
                    )}
                    {achieved && <Check className="w-4 h-4 text-green-500 mt-1" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          {data?.recentReferrals && data.recentReferrals.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="space-y-2">
                {data.recentReferrals.map((referral, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{referral.username} signed up!</p>
                      <p className="text-sm text-muted-foreground">{referral.date}</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      +{formatCurrency(referral.earned)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
