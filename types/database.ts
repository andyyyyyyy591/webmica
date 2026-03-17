export type UserRole = 'user' | 'admin'
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'manual'
export type PaymentProvider = 'mercadopago' | 'paypal' | 'manual'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string | null
  cover_image: string | null
  price: number
  currency: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  position: number
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content: Record<string, unknown> | null
  position: number
  is_preview: boolean
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  user_id: string
  course_id: string
  status: PurchaseStatus
  provider: PaymentProvider | null
  provider_ref: string | null
  amount: number | null
  currency: string | null
  granted_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Course, 'id' | 'created_at'>>
      }
      modules: {
        Row: Module
        Insert: Omit<Module, 'id' | 'created_at'>
        Update: Partial<Omit<Module, 'id' | 'created_at'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lesson, 'id' | 'created_at'>>
      }
      purchases: {
        Row: Purchase
        Insert: Omit<Purchase, 'id' | 'created_at'>
        Update: Partial<Omit<Purchase, 'id' | 'created_at'>>
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
