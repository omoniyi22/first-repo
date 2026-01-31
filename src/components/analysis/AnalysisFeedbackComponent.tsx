import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Loader2,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisFeedbackProps {
  analysisData: any; // The analysis result that now contains aiInterpretation
  documentId?: string;
  language?: 'en' | 'es';
  analysisType?: 'document' | 'video';
  onFeedbackGenerated?: (feedback: any) => void;
}

const AnalysisFeedbackComponent: React.FC<AnalysisFeedbackProps> = ({
  analysisData,
  documentId,
  language: propLanguage,
  analysisType = 'document',
  onFeedbackGenerated,
}) => {
  const { language: contextLanguage } = useLanguage();
  const language = propLanguage || contextLanguage;
  
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAIFeedback, setHasAIFeedback] = useState<boolean>(false);

  useEffect(() => {
    // Check if analysisData already has aiInterpretation
    if (analysisData) {
      extractFeedback();
    } else {
      setIsLoading(false);
      setError("No analysis data provided");
    }
  }, [analysisData, language]);

  const extractFeedback = () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasAIFeedback(false);
      
      // Get the correct language version
      let dataToUse = analysisData;
      
      // If analysisData has language structure (en/es), get the correct one
      if (analysisData?.en || analysisData?.es) {
        dataToUse = analysisData[language] || analysisData.en || analysisData.es;
      }
      
      console.log("📊 Extracting AI feedback from data:", {
        hasData: !!dataToUse,
        language,
        hasAI: !!dataToUse?.aiInterpretation,
        analysisType
      });
      
      // Check if aiInterpretation exists
      if (dataToUse?.aiInterpretation) {
        setFeedback(dataToUse.aiInterpretation);
        setHasAIFeedback(true);
        
        if (onFeedbackGenerated) {
          onFeedbackGenerated(dataToUse.aiInterpretation);
        }
        
        toast.success(
          language === 'en' 
            ? 'AI feedback analysis loaded!'
            : '¡Análisis de feedback IA cargado!'
        );
      } else {
        // If no aiInterpretation exists in the data
        setError(
          language === 'en'
            ? 'AI interpretation not available for this analysis'
            : 'Interpretación IA no disponible para este análisis'
        );
        setHasAIFeedback(false);
      }
      
    } catch (err: any) {
      console.error('Error extracting feedback:', err);
      setError(err.message || 'Failed to extract feedback');
      setHasAIFeedback(false);
      toast.error(
        language === 'en'
          ? 'Failed to extract feedback'
          : 'Error al extraer el feedback'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    extractFeedback();
  };

  if (isLoading) {
    return (
      <Card className="p-8 border border-purple-200">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {language === 'en' 
                ? 'Loading AI Feedback'
                : 'Cargando Feedback IA'}
            </h3>
            <p className="text-gray-600">
              {language === 'en'
                ? "Loading AI interpretation of judge feedback..."
                : "Cargando interpretación IA del feedback del juez..."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && !hasAIFeedback) {
    return (
      <Card className="p-6 border-yellow-200 bg-yellow-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-1">
              {language === 'en' ? 'AI Interpretation Not Available' : 'Interpretación IA No Disponible'}
            </h3>
            <p className="text-yellow-700 mb-3">{error}</p>
            <p className="text-sm text-yellow-600">
              {language === 'en'
                ? 'This analysis was processed before AI interpretation was added to the system.'
                : 'Este análisis fue procesado antes de que se agregara la interpretación IA al sistema.'}
            </p>
            {analysisData?.en?.aiInterpretation && (
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-blue-700 text-sm">
                  {language === 'en'
                    ? 'AI interpretation is available in English. Switch language to view.'
                    : 'La interpretación IA está disponible en inglés. Cambia el idioma para ver.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!feedback && !hasAIFeedback) {
    return null;
  }

  const hasComplaints = feedback?.complaints && feedback.complaints.length > 0;
  const hasInterpretations = feedback?.interpretations && feedback.interpretations.length > 0;
  const hasAreas = feedback?.areas && feedback.areas.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            {language === 'en' 
              ? 'AI Feedback Analysis'
              : 'Análisis de Feedback con IA'}
            <Badge variant="outline" className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              AI
            </Badge>
          </h2>
          <p className="text-gray-600 mt-1">
            {analysisType === 'document' 
              ? language === 'en'
                ? 'AI-powered insights from judge comments and performance patterns'
                : 'Perspectivas con IA basadas en comentarios del juez y patrones de rendimiento'
              : language === 'en'
                ? 'AI analysis of your jumping performance and technique'
                : 'Análisis IA de tu rendimiento y técnica de salto'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2 hover:bg-purple-50"
        >
          <RefreshCw className="h-4 w-4" />
          {language === 'en' ? 'Refresh' : 'Actualizar'}
        </Button>
      </div>

      {/* Judge Complaints/Performance Issues Section */}
      {hasComplaints ? (
        <Card className="p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {analysisType === 'document'
                  ? language === 'en' 
                    ? 'Judge Comments Analysis'
                    : 'Análisis de Comentarios del Juez'
                  : language === 'en'
                    ? 'Performance Issues Analysis'
                    : 'Análisis de Problemas de Rendimiento'}
              </h3>
              <p className="text-gray-600 text-sm">
                {feedback.complaints.length} {language === 'en' ? 'key issues identified' : 'problemas clave identificados'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {feedback.complaints.map((complaint: string, index: number) => (
              <div key={index} className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Complaint/Issue */}
                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-red-800">
                            {analysisType === 'document'
                              ? language === 'en' ? 'Judge Feedback:' : 'Feedback del Juez:'
                              : language === 'en' ? 'Performance Issue:' : 'Problema de Rendimiento:'}
                          </span>
                          <p className="text-red-700 mt-1">{complaint}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Interpretation */}
                    {hasInterpretations && feedback.interpretations[index] && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-blue-800">
                              {language === 'en' ? 'AI Insight:' : 'Perspectiva IA:'}
                            </span>
                            <p className="text-blue-700 mt-1">{feedback.interpretations[index]}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {index < feedback.complaints.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">
              {language === 'en' 
                ? 'No Critical Issues Found'
                : 'No se Encontraron Problemas Críticos'}
            </h3>
            <p className="text-gray-600">
              {analysisType === 'document'
                ? language === 'en'
                  ? 'Excellent performance! The judges had minimal feedback.'
                  : '¡Excelente rendimiento! Los jueces tuvieron mínimo feedback.'
                : language === 'en'
                  ? 'Great technique! No significant performance issues detected.'
                  : '¡Excelente técnica! No se detectaron problemas significativos.'}
            </p>
          </div>
        </Card>
      )}

      {/* AI Recommended Fixes Section */}
      {hasAreas && (
        <Card className="p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {language === 'en' 
                  ? 'AI Recommended Improvements'
                  : 'Mejoras Recomendadas por IA'}
              </h3>
              <p className="text-gray-600 text-sm">
                {feedback.areas.length} {language === 'en' ? 'actionable fixes' : 'soluciones prácticas'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {feedback.areas.map((area: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:border-purple-300 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                      <span className="font-bold text-purple-700">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2 text-gray-800">{area.name}</h4>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-md">
                      <span className="font-medium text-gray-700">
                        {language === 'en' ? 'Actionable Fix:' : 'Solución Práctica:'}
                      </span>
                      <p className="text-gray-800 mt-1">{area.fix}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      {(hasComplaints || hasInterpretations || hasAreas) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasComplaints && (
            <Card className="p-4 text-center border border-purple-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                {feedback.complaints.length}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {analysisType === 'document'
                  ? language === 'en' ? 'Judge Comments' : 'Comentarios'
                  : language === 'en' ? 'Performance Issues' : 'Problemas'}
              </div>
            </Card>
          )}
          {hasInterpretations && (
            <Card className="p-4 text-center border border-blue-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {feedback.interpretations.length}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {language === 'en' ? 'AI Insights' : 'Perspectivas IA'}
              </div>
            </Card>
          )}
          {hasAreas && (
            <Card className="p-4 text-center border border-green-100">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                {feedback.areas.length}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {language === 'en' ? 'Actionable Fixes' : 'Soluciones'}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {language === 'en'
            ? 'AI analysis generated based on judge comments and performance patterns. Use as training guidance and consult with your coach.'
            : 'Análisis IA generado basado en comentarios del juez y patrones de rendimiento. Úsalo como guía de entrenamiento y consulta con tu entrenador.'}
        </p>
      </div>
    </div>
  );
};

export default AnalysisFeedbackComponent;