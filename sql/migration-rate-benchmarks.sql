-- Migration: Add rate benchmark tables and pre-seeded industry data
-- Run this in Supabase SQL Editor

-- 1. Pre-seeded industry benchmark data table
CREATE TABLE IF NOT EXISTS rate_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  follower_tier TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  min_rate DECIMAL(10,2),
  p25_rate DECIMAL(10,2),
  median_rate DECIMAL(10,2),
  p75_rate DECIMAL(10,2),
  max_rate DECIMAL(10,2),
  sample_size INTEGER DEFAULT 0,
  source TEXT DEFAULT 'industry_report',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, follower_tier, deliverable_type)
);

-- 2. Crowdsourced aggregate table (refreshed periodically)
CREATE TABLE IF NOT EXISTS rate_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  follower_tier TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  avg_rate DECIMAL(10,2),
  median_rate DECIMAL(10,2),
  p10_rate DECIMAL(10,2),
  p25_rate DECIMAL(10,2),
  p75_rate DECIMAL(10,2),
  p90_rate DECIMAL(10,2),
  sample_count INTEGER DEFAULT 0,
  last_computed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, follower_tier, deliverable_type)
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_rate_benchmarks_lookup ON rate_benchmarks(platform, follower_tier, deliverable_type);
CREATE INDEX IF NOT EXISTS idx_rate_aggregates_lookup ON rate_aggregates(platform, follower_tier, deliverable_type);

-- 4. RLS policies
ALTER TABLE rate_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_aggregates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view rate benchmarks" ON rate_benchmarks;
CREATE POLICY "Anyone can view rate benchmarks" ON rate_benchmarks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view rate aggregates" ON rate_aggregates;
CREATE POLICY "Anyone can view rate aggregates" ON rate_aggregates FOR SELECT USING (true);

-- 5. Add anti-abuse fields to rate_history
ALTER TABLE rate_history ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE rate_history ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- 6. Pre-seeded YouTube benchmark data (based on Influencer Marketing Hub 2025-2026 report)
INSERT INTO rate_benchmarks (platform, follower_tier, deliverable_type, min_rate, p25_rate, median_rate, p75_rate, max_rate, sample_size, source) VALUES
('youtube', 'nano', 'video', 20, 50, 100, 150, 200, 0, 'industry_report'),
('youtube', 'micro', 'video', 200, 400, 600, 800, 1000, 0, 'industry_report'),
('youtube', 'mid', 'video', 1000, 2500, 5000, 7500, 10000, 0, 'industry_report'),
('youtube', 'macro', 'video', 10000, 12000, 15000, 18000, 20000, 0, 'industry_report'),
('youtube', 'mega', 'video', 20000, 25000, 35000, 50000, 100000, 0, 'industry_report')
ON CONFLICT (platform, follower_tier, deliverable_type) DO UPDATE SET
  min_rate = EXCLUDED.min_rate,
  p25_rate = EXCLUDED.p25_rate,
  median_rate = EXCLUDED.median_rate,
  p75_rate = EXCLUDED.p75_rate,
  max_rate = EXCLUDED.max_rate,
  last_updated = NOW();

-- 7. Pre-seeded Instagram benchmark data
INSERT INTO rate_benchmarks (platform, follower_tier, deliverable_type, min_rate, p25_rate, median_rate, p75_rate, max_rate, sample_size, source) VALUES
('instagram', 'nano', 'post', 10, 25, 50, 75, 100, 0, 'industry_report'),
('instagram', 'micro', 'post', 100, 200, 350, 450, 500, 0, 'industry_report'),
('instagram', 'mid', 'post', 500, 1500, 2500, 4000, 5000, 0, 'industry_report'),
('instagram', 'macro', 'post', 5000, 6500, 8000, 9500, 10000, 0, 'industry_report'),
('instagram', 'mega', 'post', 10000, 15000, 25000, 50000, 100000, 0, 'industry_report')
ON CONFLICT (platform, follower_tier, deliverable_type) DO UPDATE SET
  min_rate = EXCLUDED.min_rate,
  p25_rate = EXCLUDED.p25_rate,
  median_rate = EXCLUDED.median_rate,
  p75_rate = EXCLUDED.p75_rate,
  max_rate = EXCLUDED.max_rate,
  last_updated = NOW();

-- 8. Pre-seeded TikTok benchmark data
INSERT INTO rate_benchmarks (platform, follower_tier, deliverable_type, min_rate, p25_rate, median_rate, p75_rate, max_rate, sample_size, source) VALUES
('tiktok', 'nano', 'video', 5, 20, 50, 100, 200, 0, 'industry_report'),
('tiktok', 'micro', 'video', 50, 150, 300, 500, 800, 0, 'industry_report'),
('tiktok', 'mid', 'video', 500, 1500, 2500, 4000, 5000, 0, 'industry_report'),
('tiktok', 'macro', 'video', 800, 2000, 3500, 4500, 5000, 0, 'industry_report'),
('tiktok', 'mega', 'video', 5000, 10000, 25000, 40000, 50000, 0, 'industry_report')
ON CONFLICT (platform, follower_tier, deliverable_type) DO UPDATE SET
  min_rate = EXCLUDED.min_rate,
  p25_rate = EXCLUDED.p25_rate,
  median_rate = EXCLUDED.median_rate,
  p75_rate = EXCLUDED.p75_rate,
  max_rate = EXCLUDED.max_rate,
  last_updated = NOW();

-- 9. Pre-seeded Instagram Story benchmark data (typically 30-50% of post rates)
INSERT INTO rate_benchmarks (platform, follower_tier, deliverable_type, min_rate, p25_rate, median_rate, p75_rate, max_rate, sample_size, source) VALUES
('instagram', 'nano', 'story', 5, 15, 30, 50, 70, 0, 'industry_report'),
('instagram', 'micro', 'story', 50, 100, 175, 250, 300, 0, 'industry_report'),
('instagram', 'mid', 'story', 250, 750, 1250, 2000, 2500, 0, 'industry_report'),
('instagram', 'macro', 'story', 2500, 3250, 4000, 4750, 5000, 0, 'industry_report'),
('instagram', 'mega', 'story', 5000, 7500, 12500, 25000, 50000, 0, 'industry_report')
ON CONFLICT (platform, follower_tier, deliverable_type) DO UPDATE SET
  min_rate = EXCLUDED.min_rate,
  p25_rate = EXCLUDED.p25_rate,
  median_rate = EXCLUDED.median_rate,
  p75_rate = EXCLUDED.p75_rate,
  max_rate = EXCLUDED.max_rate,
  last_updated = NOW();

-- 10. Pre-seeded Instagram Reel benchmark data (similar to TikTok video rates)
INSERT INTO rate_benchmarks (platform, follower_tier, deliverable_type, min_rate, p25_rate, median_rate, p75_rate, max_rate, sample_size, source) VALUES
('instagram', 'nano', 'reel', 8, 20, 40, 70, 120, 0, 'industry_report'),
('instagram', 'micro', 'reel', 80, 175, 300, 450, 600, 0, 'industry_report'),
('instagram', 'mid', 'reel', 400, 1200, 2000, 3200, 4000, 0, 'industry_report'),
('instagram', 'macro', 'reel', 4000, 5500, 7000, 8500, 10000, 0, 'industry_report'),
('instagram', 'mega', 'reel', 8000, 12000, 20000, 40000, 80000, 0, 'industry_report')
ON CONFLICT (platform, follower_tier, deliverable_type) DO UPDATE SET
  min_rate = EXCLUDED.min_rate,
  p25_rate = EXCLUDED.p25_rate,
  median_rate = EXCLUDED.median_rate,
  p75_rate = EXCLUDED.p75_rate,
  max_rate = EXCLUDED.max_rate,
  last_updated = NOW();

-- 11. Pre-seeded YouTube Short benchmark data (similar to TikTok video rates)
INSERT INTO rate_benchmarks (platform, follower_tier, deliverable_type, min_rate, p25_rate, median_rate, p75_rate, max_rate, sample_size, source) VALUES
('youtube', 'nano', 'short', 10, 25, 50, 100, 150, 0, 'industry_report'),
('youtube', 'micro', 'short', 100, 200, 400, 600, 800, 0, 'industry_report'),
('youtube', 'mid', 'short', 400, 1000, 2000, 3000, 4000, 0, 'industry_report'),
('youtube', 'macro', 'short', 3000, 5000, 8000, 10000, 12000, 0, 'industry_report'),
('youtube', 'mega', 'short', 8000, 12000, 18000, 25000, 40000, 0, 'industry_report')
ON CONFLICT (platform, follower_tier, deliverable_type) DO UPDATE SET
  min_rate = EXCLUDED.min_rate,
  p25_rate = EXCLUDED.p25_rate,
  median_rate = EXCLUDED.median_rate,
  p75_rate = EXCLUDED.p75_rate,
  max_rate = EXCLUDED.max_rate,
  last_updated = NOW();
