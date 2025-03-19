
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import PricingToggle from './PricingToggle';
import AnimatedSection from '../ui/AnimatedSection';
import { Link } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  description: string;
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
      description: 'Perfect for individual riders looking to enhance their training.',
      monthlyPrice: 9.99,
      annualPrice: 7.99,
      features: [
        { text: '3 score sheet uploads per month', included: true },
        { text: 'Basic performance analysis', included: true },
        { text: 'Core exercise recommendations', included: true },
        { text: 'Single horse profile', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced analytics dashboard', included: false },
        { text: 'Full exercise library access', included: false },
        { text: 'Multiple horse profiles', included: false },
        { text: 'Training progress tracking', included: false },
        { text: 'Trainer collaboration tools', included: false },
      ],
      buttonText: 'Get Started',
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Ideal for dedicated riders seeking comprehensive training support.',
      monthlyPrice: 19.99,
      annualPrice: 15.99,
      highlighted: true,
      features: [
        { text: 'Unlimited score sheet uploads', included: true },
        { text: 'Detailed performance analysis', included: true },
        { text: 'Full exercise library access', included: true },
        { text: 'Up to 3 horse profiles', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Training progress tracking', included: true },
        { text: 'Custom training programs', included: true },
        { text: 'Trainer collaboration tools', included: false },
        { text: 'API access for integrations', included: false },
      ],
      buttonText: 'Start Free Trial',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Designed for trainers and professional riders managing multiple horses.',
      monthlyPrice: 39.99,
      annualPrice: 31.99,
      features: [
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
            Choose the plan that best fits your training needs. All plans include a 14-day free trial.
          </p>
        </AnimatedSection>
        
        <PricingToggle onChange={setIsAnnual} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <AnimatedSection 
              key={plan.id}
              animation="fade-in"
              delay={`delay-${(index + 1) * 100}` as any}
              className="relative"
            >
              {plan.highlighted && (
                <div className="absolute top-0 -translate-y-1/2 inset-x-0 flex justify-center">
                  <span className="bg-navy-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`h-full border rounded-xl p-8 flex flex-col relative z-10 ${
                plan.highlighted 
                  ? 'border-navy-500 shadow-lg shadow-navy-100' 
                  : 'border-silver-200'
              }`}>
                <div className="mb-8">
                  <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-2">
                    {plan.name}
                  </h2>
                  
                  <p className="text-navy-700 mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-navy-900">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-navy-600 ml-2">
                      /month
                    </span>
                  </div>
                  
                  {isAnnual && (
                    <p className="text-sm text-navy-600 mt-1">
                      Billed annually (${(isAnnual ? plan.annualPrice : plan.monthlyPrice) * 12}/year)
                    </p>
                  )}
                </div>
                
                <Link to="/sign-in?signup=true" className="block mb-8">
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.highlighted 
                        ? 'bg-navy-700 hover:bg-navy-800 text-white' 
                        : 'bg-navy-50 hover:bg-navy-100 text-navy-800'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </Link>
                
                <div className="space-y-4 mt-auto">
                  <h3 className="font-medium text-navy-900">
                    Features include:
                  </h3>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-silver-400 mr-3 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-navy-700' : 'text-silver-500'}>
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
                    Can I switch plans later?
                  </h3>
                  <p className="text-navy-700">
                    Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be applied immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">
                    What happens after the 14-day trial?
                  </h3>
                  <p className="text-navy-700">
                    After your trial period ends, you'll be automatically charged for the plan you selected. You can cancel anytime before the trial ends.
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
                  <button className="w-full bg-navy-700 hover:bg-navy-800 text-white py-3 rounded-lg font-medium transition-colors">
                    Schedule a Demo
                  </button>
                  
                  <button className="w-full bg-transparent border border-navy-600 text-navy-700 py-3 rounded-lg font-medium transition-colors hover:bg-navy-50">
                    Contact Support
                  </button>
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
