import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Layers, Layout, Type, Sparkles, Copy } from "lucide-react"

const components = [
  { name: "Button", variants: 8, category: "Input" },
  { name: "Card", variants: 5, category: "Layout" },
  { name: "Modal", variants: 4, category: "Overlay" },
  { name: "Form", variants: 6, category: "Input" },
  { name: "Table", variants: 3, category: "Data" },
  { name: "Navigation", variants: 7, category: "Layout" },
]

const colors = [
  { name: "Primary", value: "#0070f3" },
  { name: "Secondary", value: "#7928ca" },
  { name: "Success", value: "#10b981" },
  { name: "Warning", value: "#f59e0b" },
  { name: "Danger", value: "#ef4444" },
]

export default function DesignStudioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Design Studio</h1>
          <p className="text-muted-foreground">UI/UX tools and component library</p>
        </div>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Color Palette */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5" />
              Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {colors.map((color) => (
              <div key={color.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: color.value }} />
                  <span className="font-medium">{color.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Type className="w-5 h-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-3xl font-bold">Heading 1</p>
              <p className="text-2xl font-semibold">Heading 2</p>
              <p className="text-xl font-medium">Heading 3</p>
              <p className="text-base">Body text</p>
              <p className="text-sm text-muted-foreground">Small text</p>
            </div>
          </CardContent>
        </Card>

        {/* Spacing */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layout className="w-5 h-5" />
              Spacing Scale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[4, 8, 16, 24, 32, 48].map((size) => (
              <div key={size} className="flex items-center gap-3">
                <div className="w-16 bg-primary/20 rounded" style={{ height: `${size}px` }} />
                <span className="text-sm text-muted-foreground">{size}px</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Components */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Component Library
          </CardTitle>
          <CardDescription>Ready-to-use UI components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {components.map((component) => (
              <div
                key={component.name}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer text-center"
              >
                <p className="font-medium">{component.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{component.variants} variants</p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {component.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
