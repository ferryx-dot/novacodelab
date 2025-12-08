"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { MarketplaceFile, Profile } from "@/lib/types"
import { formatCurrency, formatFileSize } from "@/lib/utils/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Upload,
  Star,
  Download,
  Heart,
  Flame,
  Clock,
  BadgeCheck,
  Filter,
  SlidersHorizontal,
  FileCode,
  FileArchive,
  FileImage,
  FileText,
  File,
  ShoppingBag,
} from "lucide-react"

type FileWithProfile = MarketplaceFile & {
  profiles: Pick<Profile, "id" | "username" | "avatar_url" | "is_verified" | "reputation_score">
}

interface MarketplaceContentProps {
  files: FileWithProfile[]
  trendingFiles: FileWithProfile[]
  purchasedFileIds: string[]
  favoriteFileIds: string[]
  currentUserId: string
}

const categories = [
  "All",
  "Scripts",
  "Templates",
  "Components",
  "APIs",
  "Bots",
  "Tools",
  "Games",
  "Mobile",
  "Web",
  "AI/ML",
  "Other",
]

const fileTypeIcons: Record<string, typeof File> = {
  zip: FileArchive,
  rar: FileArchive,
  tar: FileArchive,
  "7z": FileArchive,
  js: FileCode,
  ts: FileCode,
  py: FileCode,
  jsx: FileCode,
  tsx: FileCode,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
}

function getFileIcon(fileType: string) {
  const ext = fileType.toLowerCase().replace(".", "")
  return fileTypeIcons[ext] || File
}

export function MarketplaceContent({
  files,
  trendingFiles,
  purchasedFileIds,
  favoriteFileIds,
  currentUserId,
}: MarketplaceContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  const filteredFiles = useMemo(() => {
    let result = [...files]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (file) =>
          file.title.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query) ||
          file.tags?.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((file) => file.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      result = result.filter((file) => {
        if (max) return file.price >= min && file.price <= max
        return file.price >= min
      })
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const minRating = Number(ratingFilter)
      result = result.filter((file) => file.average_rating >= minRating)
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.download_count - a.download_count)
        break
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.average_rating - a.average_rating)
        break
    }

    return result
  }, [files, searchQuery, selectedCategory, sortBy, priceRange, ratingFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Discover and purchase premium code, templates, and tools</p>
        </div>
        <Link href="/marketplace/upload">
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-10">$0 - $10</SelectItem>
              <SelectItem value="10-50">$10 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-500">$100 - $500</SelectItem>
              <SelectItem value="500-">$500+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <Star className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            New Arrivals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredFiles.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No files found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  isPurchased={purchasedFileIds.includes(file.id)}
                  isFavorited={favoriteFileIds.includes(file.id)}
                  isOwner={file.user_id === currentUserId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingFiles.map((file, index) => (
              <FileCard
                key={file.id}
                file={file}
                isPurchased={purchasedFileIds.includes(file.id)}
                isFavorited={favoriteFileIds.includes(file.id)}
                isOwner={file.user_id === currentUserId}
                trendingRank={index + 1}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.slice(0, 12).map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isPurchased={purchasedFileIds.includes(file.id)}
                isFavorited={favoriteFileIds.includes(file.id)}
                isOwner={file.user_id === currentUserId}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface FileCardProps {
  file: FileWithProfile
  isPurchased: boolean
  isFavorited: boolean
  isOwner: boolean
  trendingRank?: number
}

function FileCard({ file, isPurchased, isFavorited, isOwner, trendingRank }: FileCardProps) {
  const FileIcon = getFileIcon(file.file_type)

  return (
    <Link href={`/marketplace/${file.id}`}>
      <Card className="bg-card/50 border-border/50 hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group h-full overflow-hidden">
        {/* Preview Image or Icon */}
        <div className="relative h-40 bg-secondary/30 flex items-center justify-center">
          {file.preview_image_url ? (
            <img
              src={file.preview_image_url || "/placeholder.svg"}
              alt={file.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileIcon className="w-16 h-16 text-muted-foreground/50" />
          )}

          {/* Trending badge */}
          {trendingRank && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/90 text-white text-xs font-bold">
              <Flame className="w-3 h-3" />#{trendingRank}
            </div>
          )}

          {/* Favorite button */}
          <button
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              isFavorited ? "bg-red-500/90 text-white" : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => {
              e.preventDefault()
              // Toggle favorite (handled by action)
            }}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
          </button>

          {/* Status badges */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {isPurchased && <Badge className="bg-green-500/90 text-white text-xs">Owned</Badge>}
            {isOwner && <Badge className="bg-primary/90 text-white text-xs">Your File</Badge>}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {file.title}
          </h3>

          {/* Seller info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={file.profiles?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {file.profiles?.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">{file.profiles?.username}</span>
            {file.profiles?.is_verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                {file.average_rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {file.download_count}
              </span>
            </div>
            <span>{formatFileSize(file.file_size)}</span>
          </div>

          {/* Category and Price */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Badge variant="secondary" className="text-xs">
              {file.category}
            </Badge>
            <span className="font-bold text-primary text-lg">{formatCurrency(file.price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
