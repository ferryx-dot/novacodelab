"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Megaphone, Plus, Trash2, Pin, Eye, EyeOff } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import type { Announcement } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AnnouncementsManagerProps {
  announcements: Announcement[]
}

export function AnnouncementsManager({ announcements: initial }: AnnouncementsManagerProps) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState(initial)
  const [isCreating, setIsCreating] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info",
    is_pinned: false,
  })

  const handleCreate = async () => {
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnnouncement),
    })

    if (res.ok) {
      const data = await res.json()
      setAnnouncements([data, ...announcements])
      setIsCreating(false)
      setNewAnnouncement({ title: "", content: "", type: "info", is_pinned: false })
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      setAnnouncements(announcements.filter((a) => a.id !== id))
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    })

    if (res.ok) {
      setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, is_active: !isActive } : a)))
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      case "warning":
        return <Badge className="bg-yellow-500 text-black">Warning</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge>Info</Badge>
    }
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Announcements
        </CardTitle>
        <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating && (
          <Card className="bg-accent/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Write your announcement..."
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newAnnouncement.type}
                    onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, type: v })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={newAnnouncement.is_pinned}
                    onCheckedChange={(v) => setNewAnnouncement({ ...newAnnouncement, is_pinned: v })}
                  />
                  <Label>Pin to top</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!newAnnouncement.title || !newAnnouncement.content}>
                  Create Announcement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No announcements yet</p>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border ${announcement.is_active ? "bg-accent/30" : "bg-muted/30 opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(announcement.type)}
                      {announcement.is_pinned && <Pin className="w-4 h-4 text-primary fill-current" />}
                      <span className="text-xs text-muted-foreground">{formatDate(announcement.created_at)}</span>
                    </div>
                    <h4 className="font-semibold">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleActive(announcement.id, announcement.is_active)}
                    >
                      {announcement.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
