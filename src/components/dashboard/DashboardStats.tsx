import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Type definitions for analysis results
interface AnalysisResultJson {
  percentage?: number;
  strengths?: string[];
  focusArea?: Array<{ area: string }>;
}

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
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        
        // Fetch all document analysis count (regardless of status)
        const { data: allDocs, error: docError } = await supabase
          .from('document_analysis')
          .select('id, document_date')
          .eq('user_id', user.id)
          .order('document_date', { ascending: false });

        if (docError) {
          console.error('Error fetching documents:', docError.message);
          return;
        }

        // Fetch completed documents for other stats
        const { data: completedDocs, error: completedDocError } = await supabase
          .from('document_analysis')
          .select('id, document_date')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('document_date', { ascending: false });

        if (completedDocError) {
          console.error('Error fetching completed documents:', completedDocError.message);
          return;
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
              // Calculate average score with proper typing
              const scores = analysisResults
                .map(r => {
                  const resultJson = r.result_json as AnalysisResultJson;
                  return resultJson?.percentage;
                })
                .filter((s): s is number => typeof s === 'number' && !isNaN(s));
              
              const totalScore = scores.reduce((acc, score) => acc + score, 0);
              const averageScore = scores.length > 0 ? (totalScore / scores.length) : 0;

              // Get latest analysis result
              const latestDocId = completedDocs[0]?.id;
              const latestAnalysis = analysisResults.find(r => r.document_id === latestDocId);
              const latestResultJson = latestAnalysis?.result_json as AnalysisResultJson;
              const lastScore = latestResultJson?.percentage ?? null;

              // Calculate change compared to previous score if available
              let scoreChange = null;
              let positiveChange = true;
              
              if (scores.length > 1 && lastScore !== null) {
                // Compare with the average of other scores
                const otherScores = scores.slice(1);
                const prevAverage = otherScores.reduce((acc, score) => acc + score, 0) / otherScores.length;
                scoreChange = lastScore - prevAverage;
                positiveChange = scoreChange >= 0;
              }

              // Get strongest movement and focus area from latest analysis
              const strongestMovement = latestResultJson?.strengths?.[0] || 
                                     (language === 'en' ? 'Not Available' : 'No Disponible');
              
              const focusAreas = latestResultJson?.focusArea?.map(item => item.area) || [];
              const focusAreaText = focusAreas.length > 0 
                ? focusAreas.slice(0, 2).join(", ") 
                : (language === 'en' ? 'Not Available' : 'No Disponible');

              setStats({
                average_score: {
                  value: `${averageScore.toFixed(1)}%`,
                  change: scoreChange !== null ? `${scoreChange >= 0 ? '+' : ''}${scoreChange.toFixed(1)}%` : '',
                  positive: positiveChange,
                },
                analyzed_test: {
                  value: allDocs?.length.toString() || '0',
                  change: '', // Could be enhanced to show change over time
                  positive: true,
                },
                strongest_movement: {
                  value: strongestMovement,
                },
                focus_area: {
                  value: focusAreaText
                }
              });
            } else {
              // No analysis results found but we have uploaded documents
              setStats({
                average_score: {
                  value: '0%',
                  change: '',
                  positive: true,
                },
                analyzed_test: {
                  value: allDocs?.length.toString() || '0',
                  change: '',
                  positive: true,
                },
                strongest_movement: {
                  value: language === 'en' ? 'No data yet' : 'Sin datos aún',
                },
                focus_area: {
                  value: language === 'en' ? 'No data yet' : 'Sin datos aún'
                }
              });
            }
          }
        } else {
          // Set stats based on all uploaded documents, even if none are completed
          setStats({
            average_score: {
              value: '0%',
              change: '',
              positive: true,
            },
            analyzed_test: {
              value: allDocs?.length.toString() || '0',
              change: '',
              positive: true,
            },
            strongest_movement: {
              value: allDocs && allDocs.length > 0 
                ? (language === 'en' ? 'Analysis pending' : 'Análisis pendiente')
                : (language === 'en' ? 'Upload your first test' : 'Sube tu primera prueba'),
            },
            focus_area: {
              value: allDocs && allDocs.length > 0 
                ? (language === 'en' ? 'Analysis pending' : 'Análisis pendiente')
                : (language === 'en' ? 'Upload your first test' : 'Sube tu primera prueba')
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, language]);

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
                  {isLoading ? '...' : (stats[stat.key]?.value || '...')}
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
