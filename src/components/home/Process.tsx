
import { Upload, CloudLightning, BarChart3, Lightbulb } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import { useLanguage } from '@/contexts/LanguageContext';

const Process = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const steps = [
    {
      icon: <Upload className="w-8 h-8 text-purple-600" />,
      title: language === 'en' ? "Upload Score Sheets" : "Subir Hojas de Puntuación",
      description: language === 'en' 
        ? "Take a photo or upload your dressage test score sheets through our intuitive interface."
        : "Toma una foto o sube tus hojas de puntuación de prueba de doma a través de nuestra interfaz intuitiva.",
      delay: "delay-100"
    },
    {
      icon: <CloudLightning className="w-8 h-8 text-purple-600" />,
      title: language === 'en' ? "AI Processing" : "Procesamiento de IA",
      description: language === 'en'
        ? "Our advanced AI analyzes your scores, identifying patterns and areas for improvement."
        : "Nuestra IA avanzada analiza tus puntuaciones, identificando patrones y áreas de mejora.",
      delay: "delay-200"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: language === 'en' ? "Detailed Analysis" : "Análisis Detallado",
      description: language === 'en'
        ? "Receive comprehensive breakdowns of your performance with visual analytics."
        : "Recibe análisis completos de tu rendimiento con visualizaciones analíticas.",
      delay: "delay-300"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-purple-600" />,
      title: language === 'en' ? "Custom Recommendations" : "Recomendaciones Personalizadas",
      description: language === 'en'
        ? "Get personalized training exercises tailored to your specific improvement areas."
        : "Obtén ejercicios de entrenamiento personalizados adaptados a tus áreas específicas de mejora.",
      delay: "delay-400"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            {language === 'en' ? "How AI Dressage Trainer Works" : "Cómo Funciona el Entrenador de Doma con IA"}
          </h2>
          <p className="text-lg text-purple-700">
            {language === 'en'
              ? "Our innovative platform uses advanced AI to transform how you approach dressage training"
              : "Nuestra plataforma innovadora utiliza IA avanzada para transformar tu enfoque de entrenamiento de doma"}
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <AnimatedSection 
              key={index}
              animation="fade-in"
              delay={step.delay as any}
              className="relative"
            >
              <div className="glass-card h-full p-6 relative overflow-hidden group">
                {/* Subtle animated border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 via-purple-400/30 to-purple-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', }} />
                
                <div className="relative z-10">
                  <div className="bg-purple-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-100/50 flex items-center justify-center">
                    <span className="font-medium text-purple-800">{index + 1}</span>
                  </div>
                  
                  <h3 className="text-xl font-serif font-medium text-purple-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-purple-700">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
