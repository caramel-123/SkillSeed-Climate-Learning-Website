-- ============================================================================
-- Fix Storage Bucket Policies for Quest Photos
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Make quest-photos bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'quest-photos';

-- 2. Drop existing select policy if any and recreate
DROP POLICY IF EXISTS "Public can view quest photos" ON storage.objects;

CREATE POLICY "Public can view quest photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'quest-photos');

-- 3. Allow authenticated users to upload to quest-photos
DROP POLICY IF EXISTS "Users can upload quest photos" ON storage.objects;

CREATE POLICY "Users can upload quest photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quest-photos');

-- 4. Allow users to update their own photos
DROP POLICY IF EXISTS "Users can update own quest photos" ON storage.objects;

CREATE POLICY "Users can update own quest photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'quest-photos');

-- 5. Also fix challenge-photos bucket if it exists
UPDATE storage.buckets 
SET public = true 
WHERE name = 'challenge-photos';

DROP POLICY IF EXISTS "Public can view challenge photos" ON storage.objects;

CREATE POLICY "Public can view challenge photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'challenge-photos');

DROP POLICY IF EXISTS "Users can upload challenge photos" ON storage.objects;

CREATE POLICY "Users can upload challenge photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'challenge-photos');

-- 6. Verify buckets are public
SELECT name, public FROM storage.buckets 
WHERE name IN ('quest-photos', 'challenge-photos');
