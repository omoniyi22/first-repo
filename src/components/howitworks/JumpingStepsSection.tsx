import { useState } from "react";
import { FilePenLine, BarChart3, BookOpen, Lightbulb } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const JumpingStepsSection = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { language } = useLanguage();
  const steps = [
    {
      id: 1,
      icon: <FilePenLine className="w-6 h-6" />,
      title:
        language === "en"
          ? "Upload Course Maps & Videos"
          : "Sube mapas del recorrido y videos",
      description:
        language === "en"
          ? "Simply upload photos of your course maps or record your jumping rounds. Our system analyzes both documents and videos to provide comprehensive insights for all competition levels."
          : "Simplemente sube fotos de tus mapas del recorrido o graba tus rondas de salto. Nuestro sistema analiza tanto los documentos como los videos para ofrecer información completa en todos los niveles de competición.",
      image: "/placeholder.svg",
      features:
        language === "en"
          ? [
              "Support for international and national jumping competitions",
              "Easy drag-and-drop or camera upload",
              "Secure and private data handling",
              "Automatic jump type and course pattern recognition",
            ]
          : [
              "Compatibilidad con competiciones de salto nacionales e internacionales",
              "Carga sencilla mediante arrastrar y soltar o cámara",
              "Manejo seguro y privado de datos",
              "Reconocimiento automático del tipo de salto y patrón del recorrido",
            ],
    },
    {
      id: 2,
      icon: <BarChart3 className="w-6 h-6" />,
      title: language === "en" ? "AI Analysis" : "Análisis con IA",
      description:
        language === "en"
          ? "Our advanced artificial intelligence analyzes your course maps, jumping technique, and performance patterns to identify both strengths and areas for improvement."
          : "Nuestra avanzada inteligencia artificial analiza tus mapas del recorrido, técnica de salto y patrones de rendimiento para identificar fortalezas y áreas de mejora.",
      image: "/placeholder.svg",
      features:
        language === "en"
          ? [
              "Detailed breakdown of jumping technique",
              "Pattern recognition across multiple rounds",
              "Stride length and timing analysis",
              "Comparison to your previous performances",
            ]
          : [
              "Desglose detallado de la técnica de salto",
              "Reconocimiento de patrones en múltiples rondas",
              "Análisis de longitud de tranco y sincronización",
              "Comparación con tus actuaciones anteriores",
            ],
    },
    {
      id: 3,
      icon: <Lightbulb className="w-6 h-6" />,
      title:
        language === "en"
          ? "Personalized Recommendations"
          : "Recomendaciones personalizadas",
      description:
        language === "en"
          ? "Receive tailored training recommendations and exercises specifically designed to address your improvement areas and enhance your strengths in show jumping."
          : "Recibe recomendaciones de entrenamiento y ejercicios personalizados específicamente diseñados para mejorar tus áreas débiles y potenciar tus fortalezas en salto ecuestre.",
      image: "/placeholder.svg",
      features:
        language === "en"
          ? [
              "Custom exercise selection from our library",
              "Difficulty progression based on your level",
              "Focus on specific jump types needing improvement",
              "Weekly training plans and schedules",
            ]
          : [
              "Selección personalizada de ejercicios de nuestra biblioteca",
              "Progresión de dificultad según tu nivel",
              "Enfoque en tipos de salto específicos que necesitan mejora",
              "Planes y horarios de entrenamiento semanales",
            ],
    },
    {
      id: 4,
      icon: <BookOpen className="w-6 h-6" />,
      title:
        language === "en" ? "Progress Tracking" : "Seguimiento del progreso",
      description:
        language === "en"
          ? "Monitor your improvement over time with comprehensive analytics dashboards and progress reports that show your development as a rider."
          : "Supervisa tu progreso con el tiempo mediante paneles analíticos integrales e informes que muestran tu desarrollo como jinete.",
      image: "/placeholder.svg",
      features:
        language === "en"
          ? [
              "Visual charts of performance improvements",
              "Achievement tracking and milestones",
              "Long-term trend analysis",
              "Performance predictions for future competitions",
            ]
          : [
              "Gráficos visuales de mejoras en el rendimiento",
              "Seguimiento de logros y hitos",
              "Análisis de tendencias a largo plazo",
              "Predicciones de rendimiento para futuras competiciones",
            ],
    },
  ];

  const activeStepData =
    steps.find((step) => step.id === activeStep) || steps[0];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-purple-900 mb-6">
            {language === "en"
              ? "How AI Jumping Trainer Works"
              : "Cómo funciona el entrenador de saltos con IA"}
          </h1>
          <p className="text-lg text-gray-700">
            {language === "en"
              ? "Our advanced platform combines state-of-the-art AI technology with expert show jumping knowledge to provide detailed course analysis and personalized training recommendations that enhance your riding technique and competition results."
              : "Nuestra plataforma avanzada combina tecnología de inteligencia artificial de última generación con conocimiento experto en saltos para brindar un análisis detallado del recorrido y recomendaciones de entrenamiento personalizadas que mejoran su técnica de conducción y los resultados de la competencia."}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="space-y-3">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-5 rounded-xl flex items-center transition-all duration-300 ${
                      activeStep === step.id
                        ? "bg-blue-700 text-white shadow-md"
                        : "bg-blue-50 text-gray-800 hover:bg-blue-100"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        activeStep === step.id ? "bg-blue-500" : "bg-white"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div
                        className={`text-sm ${
                          activeStep === step.id
                            ? "text-blue-100"
                            : "text-gray-600"
                        }`}
                      >
                        {language === "en" ? "Step" : "Paso"}

                        {step.id}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatedSection
              key={activeStep}
              animation="fade-in"
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="aspect-video bg-blue-50 flex items-center justify-center">
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  {/* This would be a real image or animation in production */}
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-blue-200 mx-auto flex items-center justify-center mb-4">
                      {activeStepData.icon}
                    </div>
                    <h3 className="text-gray-800 font-medium">
                      {language === "en" ? "Step" : "Paso"}
                      {activeStepData.id}: {activeStepData.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-2xl font-serif font-semibold text-purple-900 mb-4">
                  {activeStepData.title}
                </h2>

                <p className="text-gray-700 mb-8">
                  {activeStepData.description}
                </p>

                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {language === "en"
                    ? "Key Features:"
                    : "Características principales:"}
                </h3>

                <ul className="space-y-3">
                  {activeStepData.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-600 mr-3 mt-0.5"
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection
          animation="fade-in"
          className="bg-blue-50 rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-purple-900 mb-6">
                {language === "en"
                  ? "See the Platform in Action"
                  : "Vea la plataforma en acción"}
              </h2>

              <p className="text-gray-700 mb-8">
                {language === "en"
                  ? "Watch our demo to see how AI Jumping Trainer can transform your training approach powerful analysis of courses, faults, and jumping technique."
                  : "Vea nuestra demostración para ver cómo AI Jumping Trainer puede transformar su enfoque de entrenamiento con un análisis poderoso de recorridos, fallas y técnica de salto."}
              </p>

              <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white flex items-center">
                Watch Demo
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/20 to-blue-400/20 rounded-xl transform rotate-2 -z-10" />
              <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                {/* This would be a video thumbnail in production */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-700 mx-auto flex items-center justify-center mb-4 cursor-pointer hover:bg-blue-800 transition-colors">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {language === "en"
                      ? "Platform Demo"
                      : "Demostración de la plataforma"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default JumpingStepsSection;
