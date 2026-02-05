-- Flexible Sales Channels Migration
-- Allows different directors to work with different entity types (reps, distributors, specialty accounts)

-- 1. Add entity_type to rep_firms_master
-- Existing records default to 'rep_firm' for backward compatibility
ALTER TABLE rep_firms_master
ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'rep_firm'
CHECK (entity_type IN ('rep_firm', 'distributor', 'specialty_account'));

CREATE INDEX IF NOT EXISTS idx_rep_firms_entity_type ON rep_firms_master(entity_type);

-- Ensure existing records have the default value
UPDATE rep_firms_master SET entity_type = 'rep_firm' WHERE entity_type IS NULL;

-- 2. Add uses_direct_customers flag to directors
-- Indicates whether this director works with direct customers (uses customers_master table)
ALTER TABLE directors ADD COLUMN IF NOT EXISTS uses_direct_customers BOOLEAN DEFAULT false;

-- Set true for directors who already have customer assignments
UPDATE directors d
SET uses_direct_customers = true
WHERE EXISTS (
  SELECT 1 FROM director_customer_access dca WHERE dca.director_id = d.id
);

-- 3. Create director_channel_config table
-- Tracks which sales channel types each director is configured to use
CREATE TABLE IF NOT EXISTS director_channel_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id TEXT NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('rep_firm', 'distributor', 'specialty_account')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(director_id, channel_type)
);

CREATE INDEX IF NOT EXISTS idx_dcc_director_id ON director_channel_config(director_id);

-- Enable RLS
ALTER TABLE director_channel_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON director_channel_config FOR ALL USING (true);

-- 4. Seed channel config for existing directors with rep firm assignments
-- Directors who have rep_firm assignments get 'rep_firm' channel type
INSERT INTO director_channel_config (director_id, channel_type)
SELECT DISTINCT director_id, 'rep_firm'
FROM director_rep_access
ON CONFLICT (director_id, channel_type) DO NOTHING;
