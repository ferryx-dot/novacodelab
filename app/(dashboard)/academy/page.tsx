import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, BookOpen, Award } from "lucide-react"

const courses = [
  {
    title: "JavaScript Fundamentals",
    description: "Master the basics of JavaScript programming",
    lessons: 24,
    duration: "4 hours",
    level: "Beginner",
    progress: 75,
  },
  {
    title: "React Development",
    description: "Build modern web apps with React",
    lessons: 36,
    duration: "6 hours",
    level: "Intermediate",
    progress: 30,
  },
  {
    title: "Node.js Backend",
    description: "Create scalable server-side applications",
    lessons: 28,
    duration: "5 hours",
    level: "Intermediate",
    progress: 0,
  },
  {
    title: "TypeScript Mastery",
    description: "Type-safe JavaScript development",
    lessons: 20,
    duration: "3.5 hours",
    level: "Advanced",
    progress: 0,
  },
]

export default function AcademyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Academy</h1>
          <p className="text-muted-foreground">Learn new skills with interactive tutorials</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Award className="w-5 h-5 text-primary" />
          <span className="font-semibold">3 Certificates Earned</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((course, index) => (
          <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge
                  variant="secondary"
                  className={`${
                    course.level === "Beginner"
                      ? "bg-green-500/10 text-green-500"
                      : course.level === "Intermediate"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {course.level}
                </Badge>
                {course.progress > 0 && (
                  <span className="text-sm text-muted-foreground">{course.progress}% complete</span>
                )}
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.lessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              </div>
              {course.progress > 0 && <Progress value={course.progress} className="h-2" />}
              <Button className="w-full">
                <Play className="w-4 h-4 mr-2" />
                {course.progress > 0 ? "Continue" : "Start Course"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
