-- Migration: rate_history improvements (idempotent)
-- Run this in Supabase SQL Editor

-- 1. Add NOT NULL constraint to amount
ALTER TABLE rate_history ALTER COLUMN amount SET NOT NULL;

-- 2. Add user_id index for query performance
CREATE INDEX IF NOT EXISTS idx_rate_history_user_id ON rate_history(user_id);

-- 3. Add UPDATE/DELETE RLS policies (DROP first to avoid conflicts)
DROP POLICY IF EXISTS "Users can update own rate history" ON rate_history;
CREATE POLICY "Users can update own rate history" ON rate_history FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own rate history" ON rate_history;
CREATE POLICY "Users can delete own rate history" ON rate_history FOR DELETE USING (auth.uid() = user_id);
