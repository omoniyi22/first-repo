
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

interface EventFormProps {
  onComplete: () => void;
}

const EventForm = ({ onComplete }: EventFormProps) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [horse, setHorse] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the event data to your backend
    console.log({ eventTitle, eventType, location, horse, date });
    
    // After saving, close the form
    onComplete();
  };

  // Example horses - in a real app, these would come from your backend
  const horses = [
    { id: 1, name: 'Maestro' },
    { id: 2, name: 'Bella' },
    { id: 3, name: 'Gatsby' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-title">Event Title</Label>
        <Input
          id="event-title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="event-type">Event Type</Label>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger id="event-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="competition">Competition</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="event-date">Date</Label>
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
              {date ? format(date, "PPP") : <span>Pick a date</span>}
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
        <Label htmlFor="event-location">Location</Label>
        <Input
          id="event-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="event-horse">Horse</Label>
        <Select value={horse} onValueChange={setHorse}>
          <SelectTrigger id="event-horse">
            <SelectValue placeholder="Select horse" />
          </SelectTrigger>
          <SelectContent>
            {horses.map((horse) => (
              <SelectItem key={horse.id} value={horse.name}>{horse.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
        <Button type="submit">Save Event</Button>
      </div>
    </form>
  );
};

export default EventForm;
