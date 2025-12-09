import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { CoursesContent } from "@/components/courses/courses-content"

export default async function CoursesPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    redirect("/auth/login")
  }

  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch published courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*, users:creator_id(username, avatar_url)")
    .eq("is_published", true)
    .order("enrolled_count", { ascending: false })

  // Fetch user's enrollments
  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("*, courses(title, thumbnail_url, total_lessons)")
    .eq("user_id", session.user_id)

  // Fetch user's created courses
  const { data: myCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("creator_id", session.user_id)
    .order("created_at", { ascending: false })

  return (
    <CoursesContent
      courses={courses || []}
      enrollments={enrollments || []}
      myCourses={myCourses || []}
      currentUserId={session.user_id}
    />
  )
}
