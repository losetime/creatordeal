-- Migration: Add payment verification fields to profiles
-- Run this in Supabase SQL Editor

-- Add payment verification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_pending BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_order_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_confirmed_by UUID REFERENCES profiles(id);
