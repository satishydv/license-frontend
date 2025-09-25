export type User = {
  id: number
  name: string
  email: string
  role: "admin" | "user" | "moderator"
  status: "active" | "inactive" | "pending"
  created_at: string
  last_login?: string
  permissions?: string[]
}

// Dummy data removed - now using real data from database
