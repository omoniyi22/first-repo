import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Logging helper
const log = (message: string, data: any = null) => {
  console.log(`[ACTIVATE-FREE-SUB] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      log('Unauthorized access attempt');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('Request received', { userId: user.id });

    // Parse and validate request body
    const { plan_id, billing_cycle, coupon_code } = await req.json();

    if (!plan_id || !billing_cycle || !coupon_code) {
      log('Missing required fields', { plan_id, billing_cycle, hasCoupon: !!coupon_code });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: plan_id, billing_cycle, coupon_code'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate billing_cycle
    if (!['monthly', 'annual'].includes(billing_cycle)) {
      log('Invalid billing cycle', { billing_cycle });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid billing_cycle. Must be "monthly" or "annual"'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Validate coupon
    log('Validating coupon', { code: coupon_code });

    const { data: coupon, error: couponError } = await supabaseClient
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .single();

    if (couponError || !coupon) {
      log('Coupon validation failed', { code: coupon_code, error: couponError?.message });
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid coupon code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Ensure it's 100% discount
    if (coupon.discount_percent !== 100) {
      log('Attempted to use non-100% coupon for free subscription', {
        code: coupon_code,
        discount: coupon.discount_percent
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'This coupon requires payment. Please use the standard checkout process.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Check coupon expiry date
    const now = new Date();

    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      log('Coupon expired', { code: coupon_code, expiresAt: coupon.expires_at });
      return new Response(
        JSON.stringify({ success: false, error: 'This coupon has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Check coupon usage limits
    if (coupon.max_redemptions !== null) {
      // Count how many times this coupon has been used
      const { count, error: countError } = await supabaseClient
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id);

      if (countError) {
        log('Error counting coupon usage', { error: countError.message });
      } else if (count >= coupon.max_redemptions) {
        log('Coupon usage limit reached', {
          code: coupon_code,
          timesUsed: count,
          maxRedemptions: coupon.max_redemptions
        });
        return new Response(
          JSON.stringify({ success: false, error: 'This coupon has reached its usage limit' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    log('Coupon validated successfully', { code: coupon_code, discount: coupon.discount_percent });

    // Step 4: Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('pricing_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      log('Plan not found', { planId: plan_id, error: planError?.message });
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid plan selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('Plan found', { planId: plan_id, planName: plan.name });

    // Step 5: Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    if (billing_cycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    log('Subscription dates calculated', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      billingCycle: billing_cycle
    });

    // Step 6: Create subscription using RPC
    log('Creating subscription via RPC');

    const { data: result, error: subscriptionError } = await supabaseClient
      .rpc('create_free_subscription_safely', {
        p_user_id: user.id,
        p_plan_id: plan_id,
        p_coupon_id: coupon.id,
        p_billing_cycle: billing_cycle,
        p_started_at: startDate.toISOString(),
        p_ends_at: endDate.toISOString(),
      });

    if (subscriptionError) {
      log('RPC call failed', { error: subscriptionError.message });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create subscription. Please try again.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check RPC result
    if (!result || result.length === 0) {
      log('RPC returned empty result');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create subscription. Please contact support.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rpcResult = result[0];

    if (!rpcResult.success) {
      log('RPC returned error', { error: rpcResult.error_message });
      return new Response(
        JSON.stringify({
          success: false,
          error: rpcResult.error_message || 'Failed to create subscription'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('Subscription created successfully', {
      subscriptionId: rpcResult.subscription_id,
      userId: user.id,
      planId: plan_id
    });

    // Step 7: Handle plan change logic (if user had previous plan)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check if user had a previous active plan
    const { data: previousSubs, error: prevError } = await supabaseAdmin
      .from("user_subscriptions")
      .select(`
    *,
    pricing_plans (
      id,
      name,
      max_horses
    )
  `)
      .eq("user_id", user.id)
      .eq("is_active", false)
      .order("updated_at", { ascending: false })
      .limit(1);

    let oldPlan = null;
    let changeType = null;

    if (!prevError && previousSubs && previousSubs.length > 0) {
      const lastSub = previousSubs[0];

      // Check if it was a different plan
      if (lastSub.plan_id !== plan_id && lastSub.pricing_plans) {
        oldPlan = lastSub.pricing_plans;

        // Determine change type
        if (plan.max_horses > oldPlan.max_horses) {
          changeType = 'upgrade';
        } else if (plan.max_horses < oldPlan.max_horses) {
          changeType = 'downgrade';
        } else {
          changeType = 'same';
        }

        log("Previous subscription detected", {
          userId: user.id,
          oldPlanId: lastSub.plan_id,
          newPlanId: plan_id,
          oldPlanName: oldPlan?.name,
          newPlanName: plan.name,
          oldLimit: oldPlan?.max_horses,
          newLimit: plan.max_horses,
          changeType
        });

        // Record the plan change
        await recordPlanChange(supabaseAdmin, {
          userId: user.id,
          subscriptionId: rpcResult.subscription_id,
          oldPlan: oldPlan,
          newPlan: plan,
          changeType: changeType
        });
      }
    }

    // Step 8: Manage horses based on plan limit
    log('Managing user horses based on plan limit');
    const horseResult = await manageUserHorses(
      supabaseAdmin,
      user.id,
      plan_id,
      changeType ? `plan_${changeType}` : 'free_subscription'
    );

    log('Horse management result', horseResult);

    // Step 9: Update plan change record with horse management results (if plan changed)
    if (oldPlan && changeType && horseResult.success) {
      await supabaseAdmin
        .from("plan_changes")
        .update({
          horses_affected: horseResult.horses_affected || 0,
          horses_disabled: horseResult.horses_disabled || 0,
          horses_reactivated: horseResult.horses_activated || 0
        })
        .eq("user_id", user.id)
        .eq("new_plan_id", plan_id)
        .order("created_at", { ascending: false })
        .limit(1);

      log("Plan change record updated with horse results", {
        userId: user.id,
        horsesAffected: horseResult.horses_affected
      });
    }

    // Step 10: Return success response
    const response = {
      success: true,
      subscription_id: rpcResult.subscription_id,
      plan_name: plan.name,
      ends_at: endDate.toISOString(),
      billing_cycle: billing_cycle,
      coupon_code: coupon_code,
    };

    log('Free subscription activation completed', response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log('Unexpected error', { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


// ============================================
// Record Plan Change Function
// ============================================
async function recordPlanChange(
  supabaseAdmin: any,
  { userId, subscriptionId, oldPlan, newPlan, changeType }: any
) {
  try {
    log("Recording plan change", {
      userId,
      changeType,
      oldLimit: oldPlan.max_horses,
      newLimit: newPlan.max_horses
    });

    const { data: planChangeRecord, error: planChangeError } = await supabaseAdmin
      .from("plan_changes")
      .insert({
        user_id: userId,
        old_plan_id: oldPlan.id,
        new_plan_id: newPlan.id,
        old_plan_name: oldPlan.name,
        new_plan_name: newPlan.name,
        old_horse_limit: oldPlan.max_horses,
        new_horse_limit: newPlan.max_horses,
        change_type: changeType,
        stripe_subscription_id: null, // Free subscription, no Stripe ID
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (planChangeError) {
      log("Error recording plan change", {
        userId,
        error: planChangeError.message
      });
      return null;
    }

    log("Plan change recorded successfully", {
      planChangeId: planChangeRecord.id,
      changeType
    });

    return planChangeRecord;

  } catch (error) {
    log("Error in recordPlanChange", {
      userId,
      error: error.message
    });
    return null;
  }
}

// ============================================
// Horse Management Function
// ============================================
async function manageUserHorses(
  supabaseAdmin: any,
  userId: string,
  planId: string,
  context: string
) {
  try {
    log("Managing horses for free subscription", { userId, planId, context });

    // Get plan limit
    const { data: plan, error: planError } = await supabaseAdmin
      .from("pricing_plans")
      .select("max_horses, name")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      log("Could not fetch plan details for horse management", {
        planId,
        error: planError?.message
      });
      return {
        success: false,
        error: "Could not fetch plan details"
      };
    }

    const planLimit = plan.max_horses;
    log("Plan limit retrieved", { planName: plan.name, maxHorses: planLimit });

    // Get all horses for this user (active and disabled)
    const { data: allHorses, error: horsesError } = await supabaseAdmin
      .from('horses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }); // Oldest first = higher priority

    if (horsesError) {
      log(`Error fetching horses for user`, { userId, error: horsesError.message });
      return {
        success: false,
        error: "Could not fetch horses"
      };
    }

    if (!allHorses || allHorses.length === 0) {
      log(`No horses found for user`, { userId });
      return {
        success: true,
        horses_affected: 0,
        horses_activated: 0,
        horses_disabled: 0,
        message: "No horses to manage"
      };
    }

    // Separate active and disabled horses
    const activeHorses = allHorses.filter(h => h.status === 'active');
    const disabledHorses = allHorses.filter(h => h.status === 'disabled');

    log("Current horse status", {
      userId,
      totalHorses: allHorses.length,
      activeHorses: activeHorses.length,
      disabledHorses: disabledHorses.length,
      planLimit: planLimit
    });

    let horsesToActivate = [];
    let horsesToDisable = [];

    // Determine which horses to activate or disable
    if (activeHorses.length < planLimit && disabledHorses.length > 0) {
      // We can activate more horses (UPGRADE scenario)
      const availableSlots = planLimit - activeHorses.length;
      horsesToActivate = disabledHorses
        .sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at).getTime();
          const dateB = new Date(b.updated_at || b.created_at).getTime();
          return dateB - dateA; // Most recently disabled first
        })
        .slice(0, availableSlots);

    } else if (activeHorses.length > planLimit) {
      // We need to disable some horses (DOWNGRADE scenario)
      const excessHorses = activeHorses.length - planLimit;
      horsesToDisable = activeHorses
        .sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Newest first = first to disable
        })
        .slice(0, excessHorses);
    }

    // Execute horse status changes
    let activatedCount = 0;
    let disabledCount = 0;

    // Activate horses
    if (horsesToActivate.length > 0) {
      const { error: activateError } = await supabaseAdmin
        .from("horses")
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
          disabled_at: null,
          disabled_reason: null
        })
        .in('id', horsesToActivate.map(h => h.id));

      if (activateError) {
        log(`Error activating horses`, { userId, error: activateError.message });
      } else {
        activatedCount = horsesToActivate.length;
        log(`Activated horses for free subscription`, {
          userId,
          count: activatedCount,
          horses: horsesToActivate.map(h => ({ id: h.id, name: h.name }))
        });
      }
    }

    // Disable horses
    if (horsesToDisable.length > 0) {
      const { error: disableError } = await supabaseAdmin
        .from("horses")
        .update({
          status: 'disabled',
          updated_at: new Date().toISOString(),
          disabled_at: new Date().toISOString(),
          disabled_reason: context.includes('downgrade') ? 'plan_downgrade' : 'plan_limit_exceeded'
        })
        .in('id', horsesToDisable.map(h => h.id));

      if (disableError) {
        log(`Error disabling horses`, { userId, error: disableError.message });
      } else {
        disabledCount = horsesToDisable.length;
        log(`Disabled horses due to plan limit`, {
          userId,
          count: disabledCount,
          horses: horsesToDisable.map(h => ({ id: h.id, name: h.name }))
        });
      }
    }

    const result = {
      success: true,
      horses_affected: activatedCount + disabledCount,
      horses_activated: activatedCount,
      horses_disabled: disabledCount,
      plan_limit: planLimit,
      total_horses: allHorses.length,
      activated_horses: horsesToActivate.map(h => ({ id: h.id, name: h.name })),
      disabled_horses: horsesToDisable.map(h => ({ id: h.id, name: h.name })),
      message: `Horse management completed: ${activatedCount} activated, ${disabledCount} disabled`
    };

    log("Horse management completed", { userId, result });
    return result;

  } catch (error) {
    log(`Error in manageUserHorses`, { userId, error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
}