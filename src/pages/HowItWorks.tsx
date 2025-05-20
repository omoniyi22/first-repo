
import { useEffect } from "react";
import { SEO, getPageMetadata } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/ui/AnimatedSection";
import DisciplineSelector from "@/components/howitworks/DisciplineSelector";
import PrivacySection from "@/components/howitworks/PrivacySection";
import BenefitsSection from "@/components/howitworks/BenefitsSection";
import FaqSection from "@/components/howitworks/FaqSection";

const HowItWorks = () => {
  // Initialize scroll reveal for animations
  useEffect(() => {
    const initScrollReveal = () => {
      const revealItems = document.querySelectorAll(".reveal-scroll");

      const revealCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      };

      const observer = new IntersectionObserver(revealCallback, {
        threshold: 0.1,
      });

      revealItems.forEach((item) => {
        observer.observe(item);
      });

      return () => {
        revealItems.forEach((item) => {
          observer.unobserve(item);
        });
      };
    };

    initScrollReveal();

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Get page metadata
  const seoMetadata = getPageMetadata("howItWorks", {
    title: "How AI Equestrian Works | Advanced Equestrian Analytics",
    description:
      "Learn how our AI-powered platform analyzes dressage and jumping performances to provide personalized training recommendations for equestrians.",
    canonicalUrl: "/how-it-works",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="w-full h-80 md:h-[calc(100vh-64px)] overflow-hidden relative">
          <img
            src="/lovable-uploads/7d2227eb-924f-4f33-84a3-cb1f6da7d4f4.png"
            alt="Equestrian analytics visualization showing a horse and rider with AI tracking overlays"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 drop-shadow-lg text-shadow-lg">
                  How AI Equestrian Works
                </h1>
                <p className="text-lg text-white/90 mb-8 drop-shadow-lg text-shadow-md">
                  Discover how our AI-powered platform analyzes your riding performance, 
                  identifies areas for improvement, and provides personalized training recommendations.
                </p>
                <Link to="/sign-in?signup=true">
                  <Button 
                    variant="primary" 
                    className="hover:bg-purple-700 hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <AnimatedSection animation="fade-in" className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-center mb-12">
              How AI Equestrian Works
            </h2>
            <p className="text-center text-gray-700 max-w-3xl mx-auto mb-16">
              Choose your equestrian discipline to learn how our AI-powered training solutions can help you improve your performance.
            </p>
            
            <DisciplineSelector />
          </div>
        </AnimatedSection>

        <PrivacySection />
        <BenefitsSection />
        <FaqSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
