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
import { Loader2, Heart, Stethoscope, Scissors, Shield } from "lucide-react";
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

// Care schedule interface
interface CareSchedule {
  enabled: boolean;
  frequency_months: number;
  last_visit_date: string;
  notes: string;
}

interface CareSchedules {
  farrier: CareSchedule;
  vaccination: CareSchedule;
  dentist: CareSchedule;
  worming: CareSchedule;
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

  // NEW: Care schedule state
  const [careSchedules, setCareSchedules] = useState<CareSchedules>({
    farrier: {
      enabled: false,
      frequency_months: 6,
      last_visit_date: "",
      notes: "",
    },
    vaccination: {
      enabled: false,
      frequency_months: 12,
      last_visit_date: "",
      notes: "",
    },
    dentist: {
      enabled: false,
      frequency_months: 6,
      last_visit_date: "",
      notes: "",
    },
    worming: {
      enabled: false,
      frequency_months: 3,
      last_visit_date: "",
      notes: "",
    },
  });

  // Reset dressage level when dressage type changes
  useEffect(() => {
    if (editingHorse?.dressage_type !== dressageType) setDressageLevel("");
    else setDressageLevel(editingHorse?.dressage_level || "");
  }, [dressageType]);

  // Add this useEffect after your existing useEffects
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
                  frequency_months: schedule.frequency_months,
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

  // Calculate next due date
  const calculateNextDueDate = (
    lastVisitDate: string,
    frequencyMonths: number
  ): string => {
    if (!lastVisitDate) return "";
    const lastVisit = new Date(lastVisitDate);
    const nextDue = new Date(lastVisit);
    nextDue.setMonth(nextDue.getMonth() + frequencyMonths);
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

      if (isEditing && editingHorse) {
        // Update existing horse
        const { error } = await supabase
          .from("horses")
          .update(horseData)
          .eq("id", editingHorse.id)
          .eq("user_id", user.id);

        if (error) throw error;
        horseId = editingHorse.id;

        // Handle care schedule updates for existing horse
        const { data: existingSchedules } = await supabase
          .from("horse_care_schedules")
          .select("*")
          .eq("horse_id", horseId);

        const existingScheduleMap = new Map(
          existingSchedules?.map((s) => [s.care_type, s]) || []
        );

        const updatePromises = [];

        // Process each care type
        Object.entries(careSchedules).forEach(([careType, careData]) => {
          const existingSchedule = existingScheduleMap.get(careType);

          if (careData.enabled && careData.last_visit_date) {
            const nextDueDate = calculateNextDueDate(
              careData.last_visit_date,
              careData.frequency_months
            );

            const scheduleData = {
              frequency_months: careData.frequency_months,
              last_visit_date: careData.last_visit_date,
              next_due_date: nextDueDate,
              notes: careData.notes,
            };

            if (existingSchedule) {
              // Update existing schedule
              updatePromises.push(
                supabase
                  .from("horse_care_schedules")
                  .update(scheduleData)
                  .eq("id", existingSchedule.id)
              );
            } else {
              // Create new schedule
              updatePromises.push(
                supabase.from("horse_care_schedules").insert({
                  horse_id: horseId,
                  care_type: careType,
                  created_by: user.id,
                  ...scheduleData,
                })
              );
            }
          } else if (existingSchedule) {
            // Care type was disabled, delete existing schedule
            updatePromises.push(
              supabase
                .from("horse_care_schedules")
                .delete()
                .eq("id", existingSchedule.id)
            );
          }
        });

        // Execute all schedule updates
        if (updatePromises.length > 0) {
          await Promise.allSettled(updatePromises);
        }

        toast({
          title: language === "es" ? "Caballo actualizado" : "Horse updated",
          description:
            language === "es"
              ? "El perfil de tu caballo ha sido actualizado exitosamente."
              : "Your horse's profile has been updated successfully.",
        });
      } else {
        // Create new horse
        const { data: newHorse, error } = await supabase
          .from("horses")
          .insert([horseData])
          .select()
          .single();

        if (error) throw error;
        horseId = newHorse.id;

        // Create care schedules for new horse
        const careSchedulesToCreate = [];

        Object.entries(careSchedules).forEach(([careType, careData]) => {
          if (careData.enabled && careData.last_visit_date) {
            const nextDueDate = calculateNextDueDate(
              careData.last_visit_date,
              careData.frequency_months
            );

            careSchedulesToCreate.push({
              horse_id: horseId,
              care_type: careType,
              frequency_months: careData.frequency_months,
              last_visit_date: careData.last_visit_date,
              next_due_date: nextDueDate,
              notes: careData.notes,
              created_by: user.id,
            });
          }
        });

        // Insert care schedules and create events (your existing logic)
        if (careSchedulesToCreate.length > 0) {
          const { data: createdSchedules, error: scheduleError } =
            await supabase
              .from("horse_care_schedules")
              .insert(careSchedulesToCreate)
              .select();

          if (scheduleError) {
            console.error("Error creating care schedules:", scheduleError);
            toast({
              title: language === "es" ? "Advertencia" : "Warning",
              description:
                language === "es"
                  ? "El caballo fue guardado pero hubo un problema con los horarios de cuidado."
                  : "Horse was saved but there was an issue with care schedules.",
              variant: "destructive",
            });
          } else {
            // Your existing event creation logic here...
            const eventsToCreate = [];

            createdSchedules.forEach((schedule: any) => {
              const eventDateTime = new Date(schedule.next_due_date);
              eventDateTime.setHours(9, 0, 0, 0);

              eventsToCreate.push({
                horse_id: horseId,
                user_id: user.id,
                title: `${horseName} - ${
                  schedule.care_type.charAt(0).toUpperCase() +
                  schedule.care_type.slice(1)
                } Visit`,
                description: `Scheduled ${schedule.care_type} appointment for ${horseName}`,
                event_date: eventDateTime.toISOString(),
                event_type: schedule.care_type,
                discipline: "Both",
                location: "",
                care_schedule_id: schedule.id,
                is_recurring: true,
                is_completed: false,
              });
            });

            // Rest of your event and notification creation logic...
            if (eventsToCreate.length > 0) {
              const { data: createdEvents, error: eventsError } = await supabase
                .from("events")
                .insert(eventsToCreate)
                .select();

              if (!eventsError && createdEvents) {
                // Your email notification logic here...
              }
            }
          }
        }

        toast({
          title: language === "es" ? "Caballo agregado" : "Horse added",
          description:
            language === "es"
              ? "Tu nuevo caballo ha sido agregado exitosamente."
              : "Your new horse has been added successfully.",
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

      {/* NEW: Care Schedules Section */}
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
          {/* Farrier Care */}
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
            onUpdate={(field, value) =>
              updateCareSchedule("farrier", field, value)
            }
            frequencyOptions={[
              {
                value: 4,
                label: language === "es" ? "Cada 4 meses" : "Every 4 months",
              },
              {
                value: 6,
                label: language === "es" ? "Cada 6 meses" : "Every 6 months",
              },
              {
                value: 8,
                label: language === "es" ? "Cada 8 meses" : "Every 8 months",
              },
            ]}
          />

          <Separator />

          {/* Vaccination */}
          <CareScheduleSection
            careType="vaccination"
            icon={<Shield className="h-5 w-5" />}
            title={language === "es" ? "Vacunación" : "Vaccination"}
            description={
              language === "es"
                ? "Vacunas contra la gripe y otras"
                : "Flu shots and other vaccinations"
            }
            careData={careSchedules.vaccination}
            language={language}
            onUpdate={(field, value) =>
              updateCareSchedule("vaccination", field, value)
            }
            frequencyOptions={[
              {
                value: 6,
                label: language === "es" ? "Cada 6 meses" : "Every 6 months",
              },
              { value: 12, label: language === "es" ? "Anual" : "Yearly" },
            ]}
          />

          <Separator />

          {/* Dental Care */}
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
          />

          <Separator />

          {/* Worming */}
          <CareScheduleSection
            careType="worming"
            icon={<Shield className="h-5 w-5" />}
            title={language === "es" ? "Desparasitación" : "Worming"}
            description={
              language === "es"
                ? "Tratamientos de prevención de parásitos"
                : "Parasite prevention treatments"
            }
            careData={careSchedules.worming}
            language={language}
            onUpdate={(field, value) =>
              updateCareSchedule("worming", field, value)
            }
            frequencyOptions={[
              {
                value: 3,
                label: language === "es" ? "Cada 3 meses" : "Every 3 months",
              },
              {
                value: 6,
                label: language === "es" ? "Cada 6 meses" : "Every 6 months",
              },
            ]}
          />
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
            <Label htmlFor="weaknesses">
              {language === "es" ? "Áreas de mejora" : "Areas for Improvement"}
            </Label>
            <Textarea
              id="weaknesses"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder={
                language === "es"
                  ? "¿Qué áreas te gustaría mejorar?"
                  : "What areas would you like to improve?"
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

// Care Schedule Section Component
interface CareScheduleSectionProps {
  careType: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  careData: CareSchedule;
  language: string;
  onUpdate: (field: keyof CareSchedule, value: any) => void;
  frequencyOptions: { value: number; label: string }[];
}

const CareScheduleSection = ({
  careType,
  icon,
  title,
  description,
  careData,
  language,
  onUpdate,
  frequencyOptions,
}: CareScheduleSectionProps) => {
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
            <div className="space-y-2">
              <Label>
                {language === "es" ? "¿Con qué frecuencia?" : "How often?"}
              </Label>
              <Select
                value={careData.frequency_months.toString()}
                onValueChange={(value) =>
                  onUpdate("frequency_months", parseInt(value))
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

            <div className="space-y-2">
              <Label>
                {language === "es"
                  ? "¿Cuándo fue la última visita?"
                  : "When was the last visit?"}
              </Label>
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
                {new Date(careData.last_visit_date).toLocaleDateString() !==
                  "Invalid Date" &&
                  (() => {
                    const lastVisit = new Date(careData.last_visit_date);
                    const nextDue = new Date(lastVisit);
                    nextDue.setMonth(
                      nextDue.getMonth() + careData.frequency_months
                    );
                    return nextDue.toLocaleDateString();
                  })()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HorseForm;
