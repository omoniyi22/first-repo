// src/hooks/useDocumentLimits.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentLimits {
    canUploadDocument: boolean;
    currentDocuments: number;
    maxDocuments: string | number;
    planName: string;
    remainingDocuments: string | number;
}

export const useDocumentLimits = () => {
    const [limits, setLimits] = useState<DocumentLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();
    const { toast } = useToast();

    const checkLimits = useCallback(async () => {
        if (!session) {
            setLimits({
                canUploadDocument: false,
                currentDocuments: 0,
                maxDocuments: 0,
                planName: 'Free',
                remainingDocuments: 0
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data, error: limitsError } = await supabase.functions.invoke('check-document-limits');

            if (limitsError) {
                throw limitsError;
            }

            setLimits(data);
        } catch (err) {
            console.error('Error checking document limits:', err);
            setError(err instanceof Error ? err.message : 'Failed to check document limits');
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        checkLimits();
    }, [checkLimits]);

    // Function to check if user can upload a document and show appropriate message
    const checkAndEnforce = async (): Promise<boolean> => {
        if (!limits) {
            await checkLimits();
            return false;
        }

        if (!limits.canUploadDocument) {
            const maxText = limits.maxDocuments === 'unlimited' ? 'unlimited' : `${limits.maxDocuments}`;

            toast({
                title: "Document Limit Reached",
                description: `You've reached your monthly document limit (${limits.currentDocuments}/${maxText}). Upgrade your plan to upload more documents.`,
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
        canUploadDocument: limits?.canUploadDocument ?? false,
        currentDocuments: limits?.currentDocuments ?? 0,
        maxDocuments: limits?.maxDocuments ?? 0,
        planName: limits?.planName ?? 'No plan subscribed',
        remainingDocuments: limits?.remainingDocuments ?? 0
    };
};