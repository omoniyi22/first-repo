
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const HeroSection = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative h-[550px] md:h-[600px] overflow-hidden pt-24 md:pt-32">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-blue-900/70">
        <img 
          src="/lovable-uploads/e065ac00-21fc-4384-98a5-6a7ea2667a38.png"
          alt="AI Equestrian - Riding Intelligence, Redefined"
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 h-full relative z-10">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-semibold text-white mb-4 md:mb-6">
            Riding Intelligence, Redefined
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mb-6 md:mb-8">
            AI Equestrian combines cutting-edge technology with equestrian expertise to transform how riders train, compete, and improve.
          </p>
          <Link to="/sign-in?signup=true" className="w-full sm:w-auto max-w-xs mb-14 md:mb-20">
            <Button size="lg" className="bg-gradient-to-r w-full from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-4 md:py-6 rounded-md text-lg">
              Try AI Equestrian
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
