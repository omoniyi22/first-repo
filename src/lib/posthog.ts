// src/lib/posthog.ts
import posthog from 'posthog-js';

// ==========================================
// INITIALIZATION
// ==========================================

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(
      import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
      {
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            posthog.opt_out_capturing(); // Don't track in dev
          }
        }
      }
    );
  }
};

// ==========================================
// USER IDENTIFICATION
// ==========================================

interface UserProperties {
  email?: string;
  name?: string;
  plan?: string;
  createdAt?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Identify a user in PostHog
 */
export const identifyUser = (userId: string, properties?: UserProperties) => {
  if (typeof window !== 'undefined' && userId) {
    posthog.identify(userId, properties);
  }
};

/**
 * Reset user identification (call on logout)
 */
export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
};

// ==========================================
// AUTH EVENT TRACKING
// ==========================================

/**
 * Track user sign up
 */
export const trackSignUp = (userId: string, properties?: UserProperties) => {
  if (typeof window !== 'undefined') {
    posthog.capture('user_signed_up', {
      userId,
      ...properties,
      timestamp: new Date().toISOString(),
    });

    // Identify the user immediately after signup
    identifyUser(userId, properties);
  }
};

/**
 * Track user sign in
 */
export const trackSignIn = (userId: string, properties?: UserProperties) => {
  if (typeof window !== 'undefined') {
    posthog.capture('user_signed_in', {
      userId,
      ...properties,
      timestamp: new Date().toISOString(),
    });

    // Identify the user
    identifyUser(userId, properties);
  }
};

/**
 * Track user sign out
 */
export const trackSignOut = (userId?: string) => {
  if (typeof window !== 'undefined') {
    posthog.capture('user_signed_out', {
      userId,
      timestamp: new Date().toISOString(),
    });

    // Reset user identification
    resetUser();
  }
};




// Subscription events
export const trackSubscriptionUpgraded = (planName: string, planPrice: number, previousPlan: string) => {
  if (typeof window !== 'undefined') {
    posthog.capture('subscription_upgraded', {
      planName,
      planPrice,
      previousPlan,
      conversionValue: planPrice,
      timestamp: new Date().toISOString(),
    });
  }
};




// ==========================================
// PAGE TRACKING
// ==========================================

/**
 * Manually track page views
 */
export const trackPageView = (path?: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      path: path || window.location.pathname,
      ...properties,
    });
  }
};

// ==========================================
// CUSTOM EVENT TRACKING
// ==========================================

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

export const analytics = {
  init: initPostHog,
  identify: identifyUser,
  reset: resetUser,
  trackSignUp,
  trackSignIn,
  trackSignOut,
  trackSubscriptionUpgraded,
  trackPageView,
  trackEvent,
  posthog: posthog,
};

export { posthog };