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
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  governingBody,
  setGoverningBody,
}) => {
  const { language } = useLanguage();
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
        {language === "en"
          ? "Welcome to Your Profile"
          : "Bienvenido a tu perfil"}
      </h1>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Name */}
        <div className="space-y-2">
          <label
            htmlFor="display-name"
            className="text-sm font-medium text-gray-700"
          >
            {language === "en" ? "Display Name" : "Nombre para mostrar"}
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
            {language === "en" ? "Primary Discipline" : "Disciplina primaria"}
          </label>
          <Select value={discipline} onValueChange={setDiscipline}>
            <SelectTrigger id="discipline" className="w-full">
              <SelectValue placeholder="Select your primary discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dressage">
                {language === "en" ? "Dressage" : "Entrenamiento de caballos"}
              </SelectItem>
              <SelectItem value="jumping">
                {language === "en" ? "Jumping" : "Saltar"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rider Category */}
        <div className="space-y-2">
          <label
            htmlFor="rider-category"
            className="text-sm font-medium text-gray-700"
          >
            {language === "en" ? "Rider Category" : "Categoría de jinete"}
          </label>
          <Select value={riderCategory} onValueChange={setRiderCategory}>
            <SelectTrigger id="rider-category" className="w-full">
              <SelectValue placeholder="Select rider category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Junior Rider (Under 18)">
                {language === "en"
                  ? "Junior Rider (Under 18)"
                  : "Jinete Junior (menor de 18 años)"}
              </SelectItem>
              <SelectItem value="Young Rider (18-21)">
                {language === "en"
                  ? "Young Rider (18-21)"
                  : "Jinete joven (18-21)"}
              </SelectItem>
              <SelectItem value="Adult Amateur">
                {language === "en" ? "Adult Amateur" : "Adulto amateur"}
              </SelectItem>
              <SelectItem value="Professional">
                {language === "en" ? "Professional" : "Profesional"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stable Affiliation */}
        <div className="space-y-2">
          <label htmlFor="stable" className="text-sm font-medium text-gray-700">
            {language === "en"
              ? "Stable/Barn Affiliation"
              : "Afiliación a establo/granero"}
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
            {language === "en" ? "Region/Country" : "Región/País"}
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

        {/* Governing Body */}
        <div className="space-y-2">
          <label
            htmlFor="governing-body"
            className="text-sm font-medium text-gray-700"
          >
            {language === "en" ? "Governing Body" : "Órgano rector"}
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
            {language === "en" ? "Coach/Trainer" : "Entrenador/Instructor"}
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
