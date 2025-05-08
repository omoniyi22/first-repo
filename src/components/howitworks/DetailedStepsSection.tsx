
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, BarChart3, LightbulbIcon, BookIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DetailedStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

interface DetailedStepsSectionProps {
  discipline: 'dressage' | 'jumping';
}

const DetailedStepsSection: React.FC<DetailedStepsSectionProps> = ({ discipline }) => {
  const { language, translations } = useLanguage();
  const t = translations[language];

  const disciplineClass = discipline === 'dressage' ? 'bg-dressage-light' : 'bg-jump-light';
  const textColor = discipline === 'dressage' ? 'text-dressage' : 'text-jump';

  // Define steps based on discipline
  const steps: DetailedStep[] = discipline === 'jumping' ? [
    {
      icon: <Upload className="h-6 w-6 text-white" />,
      title: t["jumping-step-1-title"] || "Upload Course Maps & Videos",
      description: t["jumping-step-1-description"] || "Simply upload photos of your course maps or record your jumping rounds. Our system analyzes both documents and videos to provide comprehensive insights for all competition levels.",
      step: 1
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: t["jumping-step-2-title"] || "AI Analysis",
      description: t["jumping-step-2-description"] || "Our advanced AI examines every aspect of your jumping technique, from approach to landing, identifying patterns in your riding and opportunities for improvement.",
      step: 2
    },
    {
      icon: <LightbulbIcon className="h-6 w-6 text-white" />,
      title: t["jumping-step-3-title"] || "Personalized Recommendations",
      description: t["jumping-step-3-description"] || "Receive customized training exercises and specific adjustments designed to address your unique riding style and competition goals.",
      step: 3
    },
    {
      icon: <BookIcon className="h-6 w-6 text-white" />,
      title: t["jumping-step-4-title"] || "Progress Tracking",
      description: t["jumping-step-4-description"] || "Monitor your improvement over time with detailed analytics and visualizations that show how your technique is evolving.",
      step: 4
    }
  ] : [
    {
      icon: <Upload className="h-6 w-6 text-white" />,
      title: t["dressage-step-1-title"] || "Upload Score Sheets",
      description: t["dressage-step-1-description"] || "Simply upload photos of your dressage test score sheets through our intuitive interface. Our system recognizes all major test formats.",
      step: 1
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: t["dressage-step-2-title"] || "AI Analysis",
      description: t["dressage-step-2-description"] || "Our proprietary AI algorithm analyzes your scores, identifying patterns and areas for improvement across multiple tests and competitions.",
      step: 2
    },
    {
      icon: <LightbulbIcon className="h-6 w-6 text-white" />,
      title: t["dressage-step-3-title"] || "Personalized Recommendations",
      description: t["dressage-step-3-description"] || "Receive customized training exercises and specific adjustments designed to address your unique riding style and competition goals.",
      step: 3
    },
    {
      icon: <BookIcon className="h-6 w-6 text-white" />,
      title: t["dressage-step-4-title"] || "Progress Tracking",
      description: t["dressage-step-4-description"] || "Monitor your improvement over time with detailed analytics and visualizations that show how your scores are improving across different movements.",
      step: 4
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side: Step Cards */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div 
                key={step.step} 
                className="reveal-scroll"
                style={{ animationDelay: `${step.step * 100}ms` }}
              >
                <Card className="overflow-hidden bg-white hover:shadow-md transition-all">
                  <div className="flex">
                    <div className={cn("p-4 flex items-center justify-center", disciplineClass)} style={{ width: "80px" }}>
                      {step.icon}
                    </div>
                    <CardContent className="p-4 flex-1">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-serif font-medium mb-0">
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Step {step.step}
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Right side: Feature Details */}
          <div className="bg-white p-8 rounded-lg shadow-sm reveal-scroll">
            <h2 className="text-3xl font-serif font-semibold mb-4">{steps[0].title}</h2>
            <p className="text-gray-700 mb-6">
              {steps[0].description}
            </p>

            <h3 className="text-xl font-serif mb-4">Key Features:</h3>
            <ul className="space-y-3">
              {discipline === 'jumping' ? (
                <>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Support for international and national jumping competitions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Easy drag-and-drop or camera upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Secure and private data handling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Automatic jump type and course pattern recognition</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Support for all major dressage test formats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Easy drag-and-drop or camera upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Secure and private data handling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={cn("text-lg", textColor)}>✓</span>
                    <span>Automatic movement and comment recognition</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailedStepsSection;
