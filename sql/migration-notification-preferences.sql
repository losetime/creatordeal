-- Migration: Add notification preferences table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Email notification toggles
  email_deadline_7d BOOLEAN DEFAULT true,
  email_deadline_3d BOOLEAN DEFAULT true,
  email_deadline_1d BOOLEAN DEFAULT true,
  email_deadline_today BOOLEAN DEFAULT true,
  email_payment_7d BOOLEAN DEFAULT true,
  email_payment_today BOOLEAN DEFAULT true,
  email_payment_overdue BOOLEAN DEFAULT true,
  email_deal_update BOOLEAN DEFAULT true,
  
  -- Reminder days config
  remind_deadline_7d BOOLEAN DEFAULT true,
  remind_deadline_3d BOOLEAN DEFAULT true,
  remind_deadline_1d BOOLEAN DEFAULT true,
  remind_deadline_today BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences" 
  ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notification preferences" 
  ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" 
  ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Index for cron job queries
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
