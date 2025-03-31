
import { Shield, Zap, Users, LineChart, Target, Clock } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

const Benefits = () => {
  const benefits = [
    {
      icon: <LineChart className="w-8 h-8 text-purple-600" />,
      title: "Personalized Analysis",
      description: "Our AI analyzes your unique riding patterns and test scores to provide feedback tailored specifically to your strengths and weaknesses.",
      delay: "delay-100"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: "Accelerated Progress",
      description: "Riders using our platform improve 3x faster with targeted exercises addressing specific areas of improvement identified by our AI.",
      delay: "delay-200"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Competition Edge",
      description: "Gain insights into exactly what judges are looking for and how to showcase your horse's best movements to maximize your scores.",
      delay: "delay-300"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Efficient Training",
      description: "Save time and money by focusing your training sessions on the exercises that will have the biggest impact on your performance.",
      delay: "delay-400"
    }
  ];

  return (
    <section className="py-16 bg-purple-50">
      <div className="container mx-auto px-6">
        <div className="mb-8 max-w-3xl mx-auto text-center">
          <AnimatedSection animation="fade-in" delay="delay-100">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
              Benefits That Make a Difference
            </h2>
            <p className="text-purple-700 mb-6">
              Our AI-powered platform helps riders of all levels achieve their goals faster with data-driven insights and personalized recommendations.
            </p>
            <ul className="space-y-3 mb-6 inline-block text-left">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <span className="text-purple-700">Advanced movement analysis and scoring prediction</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <span className="text-purple-700">Personalized training plans based on your test results</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <span className="text-purple-700">Track improvements over time with detailed metrics</span>
              </li>
            </ul>
            <Link to="/how-it-works" className="inline-block">
              <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                Learn How It Works
              </Button>
            </Link>
            
            <div className="mt-6 mb-4">
              <AnimatedSection animation="fade-in" delay="delay-300">
                <div className="rounded-xl overflow-hidden shadow-lg border-4 border-white mx-auto max-w-2xl">
                  <img 
                    src="/lovable-uploads/0e3ca532-c34f-4dc4-aedf-f34da66897ee.png" 
                    alt="White horse in dressage arena" 
                    className="w-full h-auto"
                  />
                </div>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <AnimatedSection 
              key={index}
              animation="slide-in-bottom"
              delay={benefit.delay as any}
              className="h-full"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 h-full flex flex-col items-start hover:shadow-md transition-shadow group">
                <div className="bg-purple-100/50 w-16 h-16 rounded-xl flex items-center justify-center shrink-0 mb-4 transition-colors duration-300 group-hover:bg-purple-200/50">
                  {benefit.icon}
                </div>
                
                <div>
                  <h3 className="text-xl font-serif font-medium text-purple-900 mb-3">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-purple-700">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection animation="fade-in" delay="delay-500" className="mt-10">
          <div className="bg-white rounded-xl p-8 border border-purple-100 overflow-hidden relative">
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-purple-50 rounded-full opacity-50" />
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-50 rounded-full opacity-30" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2 relative order-2 lg:order-1">
                <img 
                  src="/lovable-uploads/ed21d62b-c117-47e7-98ac-e263ba9821e7.png" 
                  alt="Horse legs with data points" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-purple-600/10 rounded-lg pointer-events-none" />
              </div>
              
              <div className="lg:col-span-3 order-1 lg:order-2">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                  Results You Can Measure
                </span>
                
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-purple-900 mb-4">
                  Achieve Your Competition Goals
                </h3>
                
                <p className="text-purple-700 mb-6">
                  Our comprehensive analytics track your improvement across multiple tests, helping you see exactly where you're making progress. 
                  Our users report average score improvements of 2-5 percentage points in their first three months.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold text-purple-900 mb-1">3%</div>
                    <div className="text-sm text-purple-600">Avg. Score Increase</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold text-purple-900 mb-1">91%</div>
                    <div className="text-sm text-purple-600">Rider Satisfaction</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold text-purple-900 mb-1">7,500+</div>
                    <div className="text-sm text-purple-600">Tests Analyzed</div>
                  </div>
                </div>
                
                <Link to="/how-it-works">
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Benefits;
