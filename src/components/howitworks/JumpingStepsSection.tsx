import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Rocket, ShieldCheck, Target } from 'lucide-react';

const JumpingStepsSection = () => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-4">
            {t["ai-jumping-how-it-works"]}
          </h2>
          <p className="text-gray-700 font-sans text-lg">
            {t["ai-jumping-how-it-works-description"]}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-jump-light text-white mb-4 mx-auto">
              <Rocket className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 text-center">
              {t["ai-jumping-step-1-title"]}
            </h3>
            <p className="text-gray-700 font-sans text-sm text-center">
              {t["ai-jumping-step-1-description"]}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-jump-light text-white mb-4 mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 text-center">
              {t["ai-jumping-step-2-title"]}
            </h3>
            <p className="text-gray-700 font-sans text-sm text-center">
              {t["ai-jumping-step-2-description"]}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-jump-light text-white mb-4 mx-auto">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 text-center">
              {t["ai-jumping-step-3-title"]}
            </h3>
            <p className="text-gray-700 font-sans text-sm text-center">
              {t["ai-jumping-step-3-description"]}
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button
            variant="jump"
            className="mt-8"
            onClick={() => navigate('/pricing')}
          >
            {t["get-started-ai-jumping"]}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JumpingStepsSection;
