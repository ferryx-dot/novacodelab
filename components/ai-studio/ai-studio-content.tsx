"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Download,
  Copy,
  Sparkles,
  FileCode,
  FolderTree,
  Loader2,
  Check,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Plus,
  X,
  Terminal,
} from "lucide-react"

interface FileNode {
  name: string
  type: "file" | "folder"
  content?: string
  language?: string
  children?: FileNode[]
  isOpen?: boolean
}

interface Tab {
  id: string
  name: string
  content: string
  language: string
}

const defaultCode = `// Welcome to AI Code Studio!
// Start coding or ask the AI assistant for help.

function greet(name) {
  return \`Hello, \${name}! Welcome to NovaCode Labs.\`;
}

console.log(greet("Developer"));
`

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
]

export function AIStudioContent() {
  const [code, setCode] = useState(defaultCode)
  const [language, setLanguage] = useState("javascript")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showFileTree, setShowFileTree] = useState(true)
  const [showAiPanel, setShowAiPanel] = useState(true)
  const [tabs, setTabs] = useState<Tab[]>([{ id: "1", name: "main.js", content: defaultCode, language: "javascript" }])
  const [activeTab, setActiveTab] = useState("1")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [fileTree] = useState<FileNode[]>([
    {
      name: "src",
      type: "folder",
      isOpen: true,
      children: [
        { name: "main.js", type: "file", content: defaultCode, language: "javascript" },
        {
          name: "utils.js",
          type: "file",
          content: "// Utility functions\nexport const add = (a, b) => a + b;",
          language: "javascript",
        },
        {
          name: "components",
          type: "folder",
          isOpen: false,
          children: [
            {
              name: "Button.jsx",
              type: "file",
              content: "export const Button = ({ children }) => <button>{children}</button>;",
              language: "javascript",
            },
          ],
        },
      ],
    },
    {
      name: "package.json",
      type: "file",
      content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}',
      language: "json",
    },
    { name: "README.md", type: "file", content: "# My Project\n\nWelcome to my project!", language: "markdown" },
  ])

  const handleRun = async () => {
    setIsRunning(true)
    setOutput("")

    try {
      // Simulate code execution
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (language === "javascript" || language === "typescript") {
        try {
          // Create a safe execution context
          const logs: string[] = []
          const mockConsole = {
            log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
            error: (...args: unknown[]) => logs.push(`Error: ${args.map(String).join(" ")}`),
            warn: (...args: unknown[]) => logs.push(`Warning: ${args.map(String).join(" ")}`),
          }

          // Simple evaluation (in production, use a proper sandbox)
          const fn = new Function("console", code)
          fn(mockConsole)

          setOutput(logs.join("\n") || "Code executed successfully (no output)")
        } catch (err) {
          setOutput(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
        }
      } else {
        setOutput(`[${language}] Code execution simulated.\n\nNote: Full execution requires a backend runtime.`)
      }
    } finally {
      setIsRunning(false)
    }
  }

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return
    setIsAiLoading(true)
    setAiResponse("")

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const responses: Record<string, string> = {
        default: `Based on your request: "${aiPrompt}"

Here's a suggested implementation:

\`\`\`${language}
// AI-generated code
function example() {
  // Implementation based on your requirements
  return "Hello from AI!";
}
\`\`\`

Feel free to modify this code to fit your needs!`,
        login: `Here's a login system implementation:

\`\`\`javascript
async function login(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const { token, user } = await response.json();
    localStorage.setItem('token', token);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
\`\`\``,
        fix: `I've analyzed your code and found potential issues:

1. Consider adding error handling
2. Variable naming could be more descriptive
3. Add input validation

Here's an improved version with fixes applied.`,
      }

      const lowerPrompt = aiPrompt.toLowerCase()
      if (lowerPrompt.includes("login")) {
        setAiResponse(responses.login)
      } else if (lowerPrompt.includes("fix") || lowerPrompt.includes("bug")) {
        setAiResponse(responses.fix)
      } else {
        setAiResponse(responses.default)
      }
    } finally {
      setIsAiLoading(false)
      setAiPrompt("")
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const addNewTab = () => {
    const newId = String(Date.now())
    const newTab: Tab = {
      id: newId,
      name: `untitled-${tabs.length + 1}.js`,
      content: "// New file\n",
      language: "javascript",
    }
    setTabs([...tabs, newTab])
    setActiveTab(newId)
    setCode(newTab.content)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter((t) => t.id !== id)
    setTabs(newTabs)
    if (activeTab === id) {
      setActiveTab(newTabs[0].id)
      setCode(newTabs[0].content)
    }
  }

  const switchTab = (id: string) => {
    // Save current tab content
    setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, content: code } : t)))
    // Switch to new tab
    const tab = tabs.find((t) => t.id === id)
    if (tab) {
      setActiveTab(id)
      setCode(tab.content)
      setLanguage(tab.language)
    }
  }

  const FileTreeItem = ({ node, depth = 0 }: { node: FileNode; depth?: number }) => {
    const [isOpen, setIsOpen] = useState(node.isOpen || false)

    return (
      <div>
        <button
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 rounded transition-colors`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === "folder") {
              setIsOpen(!isOpen)
            } else if (node.content) {
              setCode(node.content)
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className="w-4 h-4 text-yellow-500" />
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-4 h-4 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {node.type === "folder" && isOpen && node.children && (
          <div>
            {node.children.map((child, idx) => (
              <FileTreeItem key={idx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Code Studio</h1>
          <p className="text-muted-foreground">Write, run, and enhance your code with AI assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFileTree(!showFileTree)}>
            <FolderTree className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAiPanel(!showAiPanel)}>
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* File Tree */}
        {showFileTree && (
          <Card className="w-64 bg-card/50 border-border/50 flex-shrink-0">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100%-3rem)]">
                {fileTree.map((node, idx) => (
                  <FileTreeItem key={idx} node={node} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 bg-card/50 border-border/50 flex flex-col">
            {/* Tabs */}
            <div className="flex items-center border-b border-border/50 bg-secondary/30">
              <div className="flex-1 flex items-center overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-border/50 hover:bg-accent/50 transition-colors ${
                      activeTab === tab.id ? "bg-card text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    {tab.name}
                    {tabs.length > 1 && (
                      <X
                        className="w-3 h-3 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.id)
                        }}
                      />
                    )}
                  </button>
                ))}
                <button onClick={addNewTab} className="p-2 hover:bg-accent/50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 px-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
                style={{ tabSize: 2 }}
              />
              {/* Line numbers overlay would go here in production */}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-2 border-t border-border/50 bg-secondary/30">
              <div className="flex items-center gap-2">
                <Button onClick={handleRun} disabled={isRunning} size="sm">
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Run
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                {code.split("\n").length} lines | {code.length} characters
              </span>
            </div>
          </Card>

          {/* Output */}
          <Card className="mt-4 bg-card/50 border-border/50">
            <CardHeader className="py-2 px-4 flex flex-row items-center gap-2">
              <Terminal className="w-4 h-4" />
              <CardTitle className="text-sm">Output</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-4 text-sm font-mono text-muted-foreground max-h-40 overflow-auto bg-black/20">
                {output || "Run your code to see output here..."}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Panel */}
        {showAiPanel && (
          <Card className="w-80 bg-card/50 border-border/50 flex flex-col flex-shrink-0">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-4">
              <div className="flex-1 overflow-auto">
                {aiResponse ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{aiResponse}</pre>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ask me to help with your code!</p>
                      <p className="text-xs mt-1">Try: &quot;build a login system&quot;</p>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to help... (e.g., 'fix this bug', 'add error handling')"
                  className="resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleAiAssist()
                    }
                  }}
                />
                <Button onClick={handleAiAssist} disabled={isAiLoading || !aiPrompt.trim()} className="w-full">
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
