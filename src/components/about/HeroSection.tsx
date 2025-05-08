
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-blue-900/70">
        <img 
          src="/lovable-uploads/138720cd-9a7d-4b54-bcfe-ca99ad9213fc.png"
          alt="AI Equestrian - Riding Intelligence, Redefined"
          className="w-full h-full object-cover mix-blend-overlay"
          style={{ objectPosition: "center 30%" }}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 h-full relative z-10">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-white mb-6 text-shadow">
            Riding Intelligence, Redefined
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
            AI Equestrian combines cutting-edge technology with equestrian expertise to transform how riders train, compete, and improve.
          </p>
          <Link to="/sign-in?signup=true">
            <Button 
              className="primary-dressage-button"
              size="lg"
            >
              Try AI Equestrian
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
