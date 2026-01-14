
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ExperienceSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">
            Ready to Transform Your Riding?
          </h2>
          <p className="text-blue-100 max-w-3xl mx-auto">
            Experience data-driven insights that will elevate your equestrian performance. 
            Start your AI Equestrian journey today.
          </p>
        </div>
        
        <div className="md:flex justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="md:w-1/2 flex-shrink-0">
            <img 
              src="/lovable-uploads/3b7c24a2-ef67-42cc-9b46-875418451128.png"
              alt="Equestrian demonstration"
              className="rounded-lg w-full max-h-80 object-cover shadow-lg"
            />
          </div>
          
          <div className="md:w-1/2 text-left">
            <p className="text-gray-100 mb-6">
              Have questions about our platform or want to learn more about how AI Equestrian can help you achieve your riding goals? Get in touch with our team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/sign-in?signup=true">
                <Button className="bg-white text-purple-700 hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              
              <Link to="/how-it-works">
                <Button variant="outline" className="border-white text-white hover:bg-purple-700/30">
                  Watch Demo
                </Button>
              </Link>
              
              <Link to="/pricing">
                <Button variant="outline" className="border-white text-white hover:bg-purple-700/30">
                  See Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
