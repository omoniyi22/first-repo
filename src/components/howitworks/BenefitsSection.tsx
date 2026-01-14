import React from "react";
import {
  FileText,
  Users,
  Calendar,
  BarChart3,
  Award,
  LayoutDashboard,
} from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

interface BenefitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BenefitCard = ({ title, description, icon }: BenefitCardProps) => {
  const { language } = useLanguage();

  return (
    <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-sm transition-shadow duration-300 relative overflow-hidden w-full md:w-1/3 lg:w-1/4">
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

      <div className="mb-5 h-14 w-14 bg-white rounded-full flex items-center justify-center text-purple-600">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium mb-3 text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const BenefitsSection = () => {
  const { language } = useLanguage();

  const benefits = [
    {
      title:
        language === "en" ? "Performance Analysis" : "Análisis de Rendimiento",
      description:
        language === "en"
          ? "Get instant, AI-powered feedback and trends from your dressage and jumping videos."
          : "Obtén retroalimentación instantánea e insights impulsados por IA de tus videos de doma y salto.",
      icon: <BarChart3 size={24} />,
    },
    {
      title:
        language === "en"
          ? "Personalized Training"
          : "Entrenamiento Personalizado",
      description:
        language === "en"
          ? "Unlock personalized training suggestions tailored to your performance and goals."
          : "Desbloquea sugerencias de entrenamiento personalizadas adaptadas a tu rendimiento y objetivos.",
      icon: <FileText size={24} />,
    },
    {
      title: language === "en" ? "Horse Management" : "Gestión de Caballos",
      description:
        language === "en"
          ? "Easily track and manage progress for each of your horses in one place."
          : "Rastrea y gestiona fácilmente el progreso de cada uno de tus caballos en un solo lugar.",
      icon: <Award size={24} />,
    },
    {
      title: language === "en" ? "User Dashboard" : "Panel de Usuario",
      description:
        language === "en"
          ? "View all your rides, progress, and insights in one simple, personalized dashboard."
          : "Ve todas tus montas, progreso e insights en un panel simple y personalizado.",
      icon: <LayoutDashboard size={24} />,
    },
    {
      title: language === "en" ? "Event Management" : "Gestión de Eventos",
      description:
        language === "en"
          ? "Organize your events and give trainers direct access to your performance dashboard."
          : "Organiza tus eventos y da a los entrenadores acceso directo a tu panel de rendimiento.",
      icon: <Calendar size={24} />,
    },
    {
      title:
        language === "en"
          ? "Coach Collaboration"
          : "Colaboración con Entrenador",
      description:
        language === "en"
          ? "Connect with your coach to share feedback, track progress, and train smarter together."
          : "Conéctate con tu entrenador para compartir retroalimentación, rastrear progreso y entrenar de manera más inteligente juntos.",
      icon: <Users size={24} />,
    },
  ];

  return (
    <AnimatedSection animation="fade-in" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-medium text-center mb-16 text-purple-900">
          {language === "en" ? "What You Benefit From" : "De qué se beneficia"}
        </h2>

        <div className="flex justify-around flex-wrap gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default BenefitsSection;
