
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";

const DressageTab = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  return (
  <div className="space-y-6">
    <div className="md:flex gap-8 items-center mb-8">
      <div className="md:w-1/2 mb-6 md:mb-0">
        <h3 className="text-2xl font-serif font-semibold text-purple-900 mb-4">
          {t["elevating-dressage"]}
        </h3>
        <p className="text-gray-700 mb-4">
          {t["dressage-demands"]}
        </p>
      </div>
      <div className="md:w-1/2">
        <img 
          src="/lovable-uploads/f21e0183-a564-4222-87bb-f424b3ed4c87.png"
          alt="Dressage rider performing in an arena"
          className="rounded-lg w-full object-cover shadow-md h-64"
        />
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">{t["inconsistent-test-scores"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["inconsistent-test-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">{t["difficulty-interpreting"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["difficulty-interpreting-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">{t["position-flaws"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["position-flaws-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">{t["gait-quality"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["gait-quality-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100 md:col-span-2">
        <h4 className="font-medium text-purple-800 mb-2">{t["training-plateaus"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["training-plateaus-desc"]}
        </p>
      </div>
    </div>
  </div>
  );
};

const JumpingTab = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  return (
  <div className="space-y-6">
    <div className="md:flex gap-8 items-center mb-8">
      <div className="md:w-1/2 mb-6 md:mb-0">
        <h3 className="text-2xl font-serif font-semibold text-blue-900 mb-4">
          {t["elevating-jumping"]}
        </h3>
        <p className="text-gray-700 mb-4">
          {t["jumping-demands"]}
        </p>
      </div>
      <div className="md:w-1/2">
        <img 
          src="/lovable-uploads/f4342e41-2c55-47a0-84c0-9fbe7a192de5.png"
          alt="Show jumping competition with horse and rider"
          className="rounded-lg w-full object-cover shadow-md h-64"
        />
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t["approach-distance"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["approach-distance-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t["position-faults"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["position-faults-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t["course-strategy"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["course-strategy-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t["fault-pattern"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["fault-pattern-desc"]}
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 md:col-span-2">
        <h4 className="font-medium text-blue-800 mb-2">{t["jump-type-difficulties"]}</h4>
        <p className="text-gray-600 text-sm">
          {t["jump-type-difficulties-desc"]}
        </p>
      </div>
    </div>
  </div>
  );
};

const DisciplineSpecificTabs = () => {
  const [activeTab, setActiveTab] = useState("dressage");
  
  return (
    <section className="py-16 bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            Discipline-Specific Challenges
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Our specialized AI systems address the unique needs of different equestrian disciplines.
          </p>
          <p className="text-sm text-gray-600 font-medium mb-4">Click a discipline below to view challenges</p>
        </AnimatedSection>
        
        {/* Completely redesigned tabs section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-xl shadow-lg p-2 border border-gray-200">
              <button
                onClick={() => setActiveTab("dressage")}
                className={`relative px-8 py-4 rounded-lg transition-all duration-300 font-serif text-2xl ${
                  activeTab === "dressage"
                    ? "bg-purple-100 text-purple-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                AI Dressage
                {activeTab === "dressage" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-700 rounded-b-lg"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("jumping")}
                className={`relative px-8 py-4 rounded-lg transition-all duration-300 font-serif text-2xl ${
                  activeTab === "jumping"
                    ? "bg-blue-100 text-blue-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                AI Jump
                {activeTab === "jumping" && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-700 rounded-b-lg"></span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          {activeTab === "dressage" ? (
            <DressageTab />
          ) : (
            <JumpingTab />
          )}
        </div>
      </div>
    </section>
  );
};

export default DisciplineSpecificTabs;
