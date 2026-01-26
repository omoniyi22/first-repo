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
} from "lucide-react";
import { analyzeComplaintsWithGemini, AnalysisFeedback } from "./../../lib/aiservice";
import { toast } from "sonner";

interface AnalysisFeedbackProps {
  analysisData: any; // The previous analysis result
  documentId?: string;
  onFeedbackGenerated?: (feedback: AnalysisFeedback) => void;
}

const AnalysisFeedbackComponent: React.FC<AnalysisFeedbackProps> = ({
  analysisData,
  documentId,
  onFeedbackGenerated,
}) => {
  const { language } = useLanguage();
  const [feedback, setFeedback] = useState<AnalysisFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  useEffect(() => {
    if (analysisData && !feedback) {
      generateFeedback();
    }
  }, [analysisData]);

  const generateFeedback = async (forceRegenerate: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await analyzeComplaintsWithGemini({
        previousAnalysis: analysisData,
        language: language as 'en' | 'es',
        documentId
      });
      
      setFeedback(result);
      
      if (onFeedbackGenerated) {
        onFeedbackGenerated(result);
      }
      
      toast.success(
        language === 'en' 
          ? 'Feedback analysis completed!'
          : '¡Análisis de feedback completado!'
      );
      
    } catch (err: any) {
      console.error('Error generating feedback:', err);
      setError(err.message || 'Failed to analyze feedback');
      toast.error(
        language === 'en'
          ? 'Failed to analyze feedback'
          : 'Error al analizar el feedback'
      );
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    generateFeedback(true);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {language === 'en' 
                ? 'Analyzing Judge Feedback'
                : 'Analizando Feedback del Juez'}
            </h3>
            <p className="text-gray-600">
              {language === 'en'
                ? "Using AI to extract key complaints and generate actionable fixes..."
                : "Usando IA para extraer quejas clave y generar soluciones prácticas..."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">
              {language === 'en' ? 'Analysis Error' : 'Error de Análisis'}
            </h3>
            <p className="text-red-700 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateFeedback()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {language === 'en' ? 'Try Again' : 'Intentar de Nuevo'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!feedback) {
    return null;
  }

  const hasComplaints = feedback.complaints.length > 0;
  const hasAreas = feedback.areas.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'en' 
              ? 'Judge Feedback Analysis'
              : 'Análisis de Feedback del Juez'}
          </h2>
          <p className="text-gray-600 mt-1">
            {language === 'en'
              ? 'AI-powered insights from your competition feedback'
              : 'Análisis con IA basado en los comentarios de tu competencia'}
          </p>
        </div>
      
      </div>

      {/* Judge Complaints Section */}
      {hasComplaints ? (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {language === 'en' 
                  ? 'Judge Comments Analyzed'
                  : 'Comentarios del Juez Analizados'}
              </h3>
              <p className="text-gray-600 text-sm">
                {feedback.complaints.length} {language === 'en' ? 'comments identified' : 'comentarios identificados'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {feedback.complaints.map((complaint, index) => (
              <div key={index} className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Complaint */}
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-red-800">
                            {language === 'en' ? 'Judge Said:' : 'Juez dijo:'}
                          </span>
                          <p className="text-red-700 mt-1">{complaint}</p>
                        </div>
                      </div>
                    </div>

                    {/* Interpretation */}
                    {feedback.interpretations[index] && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-blue-800">
                              {language === 'en' ? 'What It Means:' : 'Lo que significa:'}
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
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">
              {language === 'en' 
                ? 'No Critical Complaints Found'
                : 'No se Encontraron Quejas Críticas'}
            </h3>
            <p className="text-gray-600">
              {language === 'en'
                ? 'Great job! The judges had minimal complaints about your performance.'
                : '¡Excelente trabajo! Los jueces tuvieron mínimas quejas sobre tu desempeño.'}
            </p>
          </div>
        </Card>
      )}

      {/* Areas to Fix Section */}
      {hasAreas && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {language === 'en' 
                  ? 'Key Areas to Improve'
                  : 'Áreas Clave para Mejorar'}
              </h3>
              <p className="text-gray-600 text-sm">
                {feedback.areas.length} {language === 'en' ? 'actionable fixes' : 'soluciones prácticas'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {feedback.areas.map((area, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:border-purple-300 transition-colors bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                      <span className="font-bold text-purple-700">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{area.name}</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {feedback.complaints.length}
          </div>
          <div className="text-sm font-medium">
            {language === 'en' ? 'Judge Comments' : 'Comentarios del Juez'}
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {feedback.interpretations.length}
          </div>
          <div className="text-sm font-medium">
            {language === 'en' ? 'AI Interpretations' : 'Interpretaciones IA'}
          </div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {feedback.areas.length}
          </div>
          <div className="text-sm font-medium">
            {language === 'en' ? 'Actionable Fixes' : 'Soluciones Prácticas'}
          </div>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500">
        <p>
          {language === 'en'
            ? 'This analysis is generated using AI and should be used as a training guide. Always consult with your coach.'
            : 'Este análisis se genera con IA y debe usarse como guía de entrenamiento. Consulte siempre con su entrenador.'}
        </p>
      </div>
    </div>
  );
};

export default AnalysisFeedbackComponent;