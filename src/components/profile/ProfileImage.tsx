
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageProps {
  profilePic: string | null;
  setProfilePic: (url: string | null) => void;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ profilePic, setProfilePic }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'Rider';

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload images.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        setIsUploadingImage(true);
        console.log('Starting image upload process...');
        
        // Create a temporary object URL for immediate display
        const tempImageUrl = URL.createObjectURL(file);
        setProfilePic(tempImageUrl);
        
        // Upload image to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-profile-${Date.now()}.${fileExt}`;
        
        console.log('Uploading to profiles bucket, path:', `profile-images/${fileName}`);
        
        const { data, error } = await supabase.storage
          .from('profiles')
          .upload(`profile-images/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          console.error('Error uploading image:', error);
          throw error;
        }
        
        console.log('Upload successful, data:', data);
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(`profile-images/${fileName}`);
          
        console.log('Got public URL:', publicUrlData.publicUrl);
        
        // Revoke temporary object URL to avoid memory leaks
        URL.revokeObjectURL(tempImageUrl);
        
        setProfilePic(publicUrlData.publicUrl);
        
        // Update profile with new image URL
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id,
            profile_picture_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          });
          
        if (updateError) {
          console.error('Error updating profile with image URL:', updateError);
          throw updateError;
        }
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully."
        });
      } catch (error: any) {
        // Revert profile picture state if there was an error
        setProfilePic(null);
        
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload image. Please try again.",
          variant: "destructive"
        });
        console.error('Error uploading image:', error);
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
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <AvatarImage src={profilePic || ''} alt={displayName} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                <User size={48} />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <label 
          htmlFor="profile-pic-upload" 
          className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition border border-gray-200"
        >
          <Upload size={16} className="text-blue-700" />
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
