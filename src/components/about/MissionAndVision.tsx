
import AnimatedSection from "@/components/ui/AnimatedSection";

const MissionAndVision = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center text-purple-900 mb-8">
            Our Mission & Vision
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              At AI Equestrian, we believe that technology can enhance the time-honored traditions of equestrian sports. Our mission is to democratize access to elite-level training by leveraging artificial intelligence to provide personalized, data-driven insights to riders of all levels.
            </p>
            
            <p>
              We envision a world where every equestrian, regardless of location or resources, can receive tailored guidance to improve their performance and strengthen the partnership with their horse.
            </p>
            
            <p>
              Our platform was born from a simple observation: while competition feedback contains valuable insights, riders often struggle to translate that feedback into effective training strategies. By harnessing the power of AI, we bridge that gap, turning competition results and video analysis into actionable training plans.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default MissionAndVision;
