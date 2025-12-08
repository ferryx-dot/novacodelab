"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, FileCode, Loader2, ArrowLeft, DollarSign, ImageIcon } from "lucide-react"
import Link from "next/link"
import { formatFileSize } from "@/lib/utils/format"

const categories = [
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

interface UploadFileContentProps {
  userId: string
}

export function UploadFileContent({ userId }: UploadFileContentProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    tags: "",
    demoVideoUrl: "",
  })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handlePreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0]
      setPreviewImage(imageFile)
      setPreviewImageUrl(URL.createObjectURL(imageFile))
    }
  }

  const extractPreviewContent = async (file: File): Promise<string | null> => {
    const codeExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".go",
      ".rs",
      ".php",
      ".rb",
      ".html",
      ".css",
      ".json",
      ".md",
    ]
    const fileName = file.name.toLowerCase()

    if (codeExtensions.some((ext) => fileName.endsWith(ext))) {
      const text = await file.text()
      const lines = text.split("\n").slice(0, 20)
      return lines.join("\n")
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !formData.title || !formData.price || !formData.category) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}-${file.name}`

      const { data: fileData, error: fileError } = await supabase.storage
        .from("marketplace-files")
        .upload(fileName, file)

      if (fileError) {
        // If bucket doesn't exist, create it
        if (fileError.message.includes("not found")) {
          alert("Storage not configured. Please contact admin.")
          setIsUploading(false)
          return
        }
        throw fileError
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("marketplace-files").getPublicUrl(fileName)

      let previewImagePublicUrl = null

      // Upload preview image if provided
      if (previewImage) {
        const previewFileName = `${userId}/previews/${Date.now()}-${previewImage.name}`
        const { error: previewError } = await supabase.storage
          .from("marketplace-files")
          .upload(previewFileName, previewImage)

        if (!previewError) {
          const { data: previewUrlData } = supabase.storage.from("marketplace-files").getPublicUrl(previewFileName)
          previewImagePublicUrl = previewUrlData.publicUrl
        }
      }

      // Extract preview content for code files
      const previewContent = await extractPreviewContent(file)

      // Create file record
      const { error: dbError } = await supabase.from("files").insert({
        user_id: userId,
        title: formData.title,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        file_url: urlData.publicUrl,
        file_type: fileExt || "unknown",
        file_size: file.size,
        preview_content: previewContent,
        preview_image_url: previewImagePublicUrl,
        demo_video_url: formData.demoVideoUrl || null,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : null,
      })

      if (dbError) throw dbError

      // Update user's files_uploaded count
      const { data: profile } = await supabase.from("profiles").select("files_uploaded").eq("id", userId).single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({ files_uploaded: profile.files_uploaded + 1 })
          .eq("id", userId)
      }

      // Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "upload",
        title: "File Uploaded",
        message: `Your file "${formData.title}" is now live on the marketplace!`,
      })

      router.push("/marketplace")
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/marketplace">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </Link>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Upload File to Marketplace</CardTitle>
          <CardDescription>Share your code, templates, or tools with the community and earn money</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <Label>File *</Label>
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileCode className="w-8 h-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
                    <p className="text-xs text-muted-foreground">
                      Supports ZIP, RAR, TAR, code files, documents, and more
                    </p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Preview Image */}
            <div>
              <Label>Preview Image (optional)</Label>
              <div className="mt-2 flex items-center gap-4">
                {previewImageUrl ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                    <img
                      src={previewImageUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-black/50"
                      onClick={() => {
                        setPreviewImage(null)
                        setPreviewImageUrl(null)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="w-32 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add image</span>
                    <input type="file" accept="image/*" onChange={handlePreviewImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., React Dashboard Template"
                required
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your file does, features, requirements, etc."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., react, typescript, dashboard, admin"
                className="mt-2"
              />
            </div>

            {/* Demo Video URL */}
            <div>
              <Label htmlFor="demoVideoUrl">Demo Video URL (optional)</Label>
              <Input
                id="demoVideoUrl"
                type="url"
                value={formData.demoVideoUrl}
                onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-2"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isUploading || !file || !formData.title || !formData.price || !formData.category}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload to Marketplace
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
