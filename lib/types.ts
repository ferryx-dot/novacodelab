export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  balance: number
  is_admin: boolean
  is_verified: boolean
  verification_expires_at: string | null
  reputation_score: number
  total_sales: number
  total_purchases: number
  files_uploaded: number
  messages_sent: number
  storage_used: number
  created_at: string
  updated_at: string
}

export interface MarketplaceFile {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  file_url: string
  file_type: string
  file_size: number
  preview_content: string | null
  preview_image_url: string | null
  demo_video_url: string | null
  category: string
  tags: string[] | null
  download_count: number
  view_count: number
  average_rating: number
  total_ratings: number
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Purchase {
  id: string
  buyer_id: string
  seller_id: string
  file_id: string
  amount: number
  transaction_id: string
  created_at: string
  files?: MarketplaceFile
  seller?: Profile
}

export interface Review {
  id: string
  purchase_id: string
  reviewer_id: string
  file_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export interface Transaction {
  id: string
  user_id: string
  type: "purchase" | "sale" | "gift" | "topup" | "verification"
  amount: number
  balance_after: number
  description: string | null
  other_party_id: string | null
  reference_id: string | null
  created_at: string
  other_party?: Profile
}

export interface Message {
  id: string
  user_id: string
  content: string
  is_pinned: boolean
  is_deleted: boolean
  created_at: string
  profiles?: Profile
}

export interface AIConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  reference_id: string | null
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  type: string
  name: string
  description: string | null
  earned_at: string
}

export interface Favorite {
  id: string
  user_id: string
  file_id: string
  created_at: string
  files?: MarketplaceFile
}

export interface CodeSnippet {
  id: string
  user_id: string
  title: string
  description: string | null
  code: string
  language: string
  folder: string
  tags: string[]
  is_public: boolean
  view_count: number
  copy_count: number
  created_at: string
  updated_at: string
  users?: { username: string; avatar_url: string | null }
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string | null
  referral_code: string
  status: string
  commission_earned: number
  created_at: string
  completed_at: string | null
  referred_user?: { username: string }
}

export interface UserSkill {
  id: string
  user_id: string
  skill_name: string
  is_verified: boolean
  verified_at: string | null
  created_at: string
}

export interface FileBundle {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number
  original_price: number
  cover_image_url: string | null
  category: string | null
  download_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  files?: MarketplaceFile[]
  users?: { username: string; avatar_url: string | null }
}

export interface Channel {
  id: string
  name: string
  description: string | null
  icon: string | null
  is_default: boolean
  is_admin_only: boolean
  sort_order: number
  created_at: string
  unread_count?: number
}

export interface ChannelMessage {
  id: string
  channel_id: string
  user_id: string
  content: string
  is_pinned: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  users?: { username: string; avatar_url: string | null; is_admin?: boolean }
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface PriceHistory {
  id: string
  file_id: string
  price: number
  changed_at: string
}

export interface PriceAlert {
  id: string
  user_id: string
  file_id: string
  target_price: number
  is_triggered: boolean
  created_at: string
  triggered_at: string | null
}

export interface Dispute {
  id: string
  purchase_id: string
  buyer_id: string
  seller_id: string
  issue_type: string
  description: string
  evidence_urls: string[]
  desired_resolution: string | null
  status: string
  admin_notes: string | null
  resolution: string | null
  resolved_by: string | null
  created_at: string
  resolved_at: string | null
  buyer?: { username: string }
  seller?: { username: string }
}

export interface Announcement {
  id: string
  title: string
  message: string
  importance: string
  target_audience: string
  cta_text: string | null
  cta_url: string | null
  is_active: boolean
  starts_at: string
  expires_at: string | null
  created_by: string | null
  created_at: string
}

export interface FileVersion {
  id: string
  file_id: string
  version: string
  changelog: string | null
  file_url: string
  created_at: string
}

export interface CodeReview {
  id: string
  requester_id: string
  title: string
  description: string | null
  code: string
  language: string
  bounty: number
  deadline: string | null
  status: string
  winner_id: string | null
  created_at: string
  completed_at: string | null
  requester?: { username: string; avatar_url: string | null }
  submissions_count?: number
}

export interface CodeReviewSubmission {
  id: string
  review_id: string
  reviewer_id: string
  feedback: string
  annotated_code: string | null
  rating: string | null
  is_winner: boolean
  created_at: string
  reviewer?: { username: string; avatar_url: string | null }
}

export interface FreelanceJob {
  id: string
  poster_id: string
  title: string
  description: string
  required_skills: string[]
  budget_min: number | null
  budget_max: number | null
  deadline: string | null
  status: string
  selected_applicant_id: string | null
  escrow_amount: number | null
  created_at: string
  completed_at: string | null
  poster?: { username: string; avatar_url: string | null }
  applications_count?: number
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  cover_message: string
  proposed_amount: number | null
  proposed_timeline: string | null
  portfolio_urls: string[]
  status: string
  created_at: string
  applicant?: { username: string; avatar_url: string | null }
}

export interface Course {
  id: string
  creator_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  price: number
  category: string | null
  difficulty: string
  total_lessons: number
  enrolled_count: number
  average_rating: number
  is_published: boolean
  created_at: string
  updated_at: string
  creator?: { username: string; avatar_url: string | null }
  lessons?: CourseLesson[]
}

export interface CourseLesson {
  id: string
  course_id: string
  title: string
  content: string | null
  video_url: string | null
  sort_order: number
  duration_minutes: number
  created_at: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  user_id: string
  progress: number
  completed_lessons: string[]
  completed_at: string | null
  created_at: string
}

export interface APIKey {
  id: string
  user_id: string
  key_hash: string
  name: string | null
  last_used_at: string | null
  requests_count: number
  is_active: boolean
  created_at: string
}

export interface Playground {
  id: string
  user_id: string | null
  title: string | null
  html_code: string
  css_code: string
  js_code: string
  is_public: boolean
  fork_count: number
  view_count: number
  forked_from: string | null
  created_at: string
  updated_at: string
  users?: { username: string }
}

export interface CollabSession {
  id: string
  owner_id: string
  title: string | null
  code: string
  language: string
  share_code: string
  is_active: boolean
  allow_edit: boolean
  expires_at: string | null
  created_at: string
  owner?: { username: string; avatar_url: string | null }
  participants?: CollabParticipant[]
}

export interface CollabParticipant {
  id: string
  session_id: string
  user_id: string
  can_edit: boolean
  joined_at: string
  users?: { username: string; avatar_url: string | null }
}

export interface AffiliateLink {
  id: string
  user_id: string
  file_id: string
  code: string
  clicks: number
  conversions: number
  earnings: number
  created_at: string
  files?: MarketplaceFile
}

export interface EasterEgg {
  id: string
  user_id: string
  egg_type: string
  unlocked_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  value: number
  badges?: string[]
}
