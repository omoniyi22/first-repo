import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  Loader2,
  Heart,
  Stethoscope,
  Scissors,
  Shield,
  Syringe,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import MediaSelector from "@/components/admin/media/MediaSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHorseLimits } from "@/hooks/useHorseLimits";

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

// Updated care schedule interface to support both weeks and months
interface CareSchedule {
  enabled: boolean;
  frequency: number; // Can be weeks or months depending on care type
  frequency_unit: "weeks" | "months";
  last_visit_date: string;
  notes: string;
}

interface CareSchedules {
  farrier: CareSchedule;
  vaccination: CareSchedule;
  boosters: CareSchedule;
  dentist: CareSchedule;
}

const HorseForm = ({ onComplete, editingHorse = null }: HorseFormProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const horseLimits = useHorseLimits();
  const isEditing = !!editingHorse;

  // Existing form state
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

  // Updated care schedule state with client requirements
  const [careSchedules, setCareSchedules] = useState<CareSchedules>({
    farrier: {
      enabled: false,
      frequency: 6,
      frequency_unit: "weeks",
      last_visit_date: "",
      notes: "",
    },
    vaccination: {
      enabled: false,
      frequency: 12,
      frequency_unit: "months",
      last_visit_date: "",
      notes: "",
    },
    boosters: {
      enabled: false,
      frequency: 6,
      frequency_unit: "months",
      last_visit_date: "",
      notes: "",
    },
    dentist: {
      enabled: false,
      frequency: 6,
      frequency_unit: "months",
      last_visit_date: "",
      notes: "",
    },
  });

  // Reset dressage level when dressage type changes
  useEffect(() => {
    if (editingHorse?.dressage_type !== dressageType) setDressageLevel("");
    else setDressageLevel(editingHorse?.dressage_level || "");
  }, [dressageType]);

  // Load existing care schedules for editing
  useEffect(() => {
    const loadExistingCareSchedules = async () => {
      if (isEditing && editingHorse) {
        try {
          const { data: existingSchedules, error } = await supabase
            .from("horse_care_schedules")
            .select("*")
            .eq("horse_id", editingHorse.id);

          if (error) throw error;

          if (existingSchedules && existingSchedules.length > 0) {
            const updatedSchedules = { ...careSchedules };

            existingSchedules.forEach((schedule: any) => {
              if (updatedSchedules[schedule.care_type as keyof CareSchedules]) {
                updatedSchedules[schedule.care_type as keyof CareSchedules] = {
                  enabled: true,
                  frequency:
                    schedule.frequency || schedule.frequency_months || 6,
                  frequency_unit: schedule.frequency_unit || "months",
                  last_visit_date: schedule.last_visit_date,
                  notes: schedule.notes || "",
                };
              }
            });

            setCareSchedules(updatedSchedules);
          }
        } catch (error) {
          console.error("Error loading care schedules:", error);
        }
      }
    };

    loadExistingCareSchedules();
  }, [editingHorse, isEditing]);

  // Get the appropriate dressage levels based on the selected type
  const getDressageLevels = () => {
    if (dressageType === "British Dressage") {
      return britishDressageLevels;
    } else if (dressageType === "FEI Dressage") {
      return feiDressageLevels;
    }
    return [];
  };

  // Handle care schedule changes
  const updateCareSchedule = (
    careType: keyof CareSchedules,
    field: keyof CareSchedule,
    value: any
  ) => {
    setCareSchedules((prev) => ({
      ...prev,
      [careType]: {
        ...prev[careType],
        [field]: value,
      },
    }));
  };

  // Updated calculation to handle weeks vs months
  const calculateNextDueDate = (
    lastVisitDate: string,
    frequency: number,
    frequencyUnit: "weeks" | "months"
  ): string => {
    if (!lastVisitDate) return "";
    const lastVisit = new Date(lastVisitDate);
    const nextDue = new Date(lastVisit);

    if (frequencyUnit === "weeks") {
      nextDue.setDate(nextDue.getDate() + frequency * 7);
    } else {
      nextDue.setMonth(nextDue.getMonth() + frequency);
    }

    return nextDue.toISOString().split("T")[0];
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

    // Check horse limits before submitting (only for new horses, not edits)
    if (!isEditing) {
      const canAdd = await horseLimits.checkAndEnforce();
      if (!canAdd) {
        return;
      }
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

      let horseId: string;

      // 1. Simple horse operations only
      if (isEditing && editingHorse) {
        const { error } = await supabase
          .from("horses")
          .update(horseData)
          .eq("id", editingHorse.id)
          .eq("user_id", user.id);

        if (error) throw error;
        horseId = editingHorse.id;
      } else {
        const { data: newHorse, error } = await supabase
          .from("horses")
          .insert([horseData])
          .select()
          .single();

        if (error) throw error;
        horseId = newHorse.id;
      }

      // 2. Call Edge Function for complex care schedule processing
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Authentication session not found");
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/manage-horse-care`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: supabase.supabaseKey,
          },
          body: JSON.stringify({
            action: isEditing
              ? "update_care_schedules"
              : "create_care_schedules",
            horse_id: horseId,
            horse_name: horseName,
            care_schedules: careSchedules,
            user_id: user.id,
            user_email: user.email,
          }),
        }
      );

      const result = await response.json();

      // 3. Handle response
      if (response.ok) {
        toast({
          title: language === "es" ? "Éxito" : "Success",
          description: isEditing
            ? language === "es"
              ? "Caballo y horarios actualizados exitosamente."
              : "Horse and schedules updated successfully."
            : language === "es"
            ? "Caballo y horarios creados exitosamente."
            : "Horse and schedules created successfully.",
        });
      } else {
        console.error("Edge function error:", result);
        toast({
          title: language === "es" ? "Advertencia" : "Warning",
          description:
            language === "es"
              ? "El caballo fue guardado pero hubo problemas con los horarios de cuidado."
              : "Horse was saved but there were issues with care schedules.",
          variant: "destructive",
        });
      }

      onComplete();
    } catch (error: any) {
      console.error("Error saving horse data:", error);
      toast({
        title: language === "es" ? "Error al guardar" : "Save failed",
        description:
          error.message ||
          (language === "es"
            ? "Error al guardar los datos del caballo. Por favor, intenta de nuevo."
            : "Failed to save horse data. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setPhotoUrl(imageUrl);
  };

  // Show loading state while checking limits
  if (!isEditing && horseLimits.loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
        <span className="text-gray-600">
          {language === "es" ? "Verificando límites..." : "Checking limits..."}
        </span>
      </div>
    );
  }

  // Show upgrade prompt if user can't add horses (only for new horses)
  if (!isEditing && !horseLimits.loading && !horseLimits.canAddHorse) {
    return (
      <div className="text-center py-8">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-orange-800 mb-2">
            {language === "es"
              ? "Límite de Caballos Alcanzado"
              : "Horse Limit Reached"}
          </h3>
          <p className="text-orange-700 mb-4">
            {language === "es"
              ? `Has alcanzado tu límite de caballos (${horseLimits.currentHorses}/${horseLimits.maxHorses}) con el plan ${horseLimits.planName}.`
              : `You've reached your horse limit (${horseLimits.currentHorses}/${horseLimits.maxHorses}) with the ${horseLimits.planName} plan.`}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => (window.location.href = "/pricing")}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {language === "es" ? "Ver Planes" : "View Plans"}
            </Button>
            <Button variant="outline" onClick={onComplete}>
              {language === "es" ? "Cerrar" : "Close"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Limits info for new horses */}
      {!isEditing && !horseLimits.loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            {language === "es"
              ? `Caballos: ${horseLimits.currentHorses}/${
                  horseLimits.maxHorses === "unlimited"
                    ? "∞"
                    : horseLimits.maxHorses
                } (Plan ${horseLimits.planName})`
              : `Horses: ${horseLimits.currentHorses}/${
                  horseLimits.maxHorses === "unlimited"
                    ? "∞"
                    : horseLimits.maxHorses
                } (${horseLimits.planName} Plan)`}
          </p>
        </div>
      )}

      {/* Basic Horse Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            {language === "es" ? "Información Básica" : "Basic Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                placeholder={
                  language === "es" ? "Ingresa la edad" : "Enter age"
                }
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

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="horse-photo">
              {language === "es" ? "Foto del caballo" : "Horse Photo"}
            </Label>
            <MediaSelector
              value={photoUrl || ""}
              onChange={handleImageSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Competition Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {language === "es"
              ? "Niveles de Competencia"
              : "Competition Levels"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Updated Care Schedules Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-green-600" />
            {language === "es" ? "Horarios de Cuidado" : "Care Schedules"}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {language === "es"
              ? "Configura recordatorios automáticos para el cuidado de tu caballo"
              : "Set up automatic reminders for your horse's care"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Farrier Care - Updated with client requirements */}
          <CareScheduleSection
            careType="farrier"
            icon={<Scissors className="h-5 w-5" />}
            title={language === "es" ? "Cuidado del Herrador" : "Farrier Care"}
            description={
              language === "es"
                ? "Recorte de cascos y herraje"
                : "Hoof trimming and shoeing"
            }
            careData={careSchedules.farrier}
            language={language}
            horseName={horseName}
            onUpdate={(field, value) =>
              updateCareSchedule("farrier", field, value)
            }
            frequencyOptions={[
              {
                value: 4,
                label: language === "es" ? "Cada 4 semanas" : "Every 4 weeks",
              },
              {
                value: 6,
                label: language === "es" ? "Cada 6 semanas" : "Every 6 weeks",
              },
              {
                value: 8,
                label: language === "es" ? "Cada 8 semanas" : "Every 8 weeks",
              },
              {
                value: 10,
                label: language === "es" ? "Cada 10 semanas" : "Every 10 weeks",
              },
              {
                value: 12,
                label: language === "es" ? "Cada 12 semanas" : "Every 12 weeks",
              },
            ]}
            showFrequencySelection={true}
          />

          <Separator />

          {/* Vaccination - Updated with client requirements */}
          <CareScheduleSection
            careType="vaccination"
            icon={<Syringe className="h-5 w-5" />}
            title={
              language === "es" ? "Vacunación Anual" : "Annual Vaccination"
            }
            description={
              language === "es"
                ? "Vacuna anual contra la gripe"
                : "Annual flu vaccination"
            }
            careData={careSchedules.vaccination}
            language={language}
            horseName={horseName}
            onUpdate={(field, value) =>
              updateCareSchedule("vaccination", field, value)
            }
            frequencyOptions={[]}
            showFrequencySelection={false}
            fixedFrequencyText={
              language === "es" ? "Anual (12 meses)" : "Yearly (12 months)"
            }
          />

          <Separator />

          {/* Boosters - New care type */}
          <CareScheduleSection
            careType="boosters"
            icon={<Shield className="h-5 w-5" />}
            title={
              language === "es" ? "Refuerzos Semestrales" : "Bi-annual Boosters"
            }
            description={
              language === "es"
                ? "Refuerzos cada 6 meses"
                : "Booster shots every 6 months"
            }
            careData={careSchedules.boosters}
            language={language}
            horseName={horseName}
            onUpdate={(field, value) =>
              updateCareSchedule("boosters", field, value)
            }
            frequencyOptions={[]}
            showFrequencySelection={false}
            fixedFrequencyText={
              language === "es" ? "Cada 6 meses" : "Every 6 months"
            }
          />

          <Separator />

          {/* Dental Care - Keep existing */}
          <CareScheduleSection
            careType="dentist"
            icon={<Heart className="h-5 w-5" />}
            title={language === "es" ? "Cuidado Dental" : "Dental Care"}
            description={
              language === "es"
                ? "Revisiones dentales y flotado"
                : "Dental checkups and floating"
            }
            careData={careSchedules.dentist}
            language={language}
            horseName={horseName}
            onUpdate={(field, value) =>
              updateCareSchedule("dentist", field, value)
            }
            frequencyOptions={[
              {
                value: 6,
                label: language === "es" ? "Cada 6 meses" : "Every 6 months",
              },
              { value: 12, label: language === "es" ? "Anual" : "Yearly" },
            ]}
            showFrequencySelection={true}
          />

          <Separator />
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "es" ? "Notas Adicionales" : "Additional Notes"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strengths">
              {language === "es" ? "Fortalezas" : "Strengths"}
            </Label>
            <Textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder={
                language === "es"
                  ? "¿Cuáles son las fortalezas de tu caballo?"
                  : "What are your horse's strengths?"
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-notes">
              {language === "es" ? "Notas especiales" : "Special Notes"}
            </Label>
            <Textarea
              id="special-notes"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder={
                language === "es"
                  ? "¿Notas o instrucciones especiales de cuidado?"
                  : "Any special notes or care instructions?"
              }
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4">
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

// Updated Care Schedule Section Component
interface CareScheduleSectionProps {
  careType: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  careData: CareSchedule;
  language: string;
  horseName: string;
  onUpdate: (field: keyof CareSchedule, value: any) => void;
  frequencyOptions: { value: number; label: string }[];
  showFrequencySelection: boolean;
  fixedFrequencyText?: string;
}

const CareScheduleSection = ({
  careType,
  icon,
  title,
  description,
  careData,
  language,
  horseName,
  onUpdate,
  frequencyOptions,
  showFrequencySelection,
  fixedFrequencyText,
}: CareScheduleSectionProps) => {
  // Get the appropriate question text based on care type and client requirements
  const getQuestionText = () => {
    switch (careType) {
      case "farrier":
        return language === "es"
          ? `¿Con qué frecuencia necesita ${
              horseName || "el caballo"
            } visitas del herrador?`
          : `How often does ${horseName || "the horse"} need farrier visits?`;
      case "vaccination":
        return language === "es"
          ? "¿Cuándo fue la última inyección contra la gripe?"
          : "When was the last flu injection?";
      case "boosters":
        return language === "es"
          ? "¿Cuándo fue el último refuerzo?"
          : "When was the last booster?";
      case "dentist":
        return language === "es"
          ? "¿Con qué frecuencia necesita cuidado dental?"
          : "How often does dental care need to be done?";

      default:
        return language === "es" ? "¿Con qué frecuencia?" : "How often?";
    }
  };

  const getLastVisitText = () => {
    switch (careType) {
      case "farrier":
        return language === "es"
          ? "¿Cuándo fue la última visita del herrador?"
          : "When was the last farrier visit?";
      case "vaccination":
        return language === "es"
          ? "¿Cuándo fue la última vacunación?"
          : "When was the last vaccination?";
      case "boosters":
        return language === "es"
          ? "¿Cuándo fue el último refuerzo?"
          : "When was the last booster?";
      default:
        return language === "es"
          ? "¿Cuándo fue la última visita?"
          : "When was the last visit?";
    }
  };

  // Calculate next due date with proper unit handling
  const calculateNextDueDate = () => {
    if (!careData.last_visit_date) return "";
    const lastVisit = new Date(careData.last_visit_date);
    const nextDue = new Date(lastVisit);

    if (careData.frequency_unit === "weeks") {
      nextDue.setDate(nextDue.getDate() + careData.frequency * 7);
    } else {
      nextDue.setMonth(nextDue.getMonth() + careData.frequency);
    }

    return nextDue.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Checkbox
          id={`${careType}-enabled`}
          checked={careData.enabled}
          onCheckedChange={(checked) => onUpdate("enabled", checked)}
        />
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <Label
              htmlFor={`${careType}-enabled`}
              className="text-base font-medium cursor-pointer"
            >
              {title}
            </Label>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>

      {careData.enabled && (
        <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showFrequencySelection ? (
              <div className="space-y-2">
                <Label>{getQuestionText()}</Label>
                <Select
                  value={careData.frequency.toString()}
                  onValueChange={(value) =>
                    onUpdate("frequency", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{getQuestionText()}</Label>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-sm text-blue-700 font-medium">
                    {fixedFrequencyText}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{getLastVisitText()}</Label>
              <Input
                type="date"
                value={careData.last_visit_date}
                onChange={(e) => onUpdate("last_visit_date", e.target.value)}
                required={careData.enabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {language === "es"
                ? "Notas adicionales (opcional)"
                : "Additional notes (optional)"}
            </Label>
            <Textarea
              value={careData.notes}
              onChange={(e) => onUpdate("notes", e.target.value)}
              placeholder={
                language === "es"
                  ? `Cualquier requisito especial para ${title.toLowerCase()}...`
                  : `Any special requirements for ${title.toLowerCase()}...`
              }
              rows={2}
            />
          </div>

          {/* Show next due date if last visit is entered */}
          {careData.last_visit_date && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>
                  {language === "es"
                    ? "Próxima visita programada:"
                    : "Next visit scheduled:"}
                </strong>{" "}
                {calculateNextDueDate()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HorseForm;
