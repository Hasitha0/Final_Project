// ==========================================
// EcoTech Database Schema & Types
// ==========================================
// Complete database schema documentation with TypeScript types
// Generated from Supabase MCP analysis

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==========================================
// CORE TABLE TYPES
// ==========================================

export interface Profile {
  // Core fields
  id: string
  auto_id: number
  name: string
  email: string
  role: string // 'USER' | 'COLLECTOR' | 'RECYCLING_CENTER' | 'ADMIN'
  phone: string | null
  created_at: string | null
  updated_at: string | null
  
  // Status & Authentication
  status: string | null // 'active' | 'pending_approval' | 'rejected' | 'deactivated'
  account_status: string | null // 'active' | 'deactivated' | 'deleted' | 'pending_approval'
  password_hash: string | null
  last_login: string | null
  login_attempts: number | null
  locked_until: string | null
  
  // Location & Contact
  address: string | null
  district: string | null
  area: string | null
  default_pickup_address: string | null
  
  // Profile Info
  bio: string | null
  date_of_birth: string | null
  profile_picture_url: string | null
  additional_info: string | null
  rejection_reason: string | null
  registration_number: string | null
  
  // Collector-specific fields
  experience: string | null
  vehicle_type: string | null
  license_number: string | null
  coverage_area: string | null
  availability: string | null
  preferred_schedule: string | null
  collector_status: string | null // 'active' | 'inactive'
  
  // Recycling Center-specific fields
  center_name: string | null
  operating_hours: string | null
  accepted_materials: string[] | null
  capacity: string | null
}

export interface CollectionRequest {
  // Core identification
  id: string
  user_id: string
  collector_id: string | null
  recycling_center_id: string | null
  delivery_id: string | null
  
  // Status & Workflow
  status: string // 'pending' | 'claimed' | 'scheduled' | 'in_progress' | 'collected' | 'delivered' | 'completed' | 'cancelled'
  priority: string | null // 'low' | 'medium' | 'high' | 'urgent'
  processing_status: string | null
  
  // Items & Legacy System
  item_types: string[]
  item_categories: string[] | null
  quantities: string
  
  // Paid System (New)
  items: Json | null // CollectionRequestItem[]
  total_amount: number | null
  payment_method: string | null
  payment_status: string | null // 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_intent_id: string | null
  stripe_session_id: string | null
  collector_commission: number | null
  commission_paid: boolean | null
  commission_paid_at: string | null
  
  // Scheduling
  preferred_date: string
  preferred_time: string
  scheduled_date: string | null
  scheduled_time: string | null
  
  // Location & Contact
  address: string
  contact_phone: string
  contact_person: string | null
  pickup_floor: string | null
  building_access_info: string | null
  
  // Additional Info
  special_instructions: string | null
  item_photos: string[] | null
  collector_notes: string | null
  recycling_notes: string | null
  
  // Timestamps
  created_at: string | null
  updated_at: string | null
  completed_at: string | null
}

export interface RecyclingCenter {
  id: string
  name: string
  address: string
  coordinates: unknown | null
  phone: string
  email: string
  hours: string
  materials: string[]
  rating: number | null
  reviews: number | null
  status: string | null
  user_id: string | null
  created_at: string | null
}

export interface PricingCategory {
  id: string
  category_key: string
  name: string
  description: string
  price_per_item: number
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface CollectorEarning {
  id: string
  collector_id: string
  collection_request_id: string
  amount: number
  status: string | null // 'pending' | 'paid' | 'cancelled'
  paid_at: string | null
  created_at: string | null
}

export interface Delivery {
  id: string
  collection_request_id: string
  collector_id: string
  recycling_center_id: string
  status: string // 'pending_delivery' | 'delivered' | 'received' | 'quality_checked' | 'processing' | 'processed'
  delivered_at: string | null
  received_at: string | null
  processed_at: string | null
  collector_notes: string | null
  delivery_notes: string | null
  processing_notes: string | null
  quality_assessment: Json | null
  delivery_photos: string[] | null
  item_condition: string | null // 'excellent' | 'good' | 'fair' | 'poor'
  contamination_level: string | null // 'none' | 'low' | 'medium' | 'high'
  created_at: string | null
  updated_at: string | null
}

export interface MaterialType {
  id: string
  name: string
  description: string
  examples: string[]
  processing_fee: number
  recycling_rate: number
}

export interface SupportTicket {
  id: string
  user_id: string | null
  name: string
  email: string
  subject: string
  category: string // 'account_reactivation' | 'technical_issue' | 'billing_question' | 'collection_issue' | 'general_inquiry' | 'bug_report' | 'feature_request' | 'other'
  priority: string | null // 'low' | 'medium' | 'high' | 'urgent'
  message: string
  status: string | null // 'open' | 'in_progress' | 'resolved' | 'closed'
  admin_response: string | null
  responded_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Feedback {
  id: string
  user_id: string
  feedback_type: string // 'general' | 'service' | 'feature_request' | 'bug_report' | 'collection_experience'
  subject: string
  message: string
  rating: number | null // 1-5
  status: string | null // 'pending' | 'reviewed' | 'resolved' | 'closed'
  admin_response: string | null
  collection_request_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  badge_color: string | null
  criteria: Json
  points: number | null
  is_active: boolean | null
  created_at: string | null
}

// ==========================================
// ENUM TYPES
// ==========================================

export const UserRoles = {
  USER: 'USER',
  COLLECTOR: 'COLLECTOR',
  RECYCLING_CENTER: 'RECYCLING_CENTER',
  ADMIN: 'ADMIN'
} as const

export const CollectionRequestStatus = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COLLECTED: 'collected',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
} as const

export const AccountStatus = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
  DELETED: 'deleted',
  PENDING_APPROVAL: 'pending_approval'
} as const

// ==========================================
// BUSINESS LOGIC TYPES
// ==========================================

export interface CollectionRequestItem {
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface RecyclingCenterWithProfile {
  id: string
  name: string
  center_name?: string
  address: string
  phone: string
  email: string
  operating_hours?: string
  accepted_materials: string[]
  capacity?: string
  area?: string
  district?: string
  status: string
}

export interface CollectionRequestWithDetails extends CollectionRequest {
  user_profile?: Profile
  collector_profile?: Profile
  recycling_center?: RecyclingCenter
  delivery?: Delivery
  earnings?: CollectorEarning
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==========================================
// DATABASE SCHEMA DOCUMENTATION
// ==========================================

/**
 * EcoTech Database Schema Overview
 * 
 * ARCHITECTURE:
 * The EcoTech platform uses a unified profiles table for all user types,
 * with role-based field usage. This supports the paid e-waste collection
 * system with 20% collector commissions.
 * 
 * CORE WORKFLOW:
 * 1. User creates collection_request with items and pricing
 * 2. Collector claims request and selects recycling center
 * 3. Payment processed via Stripe with collector commission calculated
 * 4. Delivery tracking from pickup to recycling center
 * 5. Commission paid to collector upon completion
 * 
 * KEY TABLES:
 * 
 * 📋 profiles (Unified Users)
 * - All user types: USER, COLLECTOR, RECYCLING_CENTER, ADMIN
 * - Custom authentication (no Supabase Auth)
 * - Role-specific fields for collectors and recycling centers
 * - Account status management and session validation
 * 
 * 📦 collection_requests (Core Workflow)
 * - Supports both legacy (free) and paid collection systems
 * - Items stored as JSONB with individual pricing
 * - Payment integration with Stripe
 * - Collector commission tracking (20% of total)
 * - Photo upload support for items
 * 
 * 🏭 recycling_centers (Legacy Table)
 * - Mostly unused - data stored in profiles table
 * - Kept for foreign key constraints
 * - New recycling centers added as profiles with role='RECYCLING_CENTER'
 * 
 * 💰 pricing_categories (Standardized Pricing)
 * - Fixed pricing: $3-$35 per item based on category
 * - Used by paid collection system for real-time calculations
 * 
 * 💵 collector_earnings (Commission Tracking)
 * - 20% commission for collectors on completed requests
 * - Status tracking: pending → paid
 * - One-to-one relationship with collection_requests
 * 
 * 🚚 deliveries (Workflow Tracking)
 * - Tracks items from collector pickup to recycling center
 * - Quality assessment and weight verification
 * - Photo documentation of delivery
 * 
 * 🎯 achievements (Gamification)
 * - Points and badges for user engagement
 * - Criteria stored as JSONB for flexibility
 * 
 * 🎫 support_tickets (Customer Support)
 * - Account reactivation requests
 * - Technical issues and general inquiries
 * - Admin response tracking
 * 
 * 📝 feedback (User Feedback)
 * - Collection experience ratings
 * - Feature requests and bug reports
 * - Linked to specific collection requests
 * 
 * IMPORTANT RELATIONSHIPS:
 * - collection_requests.user_id → profiles.id (customer)
 * - collection_requests.collector_id → profiles.id (collector)
 * - collector_earnings.collector_id → profiles.id
 * - collector_earnings.collection_request_id → collection_requests.id (1:1)
 * 
 * AUTHENTICATION SYSTEM:
 * - Custom authentication with password hashing
 * - Session validation against database
 * - Account locking after failed attempts
 * - Role-based access control (RBAC)
 * 
 * PAYMENT SYSTEM:
 * - Stripe integration for payment processing
 * - Real-time pricing calculations
 * - Automatic commission calculation (20%)
 * - Payment status tracking throughout workflow
 * 
 * DATA FLOW:
 * 1. User registers → profile created with role='USER'
 * 2. Collection request → items priced, total calculated
 * 3. Payment → Stripe session, commission calculated
 * 4. Collector claims → recycling center selected from profiles
 * 5. Delivery → workflow tracked, quality assessed
 * 6. Completion → commission paid to collector
 */

export type UserRole = typeof UserRoles[keyof typeof UserRoles]
export type CollectionRequestStatusType = typeof CollectionRequestStatus[keyof typeof CollectionRequestStatus]
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus]
export type AccountStatusType = typeof AccountStatus[keyof typeof AccountStatus] 