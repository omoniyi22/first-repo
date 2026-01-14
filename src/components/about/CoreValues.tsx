import { useLanguage } from "@/contexts/LanguageContext";
import { Book, ShieldCheck, Users, Lightbulb } from "lucide-react";

interface ValueItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ValueItem = ({ icon, title, description }: ValueItemProps) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const CoreValues = () => {
  const { language } = useLanguage();

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8 text-purple-700" />,
      title: language === "en" ? "Innovation" : "Innovación",
      description:
        language === "en"
          ? "Pushing the boundaries of what's possible in equestrian training"
          : "Impulsando los límites de lo posible en el entrenamiento ecuestre",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-purple-700" />,
      title: language === "en" ? "Precision" : "Precisión",
      description:
        language === "en"
          ? "Delivering accurate, reliable analysis and recommendations"
          : "Ofreciendo análisis y recomendaciones precisos y confiables",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-700" />,
      title: language === "en" ? "Community" : "Comunidad",
      description:
        language === "en"
          ? "Building a supportive network of riders and trainers"
          : "Construyendo una red solidaria de jinetes y entrenadores",
    },
    {
      icon: <Book className="h-8 w-8 text-purple-700" />,
      title: language === "en" ? "Tradition" : "Tradición",
      description:
        language === "en"
          ? "Respecting classical principles while embracing technology"
          : "Respetando los principios clásicos mientras se adopta la tecnología",
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-purple-900 mb-12">
          {language === "en"
            ? "Our Core Values"
            : "Nuestros valores fundamentales"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <ValueItem
              key={index}
              icon={value.icon}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoreValues;
