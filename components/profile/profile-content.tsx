"use client"
import type { Profile, MarketplaceFile, Purchase, Transaction, Achievement, Favorite } from "@/lib/types"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Crown,
  BadgeCheck,
  Star,
  Calendar,
  Upload,
  Download,
  DollarSign,
  Heart,
  Settings,
  ExternalLink,
  Eye,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

interface ProfileContentProps {
  profile: Profile
  uploads: MarketplaceFile[]
  purchases: (Purchase & { files: MarketplaceFile; seller: { username: string } })[]
  transactions: (Transaction & { other_party?: { username: string } })[]
  achievements: Achievement[]
  favorites: (Favorite & {
    files: MarketplaceFile & { profiles: { username: string; avatar_url: string | null; is_verified: boolean } }
  })[]
  isOwnProfile: boolean
}

export function ProfileContent({
  profile,
  uploads,
  purchases,
  transactions,
  achievements,
  favorites,
  isOwnProfile,
}: ProfileContentProps) {
  const getUserBadge = () => {
    if (profile.is_admin) {
      return (
        <span className="inline-flex items-center gap-0.5 text-yellow-500">
          <Crown className="w-5 h-5" />
          <BadgeCheck className="w-5 h-5 text-primary" />
        </span>
      )
    }
    if (profile.is_verified) {
      return <BadgeCheck className="w-5 h-5 text-primary" />
    }
    return null
  }

  const totalEarnings = uploads.reduce((sum, file) => sum + file.download_count * file.price, 0)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Link href="/profile/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{profile.username}</h1>
                  {getUserBadge()}
                  {profile.reputation_score > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {profile.reputation_score.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Member since {formatDate(profile.created_at)}
                </p>
              </div>

              {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {profile.is_admin ? "∞" : formatCurrency(profile.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">Balance</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{profile.files_uploaded}</p>
                  <p className="text-xs text-muted-foreground">Files Uploaded</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{profile.total_purchases}</p>
                  <p className="text-xs text-muted-foreground">Purchases</p>
                </div>
                <div className="text-center p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(profile.total_sales)}</p>
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => (
                <Badge key={achievement.id} variant="secondary" className="px-3 py-1.5">
                  <Star className="w-4 h-4 mr-1.5 text-yellow-500" />
                  {achievement.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="uploads" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="uploads" className="flex items-center gap-1">
            <Upload className="w-4 h-4" />
            My Uploads ({uploads.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Uploads Tab */}
        <TabsContent value="uploads">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Uploads</CardTitle>
                <CardDescription>Files you&apos;re selling on the marketplace</CardDescription>
              </div>
              <Link href="/marketplace/upload">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {uploads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No uploads yet</p>
                  <p className="text-sm">Start selling by uploading your first file!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploads.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <Link href={`/marketplace/${file.id}`} className="font-medium hover:text-primary">
                          {file.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {file.download_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {file.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {file.average_rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            {formatCurrency(file.download_count * file.price)} earned
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{formatCurrency(file.price)}</span>
                        <Link href={`/marketplace/${file.id}`}>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>My Purchases</CardTitle>
              <CardDescription>Files you&apos;ve purchased from the marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No purchases yet</p>
                  <Link href="/marketplace">
                    <Button variant="link" className="text-primary">
                      Browse the marketplace
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                    >
                      <div>
                        <Link href={`/marketplace/${purchase.file_id}`} className="font-medium hover:text-primary">
                          {purchase.files?.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          From {purchase.seller?.username} • {formatDate(purchase.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{formatCurrency(purchase.amount)}</span>
                        {purchase.files?.file_url && (
                          <a href={purchase.files.file_url} download>
                            <Button size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Favorites</CardTitle>
              <CardDescription>Files you&apos;ve saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No favorites yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                    >
                      <div>
                        <Link href={`/marketplace/${fav.file_id}`} className="font-medium hover:text-primary">
                          {fav.files?.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">By {fav.files?.profiles?.username}</p>
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(fav.files?.price || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All your financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Other Party</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">{formatDateTime(tx.created_at)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.type === "sale" || tx.type === "gift" || tx.type === "topup" ? "default" : "secondary"
                            }
                            className={
                              tx.type === "sale" || tx.type === "gift" || tx.type === "topup"
                                ? "bg-green-500/10 text-green-500"
                                : ""
                            }
                          >
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                        <TableCell>{tx.other_party?.username || "-"}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(tx.balance_after)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
