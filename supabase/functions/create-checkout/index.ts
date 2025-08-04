import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Helper logging function
const logStep = (step, details) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    logStep("Function started");
    // Create a Supabase client for authentication
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", {
      userId: user.id,
      email: user.email
    });
    // Get request data
    const { planId, mode = "subscription", couponCode = null } = await req.json();
    if (!planId) throw new Error("Plan ID is required");
    logStep("Received request data", {
      planId,
      mode,
      couponCode
    });
    // Create a Supabase service client to fetch plan details
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: {
        persistSession: false
      }
    });
    // Get plan details
    const { data: plan, error: planError } = await supabaseAdmin.from("pricing_plans").select("*").eq("id", planId).single();
    if (planError || !plan) throw new Error("Plan not found");
    logStep("Plan details fetched", {
      plan: plan.name,
      price: plan.monthly_price
    });
    let validCoupon = null;
    let discountAmount = 0
    if (couponCode) {
      logStep("Validating coupon", { couponCode });

      // Find coupon in database
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .single();

      if (couponError || !coupon) {
        throw new Error("Invalid coupon code");
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error("Coupon has expired");
      }

      // Check usage limit (if set)
      if (coupon.max_redemptions !== null) {
        const { count } = await supabaseAdmin
          .from("user_subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("coupon_id", coupon.id);

        if (count >= coupon.max_redemptions) {
          throw new Error("Coupon usage limit reached");
        }
      }

      validCoupon = coupon;
      logStep("Valid coupon found", { code: coupon.code, discount: coupon.discount_percent });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16"
    });
    // Check if customer exists, create if not
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", {
        customerId
      });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = newCustomer.id;
      logStep("Created new Stripe customer", {
        customerId
      });
    }
    // Calculate original price
    let originalPrice = mode === "annual" ? plan.annual_price * 12 : plan.monthly_price;
    let finalPrice = originalPrice;

    // Apply discount if coupon is valid
    if (validCoupon) {
      discountAmount = (originalPrice * validCoupon.discount_percent) / 100;
      finalPrice = originalPrice - discountAmount;
      logStep("Discount applied", {
        originalPrice,
        discountAmount,
        finalPrice,
        discountPercent: validCoupon.discount_percent
      });
    }


    const priceData = {
      currency: "gbp",
      product_data: {
        name: plan.name
      },
      unit_amount: Math.round(finalPrice * 100) // Use discounted price
    };

    if (mode === "annual") {
      // For annual plans, we multiply by 12 but set the interval to year
      Object.assign(priceData, {
        recurring: {
          interval: "year"
        }
      });
      logStep("Using annual billing", {
        originalPrice: originalPrice,
        finalPrice: finalPrice
      });
    } else {
      // For monthly plans
      Object.assign(priceData, {
        recurring: {
          interval: "month"
        }
      });
      logStep("Using monthly billing", {
        originalPrice: originalPrice,
        finalPrice: finalPrice
      });
    }
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: priceData,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/pricing?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        plan_id: planId,
        user_id: user.id,
        user_email: user.email,
        billing_mode: mode,
        ...(validCoupon && {
          coupon_id: validCoupon.id,
          coupon_code: validCoupon.code,
          discount_percent: validCoupon.discount_percent.toString(),
          original_price: originalPrice.toString(),
          discount_amount: discountAmount.toString()
        })
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan_id: planId,
          billing_mode: mode,
          ...(validCoupon && {
            coupon_id: validCoupon.id,
            coupon_code: validCoupon.code,
            discount_percent: validCoupon.discount_percent.toString(),
            original_price: originalPrice.toString(),
            discount_amount: discountAmount.toString()
          })
        }
      }
    });
    logStep("Checkout session created", {
      sessionId: session.id,
      url: session.url,
      finalPrice: finalPrice,
      couponUsed: validCoupon?.code || null,
      discountApplied: discountAmount
    });
    // Return the checkout URL
    return new Response(JSON.stringify({
      url: session.url
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CHECKOUT] ERROR: ${errorMessage}`);
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
