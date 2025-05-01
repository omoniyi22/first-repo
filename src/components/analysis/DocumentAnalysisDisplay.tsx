import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

// Define proper types for the analysis data
interface MovementScore {
  movement: string;
  score: number;
  maxScore: number;
  comment?: string;
}

interface JumpingFault {
  jumpNumber?: number;
  jump?: number;
  faultType?: string;
  faults?: number;
  time?: number;
  description?: string;
}

interface AnalysisResultData {
  scores?: MovementScore[];
  totalScore?: number;
  percentage?: number;
  comments?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  judgeComments?: string;
  faults?: JumpingFault[];
  courseTime?: number;
  optimumTime?: number;
  timeFaults?: number;
  timePenalties?: number;
  totalFaults?: number;
  placing?: string;
  jumpTypes?: string[];
  commonErrors?: string[];
}

interface DocumentAnalysisDisplayProps {
  documentId: string;
}

// Mock data for development
const mockAnalysisData = {
  id: '123',
  discipline: 'jumping',
  status: 'completed',
};

const mockResultData: AnalysisResultData = {
  totalScore: 68,
  percentage: 68.5,
  scores: [
    { movement: 'Entry at A', score: 7, maxScore: 10, comment: 'Good rhythm' },
    { movement: 'Halt at X', score: 6, maxScore: 10, comment: 'Slightly unbalanced' },
    { movement: 'Working trot', score: 7.5, maxScore: 10, comment: 'Nice energy' },
  ],
  strengths: ['Good rhythm', 'Nice energy throughout', 'Attentive to aids'],
  weaknesses: ['Tension in transitions', 'Balance in halts needs work'],
  recommendations: ['Work on balanced halts', 'Practice smoother transitions'],
  faults: [
    { jumpNumber: 1, faultType: 'Knockdown', faults: 4, description: 'Back rail' },
    { jumpNumber: 5, faultType: 'Refusal', faults: 4, description: 'First refusal' },
  ],
  totalFaults: 8,
  courseTime: 82.4,
  optimumTime: 80.0,
  timePenalties: 1,
  jumpTypes: ['Vertical', 'Oxer', 'Combination', 'Water jump'],
  commonErrors: ['Coming too fast to verticals', 'Rushing combinations']
};

const DocumentAnalysisDisplay: React.FC<DocumentAnalysisDisplayProps> = ({ documentId }) => {
  const { language } = useLanguage();
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [resultData, setResultData] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Use mock data instead of actual Supabase query
          setAnalysis(mockAnalysisData);
          setResultData(mockResultData);
          setIsLoading(false);
        }, 1000);
      } catch (err: any) {
        console.error('Error fetching analysis:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [documentId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }
  
  if (error || !resultData) {
    return (
      <Card className="p-4 bg-red-50 text-red-800 text-center">
        <p>{error || (language === 'en' ? 'Analysis not available' : 'Análisis no disponible')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
          {language === 'en' ? 'Analysis Results' : 'Resultados del Análisis'}
        </h3>
        {resultData.totalScore && resultData.percentage ? (
          <p className="text-lg">
            {language === 'en' ? 'Total Score:' : 'Puntuación Total:'} <span className="font-semibold">{resultData.totalScore}</span> (<span className="font-semibold">{resultData.percentage}%</span>)
          </p>
        ) : (
          <p>{language === 'en' ? 'Score not available' : 'Puntuación no disponible'}</p>
        )}
      </Card>

      {resultData.scores && resultData.scores.length > 0 && (
        <Card className="p-4 sm:p-6 overflow-hidden">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Movement Scores' : 'Puntuaciones de Movimiento'}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Movement' : 'Movimiento'}</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Score' : 'Puntuación'}</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Max' : 'Máx'}</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Comment' : 'Comentario'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultData.scores.map((score, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-sm">{score.movement}</td>
                    <td className="py-2 px-3 text-sm">{score.score}</td>
                    <td className="py-2 px-3 text-sm">{score.maxScore}</td>
                    <td className="py-2 px-3 text-sm">{score.comment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {resultData.faults && resultData.faults.length > 0 && (
        <Card className="p-4 sm:p-6 overflow-hidden">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Jumping Faults' : 'Faltas de Salto'}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Jump' : 'Salto'}</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Faults' : 'Faltas'}</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Type' : 'Tipo'}</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">{language === 'en' ? 'Description' : 'Descripción'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultData.faults.map((fault, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-sm">{fault.jumpNumber || fault.jump || '-'}</td>
                    <td className="py-2 px-3 text-sm">{fault.faults || '-'}</td>
                    <td className="py-2 px-3 text-sm">{fault.faultType || '-'}</td>
                    <td className="py-2 px-3 text-sm">{fault.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Display sections conditionally with improved spacing and responsive design */}
      {resultData.comments && resultData.comments.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Comments' : 'Comentarios'}
          </h4>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData.comments.map((comment, index) => (
              <li key={index} className="text-sm sm:text-base">{comment}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {resultData.strengths && resultData.strengths.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {language === 'en' ? 'Strengths' : 'Fortalezas'}
            </h4>
            <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
              {resultData.strengths.map((strength, index) => (
                <li key={index} className="text-sm sm:text-base">{strength}</li>
              ))}
            </ul>
          </Card>
        )}

        {resultData.weaknesses && resultData.weaknesses.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {language === 'en' ? 'Weaknesses' : 'Debilidades'}
            </h4>
            <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
              {resultData.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm sm:text-base">{weakness}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {resultData.recommendations && resultData.recommendations.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Recommendations' : 'Recomendaciones'}
          </h4>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm sm:text-base">{recommendation}</li>
            ))}
          </ul>
        </Card>
      )}

      {resultData.judgeComments && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Judge Comments' : 'Comentarios del Juez'}
          </h4>
          <p className="text-sm sm:text-base">{resultData.judgeComments}</p>
        </Card>
      )}

      {(resultData.courseTime || resultData.optimumTime) && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Time Analysis' : 'Análisis de Tiempo'}
          </h4>
          {resultData.courseTime && (
            <p className="text-sm sm:text-base mb-2">
              {language === 'en' ? 'Course Time:' : 'Tiempo del Curso:'} <span className="font-medium">{resultData.courseTime}</span>
            </p>
          )}
          {resultData.optimumTime && (
            <p className="text-sm sm:text-base mb-2">
              {language === 'en' ? 'Optimum Time:' : 'Tiempo Óptimo:'} <span className="font-medium">{resultData.optimumTime}</span>
            </p>
          )}
          {resultData.timePenalties && (
            <p className="text-sm sm:text-base">
              {language === 'en' ? 'Time Penalties:' : 'Penalizaciones de Tiempo:'} <span className="font-medium">{resultData.timePenalties}</span>
            </p>
          )}
        </Card>
      )}

      {resultData.totalFaults !== undefined && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3">
            {language === 'en' ? 'Total Faults' : 'Faltas Totales'}
          </h4>
          <p className="text-xl font-bold">{resultData.totalFaults}</p>
        </Card>
      )}

      {resultData.placing && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3">
            {language === 'en' ? 'Placing' : 'Colocación'}
          </h4>
          <p className="text-xl font-bold">{resultData.placing}</p>
        </Card>
      )}

      {resultData.jumpTypes && resultData.jumpTypes.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Jump Types' : 'Tipos de Salto'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {resultData.jumpTypes.map((type, index) => (
              <Badge key={index} variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200">{type}</Badge>
            ))}
          </div>
        </Card>
      )}

      {resultData.commonErrors && resultData.commonErrors.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === 'en' ? 'Common Errors' : 'Errores Comunes'}
          </h4>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData.commonErrors.map((error, index) => (
              <li key={index} className="text-sm sm:text-base">{error}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default DocumentAnalysisDisplay;
