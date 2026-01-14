import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Save,
  FileText,
  User,
  Calendar,
  Award,
  MessageSquare,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import HealthCheckForm, {
  HealthFormData,
} from "@/components/analysis/HealthCheckForm";

interface ExtractionVerificationProps {
  documentId: string;
  onVerificationComplete: () => void;
}

interface FieldData {
  value: any;
  confidence?: number;
  modified?: boolean;
}

interface ExtractedData {
  horse?: string;
  rider?: string;
  testDate?: string;
  testLevel?: string;
  percentage?: number;
  movements?: Array<{
    number: number;
    name: string;
    scores: {
      judgeA?: number;
      judgeB?: number;
      judgeC?: number;
    };
    comments?: {
      judgeA?: string;
      judgeB?: string;
      judgeC?: string;
    };
  }>;
  collectiveMarks?: {
    paces?: { judgeA?: number; judgeB?: number; judgeC?: number };
    impulsion?: { judgeA?: number; judgeB?: number; judgeC?: number };
    submission?: { judgeA?: number; judgeB?: number; judgeC?: number };
    riderPosition?: { judgeA?: number; judgeB?: number; judgeC?: number };
  };
  generalComments?: {
    judgeA?: string;
    judgeB?: string;
    judgeC?: string;
  };
  highestScore?: {
    score: number;
    movement: string[];
  };
  lowestScore?: {
    score: number;
    movement: string[];
  };
}

interface ConfidenceScores {
  overall: number;
  fields: Record<string, number>;
  lowConfidenceFields: string[];
  lowConfidenceCount: number;
}

const ExtractionVerification: React.FC<ExtractionVerificationProps> = ({
  documentId,
  onVerificationComplete,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores>({
    overall: 0,
    fields: {},
    lowConfidenceFields: [],
    lowConfidenceCount: 0,
  });
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [documentUrl, setDocumentUrl] = useState<string>("");

  // Health check data
  const [healthData, setHealthData] = useState<HealthFormData>({
    healthStatus: "healthy",
    affectedAreas: [],
    fitnessLevel: "good",
    restrictions: [],
  });

  // ============================================
  // HELPER FUNCTIONS - MUST BE HERE, BEFORE useEffect
  // ============================================

  // Get confidence color
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return "bg-gray-200 text-gray-700";
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get confidence icon
  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <AlertCircle className="h-4 w-4" />;
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  // Handle field change
  const handleFieldChange = (fieldPath: string, value: any) => {
    // Update the data
    const keys = fieldPath.split(".");
    const newData = { ...extractedData };

    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setExtractedData(newData);

    // Mark as modified
    setModifiedFields((prev) => new Set(prev).add(fieldPath));
  };

  // Helper to get original value (for audit logging)
  const getOriginalValue = (fieldPath: string): string => {
    return String(getFieldValue(fieldPath));
  };

  // Helper to get field value from nested path
  const getFieldValue = (fieldPath: string): any => {
    const keys = fieldPath.split(".");
    let value: any = extractedData;
    for (const key of keys) {
      if (value === undefined || value === null) return null;
      value = value[key];
    }
    return value;
  };

  // Helper to get confidence for a field
  const getFieldConfidence = (fieldPath: string): number | undefined => {
    return confidenceScores.fields[fieldPath];
  };

  // ============================================
  // END HELPER FUNCTIONS
  // ============================================

  // Load extraction data
  useEffect(() => {
    loadExtractionData();
  }, [documentId]);

  const loadExtractionData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      console.log("📥 Loading extraction data for document:", documentId);

      // Get document with extraction_id
      const { data: docData, error: docError } = await supabase
        .from("document_analysis")
        .select("extraction_id, document_url")
        .eq("id", documentId)
        .single();

      if (docError) {
        console.error("❌ Error fetching document:", docError);
        throw docError;
      }

      if (!docData?.extraction_id) {
        console.error("❌ No extraction_id found for document");
        throw new Error("No extraction data found for this document");
      }

      console.log("✅ Found extraction_id:", docData.extraction_id);

      setExtractionId(docData.extraction_id);
      setDocumentUrl(docData.document_url);

      // Get extraction data
      const { data: extractionData, error: extractionError } = await supabase
        .from("document_extractions")
        .select("extracted_data, confidence_scores, verified_data")
        .eq("id", docData.extraction_id)
        .single();

      if (extractionError) {
        console.error("❌ Error fetching extraction:", extractionError);
        throw extractionError;
      }

      if (!extractionData) {
        throw new Error("No extraction data found");
      }

      console.log("✅ Extraction data loaded successfully");

      // Use verified data if available, otherwise use extracted data
      const dataToUse =
        extractionData.verified_data || extractionData.extracted_data;

      setExtractedData(dataToUse);
      setConfidenceScores(extractionData.confidence_scores);

      console.log("📊 Loaded data:", dataToUse);
      console.log("📊 Confidence scores:", extractionData.confidence_scores);
    } catch (error: any) {
      console.error("❌ Failed to load extraction data:", error);
      setHasError(true);
      setErrorMessage(error.message || "Failed to load extraction data");

      toast({
        title: language === "en" ? "Loading Failed" : "Error al Cargar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save verified data
  const handleSaveAndContinue = async () => {
    try {
      setIsSaving(true);

      if (!extractionId) {
        throw new Error("No extraction ID found");
      }

      console.log("💾 Saving verified data...");
      console.log("Modified fields:", Array.from(modifiedFields));

      console.log("🏥 Health data:", healthData);

      // First, update document with health data
      const { error: healthUpdateError } = await supabase
        .from("document_analysis")
        .update({
          health_status: healthData.healthStatus,
          health_details: {
            affected_areas: healthData.affectedAreas,
            fitness_level: healthData.fitnessLevel,
            restrictions: healthData.restrictions,
          },
        })
        .eq("id", documentId);

      if (healthUpdateError) {
        console.error("Failed to save health data:", healthUpdateError);
        throw healthUpdateError;
      }

      console.log("✅ Health data saved");

      // Save verified data to database
      const { error: updateError } = await supabase
        .from("document_extractions")
        .update({
          verified_data: extractedData,
          modified_fields: Array.from(modifiedFields),
          extraction_status: "verified",
          verified_at: new Date().toISOString(),
        })
        .eq("id", extractionId);

      if (updateError) throw updateError;

      // Update document status to verification_complete
      const { error: docUpdateError } = await supabase
        .from("document_analysis")
        .update({
          status: "verification_complete",
          verification_completed: true,
          verification_completed_at: new Date().toISOString(),
          fields_modified_count: modifiedFields.size,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (docUpdateError) throw docUpdateError;

      // Log audit trail for each modified field
      if (modifiedFields.size > 0) {
        const auditLogs = Array.from(modifiedFields).map((fieldName) => ({
          document_id: documentId,
          extraction_id: extractionId,
          user_id: user?.id,
          field_name: fieldName,
          ai_extracted_value: getOriginalValue(fieldName),
          ai_confidence: confidenceScores.fields[fieldName] || 0,
          user_corrected_value: String(getFieldValue(fieldName)),
          was_modified: true,
          modified_at: new Date().toISOString(),
        }));

        const { error: auditError } = await supabase
          .from("extraction_audit_log")
          .insert(auditLogs);

        if (auditError) {
          console.warn("Failed to save audit log:", auditError);
        }
      }

      console.log("✅ Verified data saved");

      toast({
        title: language === "en" ? "Data Verified" : "Datos Verificados",
        description:
          language === "en"
            ? "Your corrections have been saved. Generating analysis..."
            : "Tus correcciones han sido guardadas. Generando análisis...",
      });

      setIsSaving(false);

      // Call the callback to trigger full analysis
      onVerificationComplete();
    } catch (error: any) {
      console.error("❌ Failed to save verified data:", error);
      setIsSaving(false);
      toast({
        title: language === "en" ? "Save Failed" : "Error al Guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ERROR STATE
  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === "en" ? "Loading Error" : "Error de Carga"}
          </h3>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <Button onClick={() => loadExtractionData()}>
            {language === "en" ? "Try Again" : "Intentar de Nuevo"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // LOADING STATE
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-700 mr-3" />
          <span className="text-lg">
            {language === "en"
              ? "Loading extraction data..."
              : "Cargando datos extraídos..."}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-purple-700" />
              <span>
                {language === "en"
                  ? "Verify Extracted Data"
                  : "Verificar Datos Extraídos"}
              </span>
            </div>
            <Badge className={getConfidenceColor(confidenceScores.overall)}>
              {getConfidenceIcon(confidenceScores.overall)}
              <span className="ml-2">
                {language === "en"
                  ? "Overall Confidence:"
                  : "Confianza General:"}{" "}
                {Math.round(confidenceScores.overall * 100)}%
              </span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              {language === "en"
                ? "Please review the extracted data below. Fields with low confidence are highlighted. Correct any errors before proceeding to analysis."
                : "Por favor revisa los datos extraídos a continuación. Los campos con baja confianza están resaltados. Corrige cualquier error antes de proceder al análisis."}
            </p>

            {confidenceScores.lowConfidenceCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    {language === "en"
                      ? `${confidenceScores.lowConfidenceCount} fields need verification`
                      : `${confidenceScores.lowConfidenceCount} campos necesitan verificación`}
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    {language === "en"
                      ? "Please review highlighted fields carefully as they may contain errors."
                      : "Por favor revisa cuidadosamente los campos resaltados ya que pueden contener errores."}
                  </p>
                </div>
              </div>
            )}

            {modifiedFields.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  {language === "en"
                    ? `${modifiedFields.size} field(s) modified`
                    : `${modifiedFields.size} campo(s) modificado(s)`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Editable Form */}
        <div className="space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {language === "en"
                      ? "Basic Information"
                      : "Información Básica"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Horse Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="horse">
                        {language === "en"
                          ? "Horse Name"
                          : "Nombre del Caballo"}
                      </Label>
                      <Badge
                        className={getConfidenceColor(
                          getFieldConfidence("horseName")
                        )}
                      >
                        {getConfidenceIcon(getFieldConfidence("horseName"))}
                        <span className="ml-1 text-xs">
                          {Math.round(
                            (getFieldConfidence("horseName") || 0) * 100
                          )}
                          %
                        </span>
                      </Badge>
                    </div>
                    <Input
                      id="horse"
                      value={extractedData.horse || ""}
                      onChange={(e) =>
                        handleFieldChange("horse", e.target.value)
                      }
                      className={
                        modifiedFields.has("horse")
                          ? "border-blue-400 bg-blue-50"
                          : getFieldConfidence("horseName") &&
                            getFieldConfidence("horseName")! < 0.8
                          ? "border-orange-400 bg-orange-50"
                          : ""
                      }
                    />
                  </div>

                  {/* Rider Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rider">
                        {language === "en" ? "Rider Name" : "Nombre del Jinete"}
                      </Label>
                      <Badge
                        className={getConfidenceColor(
                          getFieldConfidence("rider")
                        )}
                      >
                        {getConfidenceIcon(getFieldConfidence("rider"))}
                        <span className="ml-1 text-xs">
                          {Math.round((getFieldConfidence("rider") || 0) * 100)}
                          %
                        </span>
                      </Badge>
                    </div>
                    <Input
                      id="rider"
                      value={extractedData.rider || ""}
                      onChange={(e) =>
                        handleFieldChange("rider", e.target.value)
                      }
                      className={
                        modifiedFields.has("rider")
                          ? "border-blue-400 bg-blue-50"
                          : getFieldConfidence("rider") &&
                            getFieldConfidence("rider")! < 0.8
                          ? "border-orange-400 bg-orange-50"
                          : ""
                      }
                    />
                  </div>

                  {/* Test Date */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="testDate">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        {language === "en" ? "Test Date" : "Fecha de Prueba"}
                      </Label>
                      <Badge
                        className={getConfidenceColor(
                          getFieldConfidence("testDate")
                        )}
                      >
                        {getConfidenceIcon(getFieldConfidence("testDate"))}
                        <span className="ml-1 text-xs">
                          {Math.round(
                            (getFieldConfidence("testDate") || 0) * 100
                          )}
                          %
                        </span>
                      </Badge>
                    </div>
                    <Input
                      id="testDate"
                      type="date"
                      value={extractedData.testDate || ""}
                      onChange={(e) =>
                        handleFieldChange("testDate", e.target.value)
                      }
                      className={
                        modifiedFields.has("testDate")
                          ? "border-blue-400 bg-blue-50"
                          : getFieldConfidence("testDate") &&
                            getFieldConfidence("testDate")! < 0.8
                          ? "border-orange-400 bg-orange-50"
                          : ""
                      }
                    />
                  </div>

                  {/* Test Level */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="testLevel">
                        <Award className="h-4 w-4 inline mr-2" />
                        {language === "en" ? "Test Level" : "Nivel de Prueba"}
                      </Label>
                      <Badge
                        className={getConfidenceColor(
                          getFieldConfidence("testLevel")
                        )}
                      >
                        {getConfidenceIcon(getFieldConfidence("testLevel"))}
                        <span className="ml-1 text-xs">
                          {Math.round(
                            (getFieldConfidence("testLevel") || 0) * 100
                          )}
                          %
                        </span>
                      </Badge>
                    </div>
                    <Input
                      id="testLevel"
                      value={extractedData.testLevel || ""}
                      onChange={(e) =>
                        handleFieldChange("testLevel", e.target.value)
                      }
                      className={
                        modifiedFields.has("testLevel")
                          ? "border-blue-400 bg-blue-50"
                          : getFieldConfidence("testLevel") &&
                            getFieldConfidence("testLevel")! < 0.8
                          ? "border-orange-400 bg-orange-50"
                          : ""
                      }
                    />
                  </div>

                  {/* Overall Percentage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="percentage">
                        {language === "en"
                          ? "Overall Score (%)"
                          : "Puntuación Total (%)"}
                      </Label>
                      <Badge
                        className={getConfidenceColor(
                          getFieldConfidence("percentage")
                        )}
                      >
                        {getConfidenceIcon(getFieldConfidence("percentage"))}
                        <span className="ml-1 text-xs">
                          {Math.round(
                            (getFieldConfidence("percentage") || 0) * 100
                          )}
                          %
                        </span>
                      </Badge>
                    </div>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={extractedData.percentage || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "percentage",
                          parseFloat(e.target.value)
                        )
                      }
                      className={
                        modifiedFields.has("percentage")
                          ? "border-blue-400 bg-blue-50"
                          : getFieldConfidence("percentage") &&
                            getFieldConfidence("percentage")! < 0.8
                          ? "border-orange-400 bg-orange-50"
                          : ""
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Movements - Accordion */}
              {extractedData.movements &&
                extractedData.movements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {language === "en"
                          ? "Movement Scores"
                          : "Puntuaciones de Movimientos"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {extractedData.movements.map((movement, index) => (
                          <AccordionItem
                            key={index}
                            value={`movement-${index}`}
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span className="font-medium">
                                  {movement.number}.{" "}
                                  {movement.name ||
                                    `Movement ${movement.number}`}
                                </span>
                                <div className="flex gap-2">
                                  {["judgeA", "judgeB", "judgeC"].map(
                                    (judge) => {
                                      const score =
                                        movement.scores?.[
                                          judge as keyof typeof movement.scores
                                        ];
                                      const confidence = getFieldConfidence(
                                        `movement${
                                          index + 1
                                        }Score${judge.toUpperCase()}`
                                      );
                                      return (
                                        <Badge
                                          key={judge}
                                          variant="outline"
                                          className={getConfidenceColor(
                                            confidence
                                          )}
                                        >
                                          {judge.charAt(judge.length - 1)}:{" "}
                                          {score || "—"}
                                        </Badge>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-4">
                                {/* Movement Name */}
                                <div className="space-y-2">
                                  <Label>
                                    {language === "en"
                                      ? "Movement Name"
                                      : "Nombre del Movimiento"}
                                  </Label>
                                  <Input
                                    value={movement.name || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        `movements.${index}.name`,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                {/* Judge Scores */}
                                <div className="grid grid-cols-3 gap-3">
                                  {["judgeA", "judgeB", "judgeC"].map(
                                    (judge) => (
                                      <div key={judge} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <Label className="text-xs">
                                            {language === "en"
                                              ? "Judge"
                                              : "Juez"}{" "}
                                            {judge
                                              .charAt(judge.length - 1)
                                              .toUpperCase()}
                                          </Label>
                                          <Badge
                                            className={getConfidenceColor(
                                              getFieldConfidence(
                                                `movement${
                                                  index + 1
                                                }Score${judge.toUpperCase()}`
                                              )
                                            )}
                                          >
                                            <span className="text-xs">
                                              {Math.round(
                                                (getFieldConfidence(
                                                  `movement${
                                                    index + 1
                                                  }Score${judge.toUpperCase()}`
                                                ) || 0) * 100
                                              )}
                                              %
                                            </span>
                                          </Badge>
                                        </div>
                                        <Input
                                          type="number"
                                          step="0.5"
                                          min="0"
                                          max="10"
                                          value={
                                            movement.scores?.[
                                              judge as keyof typeof movement.scores
                                            ] || ""
                                          }
                                          onChange={(e) =>
                                            handleFieldChange(
                                              `movements.${index}.scores.${judge}`,
                                              parseFloat(e.target.value)
                                            )
                                          }
                                          className={
                                            getFieldConfidence(
                                              `movement${
                                                index + 1
                                              }Score${judge.toUpperCase()}`
                                            ) &&
                                            getFieldConfidence(
                                              `movement${
                                                index + 1
                                              }Score${judge.toUpperCase()}`
                                            )! < 0.8
                                              ? "border-orange-400 bg-orange-50"
                                              : ""
                                          }
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

              {/* Judge Comments */}
              {extractedData.generalComments && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {language === "en"
                        ? "Judge Comments"
                        : "Comentarios de Jueces"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["judgeA", "judgeB", "judgeC"].map((judge) => (
                      <div key={judge} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>
                            {language === "en" ? "Judge" : "Juez"}{" "}
                            {judge.charAt(judge.length - 1).toUpperCase()}
                          </Label>
                          <Badge
                            className={getConfidenceColor(
                              getFieldConfidence(`${judge}Comment`)
                            )}
                          >
                            {getConfidenceIcon(
                              getFieldConfidence(`${judge}Comment`)
                            )}
                            <span className="ml-1 text-xs">
                              {Math.round(
                                (getFieldConfidence(`${judge}Comment`) || 0) *
                                  100
                              )}
                              %
                            </span>
                          </Badge>
                        </div>
                        <Textarea
                          value={
                            extractedData.generalComments?.[
                              judge as keyof typeof extractedData.generalComments
                            ] || ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              `generalComments.${judge}`,
                              e.target.value
                            )
                          }
                          rows={3}
                          className={
                            modifiedFields.has(`generalComments.${judge}`)
                              ? "border-blue-400 bg-blue-50"
                              : getFieldConfidence(`${judge}Comment`) &&
                                getFieldConfidence(`${judge}Comment`)! < 0.8
                              ? "border-orange-400 bg-orange-50"
                              : ""
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column - Document Preview */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === "en"
                  ? "Document Preview"
                  : "Vista Previa del Documento"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: "600px" }}
              >
                {documentUrl ? (
                  <iframe
                    src={`${documentUrl}#toolbar=0`}
                    className="w-full h-full"
                    title="Document Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {language === "en"
                      ? "No preview available"
                      : "Vista previa no disponible"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Health Check Form - NEW! */}
      <HealthCheckForm onHealthDataChange={setHealthData} />
      {/* Action Buttons */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="text-sm text-gray-600">
              {modifiedFields.size > 0 ? (
                <span>
                  {language === "en"
                    ? `${modifiedFields.size} field(s) modified and ready to save`
                    : `${modifiedFields.size} campo(s) modificado(s) y listo para guardar`}
                </span>
              ) : (
                <span>
                  {language === "en"
                    ? "No modifications made. Click below to proceed with extracted data."
                    : "No se hicieron modificaciones. Haz clic abajo para proceder con los datos extraídos."}
                </span>
              )}
            </div>
            <Button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "en" ? "Saving..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {language === "en"
                    ? "Save & Generate Analysis"
                    : "Guardar y Generar Análisis"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractionVerification;
