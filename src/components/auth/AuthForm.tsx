import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { ActivityLogger } from "@/utils/activityTracker";

const AuthForm = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(
    searchParams.get("signup") === "true"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // SSO status tracking
  const [isProcessingSSO, setIsProcessingSSO] = useState(false);

  // Password reset state
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsSignUp(searchParams.get("signup") === "true");
  }, [searchParams]);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormErrors({});
    setIsResetPassword(false);
    setResetEmailSent(false);
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string; name?: string } = {};

    // Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation (not required for password reset)
    if (!isResetPassword) {
      if (!password) {
        errors.password = "Password is required";
      } else if (isSignUp) {
        if (password.length < 8) {
          errors.password = "Password must be at least 8 characters";
        }
      }
    }

    // Name validation (only for sign up)
    if (isSignUp && !name) {
      errors.name = "Full name is required";
    }

    return errors;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setFormErrors({ email: "Email is required" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (isSignUp) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          try {
            // 🆕 Assign Free plan to new user
            const { data: freePlan, error: planError } = await supabase
              .from("pricing_plans")
              .select("id")
              .eq("is_default", true)
              .single();

            if (!planError && freePlan) {
              const { error: subError } = await supabase
                .from("user_subscriptions")
                .insert({
                  user_id: data.user.id,
                  plan_id: freePlan.id,
                  is_active: true,
                  is_trial: false,
                  started_at: new Date().toISOString(),
                });

              if (subError) {
                console.error("Failed to assign free plan:", subError);
                // Don't throw - let signup succeed anyway
              } else {
                console.log("✅ Free plan assigned successfully");
              }
            }

            // Log activity
            await ActivityLogger.userRegistered(name || email);
            console.log(
              "✅ User registration activity logged for:",
              name || email
            );
          } catch (activityError) {
            console.error("Failed to log activity:", activityError);
            // Don't throw - continue with signup
          }

          toast({
            title: "Welcome to AI Dressage Trainer!",
            description:
              "Please check your email and click the confirmation link to verify your account.",
          });

          navigate("/dashboard");
        }
      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Signed in successfully!",
          description: "Welcome back to AI Dressage Trainer.",
        });

        // Redirect to dashboard after login
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSSOAuth = async (provider: Provider) => {
    setIsProcessingSSO(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;

      // The user will be redirected to the provider's authentication page
    } catch (error) {
      console.error("SSO authentication error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "SSO Authentication Failed";
      toast({
        title: "SSO Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessingSSO(false);
    }
  };

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Handle back button for password reset
  const handleBackToSignIn = () => {
    setIsResetPassword(false);
    setResetEmailSent(false);
  };

  // Render password reset form
  if (isResetPassword) {
    return (
      <section className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-silver-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <AnimatedSection animation="fade-in" className="text-center">
            <h1 className="text-3xl font-serif font-semibold text-navy-900">
              Reset your password
            </h1>
            <p className="mt-2 text-navy-700">
              {resetEmailSent
                ? "Check your email for reset instructions"
                : "Enter your email address to receive a password reset link"}
            </p>
          </AnimatedSection>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <AnimatedSection animation="fade-in" delay="delay-100">
            <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-silver-100">
              <button
                onClick={handleBackToSignIn}
                className="flex items-center text-navy-600 hover:text-navy-800 mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </button>

              {!resetEmailSent ? (
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-navy-800"
                    >
                      Email address
                    </label>
                    <div className="mt-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full ${
                          formErrors.email ? "border-red-500" : ""
                        }`}
                        aria-invalid={formErrors.email ? "true" : "false"}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full bg-navy-700 hover:bg-navy-800 py-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending reset email...
                        </>
                      ) : (
                        <>Send reset instructions</>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border-green-200 border p-4 rounded-md">
                    <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800">
                      Password reset email sent! Check your inbox for
                      instructions.
                    </p>
                  </div>

                  <Button
                    onClick={handleBackToSignIn}
                    variant="outline"
                    className="mt-4"
                  >
                    Return to sign in
                  </Button>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-silver-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatedSection animation="fade-in" className="text-center">
          <h1 className="text-3xl font-serif font-semibold text-navy-900">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h1>
          <p className="mt-2 text-navy-700">
            {isSignUp
              ? "Join AI Dressage Trainer to start your journey"
              : "Welcome back! Please enter your details"}
          </p>
        </AnimatedSection>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AnimatedSection animation="fade-in" delay="delay-100">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-silver-100">
            {/* SSO Buttons Section - Only Google */}
            <div className="space-y-4 mb-8">
              <Button
                type="button"
                className="w-full bg-white text-navy-700 border border-silver-300 hover:bg-silver-50"
                disabled={isProcessingSSO}
                onClick={() => handleSSOAuth("google")}
              >
                {isProcessingSSO ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5 mr-2"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                        fill="#34A853"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-silver-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-navy-600">
                  Or continue with email
                </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-navy-800"
                  >
                    Full Name
                  </label>
                  <div className="mt-1">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full ${
                        formErrors.name ? "border-red-500" : ""
                      }`}
                      aria-invalid={formErrors.name ? "true" : "false"}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-navy-800"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    aria-invalid={formErrors.email ? "true" : "false"}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-navy-800"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`w-full pr-10 ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                    aria-invalid={formErrors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-navy-600 hover:text-navy-800"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {isSignUp && passwordFocused && (
                  <div className="mt-2 p-3 bg-navy-50 rounded-md">
                    <p className="text-sm font-medium text-navy-800 mb-2">
                      Password must contain:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        {hasMinLength ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            hasMinLength ? "text-navy-800" : "text-navy-600"
                          }
                        >
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center">
                        {hasUpperCase ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            hasUpperCase ? "text-navy-800" : "text-navy-600"
                          }
                        >
                          At least one uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center">
                        {hasLowerCase ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            hasLowerCase ? "text-navy-800" : "text-navy-600"
                          }
                        >
                          At least one lowercase letter
                        </span>
                      </li>
                      <li className="flex items-center">
                        {hasNumber ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            hasNumber ? "text-navy-800" : "text-navy-600"
                          }
                        >
                          At least one number
                        </span>
                      </li>
                      <li className="flex items-center">
                        {hasSpecialChar ? (
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span
                          className={
                            hasSpecialChar ? "text-navy-800" : "text-navy-600"
                          }
                        >
                          At least one special character
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-me" />
                      <label
                        htmlFor="remember-me"
                        className="text-sm text-navy-700"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => setIsResetPassword(true)}
                      className="font-medium text-navy-600 hover:text-navy-800"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full bg-navy-700 hover:bg-navy-800 py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating account..." : "Signing in..."}
                    </>
                  ) : (
                    <>{isSignUp ? "Create Account" : "Sign In"}</>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-navy-700">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 font-medium text-navy-600 hover:text-navy-800"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default AuthForm;
