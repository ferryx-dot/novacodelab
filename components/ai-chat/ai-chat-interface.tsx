"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Send, Trash2, Search, Bot, User, Download, Loader2, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Profile, AIConversation } from "@/lib/types"

export function AIChatInterface() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
  })

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

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      if (!currentUser) return
      const { data } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("updated_at", { ascending: false })

      if (data) setConversations(data)
    }
    fetchConversations()
  }, [currentUser])

  // Load conversation messages
  useEffect(() => {
    async function loadConversationMessages() {
      if (!activeConversation) {
        setMessages([])
        return
      }

      const { data } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", activeConversation)
        .order("created_at", { ascending: true })

      if (data) {
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          parts: [{ type: "text" as const, text: msg.content }],
          createdAt: new Date(msg.created_at),
        }))
        setMessages(formattedMessages)
      }
    }
    loadConversationMessages()
  }, [activeConversation, setMessages])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Save messages to database
  useEffect(() => {
    async function saveMessages() {
      if (!activeConversation || messages.length === 0) return

      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant" && status === "ready") {
        // Check if message already exists
        const { data: existing } = await supabase
          .from("ai_messages")
          .select("id")
          .eq("conversation_id", activeConversation)
          .eq("content", lastMessage.content)
          .single()

        if (!existing) {
          await supabase.from("ai_messages").insert({
            conversation_id: activeConversation,
            role: lastMessage.role,
            content: lastMessage.content,
          })

          // Update conversation title if first message
          if (messages.length <= 2) {
            const title = messages[0].content?.slice(0, 50) + (messages[0].content?.length > 50 ? "..." : "")
            await supabase
              .from("ai_conversations")
              .update({ title, updated_at: new Date().toISOString() })
              .eq("id", activeConversation)

            setConversations((prev) => prev.map((c) => (c.id === activeConversation ? { ...c, title } : c)))
          }
        }
      }
    }
    saveMessages()
  }, [messages, status, activeConversation])

  const createNewConversation = async () => {
    if (!currentUser) return

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: currentUser.id,
        title: "New Conversation",
      })
      .select()
      .single()

    if (data) {
      setConversations((prev) => [data, ...prev])
      setActiveConversation(data.id)
      setMessages([])
    }
  }

  const deleteConversation = async (id: string) => {
    await supabase.from("ai_messages").delete().eq("conversation_id", id)
    await supabase.from("ai_conversations").delete().eq("id", id)
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversation === id) {
      setActiveConversation(null)
      setMessages([])
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Create conversation if none active
    if (!activeConversation && currentUser) {
      const { data } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: currentUser.id,
          title: content.slice(0, 50),
        })
        .select()
        .single()

      if (data) {
        setConversations((prev) => [data, ...prev])
        setActiveConversation(data.id)

        // Save user message
        await supabase.from("ai_messages").insert({
          conversation_id: data.id,
          role: "user",
          content,
        })
      }
    } else if (activeConversation) {
      // Save user message
      await supabase.from("ai_messages").insert({
        conversation_id: activeConversation,
        role: "user",
        content,
      })
    }

    sendMessage({ text: content })
  }

  const exportConversation = () => {
    const markdown = messages.map((m) => `**${m.role === "user" ? "You" : "AI"}**: ${m.content}`).join("\n\n")

    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "conversation.md"
    a.click()
  }

  const filteredConversations = conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <Card className="w-72 hidden md:flex flex-col bg-card/50 backdrop-blur border-border/50">
        <div className="p-4 border-b border-border/50">
          <Button onClick={createNewConversation} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 bg-background/50"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                  activeConversation === conv.id ? "bg-accent" : "hover:bg-accent/50",
                )}
                onClick={() => setActiveConversation(conv.id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(conv.updated_at), "MMM d, h:mm a")}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No conversations yet</div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-card/50 backdrop-blur border-border/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Assistant</span>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={exportConversation}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-lg mb-2">How can I help you today?</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Ask me anything about coding, debugging, or building your projects. I can help with code examples,
                explanations, and best practices.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/20">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent",
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.parts?.map((part, i) => {
                        if (part.type === "text") {
                          return <span key={i}>{part.text}</span>
                        }
                        return null
                      }) || message.content}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={currentUser?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {status === "streaming" && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/20">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-accent rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const input = form.elements.namedItem("message") as HTMLInputElement
              handleSendMessage(input.value)
              input.value = ""
            }}
            className="flex items-center gap-2"
          >
            <Input
              name="message"
              placeholder="Ask me anything..."
              className="flex-1 bg-background/50 border-border/50"
              disabled={status === "streaming"}
            />
            <Button type="submit" size="icon" disabled={status === "streaming"}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
