
import { ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardStats = () => {
  const { language } = useLanguage();
  
  // Example statistics - in a real app, these would come from your backend
  const stats = [
    {
      title: language === 'en' ? 'Average Score' : 'Puntuación Media',
      value: '64.8%',
      change: '+2.4%',
      positive: true,
    },
    {
      title: language === 'en' ? 'Tests Analyzed' : 'Pruebas Analizadas',
      value: '12',
      change: '+3',
      positive: true,
    },
    {
      title: language === 'en' ? 'Strongest Movement' : 'Movimiento Más Fuerte',
      value: language === 'en' ? 'Trot' : 'Trote',
      subValue: language === 'en' ? 'Extended' : 'Extendido',
      change: '',
      positive: true,
    },
    {
      title: language === 'en' ? 'Focus Area' : 'Área de Enfoque',
      value: language === 'en' ? 'Canter' : 'Galope',
      subValue: language === 'en' ? 'Transitions' : 'Transiciones',
      change: '',
      positive: false,
    },
  ];

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-900 mb-3 sm:mb-4">
        {language === 'en' ? 'Performance Overview' : 'Resumen de Rendimiento'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-6 border border-purple-100 hover:border-purple-300 transition-all duration-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              {stat.title}
            </h3>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <p className="text-xl sm:text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs sm:text-sm text-gray-700">
                    {stat.subValue}
                  </p>
                )}
              </div>
              {stat.change && (
                <div className={`px-2 py-1 rounded-full text-xs sm:text-sm ${stat.positive ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'} flex items-center`}>
                  {stat.positive && <ArrowUp className="h-3 w-3 mr-1" />}
                  {stat.change}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
