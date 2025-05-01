
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MovementScore {
  movement: string;
  score: number;
  maxScore: number;
  comment?: string;
}

interface JumpingFault {
  jumpNumber: number;
  faultType: string;
  description?: string;
}

interface DocumentAnalysisData {
  id: string;
  horse_id: string;
  horse_name?: string;
  discipline: 'dressage' | 'jumping';
  test_level?: string;
  competition_type?: string;
  document_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  document_url: string;
  file_name: string;
  created_at: string;
  analysis_result?: {
    scores?: MovementScore[];
    totalScore?: number;
    percentage?: number;
    comments?: string[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    judgeComments?: string;
    faults?: JumpingFault[];
    time?: number;
    timeFaults?: number;
    knockDowns?: number;
    refusals?: number;
    fallsOrElimination?: boolean;
    coursePattern?: string;
    commonErrors?: string[];
  };
}

interface DocumentAnalysisDisplayProps {
  documentId?: string;
}

const DocumentAnalysisDisplay: React.FC<DocumentAnalysisDisplayProps> = ({ documentId }) => {
  const { user } = useAuth();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const [analysis, setAnalysis] = useState<DocumentAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !documentId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('document_analysis')
          .select(`
            *,
            horses:horse_id (name)
          `)
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        // Format the data to include the horse name
        const formattedData = {
          ...data,
          horse_name: data.horses?.name
        };
        
        setAnalysis(formattedData);
      } catch (err: any) {
        console.error('Error fetching analysis:', err);
        setError(err.message || 'An error occurred while fetching the analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
    
    // Set up real-time listener for updates
    if (documentId) {
      const channel = supabase
        .channel('document_analysis_changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'document_analysis',
          filter: `id=eq.${documentId}`
        }, payload => {
          // Update the analysis data when changes occur
          setAnalysis(prevAnalysis => {
            if (prevAnalysis && payload.new.id === prevAnalysis.id) {
              return {
                ...prevAnalysis,
                ...payload.new,
                horse_name: prevAnalysis.horse_name // Preserve horse name
              };
            }
            return prevAnalysis;
          });
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [documentId, user]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">{language === 'en' ? "Loading analysis..." : "Cargando análisis..."}</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => setError(null)}>
            {language === 'en' ? "Try Again" : "Intentar de nuevo"}
          </Button>
        </div>
      </Card>
    );
  }
  
  if (!analysis) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {language === 'en' ? "No analysis data available" : "No hay datos de análisis disponibles"}
        </div>
      </Card>
    );
  }
  
  if (analysis.status === 'pending' || analysis.status === 'processing') {
    return (
      <Card className="p-6 bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">
            {analysis.status === 'pending' 
              ? (language === 'en' ? "Analysis Pending" : "Análisis Pendiente") 
              : (language === 'en' ? "Processing Document" : "Procesando Documento")}
          </h3>
          <p className="text-gray-500">
            {analysis.status === 'pending'
              ? (language === 'en' ? "Your document is in queue for analysis." : "Tu documento está en cola para análisis.")
              : (language === 'en' ? "We're analyzing your document. This may take a few minutes." : "Estamos analizando tu documento. Esto puede tomar unos minutos.")}
          </p>
        </div>
      </Card>
    );
  }
  
  if (analysis.status === 'failed') {
    return (
      <Card className="p-6 bg-white">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">
              {language === 'en' ? "Analysis Failed" : "Análisis Fallido"}
            </h3>
            <p>
              {language === 'en' ? "We couldn't analyze this document. Please try uploading it again or contact support if the problem persists." : "No pudimos analizar este documento. Intenta subirlo de nuevo o contacta a soporte si el problema persiste."}
            </p>
          </div>
          <div className="mt-4">
            <Button>
              {language === 'en' ? "Try Again" : "Intentar de nuevo"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Display completed analysis based on discipline
  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold">
          {language === 'en' ? "Analysis Results" : "Resultados del Análisis"}
        </h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
          <span>{analysis.horse_name}</span>
          <span>•</span>
          <span>{new Date(analysis.document_date).toLocaleDateString()}</span>
          <span>•</span>
          <span>
            {analysis.discipline === 'dressage' 
              ? (analysis.test_level || '') 
              : (analysis.competition_type || '')}
          </span>
        </div>
      </div>
      
      {analysis.discipline === 'dressage' ? (
        <DressageAnalysis analysis={analysis} language={language} />
      ) : (
        <JumpingAnalysis analysis={analysis} language={language} />
      )}
    </Card>
  );
};

// Component for displaying dressage analysis
const DressageAnalysis: React.FC<{ analysis: DocumentAnalysisData, language: string }> = ({ analysis, language }) => {
  const result = analysis.analysis_result || {};
  const scores = result.scores || [];
  
  // Prepare data for the chart
  const chartData = scores.map(score => ({
    movement: score.movement,
    score: score.score,
    maxScore: score.maxScore,
    percentage: (score.score / score.maxScore) * 100
  }));
  
  return (
    <Tabs defaultValue="scores" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="scores">{language === 'en' ? "Scores" : "Puntuaciones"}</TabsTrigger>
        <TabsTrigger value="feedback">{language === 'en' ? "Feedback" : "Comentarios"}</TabsTrigger>
        <TabsTrigger value="recommendations">{language === 'en' ? "Recommendations" : "Recomendaciones"}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="scores" className="space-y-6">
        {result.totalScore !== undefined && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">{language === 'en' ? "Total Score" : "Puntuación Total"}</p>
                <p className="text-2xl font-bold">{result.totalScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'en' ? "Percentage" : "Porcentaje"}</p>
                <p className="text-2xl font-bold">{result.percentage?.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'en' ? "Max Score" : "Puntuación Máxima"}</p>
                <p className="text-2xl font-bold">
                  {scores.reduce((total, movement) => total + movement.maxScore, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="h-80">
          <ChartContainer 
            config={{
              score: {
                color: '#9b87f5',
                label: language === 'en' ? "Score" : "Puntuación"
              },
              maxScore: {
                color: '#e5e7eb',
                label: language === 'en' ? "Maximum" : "Máximo"
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                barGap={0}
                barCategoryGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="movement"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="var(--color-score)" name="score" />
                <Bar dataKey="maxScore" fill="var(--color-maxScore)" name="maxScore" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">
            {language === 'en' ? "Movement Scores" : "Puntuaciones por Movimiento"}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'en' ? "Movement" : "Movimiento"}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'en' ? "Score" : "Puntuación"}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'en' ? "Max" : "Máximo"}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'en' ? "Comment" : "Comentario"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scores.map((score, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {score.movement}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {score.score}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {score.maxScore}
                    </td>
                    <td className="px-4 py-4 whitespace-normal text-sm text-gray-500">
                      {score.comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="feedback" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-800">
              {language === 'en' ? "Strengths" : "Fortalezas"}
            </h3>
            <ul className="space-y-2">
              {result.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              )) || (
                <li className="text-gray-500 italic">
                  {language === 'en' ? "No strengths identified" : "No se identificaron fortalezas"}
                </li>
              )}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-800">
              {language === 'en' ? "Areas for Improvement" : "Áreas de Mejora"}
            </h3>
            <ul className="space-y-2">
              {result.weaknesses?.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">!</span>
                  <span>{weakness}</span>
                </li>
              )) || (
                <li className="text-gray-500 italic">
                  {language === 'en' ? "No weaknesses identified" : "No se identificaron debilidades"}
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            {language === 'en' ? "Judge Comments" : "Comentarios del Juez"}
          </h3>
          <div className="prose max-w-none">
            {result.judgeComments ? (
              <p className="text-gray-700">{result.judgeComments}</p>
            ) : (
              <p className="text-gray-500 italic">
                {language === 'en' ? "No judge comments available" : "No hay comentarios del juez disponibles"}
              </p>
            )}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="recommendations" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-800">
            {language === 'en' ? "Recommendations" : "Recomendaciones"}
          </h3>
          
          <div className="space-y-4">
            {result.recommendations?.map((rec, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900 mb-1">
                  {language === 'en' ? `Recommendation ${index + 1}` : `Recomendación ${index + 1}`}
                </p>
                <p className="text-gray-700">{rec}</p>
              </div>
            )) || (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500 italic">
                  {language === 'en' ? "No specific recommendations available" : "No hay recomendaciones específicas disponibles"}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-purple-900">
              {language === 'en' ? "Next Steps" : "Próximos Pasos"}
            </h3>
            <p className="text-gray-700">
              {language === 'en' 
                ? "Focus on the identified areas for improvement in your next training sessions. Consider reviewing the video of your test to visually identify the issues highlighted in this analysis."
                : "Concéntrate en las áreas de mejora identificadas en tus próximas sesiones de entrenamiento. Considera revisar el video de tu prueba para identificar visualmente los problemas destacados en este análisis."}
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

// Component for displaying jumping analysis
const JumpingAnalysis: React.FC<{ analysis: DocumentAnalysisData, language: string }> = ({ analysis, language }) => {
  const result = analysis.analysis_result || {};
  const faults = result.faults || [];
  
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">{language === 'en' ? "Overview" : "Resumen"}</TabsTrigger>
        <TabsTrigger value="faults">{language === 'en' ? "Faults" : "Faltas"}</TabsTrigger>
        <TabsTrigger value="recommendations">{language === 'en' ? "Recommendations" : "Recomendaciones"}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">{language === 'en' ? "Time" : "Tiempo"}</p>
              <p className="text-2xl font-bold">{result.time?.toFixed(2) || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'en' ? "Time Faults" : "Faltas de Tiempo"}</p>
              <p className="text-2xl font-bold">{result.timeFaults || '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'en' ? "Knock Downs" : "Derribos"}</p>
              <p className="text-2xl font-bold">{result.knockDowns || '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{language === 'en' ? "Refusals" : "Rehúses"}</p>
              <p className="text-2xl font-bold">{result.refusals || '0'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">
            {language === 'en' ? "Course Pattern" : "Patrón del Recorrido"}
          </h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {result.coursePattern ? (
              <p>{result.coursePattern}</p>
            ) : (
              <p className="text-gray-500 italic">
                {language === 'en' ? "No course pattern detected" : "No se detectó patrón del recorrido"}
              </p>
            )}
          </div>
        </div>
        
        {result.commonErrors && result.commonErrors.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">
              {language === 'en' ? "Common Errors" : "Errores Comunes"}
            </h3>
            <ul className="space-y-2">
              {result.commonErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">!</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="faults" className="space-y-6">
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">
            {language === 'en' ? "Fault Details" : "Detalles de Faltas"}
          </h3>
          
          {faults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'en' ? "Jump #" : "Salto #"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'en' ? "Fault Type" : "Tipo de Falta"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'en' ? "Description" : "Descripción"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faults.map((fault, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fault.jumpNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fault.faultType}
                      </td>
                      <td className="px-4 py-4 whitespace-normal text-sm text-gray-500">
                        {fault.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                {language === 'en' 
                  ? "No faults recorded in this round. Congratulations!" 
                  : "No se registraron faltas en esta ronda. ¡Felicidades!"}
              </p>
            </div>
          )}
        </div>
        
        {result.fallsOrElimination && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            <h4 className="font-semibold mb-1">
              {language === 'en' ? "Elimination/Fall" : "Eliminación/Caída"}
            </h4>
            <p>
              {language === 'en' 
                ? "This round resulted in elimination or included a fall." 
                : "Esta ronda resultó en eliminación o incluyó una caída."}
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="recommendations" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800">
            {language === 'en' ? "Recommendations" : "Recomendaciones"}
          </h3>
          
          <div className="space-y-4">
            {result.recommendations?.map((rec, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">
                  {language === 'en' ? `Recommendation ${index + 1}` : `Recomendación ${index + 1}`}
                </p>
                <p className="text-gray-700">{rec}</p>
              </div>
            )) || (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500 italic">
                  {language === 'en' ? "No specific recommendations available" : "No hay recomendaciones específicas disponibles"}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">
              {language === 'en' ? "Training Focus" : "Enfoque de Entrenamiento"}
            </h3>
            <p className="text-gray-700">
              {language === 'en' 
                ? "Based on the analysis of your round, focus on improving your approach angles and maintaining consistent pace throughout the course. Consider grid work to improve your horse's technique."
                : "Según el análisis de tu recorrido, concéntrate en mejorar los ángulos de aproximación y mantener un ritmo constante durante todo el recorrido. Considera ejercicios de barras para mejorar la técnica de tu caballo."}
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DocumentAnalysisDisplay;
