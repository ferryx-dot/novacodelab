"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Play,
  RefreshCw,
  Save,
  Share,
  Download,
  Maximize2,
  Minimize2,
  Terminal,
  Code,
  Paintbrush,
  FileCode,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface PlaygroundEditorProps {
  userId: string | null
  initialData?: {
    id?: string
    title?: string
    html_code?: string
    css_code?: string
    js_code?: string
  }
}

const DEFAULT_HTML = `<div class="container">
  <h1>Hello, World!</h1>
  <p>Start coding in the playground!</p>
  <button onclick="handleClick()">Click Me</button>
</div>`

const DEFAULT_CSS = `.container {
  font-family: system-ui, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #6366f1;
  margin-bottom: 1rem;
}

button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

button:hover {
  background: #4f46e5;
}`

const DEFAULT_JS = `function handleClick() {
  alert('Button clicked!');
  console.log('Hello from the playground!');
}`

export function PlaygroundEditor({ userId, initialData }: PlaygroundEditorProps) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [title, setTitle] = useState(initialData?.title || "Untitled Playground")
  const [html, setHtml] = useState(initialData?.html_code || DEFAULT_HTML)
  const [css, setCss] = useState(initialData?.css_code || DEFAULT_CSS)
  const [js, setJs] = useState(initialData?.js_code || DEFAULT_JS)
  const [activeTab, setActiveTab] = useState("html")
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-run preview on code change
  useEffect(() => {
    const timeout = setTimeout(runPreview, 500)
    return () => clearTimeout(timeout)
  }, [html, css, js])

  const runPreview = () => {
    if (!iframeRef.current) return

    const doc = iframeRef.current.contentDocument
    if (!doc) return

    setConsoleLogs([])

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            // Override console.log
            const originalLog = console.log;
            console.log = function(...args) {
              window.parent.postMessage({ type: 'console', args: args.map(a => String(a)) }, '*');
              originalLog.apply(console, args);
            };
            
            try {
              ${js}
            } catch (e) {
              console.log('Error: ' + e.message);
            }
          </script>
        </body>
      </html>
    `

    doc.open()
    doc.write(content)
    doc.close()
  }

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console") {
        setConsoleLogs((prev) => [...prev, event.data.args.join(" ")])
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleSave = async () => {
    if (!userId) {
      alert("Please log in to save your playground")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/playgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          title,
          html_code: html,
          css_code: css,
          js_code: js,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/playground/${data.id}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async () => {
    if (initialData?.id) {
      await navigator.clipboard.writeText(`${window.location.origin}/playground/${initialData.id}`)
      alert("Link copied to clipboard!")
    } else {
      alert("Save your playground first to share it")
    }
  }

  const handleDownload = () => {
    const content = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`

    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-semibold text-lg w-[250px]" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={runPreview}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        {/* Code Editors */}
        <Card className="overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0 pt-2 px-2">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="html" className="gap-1">
                  <Code className="w-4 h-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="css" className="gap-1">
                  <Paintbrush className="w-4 h-4" />
                  CSS
                </TabsTrigger>
                <TabsTrigger value="js" className="gap-1">
                  <FileCode className="w-4 h-4" />
                  JS
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)]">
              <TabsContent value="html" className="m-0 h-full">
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-muted/30 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </TabsContent>
              <TabsContent value="css" className="m-0 h-full">
                <textarea
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-muted/30 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </TabsContent>
              <TabsContent value="js" className="m-0 h-full">
                <textarea
                  value={js}
                  onChange={(e) => setJs(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-muted/30 resize-none focus:outline-none"
                  spellCheck={false}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Preview and Console */}
        <div className="flex flex-col gap-4">
          {/* Preview */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="w-4 h-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-45px)]">
              <iframe ref={iframeRef} className="w-full h-full bg-white" sandbox="allow-scripts" title="Preview" />
            </CardContent>
          </Card>

          {/* Console */}
          <Card className="h-[150px] overflow-hidden">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Console
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100%-45px)] overflow-auto">
              {consoleLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">Console output will appear here...</p>
              ) : (
                <div className="space-y-1">
                  {consoleLogs.map((log, i) => (
                    <p key={i} className="font-mono text-xs p-1 bg-muted/50 rounded">
                      {log}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
