
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ProfileImage from './ProfileImage';
import ProfileForm from './ProfileForm';
import ProfileActions from './ProfileActions';

const ProfileHeader = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [riderCategory, setRiderCategory] = useState('Adult Amateur');
  const [stableAffiliation, setStableAffiliation] = useState('');
  const [coachName, setCoachName] = useState('');
  const [region, setRegion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'Rider';
  
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          // Set state with existing profile data
          setRiderCategory(data.rider_category || 'Adult Amateur');
          setStableAffiliation(data.stable_affiliation || '');
          setCoachName(data.coach_name || '');
          setRegion(data.region || '');
          setProfilePic(data.profile_picture_url);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const saveProfile = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your profile.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          rider_category: riderCategory,
          stable_affiliation: stableAffiliation,
          coach_name: coachName,
          region: region,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved."
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive"
      });
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Picture */}
        <ProfileImage 
          profilePic={profilePic} 
          setProfilePic={setProfilePic} 
        />
        
        {/* Profile Form */}
        <ProfileForm
          displayName={displayName}
          riderCategory={riderCategory}
          setRiderCategory={setRiderCategory}
          stableAffiliation={stableAffiliation}
          setStableAffiliation={setStableAffiliation}
          coachName={coachName}
          setCoachName={setCoachName}
          region={region}
          setRegion={setRegion}
        />
      </div>
      
      {/* Action Buttons */}
      <ProfileActions isSaving={isSaving} onSave={saveProfile} />
    </div>
  );
};

export default ProfileHeader;
