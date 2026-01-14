import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const log = (message, data = null) => {
  console.log(`[CHECK-SUBSCRIPTION] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      });
    }

    const user = userData.user;

    // 🎯 GET SUBSCRIPTION FROM LOCAL DATABASE
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select(`
        *,
        pricing_plans (
          id,
          name,
          monthly_price,
          annual_price
        ),
        coupons (
          code,
          discount_percent
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      log("Database error", { userId: user.id, error: subError.message });
      return new Response(JSON.stringify({ error: "Database error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }

    // Check if subscription is still valid (not expired)
    const now = new Date();
    let isActiveAndValid = false;
    let daysRemaining = 0;

    if (subscription) {
      const endsAt = new Date(subscription.ends_at);
      isActiveAndValid = subscription.is_active && endsAt > now;
      daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Prepare response with subscription details
    const response = {
      subscribed: isActiveAndValid,
      subscription: subscription ? {
        id: subscription.id,
        plan_id: subscription.plan_id,
        plan_name: subscription.pricing_plans?.name,
        is_trial: subscription.is_trial,
        is_active: subscription.is_active,
        started_at: subscription.started_at,
        ends_at: subscription.ends_at,
        days_remaining: Math.max(0, daysRemaining),
        expires_soon: daysRemaining <= 7 && daysRemaining > 0, // Expires within 7 days
        stripe_subscription_id: subscription.stripe_subscription_id,
        plan_details: subscription.pricing_plans ? {
          monthly_price: subscription.pricing_plans.monthly_price,
          annual_price: subscription.pricing_plans.annual_price
        } : null,
        coupon_used: subscription.coupons ? {
          code: subscription.coupons.code,
          discount_percent: subscription.coupons.discount_percent
        } : null
      } : null
    };

    log("Subscription check completed", { 
      userId: user.id, 
      subscribed: isActiveAndValid,
      planName: subscription?.pricing_plans?.name,
      daysRemaining: daysRemaining
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    log("Unexpected error", { error: error.message });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});