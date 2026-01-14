import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const DisciplineSelector = () => {
  const { language } = useLanguage();

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Dressage Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl overflow-hidden shadow-lg text-white">
        <div className="p-8">
          <h3 className="text-2xl font-serif font-medium mb-4">
            {language === "en"
              ? "AI Dressage Trainer"
              : "Entrenador de Doma IA"}
          </h3>
          <p className="mb-6 text-white">
            {language === "en"
              ? "Transform your dressage performance with AI-powered analysis of test scores, videos, and receive personalized training recommendations."
              : "Transforma tu rendimiento en doma con análisis impulsado por IA de puntuaciones de prueba, videos, y recibe recomendaciones de entrenamiento personalizadas."}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-medium text-sm">
                1
              </div>
              <p className="text-white">
                {language === "en"
                  ? "Upload dressage test videos or score sheets"
                  : "Sube videos de pruebas de doma o hojas de puntuación"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-medium text-sm">
                2
              </div>
              <p className="text-white">
                {language === "en"
                  ? "Receive detailed AI analysis of movements and transitions"
                  : "Recibe análisis detallado de IA de movimientos y transiciones"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-medium text-sm">
                3
              </div>
              <p className="text-white">
                {language === "en"
                  ? "Follow personalized training recommendations"
                  : "Sigue recomendaciones de entrenamiento personalizadas"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="secondary"
              className="w-full bg-white hover:bg-gray-100 text-purple-700"
            >
              {language === "en"
                ? "Start Your Free Trial"
                : "Comienza tu Prueba Gratuita"}
            </Button>
            <Link
              to="/dressage/how-it-works"
              className="text-sm text-white/80 hover:text-white"
            >
              {language === "en"
                ? "Learn More About AI Dressage Trainer"
                : "Aprende Más Sobre el Entrenador de Doma IA"}
            </Link>
          </div>
        </div>
      </div>

      {/* Jumping Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl overflow-hidden shadow-lg text-white">
        <div className="p-8">
          <h3 className="text-2xl font-serif font-medium mb-4">
            {language === "en"
              ? "AI Jumping Trainer"
              : "Entrenador de Salto IA"}
          </h3>
          <p className="mb-6 text-white">
            {language === "en"
              ? "Elevate your jumping performance with AI-powered video analysis, course insights, and personalized training recommendations."
              : "Eleva tu rendimiento en salto con análisis de video impulsado por IA, insights del recorrido, y recomendaciones de entrenamiento personalizadas."}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium text-sm">
                1
              </div>
              <p className="text-white">
                {language === "en"
                  ? "Upload videos of your jumping rounds or training sessions"
                  : "Sube videos de tus rondas de salto o sesiones de entrenamiento"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium text-sm">
                2
              </div>
              <p className="text-white">
                {language === "en"
                  ? "Get analyzed insights on approach, takeoff, and landing"
                  : "Obtén insights analizados sobre aproximación, despegue y aterrizaje"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-medium text-sm">
                3
              </div>
              <p className="text-white">
                {language === "en"
                  ? "Implement targeted exercises to improve technique"
                  : "Implementa ejercicios específicos para mejorar la técnica"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="secondary"
              className="w-full bg-white hover:bg-gray-100 text-blue-700"
            >
              {language === "en"
                ? "Start Your Free Trial"
                : "Comienza tu Prueba Gratuita"}
            </Button>
            <Link
              to="/jumping/how-it-works"
              className="text-sm text-white/80 hover:text-white"
            >
              {language === "en"
                ? "Learn More About AI Jumping Trainer"
                : "Aprende Más Sobre el Entrenador de Salto IA"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisciplineSelector;
