import { Card, CardContent } from "@/components/ui/card"
import { Code, Cpu, Rocket, Sparkles } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">NovaCode Labs</span>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to App
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "monospace" }}>
            𝙰𝚋𝚘𝚞𝚝 𝙽𝚘𝚟𝚊𝙲𝚘𝚍𝚎 𝙻𝚊𝚋𝚜
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: "serif" }}>
            𝑇ℎ𝑒 𝑢𝑙𝑡𝑖𝑚𝑎𝑡𝑒 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟 𝑝𝑙𝑎𝑡𝑓𝑜𝑟𝑚, 𝑏𝑢𝑖𝑙𝑡 𝑏𝑦 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟𝑠, 𝑓𝑜𝑟 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟𝑠.
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold" style={{ fontFamily: "monospace" }}>
                  𝙾𝚞𝚛 𝚅𝚒𝚜𝚒𝚘𝚗
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: "serif" }}>
                𝑁𝑜𝑣𝑎𝐶𝑜𝑑𝑒 𝐿𝑎𝑏𝑠 𝑤𝑎𝑠 𝑏𝑜𝑟𝑛 𝑓𝑟𝑜𝑚 𝑎 𝑠𝑖𝑚𝑝𝑙𝑒 𝑖𝑑𝑒𝑎: 𝑐𝑟𝑒𝑎𝑡𝑒 𝑎 𝑠𝑝𝑎𝑐𝑒 𝑤ℎ𝑒𝑟𝑒 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟𝑠 𝑐𝑎𝑛 𝑙𝑒𝑎𝑟𝑛, 𝑏𝑢𝑖𝑙𝑑, 𝑠ℎ𝑎𝑟𝑒, 𝑎𝑛𝑑
                𝑡ℎ𝑟𝑖𝑣𝑒 𝑡𝑜𝑔𝑒𝑡ℎ𝑒𝑟. 𝑊𝑒 𝑏𝑒𝑙𝑖𝑒𝑣𝑒 𝑡ℎ𝑎𝑡 𝑡ℎ𝑒 𝑓𝑢𝑡𝑢𝑟𝑒 𝑜𝑓 𝑠𝑜𝑓𝑡𝑤𝑎𝑟𝑒 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑚𝑒𝑛𝑡 𝑙𝑖𝑒𝑠 𝑖𝑛 𝑐𝑜𝑙𝑙𝑎𝑏𝑜𝑟𝑎𝑡𝑖𝑜𝑛, 𝐴𝐼-𝑎𝑠𝑠𝑖𝑠𝑡𝑒𝑑
                𝑤𝑜𝑟𝑘𝑓𝑙𝑜𝑤𝑠, 𝑎𝑛𝑑 𝑎 𝑐𝑜𝑚𝑚𝑢𝑛𝑖𝑡𝑦 𝑡ℎ𝑎𝑡 𝑠𝑢𝑝𝑝𝑜𝑟𝑡𝑠 𝑒𝑎𝑐ℎ 𝑜𝑡ℎ𝑒𝑟.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Creators */}
        <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: "monospace" }}>
          𝙼𝚎𝚎𝚝 𝚃𝚑𝚎 𝙲𝚛𝚎𝚊𝚝𝚘𝚛𝚜
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Lord Devine */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "monospace" }}>
                    𝙻𝚘𝚛𝚍 𝙳𝚎𝚟𝚒𝚗𝚎
                    <span className="text-amber-500">👑✓</span>
                  </h3>
                  <p className="text-sm text-amber-500/80" style={{ fontFamily: "monospace" }}>
                    𝚃𝚑𝚎 𝚅𝚒𝚜𝚒𝚘𝚗𝚊𝚛𝚢 & 𝙻𝚎𝚊𝚍 𝙰𝚛𝚌𝚑𝚒𝚝𝚎𝚌𝚝
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: "serif" }}>
                𝑇ℎ𝑒 𝑑𝑟𝑖𝑣𝑖𝑛𝑔 𝑓𝑜𝑟𝑐𝑒 𝑏𝑒ℎ𝑖𝑛𝑑 𝑁𝑜𝑣𝑎𝐶𝑜𝑑𝑒 𝐿𝑎𝑏𝑠. 𝑊𝑖𝑡ℎ 𝑦𝑒𝑎𝑟𝑠 𝑜𝑓 𝑒𝑥𝑝𝑒𝑟𝑖𝑒𝑛𝑐𝑒 𝑖𝑛 𝑓𝑢𝑙𝑙-𝑠𝑡𝑎𝑐𝑘 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑚𝑒𝑛𝑡 𝑎𝑛𝑑 𝑠𝑦𝑠𝑡𝑒𝑚
                𝑎𝑟𝑐ℎ𝑖𝑡𝑒𝑐𝑡𝑢𝑟𝑒, 𝐿𝑜𝑟𝑑 𝐷𝑒𝑣𝑖𝑛𝑒 𝑏𝑟𝑜𝑢𝑔ℎ𝑡 𝑡ℎ𝑒 𝑣𝑖𝑠𝑖𝑜𝑛 𝑜𝑓 𝑎 𝑢𝑛𝑖𝑓𝑖𝑒𝑑 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟 𝑝𝑙𝑎𝑡𝑓𝑜𝑟𝑚 𝑡𝑜 𝑙𝑖𝑓𝑒. 𝑅𝑒𝑠𝑝𝑜𝑛𝑠𝑖𝑏𝑙𝑒 𝑓𝑜𝑟
                𝑐𝑜𝑟𝑒 𝑎𝑟𝑐ℎ𝑖𝑡𝑒𝑐𝑡𝑢𝑟𝑒, 𝑚𝑎𝑟𝑘𝑒𝑡𝑝𝑙𝑎𝑐𝑒 𝑠𝑦𝑠𝑡𝑒𝑚, 𝑎𝑛𝑑 𝑝𝑙𝑎𝑡𝑓𝑜𝑟𝑚 𝑠𝑡𝑟𝑎𝑡𝑒𝑔𝑦.
              </p>
            </CardContent>
          </Card>

          {/* Axel Codex */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Cpu className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "monospace" }}>
                    𝙰𝚡𝚎𝚕 𝙲𝚘𝚍𝚎𝚡
                    <span className="text-blue-400">✓</span>
                  </h3>
                  <p className="text-sm text-blue-500/80" style={{ fontFamily: "monospace" }}>
                    𝚃𝚎𝚌𝚑𝚗𝚒𝚌𝚊𝚕 𝙲𝚘-𝙰𝚛𝚌𝚑𝚒𝚝𝚎𝚌𝚝 & 𝙰𝙸 𝚂𝚙𝚎𝚌𝚒𝚊𝚕𝚒𝚜𝚝
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: "serif" }}>
                𝑇ℎ𝑒 𝑡𝑒𝑐ℎ𝑛𝑖𝑐𝑎𝑙 𝑏𝑟𝑖𝑙𝑙𝑖𝑎𝑛𝑐𝑒 𝑏𝑒ℎ𝑖𝑛𝑑 𝑜𝑢𝑟 𝐴𝐼 𝑖𝑛𝑡𝑒𝑔𝑟𝑎𝑡𝑖𝑜𝑛𝑠. 𝐴𝑥𝑒𝑙 𝑏𝑟𝑖𝑛𝑔𝑠 𝑑𝑒𝑒𝑝 𝑒𝑥𝑝𝑒𝑟𝑡𝑖𝑠𝑒 𝑖𝑛 𝑚𝑎𝑐ℎ𝑖𝑛𝑒 𝑙𝑒𝑎𝑟𝑛𝑖𝑛𝑔,
                𝑛𝑎𝑡𝑢𝑟𝑎𝑙 𝑙𝑎𝑛𝑔𝑢𝑎𝑔𝑒 𝑝𝑟𝑜𝑐𝑒𝑠𝑠𝑖𝑛𝑔, 𝑎𝑛𝑑 𝑠𝑦𝑠𝑡𝑒𝑚 𝑜𝑝𝑡𝑖𝑚𝑖𝑧𝑎𝑡𝑖𝑜𝑛. 𝑅𝑒𝑠𝑝𝑜𝑛𝑠𝑖𝑏𝑙𝑒 𝑓𝑜𝑟 𝑡ℎ𝑒 𝐴𝐼 𝐶𝑜𝑑𝑒 𝑆𝑡𝑢𝑑𝑖𝑜, 𝐴𝐼 𝐶ℎ𝑎𝑡, 𝑎𝑛𝑑
                𝑎𝑙𝑙 𝑖𝑛𝑡𝑒𝑙𝑙𝑖𝑔𝑒𝑛𝑡 𝑓𝑒𝑎𝑡𝑢𝑟𝑒𝑠.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Closing Statement */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "monospace" }}>
              𝙱𝚞𝚒𝚕𝚍𝚒𝚗𝚐 𝚃𝚑𝚎 𝙵𝚞𝚝𝚞𝚛𝚎
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: "serif" }}>
              𝑊𝑒'𝑟𝑒 𝑗𝑢𝑠𝑡 𝑔𝑒𝑡𝑡𝑖𝑛𝑔 𝑠𝑡𝑎𝑟𝑡𝑒𝑑. 𝑁𝑜𝑣𝑎𝐶𝑜𝑑𝑒 𝐿𝑎𝑏𝑠 𝑤𝑖𝑙𝑙 𝑐𝑜𝑛𝑡𝑖𝑛𝑢𝑒 𝑡𝑜 𝑒𝑣𝑜𝑙𝑣𝑒, 𝑖𝑛𝑛𝑜𝑣𝑎𝑡𝑒, 𝑎𝑛𝑑 𝑝𝑢𝑠ℎ 𝑡ℎ𝑒 𝑏𝑜𝑢𝑛𝑑𝑎𝑟𝑖𝑒𝑠 𝑜𝑓
              𝑤ℎ𝑎𝑡'𝑠 𝑝𝑜𝑠𝑠𝑖𝑏𝑙𝑒 𝑓𝑜𝑟 𝑑𝑒𝑣𝑒𝑙𝑜𝑝𝑒𝑟𝑠. 𝑇ℎ𝑎𝑛𝑘 𝑦𝑜𝑢 𝑓𝑜𝑟 𝑏𝑒𝑖𝑛𝑔 𝑝𝑎𝑟𝑡 𝑜𝑓 𝑜𝑢𝑟 𝑗𝑜𝑢𝑟𝑛𝑒𝑦.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NovaCode Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
