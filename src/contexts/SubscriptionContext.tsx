import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionDetails {
  id: string;
  plan_id: string;
  plan_name: string;
  is_trial: boolean;
  is_active: boolean;
  started_at: string;
  ends_at: string;
  days_remaining: number;
  expires_soon: boolean;
  stripe_subscription_id: string;
  plan_details: {
    monthly_price: number;
    annual_price: number;
  } | null;
  coupon_used: {
    code: string;
    discount_percent: number;
  } | null;
}

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  planId: string | null;
  planName: string | null;
  subscriptionEnd: string | null;
  subscriptionDetails: SubscriptionDetails | null;
  daysRemaining: number;
  expiresSoon: boolean;
  couponUsed: { code: string; discount_percent: number } | null;
  refreshSubscription: () => Promise<void>;
  checkoutPlan: (
    planId: string,
    mode: "monthly" | "annual",
    couponCode?: string
  ) => Promise<string | null>;
  validateCoupon: (couponCode: string) => Promise<{
    valid: boolean;
    discount_percent?: number;
    error?: string;
  }>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  isLoading: true,
  planId: null,
  planName: null,
  subscriptionEnd: null,
  subscriptionDetails: null,
  daysRemaining: 0,
  expiresSoon: false,
  couponUsed: null,
  refreshSubscription: async () => {},
  checkoutPlan: async () => null,
  validateCoupon: async () => ({ valid: false }),
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<SubscriptionDetails | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [expiresSoon, setExpiresSoon] = useState(false);
  const [couponUsed, setCouponUsed] = useState<{
    code: string;
    discount_percent: number;
  } | null>(null);

  const refreshSubscription = async () => {
    if (!session?.access_token) {
      setIsSubscribed(false);
      setIsLoading(false);
      setPlanId(null);
      setPlanName(null);
      setSubscriptionEnd(null);
      setSubscriptionDetails(null);
      setDaysRemaining(0);
      setExpiresSoon(false);
      setCouponUsed(null);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke(
        "check-subscription"
      );

      if (error) throw error;

      // Update state with new detailed response format
      setIsSubscribed(!!data.subscribed);

      if (data.subscription) {
        setPlanId(data.subscription.plan_id);
        setPlanName(data.subscription.plan_name);
        setSubscriptionEnd(data.subscription.ends_at);
        setSubscriptionDetails(data.subscription);
        setDaysRemaining(data.subscription.days_remaining || 0);
        setExpiresSoon(data.subscription.expires_soon || false);
        setCouponUsed(data.subscription.coupon_used);
      } else {
        setPlanId(null);
        setPlanName(null);
        setSubscriptionEnd(null);
        setSubscriptionDetails(null);
        setDaysRemaining(0);
        setExpiresSoon(false);
        setCouponUsed(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateCoupon = async (couponCode: string) => {
    if (!couponCode.trim()) {
      return { valid: false, error: "Please enter a coupon code" };
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "validate-coupon",
        {
          body: { couponCode: couponCode.trim() },
        }
      );

      if (error) {
        return { valid: false, error: error.message };
      }

      if (data.valid) {
        return {
          valid: true,
          discount_percent: data.discount_percent,
        };
      } else {
        return {
          valid: false,
          error: data.error || "Invalid coupon code",
        };
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      return { valid: false, error: "Unable to validate coupon" };
    }
  };

  const checkoutPlan = async (
    planId: string,
    mode: "monthly" | "annual",
    couponCode?: string
  ) => {
    try {
      const requestBody: any = {
        planId,
        mode: mode === "monthly" ? "subscription" : "annual",
      };

      // Add coupon code if provided
      if (couponCode?.trim()) {
        requestBody.couponCode = couponCode.trim();
      }

      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: requestBody,
        }
      );

      if (error) {
        // Handle specific coupon errors
        if (error.message.includes("Invalid coupon code")) {
          toast({
            title: "Error",
            description: "Invalid coupon code",
            variant: "destructive",
          });
        } else if (error.message.includes("expired")) {
          toast({
            title: "Error",
            description: "This coupon has expired",
            variant: "destructive",
          });
        } else if (error.message.includes("usage limit")) {
          toast({
            title: "Error",
            description: "This coupon has reached its usage limit",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to start checkout process",
            variant: "destructive",
          });
        }
        throw error;
      }

      if (!data?.url) throw new Error("No checkout URL returned");

      return data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return null;
    }
  };

  // Check subscription when authentication state changes
  useEffect(() => {
    refreshSubscription();
  }, [session?.user?.id]);

  // Set up a periodic refresh
  useEffect(() => {
    if (!session) return;

    // Check subscription status on page load
    refreshSubscription();

    // Also check on URL changes (in case returning from Stripe)
    const handleRouteChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has("success") || params.has("canceled")) {
        refreshSubscription();
      }
    };

    window.addEventListener("popstate", handleRouteChange);

    // Clean up
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [session?.user?.id]);

  const contextValue = {
    isSubscribed,
    isLoading,
    planId,
    planName,
    subscriptionEnd,
    subscriptionDetails,
    daysRemaining,
    expiresSoon,
    couponUsed,
    refreshSubscription,
    checkoutPlan,
    validateCoupon,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
