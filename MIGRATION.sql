-- =========================================================================
-- CLEANPROOF DATABASE MIGRATION SCRIPT
-- Copy and paste this script into your Supabase Dashboard SQL Editor.
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Airbnb Hosts Table
CREATE TABLE IF NOT EXISTS airbnb_hosts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pin_code TEXT NOT NULL,
  business_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Airbnb Properties Table
CREATE TABLE IF NOT EXISTS airbnb_properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES airbnb_hosts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  cover_image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Airbnb Checklists Table (Tasks per Property)
CREATE TABLE IF NOT EXISTS airbnb_checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES airbnb_properties(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  requires_photo BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Airbnb Cleaners Table
CREATE TABLE IF NOT EXISTS airbnb_cleaners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES airbnb_hosts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Airbnb Reports Table
CREATE TABLE IF NOT EXISTS airbnb_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES airbnb_properties(id) ON DELETE CASCADE NOT NULL,
  cleaner_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  start_latitude NUMERIC,
  start_longitude NUMERIC,
  end_latitude NUMERIC,
  end_longitude NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Airbnb Report Tasks Table (Completed items in report)
CREATE TABLE IF NOT EXISTS airbnb_report_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES airbnb_reports(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  requires_photo BOOLEAN DEFAULT false,
  photo_url TEXT,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE airbnb_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_report_tasks ENABLE ROW LEVEL SECURITY;

-- Create "Allow all" RLS policies (since our API route bypasses RLS using service role key)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'airbnb_hosts') THEN
    CREATE POLICY "Allow all" ON airbnb_hosts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'airbnb_properties') THEN
    CREATE POLICY "Allow all" ON airbnb_properties FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'airbnb_checklists') THEN
    CREATE POLICY "Allow all" ON airbnb_checklists FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'airbnb_cleaners') THEN
    CREATE POLICY "Allow all" ON airbnb_cleaners FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'airbnb_reports') THEN
    CREATE POLICY "Allow all" ON airbnb_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all' AND tablename = 'airbnb_report_tasks') THEN
    CREATE POLICY "Allow all" ON airbnb_report_tasks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Create storage bucket for Airbnb proof photos
INSERT INTO storage.buckets (id, name, public) VALUES ('airbnb-proofs', 'airbnb-proofs', true) ON CONFLICT (id) DO NOTHING;

-- Grant public policies to the storage bucket
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for airbnb proofs' AND tablename = 'objects') THEN
    CREATE POLICY "Public Access for airbnb proofs" ON storage.objects FOR SELECT USING (bucket_id = 'airbnb-proofs');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload for airbnb proofs' AND tablename = 'objects') THEN
    CREATE POLICY "Public Upload for airbnb proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'airbnb-proofs');
  END IF;
END
$$;
