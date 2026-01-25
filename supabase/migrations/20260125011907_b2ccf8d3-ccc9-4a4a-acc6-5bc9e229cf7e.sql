-- Add password column to sub_categories (restaurants)
ALTER TABLE public.sub_categories 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add location columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_latitude NUMERIC,
ADD COLUMN IF NOT EXISTS customer_longitude NUMERIC;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images', 
  'images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

CREATE POLICY "Anyone can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');