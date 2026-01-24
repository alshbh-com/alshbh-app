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

interface FCMMessage {
  to: string;
  notification: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    click_action?: string;
  };
  data?: Record<string, string>;
  webpush?: {
    headers?: Record<string, string>;
    notification?: {
      title: string;
      body: string;
      icon?: string;
      image?: string;
      requireInteraction?: boolean;
    };
  };
}

async function sendFCMNotification(fcmToken: string, notification: NotificationPayload, serverKey: string): Promise<boolean> {
  const fcmMessage: FCMMessage = {
    to: fcmToken,
    notification: {
      title: notification.title,
      body: notification.message,
      icon: "/favicon.ico",
      image: notification.image_url,
      click_action: "https://jfusqoiczhzpaagchbnd.supabase.co",
    },
    data: {
      title: notification.title,
      body: notification.message,
      notification_id: notification.notification_id || "",
      timestamp: new Date().toISOString(),
    },
    webpush: {
      headers: {
        "TTL": "86400",
        "Urgency": "high",
      },
      notification: {
        title: notification.title,
        body: notification.message,
        icon: "/favicon.ico",
        image: notification.image_url,
        requireInteraction: false,
      },
    },
  };

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${serverKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fcmMessage),
    });

    const result = await response.json();
    console.log("FCM Response:", result);

    if (result.success === 1) {
      return true;
    } else if (result.failure === 1 && result.results?.[0]?.error) {
      console.error("FCM Error:", result.results[0].error);
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");
    
    if (!fcmServerKey) {
      console.error("FCM_SERVER_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "FCM_SERVER_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, message, image_url, notification_id }: NotificationPayload = await req.json();

    if (!title || !message) {
      throw new Error("Title and message are required");
    }

    // Get all active devices with FCM tokens
    const { data: devices, error: devicesError } = await supabase
      .from("user_devices")
      .select("fcm_token, id")
      .eq("is_active", true)
      .not("fcm_token", "is", null);

    if (devicesError) {
      console.error("Error fetching devices:", devicesError);
      throw devicesError;
    }

    const activeDevices = devices || [];
    console.log(`Found ${activeDevices.length} active devices with FCM tokens`);

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    // Send FCM notification to each device
    for (const device of activeDevices) {
      // Skip placeholder tokens (web_* tokens are not real FCM tokens)
      if (device.fcm_token.startsWith("web_")) {
        console.log(`Skipping placeholder token: ${device.fcm_token.substring(0, 20)}...`);
        continue;
      }

      const success = await sendFCMNotification(
        device.fcm_token,
        { title, message, image_url, notification_id },
        fcmServerKey
      );

      if (success) {
        successCount++;
      } else {
        failureCount++;
        invalidTokens.push(device.id);
      }
    }

    // Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      await supabase
        .from("user_devices")
        .update({ is_active: false })
        .in("id", invalidTokens);
      console.log(`Deactivated ${invalidTokens.length} invalid tokens`);
    }

    // Update notification record
    if (notification_id) {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({
          sent_count: successCount,
          sent_at: new Date().toISOString(),
          status: successCount > 0 ? "sent" : "failed",
        })
        .eq("id", notification_id);

      if (updateError) {
        console.error("Error updating notification:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: successCount,
        failed_count: failureCount,
        total_devices: activeDevices.length,
        message: `تم إرسال الإشعار لـ ${successCount} جهاز من ${activeDevices.length}`,
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
