-- Sonance Field Team Bi-Weekly Report - Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Directors table
CREATE TABLE directors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  director_id UUID NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  executive_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(director_id, month)
);

-- Wins table
CREATE TABLE wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT
);

-- Rep Firms table
CREATE TABLE rep_firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_sales NUMERIC DEFAULT 0,
  ytd_sales NUMERIC DEFAULT 0,
  percent_to_goal NUMERIC DEFAULT 0,
  yoy_growth NUMERIC DEFAULT 0
);

-- Competitors table
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  what_were_seeing TEXT,
  our_response TEXT
);

-- Regional Performance table (one per report)
CREATE TABLE regional_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  monthly_sales NUMERIC DEFAULT 0,
  monthly_goal NUMERIC DEFAULT 0,
  ytd_sales NUMERIC DEFAULT 0,
  ytd_goal NUMERIC DEFAULT 0,
  open_orders NUMERIC DEFAULT 0,
  pipeline NUMERIC DEFAULT 0
);

-- Key Initiatives table (one per report)
CREATE TABLE key_initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  key_projects TEXT,
  distribution_updates TEXT,
  challenges_blockers TEXT
);

-- Marketing Events table (one per report)
CREATE TABLE marketing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  events_attended TEXT,
  marketing_campaigns TEXT
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Market Trends table (one per report)
CREATE TABLE market_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  observations TEXT
);

-- Follow Ups table (one per report)
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  content TEXT
);

-- Good Jobs (peer recognition) table
CREATE TABLE good_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  reason TEXT
);

-- Global Summaries table (for AI-generated summaries)
CREATE TABLE global_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_type TEXT NOT NULL,
  period_value TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  report_ids UUID[] DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  UNIQUE(period_type, period_value)
);

-- Create indexes for performance
CREATE INDEX idx_reports_director_id ON reports(director_id);
CREATE INDEX idx_reports_month ON reports(month);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_wins_report_id ON wins(report_id);
CREATE INDEX idx_rep_firms_report_id ON rep_firms(report_id);
CREATE INDEX idx_competitors_report_id ON competitors(report_id);
CREATE INDEX idx_photos_report_id ON photos(report_id);
CREATE INDEX idx_good_jobs_report_id ON good_jobs(report_id);

-- Seed directors data
INSERT INTO directors (name, email, region) VALUES
  ('Adrián Sepúlveda', 'asepulveda@sonance.com', 'Mexico / LATAM'),
  ('Allison Clifford', 'aclifford@sonance.com', 'Marketing / Brand'),
  ('Eric Huber', 'ehuber@sonance.com', 'Marketing'),
  ('Glenn Kalinowski', 'gkalinowski@sonance.com', 'Strategic Accounts'),
  ('James Duvall', 'jduvall@sonance.com', 'Central'),
  ('Paxson Laird', 'plaird@sonance.com', 'Product / Technical'),
  ('Shawn Brechbill', 'sbrechbill@sonance.com', 'A&D / Consultants'),
  ('Simon Wehr', 'swehr@sonance.com', 'Business Development');

-- Enable Row Level Security
ALTER TABLE directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE good_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (using anon key)
CREATE POLICY "Allow all access" ON directors FOR ALL USING (true);
CREATE POLICY "Allow all access" ON reports FOR ALL USING (true);
CREATE POLICY "Allow all access" ON wins FOR ALL USING (true);
CREATE POLICY "Allow all access" ON rep_firms FOR ALL USING (true);
CREATE POLICY "Allow all access" ON competitors FOR ALL USING (true);
CREATE POLICY "Allow all access" ON regional_performance FOR ALL USING (true);
CREATE POLICY "Allow all access" ON key_initiatives FOR ALL USING (true);
CREATE POLICY "Allow all access" ON marketing_events FOR ALL USING (true);
CREATE POLICY "Allow all access" ON photos FOR ALL USING (true);
CREATE POLICY "Allow all access" ON market_trends FOR ALL USING (true);
CREATE POLICY "Allow all access" ON follow_ups FOR ALL USING (true);
CREATE POLICY "Allow all access" ON good_jobs FOR ALL USING (true);
CREATE POLICY "Allow all access" ON global_summaries FOR ALL USING (true);
