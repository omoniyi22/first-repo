
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Calendar as CalendarIcon, Upload, File, X, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { dressageLevels } from '@/lib/formOptions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchPdfAsBase64 } from '@/utils/pdfUtils';
import { imageToBase64PDF } from '@/utils/img2pdf';

const DocumentUploadFormSchema = z.object({
  discipline: z.enum(['dressage', 'jumping']),
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
  'Show Jumping',
  'Derby',
  'Grand Prix',
  'Power & Speed',
  'Table A',
  'Table C',
  'Training Round'
];

// Mock horses data for development
const mockHorses = [
  { id: 'horse1', name: 'Thunder' },
  { id: 'horse2', name: 'Whisper' },
  { id: 'horse3', name: 'Storm' }
];

interface DocumentUploadProps {
  fetchDocs?: () => void;
}
const DocumentUpload = ({fetchDocs}: DocumentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [horses, setHorses] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newDocumentId, setNewDocumentId] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<any>('');
  const [isShowSpinner, setIsShowSpinner] = useState<boolean>(false);
  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(DocumentUploadFormSchema),
    defaultValues: {
      discipline: 'dressage',
      date: new Date(),
    },
  });
  
  const discipline = form.watch('discipline');

  useEffect(() => {
    // Reset form fields when discipline changes
    if (discipline === 'dressage') {
      form.setValue('competitionType', undefined);
    } else {
      form.setValue('testLevel', undefined);
    }
  }, [discipline, form]);

  useEffect(() => {
    const fetchHorses = async () => {
      if (!user) return;
      
      try {
        // Use mock data instead of Supabase query
        setHorses(mockHorses);
      } catch (error) {
        console.error('Error fetching horses:', error);
      }
    };
    
    fetchHorses();
  }, [user]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Check if file is PDF, JPG, or PNG
      const fileType = file.type;
      if (
        fileType === 'application/pdf' || 
        fileType === 'image/jpeg' || 
        fileType === 'image/png' ||
        fileType === 'image/webp'
      ) {
        setSelectedFile(file);
      } else {
        toast({
          title: language === 'en' ? "Invalid file type" : "Tipo de archivo no válido",
          description: language === 'en' 
            ? "Please upload a PDF, JPG, Webp or PNG file." 
            : "Por favor sube un archivo PDF, JPG, Webp o PNG.",
          variant: "destructive"
        });
      }
    }
  };
  
  const removeSelectedFile = () => {
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('document-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: DocumentUploadFormValues) => {
    if (!selectedFile || !user) {
      toast({
        title: language === 'en' ? "Missing information" : "Información faltante",
        description: language === 'en' 
          ? "Please select a file and fill in all required fields." 
          : "Por favor selecciona un archivo y completa todos los campos requeridos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Find the selected horse name
      const selectedHorse = horses.find(h => h.id === data.horseId);
      const horseName = selectedHorse?.name || 'Unknown Horse';
      
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '-')}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Simulate progress
      setUploadProgress(30);
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('analysis')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      console.log(supabase.storage.from('analysis'));
      console.log("I called",uploadError);
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      setUploadProgress(60);
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('analysis')
        .getPublicUrl(filePath);
      // Insert document metadata into the database
      const { data: documentData, error: documentError } = await supabase
        .from('document_analysis')
        .insert({
          user_id: user.id,
          horse_id: data.horseId,
          horse_name: horseName,
          discipline: data.discipline,
          test_level: data.discipline === 'dressage' ? data.testLevel : null,
          competition_type: data.discipline === 'jumping' ? data.competitionType : null,
          document_date: data.date.toISOString(),
          document_url: publicUrlData.publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          notes: data.notes || null,
          status: 'pending'
        })
        .select();
      
      if (documentError) {
        throw new Error(documentError.message);
      }
      // toast({
      //   title: language === 'en' ? "Document uploaded successfully" : "Documento subido con éxito",
      //   description: language === 'en' 
      //     ? "Your document will be analyzed shortly." 
      //     : "Tu documento será analizado en breve.",
      // });

      setUploadProgress(100);
      fetchDocs();
      
      const canvasImage = publicUrlData.publicUrl.includes('.pdf')
        ? await fetchPdfAsBase64(publicUrlData.publicUrl)
        : await imageToBase64PDF(publicUrlData.publicUrl);
      console.log("pdfbase64", canvasImage);
      setBase64Image(canvasImage);
      setNewDocumentId(documentData[0].id);
      setShowConfirmModal(true);
      
      // Reset form and states
      form.reset({
        discipline: 'dressage',
        date: new Date(),
      });
      setSelectedFile(null);
      
      // Set uploading to false after a short delay to show 100% state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: language === 'en' ? "Upload failed" : "Error al subir",
        description: error.message || (language === 'en' 
          ? "There was an error uploading your document. Please try again." 
          : "Hubo un error al subir tu documento. Por favor intenta de nuevo."),
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-lg">
      <h2 className="text-2xl font-serif font-semibold mb-6">{language === 'en' ? "Upload Document for Analysis" : "Subir Documento para Análisis"}</h2>
      
      <div className="mb-6">
        <Label htmlFor="document-upload">{language === 'en' ? "Select Document (PDF, JPG, PNG)" : "Seleccionar Documento (PDF, JPG, PNG)"}</Label>
        <div className={`mt-2 border-2 border-dashed rounded-lg p-4 ${selectedFile ? 'border-purple-300 bg-purple-50' : 'border-gray-300'}`}>
          {!selectedFile ? (
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {language === 'en' 
                  ? "Drag and drop your file here, or click to select" 
                  : "Arrastra y suelta tu archivo aquí, o haz clic para seleccionar"}
              </p>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('document-upload')?.click()}
                className="mt-2"
              >
                {language === 'en' ? "Browse Files" : "Explorar Archivos"}
              </Button>
              <input
                id="document-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="h-8 w-8 text-purple-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={removeSelectedFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          
          {/* Test Level (Dressage only) */}
          {discipline === 'dressage' && (
            <FormField
              control={form.control}
              name="testLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'en' ? "Test Level" : "Nivel de Prueba"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select test level" : "Seleccionar nivel de prueba"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dressageLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Competition Type (Jumping only) */}
          {discipline === 'jumping' && (
            <FormField
              control={form.control}
              name="competitionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'en' ? "Competition Type" : "Tipo de Competición"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? "Select competition type" : "Seleccionar tipo de competición"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jumpingCompetitionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
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
                <FormLabel>{language === 'en' ? "Test Date" : "Fecha de la Prueba"}</FormLabel>
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
                    placeholder={language === 'en' ? "Add any additional notes about this test or document" : "Añade notas adicionales sobre esta prueba o documento"}
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
                : (language === 'en' ? "Upload Document" : "Subir Documento")}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Proceed with AI analysis?' : '¿Continuar con análisis de IA?'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en'
                ? 'Your document was uploaded. Would you like to proceed with AI analysis now?'
                : 'Tu documento fue subido. ¿Quieres continuar con el análisis de IA ahora?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button
              onClick={async () => {
                setShowConfirmModal(false);
                setIsShowSpinner(true);
                try {
                  await supabase.functions.invoke('process-document-analysis', {
                    body: { documentId: newDocumentId, base64Image: base64Image },
                  });

                  toast({
                    title:
                      language === 'en'
                        ? 'Document is analyzed successfully'
                        : 'Documento analizado con éxito',
                    description:
                      language === 'en'
                        ? 'Your document is being analyzed.'
                        : 'Tu documento está siendo analizado.',
                  });
                  fetchDocs();
                  setIsShowSpinner(false);
                } catch (err) {
                  console.warn('Processing failed:', err);
                  setIsShowSpinner(false);
                }
              }}
              className={discipline === 'dressage' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {language === 'en' ? 'Yes, analyze' : 'Sí, analizar'}
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
