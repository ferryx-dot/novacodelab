"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Briefcase, Clock, DollarSign, Users, Calendar, Send, CheckCircle, XCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { FreelanceJob, JobApplication } from "@/lib/types"
import { useRouter } from "next/navigation"

interface JobBoardContentProps {
  jobs: (FreelanceJob & { poster?: { username: string; avatar_url: string | null } })[]
  myJobs: FreelanceJob[]
  myApplications: (JobApplication & { freelance_jobs?: { title: string; status: string } })[]
  currentUserId: string
}

const SKILL_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Python",
  "Node.js",
  "SQL",
  "UI/UX",
  "Mobile",
  "DevOps",
  "AI/ML",
  "Blockchain",
]

export function JobBoardContent({ jobs, myJobs, myApplications, currentUserId }: JobBoardContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<FreelanceJob | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Create job form
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    required_skills: [] as string[],
    budget_min: "",
    budget_max: "",
    deadline: "",
  })

  // Apply form
  const [application, setApplication] = useState({
    cover_message: "",
    proposed_amount: "",
    proposed_timeline: "",
  })

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreateJob = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newJob,
          budget_min: newJob.budget_min ? Number.parseFloat(newJob.budget_min) : null,
          budget_max: newJob.budget_max ? Number.parseFloat(newJob.budget_max) : null,
        }),
      })

      if (res.ok) {
        setIsCreateOpen(false)
        setNewJob({
          title: "",
          description: "",
          required_skills: [],
          budget_min: "",
          budget_max: "",
          deadline: "",
        })
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
    if (!selectedJob) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: selectedJob.id,
          ...application,
          proposed_amount: application.proposed_amount ? Number.parseFloat(application.proposed_amount) : null,
        }),
      })

      if (res.ok) {
        setIsApplyOpen(false)
        setApplication({ cover_message: "", proposed_amount: "", proposed_timeline: "" })
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setNewJob((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((s) => s !== skill)
        : [...prev.required_skills, skill],
    }))
  }

  const hasApplied = (jobId: string) => myApplications.some((a) => a.job_id === jobId)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Freelance Job Board
          </h1>
          <p className="text-muted-foreground">Find work or hire talented developers</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Post a New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g., Build a React Dashboard"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe the project, requirements, and deliverables..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={newJob.required_skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Budget ($)</Label>
                  <Input
                    type="number"
                    value={newJob.budget_min}
                    onChange={(e) => setNewJob({ ...newJob, budget_min: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Budget ($)</Label>
                  <Input
                    type="number"
                    value={newJob.budget_max}
                    onChange={(e) => setNewJob({ ...newJob, budget_max: e.target.value })}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deadline (optional)</Label>
                <Input
                  type="date"
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                />
              </div>

              <Button
                onClick={handleCreateJob}
                disabled={!newJob.title || !newJob.description || isLoading}
                className="w-full"
              >
                {isLoading ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          <TabsTrigger value="my-jobs">My Posted Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title, description, or skills..."
              className="pl-9"
            />
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try different search terms" : "Be the first to post a job"}
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={job.poster?.avatar_url || undefined} />
                            <AvatarFallback>
                              {job.poster?.username?.substring(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Posted by {job.poster?.username || "Unknown"} on {formatDate(job.created_at)}
                            </p>
                          </div>
                        </div>

                        <p className="text-muted-foreground line-clamp-2">{job.description}</p>

                        {/* Skills */}
                        {job.required_skills && job.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {(job.budget_min || job.budget_max) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.budget_min && job.budget_max
                                ? `${formatCurrency(job.budget_min)} - ${formatCurrency(job.budget_max)}`
                                : job.budget_max
                                  ? `Up to ${formatCurrency(job.budget_max)}`
                                  : `From ${formatCurrency(job.budget_min!)}`}
                            </span>
                          )}
                          {job.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due {formatDate(job.deadline)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.applications_count || 0} applications
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {job.poster_id === currentUserId ? (
                          <Button variant="outline" disabled>
                            Your Job
                          </Button>
                        ) : hasApplied(job.id) ? (
                          <Button variant="outline" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Applied
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedJob(job)
                              setIsApplyOpen(true)
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-jobs" className="space-y-4">
          {myJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">Post a job to find talented developers</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">Posted {formatDate(job.created_at)}</p>
                      </div>
                      <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground">Browse jobs and submit applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{app.freelance_jobs?.title || "Unknown Job"}</h3>
                        <p className="text-sm text-muted-foreground">Applied {formatDate(app.created_at)}</p>
                        {app.proposed_amount && (
                          <p className="text-sm">Proposed: {formatCurrency(app.proposed_amount)}</p>
                        )}
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for: {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Cover Message</Label>
              <Textarea
                value={application.cover_message}
                onChange={(e) => setApplication({ ...application, cover_message: e.target.value })}
                placeholder="Introduce yourself and explain why you're a good fit..."
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Your Price ($)</Label>
                <Input
                  type="number"
                  value={application.proposed_amount}
                  onChange={(e) => setApplication({ ...application, proposed_amount: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Input
                  value={application.proposed_timeline}
                  onChange={(e) => setApplication({ ...application, proposed_timeline: e.target.value })}
                  placeholder="e.g., 1 week"
                />
              </div>
            </div>

            <Button onClick={handleApply} disabled={!application.cover_message || isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
