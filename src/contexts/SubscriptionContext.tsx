
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  planId: string | null;
  planName: string | null;
  subscriptionEnd: string | null;
  refreshSubscription: () => Promise<void>;
  checkoutPlan: (planId: string, mode: 'monthly' | 'annual') => Promise<string | null>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  isLoading: true,
  planId: null,
  planName: null,
  subscriptionEnd: null,
  refreshSubscription: async () => {},
  checkoutPlan: async () => null,
  openCustomerPortal: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!session?.access_token) {
      setIsSubscribed(false);
      setIsLoading(false);
      setPlanId(null);
      setPlanName(null);
      setSubscriptionEnd(null);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setIsSubscribed(!!data.subscribed);
      setPlanId(data.plan_id || null);
      setPlanName(data.plan_name || null);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to check subscription status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkoutPlan = async (planId: string, mode: 'monthly' | 'annual') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, mode }
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      
      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout process',
        variant: 'destructive',
      });
      return null;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (!data?.url) throw new Error('No portal URL returned');
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open subscription management portal',
        variant: 'destructive',
      });
    }
  };

  // Check subscription when authentication state changes
  useEffect(() => {
    refreshSubscription();
  }, [session]);

  // Set up a periodic refresh
  useEffect(() => {
    if (!session) return;
    
    // Check subscription status on page load
    refreshSubscription();
    
    // Also check on URL changes (in case returning from Stripe)
    const handleRouteChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('success') || params.has('canceled')) {
        refreshSubscription();
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [session]);

  const contextValue = {
    isSubscribed,
    isLoading,
    planId,
    planName,
    subscriptionEnd,
    refreshSubscription,
    checkoutPlan,
    openCustomerPortal,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
