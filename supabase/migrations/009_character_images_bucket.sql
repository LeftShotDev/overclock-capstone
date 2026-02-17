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
CREATE POLICY IF NOT EXISTS "Public read character images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'Characters');

-- Service role upload
CREATE POLICY IF NOT EXISTS "Service role upload character images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'Characters');

-- Service role update (upsert)
CREATE POLICY IF NOT EXISTS "Service role update character images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'Characters');
