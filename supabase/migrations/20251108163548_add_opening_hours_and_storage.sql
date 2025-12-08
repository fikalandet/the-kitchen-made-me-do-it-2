/*
  # Add Opening Hours and Storage Bucket

  1. New Tables
    - `opening_hours` - Store chef opening hours
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key to profiles)
      - `day_of_week` (integer, 0-6 for Sunday-Saturday)
      - `is_open` (boolean)
      - `open_time` (time)
      - `close_time` (time)
      - `show_on_profile` (boolean) - Chef can choose to show/hide
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `special_dates` - Store special opening hours for specific dates
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key to profiles)
      - `date` (date)
      - `status` (text) - 'open', 'closed', 'fully_booked'
      - `note` (text)
      - `created_at` (timestamptz)

  2. Storage
    - Create storage bucket for kitchen media (images and videos)

  3. Security
    - Enable RLS on all tables
    - Add policies for chefs to manage their own data
    - Public read access for opening hours
*/

-- Create opening_hours table
CREATE TABLE IF NOT EXISTS opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean DEFAULT false,
  open_time time,
  close_time time,
  show_on_profile boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(chef_id, day_of_week)
);

-- Create special_dates table
CREATE TABLE IF NOT EXISTS special_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text DEFAULT 'closed' CHECK (status IN ('open', 'closed', 'fully_booked')),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(chef_id, date)
);

-- Enable RLS
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;

-- Policies for opening_hours
CREATE POLICY "Public can view opening hours"
  ON opening_hours FOR SELECT
  USING (true);

CREATE POLICY "Chefs can manage own opening hours"
  ON opening_hours FOR ALL
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

-- Policies for special_dates
CREATE POLICY "Public can view special dates"
  ON special_dates FOR SELECT
  USING (true);

CREATE POLICY "Chefs can manage own special dates"
  ON special_dates FOR ALL
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

-- Create storage bucket for kitchen media
INSERT INTO storage.buckets (id, name, public)
VALUES ('kitchen-media', 'kitchen-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view kitchen media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kitchen-media');

CREATE POLICY "Authenticated users can upload kitchen media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kitchen-media');

CREATE POLICY "Users can update own kitchen media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'kitchen-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own kitchen media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'kitchen-media' AND auth.uid()::text = (storage.foldername(name))[1]);