import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  message: string;
  image_url?: string;
  target_audience?: string;
  notification_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, message, image_url, notification_id }: NotificationPayload = await req.json();

    if (!title || !message) {
      throw new Error("Title and message are required");
    }

    // Count active devices for reporting
    const { count: deviceCount } = await supabase
      .from("user_devices")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const activeDevices = deviceCount || 0;
    console.log(`Found ${activeDevices} active devices`);

    // Update notification record - the realtime subscription will handle delivery
    if (notification_id) {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          sent_count: activeDevices,
          sent_at: new Date().toISOString(),
          status: "sent",
        })
        .eq("id", notification_id);

      if (updateError) {
        console.error("Error updating notification:", updateError);
      }
    }

    // The notification is already inserted in the database by AdminNotifications
    // The NotificationListener component on clients will pick it up via realtime
    // and show browser notifications + toasts

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: activeDevices,
        message: `تم إرسال الإشعار - سيصل لـ ${activeDevices} مستخدم نشط`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending notification:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
