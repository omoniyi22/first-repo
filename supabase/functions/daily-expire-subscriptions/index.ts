// supabase/functions/daily-expire-subscriptions/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Initialize Supabase admin client
const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
);

const log = (message: string, data?: any) => {
    console.log(`[EXPIRE-SUBSCRIPTIONS] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
};

// Email function
async function sendEmail(emailData: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('No RESEND_API_KEY found - simulating email send for testing')
      console.log(`Would send email to: ${emailData.to}`)
      console.log(`Subject: ${emailData.subject}`)
      console.log('Email content preview:', emailData.text.substring(0, 200) + '...')
      return { success: true }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Event Reminders <noreply@equineaintelligence.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        headers: {
          'X-Entity-Ref-ID': `subscription-expiry-${Date.now()}`
        }
      })
    })

    const responseData = await response.json()

    if (response.ok) {
      console.log('Email sent successfully via Resend:', responseData.id)
      return { success: true }
    } else {
      console.error('Resend API error:', responseData)
      return { success: false, error: `Resend API error: ${responseData.message || 'Unknown error'}` }
    }

  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

// Handle horses when user's subscription expires
async function handleExpiredUserHorses(userId: string, subscriptionId: string) {
    try {
        log(`Processing horses for expired user subscription`, { userId, subscriptionId });

        // Get all active horses for this user
        const { data: activeHorses, error: fetchError } = await supabaseAdmin
            .from('horses')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: true });

        if (fetchError) {
            log(`Error fetching horses for user ${userId}`, { error: fetchError.message });
            return;
        }

        if (!activeHorses || activeHorses.length === 0) {
            log(`No active horses found for user ${userId}`);
            return;
        }

        // Disable all user's horses by changing status to 'disabled'
        const { error: updateHorsesError } = await supabaseAdmin
            .from("horses")
            .update({
                status: 'disabled',
                updated_at: new Date().toISOString()
            })
            .eq("user_id", userId)
            .eq("status", "active");

        if (updateHorsesError) {
            log(`Error updating horses for user ${userId}`, { error: updateHorsesError.message });
            return;
        }

        log(`Successfully disabled ${activeHorses.length} horses for user ${userId}`, {
            horseIds: activeHorses.map(h => h.id),
            horseNames: activeHorses.map(h => h.name)
        });

    } catch (error) {
        log(`Error in handleExpiredUserHorses for user ${userId}`, { error: error.message });
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        log("Starting subscription expiry check");

        // Find expired subscriptions
        const { data: expiredSubs, error: fetchError } = await supabaseAdmin
            .from("user_subscriptions")
            .select(`
                id,
                user_id,
                stripe_subscription_id,
                ends_at,
                pricing_plans (
                    name
                )
            `)
            .eq("is_active", true)
            .lte("ends_at", new Date().toISOString())
            .is("cancelled_at", null);

        if (fetchError) {
            throw new Error(`Error fetching expired subscriptions: ${fetchError.message}`);
        }

        if (!expiredSubs || expiredSubs.length === 0) {
            log("No expired subscriptions found");
            return new Response(JSON.stringify({ 
                message: "No expired subscriptions found",
                expired_count: 0 
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        log(`Found ${expiredSubs.length} expired subscriptions`);

        let expiredCount = 0;
        let emailsSent = 0;
        let emailsFailed = 0;

        for (const subscription of expiredSubs) {
            try {
                // Get user email
                const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
                
                if (userError || !user.user?.email) {
                    log(`Could not get user email for subscription ${subscription.id}`, { userError: userError?.message });
                    continue;
                }

                // Mark subscription as inactive
                const { error: updateError } = await supabaseAdmin
                    .from("user_subscriptions")
                    .update({
                        is_active: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", subscription.id);

                if (updateError) {
                    log(`Error updating subscription ${subscription.id}`, { error: updateError.message });
                    continue;
                }

                expiredCount++;

                // Update user's horses status due to expired subscription
                await handleExpiredUserHorses(subscription.user_id, subscription.id);

                // Generate email content
                const planName = subscription.pricing_plans?.name || "Your plan";
                const expiredDate = new Date(subscription.ends_at).toLocaleDateString();
                
                const emailText = `
Hi there,

Your ${planName} subscription has expired as of ${expiredDate}.

Your account access has been limited. To continue using all features, please renew your subscription by visiting your account page.

If you have any questions or need assistance, please contact our support team.

Best regards,
The Equine AI Intelligence Team
                `.trim();

                const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Subscription Expired</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Subscription Expired</h1>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <p>Hi there,</p>
        
        <p>Your <strong>${planName}</strong> subscription has expired as of <strong>${expiredDate}</strong>.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #dc2626;"><strong>Action Required:</strong> Your account access has been limited. Please renew your subscription to continue using all features.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://equineaintelligence.com/pricing" 
               style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Renew Subscription
            </a>
        </div>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The Equine AI Intelligence Team
        </p>
    </div>
</body>
</html>
                `.trim();

                // Send email
                const emailResult = await sendEmail({
                    to: user.user.email,
                    subject: "Your subscription has expired",
                    text: emailText,
                    html: emailHtml
                });

                if (emailResult.success) {
                    emailsSent++;
                    log(`Email sent successfully for subscription ${subscription.id}`, { 
                        email: user.user.email,
                        planName 
                    });
                } else {
                    emailsFailed++;
                    log(`Failed to send email for subscription ${subscription.id}`, { 
                        email: user.user.email,
                        error: emailResult.error 
                    });
                }

            } catch (error) {
                log(`Error processing subscription ${subscription.id}`, { error: error.message });
                continue;
            }
        }

        const result = {
            message: "Subscription expiry check completed",
            expired_count: expiredCount,
            emails_sent: emailsSent,
            emails_failed: emailsFailed,
            total_processed: expiredSubs.length
        };

        log("Subscription expiry process completed", result);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (error) {
        log("Error in subscription expiry process", { error: error.message });
        
        return new Response(JSON.stringify({ 
            error: error.message,
            expired_count: 0 
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});