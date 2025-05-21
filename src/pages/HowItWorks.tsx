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
    <div className="min-h-screen ">
      <SEO {...seoMetadata} />
      <Navbar />

      {/* Hero Section */}
      <div className="">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 md:order-1 lg:w-4/5 lg:mx-auto">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-navy-900 mb-6">
                How AI Equestrian Works
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Our AI-powered platform analyzes your riding performance,
                identifies areas for improvement, and provides personalized
                training recommendations to help you achieve your equestrian
                goals. Our AI-powered platform analyzes your riding performance,
                identifies areas for improvement, and provides personalized
                training recommendations to help you achieve your equestrian
                goals.
              </p>
              {/* <Link to="/sign-in?signup=true">
                <Button 
                  variant="primary" 
                  className="hover:bg-purple-700 hover:shadow-lg transition-all"
                >
                  Get Started
                </Button>
              </Link> */}
              {/* <div className="hidden md:block mt-12">
                <div className="w-10 h-20 border-2 border-purple-600 rounded-full flex items-end justify-center p-2">
                  <span className="bg-purple-600 font-semibold rounded-full w-1 h-8"></span>
                </div>
              </div> */}
            </div>

            {/* Right Column - Image with AI Analysis */}
            <div className="order-1 md:order-2 relative -mt-11 -mr-11">
              <div className="rounded-es-[15%] overflow-hidden ">
                <img
                  src="/lovable-uploads/how-it-works-image.png"
                  alt="AI analysis of jumping technique with feedback overlays"
                  className="w-auto min-h-[85vh] max-h-[85vh] object-cover"
                />

                {/* AI Analysis Overlays */}
                <div className="absolute top-[20%] right-[15%] bg-white p-3 rounded-lg shadow-md text-sm max-w-[200px]">
                  <p className="text-gray-800">
                    You're leaning forward by 7 degrees, sit tall and engage
                    your core.
                  </p>
                </div>

                <div className="absolute bottom-[30%] left-[10%] bg-white p-3 rounded-lg shadow-md text-sm max-w-[200px]">
                  <p className="text-gray-800">
                    Release properly, give your horse freedom over the fence.
                  </p>
                </div>

                <div className="absolute top-[60%] right-[10%] bg-white p-3 rounded-lg shadow-md text-sm max-w-[200px]">
                  <p className="text-gray-800">
                    Your jump approach speed is slightly high — try slowing down
                    for better control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <AnimatedSection animation="fade-in" className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-center mb-12 text-purple-900">
              How AI Equestrian Works
            </h2>
            <p className="text-center text-gray-700 max-w-3xl mx-auto mb-16">
              Choose your equestrian discipline to learn how our AI-powered
              training solutions can help you improve your performance.
            </p>

            <DisciplineSelector />
          </div>
        </AnimatedSection>

        <PrivacySection />
        <BenefitsSection />
        <FaqSection pageName="howItWorks" />
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
