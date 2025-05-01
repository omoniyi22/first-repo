
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar as CalendarIcon, Upload, Video, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const VideoUploadFormSchema = z.object({
  discipline: z.enum(['dressage', 'jumping']),
  videoType: z.enum(['training', 'competition']),
  date: z.date({
    required_error: "Please select a date",
  }),
  horseId: z.string({
    required_error: "Please select a horse",
  }),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type VideoUploadFormValues = z.infer<typeof VideoUploadFormSchema>;

const VideoUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [horses, setHorses] = useState<any[]>([]);
  
  const form = useForm<VideoUploadFormValues>({
    resolver: zodResolver(VideoUploadFormSchema),
    defaultValues: {
      discipline: 'dressage',
      videoType: 'training',
      date: new Date(),
    },
  });
  
  const discipline = form.watch('discipline');

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
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Check if file is MP4 or MOV
      const fileType = file.type;
      if (fileType === 'video/mp4' || fileType === 'video/quicktime') {
        setSelectedVideo(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
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
  
  const removeSelectedVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    
    // Reset file input
    const fileInput = document.getElementById('video-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: VideoUploadFormValues) => {
    if (!selectedVideo || !user) {
      toast({
        title: language === 'en' ? "Missing information" : "Información faltante",
        description: language === 'en' 
          ? "Please select a video and fill in all required fields." 
          : "Por favor selecciona un video y completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Process tags if provided
    let tagArray: string[] = [];
    if (data.tags) {
      tagArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileExt = selectedVideo.name.split('.').pop();
    const fileName = `${user.id}/${data.discipline}/${timestamp}.${fileExt}`;
    const filePath = `videos/${fileName}`;
    
    try {
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('analysis')
        .upload(filePath, selectedVideo, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Simulate upload progress since onUploadProgress doesn't work in current Supabase JS client
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Get the file's public URL
      const { data: fileData } = supabase.storage
        .from('analysis')
        .getPublicUrl(filePath);
        
      // Create metadata record in the database
      const { data: videoData, error: dbError } = await supabase
        .from('video_analysis')
        .insert({
          user_id: user.id,
          horse_id: data.horseId,
          discipline: data.discipline,
          video_type: data.videoType,
          recording_date: data.date.toISOString(),
          video_url: fileData.publicUrl,
          tags: tagArray.length > 0 ? tagArray : null,
          notes: data.notes,
          status: 'pending',
          file_name: selectedVideo.name,
          file_type: selectedVideo.type
        })
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // In a real implementation, we would call a video processing edge function here
      
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
        date: new Date(),
      });
      removeSelectedVideo();
      
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
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-lg">
      <h2 className="text-2xl font-serif font-semibold mb-6">{language === 'en' ? "Upload Video for Analysis" : "Subir Video para Análisis"}</h2>
      
      <div className="mb-6">
        <Label htmlFor="video-upload">{language === 'en' ? "Select Video (MP4, MOV)" : "Seleccionar Video (MP4, MOV)"}</Label>
        <div className={`mt-2 border-2 border-dashed rounded-lg p-4 ${selectedVideo ? 'border-purple-300 bg-purple-50' : 'border-gray-300'}`}>
          {!selectedVideo ? (
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
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
                      {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB • {selectedVideo.type}
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
            {/* Discipline Selector */}
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
                        <SelectValue placeholder={language === 'en' ? "Select type" : "Seleccionar tipo"} />
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
          
          {/* Date Picker */}
          <FormField
            control={form.control}
            name="date"
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
          
          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'en' ? "Tags" : "Etiquetas"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={language === 'en' ? "Enter tags separated by commas" : "Ingresa etiquetas separadas por comas"}
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
                <FormLabel>{language === 'en' ? "Notes" : "Notas"}</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full p-2 border rounded-md resize-none h-24"
                    placeholder={language === 'en' ? "Add any additional notes about this video" : "Añade notas adicionales sobre este video"}
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
              disabled={!selectedVideo || isUploading}
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
