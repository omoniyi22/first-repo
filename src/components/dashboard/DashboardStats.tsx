
import { ArrowUp, TrendingUp, FileText, Award, Star } from 'lucide-react';
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
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      gradient: 'bg-gradient-to-r from-pink-500 to-pink-400',
    },
    {
      title: language === 'en' ? 'Tests Analyzed' : 'Pruebas Analizadas',
      value: '12',
      change: '+3',
      positive: true,
      icon: <FileText className="h-5 w-5 text-white" />,
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-400',
    },
    {
      title: language === 'en' ? 'Strongest Movement' : 'Movimiento Más Fuerte',
      value: language === 'en' ? 'Trot' : 'Trote',
      subValue: language === 'en' ? 'Extended' : 'Extendido',
      change: '',
      positive: true,
      icon: <Award className="h-5 w-5 text-white" />,
      gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    },
    {
      title: language === 'en' ? 'Focus Area' : 'Área de Enfoque',
      value: language === 'en' ? 'Canter' : 'Galope',
      subValue: language === 'en' ? 'Transitions' : 'Transiciones',
      change: '',
      positive: false,
      icon: <Star className="h-5 w-5 text-amber-500" />,
      gradient: 'bg-gradient-to-r from-amber-500 to-amber-400',
    },
  ];

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-900 mb-3 sm:mb-4">
        {language === 'en' ? 'Performance Overview' : 'Resumen de Rendimiento'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${stat.gradient} border-none shadow-md hover:shadow-lg transition-all duration-200`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xs sm:text-sm font-medium text-white">
                  {stat.title}
                </h3>
                {stat.icon}
              </div>
              <div className="mt-3 flex justify-between items-end">
                <div>
                  <p className="text-xl sm:text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  {stat.subValue && (
                    <p className="text-xs sm:text-sm text-white/90">
                      {stat.subValue}
                    </p>
                  )}
                </div>
                {stat.change && (
                  <div className="px-2 py-1 rounded-full text-xs sm:text-sm text-white bg-white/20 flex items-center">
                    {stat.positive && <ArrowUp className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
