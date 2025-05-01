
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const RecentVideos = () => {
  const { language } = useLanguage();
  
  // Example videos - in a real app, these would come from your backend
  const videos = [
    {
      id: 1,
      title: language === 'en' ? 'First Level Test 3' : 'Prueba de Nivel Primero 3',
      date: '2023-04-15',
      thumbnail: '/lovable-uploads/141a866f-fe45-4edc-aa64-b95d2c7f1d6c.png',
      score: '67.2%',
    },
    {
      id: 2,
      title: language === 'en' ? 'Training Level Test 2' : 'Prueba de Nivel de Entrenamiento 2',
      date: '2023-03-22',
      thumbnail: '/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png',
      score: '64.5%',
    },
    {
      id: 3,
      title: language === 'en' ? 'Second Level Test 1' : 'Prueba de Nivel Segundo 1',
      date: '2023-02-10',
      thumbnail: '/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png',
      score: '61.8%',
    },
  ];

  return (
    <div className="mt-6 sm:mt-8 lg:mt-0">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-serif font-semibold text-purple-900">
          {language === 'en' ? 'Recent Tests' : 'Pruebas Recientes'}
        </h2>
        <Button variant="link" className="text-purple-700 text-sm sm:text-base p-0 h-auto">
          {language === 'en' ? 'View All' : 'Ver Todas'}
        </Button>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {videos.map((video) => (
          <Card key={video.id} className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-full sm:w-48 h-32 sm:h-auto relative">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                {video.score}
              </div>
            </div>
            <div className="p-3 sm:p-4 flex-1">
              <h3 className="font-medium text-sm sm:text-base text-purple-900">
                {video.title}
              </h3>
              <p className="text-xs sm:text-sm text-purple-700 mt-1">
                {language === 'en' ? 'Analyzed on ' : 'Analizado el '} 
                {new Date(video.date).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')}
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm text-purple-700 border-purple-200 hover:bg-purple-50 h-8">
                  {language === 'en' ? 'View Analysis' : 'Ver Análisis'}
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm text-purple-700 border-purple-200 hover:bg-purple-50 h-8">
                  {language === 'en' ? 'Recommendations' : 'Recomendaciones'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentVideos;
