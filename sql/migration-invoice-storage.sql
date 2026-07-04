-- Migration: Create storage bucket for invoice PDFs
-- Run this in Supabase SQL Editor

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload invoice PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices'
  AND auth.role() = 'authenticated'
);

-- Allow public read access to invoice PDFs
CREATE POLICY "Public can view invoice PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their invoice PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'invoices'
  AND auth.role() = 'authenticated'
);
