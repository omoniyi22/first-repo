
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardHeader = () => {
  const { user } = useAuth();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'Rider';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-purple-900">
          {language === 'en' ? 'Welcome,' : 'Bienvenido,'} {displayName}
        </h1>
        <p className="mt-2 text-purple-700">
          {language === 'en' 
            ? 'Track your progress and upload new dressage tests' 
            : 'Sigue tu progreso y sube nuevas pruebas de doma'}
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <Button className="bg-purple-700 hover:bg-purple-800">
          <Upload className="mr-2 h-4 w-4" />
          {language === 'en' ? 'Upload Test' : 'Subir Prueba'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
