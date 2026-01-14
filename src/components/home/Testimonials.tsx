import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { language } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position:
        language === "en"
          ? "Amateur Dressage Rider"
          : "Jinete de Doma Aficionada",
      quote:
        language === "en"
          ? "AI Dressage Trainer has completely transformed my training approach. The personalized recommendations helped me improve my scores by 12% in just three months!"
          : "AI Dressage Trainer ha transformado completamente mi enfoque de entrenamiento. Las recomendaciones personalizadas me ayudaron a mejorar mis puntuaciones en un 12% en solo tres meses!",
      image: "https://randomuser.me/api/portraits/women/25.jpg",
    },
    {
      id: 2,
      name: "Michael Taylor",
      position:
        language === "en" ? "Professional Trainer" : "Entrenador Profesional",
      quote:
        language === "en"
          ? "As a trainer working with multiple students, this platform has been invaluable. The AI analysis spots patterns I might miss, and the exercise recommendations are spot on."
          : "Como entrenador trabajando con múltiples estudiantes, esta plataforma ha sido invaluable. El análisis de IA detecta patrones que podría pasar por alto, y las recomendaciones de ejercicios son muy acertadas.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      position:
        language === "en" ? "FEI Level Competitor" : "Competidora Nivel FEI",
      quote:
        language === "en"
          ? "The detailed breakdown of my test scores has helped me focus my training on specific movements. The AI recommendations are surprisingly insightful."
          : "El desglose detallado de mis puntuaciones de prueba me ha ayudado a enfocar mi entrenamiento en movimientos específicos. Las recomendaciones de IA son sorprendentemente perspicaces.",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            {language === "en"
              ? "What Our Users Say"
              : "Lo que dicen nuestras usuarias"}
          </h2>
          <p className="text-lg text-gray-700">
            {language === "en"
              ? "Hear from riders who have transformed their dressage training with our AI platform"
              : "Escuche a los jinetes que han transformado su entrenamiento de doma con nuestra plataforma de IA"}
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-purple-50 rounded-2xl p-8 md:p-10 shadow-sm">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-sm">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <svg
                            className="h-8 w-8 text-purple-300 mb-4"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104-6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>

                          <p className="text-lg md:text-xl text-gray-800 mb-6">
                            {testimonial.quote}
                          </p>

                          <div>
                            <h4 className="font-serif font-medium text-gray-900">
                              {testimonial.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {testimonial.position}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 gap-4">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2 items-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      index === activeIndex ? "bg-purple-700" : "bg-purple-200"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <AnimatedSection animation="fade-in" className="mt-20">
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-4">
                  {language === "en"
                    ? "Ready to Transform Your Dressage Training?"
                    : "¿Estás listo para transformar tu entrenamiento de doma?"}
                </h3>

                <p className="text-purple-100 mb-8">
                  {language === "en"
                    ? "Join hundreds of riders who have improved their performance with AI-powered analysis and personalized training recommendations."
                    : "Únase a cientos de ciclistas que han mejorado su rendimiento con análisis impulsados por IA y recomendaciones de entrenamiento personalizadas."}
                </p>

                <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
                  <button className="w-full md:w-auto bg-white text-purple-800 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                    {language === "en"
                      ? "Start Free Trial"
                      : "Comience una prueba gratuita"}
                  </button>
                </div>
              </div>

              <div className="bg-purple-800 h-full p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-purple-700 rounded-full p-2 mr-4 mt-1">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {language === "en"
                          ? "Advanced AI Analysis"
                          : "Análisis avanzado de IA"}
                      </h4>
                      <p className="text-purple-200 text-sm">
                        {language === "en"
                          ? "Upload your score sheets for instant AI-powered feedback"
                          : "Sube tus hojas de puntuación para recibir comentarios instantáneos impulsados por IA"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-700 rounded-full p-2 mr-4 mt-1">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {language === "en"
                          ? "Personalized Training"
                          : "Entrenamiento personalizado"}
                      </h4>
                      <p className="text-purple-200 text-sm">
                        {language === "en"
                          ? "Get tailored exercises based on your specific needs"
                          : "Obtenga ejercicios personalizados según sus necesidades específicas"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-700 rounded-full p-2 mr-4 mt-1">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {language === "en"
                          ? "Progress Tracking"
                          : "Seguimiento del progreso"}
                      </h4>
                      <p className="text-purple-200 text-sm">
                        {language === "en"
                          ? "Monitor your improvement with detailed analytics"
                          : "Monitorea tu mejora con análisis detallados"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-700 rounded-full p-2 mr-4 mt-1">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {language === "en"
                          ? "Comprehensive Library"
                          : "Biblioteca completa"}
                      </h4>
                      <p className="text-purple-200 text-sm">
                        {language === "en"
                          ? "Access to 200+ dressage training exercises"
                          : "Acceso a más de 200 ejercicios de entrenamiento de doma"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Testimonials;
