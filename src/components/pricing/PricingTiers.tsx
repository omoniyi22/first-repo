
import { useState } from 'react';
import { Check } from 'lucide-react';
import PricingToggle from './PricingToggle';
import AnimatedSection from '../ui/AnimatedSection';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  features: {
    text: string;
    included: boolean;
  }[];
  highlighted?: boolean;
  buttonText: string;
}

const PricingTiers = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      tagline: 'Try before you commit with one free test included',
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      features: [
        { text: 'First score sheet analysis FREE', included: true },
        { text: '1 additional score sheet upload per month', included: true },
        { text: 'Basic performance analysis', included: true },
        { text: 'Core exercise recommendations', included: true },
        { text: 'Single horse profile', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced analytics dashboard', included: false },
        { text: 'Training progress tracking', included: false },
        { text: 'Custom training programs', included: false },
        { text: 'Trainer collaboration tools', included: false },
      ],
      buttonText: 'Start Free',
    },
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'Ideal for dedicated riders seeking comprehensive training support',
      monthlyPrice: 19.99,
      annualPrice: 15.99,
      highlighted: true,
      features: [
        { text: 'First score sheet analysis FREE', included: true },
        { text: '3 additional score sheet uploads per month', included: true },
        { text: 'Detailed performance analysis', included: true },
        { text: 'Full exercise library access', included: true },
        { text: 'Up to 3 horse profiles', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Training progress tracking', included: true },
        { text: 'Custom training programs', included: true },
        { text: 'Trainer collaboration tools', included: false },
      ],
      buttonText: 'Choose Premium',
    },
    {
      id: 'professional',
      name: 'Professional',
      tagline: 'Designed for trainers and professional riders managing multiple horses',
      monthlyPrice: 39.99,
      annualPrice: 31.99,
      features: [
        { text: 'First score sheet analysis FREE', included: true },
        { text: 'Unlimited score sheet uploads', included: true },
        { text: 'Comprehensive analysis suite', included: true },
        { text: 'Full exercise library access', included: true },
        { text: 'Unlimited horse profiles', included: true },
        { text: 'Priority phone support', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Training progress tracking', included: true },
        { text: 'Custom training programs', included: true },
        { text: 'Trainer collaboration tools', included: true },
        { text: 'API access for integrations', included: true },
      ],
      buttonText: 'Contact Sales',
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-navy-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-navy-700">
            Try for free with one test, then choose the plan that best fits your training needs.
          </p>
        </AnimatedSection>
        
        <PricingToggle onChange={setIsAnnual} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <AnimatedSection 
              key={plan.id}
              animation="fade-in"
              delay={`delay-${(index + 1) * 100}` as any}
              className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center">
                  <span className="bg-navy-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`h-full rounded-xl p-8 flex flex-col relative z-10 ${
                plan.highlighted 
                  ? 'border-2 border-navy-600 shadow-xl bg-white' 
                  : 'border border-silver-200 bg-white shadow-md'
              }`}>
                <div className="mb-8">
                  <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-2">
                    {plan.name}
                  </h2>
                  
                  <p className="text-navy-700 mb-6 text-sm h-12">
                    {plan.tagline}
                  </p>
                  
                  <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold text-navy-900">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-navy-600 ml-2 text-base">
                      /month
                    </span>
                  </div>
                  
                  {isAnnual && (
                    <p className="text-sm text-navy-600 mb-6">
                      Billed annually (${(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12}/year)
                    </p>
                  )}
                </div>
                
                <Link to="/sign-in?signup=true" className="block mb-8">
                  <Button 
                    className={`w-full py-6 rounded-lg text-base ${
                      plan.highlighted 
                        ? 'bg-navy-700 hover:bg-navy-800 text-white font-semibold shadow-md h-auto' 
                        : plan.id === 'basic'
                        ? 'bg-navy-600 hover:bg-navy-700 text-white font-medium h-auto'
                        : 'bg-navy-50 hover:bg-navy-100 text-navy-800 font-medium border border-navy-200 h-auto'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
                
                <div className="space-y-4 mt-auto">
                  <h3 className="font-medium text-navy-900 border-b border-silver-200 pb-2">
                    Features include:
                  </h3>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`flex items-start ${!feature.included ? 'opacity-60' : ''}`}>
                        <Check className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${feature.included ? 'text-navy-600' : 'text-silver-400'}`} />
                        <span className="text-sm text-navy-800">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-in" className="mt-20 bg-navy-50 rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-4">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6 mt-8">
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    How does the free trial work?
                  </h3>
                  <p className="text-navy-700">
                    You can upload one dressage test score sheet for free analysis after creating an account. No credit card required to get started.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    Can I switch plans later?
                  </h3>
                  <p className="text-navy-700">
                    Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be applied immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    Are there any additional fees?
                  </h3>
                  <p className="text-navy-700">
                    No, the listed price includes all features for that plan. There are no hidden fees or additional charges.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl p-8 border border-silver-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="bg-navy-100 p-3 rounded-full mr-4">
                    <svg className="h-6 w-6 text-navy-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.5 3.5 0 1113 13.355z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif font-medium text-navy-900">
                    Need help choosing?
                  </h3>
                </div>
                
                <p className="text-navy-700 mb-8">
                  Our team is here to help you select the best plan for your training needs. Contact us for personalized assistance.
                </p>
                
                <div className="space-y-4">
                  <Button className="w-full bg-navy-700 hover:bg-navy-800 text-white py-3 rounded-lg font-medium transition-colors h-auto">
                    Schedule a Demo
                  </Button>
                  
                  <Button variant="outline" className="w-full bg-transparent border border-navy-600 text-navy-700 py-3 rounded-lg font-medium transition-colors hover:bg-navy-50 h-auto">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingTiers;
