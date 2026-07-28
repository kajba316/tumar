/*
# Create media library storage and table

1. New Storage Bucket
   - `media` bucket for storing uploaded images (public read)
2. New Table: `media_files`
   - `id` (uuid, primary key)
   - `file_name` (text, original file name)
   - `file_path` (text, storage path in the bucket)
   - `public_url` (text, public URL to access the file)
   - `file_type` (text, MIME type)
   - `file_size` (bigint, size in bytes)
   - `category` (text, optional grouping: product, category, logo, banner, page)
   - `created_at` (timestamp)
3. Security
   - RLS enabled on `media_files`
   - Public read/write (admin panel uses anon key)
   - Storage bucket is public for reads
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  public_url text NOT NULL,
  file_type text,
  file_size bigint,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media" ON media_files;
CREATE POLICY "public_read_media" ON media_files FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_media" ON media_files;
CREATE POLICY "public_insert_media" ON media_files FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_media" ON media_files;
CREATE POLICY "public_update_media" ON media_files FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_media" ON media_files;
CREATE POLICY "public_delete_media" ON media_files FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
CREATE POLICY "media_bucket_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_public_insert" ON storage.objects;
CREATE POLICY "media_bucket_public_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_public_update" ON storage.objects;
CREATE POLICY "media_bucket_public_update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_public_delete" ON storage.objects;
CREATE POLICY "media_bucket_public_delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'media');
