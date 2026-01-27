-- Admin Management Tables Migration
-- Run this in Supabase Dashboard → SQL Editor

-- Ensure uuid extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rep_firms_master table (master list for dropdown)
CREATE TABLE IF NOT EXISTS rep_firms_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed regions from existing director data
INSERT INTO regions (name)
SELECT DISTINCT region FROM directors WHERE region IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Add region_id column to directors
ALTER TABLE directors ADD COLUMN region_id UUID REFERENCES regions(id) ON DELETE SET NULL;

-- Populate region_id based on existing region text
UPDATE directors d
SET region_id = r.id
FROM regions r
WHERE d.region = r.name;

-- Create indexes
CREATE INDEX idx_rep_firms_master_region_id ON rep_firms_master(region_id);
CREATE INDEX idx_rep_firms_master_active ON rep_firms_master(active);
CREATE INDEX idx_directors_region_id ON directors(region_id);

-- Enable Row Level Security
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_firms_master ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (using anon key)
CREATE POLICY "Allow all access" ON regions FOR ALL USING (true);
CREATE POLICY "Allow all access" ON rep_firms_master FOR ALL USING (true);
