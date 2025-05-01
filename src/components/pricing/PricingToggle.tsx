
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/contexts/LanguageContext';

interface PricingToggleProps {
  onChange: (isAnnual: boolean) => void;
}

const PricingToggle = ({ onChange }: PricingToggleProps) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const handleToggle = () => {
    const newValue = !isAnnual;
    setIsAnnual(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex flex-col items-center">
        <div className="bg-white py-3 px-6 rounded-full shadow-md border border-silver-200 w-full flex items-center justify-center space-x-4">
          <span className={`text-base font-medium transition-colors ${isAnnual ? 'text-purple-900' : 'text-purple-500'}`}>
            {t["annual"]}
          </span>
          
          <Switch 
            checked={!isAnnual}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-purple-700 data-[state=unchecked]:bg-purple-700"
          />
          
          <span className={`text-base font-medium transition-colors ${!isAnnual ? 'text-purple-900' : 'text-purple-500'}`}>
            {t["monthly"]}
          </span>
        </div>
        
        {isAnnual && (
          <div className="mt-4 bg-purple-100 text-purple-800 px-5 py-2 rounded-full text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {t["save-annual"]}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingToggle;
