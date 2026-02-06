-- Add entity_type to rep_firms (per-report performance data)
-- This connects the report form to the Setup Wizard's channel configuration
-- Existing rows default to 'rep_firm' for backward compatibility

ALTER TABLE rep_firms
ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'rep_firm'
CHECK (entity_type IN ('rep_firm', 'distributor', 'specialty_account', 'direct_customer'));

CREATE INDEX IF NOT EXISTS idx_rep_firms_entity_type ON rep_firms(entity_type);

-- Backfill existing rows
UPDATE rep_firms SET entity_type = 'rep_firm' WHERE entity_type IS NULL;
