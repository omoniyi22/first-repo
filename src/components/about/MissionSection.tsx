
import AnimatedSection from '../ui/AnimatedSection';
import { useLanguage } from '@/contexts/LanguageContext';

const MissionSection = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-navy-900 mb-6">
            {t["about-ai-trainer"]}
          </h1>
          <p className="text-lg text-navy-700">
            {t["mission-description"]}
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <AnimatedSection animation="fade-in-right">
            <div className="aspect-square bg-navy-50 rounded-2xl overflow-hidden relative">
              {/* In production, this would be a high-quality image */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy-500/10 to-navy-800/10" />
              <div className="w-full h-full bg-navy-100/50 flex items-center justify-center">
                <div className="text-center">
                  <span className="font-serif text-3xl text-navy-800">{t["our-vision"]}</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in">
            <h2 className="text-3xl font-serif font-semibold text-purple-900 mb-6">
              {t["mission-vision"]}
            </h2>
            
            <div className="space-y-6 text-navy-700">
              <p>
                {t["mission-text1"]}
              </p>
              
              <p>
                {t["mission-text2"]}
              </p>
              
              <p>
                {t["mission-text3"]}
              </p>
            </div>
          </AnimatedSection>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="fade-in" className="order-2 lg:order-1">
            <h2 className="text-3xl font-serif font-semibold text-navy-900 mb-6">
              {t["problem-solving"]}
            </h2>
            
            <div className="space-y-6 text-navy-700">
              <p>
                {t["problem-description"]}
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-navy-100 rounded-full text-navy-700 font-medium mr-3 mt-0.5">1</span>
                  <span>{t["problem1"]}</span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-navy-100 rounded-full text-navy-700 font-medium mr-3 mt-0.5">2</span>
                  <span>{t["problem2"]}</span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-navy-100 rounded-full text-navy-700 font-medium mr-3 mt-0.5">3</span>
                  <span>{t["problem3"]}</span>
                </li>
                
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-navy-100 rounded-full text-navy-700 font-medium mr-3 mt-0.5">4</span>
                  <span>{t["problem4"]}</span>
                </li>
              </ul>
              
              <p>
                {t["solution-text"]}
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in-left" className="order-1 lg:order-2">
            <div className="aspect-square bg-navy-50 rounded-2xl overflow-hidden relative">
              {/* In production, this would be a high-quality image */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy-500/10 to-navy-800/10" />
              <div className="w-full h-full bg-navy-100/50 flex items-center justify-center">
                <div className="text-center">
                  <span className="font-serif text-3xl text-navy-800">{t["our-approach-title"]}</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
        
        <AnimatedSection animation="fade-in" delay="delay-200" className="mt-20">
          <div className="bg-navy-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-navy-700">
              <div className="bg-navy-800 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-navy-200">{t["active-riders"]}</div>
              </div>
              
              <div className="bg-navy-800 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-2">10,000+</div>
                <div className="text-navy-200">{t["tests-analyzed-alt"]}</div>
              </div>
              
              <div className="bg-navy-800 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-navy-200">{t["user-satisfaction"]}</div>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-6 text-center">
                {t["core-values"]}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">{t["innovation"]}</h3>
                  <p className="text-navy-200 text-sm">{t["innovation-desc"]}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">{t["precision"]}</h3>
                  <p className="text-navy-200 text-sm">{t["precision-desc"]}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">{t["community"]}</h3>
                  <p className="text-navy-200 text-sm">{t["community-desc"]}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">{t["tradition"]}</h3>
                  <p className="text-navy-200 text-sm">{t["tradition-desc"]}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default MissionSection;
