
import { Button } from '@/components/ui/button';
import { Save, Upload, Loader2 } from 'lucide-react';
import { testStorageUpload } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave }) => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const { language } = useLanguage();
  
  const handleStorageTest = async () => {
    setIsTesting(true);
    try {
      const result = await testStorageUpload();
      toast({
        title: result.success ? 
          (language === 'en' ? "Storage test successful" : "Prueba de almacenamiento exitosa") : 
          (language === 'en' ? "Storage test failed" : "Prueba de almacenamiento fallida"),
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: language === 'en' ? "Storage test failed" : "Prueba de almacenamiento fallida",
        description: error instanceof Error ? error.message : 
          (language === 'en' ? "Unknown error occurred" : "Ocurrió un error desconocido"),
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="flex justify-end mt-6 gap-4">
      <Button 
        className="bg-purple-700 hover:bg-purple-800" 
        size="lg"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? 'Saving...' : 'Guardando...'}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Save Profile' : 'Guardar Perfil'}
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        className="border-purple-300 text-purple-700 hover:bg-purple-50" 
        size="lg"
        onClick={handleStorageTest}
        disabled={isTesting}
      >
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? 'Testing...' : 'Probando...'}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {language === 'en' ? 'Upload Test' : 'Subir Prueba'}
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfileActions;
