
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';

interface ProfileImageProps {
  profilePic: string | null;
  setProfilePic: (url: string | null) => void;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ profilePic, setProfilePic }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'Rider';

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!user) {
        toast({
          title: language === 'en' ? "Authentication required" : "Autenticación requerida",
          description: language === 'en' ? "Please sign in to upload images." : "Por favor, inicie sesión para subir imágenes.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        setIsUploadingImage(true);
        
        // Create a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;
        
        // Upload file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('profile-images')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
        
        // Update profile with new image URL
        setProfilePic(publicUrl);
        
        toast({
          title: language === 'en' ? "Profile picture updated" : "Foto de perfil actualizada",
          description: language === 'en' 
            ? "Your profile picture has been updated successfully." 
            : "Tu foto de perfil ha sido actualizada exitosamente."
        });
      } catch (error: any) {
        // Revert profile picture state if there was an error
        console.error('Error uploading image:', error);
        
        toast({
          title: language === 'en' ? "Upload failed" : "Error al subir",
          description: error.message || (language === 'en' 
            ? "Failed to upload image. Please try again." 
            : "Error al subir la imagen. Por favor, inténtalo de nuevo."),
          variant: "destructive"
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-36 w-36 border-2 border-gray-200">
          {isUploadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              <AvatarImage src={profilePic || ''} alt={displayName} />
              <AvatarFallback className="bg-purple-100 text-purple-800">
                <User size={48} />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <label 
          htmlFor="profile-pic-upload" 
          className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition border border-gray-200"
        >
          <Upload size={16} className="text-purple-700" />
          <input 
            type="file" 
            id="profile-pic-upload" 
            className="hidden" 
            accept="image/*"
            onChange={handleProfilePicUpload}
            disabled={isUploadingImage}
          />
        </label>
      </div>
    </div>
  );
};

export default ProfileImage;
