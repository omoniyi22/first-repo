import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";

interface HealthCheckFormProps {
  onHealthDataChange: (healthData: HealthFormData) => void;
}

export interface HealthFormData {
  healthStatus: "healthy" | "minor_issues" | "lameness" | "recovering";
  affectedAreas: string[];
  fitnessLevel: "excellent" | "good" | "fair" | "low";
  restrictions: string[];
}

const HealthCheckForm: React.FC<HealthCheckFormProps> = ({
  onHealthDataChange,
}) => {
  const { language } = useLanguage();

  const [healthData, setHealthData] = useState<HealthFormData>({
    healthStatus: "healthy",
    affectedAreas: [],
    fitnessLevel: "good",
    restrictions: [],
  });

  // Update parent component whenever data changes
  const updateHealthData = (updates: Partial<HealthFormData>) => {
    const newData = { ...healthData, ...updates };
    setHealthData(newData);
    onHealthDataChange(newData);
  };

  // Handle affected area toggle
  const toggleAffectedArea = (area: string) => {
    const newAreas = healthData.affectedAreas.includes(area)
      ? healthData.affectedAreas.filter((a) => a !== area)
      : [...healthData.affectedAreas, area];
    updateHealthData({ affectedAreas: newAreas });
  };

  // Handle restriction toggle
  const toggleRestriction = (restriction: string) => {
    const newRestrictions = healthData.restrictions.includes(restriction)
      ? healthData.restrictions.filter((r) => r !== restriction)
      : [...healthData.restrictions, restriction];
    updateHealthData({ restrictions: newRestrictions });
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-xl font-semibold">
          {language === "en"
            ? "Horse Health & Fitness"
            : "Salud y Estado Físico del Caballo"}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {language === "en"
            ? "Help us provide safe, appropriate exercise recommendations"
            : "Ayúdanos a proporcionar recomendaciones de ejercicio seguras y apropiadas"}
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              {language === "en"
                ? "We'll adjust recommendations based on your horse's current condition to ensure safe training."
                : "Ajustaremos las recomendaciones según la condición actual de tu caballo para garantizar un entrenamiento seguro."}
            </p>
          </div>
        </div>

        {/* Question 1: Health Status */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium text-gray-900">
              {language === "en"
                ? "Current Health Status"
                : "Estado de Salud Actual"}
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              {language === "en"
                ? "Select the option that best describes your horse"
                : "Selecciona la opción que mejor describe a tu caballo"}
            </p>
          </div>
          <RadioGroup
            value={healthData.healthStatus}
            onValueChange={(value) =>
              updateHealthData({
                healthStatus: value as HealthFormData["healthStatus"],
              })
            }
            className="space-y-3"
          >
            <label
              htmlFor="healthy"
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.healthStatus === "healthy"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="healthy" id="healthy" className="mt-1" />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">
                  {language === "en"
                    ? "Healthy & Sound"
                    : "Sano y en Forma"}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {language === "en"
                    ? "No health issues, ready for normal training"
                    : "Sin problemas de salud, listo para entrenamiento normal"}
                </div>
              </div>
            </label>

            <label
              htmlFor="minor_issues"
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.healthStatus === "minor_issues"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="minor_issues" id="minor_issues" className="mt-1" />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">
                  {language === "en"
                    ? "Minor Stiffness or Soreness"
                    : "Rigidez o Dolor Leve"}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {language === "en"
                    ? "Horse can work but needs gentle exercises"
                    : "El caballo puede trabajar pero necesita ejercicios suaves"}
                </div>
              </div>
            </label>

            <label
              htmlFor="lameness"
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.healthStatus === "lameness"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="lameness" id="lameness" className="mt-1" />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">
                  {language === "en"
                    ? "Lameness or Injury"
                    : "Cojera o Lesión"}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {language === "en"
                    ? "Only very gentle work recommended"
                    : "Solo se recomienda trabajo muy suave"}
                </div>
              </div>
            </label>

            <label
              htmlFor="recovering"
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.healthStatus === "recovering"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="recovering" id="recovering" className="mt-1" />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900">
                  {language === "en"
                    ? "Recovering from Injury"
                    : "Recuperándose de Lesión"}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {language === "en"
                    ? "Gradual return to work"
                    : "Retorno gradual al trabajo"}
                </div>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Question 2: Affected Areas (only if not healthy) */}
        {healthData.healthStatus !== "healthy" && (
          <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-base font-medium text-gray-900">
                {language === "en"
                  ? "Affected Areas"
                  : "Áreas Afectadas"}
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                {language === "en"
                  ? "Select all areas where your horse has issues"
                  : "Selecciona todas las áreas donde tu caballo tiene problemas"}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  value: "front_left",
                  label:
                    language === "en" ? "Front Left" : "Delantero Izquierdo",
                },
                {
                  value: "front_right",
                  label:
                    language === "en" ? "Front Right" : "Delantero Derecho",
                },
                {
                  value: "hind_left",
                  label: language === "en" ? "Hind Left" : "Trasero Izquierdo",
                },
                {
                  value: "hind_right",
                  label: language === "en" ? "Hind Right" : "Trasero Derecho",
                },
                { value: "back", label: language === "en" ? "Back" : "Espalda" },
                {
                  value: "neck",
                  label: language === "en" ? "Neck" : "Cuello",
                },
              ].map((area) => (
                <label
                  key={area.value}
                  htmlFor={area.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    healthData.affectedAreas.includes(area.value)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    id={area.value}
                    checked={healthData.affectedAreas.includes(area.value)}
                    onCheckedChange={() => toggleAffectedArea(area.value)}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {area.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Question 3: Fitness Level */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium text-gray-900">
              {language === "en"
                ? "Fitness Level"
                : "Nivel de Condición Física"}
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              {language === "en"
                ? "How fit is your horse currently?"
                : "¿Qué tan en forma está tu caballo actualmente?"}
            </p>
          </div>
          <RadioGroup
            value={healthData.fitnessLevel}
            onValueChange={(value) =>
              updateHealthData({
                fitnessLevel: value as HealthFormData["fitnessLevel"],
              })
            }
            className="grid grid-cols-2 gap-3"
          >
            <label
              htmlFor="excellent"
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.fitnessLevel === "excellent"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="excellent" id="excellent" className="sr-only" />
              <div className="font-medium text-gray-900 mb-1">
                {language === "en" ? "Excellent" : "Excelente"}
              </div>
              <div className="text-xs text-gray-600">
                {language === "en"
                  ? "Regular competition"
                  : "Competición regular"}
              </div>
            </label>

            <label
              htmlFor="good"
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.fitnessLevel === "good"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="good" id="good" className="sr-only" />
              <div className="font-medium text-gray-900 mb-1">
                {language === "en" ? "Good" : "Bueno"}
              </div>
              <div className="text-xs text-gray-600">
                {language === "en"
                  ? "Consistent training"
                  : "Entrenamiento constante"}
              </div>
            </label>

            <label
              htmlFor="fair"
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.fitnessLevel === "fair"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="fair" id="fair" className="sr-only" />
              <div className="font-medium text-gray-900 mb-1">
                {language === "en" ? "Fair" : "Regular"}
              </div>
              <div className="text-xs text-gray-600">
                {language === "en"
                  ? "Light work only"
                  : "Solo trabajo ligero"}
              </div>
            </label>

            <label
              htmlFor="low"
              className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                healthData.fitnessLevel === "low"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <RadioGroupItem value="low" id="low" className="sr-only" />
              <div className="font-medium text-gray-900 mb-1">
                {language === "en" ? "Low" : "Bajo"}
              </div>
              <div className="text-xs text-gray-600">
                {language === "en"
                  ? "Just starting/returning"
                  : "Recién comenzando"}
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Question 4: Restrictions */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium text-gray-900">
              {language === "en"
                ? "Movement Restrictions"
                : "Restricciones de Movimiento"}
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              {language === "en"
                ? "Select any restrictions (optional)"
                : "Selecciona cualquier restricción (opcional)"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                value: "no_intense_work",
                label:
                  language === "en"
                    ? "No intense work"
                    : "Sin trabajo intenso",
              },
              {
                value: "no_lateral_work",
                label:
                  language === "en"
                    ? "No lateral work"
                    : "Sin trabajo lateral",
              },
              {
                value: "no_collection",
                label:
                  language === "en" ? "No collection" : "Sin recolección",
              },
              {
                value: "walk_work_only",
                label:
                  language === "en"
                    ? "Walk work only"
                    : "Solo trabajo al paso",
              },
              {
                value: "none",
                label:
                  language === "en"
                    ? "None - cleared for all work"
                    : "Ninguna - autorizado para todo",
              },
            ].map((restriction) => (
              <label
                key={restriction.value}
                htmlFor={restriction.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  healthData.restrictions.includes(restriction.value)
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Checkbox
                  id={restriction.value}
                  checked={healthData.restrictions.includes(restriction.value)}
                  onCheckedChange={() => toggleRestriction(restriction.value)}
                />
                <span className="text-sm font-medium text-gray-700">
                  {restriction.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Warning if lameness selected */}
        {healthData.healthStatus === "lameness" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-900 mb-1">
                  {language === "en"
                    ? "Veterinary Consultation Recommended"
                    : "Se Recomienda Consulta Veterinaria"}
                </p>
                <p className="text-red-800">
                  {language === "en"
                    ? "We will only suggest very gentle exercises. Please consult your veterinarian before any training."
                    : "Solo sugeriremos ejercicios muy suaves. Por favor consulta a tu veterinario antes de cualquier entrenamiento."}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthCheckForm;