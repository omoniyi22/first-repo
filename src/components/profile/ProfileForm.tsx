
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { regions } from '@/lib/formOptions';
import ProfileActions from './ProfileActions';

interface ProfileFormProps {
  initialData: {
    rider_category?: string;
    stable_affiliation?: string;
    coach_name?: string;
    region?: string;
  };
  onSave: (formData: any) => Promise<void>;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [riderCategory, setRiderCategory] = useState(initialData?.rider_category || '');
  const [stableAffiliation, setStableAffiliation] = useState(initialData?.stable_affiliation || '');
  const [coachName, setCoachName] = useState(initialData?.coach_name || '');
  const [region, setRegion] = useState(initialData?.region || '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        rider_category: riderCategory,
        stable_affiliation: stableAffiliation,
        coach_name: coachName,
        region: region
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-serif font-semibold text-gray-900">Edit Profile</h2>
      
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

      <div className="flex justify-between mt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <ProfileActions isSaving={isSaving} onSave={handleSave} />
      </div>
    </div>
  );
};

export default ProfileForm;
