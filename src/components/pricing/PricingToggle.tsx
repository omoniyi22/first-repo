
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
    <div className="w-full max-w-md mx-auto mb-16">
      <div className="flex flex-col items-center">
        <div className="bg-white py-3 px-6 rounded-full shadow-sm border border-silver-200 w-full flex items-center justify-center space-x-6">
          <span className={`text-base font-medium transition-colors ${isAnnual ? 'text-[#3D3160] font-semibold' : 'text-gray-400'}`}>
            Annual
          </span>
          
          <Switch 
            checked={!isAnnual}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-purple-600"
          />
          
          <span className={`text-base font-medium transition-colors ${!isAnnual ? 'text-[#3D3160] font-semibold' : 'text-gray-400'}`}>
            Monthly
          </span>
        </div>
        
        {isAnnual && (
          <div className="mt-4 flex items-center">
            <div className="bg-purple-100 text-purple-700 px-5 py-2 rounded-full text-sm font-medium flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Save 20% with annual billing
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingToggle;
