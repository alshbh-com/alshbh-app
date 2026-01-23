-- Add WhatsApp number column to districts table
ALTER TABLE public.districts 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.districts.whatsapp_number IS 'WhatsApp number for receiving orders in this district';