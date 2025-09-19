// hooks/useHorseLimits.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HorseLimits {
    canAddHorse: boolean;
    currentHorses: number;
    maxHorses: string | number;
    planName: string;
    remainingSlots: string | number;
    // New fields for disabled horse support
    disabledHorses: number;
    totalHorses: number;
    hasDisabledHorses: boolean;
    activeHorses: number;
}

interface HorseStatusCounts {
    active: number;
    disabled: number;
    total: number;
}

export const useHorseLimits = () => {
    const [limits, setLimits] = useState<HorseLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();
    const { toast } = useToast();

    // Helper function to get horse status counts
    const getHorseStatusCounts = useCallback(async (): Promise<HorseStatusCounts> => {
        if (!session) {
            return { active: 0, disabled: 0, total: 0 };
        }

        try {
            // Get active horses count
            const { count: activeCount, error: activeError } = await supabase
                .from('horses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('status', 'active');

            if (activeError) throw activeError;

            // Get disabled horses count
            const { count: disabledCount, error: disabledError } = await supabase
                .from('horses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('status', 'disabled');

            if (disabledError) throw disabledError;

            const active = activeCount || 0;
            const disabled = disabledCount || 0;

            return {
                active,
                disabled,
                total: active + disabled
            };
        } catch (error) {
            console.error('Error getting horse status counts:', error);
            return { active: 0, disabled: 0, total: 0 };
        }
    }, [session]);

    const checkLimits = useCallback(async () => {
        if (!session) {
            setLimits({
                canAddHorse: false,
                currentHorses: 0,
                maxHorses: 0,
                planName: 'Free',
                remainingSlots: 0,
                disabledHorses: 0,
                totalHorses: 0,
                hasDisabledHorses: false,
                activeHorses: 0
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get plan limits from your existing function
            const { data: planLimits, error: limitsError } = await supabase.functions.invoke('check-horse-limits');

            if (limitsError) {
                throw limitsError;
            }

            // Get detailed horse status counts
            const horseCounts = await getHorseStatusCounts();

            // Combine plan limits with horse status information
            const enhancedLimits: HorseLimits = {
                canAddHorse: planLimits.canAddHorse,
                currentHorses: planLimits.currentHorses, // This should be active horses from the function
                maxHorses: planLimits.maxHorses,
                planName: planLimits.planName,
                remainingSlots: planLimits.remainingSlots,
                // Enhanced fields
                activeHorses: horseCounts.active,
                disabledHorses: horseCounts.disabled,
                totalHorses: horseCounts.total,
                hasDisabledHorses: horseCounts.disabled > 0
            };

            setLimits(enhancedLimits);
        } catch (err) {
            console.error('Error checking horse limits:', err);
            setError(err instanceof Error ? err.message : 'Failed to check horse limits');
        } finally {
            setLoading(false);
        }
    }, [session, getHorseStatusCounts]);

    useEffect(() => {
        checkLimits();
    }, [checkLimits]);

    // Function to check if user can add a horse and show appropriate message
    const checkAndEnforce = async (): Promise<boolean> => {
        if (!limits) {
            await checkLimits();
            return false;
        }

        if (!limits.canAddHorse) {
            const maxText = limits.maxHorses === 'unlimited' ? 'unlimited' : `${limits.maxHorses}`;

            // Enhanced toast message with disabled horse information
            let description = `You've reached your horse limit (${limits.currentHorses}/${maxText}).`;
            
            if (limits.hasDisabledHorses) {
                description += ` You also have ${limits.disabledHorses} disabled horses.`;
            }
            
            description += ' Upgrade your plan to add more horses.';

            toast({
                title: "Horse Limit Reached",
                description,
                variant: "destructive",
            });

            return false;
        }

        return true;
    };

    // Function to show upgrade prompt for disabled horses
    const showDisabledHorsesPrompt = () => {
        if (!limits?.hasDisabledHorses) return;

        toast({
            title: "Horses Available for Reactivation",
            description: `You have ${limits.disabledHorses} disabled horses. Upgrade your plan to reactivate them.`,
            variant: "default",
        });
    };

    // Function to check if user has reached capacity (active + disabled >= max)
    const isAtTotalCapacity = (): boolean => {
        if (!limits || limits.maxHorses === 'unlimited') return false;
        return limits.totalHorses >= (limits.maxHorses as number);
    };

    // Function to get detailed status message
    const getStatusMessage = (): string => {
        if (!limits) return 'Loading...';

        const maxText = limits.maxHorses === 'unlimited' ? '∞' : limits.maxHorses.toString();
        
        if (limits.hasDisabledHorses) {
            return `${limits.activeHorses} active + ${limits.disabledHorses} disabled / ${maxText} total`;
        }
        
        return `${limits.activeHorses} / ${maxText} horses`;
    };

    // Function to get upgrade message based on current state
    const getUpgradeMessage = (): string | null => {
        if (!limits) return null;

        if (limits.hasDisabledHorses && !limits.canAddHorse) {
            return `You have ${limits.disabledHorses} disabled horses. Upgrade to reactivate them and add more.`;
        } else if (limits.hasDisabledHorses) {
            return `You have ${limits.disabledHorses} disabled horses. Upgrade to reactivate them.`;
        } else if (!limits.canAddHorse) {
            return `You've reached your horse limit. Upgrade to add more horses.`;
        }

        return null;
    };

    const refreshLimits = () => {
        checkLimits();
    };

    return {
        limits,
        loading,
        error,
        checkAndEnforce,
        refreshLimits,
        showDisabledHorsesPrompt,
        isAtTotalCapacity,
        getStatusMessage,
        getUpgradeMessage,
        // Convenient direct access to common properties
        canAddHorse: limits?.canAddHorse ?? false,
        currentHorses: limits?.currentHorses ?? 0,
        maxHorses: limits?.maxHorses ?? 0,
        planName: limits?.planName ?? 'Free',
        remainingSlots: limits?.remainingSlots ?? 0,
        // New convenient access properties
        disabledHorses: limits?.disabledHorses ?? 0,
        totalHorses: limits?.totalHorses ?? 0,
        hasDisabledHorses: limits?.hasDisabledHorses ?? false,
        activeHorses: limits?.activeHorses ?? 0
    };
};