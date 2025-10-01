// hooks/useAnalysisLimit.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisLimitReturn {
  limits: {
    canAnalyze: boolean;
    currentAnalyses: number;
    maxAnalyses: number | "unlimited";
    planName: string;
    remainingAnalyses: number | "unlimited";
  };
  loading: boolean;
  error: string | null;
  canAnalyze: boolean;
  currentAnalyses: number;
  maxAnalyses: number | "unlimited";
  planName: string;
  remainingAnalyses: number | "unlimited";
  refresh: () => void;
}

export const useAnalysisLimit = (): AnalysisLimitReturn => {
  const [limit, setLimit] = useState<number>(0);
  const [used, setUsed] = useState<number>(0);
  const [planName, setPlanName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisLimit();
  }, []);

  const fetchAnalysisLimit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error:', authError);
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      // Get user's subscription and plan details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('plan_id, pricing_plans(analysis_limit, name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to fetch subscription');
        setLoading(false);
        return;
      }

      const analysisLimit = subscriptionData?.pricing_plans?.analysis_limit || 0;
      const planNameValue = subscriptionData?.pricing_plans?.name || "No plan subscribed";

      // Get current month usage
      const currentMonth = new Date().toISOString().substring(0, 7);

      const { data: usageData, error: usageError } = await supabase
        .from('analysis_usage')
        .select('analysis_count')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      if (usageError) {
        console.error('Error fetching usage data:', usageError);
      }

      setLimit(analysisLimit);
      setUsed(usageData?.analysis_count || 0);
      setPlanName(planNameValue);
    } catch (error) {
      console.error('Error in fetchAnalysisLimit:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchAnalysisLimit();
  };

  const maxAnalyses = limit === -1 ? "unlimited" : limit;
  const currentAnalyses = used;
  const remainingAnalyses = limit === -1 ? "unlimited" : Math.max(0, limit - used);
  const canAnalyze = limit === -1 || used < limit;

  return {
    limits: {
      canAnalyze,
      currentAnalyses,
      maxAnalyses,
      planName,
      remainingAnalyses,
    },
    loading,
    error,
    canAnalyze,
    currentAnalyses,
    maxAnalyses,
    planName,
    remainingAnalyses,
    refresh,
  };
};