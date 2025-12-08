import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderCog as FolderCode, GitBranch, Star, Clock, Plus, ExternalLink } from "lucide-react"

const projects = [
  {
    name: "my-web-app",
    description: "Full-stack web application with React and Node.js",
    language: "TypeScript",
    stars: 12,
    updated: "2 hours ago",
  },
  {
    name: "api-server",
    description: "RESTful API server with authentication",
    language: "JavaScript",
    stars: 8,
    updated: "1 day ago",
  },
  {
    name: "mobile-app",
    description: "Cross-platform mobile app with React Native",
    language: "TypeScript",
    stars: 5,
    updated: "3 days ago",
  },
]

export default function CodingHubPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coding Hub</h1>
          <p className="text-muted-foreground">Manage your projects and repositories</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project, index) => (
          <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FolderCode className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {project.name}
                      <Badge variant="secondary" className="text-xs">
                        {project.language}
                      </Badge>
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {project.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        main
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {project.updated}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
