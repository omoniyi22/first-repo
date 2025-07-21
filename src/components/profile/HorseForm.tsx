import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { horseBreeds, dressageLevels, jumpingLevels } from "@/lib/formOptions";
import {
  britishDressageLevels,
  feiDressageLevels,
  dressageTypes,
} from "@/lib/dressageOptions";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import MediaSelector from "@/components/admin/media/MediaSelector";
import { useLanguage } from "@/contexts/LanguageContext";

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
  console.log("🚀 ~ HorseForm ~ editingHorse:", editingHorse);
  const { user } = useAuth();
  const [horseName, setHorseName] = useState(editingHorse?.name || "");
  const [breed, setBreed] = useState(editingHorse?.breed || "");
  const [age, setAge] = useState(editingHorse?.age?.toString() || "");
  const [sex, setSex] = useState(editingHorse?.sex || "");
  const [level, setLevel] = useState(editingHorse?.competition_level || "");
  const [jumpingLevel, setJumpingLevel] = useState(
    editingHorse?.jumping_level || ""
  );
  const [dressageType, setDressageType] = useState(
    editingHorse?.dressage_type || ""
  );
  const [dressageLevel, setDressageLevel] = useState(
    editingHorse?.dressage_level || ""
  );
  console.log("🚀 ~ HorseForm ~ dressageLevel:", dressageLevel);
  const [yearsOwned, setYearsOwned] = useState(
    editingHorse?.years_owned?.toString() || ""
  );
  const [strengths, setStrengths] = useState(editingHorse?.strengths || "");
  const [weaknesses, setWeaknesses] = useState(editingHorse?.weaknesses || "");
  const [specialNotes, setSpecialNotes] = useState(
    editingHorse?.special_notes || ""
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    editingHorse?.photo_url || null
  );
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!editingHorse;
  const { language } = useLanguage();

  // Reset dressage level when dressage type changes
  useEffect(() => {
    if (editingHorse?.dressage_type !== dressageType) setDressageLevel("");
    else setDressageLevel(editingHorse.dressage_level);
  }, [dressageType]);

  // Get the appropriate dressage levels based on the selected type
  const getDressageLevels = () => {
    if (dressageType === "British Dressage") {
      return britishDressageLevels;
    } else if (dressageType === "FEI Dressage") {
      return feiDressageLevels;
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to save a horse profile",
        variant: "destructive",
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
        age: parseInt(age || "0"),
        sex,
        competition_level: level,
        jumping_level: jumpingLevel,
        dressage_type: dressageType || null,
        dressage_level: dressageLevel || null,
        years_owned: yearsOwned ? parseInt(yearsOwned) : null,
        photo_url: photoUrl,
        strengths,
        weaknesses,
        special_notes: specialNotes,
      };

      if (isEditing && editingHorse) {
        // Update existing horse
        const { error } = await supabase
          .from("horses")
          .update(horseData)
          .eq("id", editingHorse.id)
          .eq("user_id", user.id); // Ensure user only updates their own horses

        if (error) throw error;

        toast({
          title: "Horse updated",
          description: "Your horse's profile has been updated successfully.",
        });
      } else {
        // Create new horse
        const { error } = await supabase.from("horses").insert([horseData]);

        if (error) throw error;

        toast({
          title: "Horse added",
          description: "Your new horse has been added successfully.",
        });
      }

      onComplete();
    } catch (error: any) {
      console.error("Error saving horse data:", error);
      toast({
        title: "Save failed",
        description:
          error.message || "Failed to save horse data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image selection from media library - only update photoUrl, don't auto-save
  const handleImageSelect = (imageUrl: string) => {
    setPhotoUrl(imageUrl);
    // Don't auto-save here, let the user submit the form when they're ready
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="horse-name">
          {language === "es" ? "Nombre del caballo*" : "Horse Name*"}
        </Label>
        <Input
          id="horse-name"
          value={horseName}
          onChange={(e) => setHorseName(e.target.value)}
          placeholder={
            language === "es"
              ? "Ingresa el nombre del caballo"
              : "Enter horse's name"
          }
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horse-breed">
            {language === "es" ? "Raza*" : "Breed*"}
          </Label>
          <Select value={breed} onValueChange={setBreed} required>
            <SelectTrigger id="horse-breed">
              <SelectValue
                placeholder={
                  language === "es" ? "Selecciona la raza" : "Select breed"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {horseBreeds.map((breed) => (
                <SelectItem key={breed} value={breed}>
                  {breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="horse-age">
            {language === "es" ? "Edad*" : "Age*"}
          </Label>
          <Input
            id="horse-age"
            type="number"
            min="1"
            max="40"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={language === "es" ? "Ingresa la edad" : "Enter age"}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="horse-sex">
            {language === "es" ? "Sexo*" : "Sex*"}
          </Label>
          <Select value={sex} onValueChange={setSex} required>
            <SelectTrigger id="horse-sex">
              <SelectValue
                placeholder={
                  language === "es" ? "Selecciona el sexo" : "Select sex"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gelding">
                {language === "es" ? "Castrado" : "Gelding"}
              </SelectItem>
              <SelectItem value="Mare">
                {language === "es" ? "Yegua" : "Mare"}
              </SelectItem>
              <SelectItem value="Stallion">
                {language === "es" ? "Semental" : "Stallion"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jumping-level">
            {language === "es" ? "Nivel de salto" : "Jumping Level"}
          </Label>
          <Select value={jumpingLevel} onValueChange={setJumpingLevel}>
            <SelectTrigger id="jumping-level">
              <SelectValue
                placeholder={
                  language === "es"
                    ? "Selecciona la altura de salto"
                    : "Select jumping height"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {jumpingLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dressage-type">
            {language === "es" ? "Tipo de doma" : "Dressage Type"}
          </Label>
          <Select value={dressageType} onValueChange={setDressageType}>
            <SelectTrigger id="dressage-type">
              <SelectValue
                placeholder={
                  language === "es"
                    ? "Selecciona el tipo de doma"
                    : "Select dressage type"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {dressageTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dressage-level">
            {language === "es" ? "Nivel de doma" : "Dressage Level"}
          </Label>
          <Select
            disabled={!dressageType}
            value={dressageLevel}
            onValueChange={setDressageLevel}
          >
            <SelectTrigger id="dressage-level">
              <SelectValue
                placeholder={
                  language === "es"
                    ? "Selecciona el nivel de doma"
                    : "Select dressage level"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {getDressageLevels().map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="years-owned">
            {language === "es"
              ? "Años de propiedad/monta"
              : "Years Owned/Ridden"}
          </Label>
          <Input
            id="years-owned"
            type="number"
            min="0"
            max="40"
            value={yearsOwned}
            onChange={(e) => setYearsOwned(e.target.value)}
            placeholder={language === "es" ? "Opcional" : "Optional"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="horse-photo">
          {language === "es" ? "Foto del caballo" : "Horse Photo"}
        </Label>
        <MediaSelector value={photoUrl || ""} onChange={handleImageSelect} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengths">
          {language === "es" ? "Fortalezas" : "Strengths"}
        </Label>
        <Input
          id="strengths"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          placeholder={
            language === "es"
              ? "¿Cuáles son las fortalezas de tu caballo? (Opcional)"
              : "What are your horse's strengths? (Optional)"
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">
          {language === "es" ? "Áreas de mejora" : "Areas for Improvement"}
        </Label>
        <Input
          id="weaknesses"
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
          placeholder={
            language === "es"
              ? "¿Qué áreas te gustaría mejorar? (Opcional)"
              : "What areas would you like to improve? (Optional)"
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="special-notes">
          {language === "es" ? "Notas especiales" : "Special Notes"}
        </Label>
        <Input
          id="special-notes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          placeholder={
            language === "es"
              ? "¿Notas o instrucciones especiales de cuidado? (Opcional)"
              : "Any special notes or care instructions? (Optional)"
          }
        />
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          {language === "es" ? "Cancelar" : "Cancel"}
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-purple-700 hover:bg-purple-800"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "es" ? "Guardando..." : "Saving..."}
            </>
          ) : isEditing ? (
            language === "es" ? (
              "Actualizar caballo"
            ) : (
              "Update Horse"
            )
          ) : language === "es" ? (
            "Guardar caballo"
          ) : (
            "Save Horse"
          )}
        </Button>
      </div>
    </form>
  );
};

export default HorseForm;
