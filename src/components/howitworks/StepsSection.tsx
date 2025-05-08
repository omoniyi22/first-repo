
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Upload, CloudLightning, BarChart3 } from 'lucide-react';

const StepsSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const steps = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: t["ai-dressage-step-1-title"] || "Upload Score Sheets",
      description: t["ai-dressage-step-1-description"] || "Take a photo or upload your dressage test score sheets through our intuitive interface.",
    },
    {
      icon: <CloudLightning className="h-8 w-8" />,
      title: t["ai-dressage-step-2-title"] || "AI Processing",
      description: t["ai-dressage-step-2-description"] || "Our advanced AI analyzes your scores, identifying patterns and areas for improvement.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t["ai-dressage-step-3-title"] || "Personalized Recommendations",
      description: t["ai-dressage-step-3-description"] || "Get tailored training exercises designed to address your specific improvement areas.",
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 reveal-scroll">
          <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">
            {t["ai-dressage-how-it-works"] || "How AI Dressage Trainer Works"}
          </h2>
          <p className="text-gray-700 font-sans text-lg">
            {t["ai-dressage-how-it-works-description"] || "Our innovative platform uses advanced AI to transform how you approach dressage training"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 reveal-scroll"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-700 mb-4 mx-auto">
                {step.icon}
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 text-center">
                {step.title}
              </h3>
              <p className="text-gray-700 font-sans text-center">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 reveal-scroll">
          <Button
            className="btn-dressage"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-dressage"] || "Get Started with AI Dressage"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
