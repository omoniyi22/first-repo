import { useEffect } from "react";
import { SEO, getPageMetadata } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/about/HeroSection";
import MissionAndVision from "@/components/about/MissionAndVision";
import CoreValues from "@/components/about/CoreValues";
import KeyStatistics from "@/components/about/KeyStatistics";
import ProblemsWeSolve from "@/components/about/ProblemsWeSolve";
import EquestrianTeamSection from "@/components/about/EquestrianTeamSection";
import DisciplineSpecificTabs from "@/components/about/DisciplineSpecificTabs";

// The following sections are preserved from the existing About page
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
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

  // Get page metadata
  const seoMetadata = getPageMetadata("about", {
    title: "About AI Equestrian | Advanced Equestrian Analytics",
    description:
      "Learn about AI Equestrian's mission to transform dressage and jumping training through artificial intelligence and data-driven performance analysis.",
    canonicalUrl: "/about",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Mission & Vision Section */}
        <MissionAndVision />

        {/* Core Values Section */}
        <CoreValues />

        {/* Key Statistics Section - Added back */}
        {/* <KeyStatistics /> */}

        {/* Problems We Solve Section */}
        <ProblemsWeSolve />

        {/* Discipline-Specific Tabs Section */}
        <DisciplineSpecificTabs />

        {/* Partnerships and Sponsorships Section - Preserved from existing About page */}
        <section className="py-16 bg-purple-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12 reveal-scroll">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-blue-900">
                {language === "en"
                  ? "Partnerships & Sponsorships"
                  : "Asociaciones y patrocinios"}
              </h2>
              <p className="text-lg text-gray-700">
                {language === "en"
                  ? "We're proud to collaborate with leading equestrian organizations and brands to advance the sport and support riders at all levels."
                  : "Estamos orgullosos de colaborar con las principales organizaciones y marcas ecuestres para promover el deporte y apoyar a los jinetes en todos los niveles."}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto reveal-scroll">
              {/* Partner Card 1 */}
              <Card className="border border-purple-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center font-serif text-blue-800">
                    {language === "en" ? "TLA Stables" : "Establos TLA"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between min-h-[300px] text-center">
                  <p className="text-gray-700 mb-4">
                    {language === "en"
                      ? "We specialise in training, sourcing, and selling top-quality showjumping horses to clients around the world. With a passion for excellence and a proven track record, we match talented horses with ambitious riders at every level."
                      : "Nos especializamos en el entrenamiento, la búsqueda y la venta de caballos de salto de alta calidad a clientes de todo el mundo. Con pasión por la excelencia y una trayectoria comprobada, conectamos caballos talentosos con jinetes ambiciosos de todos los niveles."}
                  </p>
                  <div className="h-20 w-20 bg-purple-100 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                    <a
                      href="https://www.instagram.com/tla_stables?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      target="_blank"
                    >
                      <img
                        src="/lovable-uploads/tla-stables.jpeg"
                        alt=""
                        className="max-w-full max-h-full object-cover"
                      />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Partner Card 2 */}
              <Card className="border border-purple-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center font-serif text-blue-800">
                    {language === "en"
                      ? "Elite Equine Equipment"
                      : "Equipos equinos de élite"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between min-h-[300px] text-center">
                  <p className="text-gray-700 mb-4">
                    {language === "en"
                      ? "Premium equipment manufacturer partnering to integrate technology with traditional training tools."
                      : "Fabricante de equipos premium que se asocia para integrar la tecnología con herramientas de capacitación tradicionales."}
                  </p>
                  <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center p-2 overflow-hidden">
                    <a href="https://appetitecreative.com/" target="_blank">
                      <img
                        src="/lovable-uploads/appetite.png"
                        alt=""
                        className="max-w-full max-h-full object-cover"
                      />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Partner Card 3 */}
              <Card className="border border-purple-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-center font-serif text-blue-800">
                    {language === "en" ? "Horse Care" : "Cuidado de caballos"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between min-h-[300px] text-center">
                  <p className="text-gray-700 mb-4">
                    {language === "en"
                      ? "Horse Organics- Founded in August 2019, Horse Organics is a family-driven venture born from our deep love for horses. Starting with a single product, our commitment to excellence in horse care has led to a curated line of over five exceptional products"
                      : "Horse Organics: Fundada en agosto de 2019, Horse Organics es una empresa familiar que nació de nuestro profundo amor por los caballos. A partir de un solo producto, nuestro compromiso con la excelencia en el cuidado equino ha dado lugar a una línea selecta de más de cinco productos excepcionales."}
                  </p>
                  <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center">
                    <a href="https://horscare.com/shop" target="_blank">
                      <img
                        src="/lovable-uploads/horse-organic.png"
                        alt=""
                        className="max-w-full max-h-full object-cover"
                      />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center reveal-scroll">
              <h3 className="text-xl font-medium mb-4 text-purple-800">
                {language === "en"
                  ? "Interested in partnering with AI Equestrian?"
                  : "¿Interesada en asociarse con AI Equestrian?"}
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                {language === "en"
                  ? "We're always looking to collaborate with organizations and brands that share our vision for the future of equestrian training."
                  : "Siempre buscamos colaborar con organizaciones y marcas que compartan nuestra visión del futuro del entrenamiento ecuestre."}
              </p>
              <Link
                to="mailto:info@equineaintelligence.com"
                className="inline-flex items-center py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors duration-300 font-medium self-start mt-4"
              >
                {language === "en"
                  ? "Contact for Partnership Opportunities"
                  : "Contacto para oportunidades de asociación"}
              </Link>
            </div>
          </div>
        </section>

        {/* Team Section - Preserving existing section */}
        <EquestrianTeamSection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
