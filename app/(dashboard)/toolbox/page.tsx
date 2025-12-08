import { Card, CardContent } from "@/components/ui/card"
import { Hash, Binary, FileJson, Clock, QrCode, Palette, FileText, Lock, Calculator, Globe } from "lucide-react"

const tools = [
  { name: "Base64 Encoder/Decoder", icon: Binary, description: "Encode and decode Base64 strings" },
  { name: "JSON Formatter", icon: FileJson, description: "Format and validate JSON data" },
  { name: "URL Encoder/Decoder", icon: Clock, description: "Encode and decode URLs" },
  { name: "Hash Generator", icon: Hash, description: "Generate MD5, SHA-1, SHA-256 hashes" },
  { name: "Timestamp Converter", icon: Clock, description: "Convert between timestamps and dates" },
  { name: "QR Code Generator", icon: QrCode, description: "Create QR codes from text" },
  { name: "Color Converter", icon: Palette, description: "Convert between HEX, RGB, HSL" },
  { name: "Lorem Ipsum Generator", icon: FileText, description: "Generate placeholder text" },
  { name: "Password Generator", icon: Lock, description: "Create secure passwords" },
  { name: "Unit Converter", icon: Calculator, description: "Convert units of measurement" },
  { name: "UUID Generator", icon: Hash, description: "Generate unique identifiers" },
  { name: "IP Lookup", icon: Globe, description: "Look up IP address information" },
]

export default function ToolboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Toolbox</h1>
        <p className="text-muted-foreground">Developer utilities and converters</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool, index) => (
          <Card
            key={index}
            className="bg-card/50 border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
