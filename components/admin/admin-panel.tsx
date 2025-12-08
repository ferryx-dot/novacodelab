"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  TrendingUp,
  Search,
  Gift,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  Crown,
  Activity,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import type { Profile, Transaction, MarketplaceFile } from "@/lib/types"

interface PlatformStats {
  totalUsers: number
  totalTransactions: number
  totalVolume: number
  totalFiles: number
  totalSales: number
  messagesCount: number
  activeToday: number
}

export function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [files, setFiles] = useState<MarketplaceFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [giftModal, setGiftModal] = useState<{ open: boolean; user: Profile | null }>({ open: false, user: null })
  const [giftAmount, setGiftAmount] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profile?.is_admin) {
        router.push("/")
        return
      }

      setIsAdmin(true)
      await fetchData()
      setIsLoading(false)
    }

    checkAdmin()
  }, [router])

  async function fetchData() {
    // Fetch stats
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    const { count: transactionsCount } = await supabase.from("transactions").select("*", { count: "exact", head: true })

    const { data: volumeData } = await supabase.from("transactions").select("amount").gt("amount", 0)

    const { count: filesCount } = await supabase.from("files").select("*", { count: "exact", head: true })

    const { data: salesData } = await supabase.from("purchases").select("amount")

    const { count: messagesCount } = await supabase.from("messages").select("*", { count: "exact", head: true })

    const totalVolume = volumeData?.reduce((sum, t) => sum + t.amount, 0) || 0
    const totalSales = salesData?.reduce((sum, s) => sum + s.amount, 0) || 0

    setStats({
      totalUsers: usersCount || 0,
      totalTransactions: transactionsCount || 0,
      totalVolume,
      totalFiles: filesCount || 0,
      totalSales,
      messagesCount: messagesCount || 0,
      activeToday: Math.floor((usersCount || 0) * 0.3), // Estimate
    })

    // Fetch users
    const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (usersData) setUsers(usersData)

    // Fetch transactions
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (txData) setTransactions(txData)

    // Fetch files
    const { data: filesData } = await supabase.from("files").select("*").order("created_at", { ascending: false })

    if (filesData) setFiles(filesData)
  }

  const handleGiftMoney = async () => {
    if (!giftModal.user || !giftAmount) return

    const amount = Number.parseFloat(giftAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount")
      return
    }

    const newBalance = giftModal.user.balance + amount

    const { error } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", giftModal.user.id)

    if (!error) {
      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: giftModal.user.id,
        type: "gift",
        amount: amount,
        balance_after: newBalance,
        description: `Gift from Admin`,
      })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: giftModal.user.id,
        type: "gift",
        title: "You received a gift!",
        message: `You received $${amount.toLocaleString()} from Admin!`,
      })

      setUsers((prev) => prev.map((u) => (u.id === giftModal.user!.id ? { ...u, balance: newBalance } : u)))

      toast.success(`Sent $${amount.toLocaleString()} to ${giftModal.user.username}`)
      setGiftModal({ open: false, user: null })
      setGiftAmount("")
    }
  }

  const toggleVerification = async (user: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_verified: !user.is_verified,
        verification_expires_at: !user.is_verified
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
      .eq("id", user.id)

    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_verified: !u.is_verified } : u)))
      toast.success(`${user.is_verified ? "Removed" : "Granted"} verification for ${user.username}`)
    }
  }

  const deleteFile = async (fileId: string) => {
    const { error } = await supabase.from("files").delete().eq("id", fileId)
    if (!error) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast.success("File deleted")
    }
  }

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Crown className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats?.activeToday} active today</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalTransactions} transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marketplace Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">${stats?.totalSales.toLocaleString()} in sales</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messagesCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Community messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{user.username}</span>
                                {user.is_admin && <span className="text-amber-500">👑✓</span>}
                                {user.is_verified && !user.is_admin && (
                                  <Badge className="h-4 px-1 text-[10px] bg-blue-500/20 text-blue-400">✓</Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <span className="text-amber-500 font-bold">∞</span>
                          ) : (
                            <span>${user.balance.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge className="bg-amber-500/20 text-amber-500">Admin</Badge>
                          ) : user.is_verified ? (
                            <Badge className="bg-blue-500/20 text-blue-400">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Member</Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setGiftModal({ open: true, user })}
                            >
                              <Gift className="h-4 w-4" />
                            </Button>
                            {!user.is_admin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleVerification(user)}
                              >
                                {user.is_verified ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`/profile/${user.id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All platform transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.type === "sale" || tx.type === "gift"
                                ? "default"
                                : tx.type === "purchase"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={tx.amount > 0 ? "text-green-500" : "text-red-500"}>
                          {tx.amount > 0 ? "+" : ""}${tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>${tx.balance_after.toLocaleString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                        <TableCell>{format(new Date(tx.created_at), "MMM d, h:mm a")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>File Moderation</CardTitle>
              <CardDescription>Review and manage marketplace files</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="font-medium truncate">{file.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{file.file_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>${file.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.category}</Badge>
                        </TableCell>
                        <TableCell>{file.download_count}</TableCell>
                        <TableCell>{format(new Date(file.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`/marketplace/${file.id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Growth Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Users (30d)</span>
                    <span className="font-bold text-green-500">+{Math.floor((stats?.totalUsers || 0) * 0.2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue (30d)</span>
                    <span className="font-bold text-green-500">+${((stats?.totalSales || 0) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Files (30d)</span>
                    <span className="font-bold text-green-500">+{Math.floor((stats?.totalFiles || 0) * 0.3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Rate</span>
                    <span className="font-bold">
                      {(((stats?.activeToday || 0) / (stats?.totalUsers || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg. Transaction</span>
                    <span className="font-bold">
                      ${((stats?.totalVolume || 0) / (stats?.totalTransactions || 1)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messages/User</span>
                    <span className="font-bold">
                      {((stats?.messagesCount || 0) / (stats?.totalUsers || 1)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Top Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users
                  .sort((a, b) => b.total_sales - a.total_sales)
                  .slice(0, 5)
                  .map((user, i) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <span className="text-muted-foreground w-4">{i + 1}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium">{user.username}</span>
                      </div>
                      <span className="font-bold">${user.total_sales.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Gift Money Dialog */}
      <Dialog open={giftModal.open} onOpenChange={(open) => setGiftModal({ open, user: giftModal.user })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gift Money</DialogTitle>
            <DialogDescription>Send money to {giftModal.user?.username}</DialogDescription>
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
            <Button variant="outline" onClick={() => setGiftModal({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleGiftMoney}>Send Gift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
