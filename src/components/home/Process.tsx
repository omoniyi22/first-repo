
import { Upload, CloudLightning, BarChart3, Lightbulb } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';

const Process = () => {
  const steps = [
    {
      icon: <Upload className="w-8 h-8 text-navy-600" />,
      title: "Upload Score Sheets",
      description: "Take a photo or upload your dressage test score sheets through our intuitive interface.",
      delay: "delay-100"
    },
    {
      icon: <CloudLightning className="w-8 h-8 text-navy-600" />,
      title: "AI Processing",
      description: "Our advanced AI analyzes your scores, identifying patterns and areas for improvement.",
      delay: "delay-200"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-navy-600" />,
      title: "Detailed Analysis",
      description: "Receive comprehensive breakdowns of your performance with visual analytics.",
      delay: "delay-300"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-navy-600" />,
      title: "Custom Recommendations",
      description: "Get personalized training exercises tailored to your specific improvement areas.",
      delay: "delay-400"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-4">
            How AI Dressage Trainer Works
          </h2>
          <p className="text-lg text-navy-700">
            Our innovative platform uses advanced AI to transform how you approach dressage training
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <AnimatedSection 
              key={index}
              animation="fade-in"
              delay={step.delay as any}
              className="relative"
            >
              <div className="glass-card h-full p-6 relative overflow-hidden group">
                {/* Subtle animated border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-navy-200/30 via-navy-400/30 to-navy-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', }} />
                
                <div className="relative z-10">
                  <div className="bg-navy-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-navy-100/50 flex items-center justify-center">
                    <span className="font-medium text-navy-800">{index + 1}</span>
                  </div>
                  
                  <h3 className="text-xl font-serif font-medium text-navy-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-navy-700">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-in" delay="delay-500" className="mt-16">
          <div className="relative overflow-hidden rounded-2xl">
            <div className="aspect-video bg-navy-100 rounded-2xl overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center text-navy-800">
                <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="#1c1e40" />
                  </svg>
                </div>
                <p className="text-lg font-medium">Watch how it works</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Process;
