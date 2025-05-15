
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CalendarIcon, MapPin, Clock, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Event, fetchEvents } from '@/services/eventService';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { getImagePath } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/profile/EventForm';
import { useAuth } from '@/contexts/AuthContext';

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch events from Supabase
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setIsLoading(true);
        
        // Get current date to filter only upcoming events
        const today = new Date().toISOString();
        
        const userId = user?.id;
        if (!userId) {
          setEvents([]);
          setIsLoading(false);
          return;
        }
        
        const eventsData = await fetchEvents(userId);
        
        // Filter to only upcoming events and limit to 3
        const upcomingEvents = eventsData
          .filter(event => new Date(event.eventDate) >= new Date(today))
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 3);
        
        setEvents(upcomingEvents);
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
    
    if (user) {
      fetchUserEvents();
    } else {
      setEvents([]);
      setIsLoading(false);
    }
  }, [toast, language, showAddEventForm, user]);

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
        <Button size="sm" variant="outline" onClick={() => setShowAddEventForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {language === 'en' ? 'Add' : 'Añadir'}
        </Button>
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
            {!user && (
              <p className="text-sm text-gray-500 mt-1">
                {language === 'en' ? 'Sign in to create events' : 'Inicie sesión para crear eventos'}
              </p>
            )}
          </div>
        )}
      </Card>
      
      {/* Add Event Dialog */}
      <Dialog open={showAddEventForm} onOpenChange={setShowAddEventForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === 'en' ? 'Add New Event' : 'Añadir Nuevo Evento'}
            </DialogTitle>
          </DialogHeader>
          <EventForm onComplete={() => setShowAddEventForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingEvents;
