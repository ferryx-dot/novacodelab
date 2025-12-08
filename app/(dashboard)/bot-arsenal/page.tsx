import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Code2, Zap, MessageSquare, Settings, Play, Plus } from "lucide-react"

const botTemplates = [
  {
    name: "Discord Bot",
    description: "Full-featured Discord bot with commands, events, and moderation",
    tags: ["Discord.js", "Node.js"],
    icon: MessageSquare,
  },
  {
    name: "Telegram Bot",
    description: "Interactive Telegram bot with inline keyboards and webhooks",
    tags: ["Telegraf", "Node.js"],
    icon: MessageSquare,
  },
  {
    name: "Trading Bot",
    description: "Automated crypto trading bot with strategy support",
    tags: ["Python", "CCXT"],
    icon: Zap,
  },
  {
    name: "Web Scraper",
    description: "Intelligent web scraping bot with proxy rotation",
    tags: ["Puppeteer", "Node.js"],
    icon: Code2,
  },
  {
    name: "Chat Bot",
    description: "AI-powered conversational chatbot for websites",
    tags: ["OpenAI", "TypeScript"],
    icon: Bot,
  },
  {
    name: "Automation Bot",
    description: "Task automation bot for repetitive workflows",
    tags: ["Python", "Selenium"],
    icon: Settings,
  },
]

export default function BotArsenalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bot Arsenal</h1>
          <p className="text-muted-foreground">Create and manage powerful bots for any platform</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Bot
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {botTemplates.map((bot, index) => (
          <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <bot.icon className="w-6 h-6 text-primary" />
                </div>
                <Button variant="ghost" size="icon">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{bot.name}</CardTitle>
              <CardDescription>{bot.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {bot.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
