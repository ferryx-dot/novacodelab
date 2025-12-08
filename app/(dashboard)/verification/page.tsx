"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Shield, Star, Zap } from "lucide-react"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

const VERIFICATION_PRICE = 5000

export default function VerificationPage() {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()
        if (data) setUser(data)
      }
    }
    fetchUser()
  }, [])

  const handleSubscribe = async () => {
    if (!user) return

    if (user.balance < VERIFICATION_PRICE) {
      toast.error("Insufficient balance", {
        description: `You need $${VERIFICATION_PRICE.toLocaleString()} to subscribe. Your balance: $${user.balance.toLocaleString()}`,
      })
      return
    }

    setIsLoading(true)

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error } = await supabase
      .from("profiles")
      .update({
        is_verified: true,
        verification_expires_at: expiresAt.toISOString(),
        balance: user.balance - VERIFICATION_PRICE,
      })
      .eq("id", user.id)

    if (!error) {
      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "verification",
        amount: -VERIFICATION_PRICE,
        balance_after: user.balance - VERIFICATION_PRICE,
        description: "Verification badge subscription (1 month)",
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "verification",
        title: "Verification Active!",
        message: "You are now a verified member of NovaCode Labs!",
      })

      setUser({
        ...user,
        is_verified: true,
        verification_expires_at: expiresAt.toISOString(),
        balance: user.balance - VERIFICATION_PRICE,
      })

      toast.success("You're now verified!", {
        description: "Enjoy your verified status and all its benefits!",
      })
    }

    setIsLoading(false)
  }

  const handleCancel = async () => {
    if (!user) return
    setIsLoading(true)

    const { error } = await supabase
      .from("profiles")
      .update({
        is_verified: false,
        verification_expires_at: null,
      })
      .eq("id", user.id)

    if (!error) {
      setUser({
        ...user,
        is_verified: false,
        verification_expires_at: null,
      })
      toast.success("Verification cancelled")
    }

    setIsLoading(false)
  }

  const benefits = [
    { icon: Check, text: "Blue checkmark badge on your profile" },
    { icon: Star, text: "Priority in marketplace search results" },
    { icon: Shield, text: "Increased trust and credibility" },
    { icon: Zap, text: "Access to verified-only features" },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verification</h1>
        <p className="text-muted-foreground mt-1">Get verified and stand out from the crowd</p>
      </div>

      {user?.is_admin && (
        <Card className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Crown className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Admin Status <span className="text-amber-500">👑✓</span>
                </h3>
                <p className="text-muted-foreground">You have permanent admin verification with all privileges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!user?.is_admin && (
        <>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Verified Badge
                    <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">✓</Badge>
                  </CardTitle>
                  <CardDescription>Show everyone you're a trusted member</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">${VERIFICATION_PRICE.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {user?.is_verified ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">You're Verified!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your verification expires on{" "}
                      {user.verification_expires_at && new Date(user.verification_expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleCancel} disabled={isLoading} className="w-full">
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <Button onClick={handleSubscribe} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? "Processing..." : `Subscribe for $${VERIFICATION_PRICE.toLocaleString()}/month`}
                </Button>
              )}

              {user && !user.is_verified && user.balance < VERIFICATION_PRICE && (
                <p className="text-sm text-center text-muted-foreground">
                  Your balance: ${user.balance.toLocaleString()}. You need $
                  {(VERIFICATION_PRICE - user.balance).toLocaleString()} more.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
