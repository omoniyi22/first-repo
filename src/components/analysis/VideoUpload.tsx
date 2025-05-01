
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, Upload, Video, X, Play, Pause } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const VideoUploadFormSchema = z.object({
  discipline: z.enum(['dressage', 'jumping']),
  videoType: z.enum(['training', 'competition']),
  horseId: z.string({
    required_error: "Please select a horse",
  }),
  recordingDate: z.date({
    required_error: "Please select a date",
  }),
  tags: z.string().optional(),
  description: z.string().optional(),
});

type VideoUploadFormValues = z.infer<typeof VideoUploadFormSchema>;

const VideoUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [horses, setHorses] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const form = useForm<VideoUploadFormValues>({
    resolver: zodResolver(VideoUploadFormSchema),
    defaultValues: {
      discipline: 'dressage',
      videoType: 'training',
      recordingDate: new Date(),
    },
  });
  
  const discipline = form.watch('discipline');

  useEffect(() => {
    // Clean up preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchHorses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('horses')
          .select('id, name')
          .eq('owner_id', user.id);
        
        if (error) {
          console.error('Error fetching horses:', error);
          return;
        }
        
        setHorses(data || []);
      } catch (error) {
        console.error('Error fetching horses:', error);
      }
    };
    
    fetchHorses();
  }, [user]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Check if file is MP4 or MOV
      const fileType = file.type;
      if (
        fileType === 'video/mp4' || 
        fileType === 'video/quicktime'
      ) {
        setSelectedFile(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: language === 'en' ? "Invalid file type" : "Tipo de archivo no válido",
          description: language === 'en' 
            ? "Please upload an MP4 or MOV video file." 
            : "Por favor sube un archivo de video MP4 o MOV.",
          variant: "destructive"
        });
      }
    }
  };
  
  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsPlaying(false);
    // Reset file input
    const fileInput = document.getElementById('video-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onSubmit = async (data: VideoUploadFormValues) => {
    if (!selectedFile || !user) {
      toast({
        title: language === 'en' ? "Missing information" : "Información faltante",
        description: language === 'en' 
          ? "Please select a video file and fill in all required fields." 
          : "Por favor selecciona un archivo de video y completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}/${data.discipline}/${timestamp}.${fileExt}`;
    const filePath = `videos/${fileName}`;
    
    try {
      // Upload video to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('analysis')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the file's public URL
      const { data: fileData } = supabase.storage
        .from('analysis')
        .getPublicUrl(filePath);
        
      // Process tags into array
      const tagArray = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
        : [];
      
      // Create metadata record in the database
      const { error: dbError } = await supabase
        .from('video_analysis')
        .insert({
          user_id: user.id,
          horse_id: data.horseId,
          discipline: data.discipline,
          video_type: data.videoType,
          recording_date: data.recordingDate.toISOString(),
          video_url: fileData.publicUrl,
          tags: tagArray,
          description: data.description,
          status: 'pending',
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          duration_seconds: videoRef.current ? Math.floor(videoRef.current.duration) : null
        });
      
      if (dbError) {
        throw dbError;
      }
      
      toast({
        title: language === 'en' ? "Video uploaded successfully" : "Video subido con éxito",
        description: language === 'en' 
          ? "Your video will be analyzed shortly." 
          : "Tu video será analizado en breve.",
      });
      
      // Reset form and states
      form.reset({
        discipline: 'dressage',
        videoType: 'training',
        recordingDate: new Date(),
      });
      removeSelectedFile();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: language === 'en' ? "Upload failed" : "Error al subir",
        description: error.message || (language === 'en' 
          ? "There was an error uploading your video. Please try again." 
          : "Hubo un error al subir tu video. Por favor intenta de nuevo."),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-lg">
      <h2 className="text-2xl font-serif font-semibold mb-6">
        {language === 'en' ? "Upload Video for Analysis" : "Subir Video para Análisis"}
      </h2>
      
      {/* Video Preview or Upload Box */}
      <div className="mb-6">
        <Label htmlFor="video-upload">
          {language === 'en' ? "Select Video (MP4, MOV)" : "Seleccionar Video (MP4, MOV)"}
        </Label>
        <div className={`mt-2 border-2 border-dashed rounded-lg p-4 ${previewUrl ? 'border-purple-300 bg-purple-50' : 'border-gray-300'} flex flex-col items-center`}>
          {!previewUrl ? (
            <div className="text-center">
              <Video className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {language === 'en' 
                  ? "Drag and drop your video here, or click to select" 
                  : "Arrastra y suelta tu video aquí, o haz clic para seleccionar"}
              </p>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('video-upload')?.click()}
                className="mt-2"
              >
                {language === 'en' ? "Browse Files" : "Explorar Archivos"}
              </Button>
              <input
                id="video-upload"
                type="file"
                onChange={handleFileChange}
                accept=".mp4,.mov,video/mp4,video/quicktime"
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-400">
                {language === 'en' 
                  ? "Maximum file size: 500MB" 
                  : "Tamaño máximo de archivo: 500MB"}
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                <video 
                  ref={videoRef}
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  controls={false}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="absolute top-0 right-0 m-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeSelectedFile}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={toggleVideoPlayback}
                    className="bg-white/80 hover:bg-white text-black"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isPlaying ? (language === 'en' ? "Pause" : "Pausar") : (language === 'en' ? "Preview" : "Vista previa")}
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>{selectedFile?.name}</p>
                <p>
                  {(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0')} MB
                  {videoRef.current?.duration ? ` • ${Math.floor(videoRef.current.duration / 60)}:${String(Math.floor(videoRef.current.duration % 60)).padStart(2, '0')}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Discipline Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discipline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'en' ? "Discipline" : "Disciplina"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select discipline" : "Seleccionar disciplina"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dressage">{language === 'en' ? "Dressage" : "Doma Clásica"}</SelectItem>
                      <SelectItem value="jumping">{language === 'en' ? "Jumping" : "Salto"}</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>{language === 'en' ? "Video Type" : "Tipo de Video"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select video type" : "Seleccionar tipo de video"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="training">{language === 'en' ? "Training" : "Entrenamiento"}</SelectItem>
                      <SelectItem value="competition">{language === 'en' ? "Competition" : "Competición"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="recordingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{language === 'en' ? "Recording Date" : "Fecha de Grabación"}</FormLabel>
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
                            <span>{language === 'en' ? "Pick a date" : "Elegir fecha"}</span>
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
                  <FormLabel>{language === 'en' ? "Horse" : "Caballo"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select a horse" : "Seleccionar un caballo"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {horses.map((horse) => (
                        <SelectItem key={horse.id} value={horse.id}>{horse.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'en' ? "Tags (comma separated)" : "Etiquetas (separadas por comas)"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={language === 'en' ? "e.g., lesson, competition, test" : "ej., lección, competición, prueba"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'en' ? "Description" : "Descripción"}</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full p-2 border rounded-md resize-none h-24"
                    placeholder={language === 'en' ? "Add a description about this video" : "Añade una descripción sobre este video"}
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
                {language === 'en' ? "Uploading..." : "Subiendo..."} {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className={`w-full ${discipline === 'dressage' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={!selectedFile || isUploading}
            >
              {isUploading 
                ? (language === 'en' ? "Uploading..." : "Subiendo...") 
                : (language === 'en' ? "Upload Video" : "Subir Video")}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default VideoUpload;
