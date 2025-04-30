
import { Card } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';

const UpcomingEvents = () => {
  // Example events - in a real app, these would come from your backend
  const events = [
    {
      id: 1,
      title: 'Regional Dressage Championship',
      date: '2023-06-15',
      location: 'Westchester Equestrian Center',
      type: 'competition'
    },
    {
      id: 2,
      title: 'Training Session with Coach',
      date: '2023-05-22',
      location: 'Home Stable',
      type: 'training'
    },
    {
      id: 3,
      title: 'Local Show',
      date: '2023-07-10',
      location: 'Millbrook Horse Trials',
      type: 'competition'
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-purple-900">
          Upcoming Events
        </h2>
      </div>
      
      <Card className="border border-purple-100 p-4">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start pb-4 border-b border-purple-100 last:border-none last:pb-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                event.type === 'competition' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-purple-900">
                  {event.title}
                </p>
                <p className="text-sm text-purple-700">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {event.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UpcomingEvents;
