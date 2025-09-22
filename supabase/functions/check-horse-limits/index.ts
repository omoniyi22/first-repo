// supabase/functions/check-horse-limits/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const log = (message, data = null) => {
    console.log(`[CHECK-HORSE-LIMITS] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
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
        log("Checking horse limits", { userId: user.id });

        // Get user's active subscription with plan details
        const { data: subscription, error: subError } = await supabaseAdmin
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
            .eq("is_active", true)
            .limit(1)
            .single();


        if (subError && subError.code !== 'PGRST116') {
            log("Database error", { userId: user.id, error: subError.message });
            return new Response(JSON.stringify({ error: "Database error" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500
            });
        }

        // If no active subscription, use free tier (0 horses allowed)
        let maxHorses = 0;
        let planName = "Free";

        if (subscription?.pricing_plans) {
            maxHorses = subscription.pricing_plans.max_horses;
            planName = subscription.pricing_plans.name;
        }

        log("Plan details", { planName, maxHorses });

        // Count user's current horses
        const { count: currentHorseCount, error: countError } = await supabaseAdmin
            .from("horses")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        if (countError) {
            log("Error counting horses", { error: countError.message });
            return new Response(JSON.stringify({ error: "Error counting horses" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500
            });
        }

        const currentHorses = currentHorseCount || 0;
        const canAddHorse = maxHorses === -1 || currentHorses < maxHorses;

        log("Horse limit check completed", {
            userId: user.id,
            currentHorses,
            maxHorses: maxHorses === -1 ? "unlimited" : maxHorses,
            canAddHorse,
            planName
        });

        const response = {
            canAddHorse,
            currentHorses,
            maxHorses: maxHorses === -1 ? "unlimited" : maxHorses,
            planName,
            remainingSlots: maxHorses === -1 ? "unlimited" : Math.max(0, maxHorses - currentHorses)
        };

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