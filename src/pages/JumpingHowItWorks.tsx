import React from "react";
import { useEffect } from "react";
import { SEO, generateDisciplineMetadata } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JumpingStepsSection from "@/components/howitworks/JumpingStepsSection";
import JumpingFaqSection from "@/components/howitworks/JumpingFaqSection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import FaqSection from "@/components/howitworks/FaqSection";
import { useLanguage } from "@/contexts/LanguageContext";

const JumpingHowItWorks = () => {
  const { language } = useLanguage();
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

  // Get discipline-specific metadata
  const seoMetadata = generateDisciplineMetadata("Jumping", {
    canonicalUrl: "/jumping/how-it-works",
    ogImage: "/lovable-uploads/6f7781f9-7971-457e-8fa3-7494ec0725f1.png",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      {/*       
      <div className="container mx-auto px-6 pt-24 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/jumping">Jumping</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>How It Works</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div> */}

      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="w-full h-80 md:h-[calc(100vh-64px)] overflow-hidden relative">
          <img
            src="/lovable-uploads/6f7781f9-7971-457e-8fa3-7494ec0725f1.png"
            alt="Horse and rider jumping over competition obstacle with AI analytics overlay"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl drop-shadow-lg text-shadow-lg">
                {language === "en"
                  ? "How AI Jumping Analysis Works"
                  : "Cómo funciona el análisis de saltos de IA"}
              </h1>
              <p className="text-xl text-white/90 max-w-xl mt-4 drop-shadow-lg text-shadow-md">
                {language === "en"
                  ? "Understand the process behind our AI-powered equestrian jumping analysis"
                  : "Comprenda el proceso detrás de nuestro análisis de salto ecuestre impulsado por IA"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main>
        <JumpingStepsSection />
        <FaqSection pageName="JumpingHowItWorks" />
        {/* <JumpingFaqSection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default JumpingHowItWorks;
