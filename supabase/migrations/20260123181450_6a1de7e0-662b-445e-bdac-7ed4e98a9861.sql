-- Create a cron extension and function to auto-delete orders older than 2 months
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to delete old orders
CREATE OR REPLACE FUNCTION public.delete_old_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM orders WHERE created_at < NOW() - INTERVAL '2 months';
END;
$$;

-- Schedule the function to run daily at midnight
SELECT cron.schedule(
  'delete-old-orders',
  '0 0 * * *',
  'SELECT public.delete_old_orders();'
);