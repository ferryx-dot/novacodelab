"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Maximize2, Minimize2, TerminalIcon } from "lucide-react"

interface TerminalTab {
  id: string
  name: string
  history: string[]
  currentDirectory: string
}

interface FileSystemNode {
  type: "file" | "directory"
  content?: string
  children?: Record<string, FileSystemNode>
}

export function TerminalContent() {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: "1", name: "Terminal 1", history: [], currentDirectory: "/home/user" },
  ])
  const [activeTab, setActiveTab] = useState("1")
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Virtual file system
  const [fileSystem] = useState<Record<string, FileSystemNode>>({
    home: {
      type: "directory",
      children: {
        user: {
          type: "directory",
          children: {
            documents: {
              type: "directory",
              children: {
                "readme.txt": { type: "file", content: "Welcome to NovaCode Labs Terminal!" },
                "notes.md": { type: "file", content: "# My Notes\n\nSome important notes here." },
              },
            },
            projects: {
              type: "directory",
              children: {
                "app.js": { type: "file", content: 'console.log("Hello, World!");' },
                "package.json": { type: "file", content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}' },
              },
            },
            ".bashrc": { type: "file", content: "# Bash configuration\nexport PATH=$PATH:/usr/local/bin" },
          },
        },
      },
    },
    etc: {
      type: "directory",
      children: {
        hosts: { type: "file", content: "127.0.0.1 localhost\n::1 localhost" },
      },
    },
    tmp: { type: "directory", children: {} },
  })

  const getCurrentTab = () => tabs.find((t) => t.id === activeTab)!

  const resolvePath = (path: string, currentDir: string): string => {
    if (path.startsWith("/")) return path
    if (path === "~") return "/home/user"
    if (path.startsWith("~/")) return "/home/user" + path.slice(1)

    const parts = currentDir.split("/").filter(Boolean)
    const pathParts = path.split("/")

    for (const part of pathParts) {
      if (part === "..") {
        parts.pop()
      } else if (part !== ".") {
        parts.push(part)
      }
    }

    return "/" + parts.join("/")
  }

  const getNode = (path: string): FileSystemNode | null => {
    const parts = path.split("/").filter(Boolean)
    let current: FileSystemNode | Record<string, FileSystemNode> = fileSystem

    for (const part of parts) {
      if (typeof current === "object" && "children" in current && current.children) {
        current = current.children
      }
      if (typeof current === "object" && part in current) {
        current = (current as Record<string, FileSystemNode>)[part]
      } else {
        return null
      }
    }

    return current as FileSystemNode
  }

  const executeCommand = useCallback(
    (cmd: string): string[] => {
      const tab = getCurrentTab()
      const parts = cmd.trim().split(/\s+/)
      const command = parts[0]
      const args = parts.slice(1)

      switch (command) {
        case "": {
          return []
        }

        case "help": {
          return [
            "Available commands:",
            "  ls [dir]        - List directory contents",
            "  cd <dir>        - Change directory",
            "  pwd             - Print working directory",
            "  cat <file>      - Display file contents",
            "  mkdir <dir>     - Create directory",
            "  touch <file>    - Create empty file",
            "  rm <file>       - Remove file",
            "  echo <text>     - Print text",
            "  clear           - Clear terminal",
            "  whoami          - Display current user",
            "  date            - Display current date",
            "  history         - Show command history",
            "  grep <pattern> <file> - Search in file",
            "  head <file>     - Show first lines of file",
            "  tail <file>     - Show last lines of file",
            "  tree            - Display directory tree",
            "  env             - Show environment variables",
            "  uname           - System information",
            "  curl <url>      - Fetch URL (simulated)",
            "  ping <host>     - Ping host (simulated)",
            "  node <file>     - Run JavaScript file",
            "  python <file>   - Run Python file",
            "  npm <cmd>       - NPM commands (simulated)",
            "  git <cmd>       - Git commands (simulated)",
          ]
        }

        case "ls": {
          const path = args[0] ? resolvePath(args[0], tab.currentDirectory) : tab.currentDirectory
          const node = getNode(path)
          if (!node) return [`ls: cannot access '${args[0]}': No such file or directory`]
          if (node.type === "file") return [path.split("/").pop() || ""]
          if (node.children) {
            const items = Object.entries(node.children).map(([name, n]) =>
              n.type === "directory" ? `\x1b[34m${name}/\x1b[0m` : name,
            )
            return items.length ? [items.join("  ")] : [""]
          }
          return [""]
        }

        case "cd": {
          if (!args[0] || args[0] === "~") {
            setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, currentDirectory: "/home/user" } : t)))
            return []
          }
          const newPath = resolvePath(args[0], tab.currentDirectory)
          const node = getNode(newPath)
          if (!node) return [`cd: ${args[0]}: No such file or directory`]
          if (node.type !== "directory") return [`cd: ${args[0]}: Not a directory`]
          setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, currentDirectory: newPath } : t)))
          return []
        }

        case "pwd": {
          return [tab.currentDirectory]
        }

        case "cat": {
          if (!args[0]) return ["cat: missing file operand"]
          const path = resolvePath(args[0], tab.currentDirectory)
          const node = getNode(path)
          if (!node) return [`cat: ${args[0]}: No such file or directory`]
          if (node.type === "directory") return [`cat: ${args[0]}: Is a directory`]
          return node.content?.split("\n") || [""]
        }

        case "echo": {
          return [args.join(" ")]
        }

        case "clear": {
          setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, history: [] } : t)))
          return []
        }

        case "whoami": {
          return ["user"]
        }

        case "date": {
          return [new Date().toString()]
        }

        case "history": {
          return commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`)
        }

        case "uname": {
          if (args[0] === "-a") {
            return ["NovaCode Labs Terminal 1.0.0 - WebOS x86_64"]
          }
          return ["NovaCode"]
        }

        case "env": {
          return [
            "USER=user",
            "HOME=/home/user",
            "PATH=/usr/local/bin:/usr/bin:/bin",
            "SHELL=/bin/bash",
            "TERM=xterm-256color",
            "NOVACODE_VERSION=1.0.0",
          ]
        }

        case "tree": {
          const printTree = (node: FileSystemNode, prefix = ""): string[] => {
            if (!node.children) return []
            const entries = Object.entries(node.children)
            return entries.flatMap(([name, child], i) => {
              const isLast = i === entries.length - 1
              const connector = isLast ? "└── " : "├── "
              const childPrefix = isLast ? "    " : "│   "
              const display = child.type === "directory" ? `\x1b[34m${name}/\x1b[0m` : name
              return [prefix + connector + display, ...printTree(child, prefix + childPrefix)]
            })
          }
          const currentNode = getNode(tab.currentDirectory)
          return [".", ...printTree(currentNode!)]
        }

        case "head": {
          if (!args[0]) return ["head: missing file operand"]
          const path = resolvePath(args[0], tab.currentDirectory)
          const node = getNode(path)
          if (!node) return [`head: ${args[0]}: No such file or directory`]
          if (node.type === "directory") return [`head: ${args[0]}: Is a directory`]
          return node.content?.split("\n").slice(0, 10) || [""]
        }

        case "tail": {
          if (!args[0]) return ["tail: missing file operand"]
          const path = resolvePath(args[0], tab.currentDirectory)
          const node = getNode(path)
          if (!node) return [`tail: ${args[0]}: No such file or directory`]
          if (node.type === "directory") return [`tail: ${args[0]}: Is a directory`]
          return node.content?.split("\n").slice(-10) || [""]
        }

        case "grep": {
          if (args.length < 2) return ["grep: usage: grep <pattern> <file>"]
          const pattern = args[0]
          const path = resolvePath(args[1], tab.currentDirectory)
          const node = getNode(path)
          if (!node) return [`grep: ${args[1]}: No such file or directory`]
          if (node.type === "directory") return [`grep: ${args[1]}: Is a directory`]
          const regex = new RegExp(pattern, "gi")
          return (
            node.content
              ?.split("\n")
              .filter((line) => regex.test(line))
              .map((line) => line.replace(regex, (match) => `\x1b[31m${match}\x1b[0m`)) || []
          )
        }

        case "mkdir": {
          if (!args[0]) return ["mkdir: missing operand"]
          return [`mkdir: created directory '${args[0]}'`]
        }

        case "touch": {
          if (!args[0]) return ["touch: missing file operand"]
          return [`touch: created file '${args[0]}'`]
        }

        case "rm": {
          if (!args[0]) return ["rm: missing operand"]
          return [`rm: removed '${args[0]}'`]
        }

        case "curl": {
          if (!args[0]) return ["curl: no URL provided"]
          return [
            `Connecting to ${args[0]}...`,
            "HTTP/1.1 200 OK",
            "Content-Type: text/html",
            "",
            "<!DOCTYPE html>",
            "<html><body>Simulated response</body></html>",
          ]
        }

        case "ping": {
          if (!args[0]) return ["ping: missing host operand"]
          return [
            `PING ${args[0]} (127.0.0.1): 56 data bytes`,
            `64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.1 ms`,
            `64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.2 ms`,
            `64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.1 ms`,
            "",
            `--- ${args[0]} ping statistics ---`,
            "3 packets transmitted, 3 packets received, 0.0% packet loss",
          ]
        }

        case "node": {
          if (!args[0]) return ["node: missing file operand"]
          return [`Running ${args[0]}...`, "Hello, World!", "Process exited with code 0"]
        }

        case "python": {
          if (!args[0]) return ["python: missing file operand"]
          return [`Python 3.10.0`, `Running ${args[0]}...`, "Hello from Python!", "Process exited with code 0"]
        }

        case "npm": {
          if (!args[0]) return ["npm: missing command"]
          if (args[0] === "install" || args[0] === "i") {
            return ["Installing dependencies...", "added 150 packages in 3s"]
          }
          if (args[0] === "run") {
            return [`> ${args[1]}`, "Running script..."]
          }
          return [`npm ${args.join(" ")}`]
        }

        case "git": {
          if (!args[0]) return ["git: missing command"]
          if (args[0] === "status") {
            return [
              "On branch main",
              "Your branch is up to date with 'origin/main'.",
              "",
              "nothing to commit, working tree clean",
            ]
          }
          if (args[0] === "log") {
            return [
              "commit abc123def456 (HEAD -> main)",
              "Author: User <user@example.com>",
              "Date:   Today",
              "",
              "    Initial commit",
            ]
          }
          return [`git: '${args[0]}' simulated`]
        }

        default: {
          return [`${command}: command not found. Type 'help' for available commands.`]
        }
      }
    },
    [activeTab, tabs, commandHistory, fileSystem],
  )

  const handleSubmit = () => {
    if (!input.trim()) return

    const tab = getCurrentTab()
    const output = executeCommand(input)

    setTabs(
      tabs.map((t) =>
        t.id === activeTab
          ? {
              ...t,
              history: [
                ...t.history,
                `\x1b[32muser@novacode\x1b[0m:\x1b[34m${tab.currentDirectory}\x1b[0m$ ${input}`,
                ...output,
              ],
            }
          : t,
      ),
    )

    setCommandHistory([...commandHistory, input])
    setInput("")
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple tab completion
      const parts = input.split(" ")
      const lastPart = parts[parts.length - 1]
      if (lastPart) {
        const tab = getCurrentTab()
        const node = getNode(tab.currentDirectory)
        if (node?.children) {
          const matches = Object.keys(node.children).filter((name) => name.startsWith(lastPart))
          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0]
            setInput(parts.join(" "))
          }
        }
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, history: [] } : t)))
    }
  }

  const addNewTab = () => {
    const newId = String(Date.now())
    setTabs([...tabs, { id: newId, name: `Terminal ${tabs.length + 1}`, history: [], currentDirectory: "/home/user" }])
    setActiveTab(newId)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter((t) => t.id !== id)
    setTabs(newTabs)
    if (activeTab === id) {
      setActiveTab(newTabs[0].id)
    }
  }

  useEffect(() => {
    outputRef.current?.scrollTo(0, outputRef.current.scrollHeight)
  }, [tabs])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeTab])

  const tab = getCurrentTab()

  // Parse ANSI colors for display
  const parseAnsi = (text: string) => {
    const parts = text.split(/\x1b\[(\d+)m/)
    let currentColor = ""
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const code = Number.parseInt(part)
        if (code === 0) currentColor = ""
        else if (code === 31) currentColor = "text-red-500"
        else if (code === 32) currentColor = "text-green-500"
        else if (code === 34) currentColor = "text-blue-500"
        return null
      }
      return (
        <span key={i} className={currentColor}>
          {part}
        </span>
      )
    })
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 p-4 bg-background" : ""}`}>
      <div className={`${isFullscreen ? "h-full" : "h-[calc(100vh-8rem)]"} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Terminal</h1>
            <p className="text-muted-foreground">Full-featured command-line interface</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Terminal */}
        <Card className="flex-1 bg-black border-border/50 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center bg-zinc-900 border-b border-zinc-800">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="bg-transparent h-auto p-0 rounded-none">
                {tabs.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="data-[state=active]:bg-black data-[state=inactive]:bg-zinc-900 rounded-none border-r border-zinc-800 px-4 py-2"
                  >
                    <TerminalIcon className="w-4 h-4 mr-2" />
                    {t.name}
                    {tabs.length > 1 && (
                      <X
                        className="w-3 h-3 ml-2 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(t.id)
                        }}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={addNewTab}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Terminal content */}
          <CardContent className="flex-1 p-0 overflow-hidden cursor-text" onClick={() => inputRef.current?.focus()}>
            <div ref={outputRef} className="h-full overflow-auto p-4 font-mono text-sm text-green-400">
              {/* Welcome message */}
              {tab.history.length === 0 && (
                <div className="text-zinc-500 mb-4">
                  <pre>{`
╔═══════════════════════════════════════════════╗
║     NovaCode Labs Terminal v1.0.0             ║
║     Type 'help' for available commands        ║
╚═══════════════════════════════════════════════╝
`}</pre>
                </div>
              )}

              {/* Command history */}
              {tab.history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {parseAnsi(line)}
                </div>
              ))}

              {/* Current prompt */}
              <div className="flex items-center">
                <span className="text-green-500">user@novacode</span>
                <span className="text-white">:</span>
                <span className="text-blue-500">{tab.currentDirectory}</span>
                <span className="text-white">$ </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-white caret-white"
                  autoFocus
                  spellCheck={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
