-- Create storage bucket for cropped character images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'character-images',
  'character-images',
  true,
  5242880,
  ARRAY['image/webp', 'image/png', 'image/jpeg']
);

-- Public read access
CREATE POLICY "Public read character images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'character-images');

-- Service role upload
CREATE POLICY "Service role upload character images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'character-images');

-- Service role update (upsert)
CREATE POLICY "Service role update character images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'character-images');
