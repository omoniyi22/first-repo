
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, Plus, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { regions } from '@/lib/formOptions';

const ProfileHeader = () => {
  const { user } = useAuth();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [riderCategory, setRiderCategory] = useState('Adult Amateur');
  const [stableAffiliation, setStableAffiliation] = useState('');
  const [coachName, setCoachName] = useState('');
  const [region, setRegion] = useState('');
  
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'Rider';
  
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
      // Here you would typically upload the image to storage
      // and update the user's profile with the new image URL
    }
  };

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
        <Button className="bg-blue-700 hover:bg-blue-800" size="lg">
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
