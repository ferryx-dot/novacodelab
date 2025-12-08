"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { MarketplaceFile, Profile, Review } from "@/lib/types"
import { formatCurrency, formatDate, formatFileSize, generateTransactionId } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Star,
  Download,
  Heart,
  Eye,
  Calendar,
  BadgeCheck,
  ShoppingCart,
  ArrowLeft,
  FileCode,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

type FileWithProfile = MarketplaceFile & {
  profiles: Pick<Profile, "id" | "username" | "avatar_url" | "is_verified" | "reputation_score" | "bio"> & {
    created_at: string
  }
}

type ReviewWithProfile = Review & {
  profiles: Pick<Profile, "username" | "avatar_url" | "is_verified">
}

interface FileDetailContentProps {
  file: FileWithProfile
  reviews: ReviewWithProfile[]
  isPurchased: boolean
  isFavorited: boolean
  isOwner: boolean
  currentUserId: string
  userBalance: number
  isAdmin: boolean
}

export function FileDetailContent({
  file,
  reviews,
  isPurchased,
  isFavorited,
  isOwner,
  currentUserId,
  userBalance,
  isAdmin,
}: FileDetailContentProps) {
  const router = useRouter()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [favorited, setFavorited] = useState(isFavorited)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const canPurchase = !isPurchased && !isOwner && (isAdmin || userBalance >= file.price)
  const hasReviewed = reviews.some((r) => r.reviewer_id === currentUserId)

  const handlePurchase = async () => {
    setIsPurchasing(true)
    const supabase = createClient()

    try {
      const transactionId = generateTransactionId()

      // Create purchase record
      const { error: purchaseError } = await supabase.from("purchases").insert({
        buyer_id: currentUserId,
        seller_id: file.user_id,
        file_id: file.id,
        amount: file.price,
        transaction_id: transactionId,
      })

      if (purchaseError) throw purchaseError

      // Update buyer's balance (deduct)
      if (!isAdmin) {
        const { error: buyerError } = await supabase
          .from("profiles")
          .update({
            balance: userBalance - file.price,
            total_purchases:
              (await supabase.from("profiles").select("total_purchases").eq("id", currentUserId).single()).data
                ?.total_purchases + 1,
          })
          .eq("id", currentUserId)

        if (buyerError) throw buyerError
      }

      // Update seller's balance (add) and stats
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("balance, total_sales")
        .eq("id", file.user_id)
        .single()

      if (sellerProfile) {
        await supabase
          .from("profiles")
          .update({
            balance: sellerProfile.balance + file.price,
            total_sales: sellerProfile.total_sales + file.price,
          })
          .eq("id", file.user_id)
      }

      // Create transaction records
      const newBuyerBalance = isAdmin ? userBalance : userBalance - file.price

      await supabase.from("transactions").insert([
        {
          user_id: currentUserId,
          type: "purchase",
          amount: -file.price,
          balance_after: newBuyerBalance,
          description: `Purchased "${file.title}"`,
          other_party_id: file.user_id,
          reference_id: file.id,
        },
        {
          user_id: file.user_id,
          type: "sale",
          amount: file.price,
          balance_after: (sellerProfile?.balance || 0) + file.price,
          description: `Sold "${file.title}"`,
          other_party_id: currentUserId,
          reference_id: file.id,
        },
      ])

      // Update file download count
      await supabase
        .from("files")
        .update({ download_count: file.download_count + 1 })
        .eq("id", file.id)

      // Create notifications
      await supabase.from("notifications").insert([
        {
          user_id: currentUserId,
          type: "purchase",
          title: "Purchase Successful",
          message: `You purchased "${file.title}" for ${formatCurrency(file.price)}`,
          reference_id: file.id,
        },
        {
          user_id: file.user_id,
          type: "sale",
          title: "New Sale!",
          message: `Your file "${file.title}" was purchased for ${formatCurrency(file.price)}`,
          reference_id: file.id,
        },
      ])

      setPurchaseSuccess(true)
      setTimeout(() => {
        setShowPurchaseModal(false)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Purchase failed:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleToggleFavorite = async () => {
    const supabase = createClient()

    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", currentUserId).eq("file_id", file.id)
    } else {
      await supabase.from("favorites").insert({ user_id: currentUserId, file_id: file.id })
    }

    setFavorited(!favorited)
  }

  const handleSubmitReview = async () => {
    if (!reviewRating) return
    setIsSubmittingReview(true)
    const supabase = createClient()

    try {
      // Get the purchase ID
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("buyer_id", currentUserId)
        .eq("file_id", file.id)
        .single()

      if (!purchase) throw new Error("Purchase not found")

      // Create review
      await supabase.from("reviews").insert({
        purchase_id: purchase.id,
        reviewer_id: currentUserId,
        file_id: file.id,
        rating: reviewRating,
        comment: reviewComment || null,
      })

      // Update file's average rating
      const { data: allReviews } = await supabase.from("reviews").select("rating").eq("file_id", file.id)

      if (allReviews) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await supabase
          .from("files")
          .update({ average_rating: avgRating, total_ratings: allReviews.length })
          .eq("id", file.id)
      }

      setShowReviewForm(false)
      router.refresh()
    } catch (error) {
      console.error("Review failed:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/marketplace">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Header */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Preview */}
                <div className="w-full md:w-64 h-48 bg-secondary/30 rounded-lg flex items-center justify-center overflow-hidden">
                  {file.preview_image_url ? (
                    <img
                      src={file.preview_image_url || "/placeholder.svg"}
                      alt={file.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileCode className="w-20 h-20 text-muted-foreground/50" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h1 className="text-2xl font-bold text-foreground">{file.title}</h1>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFavorite}
                        className={favorited ? "text-red-500" : "text-muted-foreground"}
                      >
                        <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{file.category}</Badge>
                      <Badge variant="outline">{file.file_type.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground">{formatFileSize(file.file_size)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {file.average_rating.toFixed(1)} ({file.total_ratings} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {file.download_count} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {file.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(file.created_at)}
                    </span>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center gap-4 pt-4">
                    <span className="text-3xl font-bold text-primary">{formatCurrency(file.price)}</span>
                    {isPurchased || isOwner ? (
                      <a href={file.file_url} download>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    ) : (
                      <Button
                        onClick={() => setShowPurchaseModal(true)}
                        disabled={!canPurchase}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {!canPurchase && !isAdmin ? "Insufficient Balance" : "Buy Now"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {file.description || "No description provided."}
              </p>
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {file.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Preview */}
          {file.preview_content && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Code Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-secondary/50 rounded-lg overflow-x-auto text-sm">
                  <code className="text-muted-foreground">{file.preview_content}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reviews ({reviews.length})</CardTitle>
              {isPurchased && !hasReviewed && (
                <Button onClick={() => setShowReviewForm(true)} variant="outline" size="sm">
                  Write Review
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <div className="mb-6 p-4 border border-border rounded-lg space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this file..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Submit Review
                    </Button>
                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.profiles?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {review.profiles?.username?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.profiles?.username}</span>
                          {review.profiles?.is_verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(review.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Seller Info */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/profile/${file.profiles?.id}`}>
                <div className="flex items-center gap-3 hover:bg-accent/50 p-2 rounded-lg -mx-2 transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={file.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {file.profiles?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{file.profiles?.username}</span>
                      {file.profiles?.is_verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {file.profiles?.reputation_score?.toFixed(1) || "0.0"} reputation
                    </div>
                  </div>
                </div>
              </Link>

              {file.profiles?.bio && <p className="text-sm text-muted-foreground">{file.profiles.bio}</p>}

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Member since {formatDate(file.profiles?.created_at || file.created_at)}</p>
              </div>

              <Link href={`/profile/${file.profiles?.id}`}>
                <Button variant="outline" className="w-full bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Demo Video */}
          {file.demo_video_url && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Demo Video</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={file.demo_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch Demo
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{purchaseSuccess ? "Purchase Successful!" : "Confirm Purchase"}</DialogTitle>
            <DialogDescription>
              {purchaseSuccess
                ? "Your purchase has been completed successfully."
                : `You are about to purchase "${file.title}"`}
            </DialogDescription>
          </DialogHeader>

          {purchaseSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-muted-foreground">Redirecting to download...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File:</span>
                  <span className="font-medium">{file.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-primary">{formatCurrency(file.price)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span>{isAdmin ? "∞" : formatCurrency(userBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">After Purchase:</span>
                  <span className="font-medium">{isAdmin ? "∞" : formatCurrency(userBalance - file.price)}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePurchase} disabled={isPurchasing}>
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Confirm Purchase
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
