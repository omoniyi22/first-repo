
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardStats = () => {
  const [stats, setStats] = useState<any>({});
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const statsTitle = [
    {
      key: 'average_score',
      title: language === 'en' ? 'Average Score' : 'Puntuación Media',
    },
    {
      key: 'analyzed_test',
      title: language === 'en' ? 'Tests Analyzed' : 'Pruebas Analizadas',
    },
    {
      key: 'strongest_movement',
      title: language === 'en' ? 'Strongest Movement' : 'Movimiento Más Fuerte',
    },
    {
      key: 'focus_area',
      title: language === 'en' ? 'Focus Area' : 'Área de Enfoque',
    },
  ];

  const statss = [
    {
      title: language === 'en' ? 'Average Score' : 'Puntuación Media',
      value: '64.8%',
      change: '+2.4%',
      positive: false,
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
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        
        // Fetch document analysis count
        const { data: completedDocs, error: docError } = await supabase
          .from('document_analysis')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (docError) {
          console.error('Error fetching completed documents:', docError.message);
        }
        
        if (completedDocs && completedDocs.length > 0) {
          const completedDocIds = completedDocs.map(doc => doc.id);

          const { data: analysisResults, error: resultError } = await supabase
            .from('analysis_results')
            .select('*')
            .in('document_id', completedDocIds);

          if (resultError) {
            console.error('Error fetching analysis results:', resultError.message);
          } else {
            if (analysisResults && analysisResults.length > 0) {
              // Calculate average score
              const scores = analysisResults.map(r => r.result_json['percentage']).filter(s => typeof s === 'number');
              const totalScore = scores.reduce((acc, score) => acc + score, 0);
              const averageScore = scores.length > 0 ? (totalScore / scores.length) : 0;

              // Sort documents by document date descending
              const { data: completedDocsWithDates } = await supabase
                .from('document_analysis')
                .select('id, document_date')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .order('document_date', { ascending: false });

              let lastScore = null;
              let latestDocId = null;
              let latestAnalysis = null;
              if (completedDocsWithDates?.length) {
                latestDocId = completedDocsWithDates[0].id;
                latestAnalysis = analysisResults.find(r => r.document_id === latestDocId);
                lastScore = latestAnalysis?.result_json['percentage'] ?? null;
              }
              console.log(latestAnalysis);
              // Calculate change
              const scoreChange = lastScore !== null ? (averageScore - lastScore) : null;
              const positiveChange = scoreChange !== null ? scoreChange >= 0 : true;

              setStats({
                average_score: {
                  value: `${averageScore.toFixed(1)}%`,
                  change: scoreChange !== null ? `${scoreChange >= 0 ? '+' : ''}${scoreChange.toFixed(1)}%` : '',
                  positive: positiveChange,
                },
                analyzed_test: {
                  value: analysisResults.length.toString(),
                  change: '', // optionally compute based on previous timeframe
                  positive: true,
                },
                strongest_movement: {
                  value: latestAnalysis.result_json['strengths'][0], // Replace with actual logic if available
                },
                focus_area: {
                  value: latestAnalysis.result_json['focusArea'].map((item) => item.area).join(", ") // Replace with actual logic if available
                }
              });
            }
          }
        } else {
          console.log('No completed documents found.');
        }
        // In a real app, you would fetch video analysis and subscription counts similarly
        // For now we'll use dummy data
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  //  const { count: docCount, error: docError } = await supabase
  //           .from('document_analysis')
  //           .select('*', { count: 'exact', head: true });
  // Example statistics - in a real app, these would come from your backend
  

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-lg sm:text-xl font-serif font-semibold text-purple-900 mb-3 sm:mb-4">
        {language === 'en' ? 'Performance Overview' : 'Resumen de Rendimiento'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsTitle.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-6 border border-purple-100 hover:border-purple-300 transition-all duration-200">
            <h3 className="text-xs sm:text-sm font-medium text-purple-600">
              {stat.title}
            </h3>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <p
                  className={`font-semibold text-purple-900 ${
                    ['strongest_movement', 'focus_area'].includes(stat.key)
                      ? 'text-lg sm:text-xl'
                      : 'text-xl sm:text-3xl'
                  }`}
                >
                  {stats[stat.key]?.value}
                </p>
                {stats[stat.key]?.subValue && (
                  <p className="text-xs sm:text-sm text-purple-700">
                    {stats[stat.key].subValue}
                  </p>
                )}
              </div>
              {stats[stat.key]?.change && (
                <div className={`px-2 py-1 rounded-full text-xs sm:text-sm ${stats[stat.key]?.positive ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'} flex items-center`}>
                  {stats[stat.key]?.positive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {stats[stat.key].change}
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
