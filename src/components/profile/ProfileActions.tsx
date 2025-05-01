
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave }) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  
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
    </div>
  );
};

export default ProfileActions;
