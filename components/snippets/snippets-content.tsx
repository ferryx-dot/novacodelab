"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Copy, Folder, Eye, Code, FileCode, Globe, Lock, Trash2, Edit, Check } from "lucide-react"
import type { CodeSnippet } from "@/lib/types"
import { useRouter } from "next/navigation"

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "JS" },
  { value: "typescript", label: "TypeScript", icon: "TS" },
  { value: "python", label: "Python", icon: "PY" },
  { value: "react", label: "React/JSX", icon: "⚛" },
  { value: "css", label: "CSS", icon: "CSS" },
  { value: "html", label: "HTML", icon: "HTML" },
  { value: "sql", label: "SQL", icon: "SQL" },
  { value: "bash", label: "Bash", icon: "SH" },
  { value: "json", label: "JSON", icon: "{}" },
  { value: "other", label: "Other", icon: "?" },
]

const FOLDERS = ["uncategorized", "React", "Python", "CSS", "Utils", "Components", "Hooks", "API", "Config"]

interface SnippetsContentProps {
  userSnippets: CodeSnippet[]
  publicSnippets: CodeSnippet[]
  currentUserId: string
}

export function SnippetsContent({ userSnippets, publicSnippets, currentUserId }: SnippetsContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    folder: "uncategorized",
    tags: "",
    is_public: false,
  })

  const filteredSnippets = userSnippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = !selectedFolder || snippet.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  const handleCopy = async (snippet: CodeSnippet) => {
    await navigator.clipboard.writeText(snippet.code)
    setCopiedId(snippet.id)
    setTimeout(() => setCopiedId(null), 2000)

    // Increment copy count
    fetch("/api/snippets/copy", {
      method: "POST",
      body: JSON.stringify({ snippetId: snippet.id }),
    })
  }

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSnippet,
          tags: newSnippet.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (res.ok) {
        setIsCreateOpen(false)
        setNewSnippet({
          title: "",
          description: "",
          code: "",
          language: "javascript",
          folder: "uncategorized",
          tags: "",
          is_public: false,
        })
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return

    const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
    }
  }

  const getLanguageIcon = (lang: string) => {
    return LANGUAGES.find((l) => l.value === lang)?.icon || "?"
  }

  const getFolderCounts = () => {
    const counts: Record<string, number> = {}
    userSnippets.forEach((s) => {
      counts[s.folder] = (counts[s.folder] || 0) + 1
    })
    return counts
  }

  const folderCounts = getFolderCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Code Snippets</h1>
          <p className="text-muted-foreground">Your personal collection of reusable code pieces</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Snippet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newSnippet.title}
                    onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                    placeholder="e.g., useLocalStorage Hook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={newSnippet.language}
                    onValueChange={(v) => setNewSnippet({ ...newSnippet, language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-1 rounded">{lang.icon}</span>
                            {lang.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                  placeholder="Brief description of what this snippet does"
                />
              </div>

              <div className="space-y-2">
                <Label>Code</Label>
                <Textarea
                  value={newSnippet.code}
                  onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                  placeholder="Paste your code here..."
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Select value={newSnippet.folder} onValueChange={(v) => setNewSnippet({ ...newSnippet, folder: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLDERS.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={newSnippet.tags}
                    onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
                    placeholder="react, hook, state"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {newSnippet.is_public ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{newSnippet.is_public ? "Public" : "Private"}</p>
                    <p className="text-sm text-muted-foreground">
                      {newSnippet.is_public ? "Anyone can see this snippet" : "Only you can see this snippet"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={newSnippet.is_public}
                  onCheckedChange={(v) => setNewSnippet({ ...newSnippet, is_public: v })}
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={!newSnippet.title || !newSnippet.code || isLoading}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Snippet"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userSnippets.length}</p>
              <p className="text-sm text-muted-foreground">Total Snippets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Globe className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userSnippets.filter((s) => s.is_public).length}</p>
              <p className="text-sm text-muted-foreground">Public</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userSnippets.reduce((sum, s) => sum + s.view_count, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Copy className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userSnippets.reduce((sum, s) => sum + s.copy_count, 0)}</p>
              <p className="text-sm text-muted-foreground">Times Copied</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-snippets">
        <TabsList>
          <TabsTrigger value="my-snippets">My Snippets</TabsTrigger>
          <TabsTrigger value="public">Public Snippets</TabsTrigger>
        </TabsList>

        <TabsContent value="my-snippets" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets..."
                className="pl-9"
              />
            </div>
            <Select value={selectedFolder || "all"} onValueChange={(v) => setSelectedFolder(v === "all" ? null : v)}>
              <SelectTrigger className="w-[180px]">
                <Folder className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {FOLDERS.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder} ({folderCounts[folder] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Snippets Grid */}
          {filteredSnippets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Code className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No snippets found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedFolder
                    ? "Try adjusting your filters"
                    : "Create your first code snippet to get started"}
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Snippet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSnippets.map((snippet) => (
                <Card key={snippet.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {getLanguageIcon(snippet.language)}
                        </span>
                        <CardTitle className="text-base truncate">{snippet.title}</CardTitle>
                      </div>
                      {snippet.is_public ? (
                        <Globe className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Code Preview */}
                    <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono overflow-hidden max-h-[80px]">
                      {snippet.code.split("\n").slice(0, 3).join("\n")}
                      {snippet.code.split("\n").length > 3 && "\n..."}
                    </pre>

                    {/* Tags */}
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {snippet.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{snippet.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {snippet.folder}
                      </span>
                      <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleCopy(snippet)}>
                        {copiedId === snippet.id ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(snippet.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicSnippets.map((snippet) => (
              <Card key={snippet.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getLanguageIcon(snippet.language)}
                      </span>
                      <CardTitle className="text-base truncate">{snippet.title}</CardTitle>
                    </div>
                  </div>
                  {snippet.users && <p className="text-sm text-muted-foreground">by {snippet.users.username}</p>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono overflow-hidden max-h-[80px]">
                    {snippet.code.split("\n").slice(0, 3).join("\n")}
                    {snippet.code.split("\n").length > 3 && "\n..."}
                  </pre>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      {snippet.view_count}
                      <Copy className="w-3 h-3 ml-2" />
                      {snippet.copy_count}
                    </span>
                  </div>

                  <Button size="sm" className="w-full" onClick={() => handleCopy(snippet)}>
                    {copiedId === snippet.id ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
