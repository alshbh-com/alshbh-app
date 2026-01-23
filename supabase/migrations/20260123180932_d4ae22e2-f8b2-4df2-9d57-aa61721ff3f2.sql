-- Add price and product info to offers for direct ordering
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Add comment
COMMENT ON COLUMN public.offers.price IS 'Offer price after discount';
COMMENT ON COLUMN public.offers.original_price IS 'Original price before discount';
COMMENT ON COLUMN public.offers.product_id IS 'Optional linked product';