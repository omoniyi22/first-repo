import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import PricingToggle from "./PricingToggle";
import AnimatedSection from "../ui/AnimatedSection";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import EmailSignupForm from "./EmailSignupForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  tagline_en: string;
  tagline_es: string;
  is_highlighted: boolean;
  button_text_en: string;
  button_text_es: string;
  features: PricingFeature[];
}

interface PricingFeature {
  id: string;
  plan_id: string;
  text_en: string;
  text_es: string;
  included: boolean;
  display_order: number;
}

const PricingTiers = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { language, translations } = useLanguage();
  const { session } = useAuth();
  const {
    isSubscribed,
    planId,
    isLoading: subscriptionLoading,
    checkoutPlan,
    openCustomerPortal,
    planName,
  } = useSubscription();
  const { toast } = useToast();
  const t = translations[language];

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setIsLoading(true);

        // Fetch pricing plans
        const { data: plansData, error: plansError } = await supabase
          .from("pricing_plans")
          .select("*")
          .order("created_at");

        if (plansError) {
          console.error("Error fetching pricing plans:", plansError);
          return;
        }

        // Fetch plan features
        const { data: featuresData, error: featuresError } = await supabase
          .from("pricing_features")
          .select("*")
          .order("display_order");

        if (featuresError) {
          console.error("Error fetching features:", featuresError);
          return;
        }

        // Organize data
        const formattedPlans: PricingPlan[] = plansData.map((plan) => ({
          ...plan,
          features: featuresData
            .filter((feature) => feature.plan_id === plan.id)
            .sort((a, b) => a.display_order - b.display_order),
        }));

        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error loading pricing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingData();

    // Check URL parameters for Stripe return status
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("success") === "true") {
      alert("Subscription Successful!");
      toast({
        title:
          language === "en"
            ? "Subscription Successful!"
            : "¡Suscripción Exitosa!",
        description:
          language === "en"
            ? "Your subscription has been activated"
            : "Tu suscripción ha sido activada",
        variant: "default",
      });

      // Clean up the URL
      // window.history.replaceState({}, document.title, window.location.pathname);
    } else if (searchParams.get("canceled") === "true") {
      toast({
        title:
          language === "en" ? "Subscription Canceled" : "Suscripción Cancelada",
        description:
          language === "en"
            ? "Your subscription was not completed"
            : "Tu suscripción no fue completada",
        variant: "default",
      });

      // Clean up the URL
      // window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleToggle = (annual: boolean) => {
    setIsAnnual(annual);
  };

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (!session) {
      setShowLoginDialog(true);
      return;
    }

    if (isSubscribed && planId === plan.id) {
      // User is already subscribed to this plan - open management portal
      openCustomerPortal();
      return;
    }

    try {
      setCheckingOut(true);
      const checkoutUrl = await checkoutPlan(
        plan.id,
        isAnnual ? "annual" : "monthly"
      );

      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      }
    } finally {
      setCheckingOut(false);
    }
  };

  if (isLoading || subscriptionLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-navy-900 mb-6">
            {t["simple-pricing"]}
          </h1>
          <p className="text-lg text-gray-700">{t["try-free"]}</p>
        </AnimatedSection>

        <PricingToggle onChange={handleToggle} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = isSubscribed && planId === plan.id;

            return (
              <AnimatedSection
                key={plan.id}
                animation="fade-in"
                delay={`delay-${(index + 1) * 100}` as any}
                className={`relative ${
                  plan.is_highlighted ? "md:-mt-4 md:mb-4" : ""
                }`}
              >
                <div
                  className={`h-full rounded-xl p-8 flex flex-col relative z-10 ${
                    isCurrentPlan
                      ? "border-2 border-green-600 shadow-xl bg-white"
                      : plan.is_highlighted
                      ? "border-2 border-purple-600 shadow-xl bg-white"
                      : "border border-silver-200 bg-white shadow-md"
                  }`}
                >
                  {isCurrentPlan && (
                    <Badge className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-max bg-green-700 hover:bg-green-800 px-3 py-1 rounded-full text-white font-semibold shadow-md pricing-badge">
                      {language === "en" ? "Current Plan" : "Plan Actual"}
                    </Badge>
                  )}

                  {!isCurrentPlan && plan.is_highlighted && (
                    <Badge className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-max bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded-full text-white font-semibold shadow-md pricing-badge">
                      {t["most-popular"]}
                    </Badge>
                  )}

                  <div className="mb-5">
                    <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-4">
                      {plan.name}
                    </h2>

                    <p className="text-gray-700 mb-5 text-sm h-12">
                      {language === "en" ? plan.tagline_en : plan.tagline_es}
                    </p>

                    {/* Aligned pricing section with fixed height */}
                    <div className="flex items-baseline mb-2 h-10">
                      <span className="text-4xl font-bold text-navy-900">
                        £{isAnnual ? plan.annual_price : plan.monthly_price}
                      </span>
                      <span className="text-gray-600 ml-2 text-base">
                        /{language === "en" ? "month" : "mes"}
                      </span>
                    </div>

                    {isAnnual && (
                      <p className="text-sm text-gray-600 mb-6 h-5">
                        {t["billed-annually"]} (£
                        {(isAnnual ? plan.annual_price : plan.monthly_price) *
                          12}
                        /{t["year"]})
                      </p>
                    )}
                  </div>

                  {/* Features section pushed lower for alignment */}
                  <div className="flex-grow">
                    <div className="space-y-5">
                      <h3 className="font-medium text-navy-900 border-b border-silver-200 pb-3">
                        {t["features-include"]}
                      </h3>

                      <ul className="space-y-4">
                        {plan.features.map((feature) => (
                          <li
                            key={feature.id}
                            className={`flex items-start ${
                              !feature.included ? "opacity-60" : ""
                            }`}
                          >
                            <Check
                              className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                                feature.included
                                  ? "text-purple-600"
                                  : "text-silver-400"
                              }`}
                            />
                            <span className="text-sm text-gray-700">
                              {language === "en"
                                ? feature.text_en
                                : feature.text_es}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Fixed button position at the bottom */}
                  <div className="mt-10">
                    <Button
                      className={`w-full py-6 rounded-lg text-base h-auto font-medium transition-all duration-300 ${
                        isCurrentPlan
                          ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                          : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                      disabled={checkingOut}
                    >
                      {checkingOut ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-5 w-5 mr-3 rounded-full border-2 border-t-transparent"></div>
                          {language === "en"
                            ? "Processing..."
                            : "Procesando..."}
                        </div>
                      ) : isCurrentPlan ? (
                        language === "en" ? (
                          "Manage Subscription"
                        ) : (
                          "Gestionar Suscripción"
                        )
                      ) : language === "en" ? (
                        plan.button_text_en
                      ) : (
                        plan.button_text_es
                      )}
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === "en"
                  ? "Sign in required"
                  : "Inicio de sesión requerido"}
              </DialogTitle>
              <DialogDescription>
                {language === "en"
                  ? "Please sign in to subscribe to this plan. You'll be redirected to the sign in page."
                  : "Por favor, inicia sesión para suscribirte a este plan. Serás redirigido a la página de inicio de sesión."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowLoginDialog(false)}
              >
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button
                onClick={() => {
                  setShowLoginDialog(false);
                  window.location.href = "/sign-in?redirect=/pricing";
                }}
              >
                {language === "en" ? "Sign In" : "Iniciar Sesión"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AnimatedSection
          animation="fade-in"
          className="mt-20 bg-purple-50 rounded-xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center ">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-4">
                {language === "en"
                  ? "Not sure which plan is right for you?"
                  : "¿No estás segura de qué plan es adecuado para ti?"}
              </h2>

              <div className="space-y-6 mt-8">
                <p className="text-gray-700">
                  {language === "en"
                    ? `We get it,every athlete’s journey is different. If you’re
                    unsure which option fits your goals best, just drop us a
                    message. Whether you're training solo or with a coach, we’ll
                    help you pick the perfect plan to support your progress.`
                    : "Lo entendemos, la trayectoria de cada atleta es diferente. Si no estás seguro de qué opción se adapta mejor a tus objetivos, escríbenos. Tanto si entrenas solo como con un entrenador, te ayudaremos a elegir el plan perfecto para impulsar tu progreso."}
                </p>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-8 border border-silver-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <svg
                      className="h-6 w-6 text-purple-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.5 3.5 0 1113 13.355z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif font-medium text-navy-900">
                    {t["help-choosing"]}
                  </h3>
                </div>

                <p className="text-gray-700 mb-8">{t["help-text"]}</p>

                <div className="flex justify-start">
                  <Link to="mailto:info@equineaintelligence.com">
                    <Button
                      variant="outline"
                      className="bg-transparent border border-purple-600 text-purple-700 py-3 rounded-lg font-medium transition-colors hover:bg-purple-50 hover:text-purple-700 h-auto"
                    >
                      {t["contact-support"]}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingTiers;
