import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { analytics } from "@/lib/posthog";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: any | null }>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // console.log("Auth state changed:", event);
      // console.log("Current session:", currentSession);
      // console.log("App metadata:", currentSession?.user?.app_metadata);

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === "SIGNED_OUT") {
        console.log("User signed out successfully");
      } else if (event === "SIGNED_IN") {
        console.log("User signed in successfully");

        // Check what provider is being used
        if (currentSession?.user) {
          const provider = currentSession.user.app_metadata?.provider;
          console.log("Sign in provider:", provider);

          // Only track if it's NOT an email sign-in
          // Email sign-ins are already tracked in AuthForm.tsx
          if (provider === "google") {
            console.log("Tracking Google SSO sign-in");
            analytics.trackSignIn(currentSession.user.id, {
              email: currentSession.user.email,
              loginMethod: "google",
            });
          } else {
            console.log(
              "Skipping email sign-in tracking (already handled in AuthForm)"
            );
          }
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in with email:", error);
        toast({
          title: "Sign in failed",
          description:
            error.message || "There was an error signing in. Please try again.",
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/sign-in",
        },
      });

      if (error) {
        console.error("Error signing up with email:", error);
        toast({
          title: "Sign up failed",
          description:
            error.message ||
            "There was an error creating your account. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error);
        toast({
          title: "Sign in failed",
          description:
            error.message ||
            "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");

      const userId = user?.id;

      // Make sure we're clearing local state before making the API call
      setSession(null);
      setUser(null);

      // Clear any local storage items that might be related to user state
      localStorage.removeItem("supabase.auth.token");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Sign out failed",
          description: "There was an error signing out. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      // 🆕 Track sign out (will also call analytics.reset())
      analytics.trackSignOut(userId);

      console.log("User signed out successfully from Supabase");

      return;
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
