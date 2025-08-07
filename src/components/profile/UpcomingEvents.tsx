import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPin, Clock, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Event, fetchEvents } from "@/services/eventService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { getImagePath } from "@/utils/imageUtils";
import EventForm from "./EventForm";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const UpcomingEvents = () => {
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

        // Filter to only upcoming events and limit to 4
        const upcomingEvents = eventsData
          .filter((event) => new Date(event.eventDate) >= new Date(today))
          .sort(
            (a, b) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          )
          .slice(0, 4);

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
  }, [toast, showAddEventForm, user.id]);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          Upcoming Events
        </h2>
        <Button size="sm" onClick={() => setShowAddEventForm(true)}>
          <Plus size={16} className="mr-1" />
          Add
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
                              "/public/lovable-uploads/placeholder-image.png"
                            }
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                    )}

                    <h3 className="font-medium text-gray-900 mb-1">
                      {event.title}
                    </h3>

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
            <p className="text-gray-600">No upcoming events</p>
            {!user && (
              <p className="text-sm text-gray-500 mt-1">
                Sign in to create events
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
              Add New Event
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="py-2">
              <EventForm onComplete={() => setShowAddEventForm(false)} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingEvents;
