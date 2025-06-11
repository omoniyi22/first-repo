-- Remove cloudinary_id column from media_items table
ALTER TABLE public.media_items DROP COLUMN IF EXISTS cloudinary_id;