-- Migration: Add admin role to profiles
-- Run this in Supabase SQL Editor

-- Add role field
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Set wwp.personal@outlook.com as admin
UPDATE profiles SET role = 'admin' WHERE email = 'wwp.personal@outlook.com';
