
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from './EventForm';

const UpcomingEvents = () => {
  const [showAddEventForm, setShowAddEventForm] = useState(false);

  // Example events - in a real app, these would come from your backend
  const events = [
    {
      id: 1,
      title: 'Regional Dressage Championship',
      date: '2023-06-15',
      location: 'Westchester Equestrian Center',
      horse: 'Maestro',
      type: 'competition'
    },
    {
      id: 2,
      title: 'Training Session with Coach',
      date: '2023-05-22',
      location: 'Home Stable',
      horse: 'Bella',
      type: 'training'
    },
    {
      id: 3,
      title: 'Local Show',
      date: '2023-07-10',
      location: 'Millbrook Horse Trials',
      horse: 'Gatsby',
      type: 'competition'
    },
  ];

  // Calculate days until event
  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      
      <Card className="border border-gray-100 p-4">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start pb-4 border-b border-gray-100 last:border-none last:pb-0">
              <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-3 ${
                event.type === 'competition' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                <CalendarIcon className="h-5 w-5 mb-1" />
                <span className="text-xs font-bold">
                  {getDaysUntil(event.date)}d
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {event.title}
                </p>
                <p className="text-sm text-gray-700">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-600">
                    {event.location}
                  </p>
                  <p className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                    {event.horse}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Add Event Dialog */}
      <Dialog open={showAddEventForm} onOpenChange={setShowAddEventForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Add New Event</DialogTitle>
          </DialogHeader>
          <EventForm onComplete={() => setShowAddEventForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingEvents;
