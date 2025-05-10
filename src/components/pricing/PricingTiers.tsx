import { useState } from "react";
import { Check } from "lucide-react";
import PricingToggle from "./PricingToggle";
import AnimatedSection from "../ui/AnimatedSection";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import EmailSignupForm from "./EmailSignupForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  tagline: {
    en: string;
    es: string;
  };
  monthlyPrice: number;
  annualPrice: number;
  features: {
    text: {
      en: string;
      es: string;
    };
    included: boolean;
  }[];
  highlighted?: boolean;
  buttonText: {
    en: string;
    es: string;
  };
}

const PricingTiers = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { language, translations } = useLanguage();
  const t = translations[language];

  const plans: Plan[] = [
    {
      id: "basic",
      name: language === "en" ? "Basic" : "Básico",
      tagline: {
        en: "Try before you commit with one free test included",
        es: "Prueba antes de comprometerte con una prueba gratuita incluida",
      },
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      features: [
        {
          text: {
            en: "First score sheet analysis FREE",
            es: "Primer análisis de hoja de puntuación GRATIS",
          },
          included: true,
        },
        {
          text: {
            en: "1 additional score sheet upload per month",
            es: "1 carga adicional de hoja de puntuación al mes",
          },
          included: true,
        },
        {
          text: {
            en: "Basic performance analysis",
            es: "Análisis básico de rendimiento",
          },
          included: true,
        },
        {
          text: {
            en: "Core exercise recommendations",
            es: "Recomendaciones de ejercicios básicos",
          },
          included: true,
        },
        {
          text: {
            en: "Single horse profile",
            es: "Perfil de un solo caballo",
          },
          included: true,
        },
        {
          text: {
            en: "Email support",
            es: "Soporte por correo electrónico",
          },
          included: true,
        },
        {
          text: {
            en: "Advanced analytics dashboard",
            es: "Panel de análisis avanzado",
          },
          included: false,
        },
        {
          text: {
            en: "Training progress tracking",
            es: "Seguimiento del progreso del entrenamiento",
          },
          included: false,
        },
        {
          text: {
            en: "Custom training programs",
            es: "Programas de entrenamiento personalizados",
          },
          included: false,
        },
        {
          text: {
            en: "Trainer collaboration tools",
            es: "Herramientas de colaboración para entrenadores",
          },
          included: false,
        },
      ],
      buttonText: {
        en: "Get Started",
        es: "Comenzar",
      },
    },
    {
      id: "premium",
      name: language === "en" ? "Premium" : "Premium",
      tagline: {
        en: "Ideal for dedicated riders seeking comprehensive training support",
        es: "Ideal para jinetes dedicados que buscan apoyo de entrenamiento integral",
      },
      monthlyPrice: 19.99,
      annualPrice: 15.99,
      highlighted: true,
      features: [
        {
          text: {
            en: "First score sheet analysis FREE",
            es: "Primer análisis de hoja de puntuación GRATIS",
          },
          included: true,
        },
        {
          text: {
            en: "3 additional score sheet uploads per month",
            es: "3 cargas adicionales de hoja de puntuación al mes",
          },
          included: true,
        },
        {
          text: {
            en: "Detailed performance analysis",
            es: "Análisis detallado de rendimiento",
          },
          included: true,
        },
        {
          text: {
            en: "Full exercise library access",
            es: "Acceso completo a la biblioteca de ejercicios",
          },
          included: true,
        },
        {
          text: {
            en: "Up to 3 horse profiles",
            es: "Hasta 3 perfiles de caballos",
          },
          included: true,
        },
        {
          text: {
            en: "Priority email support",
            es: "Soporte prioritario por correo electrónico",
          },
          included: true,
        },
        {
          text: {
            en: "Advanced analytics dashboard",
            es: "Panel de análisis avanzado",
          },
          included: true,
        },
        {
          text: {
            en: "Training progress tracking",
            es: "Seguimiento del progreso del entrenamiento",
          },
          included: true,
        },
        {
          text: {
            en: "Custom training programs",
            es: "Programas de entrenamiento personalizados",
          },
          included: true,
        },
        {
          text: {
            en: "Trainer collaboration tools",
            es: "Herramientas de colaboración para entrenadores",
          },
          included: false,
        },
      ],
      buttonText: {
        en: "Get Started",
        es: "Comenzar",
      },
    },
    {
      id: "professional",
      name: language === "en" ? "Professional" : "Profesional",
      tagline: {
        en: "Designed for trainers and professional riders managing multiple horses",
        es: "Diseñado para entrenadores y jinetes profesionales que gestionan múltiples caballos",
      },
      monthlyPrice: 39.99,
      annualPrice: 31.99,
      features: [
        {
          text: {
            en: "First score sheet analysis FREE",
            es: "Primer análisis de hoja de puntuación GRATIS",
          },
          included: true,
        },
        {
          text: {
            en: "Unlimited score sheet uploads",
            es: "Cargas ilimitadas de hojas de puntuación",
          },
          included: true,
        },
        {
          text: {
            en: "Comprehensive analysis suite",
            es: "Suite de análisis integral",
          },
          included: true,
        },
        {
          text: {
            en: "Full exercise library access",
            es: "Acceso completo a la biblioteca de ejercicios",
          },
          included: true,
        },
        {
          text: {
            en: "Unlimited horse profiles",
            es: "Perfiles de caballos ilimitados",
          },
          included: true,
        },
        {
          text: {
            en: "Priority phone support",
            es: "Soporte telefónico prioritario",
          },
          included: true,
        },
        {
          text: {
            en: "Advanced analytics dashboard",
            es: "Panel de análisis avanzado",
          },
          included: true,
        },
        {
          text: {
            en: "Training progress tracking",
            es: "Seguimiento del progreso del entrenamiento",
          },
          included: true,
        },
        {
          text: {
            en: "Custom training programs",
            es: "Programas de entrenamiento personalizados",
          },
          included: true,
        },
        {
          text: {
            en: "Trainer collaboration tools",
            es: "Herramientas de colaboración para entrenadores",
          },
          included: true,
        },
        {
          text: {
            en: "API access for integrations",
            es: "Acceso a API para integraciones",
          },
          included: true,
        },
      ],
      buttonText: {
        en: "Get Started",
        es: "Comenzar",
      },
    },
  ];

  return (
    <section className="py-24 bg-white">
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

        <PricingToggle onChange={setIsAnnual} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <AnimatedSection
              key={plan.id}
              animation="fade-in"
              delay={`delay-${(index + 1) * 100}` as any}
              className={`relative ${
                plan.highlighted ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              <div
                className={`h-full rounded-xl p-8 flex flex-col relative z-10 ${
                  plan.highlighted
                    ? "border-2 border-purple-600 shadow-xl bg-white"
                    : "border border-silver-200 bg-white shadow-md"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute top-0 left-0 right-0 -translate-y-1/2 mx-auto w-max bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded-full text-white font-semibold shadow-md pricing-badge">
                    {t["most-popular"]}
                  </Badge>
                )}

                <div className="mb-5">
                  <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-4">
                    {plan.name}
                  </h2>

                  <p className="text-gray-700 mb-5 text-sm h-12">
                    {plan.tagline[language]}
                  </p>

                  {/* Aligned pricing section with fixed height */}
                  <div className="flex items-baseline mb-2 h-10">
                    <span className="text-4xl font-bold text-navy-900">
                      £{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-600 ml-2 text-base">
                      /{language === "en" ? "month" : "mes"}
                    </span>
                  </div>

                  {isAnnual && (
                    <p className="text-sm text-gray-600 mb-6 h-5">
                      {t["billed-annually"]} (£
                      {(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12}/
                      {t["year"]})
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
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
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
                            {feature.text[language]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Fixed button position at the bottom */}
                <div className="mt-10">
                  <Button
                    className="w-full py-6 rounded-lg text-base h-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all duration-300"
                  >
                    {plan.buttonText[language]}
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection
          animation="fade-in"
          className="mt-20 bg-purple-50 rounded-xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-4">
                {t["faq-title"]}
              </h2>

              <div className="space-y-6 mt-8">
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    {language === "en"
                      ? "How does the free trial work?"
                      : "¿Cómo funciona la prueba gratuita?"}
                  </h3>
                  <p className="text-gray-700">
                    {language === "en"
                      ? "You can upload one dressage test score sheet for free analysis after creating an account. No credit card required to get started."
                      : "Puedes cargar una hoja de puntuación de prueba de doma para análisis gratuito después de crear una cuenta. No se requiere tarjeta de crédito para comenzar."}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    {language === "en"
                      ? "Can I switch plans later?"
                      : "¿Puedo cambiar de plan más tarde?"}
                  </h3>
                  <p className="text-gray-700">
                    {language === "en"
                      ? "Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be applied immediately."
                      : "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios en tu suscripción se aplicarán inmediatamente."}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    {language === "en"
                      ? "Are there any additional fees?"
                      : "¿Hay alguna tarifa adicional?"}
                  </h3>
                  <p className="text-gray-700">
                    {language === "en"
                      ? "No, the listed price includes all features for that plan. There are no hidden fees or additional charges."
                      : "No, el precio indicado incluye todas las características para ese plan. No hay tarifas ocultas ni cargos adicionales."}
                  </p>
                </div>
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

                <div className="flex justify-center">
                  <Link to="mailto:info@aiequestrian.com">
                    <Button
                      variant="outline"
                      className="bg-transparent border border-purple-600 text-purple-700 py-3 rounded-lg font-medium transition-colors hover:bg-purple-50 h-auto"
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
