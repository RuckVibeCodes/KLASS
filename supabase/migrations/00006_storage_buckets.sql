-- Create storage buckets for file uploads

-- Avatars bucket (profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Community assets bucket (logos, thumbnails, banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-assets',
  'community-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Lesson content bucket (quiz images, lesson attachments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-content',
  'lesson-content',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies

-- Avatars: Anyone can view, authenticated users can upload their own
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "avatars_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Community assets: Anyone can view, admins can upload/delete
CREATE POLICY "community_assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-assets');

CREATE POLICY "community_assets_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "community_assets_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-assets'
  AND auth.role() = 'authenticated'
);

-- Lesson content: Anyone can view, admins can upload/delete
CREATE POLICY "lesson_content_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-content');

CREATE POLICY "lesson_content_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-content'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "lesson_content_authenticated_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-content'
  AND auth.role() = 'authenticated'
);
