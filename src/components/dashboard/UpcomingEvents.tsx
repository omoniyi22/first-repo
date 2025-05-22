
import { Card } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const UpcomingEvents = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  // Example events - in a real app, these would come from your backend
  const events = [
    {
      id: 1,
      title: language === 'en' ? 'Regional Dressage Championship' : 'Campeonato Regional de Doma',
      date: '2023-06-15',
      location: language === 'en' ? 'Westchester Equestrian Center' : 'Centro Ecuestre Westchester',
      type: 'competition'
    },
    {
      id: 2,
      title: language === 'en' ? 'Training Session with Coach' : 'Sesión de Entrenamiento con Entrenador',
      date: '2023-05-22',
      location: language === 'en' ? 'Home Stable' : 'Establo Local',
      type: 'training'
    },
    {
      id: 3,
      title: language === 'en' ? 'Local Show' : 'Exhibición Local',
      date: '2023-07-10',
      location: language === 'en' ? 'Millbrook Horse Trials' : 'Pruebas Ecuestres de Millbrook',
      type: 'competition'
    },
  ];

  return (
    <div className="mt-4 sm:mt-0">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-purple-900">
          {language === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
        </h2>
      </div>
      
      <Card className="border border-purple-100 p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start pb-3 sm:pb-4 border-b border-purple-100 last:border-none last:pb-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 ${
                event.type === 'competition' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-purple-900">
                  {event.title}
                </p>
                <p className="text-xs sm:text-sm text-purple-700">
                  {new Date(event.date).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
                </p>
                <p className="text-xs sm:text-sm text-purple-600 mt-1">
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
