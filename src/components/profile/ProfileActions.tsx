
import { Button } from '@/components/ui/button';
import { Save, Upload, Plus, Loader2 } from 'lucide-react';
import { testStorageUpload } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave }) => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  
  const handleStorageTest = async () => {
    setIsTesting(true);
    try {
      const result = await testStorageUpload();
      toast({
        title: result.success ? "Storage test successful" : "Storage test failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Storage test failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
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
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Profile
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
            Testing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Test
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        className="border-purple-300 text-purple-700 hover:bg-purple-50" 
        size="lg"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Test
      </Button>
    </div>
  );
};

export default ProfileActions;
