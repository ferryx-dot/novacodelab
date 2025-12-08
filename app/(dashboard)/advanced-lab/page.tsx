import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Cpu, Brain, Zap, Lock, Rocket, AlertTriangle } from "lucide-react"

const experiments = [
  {
    name: "AI Code Analysis",
    description: "Experimental AI-powered code review and suggestions",
    status: "beta",
    icon: Brain,
  },
  {
    name: "Real-time Collaboration",
    description: "Live code editing with multiple users",
    status: "alpha",
    icon: Zap,
  },
  {
    name: "GPU Acceleration",
    description: "WebGPU-powered code execution",
    status: "experimental",
    icon: Cpu,
  },
  {
    name: "Secure Sandbox",
    description: "Isolated code execution environment",
    status: "beta",
    icon: Lock,
  },
  {
    name: "Auto Deploy",
    description: "One-click deployment to cloud providers",
    status: "coming soon",
    icon: Rocket,
  },
]

export default function AdvancedLabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="w-6 h-6" />
          Advanced Lab
        </h1>
        <p className="text-muted-foreground">Experimental features and cutting-edge tools</p>
      </div>

      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              These features are experimental and may change or break without notice. Use at your own risk.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {experiments.map((exp, index) => (
          <Card key={index} className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <exp.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    exp.status === "beta"
                      ? "bg-blue-500/10 text-blue-500"
                      : exp.status === "alpha"
                        ? "bg-orange-500/10 text-orange-500"
                        : exp.status === "experimental"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {exp.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{exp.name}</CardTitle>
              <CardDescription>{exp.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
