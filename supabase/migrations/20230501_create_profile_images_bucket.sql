
-- Create a storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'Profile Images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images to this bucket
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Allow users to update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own profile images
CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public access to profile images
CREATE POLICY "Allow public access to profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');
