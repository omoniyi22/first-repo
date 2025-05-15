
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Event, createEvent, updateEvent } from '@/services/eventService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MediaSelector from '@/components/admin/media/MediaSelector';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventFormProps {
  onComplete: () => void;
  event?: Event | null;
}

const EventForm = ({ onComplete, event }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventTitle, setEventTitle] = useState(event?.title || '');
  const [eventType, setEventType] = useState(event?.eventType || '');
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [discipline, setDiscipline] = useState<'Jumping' | 'Dressage' | 'Both'>(event?.discipline as 'Jumping' | 'Dressage' | 'Both' || 'Dressage');
  const [date, setDate] = useState<Date | undefined>(event?.eventDate ? new Date(event.eventDate) : undefined);
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || '');
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const isEditMode = !!event?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventTitle || !eventType || !date) {
      toast({
        title: language === 'en' ? 'Missing fields' : 'Campos faltantes',
        description: language === 'en' 
          ? 'Please fill in all required fields' 
          : 'Por favor complete todos los campos requeridos',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: language === 'en' ? 'Authentication required' : 'Autenticación requerida',
        description: language === 'en' 
          ? 'Please sign in to create events' 
          : 'Por favor inicie sesión para crear eventos',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventData = {
        title: eventTitle,
        eventType,
        eventDate: date.toISOString(),
        location,
        description,
        discipline,
        imageUrl,
        userId: user.id
      };

      if (isEditMode && event?.id) {
        await updateEvent(event.id, eventData);
        toast({
          title: language === 'en' ? 'Event updated' : 'Evento actualizado',
          description: language === 'en' 
            ? 'Your event has been updated successfully' 
            : 'Su evento ha sido actualizado con éxito',
          variant: 'default'
        });
      } else {
        await createEvent(eventData);
        toast({
          title: language === 'en' ? 'Event created' : 'Evento creado',
          description: language === 'en' 
            ? 'Your event has been created successfully' 
            : 'Su evento ha sido creado con éxito',
          variant: 'default'
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' 
          ? `There was an error ${isEditMode ? 'updating' : 'creating'} your event` 
          : `Hubo un error al ${isEditMode ? 'actualizar' : 'crear'} su evento`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectedMedia = (url: string) => {
    setImageUrl(url);
    setShowMediaSelector(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-title">
            {language === 'en' ? 'Event Title' : 'Título del Evento'} *
          </Label>
          <Input
            id="event-title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder={language === 'en' ? 'Enter event title' : 'Ingrese el título del evento'}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-type">
            {language === 'en' ? 'Event Type' : 'Tipo de Evento'} *
          </Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="event-type">
              <SelectValue placeholder={language === 'en' ? 'Select type' : 'Seleccionar tipo'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Competition">{language === 'en' ? 'Competition' : 'Competición'}</SelectItem>
              <SelectItem value="Training">{language === 'en' ? 'Training' : 'Entrenamiento'}</SelectItem>
              <SelectItem value="Clinic">{language === 'en' ? 'Clinic' : 'Clínica'}</SelectItem>
              <SelectItem value="Other">{language === 'en' ? 'Other' : 'Otro'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-date">
            {language === 'en' ? 'Date' : 'Fecha'} *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : 
                  <span>{language === 'en' ? 'Pick a date' : 'Elegir una fecha'}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="discipline">
            {language === 'en' ? 'Discipline' : 'Disciplina'} *
          </Label>
          <Select value={discipline} onValueChange={(value: 'Jumping' | 'Dressage' | 'Both') => setDiscipline(value)}>
            <SelectTrigger id="discipline">
              <SelectValue placeholder={language === 'en' ? 'Select discipline' : 'Seleccionar disciplina'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jumping">{language === 'en' ? 'Jumping' : 'Salto'}</SelectItem>
              <SelectItem value="Dressage">{language === 'en' ? 'Dressage' : 'Doma'}</SelectItem>
              <SelectItem value="Both">{language === 'en' ? 'Both' : 'Ambos'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-location">
            {language === 'en' ? 'Location' : 'Ubicación'}
          </Label>
          <Input
            id="event-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={language === 'en' ? 'Enter location' : 'Ingrese la ubicación'}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event-description">
            {language === 'en' ? 'Description' : 'Descripción'}
          </Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={language === 'en' ? 'Enter event description' : 'Ingrese la descripción del evento'}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-image">
            {language === 'en' ? 'Event Image' : 'Imagen del Evento'}
          </Label>
          <div className="flex items-center gap-2">
            <Input 
              id="event-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={language === 'en' ? 'Image URL' : 'URL de la imagen'}
              readOnly
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowMediaSelector(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Browse' : 'Explorar'}
            </Button>
          </div>
          {imageUrl && (
            <div className="mt-2 border rounded-md overflow-hidden">
              <AspectRatio ratio={16/9}>
                <img 
                  src={imageUrl}
                  alt={eventTitle || 'Event preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </AspectRatio>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={onComplete} disabled={isSubmitting}>
            {language === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (language === 'en' ? 'Saving...' : 'Guardando...') 
              : (language === 'en' 
                  ? (isEditMode ? 'Update Event' : 'Save Event') 
                  : (isEditMode ? 'Actualizar Evento' : 'Guardar Evento'))}
          </Button>
        </div>
      </form>

      {showMediaSelector && (
        <Dialog open={showMediaSelector} onOpenChange={setShowMediaSelector}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Select Image' : 'Seleccionar Imagen'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] overflow-auto">
              <MediaSelector 
                value={imageUrl} 
                onChange={handleSelectedMedia}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EventForm;
