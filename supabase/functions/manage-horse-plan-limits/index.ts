// supabase/functions/manage-horse-plan-limits/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const log = (message, data = null) => {
    console.log(`[MANAGE-HORSE-LIMITS] ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`);
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Initialize Supabase admin client
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
        );

        // Parse request body
        const {
            user_id,
            plan_change_id,
            change_type,
            old_limit,
            new_limit,
            old_plan_name,
            new_plan_name
        } = await req.json();

        if (!user_id || !change_type || !plan_change_id) {
            return new Response(JSON.stringify({ 
                error: "Missing required parameters: user_id, change_type, plan_change_id" 
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400
            });
        }

        log("Processing horse plan limits", {
            userId: user_id,
            changeType: change_type,
            oldLimit: old_limit,
            newLimit: new_limit,
            planChangeId: plan_change_id
        });

        let result;

        if (change_type === 'downgrade') {
            result = await handlePlanDowngrade(supabaseAdmin, {
                userId: user_id,
                oldLimit: old_limit,
                newLimit: new_limit,
                oldPlanName: old_plan_name,
                newPlanName: new_plan_name
            });
        } else if (change_type === 'upgrade') {
            result = await handlePlanUpgrade(supabaseAdmin, {
                userId: user_id,
                oldLimit: old_limit,
                newLimit: new_limit,
                oldPlanName: old_plan_name,
                newPlanName: new_plan_name
            });
        } else {
            // Same plan or no limit changes
            result = {
                success: true,
                horses_affected: 0,
                horses_disabled: 0,
                horses_reactivated: 0,
                message: "No horse status changes needed"
            };
        }

        log("Horse management completed", {
            userId: user_id,
            changeType: change_type,
            result
        });

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
        });

    } catch (error) {
        log("Error in horse management", { error: error.message });
        return new Response(JSON.stringify({ 
            error: error.message,
            success: false 
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});

// Handle plan downgrades - disable excess horses
async function handlePlanDowngrade(supabaseAdmin, { userId, oldLimit, newLimit, oldPlanName, newPlanName }) {
    try {
        log("Processing plan downgrade", { 
            userId, 
            oldLimit, 
            newLimit,
            excessHorses: Math.max(0, oldLimit - newLimit)
        });

        // Get all active horses ordered by creation date (oldest first - these stay active)
        const { data: activeHorses, error: fetchError } = await supabaseAdmin
            .from('horses')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: true });

        if (fetchError) {
            throw new Error(`Failed to fetch horses: ${fetchError.message}`);
        }

        if (!activeHorses || activeHorses.length <= newLimit) {
            // User has fewer horses than the new limit, no action needed
            return {
                success: true,
                horses_affected: 0,
                horses_disabled: 0,
                horses_reactivated: 0,
                message: `User has ${activeHorses?.length || 0} horses, new limit is ${newLimit}. No horses to disable.`
            };
        }

        // Calculate which horses to disable (newest ones)
        const horsesToKeep = activeHorses.slice(0, newLimit);
        const horsesToDisable = activeHorses.slice(newLimit);

        log("Horses to disable", {
            totalActive: activeHorses.length,
            toKeep: horsesToKeep.length,
            toDisable: horsesToDisable.length,
            horsesToDisable: horsesToDisable.map(h => ({ id: h.id, name: h.name, created_at: h.created_at }))
        });

        // Disable excess horses
        const { error: disableError } = await supabaseAdmin
            .from('horses')
            .update({
                status: 'disabled',
                disabled_at: new Date().toISOString(),
                disabled_reason: 'plan_downgrade'
            })
            .in('id', horsesToDisable.map(h => h.id));

        if (disableError) {
            throw new Error(`Failed to disable horses: ${disableError.message}`);
        }

        // Send email notification about downgrade
        await sendPlanChangeEmail(supabaseAdmin, {
            userId,
            changeType: 'downgrade',
            oldPlanName,
            newPlanName,
            horsesAffected: horsesToDisable.length,
            horsesDisabled: horsesToDisable.length,
            horsesReactivated: 0,
            disabledHorses: horsesToDisable.map(h => h.name)
        });

        return {
            success: true,
            horses_affected: horsesToDisable.length,
            horses_disabled: horsesToDisable.length,
            horses_reactivated: 0,
            disabled_horses: horsesToDisable.map(h => ({
                id: h.id,
                name: h.name
            })),
            message: `Successfully disabled ${horsesToDisable.length} horses due to plan downgrade`
        };

    } catch (error) {
        log("Error in handlePlanDowngrade", { userId, error: error.message });
        throw error;
    }
}

// Handle plan upgrades - reactivate disabled horses
async function handlePlanUpgrade(supabaseAdmin, { userId, oldLimit, newLimit, oldPlanName, newPlanName }) {
    try {
        log("Processing plan upgrade", { 
            userId, 
            oldLimit, 
            newLimit,
            additionalSlots: Math.max(0, newLimit - oldLimit)
        });

        // Get current active horses count
        const { data: activeHorses, error: activeError } = await supabaseAdmin
            .from('horses')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (activeError) {
            throw new Error(`Failed to fetch active horses: ${activeError.message}`);
        }

        const currentActiveCount = activeHorses?.length || 0;
        const availableSlots = newLimit - currentActiveCount;

        if (availableSlots <= 0) {
            // No slots available for reactivation
            return {
                success: true,
                horses_affected: 0,
                horses_disabled: 0,
                horses_reactivated: 0,
                message: `User has ${currentActiveCount} active horses, new limit is ${newLimit}. No slots available for reactivation.`
            };
        }

        // Get disabled horses ordered by disabled_at (most recently disabled first)
        const { data: disabledHorses, error: disabledError } = await supabaseAdmin
            .from('horses')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'disabled')
            .order('disabled_at', { ascending: false });

        if (disabledError) {
            throw new Error(`Failed to fetch disabled horses: ${disabledError.message}`);
        }

        if (!disabledHorses || disabledHorses.length === 0) {
            // No disabled horses to reactivate
            return {
                success: true,
                horses_affected: 0,
                horses_disabled: 0,
                horses_reactivated: 0,
                message: "No disabled horses to reactivate"
            };
        }

        // Determine how many horses to reactivate
        const horsesToReactivate = disabledHorses.slice(0, availableSlots);

        log("Horses to reactivate", {
            currentActive: currentActiveCount,
            newLimit: newLimit,
            availableSlots: availableSlots,
            disabledCount: disabledHorses.length,
            toReactivate: horsesToReactivate.length,
            horsesToReactivate: horsesToReactivate.map(h => ({ id: h.id, name: h.name, disabled_at: h.disabled_at }))
        });

        // Reactivate horses
        const { error: reactivateError } = await supabaseAdmin
            .from('horses')
            .update({
                status: 'active',
                disabled_at: null,
                disabled_reason: null
            })
            .in('id', horsesToReactivate.map(h => h.id));

        if (reactivateError) {
            throw new Error(`Failed to reactivate horses: ${reactivateError.message}`);
        }

        // Send email notification about upgrade
        await sendPlanChangeEmail(supabaseAdmin, {
            userId,
            changeType: 'upgrade',
            oldPlanName,
            newPlanName,
            horsesAffected: horsesToReactivate.length,
            horsesDisabled: 0,
            horsesReactivated: horsesToReactivate.length,
            reactivatedHorses: horsesToReactivate.map(h => h.name)
        });

        return {
            success: true,
            horses_affected: horsesToReactivate.length,
            horses_disabled: 0,
            horses_reactivated: horsesToReactivate.length,
            reactivated_horses: horsesToReactivate.map(h => ({
                id: h.id,
                name: h.name
            })),
            message: `Successfully reactivated ${horsesToReactivate.length} horses due to plan upgrade`
        };

    } catch (error) {
        log("Error in handlePlanUpgrade", { userId, error: error.message });
        throw error;
    }
}

// Send email notification about plan changes
async function sendPlanChangeEmail(supabaseAdmin, { 
    userId, 
    changeType, 
    oldPlanName, 
    newPlanName, 
    horsesAffected, 
    horsesDisabled, 
    horsesReactivated,
    disabledHorses = [],
    reactivatedHorses = []
}) {
    try {
        // Get user email
        const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError || !user?.user?.email) {
            log("Could not get user email for notification", { userId, error: userError?.message });
            return;
        }

        const userEmail = user.user.email;

        // Prepare email content based on change type
        let subject, htmlContent;

        if (changeType === 'downgrade') {
            subject = `Plan Downgraded: Some Horses Have Been Disabled`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Plan Downgrade Notice</h2>
                    <p>Your subscription has been downgraded from <strong>${oldPlanName}</strong> to <strong>${newPlanName}</strong>.</p>
                    
                    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h3 style="color: #dc2626; margin-top: 0;">Horses Affected</h3>
                        <p>${horsesDisabled} of your horses have been temporarily disabled due to the plan limits:</p>
                        <ul>
                            ${disabledHorses.map(name => `<li><strong>${name}</strong></li>`).join('')}
                        </ul>
                        <p><small>These horses are still saved in your account but cannot be used until you upgrade your plan.</small></p>
                    </div>
                    
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <h3 style="color: #2563eb; margin-top: 0;">Want to reactivate your horses?</h3>
                        <p>Upgrade your plan to reactivate all your horses and continue using them.</p>
                        <a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', '')}/pricing" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 8px;">
                            Upgrade Plan
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `;
        } else if (changeType === 'upgrade') {
            subject = `Plan Upgraded: Horses Reactivated!`;
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Plan Upgrade Confirmation</h2>
                    <p>Congratulations! Your subscription has been upgraded from <strong>${oldPlanName}</strong> to <strong>${newPlanName}</strong>.</p>
                    
                    ${horsesReactivated > 0 ? `
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <h3 style="color: #16a34a; margin-top: 0;">Horses Reactivated</h3>
                            <p>${horsesReactivated} horses have been automatically reactivated:</p>
                            <ul>
                                ${reactivatedHorses.map(name => `<li><strong>${name}</strong></li>`).join('')}
                            </ul>
                            <p><small>You can now use all features for these horses again.</small></p>
                        </div>
                    ` : `
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <h3 style="color: #16a34a; margin-top: 0;">Ready to Go!</h3>
                            <p>Your upgraded plan is now active. You can add more horses and access all premium features.</p>
                        </div>
                    `}
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        Thank you for upgrading! If you have any questions, please contact our support team.
                    </p>
                </div>
            `;
        }

        // Send email using your existing email function
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to: userEmail,
                subject: subject,
                html: htmlContent
            })
        });

        if (response.ok) {
            log("Plan change email sent successfully", { 
                userId, 
                email: userEmail, 
                changeType,
                horsesAffected 
            });
        } else {
            const errorResult = await response.text();
            log("Failed to send plan change email", { 
                userId, 
                email: userEmail, 
                error: errorResult 
            });
        }

    } catch (error) {
        log("Error sending plan change email", { 
            userId, 
            changeType, 
            error: error.message 
        });
        // Don't throw here - email failure shouldn't break the horse management
    }
}