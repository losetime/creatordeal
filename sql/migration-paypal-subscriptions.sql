-- Migration: Add PayPal subscription fields
-- Run this in Supabase SQL Editor

-- 1. Add PayPal subscription fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;

-- 2. Add index for paypal_subscription_id (for webhook lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_paypal_subscription_id ON profiles(paypal_subscription_id);

-- 3. Update subscription_status to include new states
-- The existing CHECK constraint may need to be updated
-- Current: subscription_status TEXT DEFAULT 'active'
-- New states: active, cancelled, payment_failed, suspended, expired

-- 4. Add unique constraint on paypal_subscription_id (one subscription per user)
-- Note: This may need to be handled at application level since multiple users
-- could theoretically have the same subscription_id during testing

-- 5. Create a function to handle subscription expiry via webhook
CREATE OR REPLACE FUNCTION handle_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- When subscription is cancelled, set expiry to end of current period
  -- The webhook handler will set the actual expiry from PayPal's next_billing_time
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
