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
