
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Amateur Dressage Rider",
      quote: "AI Dressage Trainer has completely transformed my training approach. The personalized recommendations helped me improve my scores by 12% in just three months!",
      image: "https://randomuser.me/api/portraits/women/25.jpg"
    },
    {
      id: 2,
      name: "Michael Taylor",
      position: "Professional Trainer",
      quote: "As a trainer working with multiple students, this platform has been invaluable. The AI analysis spots patterns I might miss, and the exercise recommendations are spot on.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      position: "FEI Level Competitor",
      quote: "The detailed breakdown of my test scores has helped me focus my training on specific movements. The AI recommendations are surprisingly insightful.",
      image: "https://randomuser.me/api/portraits/women/33.jpg"
    },
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-navy-700">
            Hear from riders who have transformed their dressage training with our AI platform
          </p>
        </AnimatedSection>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-silver-50 rounded-2xl p-8 md:p-10 shadow-sm">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-sm">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <svg className="h-8 w-8 text-navy-300 mb-4" fill="currentColor" viewBox="0 0 32 32">
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                          
                          <p className="text-lg md:text-xl text-navy-800 mb-6">
                            {testimonial.quote}
                          </p>
                          
                          <div>
                            <h4 className="font-serif font-medium text-navy-900">
                              {testimonial.name}
                            </h4>
                            <p className="text-navy-600 text-sm">
                              {testimonial.position}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-8 gap-4">
              <button 
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-navy-200 flex items-center justify-center text-navy-600 hover:bg-navy-50 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      index === activeIndex ? 'bg-navy-700' : 'bg-navy-200'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-navy-200 flex items-center justify-center text-navy-600 hover:bg-navy-50 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <AnimatedSection animation="fade-in" className="mt-20">
          <div className="bg-navy-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-4">
                  Ready to Transform Your Dressage Training?
                </h3>
                
                <p className="text-navy-100 mb-8">
                  Join hundreds of riders who have improved their performance with AI-powered analysis and personalized training recommendations.
                </p>
                
                <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
                  <button className="w-full md:w-auto bg-white text-navy-800 px-6 py-3 rounded-lg font-medium hover:bg-navy-50 transition-colors">
                    Start Free Trial
                  </button>
                  
                  <button className="w-full md:w-auto bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-700 transition-colors">
                    Schedule Demo
                  </button>
                </div>
              </div>
              
              <div className="bg-navy-700 h-full p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-navy-600 rounded-full p-2 mr-4 mt-1">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Advanced AI Analysis</h4>
                      <p className="text-navy-200 text-sm">Upload your score sheets for instant AI-powered feedback</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-navy-600 rounded-full p-2 mr-4 mt-1">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Personalized Training</h4>
                      <p className="text-navy-200 text-sm">Get tailored exercises based on your specific needs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-navy-600 rounded-full p-2 mr-4 mt-1">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Progress Tracking</h4>
                      <p className="text-navy-200 text-sm">Monitor your improvement with detailed analytics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-navy-600 rounded-full p-2 mr-4 mt-1">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Comprehensive Library</h4>
                      <p className="text-navy-200 text-sm">Access to 200+ dressage training exercises</p>
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

export default Testimonials;
