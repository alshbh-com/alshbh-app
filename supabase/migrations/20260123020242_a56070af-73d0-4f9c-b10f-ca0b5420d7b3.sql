-- جدول المراكز (Districts)
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    image_url TEXT,
    default_delivery_fee NUMERIC DEFAULT 0,
    latitude NUMERIC,
    longitude NUMERIC,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول القرى/الكُوَر (Villages)
CREATE TABLE IF NOT EXISTS public.villages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    latitude NUMERIC,
    longitude NUMERIC,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تحديث جدول المطاعم (sub_categories) لربطه بالمراكز
ALTER TABLE public.sub_categories 
ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL;

-- تحديث جدول الطلبات لإضافة معلومات المركز والقرية
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS district_name TEXT,
ADD COLUMN IF NOT EXISTS village_name TEXT,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 10,
ADD COLUMN IF NOT EXISTS order_number SERIAL;

-- Enable RLS
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمراكز
CREATE POLICY "Allow read access to all districts" 
ON public.districts 
FOR SELECT 
USING (true);

CREATE POLICY "Enable all operations for districts" 
ON public.districts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- سياسات RLS للقرى
CREATE POLICY "Allow read access to all villages" 
ON public.villages 
FOR SELECT 
USING (true);

CREATE POLICY "Enable all operations for villages" 
ON public.villages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Trigger لتحديث updated_at
CREATE OR REPLACE TRIGGER update_districts_updated_at
BEFORE UPDATE ON public.districts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_villages_updated_at
BEFORE UPDATE ON public.villages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();