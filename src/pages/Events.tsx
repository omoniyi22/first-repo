
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';
import { Event, fetchEvents } from '@/services/eventService';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO, getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language, translations } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const disciplineFilter = searchParams.get('discipline') || 'all';
  
  // Get SEO metadata for events page
  const seoMetadata = getPageMetadata('events', {
    title: disciplineFilter !== 'all' 
      ? `${disciplineFilter} Events | AI Equestrian` 
      : undefined,
    description: disciplineFilter !== 'all'
      ? `Explore upcoming ${disciplineFilter.toLowerCase()} events, competitions, and clinics.`
      : undefined
  });
  
  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const eventsData = await fetchEvents();
        console.log('Events loaded:', eventsData);
        
        // Sort events by date, with upcoming events first
        const sortedEvents = [...eventsData].sort((a, b) => 
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
        
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        toast({
          title: "Error occurred",
          description: "Failed to load events. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, [toast]);
  
  // Filter events based on discipline
  useEffect(() => {
    if (events.length === 0) return;
    
    let result = [...events];
    
    // Filter by discipline
    if (disciplineFilter !== 'all') {
      result = result.filter(event => 
        event.discipline.toLowerCase() === disciplineFilter.toLowerCase()
      );
    }
    
    setFilteredEvents(result);
  }, [disciplineFilter, events]);
  
  // Group events by month
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const monthYear = format(new Date(event.eventDate), 'MMMM yyyy');
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  // Get upcoming featured events
  const featuredEvents = filteredEvents.filter(event => 
    event.isFeatured && new Date(event.eventDate) >= new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-700 max-w-3xl">
            Explore competitions, clinics, and training opportunities in the equestrian world.
          </p>
        </div>
        
        {/* Discipline Filter */}
        <div className="mb-10 flex flex-wrap gap-3">
          <Link to="/events">
            <Button 
              variant={disciplineFilter === 'all' ? "default" : "outline"}
              className="rounded-full"
            >
              All Events
            </Button>
          </Link>
          <Link to="/events?discipline=Dressage">
            <Button 
              variant={disciplineFilter === 'dressage' ? "default" : "outline"}
              className="rounded-full bg-purple-100 text-purple-900 hover:bg-purple-200 hover:text-purple-900 border-purple-200"
            >
              Dressage
            </Button>
          </Link>
          <Link to="/events?discipline=Jumping">
            <Button 
              variant={disciplineFilter === 'jumping' ? "default" : "outline"}
              className="rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-800 border-blue-200"
            >
              Show Jumping
            </Button>
          </Link>
          <Link to="/events?discipline=Both">
            <Button 
              variant={disciplineFilter === 'both' ? "default" : "outline"}
              className="rounded-full"
            >
              All Disciplines
            </Button>
          </Link>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        )}
        
        {/* Featured Events */}
        {!isLoading && featuredEvents.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Featured Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <div 
                  key={`featured-${event.id}`} 
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  {event.imageUrl ? (
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Featured
                      </span>
                      <span className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        event.discipline === 'Jumping' ? 'bg-blue-100 text-blue-800' : 
                        event.discipline === 'Dressage' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.discipline}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="flex items-center text-gray-700 mb-3">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {format(new Date(event.eventDate), 'MMMM d, yyyy')}
                    </div>
                    {event.location && (
                      <p className="text-gray-600 mb-4">
                        Location: {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-gray-600 line-clamp-3 mb-4">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Events by Month */}
        {!isLoading && (
          <>
            {filteredEvents.length > 0 ? (
              <div className="space-y-10">
                {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                  <div key={monthYear} className="mb-8">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">{monthYear}</h2>
                    <div className="space-y-4">
                      {monthEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="bg-white rounded-lg shadow-sm p-6 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-md"
                        >
                          <div className="sm:w-1/6 flex flex-col items-center justify-center">
                            <div className="text-center bg-gray-50 rounded-lg p-3 w-full">
                              <span className="block text-sm font-medium text-gray-500">
                                {format(new Date(event.eventDate), 'EEE')}
                              </span>
                              <span className="block text-3xl font-bold text-gray-900">
                                {format(new Date(event.eventDate), 'd')}
                              </span>
                              <span className="block text-sm font-medium text-gray-500">
                                {format(new Date(event.eventDate), 'MMM')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="sm:w-5/6">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                event.eventType === 'Competition' ? 'bg-amber-100 text-amber-800' :
                                event.eventType === 'Clinic' ? 'bg-green-100 text-green-800' :
                                event.eventType === 'Training' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {event.eventType}
                              </span>
                              
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                event.discipline === 'Jumping' ? 'bg-blue-100 text-blue-800' : 
                                event.discipline === 'Dressage' ? 'bg-purple-100 text-purple-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {event.discipline}
                              </span>
                              
                              {event.isFeatured && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                            
                            {event.location && (
                              <p className="text-gray-600 mb-1">
                                <span className="font-medium">Location:</span> {event.location}
                              </p>
                            )}
                            
                            {event.description && (
                              <p className="text-gray-600 mt-2">{event.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {disciplineFilter !== 'all' 
                    ? `There are no upcoming ${disciplineFilter.toLowerCase()} events.` 
                    : "There are no upcoming events at the moment."}
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/events'}>
                  View All Events
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
