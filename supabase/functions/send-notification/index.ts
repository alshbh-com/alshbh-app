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
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");
    if (!fcmServerKey) {
      throw new Error("FCM_SERVER_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, message, image_url, target_audience, notification_id }: NotificationPayload = await req.json();

    if (!title || !message) {
      throw new Error("Title and message are required");
    }

    // Get active device tokens
    const { data: devices, error: devicesError } = await supabase
      .from("user_devices")
      .select("fcm_token, user_id")
      .eq("is_active", true);

    if (devicesError) {
      console.error("Error fetching devices:", devicesError);
      throw devicesError;
    }

    if (!devices || devices.length === 0) {
      console.log("No active devices found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No active devices to send notifications to",
          sent_count: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokens = devices.map((d) => d.fcm_token);
    console.log(`Sending notification to ${tokens.length} devices`);

    // FCM payload
    const fcmPayload = {
      registration_ids: tokens,
      notification: {
        title,
        body: message,
        image: image_url || undefined,
        sound: "default",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      data: {
        title,
        body: message,
        image: image_url || "",
        notification_id: notification_id || "",
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channel_id: "high_importance_channel",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    // Send to FCM
    const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    const fcmResult = await fcmResponse.json();
    console.log("FCM Response:", fcmResult);

    // Update notification record with sent count if notification_id provided
    if (notification_id) {
      await supabase
        .from("notifications")
        .update({
          sent_count: fcmResult.success || 0,
          sent_at: new Date().toISOString(),
          status: "sent",
        })
        .eq("id", notification_id);
    }

    // Handle invalid tokens
    if (fcmResult.results) {
      const invalidTokens: string[] = [];
      fcmResult.results.forEach((result: any, index: number) => {
        if (result.error === "NotRegistered" || result.error === "InvalidRegistration") {
          invalidTokens.push(tokens[index]);
        }
      });

      // Deactivate invalid tokens
      if (invalidTokens.length > 0) {
        await supabase
          .from("user_devices")
          .update({ is_active: false })
          .in("fcm_token", invalidTokens);
        console.log(`Deactivated ${invalidTokens.length} invalid tokens`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: fcmResult.success || 0,
        failed_count: fcmResult.failure || 0,
        message: `تم إرسال الإشعار إلى ${fcmResult.success || 0} جهاز`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending notification:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
