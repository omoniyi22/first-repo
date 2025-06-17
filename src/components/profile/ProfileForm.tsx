import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  countries as countriesList,
  getGoverningBodyByCountry,
} from "@/data/countriesData";
import { useEffect, useState } from "react";

interface ProfileFormProps {
  displayName: string;
  setDisplayName: (value: string) => void;
  riderCategory: string;
  setRiderCategory: (value: string) => void;
  stableAffiliation: string;
  setStableAffiliation: (value: string) => void;
  coachName: string;
  setCoachName: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  discipline: string;
  setDiscipline: (value: string) => void;
  // ADD THESE NEW PROPS
  governingBody: string;
  setGoverningBody: (value: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  displayName,
  setDisplayName,
  riderCategory,
  setRiderCategory,
  stableAffiliation,
  setStableAffiliation,
  coachName,
  setCoachName,
  region,
  setRegion,
  discipline,
  setDiscipline,
  // NEW PROPS
}) => {
  const [governingBody, setGoverningBody] = useState<any>([]);

  // AUTO-UPDATE GOVERNING BODY WHEN COUNTRY CHANGES
  useEffect(() => {
    if (region) {
      const governingBodyData = getGoverningBodyByCountry(region);
      if (governingBodyData) {
        // Auto-set the governing body when country is selected
        setGoverningBody(governingBodyData.name);
      }
    } else {
      // Clear governing body if no country selected
      setGoverningBody("");
    }
  }, [region, setGoverningBody]);

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-4">
        Welcome to Your Profile
      </h1>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Name */}
        <div className="space-y-2">
          <label
            htmlFor="display-name"
            className="text-sm font-medium text-gray-700"
          >
            Display Name
          </label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>

        {/* Discipline */}
        <div className="space-y-2">
          <label
            htmlFor="discipline"
            className="text-sm font-medium text-gray-700"
          >
            Primary Discipline
          </label>
          <Select value={discipline} onValueChange={setDiscipline}>
            <SelectTrigger id="discipline" className="w-full">
              <SelectValue placeholder="Select your primary discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dressage">Dressage</SelectItem>
              <SelectItem value="jumping">Jumping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rider Category */}
        <div className="space-y-2">
          <label
            htmlFor="rider-category"
            className="text-sm font-medium text-gray-700"
          >
            Rider Category
          </label>
          <Select value={riderCategory} onValueChange={setRiderCategory}>
            <SelectTrigger id="rider-category" className="w-full">
              <SelectValue placeholder="Select rider category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Junior Rider (Under 18)">
                Junior Rider (Under 18)
              </SelectItem>
              <SelectItem value="Young Rider (18-21)">
                Young Rider (18-21)
              </SelectItem>
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
              {countriesList.map((country) => (
                <SelectItem key={country.name} value={country.name}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Governing Body - FIXED */}
        <div className="space-y-2">
          <label
            htmlFor="governing-body"
            className="text-sm font-medium text-gray-700"
          >
            Governing Body
          </label>
          <Input
            id="governing-body"
            value={governingBody}
            readOnly
            placeholder="Auto-filled based on country"
            className="bg-gray-50 cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default ProfileForm;
