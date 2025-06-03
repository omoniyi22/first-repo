
import { Card } from '@/components/ui/card';
import { CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { Event, fetchEvents, deleteEvent } from '@/services/eventService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import EventForm from '@/components/profile/EventForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UpcomingEvents = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setIsLoading(true);
        
        const today = new Date().toISOString();
        
        const userId = user?.id;
        if (!userId) {
          setEvents([]);
          setIsLoading(false);
          return;
        }
        
        const eventsData = await fetchEvents(userId);
        
        // Filter to only upcoming events and limit to 4
        const upcomingEvents = eventsData
          .filter(event => new Date(event.eventDate) >= new Date(today))
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 4);
        
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        toast({
          title: language === 'en' ? "Error loading events" : "Error al cargar eventos",
          description: language === 'en' ? "Please try again later" : "Por favor intente más tarde",
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
  }, [toast, user, language]);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEventId) return;

    setIsDeleting(true);
    try {
      await deleteEvent(deleteEventId);
      toast({
        title: language === 'en' ? 'Event deleted' : 'Evento eliminado',
        description: language === 'en' ? 'The event has been successfully deleted.' : 'El evento ha sido eliminado exitosamente.',
      });
      
      // Refresh events list
      const userId = user?.id;
      if (userId) {
        const eventsData = await fetchEvents(userId);
        const today = new Date().toISOString();
        const upcomingEvents = eventsData
          .filter(event => new Date(event.eventDate) >= new Date(today))
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 4);
        setEvents(upcomingEvents);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Error',
        description: language === 'en' ? 'Failed to delete event. Please try again.' : 'Error al eliminar evento. Por favor intente nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteEventId(null);
    }
  };

  const handleEditComplete = async () => {
    setShowEditDialog(false);
    setEditingEvent(null);
    
    // Refresh events list
    const userId = user?.id;
    if (userId) {
      const eventsData = await fetchEvents(userId);
      const today = new Date().toISOString();
      const upcomingEvents = eventsData
        .filter(event => new Date(event.eventDate) >= new Date(today))
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 4);
      setEvents(upcomingEvents);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4 sm:mt-0">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-serif font-semibold text-purple-900">
            {language === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
          </h2>
        </div>
        
        <Card className="border border-purple-100 p-3 sm:p-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-0">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-purple-900">
          {language === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
        </h2>
      </div>
      
      <Card className="border border-purple-100 p-3 sm:p-4">
        {events.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start pb-3 sm:pb-4 border-b border-purple-100 last:border-none last:pb-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 ${
                  event.discipline === 'Jumping' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base text-purple-900">
                    {event.title}
                  </p>
                  <p className="text-xs sm:text-sm text-purple-700">
                    {new Date(event.eventDate).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
                  </p>
                  <p className="text-xs sm:text-sm text-purple-600 mt-1">
                    {event.location}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteEventId(event.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                {language === 'en' ? 'Sign in to create events' : 'Inicia sesión para crear eventos'}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === 'en' ? 'Edit Event' : 'Editar Evento'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="py-2">
              <EventForm 
                onComplete={handleEditComplete} 
                event={editingEvent}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'en' ? 'Are you absolutely sure?' : '¿Estás completamente seguro?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'en' 
                ? 'This action cannot be undone. This will permanently delete the event.'
                : 'Esta acción no se puede deshacer. Esto eliminará permanentemente el evento.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {language === 'en' ? 'Cancel' : 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting 
                ? (language === 'en' ? "Deleting..." : "Eliminando...") 
                : (language === 'en' ? "Delete" : "Eliminar")
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UpcomingEvents;
