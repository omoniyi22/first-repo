
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-blue-900/70">
        <img 
          src="/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png"
          alt="AI Equestrian - Riding Intelligence, Redefined"
          className="w-full h-full object-cover object-center mix-blend-overlay"
          style={{ objectPosition: "center 40%" }} // Adjust to show more of the rider
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 h-full relative z-10">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-white mb-6">
            Riding Intelligence, Redefined
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
            AI Equestrian combines cutting-edge technology with equestrian expertise to transform how riders train, compete, and improve.
          </p>
          <Link to="/sign-in?signup=true">
            <Button size="lg" className="bg-gradient-to-r from-[#8a55a9] to-[#6b3987] hover:from-[#7a4599] hover:to-[#5b2977] text-white px-8 py-6 rounded-md text-lg uppercase">
              Try AI Equestrian
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
