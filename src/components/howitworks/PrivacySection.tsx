import React from "react";
import AnimatedSection from "../ui/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacySection = () => {
  const { language } = useLanguage();

  return (
    <AnimatedSection animation="fade-in" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-8 text-purple-900">
            {language === "en"
              ? "Your Privacy Matters"
              : "Su privacidad es importante"}
          </h2>

          <p className="text-lg text-gray-700 mb-4">
            {language === "en"
              ? "Your privacy is our priority. All videos and scores you upload are securely stored and only accessible by you. You're always in control of who sees your content — whether it's just you or shared with a coach."
              : "Tu privacidad es nuestra prioridad. Todos los videos y puntuaciones que subes se almacenan de forma segura y solo tú puedes acceder a ellos. Siempre tienes el control sobre quién ve tu contenido, ya sea solo tú o compartido con un entrenador."}
          </p>

          <p className="text-lg text-gray-700">
            {language === "en"
              ? "Our AI analyzes your footage automatically, with no human review unless you choose it. We never use your data for anything else without your permission."
              : "Nuestra IA analiza tu material automáticamente, sin revisión humana a menos que tú lo decidas. Nunca usamos tus datos para ningún otro fin sin tu permiso."}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default PrivacySection;
