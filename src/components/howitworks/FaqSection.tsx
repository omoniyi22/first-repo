import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import AnimatedSection from "../ui/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FaqItem = ({ question, answer, isOpen, toggleOpen }: FaqItemProps) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-5 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <h3 className="font-medium text-lg text-gray-900">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-700">{answer}</p>
      </div>
    </div>
  );
};

const FaqSection = ({ pageName }: { pageName?: string }) => {
  const { language } = useLanguage();

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Sample FAQ data
  let bg =
    pageName == "howItWorks"
      ? "bg-gradient-to-r from-[#e4defb] to-[#d8e4fb]"
      : pageName == "JumpingHowItWorks"
      ? "bg-[#eff6ff]"
      : "bg-purple-50";

  const btnBg =
    pageName == "JumpingHowItWorks" ? "bg-blue-600 hover:bg-blue-600" : "";
  const faqs = [
    {
      question:
        language === "en"
          ? "How accurate is the AI analysis of score sheets?"
          : "¿Qué tan precisa es el análisis de hojas de puntuación con IA?",
      answer:
        language === "en"
          ? "Our AI system has been trained on thousands of dressage tests and has achieved over 98% accuracy in reading and interpreting score sheets. The system is continuously learning and improving with each new score sheet processed."
          : "Nuestro sistema de IA ha sido entrenado con miles de pruebas de doma clásica y ha alcanzado una precisión de más del 98% al leer e interpretar hojas de puntuación. El sistema sigue aprendiendo y mejorando con cada hoja procesada.",
    },
    {
      question:
        language === "en"
          ? "What dressage test formats are supported?"
          : "¿Qué formatos de prueba de doma son compatibles?",
      answer:
        language === "en"
          ? "We support all major dressage test formats including FEI, USDF, British Dressage, Equestrian Australia, and many others. If you have a specific format not listed, please contact us and we'll work to add support for it."
          : "Admitimos todos los formatos principales de pruebas de doma, incluyendo FEI, USDF, British Dressage, Equestrian Australia, entre otros. Si tienes un formato específico que no aparece en la lista, contáctanos y trabajaremos para añadirlo.",
    },
    {
      question:
        language === "en"
          ? "How do I upload my score sheets?"
          : "¿Cómo subo mis hojas de puntuación?",
      answer:
        language === "en"
          ? "You can either take a photo of your score sheet using your smartphone or upload a digital copy (PDF, JPEG, PNG). Our system will automatically process and analyze the sheet regardless of the format."
          : "Puedes tomar una foto de tu hoja de puntuación con tu smartphone o subir una copia digital (PDF, JPEG, PNG). Nuestro sistema la procesará y analizará automáticamente sin importar el formato.",
    },
    {
      question:
        language === "en"
          ? "Can I track multiple horses in my account?"
          : "¿Puedo hacer seguimiento de varios caballos en mi cuenta?",
      answer:
        language === "en"
          ? "Yes, our Premium and Professional plans allow you to create and track multiple horse profiles. This lets you manage and analyze the progress of different horses separately."
          : "Sí, nuestros planes Premium y Profesional te permiten crear y seguir múltiples perfiles de caballos. Esto te permite gestionar y analizar el progreso de cada caballo por separado.",
    },
    {
      question:
        language === "en"
          ? "How are the training recommendations generated?"
          : "¿Cómo se generan las recomendaciones de entrenamiento?",
      answer:
        language === "en"
          ? "Our AI analyzes your scores and identifies patterns and areas for improvement. It then matches these with our database of exercises developed by FEI-level trainers and competitors. Recommendations are tailored to your specific needs and level."
          : "Nuestra IA analiza tus puntuaciones e identifica patrones y áreas de mejora. Luego, las relaciona con nuestra base de datos de ejercicios desarrollados por entrenadores y competidores de nivel FEI. Las recomendaciones se adaptan a tus necesidades y nivel específicos.",
    },
    {
      question:
        language === "en"
          ? "Is my data secure and private?"
          : "¿Mis datos están seguros y son privados?",
      answer:
        language === "en"
          ? "Absolutely. We take data privacy very seriously. All your score sheets and performance data are encrypted and stored securely. We never share your personal data with third parties without your explicit consent."
          : "Absolutamente. Nos tomamos muy en serio la privacidad de los datos. Todas tus hojas de puntuación y datos de rendimiento están encriptados y almacenados de forma segura. Nunca compartimos tus datos personales con terceros sin tu consentimiento explícito.",
    },
    {
      question:
        language === "en"
          ? "Can I share my results with my trainer?"
          : "¿Puedo compartir mis resultados con mi entrenador?",
      answer:
        language === "en"
          ? "Yes, our platform allows you to share your analysis results and training recommendations with your trainer. You can either grant them access to your account or send them specific reports via email."
          : "Sí, nuestra plataforma te permite compartir tus resultados de análisis y recomendaciones de entrenamiento con tu entrenador. Puedes otorgarles acceso a tu cuenta o enviarles informes específicos por correo electrónico.",
    },
    {
      question:
        language === "en"
          ? "How often should I upload new score sheets?"
          : "¿Con qué frecuencia debo subir nuevas hojas de puntuación?",
      answer:
        language === "en"
          ? "For best results, we recommend uploading each new test you ride, whether from competitions or training sessions. This provides the most comprehensive data for our AI to analyze trends and progress over time."
          : "Para obtener los mejores resultados, te recomendamos subir cada nueva prueba que realices, ya sea en competiciones o entrenamientos. Esto proporciona los datos más completos para que nuestra IA analice tendencias y avances a lo largo del tiempo.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-20 ${bg}`}>
      <div className="container mx-auto px-6">
        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-purple-900 mb-4">
            {language === "en"
              ? "Frequently Asked Questions"
              : "Preguntas frecuentes"}
          </h2>
          <p className="text-lg text-gray-700">
            {language === "en"
              ? "Have questions about AI Equestrian? Find answers to the most common questions below."
              : "¿Tienes preguntas sobre AI Equestrian? Encuentra respuestas a las preguntas más frecuentes a continuación."}
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFaq(index)}
            />
          ))}
        </div>

        <AnimatedSection
          animation="fade-in"
          className="text-center max-w-2xl mx-auto mt-12"
        >
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            {language === "en"
              ? "Still have questions?"
              : "¿Aún tienes preguntas?"}
          </h3>
          <p className="text-gray-700 mb-6">
            {language === "en"
              ? "If you couldn't find the answer to your question, please don't hesitate to reach out to our support team."
              : "Si no puede encontrar la respuesta a su pregunta, no dude en comunicarse con nuestro equipo de soporte."}
          </p>
          <Link to="mailto:info@equineaintelligence.com">
            <Button variant="primary" className={btnBg}>
              <MessageCircle className="w-5 h-5" />
              {language === "en"
                ? "Contact Support"
                : "Contactar con soporte técnico"}
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FaqSection;
