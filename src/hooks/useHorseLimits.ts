// ===== STEP 3: CREATE useHorseLimits HOOK =====
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
}

export const useHorseLimits = () => {
    const [limits, setLimits] = useState<HorseLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();
    const { toast } = useToast();

    const checkLimits = useCallback(async () => {
        if (!session) {
            setLimits({
                canAddHorse: false,
                currentHorses: 0,
                maxHorses: 0,
                planName: 'Free',
                remainingSlots: 0
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: limitsError } = await supabase.functions.invoke('check-horse-limits');
            console.log("🚀 ~ useHorseLimits ~ data:", data)

            if (limitsError) {
                throw limitsError;
            }

            setLimits(data);
        } catch (err) {
            console.error('Error checking horse limits:', err);
            setError(err instanceof Error ? err.message : 'Failed to check horse limits');
        } finally {
            setLoading(false);
        }
    }, [session]);

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

            toast({
                title: "Horse Limit Reached",
                description: `You've reached your horse limit (${limits.currentHorses}/${maxText}). Upgrade your plan to add more horses.`,
                variant: "destructive",
            });

            return false;
        }

        return true;
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
        // Convenient direct access to common properties
        canAddHorse: limits?.canAddHorse ?? false,
        currentHorses: limits?.currentHorses ?? 0,
        maxHorses: limits?.maxHorses ?? 0,
        planName: limits?.planName ?? 'Free',
        remainingSlots: limits?.remainingSlots ?? 0
    };
};