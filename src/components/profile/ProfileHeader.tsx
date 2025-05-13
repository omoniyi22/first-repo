import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ProfileImage from './ProfileImage';
import ProfileForm from './ProfileForm';
import ProfileActions from './ProfileActions';

// Define a type for our profile data
interface ProfileData {
  id: string;
  rider_category: string | null;
  stable_affiliation: string | null;
  coach_name: string | null;
  region: string | null;
  profile_picture_url: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

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
        setIsLoading(true);
        
        // Get actual profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          // Check if this is a "no rows returned" error
          if (error.code !== 'PGRST116') {
            console.error('Error fetching profile data:', error);
            toast({
              title: "Failed to load profile",
              description: "There was an error loading your profile data.",
              variant: "destructive"
            });
          } else {
            // For new users, the trigger should create a profile entry, but just in case
            console.log('No existing profile found, using default values');
          }
        }
        
        if (profile) {
          // Set state with data from Supabase
          setRiderCategory(profile.rider_category || 'Adult Amateur');
          setStableAffiliation(profile.stable_affiliation || '');
          setCoachName(profile.coach_name || '');
          setRegion(profile.region || '');
          setProfilePic(profile.profile_picture_url);
        }
      } catch (error) {
        console.error('Error in profile data fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, toast]);
  
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
      // Prepare profile data
      const profileData: ProfileData = {
        id: user.id,
        rider_category: riderCategory,
        stable_affiliation: stableAffiliation,
        coach_name: coachName,
        region: region,
        profile_picture_url: profilePic,
        updated_at: new Date().toISOString()
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved."
      });
      
      console.log('Profile data saved successfully:', profileData);
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
