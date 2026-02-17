-- Storage bucket for cropped character images
-- Bucket "Characters" is created via Supabase dashboard.
-- These policies ensure public read and service role write access.

DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'Characters',
    'Characters',
    true,
    5242880,
    ARRAY['image/webp', 'image/png', 'image/jpeg']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists (created via dashboard)
  NULL;
END $$;

-- Public read access
DO $$ BEGIN
  CREATE POLICY "Public read character images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'Characters');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role upload
DO $$ BEGIN
  CREATE POLICY "Service role upload character images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'Characters');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role update (upsert)
DO $$ BEGIN
  CREATE POLICY "Service role update character images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'Characters');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
