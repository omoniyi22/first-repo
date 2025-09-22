// supabase/functions/stripe-webhook/index.ts
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

        log("Webhook event", event);

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
        // REPLACE THIS BROKEN QUERY:
        const { data: existingSub, error: existingSubError } = await supabaseAdmin
            .from("user_subscriptions")
            .select(`
                *,
                pricing_plans(
                    id,
                    name,
                    stripe_price_id,
                    max_horses
                )
            `)
            .eq("stripe_subscription_id", subscription.id)
            .single();

        if (existingSubError) {
            log("Error fetching existing subscription", {
                subscriptionId: subscription.id,
                error: existingSubError.message
            });
            return;
        }

        let updateData = {
            is_active: subscription.status === 'active',
            is_trial: subscription.status === 'trialing',
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
        };

        // Check if plan changed
        const oldPriceId = existingSub?.pricing_plans?.stripe_price_id;
        const newPriceId = currentItem.price.id;
        let planChanged = false;
        let newPlan = null;

        if (oldPriceId !== newPriceId) {
            // Get new plan details
            const { data: newPlanData, error: newPlanError } = await supabaseAdmin
                .from("pricing_plans")
                .select("*")
                .eq("stripe_price_id", newPriceId)
                .single();

            if (newPlanError) {
                log("Error fetching new plan", {
                    subscriptionId: subscription.id,
                    newPriceId,
                    error: newPlanError.message
                });
            } else {
                newPlan = newPlanData;
                updateData.plan_id = newPlan.id;
                planChanged = true;

                log("Plan change detected", {
                    subscriptionId: subscription.id,
                    userId: existingSub.user_id,
                    oldPlan: existingSub.pricing_plans.name,
                    newPlan: newPlan.name,
                    oldLimit: existingSub.pricing_plans.max_horses,
                    newLimit: newPlan.max_horses
                });
            }
        }

        // Update subscription record
        const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(updateData)
            .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
            log("Error updating subscription", {
                subscriptionId: subscription.id,
                error: updateError.message
            });
            return;
        }

        // Handle plan change if detected
        if (planChanged && newPlan) {
            await handlePlanChange({
                userId: existingSub.user_id,
                subscriptionId: subscription.id,
                oldPlan: existingSub.pricing_plans,
                newPlan: newPlan,
                changeType: newPlan.max_horses > existingSub.pricing_plans.max_horses
                    ? 'upgrade'
                    : newPlan.max_horses < existingSub.pricing_plans.max_horses
                        ? 'downgrade'
                        : 'same'
            });
        }

        log("Subscription updated successfully", {
            subscriptionId: subscription.id,
            status: subscription.status,
            planChanged
        });

    } catch (error) {
        log("Error in subscription update handler", {
            subscriptionId: subscription.id,
            error: error.message
        });
    }
}

// 🆕 NEW: Handle plan changes
async function handlePlanChange({ userId, subscriptionId, oldPlan, newPlan, changeType }) {
    try {
        log("Processing plan change", {
            userId,
            changeType,
            oldLimit: oldPlan.max_horses,
            newLimit: newPlan.max_horses
        });

        // Record the plan change first
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
                stripe_subscription_id: subscriptionId
            })
            .select()
            .single();

        if (planChangeError) {
            log("Error recording plan change", {
                userId,
                error: planChangeError.message
            });
            return;
        }

        // Only process horse status changes if limits actually changed
        if (oldPlan.max_horses !== newPlan.max_horses && changeType !== 'same') {
            // Call the horse management Edge Function
            const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/manage-horse-plan-limits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                    'Content-Type': 'application/json',
                    'apikey': Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
                },
                body: JSON.stringify({
                    user_id: userId,
                    plan_change_id: planChangeRecord.id,
                    change_type: changeType,
                    old_limit: oldPlan.max_horses,
                    new_limit: newPlan.max_horses,
                    old_plan_name: oldPlan.name,
                    new_plan_name: newPlan.name
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Update plan change record with results
                await supabaseAdmin
                    .from("plan_changes")
                    .update({
                        horses_affected: result.horses_affected || 0,
                        horses_disabled: result.horses_disabled || 0,
                        horses_reactivated: result.horses_reactivated || 0
                    })
                    .eq("id", planChangeRecord.id);

                log("Horse management completed", {
                    userId,
                    changeType,
                    horsesAffected: result.horses_affected,
                    horsesDisabled: result.horses_disabled,
                    horsesReactivated: result.horses_reactivated
                });
            } else {
                log("Horse management failed", {
                    userId,
                    error: result.error || 'Unknown error'
                });
            }
        } else {
            log("No horse limit changes needed", {
                userId,
                changeType,
                oldLimit: oldPlan.max_horses,
                newLimit: newPlan.max_horses
            });
        }

    } catch (error) {
        log("Error handling plan change", {
            userId,
            changeType,
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
// Enhanced version of createSubscriptionRecord
async function createSubscriptionRecord({ user_email, user_id, plan_id, coupon_id, subscription, source }) {
    try {
        // Check if subscription already exists (prevent duplicates)
        const { data: existing } = await supabaseAdmin
            .from("user_subscriptions")
            .select("id, is_active")
            .eq("stripe_subscription_id", subscription.id)
            .single();

        if (existing) {
            log("Subscription already exists, skipping creation", {
                subscriptionId: subscription.id,
                source,
                existingId: existing.id,
                isActive: existing.is_active
            });
            return existing;
        }

        // Use a transaction to ensure atomicity
        const { data, error } = await supabaseAdmin.rpc('create_subscription_safely', {
            p_user_id: user_id,
            p_plan_id: plan_id,
            p_stripe_subscription_id: subscription.id,
            p_is_active: subscription.status === 'active',
            p_is_trial: subscription.status === 'trialing',
            p_coupon_id: coupon_id,
            p_started_at: new Date(subscription.created * 1000).toISOString(),
            p_ends_at: new Date(subscription.current_period_end * 1000).toISOString()
        });

        if (error) {
            log("Failed to create subscription record", {
                subscriptionId: subscription.id,
                error: error.message,
                source
            });
            throw error;
        }

        // Log subscription history
        await logSubscriptionHistory({
            user_id,
            action: 'subscription_created',
            new_plan_id: plan_id,
            stripe_subscription_id: subscription.id,
            source
        });

        log("Subscription record created successfully", {
            subscriptionId: subscription.id,
            userId: user_id,
            planId: plan_id,
            source
        });

        return data;

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