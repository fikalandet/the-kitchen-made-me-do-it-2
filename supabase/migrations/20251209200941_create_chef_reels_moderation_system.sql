/*
  # Create Chef Reels Moderation System for Tjuvkik

  1. New Tables
    - `chef_reels`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key to profiles)
      - `product_id` (uuid, nullable foreign key to products) - Optional link to product
      - `video_url` (text) - URL to video file in storage
      - `thumbnail_url` (text, nullable) - Thumbnail image
      - `title` (text) - Short title/description
      - `duration_seconds` (integer) - Video duration
      - `status` (text) - pending_review/approved/rejected
      - `rejection_reason` (text, nullable) - Why it was rejected
      - `admin_notes` (text, nullable) - Internal admin notes
      - `views_count` (integer) - Number of views
      - `created_at` (timestamptz)
      - `reviewed_at` (timestamptz, nullable)
      - `reviewed_by` (uuid, nullable foreign key to profiles)

  2. Storage Bucket
    - Create 'chef-reels' bucket for video uploads

  3. Security
    - Enable RLS on `chef_reels` table
    - Chefs can create and view their own reels
    - Admins can view all reels and update status
    - Public can only view approved reels
*/

-- Create chef_reels table
CREATE TABLE IF NOT EXISTS chef_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  title text NOT NULL,
  duration_seconds integer DEFAULT 0 NOT NULL,
  status text DEFAULT 'pending_review' NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected')),
  rejection_reason text,
  admin_notes text,
  views_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE chef_reels ENABLE ROW LEVEL SECURITY;

-- Policy: Chefs can create their own reels
CREATE POLICY "Chefs can create own reels"
  ON chef_reels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

-- Policy: Chefs can view their own reels
CREATE POLICY "Chefs can view own reels"
  ON chef_reels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

-- Policy: Admins can view all reels
CREATE POLICY "Admins can view all reels"
  ON chef_reels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update reels (for approval/rejection)
CREATE POLICY "Admins can update reels"
  ON chef_reels
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can delete reels
CREATE POLICY "Admins can delete reels"
  ON chef_reels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Public can view approved reels
CREATE POLICY "Public can view approved reels"
  ON chef_reels
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chef_reels_chef_id ON chef_reels(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_reels_product_id ON chef_reels(product_id);
CREATE INDEX IF NOT EXISTS idx_chef_reels_status ON chef_reels(status);
CREATE INDEX IF NOT EXISTS idx_chef_reels_created_at ON chef_reels(created_at DESC);

-- Create storage bucket for chef reels
INSERT INTO storage.buckets (id, name, public)
VALUES ('chef-reels', 'chef-reels', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chef-reels bucket
CREATE POLICY "Chefs can upload reels"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chef-reels' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view approved reels"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'chef-reels');

CREATE POLICY "Chefs can update their own reels"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'chef-reels' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can delete any reel"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chef-reels' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
