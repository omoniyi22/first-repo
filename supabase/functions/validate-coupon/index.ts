import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const log = (message, data = null) => {
  console.log(`[VALIDATE-COUPON] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request data
    const { couponCode } = await req.json();
    
    if (!couponCode?.trim()) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Coupon code is required"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    log("Validating coupon", { couponCode: couponCode.trim() });

    // Find coupon in database
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase().trim())
      .single();

    if (couponError || !coupon) {
      log("Coupon not found", { couponCode: couponCode.trim() });
      return new Response(JSON.stringify({
        valid: false,
        error: "Invalid coupon code"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      log("Coupon expired", { 
        couponCode: coupon.code, 
        expires_at: coupon.expires_at 
      });
      return new Response(JSON.stringify({
        valid: false,
        error: "This coupon has expired"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Check usage limit (if set)
    if (coupon.max_redemptions !== null) {
      const { count } = await supabaseAdmin
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id);

      if (count >= coupon.max_redemptions) {
        log("Coupon usage limit reached", { 
          couponCode: coupon.code, 
          used: count, 
          limit: coupon.max_redemptions 
        });
        return new Response(JSON.stringify({
          valid: false,
          error: "This coupon has reached its usage limit"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
    }

    // Coupon is valid
    log("Coupon is valid", { 
      couponCode: coupon.code, 
      discount: coupon.discount_percent 
    });

    return new Response(JSON.stringify({
      valid: true,
      discount_percent: coupon.discount_percent,
      code: coupon.code,
      expires_at: coupon.expires_at
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    log("Unexpected error", { error: error.message });
    
    return new Response(JSON.stringify({
      valid: false,
      error: "Unable to validate coupon"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});