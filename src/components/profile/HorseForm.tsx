
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { horseBreeds, jumpingLevels, dressageTypes, britishDressageLevels, feiDressageLevels } from '@/lib/formOptions';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import MediaSelector from '@/components/admin/media/MediaSelector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface HorseFormProps {
  onComplete: () => void;
  editingHorse?: {
    id: string;
    name: string;
    breed: string;
    age: number;
    sex: string;
    competition_level?: string;
    jumping_level?: string;
    dressage_type?: string;
    dressage_level?: string;
    photo_url?: string | null;
    years_owned?: number | null;
    strengths?: string | null;
    weaknesses?: string | null;
    special_notes?: string | null;
  } | null;
}

const HorseForm = ({ onComplete, editingHorse = null }: HorseFormProps) => {
  const { user } = useAuth();
  const [horseName, setHorseName] = useState(editingHorse?.name || '');
  const [breed, setBreed] = useState(editingHorse?.breed || '');
  const [age, setAge] = useState(editingHorse?.age?.toString() || '');
  const [sex, setSex] = useState(editingHorse?.sex || '');
  const [level, setLevel] = useState(editingHorse?.competition_level || '');
  const [jumpingLevel, setJumpingLevel] = useState(editingHorse?.jumping_level || '');
  const [dressageType, setDressageType] = useState(editingHorse?.dressage_type || '');
  const [dressageLevel, setDressageLevel] = useState(editingHorse?.dressage_level || '');
  const [yearsOwned, setYearsOwned] = useState(editingHorse?.years_owned?.toString() || '');
  const [strengths, setStrengths] = useState(editingHorse?.strengths || '');
  const [weaknesses, setWeaknesses] = useState(editingHorse?.weaknesses || '');
  const [specialNotes, setSpecialNotes] = useState(editingHorse?.special_notes || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(editingHorse?.photo_url || null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!editingHorse;

  // Get available dressage levels based on selected dressage type
  const availableDressageLevels = dressageType === 'British Dressage' 
    ? britishDressageLevels 
    : dressageType === 'FEI Dressage' 
      ? feiDressageLevels 
      : [];

  // Reset dressage level when dressage type changes
  useEffect(() => {
    setDressageLevel('');
  }, [dressageType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to save a horse profile",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare horse data
      const horseData = {
        user_id: user.id,
        name: horseName,
        breed,
        age: parseInt(age || '0'),
        sex,
        competition_level: level,
        jumping_level: jumpingLevel,
        dressage_type: dressageType,
        dressage_level: dressageLevel,
        years_owned: yearsOwned ? parseInt(yearsOwned) : null,
        photo_url: photoUrl,
        strengths,
        weaknesses,
        special_notes: specialNotes,
      };

      if (isEditing && editingHorse) {
        // Update existing horse
        const { error } = await supabase
          .from('horses')
          .update(horseData)
          .eq('id', editingHorse.id)
          .eq('user_id', user.id); // Ensure user only updates their own horses

        if (error) throw error;
        
        toast({
          title: "Horse updated",
          description: "Your horse's profile has been updated successfully."
        });
      } else {
        // Create new horse
        const { error } = await supabase
          .from('horses')
          .insert([horseData]);
        
        if (error) throw error;

        toast({
          title: "Horse added",
          description: "Your new horse has been added successfully."
        });
      }
      
      onComplete();
    } catch (error: any) {
      console.error('Error saving horse data:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save horse data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image selection from media library
  const handleImageSelect = (imageUrl: string) => {
    setPhotoUrl(imageUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="horse-name">Horse Name*</Label>
        <Input
          id="horse-name"
          value={horseName}
          onChange={(e) => setHorseName(e.target.value)}
          placeholder="Enter horse's name"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horse-breed">Breed*</Label>
          <Select value={breed} onValueChange={setBreed} required>
            <SelectTrigger id="horse-breed">
              <SelectValue placeholder="Select breed" />
            </SelectTrigger>
            <SelectContent>
              {horseBreeds.map((breed) => (
                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="horse-age">Age*</Label>
          <Input
            id="horse-age"
            type="number"
            min="1"
            max="40"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="horse-sex">Sex*</Label>
          <Select value={sex} onValueChange={setSex} required>
            <SelectTrigger id="horse-sex">
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gelding">Gelding</SelectItem>
              <SelectItem value="Mare">Mare</SelectItem>
              <SelectItem value="Stallion">Stallion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="years-owned">Years Owned/Ridden</Label>
          <Input
            id="years-owned"
            type="number"
            min="0"
            max="40"
            value={yearsOwned}
            onChange={(e) => setYearsOwned(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Competition Levels Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Competition Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="competition-level">Dressage Competition Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger id="competition-level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_applicable">Not applicable</SelectItem>
                {/* Original dressage levels for backward compatibility */}
                {horseBreeds.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumping-level">Jumping Level</Label>
            <Select value={jumpingLevel} onValueChange={setJumpingLevel}>
              <SelectTrigger id="jumping-level">
                <SelectValue placeholder="Select jumping level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_applicable">Not applicable</SelectItem>
                {jumpingLevels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Dressage Type Selection */}
        <div className="space-y-2 mb-4">
          <Label>Dressage Type</Label>
          <RadioGroup 
            value={dressageType} 
            onValueChange={setDressageType}
            className="flex flex-row space-x-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="British Dressage" id="british" />
              <Label htmlFor="british" className="cursor-pointer">British Dressage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FEI Dressage" id="fei" />
              <Label htmlFor="fei" className="cursor-pointer">FEI Dressage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_applicable" id="no-dressage" />
              <Label htmlFor="no-dressage" className="cursor-pointer">Not Applicable</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Conditional Dressage Level Selection */}
        {dressageType && dressageType !== "not_applicable" && (
          <div className="space-y-2 mb-4">
            <Label htmlFor="dressage-level">
              {dressageType === 'British Dressage' ? 'British Dressage Level' : 'FEI Dressage Level'}
            </Label>
            <Select value={dressageLevel} onValueChange={setDressageLevel}>
              <SelectTrigger id="dressage-level">
                <SelectValue placeholder={`Select ${dressageType.split(' ')[0]} level`} />
              </SelectTrigger>
              <SelectContent>
                {availableDressageLevels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <Label htmlFor="horse-photo">Horse Photo</Label>
        {photoUrl && (
          <div className="mb-4 w-full max-w-[300px]">
            <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
              <img 
                src={photoUrl} 
                alt={horseName || "Horse"} 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        )}
        
        <MediaSelector
          value={photoUrl || ''}
          onChange={handleImageSelect}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengths">Strengths</Label>
        <Input
          id="strengths"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          placeholder="What are your horse's strengths? (Optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">Areas for Improvement</Label>
        <Input
          id="weaknesses"
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
          placeholder="What areas would you like to improve? (Optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="special-notes">Special Notes</Label>
        <Input
          id="special-notes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          placeholder="Any special notes or care instructions? (Optional)"
        />
      </div>
      
      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-purple-700 hover:bg-purple-800"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Saving...
            </>
          ) : (
            isEditing ? "Update Horse" : "Save Horse"
          )}
        </Button>
      </div>
    </form>
  );
};

export default HorseForm;
