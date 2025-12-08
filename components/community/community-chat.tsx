"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Smile, Send, Pin, Trash2, Users, Circle } from "lucide-react"
import { format } from "date-fns"
import type { Message, Profile } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MessageWithProfile extends Message {
  profiles: Profile
}

export function CommunityChat() {
  const [messages, setMessages] = useState<MessageWithProfile[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const supabase = createClient()

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (profile) setCurrentUser(profile)
      }
    }
    fetchUser()
  }, [])

  // Fetch messages
  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(*)")
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(1000)

      if (data) {
        setMessages(data as MessageWithProfile[])
      }
      setIsLoading(false)
    }
    fetchMessages()
  }, [])

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel("community-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const { data: messageWithProfile } = await supabase
          .from("messages")
          .select("*, profiles(*)")
          .eq("id", payload.new.id)
          .single()

        if (messageWithProfile) {
          setMessages((prev) => [...prev, messageWithProfile as MessageWithProfile])
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, async (payload) => {
        if (payload.new.is_deleted) {
          setMessages((prev) => prev.filter((m) => m.id !== payload.new.id))
        } else {
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)))
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat() as unknown as Profile[]
        setOnlineUsers(users)
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.username && payload.username !== currentUser?.username) {
          setTypingUsers((prev) => {
            if (!prev.includes(payload.username)) {
              return [...prev, payload.username]
            }
            return prev
          })
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== payload.username))
          }, 3000)
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUser) {
          await channel.track(currentUser)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleTyping = useCallback(() => {
    if (!currentUser) return

    const channel = supabase.channel("community-chat")
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { username: currentUser.username },
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {}, 3000)
  }, [currentUser])

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    const { error } = await supabase.from("messages").insert({
      user_id: currentUser.id,
      content: newMessage.trim(),
    })

    if (!error) {
      // Update messages sent count
      await supabase
        .from("profiles")
        .update({ messages_sent: currentUser.messages_sent + 1 })
        .eq("id", currentUser.id)

      setNewMessage("")
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!currentUser?.is_admin) return
    await supabase.from("messages").update({ is_deleted: true }).eq("id", messageId)
  }

  const pinMessage = async (messageId: string, isPinned: boolean) => {
    if (!currentUser?.is_admin) return
    await supabase.from("messages").update({ is_pinned: !isPinned }).eq("id", messageId)
  }

  const pinnedMessages = messages.filter((m) => m.is_pinned)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur border-border/50">
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
                    {message.profiles?.is_admin && <span className="text-amber-500">👑✓</span>}
                    {message.profiles?.is_verified && !message.profiles?.is_admin && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-blue-500/20 text-blue-400">
                        ✓
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), "h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 break-words">{message.content}</p>
                </div>
                {currentUser?.is_admin && (
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
        </ScrollArea>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-xs text-muted-foreground">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex items-center gap-2"
          >
            <Button type="button" variant="ghost" size="icon" className="shrink-0">
              <Smile className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type a message..."
              className="flex-1 bg-background/50 border-border/50"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Online Users Sidebar */}
      <Card className="w-64 hidden lg:flex flex-col bg-card/50 backdrop-blur border-border/50">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Online</span>
            <Badge variant="secondary" className="ml-auto">
              {onlineUsers.length}
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-xs">
                      {user.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium truncate">{user.username}</span>
                    {user.is_admin && <span className="text-amber-500 text-xs">👑✓</span>}
                    {user.is_verified && !user.is_admin && <span className="text-blue-400 text-xs">✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
