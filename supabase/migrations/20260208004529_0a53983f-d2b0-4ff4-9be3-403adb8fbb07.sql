
-- Create announcements table for admin-managed announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  show_on_all_pages BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Anyone can read announcements"
ON public.announcements
FOR SELECT
USING (true);

-- Admin can manage announcements (using permissive for all operations)
CREATE POLICY "Enable all operations for announcements"
ON public.announcements
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the Express Go announcement
INSERT INTO public.announcements (message, type, image_url, is_active, show_on_all_pages, sort_order)
VALUES (
  '🚚 يوم 8/2/2026 سيتم التعاقد مع اكس بريس جو كخدمة التوصيل المتاحة للمنصة!',
  'info',
  '/images/express-go.png',
  true,
  true,
  1
);
