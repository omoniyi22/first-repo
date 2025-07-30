import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Initialize Stripe with secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16"
});

// Initialize Supabase admin client (has permission to write to database)
const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
);

// Helper logging function
const logStep = (step, details) => {
    console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
    try {
        logStep("Webhook received");

        // Get the raw body and signature from Stripe
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

        if (!signature || !webhookSecret) {
            throw new Error("Missing webhook signature or secret");
        }

        // 🔐 VERIFY WEBHOOK IS FROM STRIPE (SECURITY)
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            logStep("Webhook signature verified", { eventType: event.type });
        } catch (err) {
            logStep("Webhook signature verification failed", { error: err.message });
            return new Response("Webhook signature verification failed", { status: 400 });
        }

        // 🎯 HANDLE DIFFERENT STRIPE EVENTS
        switch (event.type) {
            case "checkout.session.completed":
                // 💳 User completed payment - CREATE subscription record
                await handleCheckoutCompleted(event.data.object);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
                // 🔄 Subscription was created or updated - UPDATE subscription record
                await handleSubscriptionUpdated(event.data.object);
                break;

            case "customer.subscription.deleted":
                // ❌ Subscription was cancelled - DEACTIVATE subscription record
                await handleSubscriptionDeleted(event.data.object);
                break;

            case "invoice.payment_succeeded":
                // 💰 Payment succeeded - EXTEND subscription period
                await handlePaymentSucceeded(event.data.object);
                break;

            default:
                logStep("Unhandled event type", { type: event.type });
        }

        return new Response("OK", { status: 200 });

    } catch (error) {
        logStep("Webhook error", { error: error.message });
        return new Response("Webhook error", { status: 400 });
    }
});

// 🎯 FUNCTION 1: Handle checkout completion (NEW SUBSCRIPTION)
async function handleCheckoutCompleted(session) {
    logStep("Processing checkout completion", { sessionId: session.id });

    const metadata = session.metadata;
    const { user_id, plan_id, coupon_id, billing_mode } = metadata;

    if (!user_id || !plan_id) {
        logStep("Missing required metadata", { metadata });
        return;
    }

    try {
        // Get the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        logStep("Retrieved subscription from Stripe", {
            subscriptionId: subscription.id,
            status: subscription.status
        });

        // 💾 CREATE SUBSCRIPTION RECORD IN YOUR DATABASE
        const subscriptionData = {
            user_id,
            plan_id,
            stripe_subscription_id: subscription.id,
            is_active: subscription.status === 'active',
            is_trial: subscription.status === 'trialing',
            coupon_id: coupon_id || null,
            started_at: new Date(subscription.created * 1000).toISOString(),
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .insert(subscriptionData);

        if (error) {
            logStep("Error saving subscription", { error: error.message });
        } else {
            logStep("Subscription saved successfully", {
                userId: user_id,
                planId: plan_id,
                couponUsed: coupon_id ? 'Yes' : 'No'
            });
        }

    } catch (error) {
        logStep("Error in handleCheckoutCompleted", { error: error.message });
    }
}

// 🎯 FUNCTION 2: Handle subscription updates (SUBSCRIPTION CHANGES)
async function handleSubscriptionUpdated(subscription) {
    logStep("Processing subscription update", { subscriptionId: subscription.id });

    try {
        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
                is_active: subscription.status === 'active',
                is_trial: subscription.status === 'trialing',
                ends_at: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq("stripe_subscription_id", subscription.id);

        if (error) {
            logStep("Error updating subscription", { error: error.message });
        } else {
            logStep("Subscription updated successfully", {
                subscriptionId: subscription.id,
                status: subscription.status
            });
        }

    } catch (error) {
        logStep("Error in handleSubscriptionUpdated", { error: error.message });
    }
}

// 🎯 FUNCTION 3: Handle subscription deletion (CANCELLATION)
async function handleSubscriptionDeleted(subscription) {
    logStep("Processing subscription deletion", { subscriptionId: subscription.id });

    try {
        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update({ is_active: false })
            .eq("stripe_subscription_id", subscription.id);

        if (error) {
            logStep("Error deactivating subscription", { error: error.message });
        } else {
            logStep("Subscription deactivated successfully", {
                subscriptionId: subscription.id
            });
        }

    } catch (error) {
        logStep("Error in handleSubscriptionDeleted", { error: error.message });
    }
}

// 🎯 FUNCTION 4: Handle successful payments (RENEWAL)
async function handlePaymentSucceeded(invoice) {
    logStep("Processing successful payment", { invoiceId: invoice.id });

    if (!invoice.subscription) {
        logStep("No subscription associated with invoice", { invoiceId: invoice.id });
        return;
    }

    try {
        // Get updated subscription details
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

        // Update subscription end date after successful payment
        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
                ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
                is_active: true // Ensure it's marked as active after payment
            })
            .eq("stripe_subscription_id", subscription.id);

        if (error) {
            logStep("Error updating subscription after payment", { error: error.message });
        } else {
            logStep("Subscription extended after payment", {
                subscriptionId: subscription.id,
                newEndDate: new Date(subscription.current_period_end * 1000).toISOString()
            });
        }

    } catch (error) {
        logStep("Error in handlePaymentSucceeded", { error: error.message });
    }
}