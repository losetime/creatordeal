-- Migration: Create storage bucket for contract files
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload contract files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contracts'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own contracts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'contracts'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own contracts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contracts'
  AND auth.role() = 'authenticated'
);
