
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import ProfileImage from './ProfileImage';
import ProfileForm from './ProfileForm';

const ProfileHeader = () => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // Fetch profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" error
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (profile) {
          setProfileData(profile);
          setProfilePic(profile.profile_picture_url);
        } else {
          // Create a new profile if one doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  // Helper function to get display name
  const getDisplayName = () => {
    if (profileData?.rider_category) {
      return profileData.rider_category;
    }
    return user?.email?.split('@')[0] || 'Rider';
  };
  
  const handleSaveProfile = async (formData: any) => {
    if (!user) return;

    try {
      // Update profile_picture_url if profilePic has changed
      const dataToUpdate = {
        ...formData,
        profile_picture_url: profilePic,
        id: user.id
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(dataToUpdate);
      
      if (error) {
        throw error;
      }
      
      setProfileData({ ...profileData, ...dataToUpdate });
      setEditingProfile(false);
      
      toast({
        title: language === 'en' ? "Profile updated" : "Perfil actualizado",
        description: language === 'en' ? "Your profile has been updated successfully" : "Tu perfil se ha actualizado con éxito"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'en' ? "Error" : "Error",
        description: error.message || (language === 'en' ? "There was a problem updating your profile" : "Hubo un problema al actualizar tu perfil"),
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-0 overflow-hidden">
      <CardContent className="p-6">
        {!editingProfile ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <ProfileImage profilePic={profilePic} setProfilePic={setProfilePic} />
              
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                {getDisplayName()}
              </h3>
              
              {profileData?.region && (
                <p className="text-sm text-gray-600 mt-1">
                  {profileData.region}
                </p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setEditingProfile(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Edit Profile' : 'Editar Perfil'}
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-semibold text-gray-900">
                    {language === 'en' ? 'Rider Profile' : 'Perfil del Jinete'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {language === 'en' ? 'Manage your equestrian information and preferences' : 'Administra tu información ecuestre y preferencias'}
                  </p>
                </div>
                
                <Tabs defaultValue="dressage" className="w-[200px]">
                  <TabsList>
                    <TabsTrigger value="dressage" className="text-purple-600">
                      {language === 'en' ? 'Dressage' : 'Doma'}
                    </TabsTrigger>
                    <TabsTrigger value="jumping" className="text-blue-600">
                      {language === 'en' ? 'Jumping' : 'Salto'}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData?.stable_affiliation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      {language === 'en' ? 'Stable / Affiliation' : 'Establo / Afiliación'}
                    </h4>
                    <p className="text-base">{profileData.stable_affiliation}</p>
                  </div>
                )}
                
                {profileData?.coach_name && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      {language === 'en' ? 'Coach / Trainer' : 'Entrenador'}
                    </h4>
                    <p className="text-base">{profileData.coach_name}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    {language === 'en' ? 'Member Since' : 'Miembro Desde'}
                  </h4>
                  <p className="text-base flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProfileForm 
            initialData={profileData || {}}
            onSave={handleSaveProfile}
            onCancel={() => setEditingProfile(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
