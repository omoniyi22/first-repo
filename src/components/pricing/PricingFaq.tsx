
import { useState } from 'react';
import AnimatedSection from '../ui/AnimatedSection';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PricingFaq = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const faqs = language === 'en' ? [
    {
      question: "How accurate is the AI analysis of score sheets?",
      answer: "Our AI system has been trained on thousands of dressage tests and has achieved over 98% accuracy in reading and interpreting score sheets. The system is continuously learning and improving with each new score sheet processed."
    },
    {
      question: "What dressage test formats are supported?",
      answer: "We support all major dressage test formats including FEI, USDF, British Dressage, Equestrian Australia, and many others. If you have a specific format not listed, please contact us and we'll work to add support for it."
    },
    {
      question: "How do I upload my score sheets?",
      answer: "You can either take a photo of your score sheet using your smartphone or upload a digital copy (PDF, JPEG, PNG). Our system will automatically process and analyze the sheet regardless of the format."
    },
    {
      question: "Can I track multiple horses in my account?",
      answer: "Yes, our Premium and Professional plans allow you to create and track multiple horse profiles. This lets you manage and analyze the progress of different horses separately."
    },
    {
      question: "How are the training recommendations generated?",
      answer: "Our AI analyzes your scores and identifies patterns and areas for improvement. It then matches these with our database of exercises developed by FEI-level trainers and competitors. Recommendations are tailored to your specific needs and level."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We take data privacy very seriously. All your score sheets and performance data are encrypted and stored securely. We never share your personal data with third parties without your explicit consent."
    },
    {
      question: "Can I share my results with my trainer?",
      answer: "Yes, our platform allows you to share your analysis results and training recommendations with your trainer. You can either grant them access to your account or send them specific reports via email."
    },
    {
      question: "How often should I upload new score sheets?",
      answer: "For best results, we recommend uploading each new test you ride, whether from competitions or training sessions. This provides the most comprehensive data for our AI to analyze trends and progress over time."
    }
  ] : [
    {
      question: "¿Qué tan preciso es el análisis de IA de las hojas de puntuación?",
      answer: "Nuestro sistema de IA ha sido entrenado con miles de pruebas de doma y ha alcanzado más del 98% de precisión en la lectura e interpretación de hojas de puntuación. El sistema está continuamente aprendiendo y mejorando con cada nueva hoja de puntuación procesada."
    },
    {
      question: "¿Qué formatos de prueba de doma son compatibles?",
      answer: "Admitimos todos los formatos principales de pruebas de doma, incluidos FEI, USDF, British Dressage, Equestrian Australia y muchos otros. Si tienes un formato específico que no está en la lista, contáctanos y trabajaremos para agregar soporte para él."
    },
    {
      question: "¿Cómo subo mis hojas de puntuación?",
      answer: "Puedes tomar una foto de tu hoja de puntuación usando tu smartphone o subir una copia digital (PDF, JPEG, PNG). Nuestro sistema procesará y analizará automáticamente la hoja independientemente del formato."
    },
    {
      question: "¿Puedo seguir varios caballos en mi cuenta?",
      answer: "Sí, nuestros planes Premium y Profesional te permiten crear y seguir múltiples perfiles de caballos. Esto te permite gestionar y analizar el progreso de diferentes caballos por separado."
    },
    {
      question: "¿Cómo se generan las recomendaciones de entrenamiento?",
      answer: "Nuestra IA analiza tus puntuaciones e identifica patrones y áreas de mejora. Luego, las relaciona con nuestra base de datos de ejercicios desarrollados por entrenadores y competidores de nivel FEI. Las recomendaciones se adaptan a tus necesidades y nivel específicos."
    },
    {
      question: "¿Mis datos están seguros y privados?",
      answer: "Absolutamente. Nos tomamos muy en serio la privacidad de los datos. Todas tus hojas de puntuación y datos de rendimiento están encriptados y almacenados de forma segura. Nunca compartimos tus datos personales con terceros sin tu consentimiento explícito."
    },
    {
      question: "¿Puedo compartir mis resultados con mi entrenador?",
      answer: "Sí, nuestra plataforma te permite compartir tus resultados de análisis y recomendaciones de entrenamiento con tu entrenador. Puedes otorgarles acceso a tu cuenta o enviarles informes específicos por correo electrónico."
    },
    {
      question: "¿Con qué frecuencia debo cargar nuevas hojas de puntuación?",
      answer: "Para obtener los mejores resultados, te recomendamos cargar cada nueva prueba que montes, ya sea de competiciones o sesiones de entrenamiento. Esto proporciona los datos más completos para que nuestra IA analice tendencias y progresos a lo largo del tiempo."
    }
  ];

  return (
    <section className="py-20 bg-silver-50">
      <div className="container mx-auto px-6">
        <AnimatedSection animation="fade-in" className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-navy-900 mb-4">
            {t["faq-title"]}
          </h2>
          <p className="text-lg text-navy-700">
            {t["faq-description"]}
          </p>
        </AnimatedSection>
        
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-silver-200 last:border-b-0">
                <AccordionTrigger className="text-left font-medium text-lg text-navy-900 py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-navy-700 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <AnimatedSection animation="fade-in" className="text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-xl font-medium text-navy-900 mb-4">
            {t["still-questions"]}
          </h3>
          <p className="text-navy-700 mb-6">
            {t["questions-text"]}
          </p>
          <Button className="bg-navy-700 hover:bg-navy-800 text-white px-6 py-3 rounded-lg text-base font-medium h-auto flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {t["contact-support"]}
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingFaq;
