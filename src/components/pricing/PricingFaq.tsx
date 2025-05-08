
import { useState } from 'react';
import AnimatedSection from '../ui/AnimatedSection';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const PricingFaq = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <AnimatedSection animation="fade-in">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-8">
                Frequently Asked Questions
              </h2>

              <div className="space-y-10">
                <div>
                  <h3 className="font-medium text-navy-900 mb-3 text-xl">
                    How does the free trial work?
                  </h3>
                  <p className="text-gray-700">
                    You can upload one dressage test score sheet for free analysis after creating an account.
                    No credit card required to get started.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-navy-900 mb-3 text-xl">
                    Can I switch plans later?
                  </h3>
                  <p className="text-gray-700">
                    Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription 
                    will be applied immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-navy-900 mb-3 text-xl">
                    Are there any additional fees?
                  </h3>
                  <p className="text-gray-700">
                    No, the listed price includes all features for that plan. There are no hidden fees or
                    additional charges.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
          
          <div className="lg:col-span-2">
            <AnimatedSection animation="fade-in" className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm h-full">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <svg className="h-6 w-6 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.5 3.5 0 1113 13.355z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-medium text-navy-900">
                  Need help choosing?
                </h3>
              </div>
              
              <p className="text-gray-700 mb-8">
                Our team is here to help you select the best plan for your training needs. Contact
                us for personalized assistance.
              </p>
              
              <div className="flex justify-center">
                <Button className="bg-white border border-purple-600 text-purple-700 py-3 rounded-lg font-medium transition-colors hover:bg-purple-50 h-auto">
                  Contact Support
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingFaq;
