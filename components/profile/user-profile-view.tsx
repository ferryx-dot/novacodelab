"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, Calendar, FileText, Gift } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import type { Profile, MarketplaceFile } from "@/lib/types"

interface UserProfileViewProps {
  userId: string
}

export function UserProfileView({ userId }: UserProfileViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [userFiles, setUserFiles] = useState<MarketplaceFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [giftModal, setGiftModal] = useState(false)
  const [giftAmount, setGiftAmount] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Fetch current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (currentProfile) setCurrentUser(currentProfile)
      }

      // Fetch target profile
      const { data: targetProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (targetProfile) setProfile(targetProfile)

      // Fetch user's files
      const { data: files } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
      if (files) setUserFiles(files)

      setIsLoading(false)
    }
    fetchData()
  }, [userId])

  const handleGiftMoney = async () => {
    if (!profile || !giftAmount || !currentUser?.is_admin) return

    const amount = Number.parseFloat(giftAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount")
      return
    }

    const newBalance = profile.balance + amount

    const { error } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", profile.id)

    if (!error) {
      await supabase.from("transactions").insert({
        user_id: profile.id,
        type: "gift",
        amount: amount,
        balance_after: newBalance,
        description: "Gift from Admin",
      })

      await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "gift",
        title: "You received a gift!",
        message: `You received $${amount.toLocaleString()} from Admin!`,
      })

      setProfile({ ...profile, balance: newBalance })
      toast.success(`Sent $${amount.toLocaleString()} to ${profile.username}`)
      setGiftModal(false)
      setGiftAmount("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">User not found</h2>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/20">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {profile.is_admin && <span className="text-amber-500">👑✓</span>}
                {profile.is_verified && !profile.is_admin && <Badge className="bg-blue-500/20 text-blue-400">✓</Badge>}
              </div>
              {profile.bio && <p className="text-muted-foreground mb-2">{profile.bio}</p>}
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(profile.created_at), "MMM yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {profile.reputation_score.toFixed(1)} rating
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {profile.is_admin ? <span className="text-amber-500">∞</span> : `$${profile.balance.toLocaleString()}`}
              </p>
              <p className="text-sm text-muted-foreground">Balance</p>
              {currentUser?.is_admin && !profile.is_admin && (
                <Button size="sm" className="mt-2" onClick={() => setGiftModal(true)}>
                  <Gift className="h-4 w-4 mr-2" />
                  Gift Money
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{profile.files_uploaded}</p>
            <p className="text-sm text-muted-foreground">Files</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">${profile.total_sales.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Sales</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{profile.total_purchases}</p>
            <p className="text-sm text-muted-foreground">Purchases</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{profile.messages_sent}</p>
            <p className="text-sm text-muted-foreground">Messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Files */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Files for Sale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userFiles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No files for sale</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userFiles.map((file) => (
                <Card key={file.id} className="bg-background/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium truncate">{file.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold">${file.price}</span>
                      <Badge variant="outline">{file.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{file.download_count} downloads</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {file.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gift Money Dialog */}
      <Dialog open={giftModal} onOpenChange={setGiftModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gift Money</DialogTitle>
            <DialogDescription>Send money to {profile.username}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Amount (USD)"
              value={giftAmount}
              onChange={(e) => setGiftAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleGiftMoney}>Send Gift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
