
import { Book, ShieldCheck, Users, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
      <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const CoreValues = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];

  const values = [
    {
      icon: <Lightbulb className="h-8 w-8 text-purple-700" />,
      title: t["innovation"],
      description: t["innovation-desc"]
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-purple-700" />,
      title: t["precision"],
      description: t["precision-desc"]
    },
    {
      icon: <Users className="h-8 w-8 text-purple-700" />,
      title: t["community"],
      description: t["community-desc"]
    },
    {
      icon: <Book className="h-8 w-8 text-purple-700" />,
      title: t["tradition"],
      description: t["tradition-desc"]
    }
  ];

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-serif font-semibold text-center text-purple-900 mb-12">
          {t["our-core-values"]}
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
