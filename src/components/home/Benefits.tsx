
import { Shield, Zap, Users, LineChart } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';

const Benefits = () => {
  const benefits = [
    {
      icon: <LineChart className="w-8 h-8 text-navy-600" />,
      title: "Data-Driven Insights",
      description: "Transform your score sheets into actionable insights with our advanced AI analysis.",
      delay: "delay-100"
    },
    {
      icon: <Zap className="w-8 h-8 text-navy-600" />,
      title: "Accelerated Progress",
      description: "Improve faster with targeted exercises addressing your specific areas for improvement.",
      delay: "delay-200"
    },
    {
      icon: <Users className="w-8 h-8 text-navy-600" />,
      title: "Expert Methodology",
      description: "Our system is built with input from elite dressage trainers and competition judges.",
      delay: "delay-300"
    },
    {
      icon: <Shield className="w-8 h-8 text-navy-600" />,
      title: "Objective Feedback",
      description: "Remove biases with AI-powered analysis that focuses purely on performance metrics.",
      delay: "delay-400"
    }
  ];

  return (
    <section className="py-20 bg-silver-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-4">
            Benefits That Transform Your Training
          </h2>
          <p className="text-lg text-navy-700">
            Discover why riders and trainers choose AI Dressage Trainer to enhance their performance
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <AnimatedSection 
              key={index}
              animation="slide-in-bottom"
              delay={benefit.delay as any}
            >
              <div className="bg-white rounded-xl p-8 shadow-sm border border-silver-100 h-full flex items-start hover:shadow-md transition-shadow group">
                <div className="bg-navy-100/50 w-16 h-16 rounded-xl flex items-center justify-center shrink-0 mr-6 transition-colors duration-300 group-hover:bg-navy-200/50">
                  {benefit.icon}
                </div>
                
                <div>
                  <h3 className="text-xl font-serif font-medium text-navy-900 mb-3">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-navy-700">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-in" delay="delay-500" className="mt-16">
          <div className="bg-white rounded-xl p-8 border border-silver-100 overflow-hidden relative">
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-navy-50 rounded-full opacity-50" />
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-navy-50 rounded-full opacity-30" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-3">
                <span className="inline-block px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm font-medium mb-4">
                  Performance Analysis
                </span>
                
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-4">
                  Track Your Progress Over Time
                </h3>
                
                <p className="text-navy-700 mb-6">
                  Our comprehensive analytics dashboard lets you visualize your improvement across multiple tests and competitions. 
                  Monitor trends, celebrate achievements, and understand your development as a rider.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-navy-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold text-navy-900 mb-1">74%</div>
                    <div className="text-sm text-navy-600">Average Score</div>
                  </div>
                  
                  <div className="bg-navy-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold text-navy-900 mb-1">14%</div>
                    <div className="text-sm text-navy-600">Improvement</div>
                  </div>
                  
                  <div className="bg-navy-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold text-navy-900 mb-1">23</div>
                    <div className="text-sm text-navy-600">Tests Analyzed</div>
                  </div>
                </div>
                
                <button className="bg-navy-700 hover:bg-navy-800 text-white px-6 py-3 rounded-lg transition-colors">
                  Explore Analytics
                </button>
              </div>
              
              <div className="lg:col-span-2 relative">
                <div className="aspect-square bg-navy-100 rounded-xl overflow-hidden">
                  {/* This would be a real image in production */}
                  <div className="w-full h-full bg-navy-200/50 flex items-center justify-center p-6">
                    <div className="w-full max-w-xs">
                      <div className="mb-4">
                        <div className="h-4 bg-navy-300/50 rounded-full w-3/4 mb-2"></div>
                        <div className="h-3 bg-navy-300/30 rounded-full w-1/2"></div>
                      </div>
                      
                      <div className="space-y-4">
                        {[80, 65, 72, 86, 78].map((value, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs text-navy-700">
                              <div>Test {i + 1}</div>
                              <div>{value}%</div>
                            </div>
                            <div className="h-2 bg-navy-200/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-navy-600 rounded-full" 
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Benefits;
