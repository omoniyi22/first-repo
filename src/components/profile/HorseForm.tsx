
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { horseBreeds, dressageLevels } from '@/lib/formOptions';
import { Label } from '@/components/ui/label';

interface HorseFormProps {
  onComplete: () => void;
}

const HorseForm = ({ onComplete }: HorseFormProps) => {
  const [horseName, setHorseName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [level, setLevel] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the horse data to your backend
    console.log({ horseName, breed, age, sex, level, photo });
    
    // After saving, close the form
    onComplete();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="horse-name">Horse Name</Label>
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
          <Label htmlFor="horse-breed">Breed</Label>
          <Select value={breed} onValueChange={setBreed}>
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
          <Label htmlFor="horse-age">Age</Label>
          <Input
            id="horse-age"
            type="number"
            min="1"
            max="40"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="horse-sex">Sex</Label>
          <Select value={sex} onValueChange={setSex}>
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
          <Label htmlFor="competition-level">Competition Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger id="competition-level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {dressageLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="horse-photo">Photo</Label>
        <Input
          id="horse-photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="cursor-pointer"
        />
      </div>
      
      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
        <Button type="submit">Save Horse</Button>
      </div>
    </form>
  );
};

export default HorseForm;
