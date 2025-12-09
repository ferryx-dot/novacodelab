import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { JobBoardContent } from "@/components/jobs/job-board-content"

export default async function JobsPage() {
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

  // Fetch all open jobs
  const { data: jobs } = await supabase
    .from("freelance_jobs")
    .select("*, users:poster_id(username, avatar_url)")
    .eq("status", "open")
    .order("created_at", { ascending: false })

  // Count applications for each job
  const jobIds = jobs?.map((j) => j.id) || []
  const { data: applicationCounts } = await supabase.from("job_applications").select("job_id").in("job_id", jobIds)

  const appCountMap = new Map<string, number>()
  applicationCounts?.forEach((a) => {
    appCountMap.set(a.job_id, (appCountMap.get(a.job_id) || 0) + 1)
  })

  const jobsWithCounts = jobs?.map((j) => ({
    ...j,
    applications_count: appCountMap.get(j.id) || 0,
    poster: j.users,
  }))

  // Get user's posted jobs
  const { data: myJobs } = await supabase
    .from("freelance_jobs")
    .select("*")
    .eq("poster_id", session.user_id)
    .order("created_at", { ascending: false })

  // Get user's applications
  const { data: myApplications } = await supabase
    .from("job_applications")
    .select("*, freelance_jobs(title, status, poster_id)")
    .eq("applicant_id", session.user_id)
    .order("created_at", { ascending: false })

  return (
    <JobBoardContent
      jobs={jobsWithCounts || []}
      myJobs={myJobs || []}
      myApplications={myApplications || []}
      currentUserId={session.user_id}
    />
  )
}
