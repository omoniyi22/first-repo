import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar as CalendarIcon,
  Upload,
  CloudUpload,
  File,
  X,
  Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { dressageLevels } from "@/lib/formOptions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchPdfAsBase64 } from "@/utils/pdfUtils";
import { convertImagesToPDF, imageToBase64PDF } from "@/utils/img2pdf";
import * as jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

const DocumentUploadFormSchema = z.object({
  discipline: z.enum(["dressage", "jumping"]),
  testLevel: z.string().optional(),
  competitionType: z.string().optional(),
  date: z.date({
    required_error: "Please select a date",
  }),
  horseId: z.string({
    required_error: "Please select a horse",
  }),
  notes: z.string().optional(),
});

type DocumentUploadFormValues = z.infer<typeof DocumentUploadFormSchema>;

const jumpingCompetitionTypes = [
  "Show Jumping",
  "Derby",
  "Grand Prix",
  "Power & Speed",
  "Table A",
  "Table C",
  "Training Round",
];

interface DocumentUploadProps {
  fetchDocs?: () => void;
}
const DocumentUpload = ({ fetchDocs }: DocumentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [horses, setHorses] = useState<any[]>([]);
  const [isLoadingHorses, setIsLoadingHorses] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newDocumentId, setNewDocumentId] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<any>("");
  const [isShowSpinner, setIsShowSpinner] = useState<boolean>(false);
  const [userDiscipline, setUserDiscipline] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(DocumentUploadFormSchema),
    defaultValues: {
      discipline: "dressage",
      date: new Date(),
    },
  });

  const discipline = form.watch("discipline");

  useEffect(() => {
    // Reset form fields when discipline changes
    if (discipline === "dressage") {
      form.setValue("competitionType", undefined);
    } else {
      form.setValue("testLevel", undefined);
    }
  }, [discipline, form]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setIsLoadingHorses(true);
        setIsLoadingProfile(true);

        // Fetch user profile to get discipline
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("discipline")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData?.discipline) {
          setUserDiscipline(profileData.discipline);
          form.setValue(
            "discipline",
            profileData.discipline as "dressage" | "jumping"
          );
        }

        // Fetch horses from the user's profile
        const { data: horsesData, error } = await supabase
          .from("horses")
          .select("id, name, breed, age")
          .eq("user_id", user.id)
          .order("name");

        if (error) {
          console.error("Error fetching horses:", error);
          toast({
            title:
              language === "en"
                ? "Error loading horses"
                : "Error al cargar caballos",
            description:
              language === "en"
                ? "Could not load your horses. Please try again."
                : "No se pudieron cargar tus caballos. Inténtalo de nuevo.",
            variant: "destructive",
          });
          setHorses([]);
        } else {
          setHorses(horsesData || []);
        }
      } catch (error) {
        console.error("Error fetching horses:", error);
        setHorses([]);
      } finally {
        setIsLoadingHorses(false);
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user, language, toast, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const validFiles: File[] = [];
      let hasInvalidFiles = false;

      // Check if there's a PDF file
      const pdfFile = Array.from(files).find(
        (file) => file.type === "application/pdf"
      );

      if (pdfFile) {
        // If PDF is found, only use that
        validFiles.push(pdfFile);
      } else {
        // Otherwise, collect all valid image files
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileType = file.type;

          if (
            fileType === "image/jpeg" ||
            fileType === "image/png" ||
            fileType === "image/webp"
          ) {
            validFiles.push(file);
          } else {
            hasInvalidFiles = true;
          }
        }
      }

      if (hasInvalidFiles) {
        toast({
          title:
            language === "en"
              ? "Invalid file type"
              : "Tipo de archivo no válido",
          description:
            language === "en"
              ? "Please upload only PDF, JPG, PNG or WebP files."
              : "Por favor sube solo archivos PDF, JPG, PNG o WebP.",
          variant: "destructive",
        });
      }

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFiles([]);
    // Reset file input
    const fileInput = document.getElementById(
      "document-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: DocumentUploadFormValues) => {
    if (selectedFiles.length === 0 || !user) {
      toast({
        title:
          language === "en" ? "Missing information" : "Información faltante",
        description:
          language === "en"
            ? "Please select at least one file and fill in all required fields."
            : "Por favor selecciona al menos un archivo y completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Find the selected horse name
      const selectedHorse = horses.find((h) => h.id === data.horseId);
      const horseName = selectedHorse?.name || "Unknown Horse";

      // Create a custom filename based on test level/competition type and date
      let fileName, fileBlob, fileType;

      // Format the date for filename (YYYY-MM-DD)
      const formattedDate = format(data.date, "yyyy-MM-dd");

      // Create filename prefix based on discipline
      let filePrefix = "";
      if (data.discipline === "dressage" && data.testLevel) {
        filePrefix = `${data.testLevel}_${formattedDate}`;
      } else if (data.discipline === "jumping" && data.competitionType) {
        filePrefix = `${data.competitionType.replace(
          /\s+/g,
          "-"
        )}_${formattedDate}`;
      } else {
        // Fallback if no test level or competition type is selected
        filePrefix = `${data.discipline}_${formattedDate}`;
      }

      // Clean the prefix to make it filename-safe
      filePrefix = filePrefix.replace(/[^a-zA-Z0-9\-_]/g, "-");

      // Check if we're dealing with a single PDF or multiple images
      const isPDF = selectedFiles.some(
        (file) => file.type === "application/pdf"
      );

      if (isPDF) {
        // Use the PDF directly with custom filename
        const pdfFile = selectedFiles.find(
          (file) => file.type === "application/pdf"
        )!;
        const originalExtension = pdfFile.name.split(".").pop();
        fileName = `${filePrefix}.${originalExtension}`;
        fileBlob = pdfFile;
        fileType = "application/pdf";
      } else {
        // Convert images to a single PDF with custom filename
        fileName = `${filePrefix}_combined.pdf`;
        fileBlob = await convertImagesToPDF(selectedFiles);
        fileType = "application/pdf";
      }

      console.log("Generated filename:", fileName);
      const filePath = `${user.id}/${fileName}`;

      // Update progress
      setUploadProgress(40);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("analysis")
        .upload(filePath, fileBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: fileType,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(70);

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("analysis")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          language === "en"
            ? "Failed to retrieve public URL."
            : "No se pudo obtener la URL pública."
        );
      }

      // Convert PDF to base64 for preview and processing
      const pdfBase64 = await fetchPdfAsBase64(publicUrlData.publicUrl);

      // Create a descriptive filename for the database display
      let displayFileName;
      if (isPDF) {
        displayFileName = fileName; // Use our custom filename
      } else {
        displayFileName = `${filePrefix}_combined (${selectedFiles.length} images).pdf`;
      }

      // Insert document metadata into the database
      const { data: documentData, error: documentError } = await supabase
        .from("document_analysis")
        .insert({
          user_id: user.id,
          horse_id: data.horseId,
          horse_name: horseName,
          discipline: data.discipline,
          test_level: data.discipline === "dressage" ? data.testLevel : null,
          competition_type:
            data.discipline === "jumping" ? data.competitionType : null,
          document_date: data.date.toISOString(),
          document_url: publicUrlData.publicUrl,
          file_name: displayFileName,
          file_type: fileType,
          notes: data.notes || null,
          status: "pending",
        })
        .select();

      if (documentError) {
        throw new Error(documentError.message);
      }

      setUploadProgress(90);
      fetchDocs && fetchDocs();

      // Set the base64 image for preview
      setBase64Image(pdfBase64);
      setNewDocumentId(documentData[0].id);
      setShowConfirmModal(true);

      // Reset form and states
      form.reset({
        discipline: userDiscipline as "dressage" | "jumping",
        date: new Date(),
      });
      setSelectedFiles([]);

      // Show full upload bar before hiding
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error: any) {
      console.error("Upload error:", error);

      toast({
        title: language === "en" ? "Upload failed" : "Error al subir",
        description:
          error?.message ||
          (language === "en"
            ? "There was an error uploading your files. Please try again."
            : "Hubo un error al subir tus archivos. Por favor intenta de nuevo."),
        variant: "destructive",
      });

      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoadingProfile) {
    return (
      <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-lg">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-lg">
      <h2 className="text-2xl font-serif font-semibold mb-6">
        {language === "en"
          ? "Upload Document for Analysis"
          : "Subir Documento para Análisis"}
      </h2>

      <div className="mb-6">
        <Label htmlFor="document-upload">
          {language === "en"
            ? "Select Document (PDF, JPG, PNG)"
            : "Seleccionar Documento (PDF, JPG, PNG)"}
        </Label>
        <div
          className={`mt-2 rounded-lg p-4 bg-gradient-to-r ${
            selectedFiles.length > 0
              ? " bg-purple-50"
              : " from-[#7857eb] to-[#3b78e8]"
          }`}
        >
          {selectedFiles.length === 0 ? (
            <div className="text-center">
              <CloudUpload className="mx-auto h-10 w-10 text-white mb-2" />
              <p className="text-sm text-white mb-2">
                {language === "en"
                  ? "Drag and drop your files here, or click to select"
                  : "Arrastra y suelta tus archivos aquí, o haz clic para seleccionar"}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("document-upload")?.click()
                }
                className="mt-2 text-purple-900"
              >
                {language === "en" ? "Browse Files" : "Explorar Archivos"}
              </Button>
              <input
                id="document-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">
                  {language === "en"
                    ? `${selectedFiles.length} files selected`
                    : `${selectedFiles.length} archivos seleccionados`}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center">
                      <File className="h-4 w-4 text-purple-500 mr-2" />
                      <p className="text-xs truncate max-w-[200px]">
                        {file.name}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Discipline Selector - Read Only */}
          <FormField
            control={form.control}
            name="discipline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {language === "en" ? "Discipline" : "Disciplina"}
                </FormLabel>
                <FormControl>
                  <Input
                    value={
                      userDiscipline === "dressage"
                        ? language === "en"
                          ? "Dressage"
                          : "Doma Clásica"
                        : language === "en"
                        ? "Jumping"
                        : "Salto"
                    }
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Test Level (Dressage only) */}
          {userDiscipline === "dressage" && (
            <FormField
              control={form.control}
              name="testLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "en" ? "Test Level" : "Nivel de Prueba"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language === "en"
                              ? "Select test level"
                              : "Seleccionar nivel de prueba"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dressageLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Competition Type (Jumping only) */}
          {userDiscipline === "jumping" && (
            <FormField
              control={form.control}
              name="competitionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "en"
                      ? "Competition Type"
                      : "Tipo de Competición"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language === "en"
                              ? "Select competition type"
                              : "Seleccionar tipo de competición"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jumpingCompetitionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Date Picker */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {language === "en" ? "Test Date" : "Fecha de la Prueba"}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>
                            {language === "en" ? "Pick a date" : "Elegir fecha"}
                          </span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Horse Selector */}
          <FormField
            control={form.control}
            name="horseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === "en" ? "Horse" : "Caballo"}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingHorses}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingHorses
                            ? language === "en"
                              ? "Loading horses..."
                              : "Cargando caballos..."
                            : horses.length === 0
                            ? language === "en"
                              ? "No horses found - Add horses in your profile"
                              : "No se encontraron caballos - Añade caballos en tu perfil"
                            : language === "en"
                            ? "Select a horse"
                            : "Seleccionar un caballo"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {horses.length > 0
                      ? horses.map((horse) => (
                          <SelectItem key={horse.id} value={horse.id}>
                            {horse.name} ({horse.breed}, {horse.age} years)
                          </SelectItem>
                        ))
                      : !isLoadingHorses && (
                          <SelectItem value="no-horses" disabled>
                            {language === "en"
                              ? "No horses available"
                              : "No hay caballos disponibles"}
                          </SelectItem>
                        )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {horses.length === 0 && !isLoadingHorses && (
                  <p className="text-sm text-gray-500 mt-1">
                    {language === "en"
                      ? "Please add horses to your profile first to upload documents for analysis."
                      : "Por favor añade caballos a tu perfil primero para subir documentos para análisis."}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === "en" ? "Notes" : "Notas"}</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full p-2 border rounded-md resize-none h-24"
                    placeholder={
                      language === "en"
                        ? "Add any additional notes about this test or document"
                        : "Añade notas adicionales sobre esta prueba o documento"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-sm text-center text-gray-500">
                {language === "en" ? "Uploading..." : "Subiendo..."}{" "}
                {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className={`w-full bg-gradient-to-r from-[#7857eb] to-[#3b78e8]`}
              disabled={!selectedFiles || isUploading || horses.length === 0}
            >
              {isUploading
                ? language === "en"
                  ? "Uploading..."
                  : "Subiendo..."
                : language === "en"
                ? "Upload Document"
                : "Subir Documento"}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "en"
                ? "Proceed with AI analysis?"
                : "¿Continuar con análisis de IA?"}
            </DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "Your document was uploaded. Would you like to proceed with AI analysis now?"
                : "Tu documento fue subido. ¿Quieres continuar con el análisis de IA ahora?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              {language === "en" ? "Cancel" : "Cancelar"}
            </Button>
            <Button
              onClick={async () => {
                setShowConfirmModal(false);
                setIsShowSpinner(true);
                try {
                  await supabase.functions.invoke("process-document-analysis", {
                    body: {
                      documentId: newDocumentId,
                      base64Image: base64Image,
                    },
                  });

                  // toast({
                  //   title:
                  //     language === "en"
                  //       ? "Document is analyzed successfully"
                  //       : "Documento analizado con éxito",
                  //   description:
                  //     language === "en"
                  //       ? "Go to My Documents to view the analysis."
                  //       : "Vaya a Mis documentos para ver el análisis.",
                  // });

                  navigate(`/analysis?document_id=${newDocumentId}`);

                  fetchDocs();
                  setIsShowSpinner(false);
                } catch (err) {
                  console.warn("Processing failed:", err);
                  setIsShowSpinner(false);
                }
              }}
              className={
                userDiscipline === "dressage"
                  ? "bg-purple-700 hover:bg-purple-800"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {language === "en" ? "Yes, analyze" : "Sí, analizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isShowSpinner && (
        <div className="fixed top-0 right-0 w-screen h-full flex justify-center items-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
    </Card>
  );
};

export default DocumentUpload;
