"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Users, Star, Clock, Play, Search, GraduationCap, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import type { Course, CourseEnrollment } from "@/lib/types"
import { useRouter } from "next/navigation"

interface CoursesContentProps {
  courses: (Course & { users?: { username: string; avatar_url: string | null } })[]
  enrollments: (CourseEnrollment & {
    courses?: { title: string; thumbnail_url: string | null; total_lessons: number }
  })[]
  myCourses: Course[]
  currentUserId: string
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
}

export function CoursesContent({ courses, enrollments, myCourses, currentUserId }: CoursesContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const isEnrolled = (courseId: string) => enrollments.some((e) => e.course_id === courseId)

  const handleEnroll = async (courseId: string) => {
    const res = await fetch("/api/courses/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    })

    if (res.ok) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Learning Courses
          </h1>
          <p className="text-muted-foreground">Structured courses to level up your skills</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-sm text-muted-foreground">Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enrollments.filter((e) => e.completed_at).length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myCourses.length}</p>
              <p className="text-sm text-muted-foreground">Created</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="pl-9"
            />
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground">Check back later for new courses</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-video bg-muted relative">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {course.price === 0 && <Badge className="absolute top-2 right-2 bg-green-500">Free</Badge>}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={course.users?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {course.users?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{course.users?.username}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.total_lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.enrolled_count}
                      </span>
                      {course.average_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          {course.average_rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={DIFFICULTY_COLORS[course.difficulty] || ""}>{course.difficulty}</Badge>
                        {course.category && <Badge variant="outline">{course.category}</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-primary">
                        {course.price === 0 ? "Free" : formatCurrency(course.price)}
                      </span>
                      {course.creator_id === currentUserId ? (
                        <Button size="sm" variant="outline" disabled>
                          Your Course
                        </Button>
                      ) : isEnrolled(course.id) ? (
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Continue
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleEnroll(course.id)}>
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses enrolled</h3>
                <p className="text-muted-foreground">Browse courses and start learning</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        {enrollment.courses?.thumbnail_url ? (
                          <img
                            src={enrollment.courses.thumbnail_url || "/placeholder.svg"}
                            alt={enrollment.courses.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{enrollment.courses?.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={enrollment.progress} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {enrollment.completed_lessons?.length || 0} / {enrollment.courses?.total_lessons || 0} lessons
                        </p>
                      </div>
                      <Button>
                        <Play className="w-4 h-4 mr-1" />
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
