-- Add industry_info column to market_trends table
-- This field was collected in the Competition tab UI but never persisted
ALTER TABLE market_trends ADD COLUMN IF NOT EXISTS industry_info TEXT;
