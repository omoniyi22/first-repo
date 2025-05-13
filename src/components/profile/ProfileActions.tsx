import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave }) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const handleSave = async () => {
    try {
      await onSave();
      // After successful save, the toast will be shown from the parent component
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  
  return (
    <div className="flex justify-end mt-4 sm:mt-6 gap-3 sm:gap-4">
      <Button 
        className="bg-purple-700 hover:bg-purple-800 text-sm sm:text-base py-2 px-4 sm:py-2.5 sm:px-5" 
        onClick={handleSave}
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
    </div>
  );
};

export default ProfileActions;
