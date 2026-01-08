import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Director {
  id: string
  name: string
  email: string
  region: string
  created_at: string
}

export interface Report {
  id: string
  director_id: string
  month: string // YYYY-MM format
  status: 'draft' | 'submitted'
  executive_summary: string | null
  created_at: string
  updated_at: string
}

export interface Win {
  id: string
  report_id: string
  title: string
  description: string
}

export interface RepFirm {
  id: string
  report_id: string
  name: string
  monthly_sales: number
  ytd_sales: number
  percent_to_goal: number
  yoy_growth: number
}

export interface Competitor {
  id: string
  report_id: string
  name: string
  what_were_seeing: string
  our_response: string
}

export interface RegionalPerformance {
  id: string
  report_id: string
  monthly_sales: number
  monthly_goal: number
  ytd_sales: number
  ytd_goal: number
  open_orders: number
  pipeline: number
}

export interface KeyInitiatives {
  id: string
  report_id: string
  key_projects: string
  distribution_updates: string
  challenges_blockers: string
}

export interface MarketingEvents {
  id: string
  report_id: string
  events_attended: string
  marketing_campaigns: string
}

export interface Photo {
  id: string
  report_id: string
  filename: string
  url: string
}

export interface MarketTrends {
  id: string
  report_id: string
  observations: string
}

export interface FollowUps {
  id: string
  report_id: string
  content: string
}

// Full report with all related data
export interface FullReport extends Report {
  director?: Director
  wins?: Win[]
  rep_firms?: RepFirm[]
  competitors?: Competitor[]
  regional_performance?: RegionalPerformance
  key_initiatives?: KeyInitiatives
  marketing_events?: MarketingEvents
  photos?: Photo[]
  market_trends?: MarketTrends
  follow_ups?: FollowUps
}
