
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Event } from '@/services/eventService';

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
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES');
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

  return (
    <div className="mt-4 sm:mt-0">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-900">
          {language === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
        </h2>
      </div>
      
      <Card className="border border-purple-100 p-3 sm:p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start pb-3 sm:pb-4 border-b border-purple-100 last:border-none last:pb-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 ${
                  getEventTypeStyle(event.eventType, event.discipline)
                }`}>
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm sm:text-base text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {formatEventDate(event.eventDate)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {event.location}
                  </p>
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
