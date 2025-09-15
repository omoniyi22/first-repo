import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Event, fetchEvents, deleteEvent } from "@/services/eventService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { getImagePath } from "@/utils/imageUtils";
import EventForm from "./EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const UpcomingEvents = () => {
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showEditEventForm, setShowEditEventForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();

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

        // Filter to only upcoming events and limit to 4
        const upcomingEvents = eventsData
          .filter((event) => new Date(event.eventDate) >= new Date(today))
          .sort(
            (a, b) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          )
          .slice(0, 5);

        setEvents(upcomingEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
        toast({
          title: "Error loading events",
          description: "Please try again later",
          variant: "destructive",
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
  }, [toast, showAddEventForm, showEditEventForm, user.id]);

  // Format date based on language
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEE, MMM d, yyyy");
  };

  // Format time based on language
  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "h:mm a");
  };

  // Calculate days until event
  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get event type style
  const getEventTypeStyle = (eventType: string, discipline: string) => {
    if (discipline === "Dressage") {
      return "bg-purple-100 text-purple-700";
    } else if (discipline === "Jumping") {
      return "bg-blue-100 text-blue-700";
    } else {
      return "bg-gray-100 text-gray-700";
    }
  };

  // Get default image based on discipline
  const getDefaultImage = (discipline: string) => {
    if (discipline === "Dressage") {
      return "/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png";
    } else if (discipline === "Jumping") {
      return "/lovable-uploads/dbb9802b-bed7-4888-96a3-73b68198710b.png";
    } else {
      return "/lovable-uploads/4c938b42-7713-4f2d-947a-1e70c3caca32.png";
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEditEventForm(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    setIsDeleting(true);
    try {
      await deleteEvent(selectedEvent.id);
      toast({
        title: "Event deleted",
        description: "Your event has been deleted successfully",
        variant: "default",
      });

      // Refresh events list
      const userId = user?.id;
      if (userId) {
        const today = new Date().toISOString();
        const eventsData = await fetchEvents(userId);
        const upcomingEvents = eventsData
          .filter((event) => new Date(event.eventDate) >= new Date(today))
          .sort(
            (a, b) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          )
          .slice(0, 4);
        setEvents(upcomingEvents);
      }

      setShowDeleteDialog(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "There was an error deleting your event",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormComplete = () => {
    setShowAddEventForm(false);
    setShowEditEventForm(false);
    setSelectedEvent(null);
  };

  // Add this function inside your UpcomingEvents component
  const handleCompleteEvent = async (event: Event) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to complete events",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/complete-horse-event`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: supabase.supabaseKey,
          },
          body: JSON.stringify({
            event_id: event.id,
            completed_by: user.id,
            actual_completion_date: new Date().toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: language === "en" ? "Event Completed!" : "¡Evento Completado!",
          description:
            language === "en"
              ? `${event.title} completed. Next appointment scheduled for ${result.data.next_due_date}.`
              : `${event.title} completado. Próxima cita programada para ${result.data.next_due_date}.`,
        });

        // Refresh events list
        const userId = user?.id;
        if (userId) {
          const today = new Date().toISOString();
          const eventsData = await fetchEvents(userId);
          const upcomingEvents = eventsData
            .filter((event) => new Date(event.eventDate) >= new Date(today))
            .sort(
              (a, b) =>
                new Date(a.eventDate).getTime() -
                new Date(b.eventDate).getTime()
            )
            .slice(0, 4);
          setEvents(upcomingEvents);
        }
      } else {
        toast({
          title: language === "en" ? "Error" : "Error",
          description: result.error || "Failed to complete event",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing event:", error);
      toast({
        title: language === "en" ? "Error" : "Error",
        description:
          language === "en"
            ? "Failed to complete event"
            : "Error al completar evento",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          {language === "en" ? "Upcoming Events" : "Próximos eventos"}
        </h2>
        <Button size="sm" onClick={() => setShowAddEventForm(true)}>
          <Plus size={16} className="mr-1" />
          {language === "en" ? "Add" : "Agregar"}
        </Button>
      </div>

      <Card className="border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="p-4">
                <div className="flex items-start">
                  <div
                    className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-3 ${
                      event.discipline === "Jumping"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    <CalendarIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-bold">
                      {getDaysUntil(event.eventDate)}d
                    </span>
                  </div>

                  <div className="flex-1">
                    {event.imageUrl && (
                      <div className="mb-2">
                        <AspectRatio
                          ratio={16 / 9}
                          className="overflow-hidden rounded-md"
                        >
                          <img
                            src={
                              getImagePath(event.imageUrl) ||
                              "/lovable-uploads/fc2e6814-c8fd-4b8e-934f-1b2204e75264.png"
                            }
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 flex-1">
                        {event.title}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditEvent(event)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* NEW: Add complete button for recurring events */}
                        {event.is_recurring && !event.is_completed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCompleteEvent(event)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title={
                              language === "en"
                                ? "Mark Complete"
                                : "Marcar Completo"
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          getEventTypeStyle(event.eventType, event.discipline)
                        )}
                      >
                        {event.eventType}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      <span>
                        {formatEventDate(event.eventDate)} •{" "}
                        {formatEventTime(event.eventDate)}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {event.description}
                      </p>
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
              {language === "en"
                ? "No upcoming events"
                : "No hay eventos próximos"}
            </p>
            {!user && (
              <p className="text-sm text-gray-500 mt-1">
                {language === "en"
                  ? "Sign in to create events"
                  : "Inicia sesión para crear eventos"}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={showAddEventForm} onOpenChange={setShowAddEventForm}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "en" ? "Add New Event" : "Agregar nuevo evento"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="py-2">
              <EventForm onComplete={handleFormComplete} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditEventForm} onOpenChange={setShowEditEventForm}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "en" ? "" : ""}
              Edit Event
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="py-2">
              <EventForm
                onComplete={handleFormComplete}
                event={selectedEvent}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UpcomingEvents;
