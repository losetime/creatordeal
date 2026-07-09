-- Migration: Add subscription expiry tracking
-- Run this in Supabase SQL Editor

-- 1. Add expiry date column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- 2. Auto-downgrade expired subscriptions function
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET plan = 'free',
      subscription_status = 'expired',
      updated_at = NOW()
  WHERE plan IN ('pro', 'team')
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 3. Create a cron job to run every hour (Supabase pg_cron)
-- Note: pg_cron must be enabled in Supabase Dashboard > Extensions
-- SELECT cron.schedule(
--   'check-expired-subscriptions',
--   '0 * * * *',
--   'SELECT check_expired_subscriptions()'
-- );
