
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface PlatformDemoSectionProps {
  discipline: 'dressage' | 'jumping';
}

const PlatformDemoSection: React.FC<PlatformDemoSectionProps> = ({ discipline }) => {
  const navigate = useNavigate();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const buttonClass = discipline === 'dressage' ? 'btn-dressage' : 'btn-jumping';
  
  const title = discipline === 'jumping' 
    ? (t["jumping-demo-title"] || "See the Platform in Action")
    : (t["dressage-demo-title"] || "See the Platform in Action");
  
  const description = discipline === 'jumping'
    ? (t["jumping-demo-description"] || "Watch our demo to see how AI Jumping Trainer can transform your training approach with powerful analysis of courses, faults, and jumping technique.")
    : (t["dressage-demo-description"] || "Watch our demo to see how AI Dressage Trainer can transform your training approach with powerful analysis of tests, movements, and dressage technique.");

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div className="reveal-scroll">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-gray-700 mb-8">
              {description}
            </p>
            <Button
              className={buttonClass}
              onClick={() => console.log("Demo video played")}
            >
              <Play className="mr-2" size={18} />
              {t["watch-demo"] || "Watch Demo"}
            </Button>
          </div>

          {/* Right column - Video placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-8 aspect-video flex items-center justify-center reveal-scroll">
            <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
              <div className={`w-16 h-16 rounded-full ${discipline === 'dressage' ? 'bg-dressage' : 'bg-jump'} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}>
                <Play className="text-white" size={32} />
              </div>
              <span className="absolute bottom-4 text-gray-500 font-medium">Platform Demo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformDemoSection;
