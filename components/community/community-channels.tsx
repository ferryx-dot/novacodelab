"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Hash, Send, Plus, Users, Lock, Pin, Trash2, Crown, BadgeCheck } from "lucide-react"
import { format } from "date-fns"
import type { CommunityChannel, ChannelMessage, Profile } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MessageWithProfile extends ChannelMessage {
  profiles: Profile
}

interface ChannelWithDetails extends CommunityChannel {
  member_count: number
}

interface CommunityChannelsProps {
  channels: ChannelWithDetails[]
  currentUser: Profile
}

export function CommunityChannels({ channels: initialChannels, currentUser }: CommunityChannelsProps) {
  const [channels, setChannels] = useState(initialChannels)
  const [activeChannel, setActiveChannel] = useState<ChannelWithDetails | null>(initialChannels[0] || null)
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: "", description: "", is_private: false })
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages when channel changes
  useEffect(() => {
    if (!activeChannel) return

    async function fetchMessages() {
      setIsLoading(true)
      const { data } = await supabase
        .from("channel_messages")
        .select("*, profiles(*)")
        .eq("channel_id", activeChannel.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(500)

      if (data) {
        setMessages(data as MessageWithProfile[])
      }
      setIsLoading(false)
    }

    fetchMessages()
  }, [activeChannel])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeChannel) return

    const channel = supabase
      .channel(`channel-${activeChannel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${activeChannel.id}`,
        },
        async (payload) => {
          const { data: messageWithProfile } = await supabase
            .from("channel_messages")
            .select("*, profiles(*)")
            .eq("id", payload.new.id)
            .single()

          if (messageWithProfile) {
            setMessages((prev) => [...prev, messageWithProfile as MessageWithProfile])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChannel])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return

    const { error } = await supabase.from("channel_messages").insert({
      channel_id: activeChannel.id,
      user_id: currentUser.id,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage("")
    }
  }

  const createChannel = async () => {
    if (!newChannel.name) return

    const { data, error } = await supabase
      .from("community_channels")
      .insert({
        name: newChannel.name.toLowerCase().replace(/\s+/g, "-"),
        description: newChannel.description,
        is_private: newChannel.is_private,
        created_by: currentUser.id,
      })
      .select()
      .single()

    if (!error && data) {
      setChannels((prev) => [...prev, { ...data, member_count: 1 }])
      setIsCreateOpen(false)
      setNewChannel({ name: "", description: "", is_private: false })
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!currentUser.is_admin) return
    await supabase.from("channel_messages").update({ is_deleted: true }).eq("id", messageId)
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }

  const pinMessage = async (messageId: string, isPinned: boolean) => {
    if (!currentUser.is_admin) return
    await supabase.from("channel_messages").update({ is_pinned: !isPinned }).eq("id", messageId)
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_pinned: !isPinned } : m)))
  }

  const pinnedMessages = messages.filter((m) => m.is_pinned)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Channels Sidebar */}
      <Card className="w-64 flex flex-col bg-card/50 border-border/50 shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Channels</CardTitle>
            {currentUser.is_admin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Channel Name</Label>
                      <Input
                        value={newChannel.name}
                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                        placeholder="general"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newChannel.description}
                        onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                        placeholder="What's this channel about?"
                      />
                    </div>
                    <Button onClick={createChannel} disabled={!newChannel.name} className="w-full">
                      Create Channel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                  activeChannel?.id === channel.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50",
                )}
              >
                {channel.is_private ? <Lock className="w-4 h-4 shrink-0" /> : <Hash className="w-4 h-4 shrink-0" />}
                <span className="flex-1 truncate text-sm">{channel.name}</span>
                <span className="text-xs text-muted-foreground">{channel.member_count}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-card/50 border-border/50">
        {activeChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{activeChannel.name}</span>
                {activeChannel.description && (
                  <span className="text-sm text-muted-foreground">- {activeChannel.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {activeChannel.member_count}
                </Badge>
              </div>
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div className="p-3 border-b border-border/50 bg-primary/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Pin className="h-4 w-4" />
                  <span>Pinned Messages</span>
                </div>
                {pinnedMessages.map((msg) => (
                  <div key={msg.id} className="text-sm p-2 rounded bg-background/50">
                    <span className="font-medium">{msg.profiles?.username}:</span> {msg.content}
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Be the first to say something!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex items-start gap-3 group", message.is_pinned && "bg-primary/5 p-2 rounded-lg")}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-xs">
                          {message.profiles?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.profiles?.username}</span>
                          {message.profiles?.is_admin && (
                            <span className="flex items-center text-amber-500">
                              <Crown className="w-3 h-3" />
                              <BadgeCheck className="w-3 h-3 text-primary" />
                            </span>
                          )}
                          {!message.profiles?.is_admin && message.profiles?.is_verified && (
                            <BadgeCheck className="w-3 h-3 text-primary" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 break-words">{message.content}</p>
                      </div>
                      {currentUser.is_admin && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => pinMessage(message.id, message.is_pinned)}
                          >
                            <Pin className={cn("h-3 w-3", message.is_pinned && "fill-current")} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${activeChannel.name}`}
                  className="flex-1 bg-background/50 border-border/50"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
