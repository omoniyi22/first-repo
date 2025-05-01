// Import and type definition fixes
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from '@/contexts/LanguageContext';

// Define proper types for the analysis data instead of using Json type
interface MovementScore {
  movement: string;
  score: number;
  maxScore: number;
  comment?: string;
}

interface JumpingFault {
  jump: number;
  faults: number;
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
  timePenalties?: number;
  totalFaults?: number;
  placing?: string;
  jumpTypes?: string[];
  commonErrors?: string[];
}

interface DocumentAnalysisDisplayProps {
  analysis: {
    id: string;
    user_id: string;
    video_id: string | null;
    document_type: string;
    file_name: string;
    file_type: string;
    upload_date: string;
    analysis_date: string | null;
    status: string;
    result_json: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
}

const DocumentAnalysisDisplay: React.FC<DocumentAnalysisDisplayProps> = ({ analysis }) => {
  const { language } = useLanguage();
  
  // When accessing resultData, properly parse the JSON string to an object
  const resultData: AnalysisResultData = typeof analysis.result_json === 'string' 
    ? JSON.parse(analysis.result_json) 
    : analysis.result_json as AnalysisResultData;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-2">
          {language === 'en' ? 'Analysis Results' : 'Resultados del Análisis'}
        </h3>
        {resultData.totalScore && resultData.percentage ? (
          <p>
            {language === 'en' ? 'Total Score:' : 'Puntuación Total:'} {resultData.totalScore} ({resultData.percentage}%)
          </p>
        ) : (
          <p>{language === 'en' ? 'Score not available' : 'Puntuación no disponible'}</p>
        )}
      </Card>

      {resultData.scores && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Movement Scores' : 'Puntuaciones de Movimiento'}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">{language === 'en' ? 'Movement' : 'Movimiento'}</th>
                  <th className="text-left">{language === 'en' ? 'Score' : 'Puntuación'}</th>
                  <th className="text-left">{language === 'en' ? 'Max Score' : 'Puntuación Máxima'}</th>
                  <th className="text-left">{language === 'en' ? 'Comment' : 'Comentario'}</th>
                </tr>
              </thead>
              <tbody>
                {resultData.scores.map((score, index) => (
                  <tr key={index}>
                    <td>{score.movement}</td>
                    <td>{score.score}</td>
                    <td>{score.maxScore}</td>
                    <td>{score.comment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {resultData.faults && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Jumping Faults' : 'Faltas de Salto'}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left">{language === 'en' ? 'Jump' : 'Salto'}</th>
                  <th className="text-left">{language === 'en' ? 'Faults' : 'Faltas'}</th>
                  <th className="text-left">{language === 'en' ? 'Time' : 'Tiempo'}</th>
                  <th className="text-left">{language === 'en' ? 'Description' : 'Descripción'}</th>
                </tr>
              </thead>
              <tbody>
                {resultData.faults.map((fault, index) => (
                  <tr key={index}>
                    <td>{fault.jump}</td>
                    <td>{fault.faults}</td>
                    <td>{fault.time || '-'}</td>
                    <td>{fault.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {resultData.comments && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Comments' : 'Comentarios'}
          </h4>
          <ul className="list-disc pl-5">
            {resultData.comments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        </Card>
      )}

      {resultData.strengths && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Strengths' : 'Fortalezas'}
          </h4>
          <ul className="list-disc pl-5">
            {resultData.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </Card>
      )}

      {resultData.weaknesses && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Weaknesses' : 'Debilidades'}
          </h4>
          <ul className="list-disc pl-5">
            {resultData.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        </Card>
      )}

      {resultData.recommendations && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Recommendations' : 'Recomendaciones'}
          </h4>
          <ul className="list-disc pl-5">
            {resultData.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </Card>
      )}

      {resultData.judgeComments && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Judge Comments' : 'Comentarios del Juez'}
          </h4>
          <p>{resultData.judgeComments}</p>
        </Card>
      )}

      {resultData.courseTime && resultData.optimumTime && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Time Analysis' : 'Análisis de Tiempo'}
          </h4>
          <p>
            {language === 'en' ? 'Course Time:' : 'Tiempo del Curso:'} {resultData.courseTime}
          </p>
          <p>
            {language === 'en' ? 'Optimum Time:' : 'Tiempo Óptimo:'} {resultData.optimumTime}
          </p>
          {resultData.timePenalties && (
            <p>
              {language === 'en' ? 'Time Penalties:' : 'Penalizaciones de Tiempo:'} {resultData.timePenalties}
            </p>
          )}
        </Card>
      )}

      {resultData.totalFaults && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Total Faults' : 'Faltas Totales'}
          </h4>
          <p>{resultData.totalFaults}</p>
        </Card>
      )}

      {resultData.placing && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Placing' : 'Colocación'}
          </h4>
          <p>{resultData.placing}</p>
        </Card>
      )}

      {resultData.jumpTypes && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Jump Types' : 'Tipos de Salto'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {resultData.jumpTypes.map((type, index) => (
              <Badge key={index}>{type}</Badge>
            ))}
          </div>
        </Card>
      )}

      {resultData.commonErrors && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-2">
            {language === 'en' ? 'Common Errors' : 'Errores Comunes'}
          </h4>
          <ul className="list-disc pl-5">
            {resultData.commonErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default DocumentAnalysisDisplay;
