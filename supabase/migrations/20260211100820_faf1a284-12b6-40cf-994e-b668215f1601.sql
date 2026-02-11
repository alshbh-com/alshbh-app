-- Drop the trigger first
DROP TRIGGER IF EXISTS on_new_order_send_whatsapp ON orders;

-- Then drop the function
DROP FUNCTION IF EXISTS public.auto_send_whatsapp();