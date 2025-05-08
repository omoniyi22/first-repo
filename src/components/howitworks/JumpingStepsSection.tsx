
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Upload, CloudLightning, BarChart3 } from 'lucide-react';

const JumpingStepsSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const steps = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: t["ai-jumping-step-1-title"] || "Upload Jump Videos",
      description: t["ai-jumping-step-1-description"] || "Upload videos of your jumping rounds or training sessions for comprehensive analysis.",
    },
    {
      icon: <CloudLightning className="h-8 w-8" />,
      title: t["ai-jumping-step-2-title"] || "AI Analysis",
      description: t["ai-jumping-step-2-description"] || "Our AI examines your approach, takeoff, and landing to identify areas for technical improvement.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t["ai-jumping-step-3-title"] || "Performance Insights",
      description: t["ai-jumping-step-3-description"] || "Receive detailed insights and specific exercises to improve your jumping technique.",
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 reveal-scroll">
          <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">
            {t["ai-jumping-how-it-works"] || "How AI Jumping Trainer Works"}
          </h2>
          <p className="text-gray-700 font-sans text-lg">
            {t["ai-jumping-how-it-works-description"] || "Discover how our AI technology analyzes your jumping performance and provides targeted recommendations"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 reveal-scroll"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4 mx-auto">
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
            className="btn-jumping"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-ai-jumping"] || "Get Started with AI Jumping"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JumpingStepsSection;
