"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Package, Plus, Percent, ShoppingCart, BadgeCheck, FileCode } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import type { FileBundle, MarketplaceFile } from "@/lib/types"
import { useRouter } from "next/navigation"

interface BundleWithDetails extends FileBundle {
  items: { files: Pick<MarketplaceFile, "id" | "title" | "price" | "category"> | null }[]
  creator?: { username: string; avatar_url: string | null; is_verified: boolean }
}

interface BundlesContentProps {
  bundles: BundleWithDetails[]
  myBundles: FileBundle[]
  myFiles: Pick<MarketplaceFile, "id" | "title" | "price" | "category">[]
  currentUserId: string
}

export function BundlesContent({ bundles, myBundles, myFiles, currentUserId }: BundlesContentProps) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [newBundle, setNewBundle] = useState({
    name: "",
    description: "",
    discount_percentage: "20",
  })

  const calculateBundleValue = (bundle: BundleWithDetails) => {
    return bundle.items.reduce((sum, item) => sum + (item.files?.price || 0), 0)
  }

  const calculateBundlePrice = (bundle: BundleWithDetails) => {
    const value = calculateBundleValue(bundle)
    return value * (1 - bundle.discount_percentage / 100)
  }

  const selectedFilesValue = myFiles.filter((f) => selectedFiles.includes(f.id)).reduce((sum, f) => sum + f.price, 0)

  const bundlePrice = selectedFilesValue * (1 - Number.parseFloat(newBundle.discount_percentage || "0") / 100)

  const handleCreateBundle = async () => {
    if (!newBundle.name || selectedFiles.length < 2) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBundle,
          discount_percentage: Number.parseFloat(newBundle.discount_percentage),
          file_ids: selectedFiles,
        }),
      })

      if (res.ok) {
        setIsCreateOpen(false)
        setNewBundle({ name: "", description: "", discount_percentage: "20" })
        setSelectedFiles([])
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseBundle = async (bundleId: string) => {
    const res = await fetch("/api/bundles/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bundle_id: bundleId }),
    })

    if (res.ok) {
      router.refresh()
    }
  }

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            File Bundles
          </h1>
          <p className="text-muted-foreground">Save money with curated file bundles</p>
        </div>
        {myFiles.length >= 2 && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Bundle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create a Bundle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Bundle Name</Label>
                  <Input
                    value={newBundle.name}
                    onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                    placeholder="e.g., Ultimate React Starter Pack"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newBundle.description}
                    onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                    placeholder="Describe what's included..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newBundle.discount_percentage}
                      onChange={(e) => setNewBundle({ ...newBundle, discount_percentage: e.target.value })}
                      className="w-24"
                      min="5"
                      max="50"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Files (min 2)</Label>
                  <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                    {myFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-accent/50">
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFile(file.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.title}</p>
                          <p className="text-xs text-muted-foreground">{file.category}</p>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(file.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedFiles.length >= 2 && (
                  <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Individual Value:</span>
                      <span className="line-through text-muted-foreground">{formatCurrency(selectedFilesValue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span className="text-green-500">-{newBundle.discount_percentage}%</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Bundle Price:</span>
                      <span className="text-primary">{formatCurrency(bundlePrice)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateBundle}
                  disabled={!newBundle.name || selectedFiles.length < 2 || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating..." : "Create Bundle"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Bundles</TabsTrigger>
          <TabsTrigger value="my-bundles">My Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {bundles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bundles available</h3>
                <p className="text-muted-foreground">Be the first to create a bundle</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundles.map((bundle) => {
                const value = calculateBundleValue(bundle)
                const price = calculateBundlePrice(bundle)
                const savings = value - price

                return (
                  <Card key={bundle.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{bundle.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={bundle.creator?.avatar_url || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {bundle.creator?.username?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{bundle.creator?.username}</span>
                            {bundle.creator?.is_verified && <BadgeCheck className="w-3 h-3 text-primary" />}
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500">
                          <Percent className="w-3 h-3 mr-1" />
                          {bundle.discount_percentage}% OFF
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bundle.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{bundle.description}</p>
                      )}

                      {/* Files in bundle */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {bundle.items.length} files included:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {bundle.items.slice(0, 4).map((item) => (
                            <Badge key={item.files?.id} variant="secondary" className="text-xs">
                              <FileCode className="w-3 h-3 mr-1" />
                              {item.files?.title}
                            </Badge>
                          ))}
                          {bundle.items.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{bundle.items.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-accent/50 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Value:</span>
                          <span className="line-through text-muted-foreground">{formatCurrency(value)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">You Save:</span>
                          <span className="text-green-500">{formatCurrency(savings)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t">
                          <span>Bundle Price:</span>
                          <span className="text-primary text-lg">{formatCurrency(price)}</span>
                        </div>
                      </div>

                      {bundle.creator_id === currentUserId ? (
                        <Button variant="outline" className="w-full bg-transparent" disabled>
                          Your Bundle
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => handlePurchaseBundle(bundle.id)}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Bundle
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-bundles" className="space-y-4">
          {myBundles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bundles created</h3>
                <p className="text-muted-foreground mb-4">Create a bundle to sell multiple files together</p>
                {myFiles.length >= 2 && (
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Bundle
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myBundles.map((bundle) => (
                <Card key={bundle.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{bundle.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bundle.discount_percentage}% discount - {bundle.total_sales} sales
                      </p>
                    </div>
                    <Badge variant={bundle.is_active ? "default" : "secondary"}>
                      {bundle.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
