
import { useState } from 'react';

interface PricingToggleProps {
  onChange: (isAnnual: boolean) => void;
}

const PricingToggle = ({ onChange }: PricingToggleProps) => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const handleToggle = () => {
    const newValue = !isAnnual;
    setIsAnnual(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center mb-16">
      <div className="flex items-center space-x-4">
        <span className={`text-lg ${isAnnual ? 'font-medium text-navy-900' : 'text-navy-600'}`}>
          Annual
        </span>
        
        <button 
          onClick={handleToggle}
          className="relative inline-flex h-8 w-16 items-center rounded-full bg-navy-200"
          aria-pressed={isAnnual}
          aria-label="Toggle between monthly and annual billing"
        >
          <span className="sr-only">Toggle between monthly and annual billing</span>
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
              isAnnual ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
        
        <span className={`text-lg ${!isAnnual ? 'font-medium text-navy-900' : 'text-navy-600'}`}>
          Monthly
        </span>
      </div>
      
      {isAnnual && (
        <div className="mt-4 bg-navy-50 text-navy-800 px-4 py-1.5 rounded-full text-sm font-medium">
          Save 20% with annual billing
        </div>
      )}
    </div>
  );
};

export default PricingToggle;
