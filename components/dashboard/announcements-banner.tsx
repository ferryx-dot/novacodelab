"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Pin } from "lucide-react"
import type { Announcement } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3)

      if (data) {
        // Filter out dismissed announcements
        const stored = localStorage.getItem("dismissed_announcements")
        const dismissedIds = stored ? new Set(JSON.parse(stored)) : new Set()
        setDismissed(dismissedIds as Set<string>)
        setAnnouncements(data.filter((a) => !dismissedIds.has(a.id)))
      }
    }

    fetchAnnouncements()
  }, [])

  const dismiss = (id: string) => {
    const newDismissed = new Set([...dismissed, id])
    setDismissed(newDismissed)
    localStorage.setItem("dismissed_announcements", JSON.stringify([...newDismissed]))
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "error":
        return AlertCircle
      default:
        return Info
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500/50 bg-green-500/10 text-green-500 [&>svg]:text-green-500"
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 [&>svg]:text-yellow-500"
      case "error":
        return "border-red-500/50 bg-red-500/10 text-red-500 [&>svg]:text-red-500"
      default:
        return "border-primary/50 bg-primary/10 text-primary [&>svg]:text-primary"
    }
  }

  if (announcements.length === 0) return null

  return (
    <div className="space-y-2 mb-6">
      {announcements.map((announcement) => {
        const Icon = getIcon(announcement.type)
        return (
          <Alert key={announcement.id} className={cn("relative", getStyles(announcement.type))}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              {announcement.title}
              {announcement.is_pinned && <Pin className="h-3 w-3 fill-current" />}
            </AlertTitle>
            <AlertDescription>{announcement.content}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => dismiss(announcement.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )
      })}
    </div>
  )
}
