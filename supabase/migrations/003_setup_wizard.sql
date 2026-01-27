-- Setup Wizard Migration
-- Adds region hierarchy, customers table, and director access tables

-- 1. Add hierarchy to regions (parent/child relationships)
ALTER TABLE regions ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES regions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_regions_parent_id ON regions(parent_id);

-- 2. Director-to-regions access (allows multi-region assignment)
CREATE TABLE IF NOT EXISTS director_region_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id TEXT NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(director_id, region_id)
);

-- Ensure only one primary region per director
CREATE UNIQUE INDEX IF NOT EXISTS idx_director_primary_region
ON director_region_access(director_id)
WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_dra_director_id ON director_region_access(director_id);
CREATE INDEX IF NOT EXISTS idx_dra_region_id ON director_region_access(region_id);

-- 3. Customers master table (for Strategic Accounts roles)
CREATE TABLE IF NOT EXISTS customers_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_master_active ON customers_master(active);

-- 4. Director-to-customers access
CREATE TABLE IF NOT EXISTS director_customer_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id TEXT NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers_master(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(director_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_dca_director_id ON director_customer_access(director_id);
CREATE INDEX IF NOT EXISTS idx_dca_customer_id ON director_customer_access(customer_id);

-- 5. Director-to-reps access (explicit assignment instead of region-based)
CREATE TABLE IF NOT EXISTS director_rep_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id TEXT NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
  rep_firm_id UUID NOT NULL REFERENCES rep_firms_master(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(director_id, rep_firm_id)
);

CREATE INDEX IF NOT EXISTS idx_drep_director_id ON director_rep_access(director_id);
CREATE INDEX IF NOT EXISTS idx_drep_rep_firm_id ON director_rep_access(rep_firm_id);

-- Enable Row Level Security on all new tables
ALTER TABLE director_region_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_customer_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_rep_access ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (using anon key)
CREATE POLICY "Allow all access" ON director_region_access FOR ALL USING (true);
CREATE POLICY "Allow all access" ON customers_master FOR ALL USING (true);
CREATE POLICY "Allow all access" ON director_customer_access FOR ALL USING (true);
CREATE POLICY "Allow all access" ON director_rep_access FOR ALL USING (true);

-- Migrate existing director-region relationships to junction table
INSERT INTO director_region_access (director_id, region_id, is_primary)
SELECT id, region_id, true
FROM directors
WHERE region_id IS NOT NULL
ON CONFLICT (director_id, region_id) DO NOTHING;
