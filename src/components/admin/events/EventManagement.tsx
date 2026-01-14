
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Event, fetchEvents } from '@/services/eventService';
import EventsList from '@/components/admin/events/EventsList';
import EventDialog from '@/components/admin/events/EventDialog';

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const eventsData = await fetchEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = () => {
    setCurrentEvent(null);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (refreshNeeded: boolean) => {
    setIsDialogOpen(false);
    if (refreshNeeded) {
      loadEvents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-500">Create and manage events for your equestrian calendar</p>
        </div>
        <Button onClick={handleAddEvent}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <EventsList
        events={events}
        isLoading={isLoading}
        onEditEvent={handleEditEvent}
        onEventDeleted={loadEvents}
      />

      <EventDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        event={currentEvent}
      />
    </div>
  );
};

export default EventManagement;
