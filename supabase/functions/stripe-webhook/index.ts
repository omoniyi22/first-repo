import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16"
});

// Initialize Supabase admin client
const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
);

// Simple logging function
const log = (message, data = null) => {
    console.log(`[STRIPE-WEBHOOK] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
};

serve(async (req) => {
    try {
        // Only allow POST requests
        if (req.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        // Get request data
        const body = await req.text();
        const signature = req.headers.get("stripe-signature");
        const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

        if (!signature || !webhookSecret) {
            log("Missing webhook signature or secret");
            return new Response("Missing webhook signature or secret", { status: 400 });
        }

        // Verify webhook signature
        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        } catch (err) {
            log("Webhook signature verification failed", { error: err.message });
            return new Response("Webhook signature verification failed", { status: 400 });
        }

        // Handle Stripe events
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object);
                break;

            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object);
                break;

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object);
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object);
                break;

            case "invoice.payment_succeeded":
                await handlePaymentSucceeded(event.data.object);
                break;

            default:
                // Log unhandled events for monitoring
                log("Unhandled event type", { type: event.type });
        }

        return new Response("OK", { status: 200 });

    } catch (error) {
        log("Webhook processing error", { error: error.message });
        return new Response("Webhook error", { status: 500 });
    }
});

// 🎯 Handle checkout completion
async function handleCheckoutCompleted(session) {
    const metadata = session.metadata || {};
    const { user_id, plan_id, coupon_id } = metadata;

    if (!user_id || !plan_id || !session.subscription) {
        log("Invalid checkout session", {
            hasUserId: !!user_id,
            hasPlanId: !!plan_id,
            hasSubscription: !!session.subscription
        });
        return;
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await createSubscriptionRecord({
            user_id,
            plan_id,
            coupon_id: coupon_id || null,
            subscription,
            source: "checkout.session.completed"
        });

    } catch (error) {
        log("Error handling checkout completion", {
            sessionId: session.id,
            error: error.message
        });
    }
}

// 🎯 Handle subscription creation
async function handleSubscriptionCreated(subscription) {
    const metadata = subscription.metadata || {};
    const { user_id, plan_id, coupon_id } = metadata;

    if (!user_id || !plan_id) {
        log("Invalid subscription metadata", {
            subscriptionId: subscription.id,
            hasUserId: !!user_id,
            hasPlanId: !!plan_id
        });
        return;
    }

    try {
        await createSubscriptionRecord({
            user_id,
            plan_id,
            coupon_id: coupon_id || null,
            subscription,
            source: "customer.subscription.created"
        });

    } catch (error) {
        log("Error handling subscription creation", {
            subscriptionId: subscription.id,
            error: error.message
        });
    }
}

// 🎯 Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
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
            log("Error updating subscription", {
                subscriptionId: subscription.id,
                error: error.message
            });
        } else {
            log("Subscription updated successfully", {
                subscriptionId: subscription.id,
                status: subscription.status
            });
        }

    } catch (error) {
        log("Error in subscription update handler", {
            subscriptionId: subscription.id,
            error: error.message
        });
    }
}

// 🎯 Handle subscription cancellation
async function handleSubscriptionDeleted(subscription) {
    try {
        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
                is_active: false,
                ends_at: new Date().toISOString() // Mark as ended now
            })
            .eq("stripe_subscription_id", subscription.id);

        if (error) {
            log("Error deactivating subscription", {
                subscriptionId: subscription.id,
                error: error.message
            });
        } else {
            log("Subscription deactivated successfully", {
                subscriptionId: subscription.id
            });
        }

    } catch (error) {
        log("Error in subscription deletion handler", {
            subscriptionId: subscription.id,
            error: error.message
        });
    }
}

// 🎯 Handle successful payments (renewals)
async function handlePaymentSucceeded(invoice) {
    if (!invoice.subscription) {
        return; // Not a subscription payment
    }

    try {
        // Get updated subscription details
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
                is_active: true, // Ensure subscription is active after successful payment
                ends_at: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq("stripe_subscription_id", subscription.id);

        if (error) {
            log("Error updating subscription after payment", {
                subscriptionId: subscription.id,
                error: error.message
            });
        } else {
            log("Subscription renewed successfully", {
                subscriptionId: subscription.id,
                newEndDate: new Date(subscription.current_period_end * 1000).toISOString()
            });
        }

    } catch (error) {
        log("Error in payment success handler", {
            invoiceId: invoice.id,
            error: error.message
        });
    }
}

// 🛠️ Helper function to create subscription records
async function createSubscriptionRecord({ user_id, plan_id, coupon_id, subscription, source }) {
    // Check if subscription already exists (prevent duplicates)
    const { data: existing } = await supabaseAdmin
        .from("user_subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

    if (existing) {
        log("Subscription already exists, skipping creation", {
            subscriptionId: subscription.id,
            source
        });
        return;
    }

    // Create new subscription record
    const subscriptionData = {
        user_id,
        plan_id,
        stripe_subscription_id: subscription.id,
        is_active: subscription.status === 'active',
        is_trial: subscription.status === 'trialing',
        coupon_id,
        started_at: new Date(subscription.created * 1000).toISOString(),
        ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
        .from("user_subscriptions")
        .insert(subscriptionData)
        .select();

    if (error) {
        log("Failed to create subscription record", {
            subscriptionId: subscription.id,
            error: error.message,
            source
        });
        throw error;
    } else {
        log("Subscription record created successfully", {
            subscriptionId: subscription.id,
            userId: user_id,
            planId: plan_id,
            couponUsed: !!coupon_id,
            source
        });
    }
}