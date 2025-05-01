
import AnimatedSection from '../ui/AnimatedSection';

const EquestrianMissionSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900 mb-6">
            About AI Equestrian
          </h1>
          <p className="text-lg text-gray-700">
            We're on a mission to transform equestrian training through the power of artificial intelligence.
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <AnimatedSection animation="fade-in-right">
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <span className="font-serif text-3xl bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent">Our Vision</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in">
            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-6">
              Our Mission & Vision
            </h2>
            
            <div className="space-y-6 text-gray-700">
              <p>
                At AI Equestrian, we believe that technology can enhance the time-honored tradition of equestrian sports. Our mission is to democratize access to elite-level training by leveraging artificial intelligence to provide personalized, data-driven insights to riders of all levels across disciplines.
              </p>
              
              <p>
                We envision a world where every equestrian, regardless of location or resources, can receive tailored guidance to improve their performance and strengthen the partnership with their horse.
              </p>
              
              <p>
                Our platform offers specialized tools for both dressage and jumping riders through our AI Dressage and AI Jump applications, bringing innovative technology to these distinct but complementary disciplines.
              </p>
            </div>
          </AnimatedSection>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection animation="fade-in" className="order-2 lg:order-1">
            <h2 className="text-3xl font-serif font-semibold text-gray-900 mb-6">
              Our Integrated Approach
            </h2>
            
            <div className="space-y-6 text-gray-700">
              <p>
                AI Equestrian provides discipline-specific solutions through:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="text-xl font-serif font-medium text-purple-900 mb-3">AI Dressage</h3>
                  <p className="text-purple-800">
                    Specialized analysis for dressage tests, movements, and scoring patterns with personalized recommendations.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-serif font-medium text-blue-900 mb-3">AI Jump</h3>
                  <p className="text-blue-800">
                    Advanced tools for jumping course analysis, technique improvement, and fault pattern recognition.
                  </p>
                </div>
              </div>
              
              <p>
                Both platforms are built on our core AI technology, but each is tailored to address the unique challenges and goals of its respective discipline. By offering specialized tools, we ensure riders receive the most relevant and actionable insights for their specific needs.
              </p>
              
              <p>
                Our integrated approach allows riders who compete in multiple disciplines to seamlessly switch between platforms while maintaining a consistent user experience and consolidated performance history.
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-in-left" className="order-1 lg:order-2">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <span className="font-serif text-3xl bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">Our Technology</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
        
        <AnimatedSection animation="fade-in" delay="delay-200" className="mt-20">
          <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/10">
              <div className="bg-gradient-to-br from-purple-800 to-blue-800 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-2">1,000+</div>
                <div className="text-blue-100">Active Riders</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-800 to-blue-800 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-2">20,000+</div>
                <div className="text-blue-100">Performances Analyzed</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-800 to-blue-800 p-8 text-center">
                <div className="text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-blue-100">User Satisfaction</div>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-6 text-center">
                Our Core Values
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Innovation</h3>
                  <p className="text-blue-100 text-sm">Pioneering new approaches across equestrian disciplines</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Excellence</h3>
                  <p className="text-blue-100 text-sm">Committing to the highest standards in everything we do</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Community</h3>
                  <p className="text-blue-100 text-sm">Building a unified network across all equestrian disciplines</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Tradition</h3>
                  <p className="text-blue-100 text-sm">Honoring equestrian heritage while embracing the future</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default EquestrianMissionSection;
