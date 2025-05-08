
import AnimatedSection from "@/components/ui/AnimatedSection";

const MissionAndVision = () => {
  return (
    <section className="py-24 bg-white" id="mission-section">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center text-gray-900 mb-8">
            Our Mission & Vision
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-lg">
              At AI Equestrian, we believe that technology can enhance the time-honored traditions of equestrian sports. Our mission is to democratize access to elite-level training by leveraging artificial intelligence to provide personalized, data-driven insights to riders of all levels.
            </p>
            
            <p className="text-lg">
              We envision a world where every equestrian, regardless of location or resources, can receive tailored guidance to improve their performance and strengthen the partnership with their horse.
            </p>
            
            <p className="text-lg">
              Our platform was born from a simple observation: while competition feedback contains valuable insights, riders often struggle to translate that feedback into effective training strategies. By harnessing the power of AI, we bridge that gap, turning competition results and video analysis into actionable training plans.
            </p>
          </div>
          
          <div className="mt-12 bg-purple-50 rounded-xl p-8 border border-purple-100">
            <h3 className="text-2xl font-serif font-medium text-purple-900 mb-4 text-center">
              Our Core Principles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-serif font-medium text-gray-900 mb-3">Equestrian Tradition</h4>
                <p className="text-gray-700">
                  We honor the rich heritage of equestrian sports while embracing innovation. Our technology complements traditional training methods rather than replacing them.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-xl font-serif font-medium text-gray-900 mb-3">Technological Innovation</h4>
                <p className="text-gray-700">
                  We leverage cutting-edge AI and machine learning to analyze performance data in ways that were previously impossible, revealing insights that can transform training.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default MissionAndVision;
