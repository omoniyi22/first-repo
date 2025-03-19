
import { useState } from 'react';
import { FilePenLine, BarChart3, BookOpen, Lightbulb } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';

const StepsSection = () => {
  const [activeStep, setActiveStep] = useState(1);
  
  const steps = [
    {
      id: 1,
      icon: <FilePenLine className="w-6 h-6" />,
      title: "Upload Score Sheets",
      description: "Simply take a photo of your dressage test score sheet or upload a digital copy. Our system supports all major dressage organizations and test levels.",
      image: "/placeholder.svg", // In a real implementation, this would be a real image
      features: [
        "Support for FEI, USDF, British Dressage, and other formats",
        "Simple drag-and-drop or camera upload",
        "Secure and private data handling",
        "Automatic test level detection"
      ]
    },
    {
      id: 2,
      icon: <BarChart3 className="w-6 h-6" />,
      title: "AI Analysis",
      description: "Our advanced artificial intelligence analyzes your scores, comments, and performance patterns to identify both strengths and areas for improvement.",
      image: "/placeholder.svg",
      features: [
        "Detailed breakdown of each movement score",
        "Pattern recognition across multiple tests",
        "Judge comment analysis and interpretation",
        "Comparison to your previous performances"
      ]
    },
    {
      id: 3,
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Personalized Recommendations",
      description: "Receive tailored training recommendations and exercises specifically designed to address your improvement areas and enhance your strengths.",
      image: "/placeholder.svg",
      features: [
        "Custom exercise selection from our library",
        "Difficulty progression based on your level",
        "Focus on movements needing improvement",
        "Weekly training plans and schedules"
      ]
    },
    {
      id: 4,
      icon: <BookOpen className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with comprehensive analytics dashboards and progress reports that show your development as a rider.",
      image: "/placeholder.svg",
      features: [
        "Visual charts of score improvements",
        "Achievement tracking and milestones",
        "Long-term trend analysis",
        "Score predictions for future competitions"
      ]
    }
  ];
  
  const activeStepData = steps.find(step => step.id === activeStep) || steps[0];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-navy-900 mb-6">
            How AI Dressage Trainer Works
          </h1>
          <p className="text-lg text-navy-700">
            Our innovative platform combines cutting-edge AI technology with expert dressage knowledge to deliver
            personalized training recommendations that improve your performance.
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="space-y-3">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-5 rounded-xl flex items-center transition-all duration-300 ${
                      activeStep === step.id 
                        ? 'bg-navy-700 text-white shadow-md' 
                        : 'bg-silver-50 text-navy-800 hover:bg-silver-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      activeStep === step.id ? 'bg-navy-500' : 'bg-white'
                    }`}>
                      {step.icon}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className={`text-sm ${
                        activeStep === step.id ? 'text-navy-100' : 'text-navy-600'
                      }`}>
                        Step {step.id}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <AnimatedSection 
              key={activeStep}
              animation="fade-in"
              className="bg-white rounded-xl border border-silver-100 overflow-hidden shadow-sm"
            >
              <div className="aspect-video bg-navy-50 flex items-center justify-center">
                <div className="w-full h-full bg-navy-100 flex items-center justify-center">
                  {/* This would be a real image or animation in production */}
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-navy-200 mx-auto flex items-center justify-center mb-4">
                      {activeStepData.icon}
                    </div>
                    <h3 className="text-navy-800 font-medium">Step {activeStepData.id}: {activeStepData.title}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-4">
                  {activeStepData.title}
                </h2>
                
                <p className="text-navy-700 mb-8">
                  {activeStepData.description}
                </p>
                
                <h3 className="text-lg font-medium text-navy-900 mb-4">
                  Key Features:
                </h3>
                
                <ul className="space-y-3">
                  {activeStepData.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-navy-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-navy-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
        
        <AnimatedSection animation="fade-in" className="bg-navy-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-6">
                See the Platform in Action
              </h2>
              
              <p className="text-navy-700 mb-8">
                Watch our demo to see how AI Dressage Trainer can transform your training approach with powerful analysis
                and personalized recommendations.
              </p>
              
              <button className="navy-button flex items-center">
                Watch Demo
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-navy-200/20 to-navy-400/20 rounded-xl transform rotate-2 -z-10" />
              <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                {/* This would be a video thumbnail in production */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-navy-700 mx-auto flex items-center justify-center mb-4 cursor-pointer hover:bg-navy-800 transition-colors">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                  <p className="text-navy-600 font-medium">Platform Demo</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default StepsSection;
