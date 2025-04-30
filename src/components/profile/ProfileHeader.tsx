
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, Plus, User, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { regions } from '@/lib/formOptions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
        // Create a temporary object URL for immediate display
        const tempImageUrl = URL.createObjectURL(file);
        setProfilePic(tempImageUrl);
        
        // Upload image to Supabase Storage
        const fileName = `${user.id}-profile-${Date.now()}`;
        
        // Check if profiles bucket exists, create it if not
        const { data: bucketExists } = await supabase
          .storage
          .getBucket('profiles');
          
        if (!bucketExists) {
          await supabase
            .storage
            .createBucket('profiles', { public: true });
        }
        
        const { data, error } = await supabase.storage
          .from('profiles')
          .upload(`profile-images/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(`profile-images/${fileName}`);
        
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
          throw updateError;
        }
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully."
        });
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload image. Please try again.",
          variant: "destructive"
        });
        console.error('Error uploading image:', error);
      }
    }
  };
  
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
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-36 w-36 border-2 border-gray-200">
              <AvatarImage src={profilePic || ''} alt={displayName} />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                <User size={48} />
              </AvatarFallback>
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
              />
            </label>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-4">
            Welcome, {displayName}
          </h1>
          
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rider Category */}
            <div className="space-y-2">
              <label htmlFor="rider-category" className="text-sm font-medium text-gray-700">
                Rider Category
              </label>
              <Select value={riderCategory} onValueChange={setRiderCategory}>
                <SelectTrigger id="rider-category" className="w-full">
                  <SelectValue placeholder="Select rider category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Junior Rider (Under 18)">Junior Rider (Under 18)</SelectItem>
                  <SelectItem value="Young Rider (18-21)">Young Rider (18-21)</SelectItem>
                  <SelectItem value="Adult Amateur">Adult Amateur</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Stable Affiliation */}
            <div className="space-y-2">
              <label htmlFor="stable" className="text-sm font-medium text-gray-700">
                Stable/Barn Affiliation
              </label>
              <Input 
                id="stable" 
                value={stableAffiliation} 
                onChange={(e) => setStableAffiliation(e.target.value)} 
                placeholder="Enter your stable or barn"
              />
            </div>
            
            {/* Coach/Trainer */}
            <div className="space-y-2">
              <label htmlFor="coach" className="text-sm font-medium text-gray-700">
                Coach/Trainer
              </label>
              <Input 
                id="coach" 
                value={coachName} 
                onChange={(e) => setCoachName(e.target.value)} 
                placeholder="Enter your coach's name"
              />
            </div>
            
            {/* Region/Country */}
            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-medium text-gray-700">
                Region/Country
              </label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region" className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end mt-6 gap-4">
        <Button 
          className="bg-blue-700 hover:bg-blue-800" 
          size="lg"
          onClick={saveProfile}
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
        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Upload Test
        </Button>
        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Test
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
