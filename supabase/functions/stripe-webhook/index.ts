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

            case "invoice.payment_failed":
                await handlePaymentFailed(event.data.object);
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
    const { user_email, user_id, plan_id, coupon_id } = metadata;

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
            user_email,
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
        // Check if this is a plan change (different price)
        const currentItem = subscription.items.data[0];

        // Get existing subscription to compare
        const { data: existingSub } = await supabaseAdmin
            .from("user_subscriptions")
            .select("plan_id, pricing_plans!inner(stripe_price_id)")
            .eq("stripe_subscription_id", subscription.id)
            .single();

        let updateData = {
            is_active: subscription.status === 'active',
            is_trial: subscription.status === 'trialing',
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
        };

        // If plan changed, we need to find the new plan_id
        if (existingSub?.pricing_plans?.stripe_price_id !== currentItem.price.id) {
            const { data: newPlan } = await supabaseAdmin
                .from("pricing_plans")
                .select("id")
                .eq("stripe_price_id", currentItem.price.id)
                .single();

            if (newPlan) {
                updateData.plan_id = newPlan.id;
                log("Plan change detected", {
                    subscriptionId: subscription.id,
                    oldPriceId: existingSub?.pricing_plans?.stripe_price_id,
                    newPriceId: currentItem.price.id,
                    newPlanId: newPlan.id
                });
            }
        }

        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update(updateData)
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
                ends_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                cancelled_at: new Date().toISOString()
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
                is_active: true,
                ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
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

// 🎯 Handle failed payments
async function handlePaymentFailed(invoice) {
    if (!invoice.subscription) {
        return; // Not a subscription payment
    }

    try {
        const { error } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
                is_active: false, // Deactivate on payment failure
                updated_at: new Date().toISOString()
            })
            .eq("stripe_subscription_id", invoice.subscription);

        if (error) {
            log("Error updating subscription after payment failure", {
                subscriptionId: invoice.subscription,
                error: error.message
            });
        } else {
            log("Subscription deactivated due to payment failure", {
                subscriptionId: invoice.subscription,
                invoiceId: invoice.id
            });
        }

    } catch (error) {
        log("Error in payment failure handler", {
            invoiceId: invoice.id,
            error: error.message
        });
    }
}

// 🛠️ Helper function to create subscription records with proper deactivation
async function createSubscriptionRecord({ user_email, user_id, plan_id, coupon_id, subscription, source }) {
    try {
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

        // 🎯 STEP 1: Deactivate all existing active subscriptions for this user
        const { data: previousSubs, error: deactivateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update({
                is_active: false,
                ends_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deactivation_reason: 'new_subscription_created'
            })
            .eq("user_id", user_id)
            .eq("is_active", true)
            .select("id, plan_id");

        if (deactivateError) {
            log("Error deactivating previous subscriptions", {
                userId: user_id,
                error: deactivateError.message
            });
            // Don't throw here, continue with creation
        } else if (previousSubs && previousSubs.length > 0) {
            log("Deactivated previous subscriptions", {
                userId: user_id,
                deactivatedCount: previousSubs.length,
                deactivatedIds: previousSubs.map(s => s.id)
            });
        }

        // 🎯 STEP 2: Create new subscription record
        const subscriptionData = {
            user_id,
            plan_id,
            stripe_subscription_id: subscription.id,
            is_active: subscription.status === 'active',
            is_trial: subscription.status === 'trialing',
            coupon_id,
            started_at: new Date(subscription.created * 1000).toISOString(),
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
        }


        const userEmail = user_email || subscription.customer_email || "<unknown>";
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        const response = await fetch("https://uwrmtukgjnsjxcojqmic.functions.supabase.co/send-email", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to: userEmail,
                subject: "New Subscription Created",
                html: "<p>You have successfully created a new subscription!</p>"
            })
        });
        const result = await response.json();

        log("Email sent successfully", {
            userEmail,
            response: result
        });

        // 🎯 STEP 3: Log subscription history
        await logSubscriptionHistory({
            user_id,
            action: 'subscription_created',
            new_plan_id: plan_id,
            stripe_subscription_id: subscription.id,
            source,
            metadata: {
                coupon_used: !!coupon_id,
                trial_period: subscription.status === 'trialing'
            }
        });

        log("Subscription record created successfully", {
            subscriptionId: subscription.id,
            userId: user_id,
            planId: plan_id,
            couponUsed: !!coupon_id,
            previousSubsDeactivated: previousSubs?.length || 0,
            source
        });

        return data[0];

    } catch (error) {
        log("Error in createSubscriptionRecord", {
            userId: user_id,
            subscriptionId: subscription.id,
            error: error.message
        });
        throw error;
    }
}

// 🛠️ Helper function to log subscription history
async function logSubscriptionHistory({ user_id, action, new_plan_id, old_plan_id, stripe_subscription_id, source, metadata = {} }) {
    try {
        const { error } = await supabaseAdmin
            .from("subscription_history")
            .insert({
                user_id,
                action,
                new_plan_id,
                old_plan_id: old_plan_id || null,
                stripe_subscription_id,
                source,
                metadata,
                created_at: new Date().toISOString()
            });

        if (error) {
            log("Error logging subscription history", {
                userId: user_id,
                action,
                error: error.message
            });
        }
    } catch (error) {
        // Don't throw here, logging failure shouldn't break the main flow
        log("Failed to log subscription history", {
            userId: user_id,
            action,
            error: error.message
        });
    }
}