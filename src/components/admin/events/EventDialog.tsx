import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Event, createEvent, updateEvent } from '@/services/eventService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import MediaSelector from '@/components/admin/media/MediaSelector';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Update the interface to match what MediaSelector expects
interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  onImageSelect?: (mediaItem: any) => void;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (refreshNeeded: boolean) => void;
  event: Event | null;
}

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventDate: z.date({
    required_error: 'Event date is required',
  }),
  location: z.string().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  discipline: z.enum(['Jumping', 'Dressage', 'Both']),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EventDialog = ({ open, onOpenChange, event }: EventDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: new Date(),
      location: '',
      eventType: 'Competition',
      discipline: 'Both',
      imageUrl: '',
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || '',
        eventDate: new Date(event.eventDate),
        location: event.location || '',
        eventType: event.eventType,
        discipline: event.discipline,
        imageUrl: event.imageUrl || '',
        isFeatured: event.isFeatured || false,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        eventDate: new Date(),
        location: '',
        eventType: 'Competition',
        discipline: 'Both',
        imageUrl: '',
        isFeatured: false,
      });
    }
  }, [event, form]);

  const onSubmit = async (values: EventFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to manage events',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (event?.id) {
        await updateEvent(event.id, {
          ...values,
          eventDate: values.eventDate.toISOString(),
        });
        toast({
          title: 'Event updated',
          description: 'The event has been successfully updated.',
        });
      } else {
        await createEvent({
          title: values.title,
          description: values.description,
          eventDate: values.eventDate.toISOString(),
          location: values.location,
          eventType: values.eventType,
          discipline: values.discipline,
          imageUrl: values.imageUrl,
          isFeatured: values.isFeatured,
          userId: user.id
        });
        toast({
          title: 'Event created',
          description: 'New event has been successfully created.',
        });
      }
      onOpenChange(true); // Close dialog and refresh list
    } catch (error) {
      console.error('Failed to save event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectedMedia = (url: string) => {
    form.setValue('imageUrl', url);
    setShowMediaSelector(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onOpenChange(false)}>
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="py-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Event Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Select date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Event location (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Competition">Competition</SelectItem>
                              <SelectItem value="Clinic">Clinic</SelectItem>
                              <SelectItem value="Training">Training</SelectItem>
                              <SelectItem value="Show">Show</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discipline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discipline</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discipline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Jumping">Jumping</SelectItem>
                              <SelectItem value="Dressage">Dressage</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Event description (optional)" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Image</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input 
                              placeholder="Image URL (optional)"
                              {...field}
                              readOnly
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setShowMediaSelector(true)}
                          >
                            Browse
                          </Button>
                        </div>
                        {field.value && (
                          <div className="mt-2">
                            <img 
                              src={field.value}
                              alt="Event preview"
                              className="h-20 w-auto object-cover rounded-md"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Event</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Featured events will be highlighted on the homepage and events page.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {event ? 'Update Event' : 'Create Event'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {showMediaSelector && (
        <Dialog open={showMediaSelector} onOpenChange={setShowMediaSelector}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Image</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <MediaSelector 
                value={form.getValues('imageUrl') || ''} 
                onChange={handleSelectedMedia}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EventDialog;
