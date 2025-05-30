import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
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
  Video,
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
import { format, set } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { jumpingLevels } from "@/lib/formOptions";

const VideoUploadFormSchema = z.object({
  discipline: z.enum(["dressage", "jumping"]),
  videoType: z.enum(["training", "competition"]),
  date: z.date({
    required_error: "Please select a date",
  }),
  horseId: z.string({
    required_error: "Please select a horse",
  }),
  jumpingLevel: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type VideoUploadFormValues = z.infer<typeof VideoUploadFormSchema>;

interface VideoUploadProps {
  fetchDocs?: () => void;
}

const VideoUpload = ({ fetchDocs }: VideoUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [horses, setHorses] = useState<any[]>([]);
  const [userDiscipline, setUserDiscipline] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isShowSpinner, setIsShowSpinner] = useState<boolean>(false);

  const form = useForm<VideoUploadFormValues>({
    resolver: zodResolver(VideoUploadFormSchema),
    defaultValues: {
      discipline: "dressage",
      videoType: "training",
      date: new Date(),
    },
  });

  const discipline = form.watch("discipline");

  // Function to generate custom filename
  const generateCustomFilename = (
    data: VideoUploadFormValues,
    originalFile: File
  ) => {
    const dateString = format(data.date, "yyyy-MM-dd");
    const fileExtension = originalFile.name.split(".").pop() || "mp4";

    if (data.discipline === "jumping" && data.jumpingLevel) {
      return `${dateString}_${data.jumpingLevel.slice(
        0,
        data.jumpingLevel.indexOf("m ")
      )}.${fileExtension}`;
    } else {
      return `${dateString}.${fileExtension}`;
    }
  };

  // Fetch user profile and horses
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
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
        const { data: horsesData, error: horsesError } = await supabase
          .from("horses")
          .select("id, name, breed, age")
          .eq("user_id", user.id)
          .order("name");

        if (horsesError) {
          console.error("Error fetching horses:", horsesError);
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
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user, language, toast, form]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Check if file is MP4 or MOV
      const fileType = file.type;
      if (fileType === "video/mp4" || fileType === "video/quicktime") {
        setSelectedVideo(file);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
      } else {
        toast({
          title:
            language === "en"
              ? "Invalid file type"
              : "Tipo de archivo no válido",
          description:
            language === "en"
              ? "Please upload an MP4 or MOV video file."
              : "Por favor sube un archivo de video MP4 o MOV.",
          variant: "destructive",
        });
      }
    }
  };

  const removeSelectedVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideo(null);
    setVideoPreviewUrl(null);

    // Reset file input
    const fileInput = document.getElementById(
      "video-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data: VideoUploadFormValues) => {
    if (!selectedVideo || !user) {
      toast({
        title:
          language === "en" ? "Missing information" : "Información faltante",
        description:
          language === "en"
            ? "Please select a video and fill in all required fields."
            : "Por favor selecciona un video y completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Process tags if provided
    let tagArray: string[] = [];
    if (data.tags) {
      tagArray = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }

    try {
      console.log("Starting video upload process");
      setIsShowSpinner(true);
      setUploadProgress(10);

      // Generate unique ID for the video analysis
      const videoAnalysisId = uuidv4();
      console.log("Generated ID:", videoAnalysisId);

      // Generate custom filename based on date and jumping level
      const customFilename = generateCustomFilename(data, selectedVideo);
      console.log("Custom filename:", customFilename);

      // Create storage path with custom filename
      const filePath = `${user.id}/${videoAnalysisId}/${customFilename}`;
      console.log("Storage path:", filePath);

      // Upload video to Supabase Storage with custom filename
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("analysis")
        .upload(filePath, selectedVideo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      console.log("Video uploaded successfully:", uploadData);

      // Get URL for the uploaded video
      const { data: urlData } = supabase.storage
        .from("analysis")
        .getPublicUrl(filePath);

      console.log("Video URL:", urlData.publicUrl);

      const base64VideoFile = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedVideo);
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the `data:<type>;base64,` prefix
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
      });
      setUploadProgress(30);

      // Find the selected horse name
      const selectedHorse = horses.find((h) => h.id === data.horseId);
      const horseName = selectedHorse?.name || "Unknown Horse";

      // Prepare document analysis record data
      const documentData = {
        user_id: user.id,
        horse_id: data.horseId,
        horse_name: horseName,
        discipline: data.discipline,
        video_type: data.videoType,
        document_date: data.date.toISOString(),
        document_url: urlData.publicUrl,
        notes: data.notes,
        status: "pending",
        file_name: customFilename, // Use custom filename instead of original
        file_type: selectedVideo.type,
        test_level: data.jumpingLevel, // Add jumping level if provided
      };

      console.log("Saving document analysis record:", documentData);

      // Add the video analysis record to the database
      const { data: videoAnalysisData, error: dbError } = await supabase
        .from("document_analysis")
        .insert(documentData)
        .select();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(dbError.message);
      }

      console.log("Document analysis record saved successfully");

      // Trigger the analysis function
      try {
        setUploadProgress(70);
        const { error: functionError } = await supabase.functions.invoke(
          "process-video-analysis",
          {
            body: {
              documentId: videoAnalysisData[0].id,
              base64Video: base64VideoFile,
            },
          }
        );

        if (functionError) {
          console.error("Function invocation error:", functionError);
          // Continue anyway as the video is saved
        } else {
          console.log("Analysis function triggered successfully");
        }
      } catch (functionCallError) {
        console.error("Error calling function:", functionCallError);
        // Continue as video is saved
      }
      fetchDocs();
      setUploadProgress(100);

      toast({
        title:
          language === "en"
            ? "Video uploaded successfully"
            : "Video subido con éxito",
        description:
          language === "en"
            ? `Your video "${customFilename}" will be analyzed shortly.`
            : `Tu video "${customFilename}" será analizado en breve.`,
      });

      // Reset form and states
      form.reset({
        discipline: userDiscipline as "dressage" | "jumping",
        videoType: "training",
        date: new Date(),
      });
      removeSelectedVideo();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: language === "en" ? "Upload failed" : "Error al subir",
        description:
          error.message ||
          (language === "en"
            ? "There was an error uploading your video. Please try again."
            : "Hubo un error al subir tu video. Por favor intenta de nuevo."),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsShowSpinner(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
          ? "Upload Video for Analysis"
          : "Subir Video para Análisis"}
      </h2>

      <div className="mb-6">
        <Label htmlFor="video-upload">
          {language === "en"
            ? "Select Video (MP4, MOV)"
            : "Seleccionar Video (MP4, MOV)"}
        </Label>
        <div
          className={`mt-2 border-2 border-dashed rounded-lg p-4 ${
            selectedVideo ? "border-purple-300 bg-purple-50" : "border-gray-300"
          }`}
        >
          {!selectedVideo ? (
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {language === "en"
                  ? "Drag and drop your video here, or click to select"
                  : "Arrastra y suelta tu video aquí, o haz clic para seleccionar"}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("video-upload")?.click()}
                className="mt-2"
              >
                {language === "en" ? "Browse Files" : "Explorar Archivos"}
              </Button>
              <input
                id="video-upload"
                type="file"
                onChange={handleVideoChange}
                accept=".mp4,.mov,video/mp4,video/quicktime"
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Video className="h-8 w-8 text-purple-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">{selectedVideo.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {selectedVideo.type}
                    </p>
                    {/* Show preview of what the filename will be */}
                    <p className="text-xs text-blue-600 mt-1">
                      {language === "en"
                        ? "Will be saved as: "
                        : "Se guardará como: "}
                      <span className="font-medium">
                        {form.watch("date") &&
                        (userDiscipline !== "jumping" ||
                          form.watch("jumpingLevel"))
                          ? generateCustomFilename(
                              form.getValues(),
                              selectedVideo
                            )
                          : language === "en"
                          ? "Complete form to see filename"
                          : "Completa el formulario para ver el nombre"}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeSelectedVideo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {videoPreviewUrl && (
                <div className="mt-2">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-h-64 rounded"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Video Type */}
            <FormField
              control={form.control}
              name="videoType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "en" ? "Video Type" : "Tipo de Video"}
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
                              ? "Select type"
                              : "Seleccionar tipo"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="training">
                        {language === "en" ? "Training" : "Entrenamiento"}
                      </SelectItem>
                      <SelectItem value="competition">
                        {language === "en" ? "Competition" : "Competición"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  disabled={horses.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          horses.length === 0
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
                    {horses.length > 0 ? (
                      horses.map((horse) => (
                        <SelectItem key={horse.id} value={horse.id}>
                          {horse.name} ({horse.breed}, {horse.age} years)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-horses" disabled>
                        {language === "en"
                          ? "No horses available"
                          : "No hay caballos disponibles"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {horses.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {language === "en"
                      ? "Please add horses to your profile first to upload videos for analysis."
                      : "Por favor añade caballos a tu perfil primero para subir videos para análisis."}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Jumping Level - Only show for jumping discipline */}
          {userDiscipline === "jumping" && (
            <FormField
              control={form.control}
              name="jumpingLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "en" ? "Jumping Level" : "Nivel de Salto"}
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
                              ? "Select jumping level"
                              : "Seleccionar nivel de salto"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jumpingLevels.map((level) => (
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

          {/* Date Picker */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {language === "en" ? "Recording Date" : "Fecha de Grabación"}
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

          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {language === "en" ? "Tags" : "Etiquetas"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      language === "en"
                        ? "Enter tags separated by commas"
                        : "Ingresa etiquetas separadas por comas"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
                        ? "Add any additional notes about this video"
                        : "Añade notas adicionales sobre este video"
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
              className={`w-full ${
                discipline === "dressage"
                  ? "bg-purple-700 hover:bg-purple-800"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={!selectedVideo || isUploading || horses.length === 0}
            >
              {isUploading
                ? language === "en"
                  ? "Uploading..."
                  : "Subiendo..."
                : language === "en"
                ? "Upload Video"
                : "Subir Video"}
            </Button>
          </div>
        </form>
      </Form>
      {isShowSpinner && (
        <div className="fixed top-0 right-0 w-screen h-full flex justify-center items-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
    </Card>
  );
};

export default VideoUpload;
