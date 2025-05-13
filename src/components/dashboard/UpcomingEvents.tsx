
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CalendarIcon, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Event } from '@/services/eventService';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { getImagePath } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Get current date to filter only upcoming events
        const today = new Date().toISOString();
        
        // Fetch the next 3 upcoming events ordered by date
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .limit(3);
          
        if (error) {
          console.error('Error fetching events:', error);
          throw error;
        }
        
        // Transform the data to match the Event type and validate discipline
        const transformedEvents: Event[] = data.map(event => {
          // Ensure discipline is one of the allowed values
          let validDiscipline: 'Jumping' | 'Dressage' | 'Both' = 'Both';
          if (event.discipline === 'Jumping' || event.discipline === 'Dressage') {
            validDiscipline = event.discipline as 'Jumping' | 'Dressage';
          }
          
          return {
            id: event.id,
            title: event.title,
            eventDate: event.event_date,
            location: event.location || '',
            eventType: event.event_type,
            discipline: validDiscipline,
            description: event.description || '',
            isFeatured: event.is_featured || false,
            imageUrl: event.image_url || '',
          };
        });
        
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        toast({
          title: language === 'en' ? "Error loading events" : "Error al cargar eventos",
          description: language === 'en' 
            ? "Please try again later" 
            : "Por favor intente más tarde",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast, language]);

  // Format date based on language
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEE, MMM d, yyyy');
  };
  
  // Format time based on language
  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };
  
  // Get event type style
  const getEventTypeStyle = (eventType: string, discipline: string) => {
    if (discipline === 'Dressage') {
      return 'bg-purple-100 text-purple-700';
    } else if (discipline === 'Jumping') {
      return 'bg-blue-100 text-blue-700';
    } else {
      return 'bg-gray-100 text-gray-700';
    }
  };

  // Get default image based on discipline
  const getDefaultImage = (discipline: string) => {
    if (discipline === 'Dressage') {
      return '/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png';
    } else if (discipline === 'Jumping') {
      return '/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png';
    } else {
      return '/lovable-uploads/4c938b42-7713-4f2d-947a-1e70c3caca32.png';
    }
  };

  return (
    <div className="mt-4 sm:mt-0">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-900">
          {language === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
        </h2>
      </div>
      
      <Card className="border border-purple-100">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        ) : events.length > 0 ? (
          <div>
            {events.map((event) => (
              <div key={event.id} className="border-b last:border-b-0 border-purple-100">
                <div className="p-4">
                  {event.imageUrl || getDefaultImage(event.discipline) ? (
                    <div className="mb-3">
                      <AspectRatio ratio={16/9} className="overflow-hidden rounded-md">
                        <img 
                          src={event.imageUrl ? getImagePath(event.imageUrl) : getDefaultImage(event.discipline)} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                  ) : null}
                  
                  <div>
                    <h3 className="font-medium text-base sm:text-lg text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", getEventTypeStyle(event.eventType, event.discipline))}>
                        {event.eventType}
                      </span>
                      
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", 
                        event.discipline === 'Dressage' ? 'bg-purple-100 text-purple-700' : 
                        event.discipline === 'Jumping' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700')}>
                        {event.discipline}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{formatEventDate(event.eventDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{formatEventTime(event.eventDate)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <CalendarIcon className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-600">
              {language === 'en' ? 'No upcoming events' : 'No hay eventos próximos'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UpcomingEvents;
