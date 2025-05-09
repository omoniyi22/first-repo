
import { useState } from 'react';
import { CalendarIcon, Edit, Trash2, Star, StarOff } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event, deleteEvent, updateEvent } from '@/services/eventService';
import { useToast } from '@/hooks/use-toast';
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
import { getImagePath } from '@/utils/imageUtils';

interface EventsListProps {
  events: Event[];
  isLoading: boolean;
  onEditEvent: (event: Event) => void;
  onEventDeleted: () => void;
}

const EventsList = ({ events, isLoading, onEditEvent, onEventDeleted }: EventsListProps) => {
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    if (!deleteEventId) return;

    setIsDeleting(true);
    try {
      await deleteEvent(deleteEventId);
      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted.',
      });
      onEventDeleted();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteEventId(null);
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    if (!event.id) return;
    setIsTogglingFeatured(event.id);

    try {
      await updateEvent(event.id, {
        isFeatured: !event.isFeatured,
      });
      toast({
        title: 'Event updated',
        description: `Event has been ${event.isFeatured ? 'removed from' : 'marked as'} featured.`,
      });
      onEventDeleted(); // Refresh the list
    } catch (error) {
      console.error('Failed to update event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingFeatured(null);
    }
  };

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Jumping':
        return 'bg-blue-100 text-blue-800';
      case 'Dressage':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'competition':
        return 'bg-amber-100 text-amber-800';
      case 'clinic':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discipline</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No events found. Create your first event to get started.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {event.imageUrl && (
                        <img 
                          src={getImagePath(event.imageUrl)} 
                          alt={event.title}
                          className="h-10 w-10 rounded-md object-cover mr-3"
                        />
                      )}
                      <div>
                        <p className="font-medium">{event.title}</p>
                        {event.isFeatured && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {format(new Date(event.eventDate), 'PPP')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEventTypeColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDisciplineColor(event.discipline)}>
                      {event.discipline}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.location || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(event)}
                        disabled={!!isTogglingFeatured}
                      >
                        {event.isFeatured ? (
                          <StarOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteEventId(event.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventsList;
