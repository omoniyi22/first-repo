
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createEvent } from '@/services/eventService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface EventFormProps {
  onComplete: () => void;
}

const EventForm = ({ onComplete }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState<'Jumping' | 'Dressage' | 'Both'>('Dressage');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

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
    
    setIsSubmitting(true);
    
    try {
      await createEvent({
        title: eventTitle,
        eventType,
        eventDate: date.toISOString(),
        location,
        description,
        discipline,
        userId: user?.id
      });
      
      toast({
        title: language === 'en' ? 'Event created' : 'Evento creado',
        description: language === 'en' 
          ? 'Your event has been created successfully' 
          : 'Su evento ha sido creado con éxito',
        variant: 'default'
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' 
          ? 'There was an error creating your event' 
          : 'Hubo un error al crear su evento',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      
      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete} disabled={isSubmitting}>
          {language === 'en' ? 'Cancel' : 'Cancelar'}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (language === 'en' ? 'Saving...' : 'Guardando...') 
            : (language === 'en' ? 'Save Event' : 'Guardar Evento')}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
