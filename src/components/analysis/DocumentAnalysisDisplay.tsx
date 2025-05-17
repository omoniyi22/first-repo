import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  generalComments?: object;
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

interface DocumentAnalysis {
  id: string;
  user_id: string;
  horse_id: string;
  horse_name: string;
  discipline: string;
  test_level: string | null;
  competition_type: string | null;
  document_date: string;
  document_url: string;
  file_name: string;
  file_type: string;
  status: string;
  created_at: string;
}

interface DocumentAnalysisDisplayProps {
  documentId: string;
}

// Mock result data for development - we'll replace this with real API calls later
const mockResultData: AnalysisResultData = {
  totalScore: 68,
  percentage: 68.5,
  scores: [
    { movement: "Entry at A", score: 7, maxScore: 10, comment: "Good rhythm" },
    {
      movement: "Halt at X",
      score: 6,
      maxScore: 10,
      comment: "Slightly unbalanced",
    },
    {
      movement: "Working trot",
      score: 7.5,
      maxScore: 10,
      comment: "Nice energy",
    },
  ],
  strengths: ["Good rhythm", "Nice energy throughout", "Attentive to aids"],
  weaknesses: ["Tension in transitions", "Balance in halts needs work"],
  recommendations: ["Work on balanced halts", "Practice smoother transitions"],
  faults: [
    {
      jumpNumber: 1,
      faultType: "Knockdown",
      faults: 4,
      description: "Back rail",
    },
    {
      jumpNumber: 5,
      faultType: "Refusal",
      faults: 4,
      description: "First refusal",
    },
  ],
  totalFaults: 8,
  courseTime: 82.4,
  optimumTime: 80.0,
  timePenalties: 1,
  jumpTypes: ["Vertical", "Oxer", "Combination", "Water jump"],
  commonErrors: ["Coming too fast to verticals", "Rushing combinations"],
};

const DocumentAnalysisDisplay: React.FC<DocumentAnalysisDisplayProps> = ({
  documentId,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [resultData, setResultData] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch the document analysis from Supabase
        const { data: documentData, error: documentError } = await supabase
          .from("document_analysis")
          .select("*")
          .eq("id", documentId)
          .eq("user_id", user.id)
          .single();

        if (documentError) throw documentError;

        if (documentData) {
          setAnalysis(documentData as DocumentAnalysis);

          // Fetch analysis results if document status is 'completed'
          if (documentData.status === "completed") {
            const { data: resultData, error: resultError } = await supabase
              .from("analysis_results")
              .select("result_json")
              .eq("document_id", documentId)
              .single();

            console.log("I called", resultData);
            if (resultError) {
              console.warn("Could not fetch analysis results:", resultError);
              // For now, fall back to mock data if no results are available
              setResultData(mockResultData);
            } else if (resultData) {
              // Use actual result data from the database
              setResultData(resultData.result_json as AnalysisResultData);
            } else {
              // Fall back to mock data if no results
              setResultData(mockResultData);
            }
          } else {
            // Document is not completed yet
            setResultData(null);
          }
        } else {
          setError(
            language === "en" ? "Document not found" : "Documento no encontrado"
          );
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching analysis:", err);
        setError(err.message);
        setIsLoading(false);
        toast.error(
          language === "en"
            ? "Failed to load document analysis"
            : "No se pudo cargar el análisis del documento"
        );
      }
    };

    fetchAnalysis();
  }, [documentId, user, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="p-4 bg-red-50 text-red-800 text-center">
        <p>
          {error ||
            (language === "en"
              ? "Analysis not available"
              : "Análisis no disponible")}
        </p>
      </Card>
    );
  }

  // Document exists but is not completed
  if (analysis.status !== "completed") {
    return (
      <Card className="p-6 bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">
            {analysis.status === "pending"
              ? language === "en"
                ? "Analysis Pending"
                : "Análisis Pendiente"
              : language === "en"
              ? "Processing Document"
              : "Procesando Documento"}
          </h3>
          <p className="text-gray-500">
            {analysis.status === "pending"
              ? language === "en"
                ? "Your document is in queue for analysis."
                : "Tu documento está en cola para análisis."
              : language === "en"
              ? "We're analyzing your document. This may take several minutes."
              : "Estamos analizando tu documento. Esto puede tomar varios minutos."}
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-left">
            <h4 className="font-medium mb-1">{analysis.file_name}</h4>
            <p className="text-sm text-gray-700">
              {analysis.discipline === "dressage"
                ? language === "en"
                  ? "Dressage"
                  : "Doma"
                : language === "en"
                ? "Jumping"
                : "Salto"}
              {" - "}
              {analysis.horse_name}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {language === "en" ? "Uploaded on: " : "Subido el: "}
              {new Date(analysis.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!resultData) {
    return (
      <Card className="p-4 bg-yellow-50 text-yellow-800 text-center">
        <p>
          {language === "en"
            ? "Results not available yet"
            : "Resultados aún no disponibles"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
          {language === "en" ? "Analysis Results" : "Resultados del Análisis"}
        </h3>
        {resultData.totalScore || resultData.percentage ? (
          <p className="text-lg">
            {language === "en" ? "Total Score:" : "Puntuación Total:"}{" "}
            <span className="font-semibold">{resultData.totalScore}</span> (
            <span className="font-semibold">{resultData.percentage}%</span>)
          </p>
        ) : (
          <p>
            {language === "en"
              ? "Score not available"
              : "Puntuación no disponible"}
          </p>
        )}
      </Card>

      {resultData.scores && resultData.scores.length > 0 && (
        <Card className="p-4 sm:p-6 overflow-hidden">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === "en"
              ? "Movement Scores"
              : "Puntuaciones de Movimiento"}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Movement" : "Movimiento"}
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Score" : "Puntuación"}
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Max" : "Máx"}
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Comment" : "Comentario"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultData.scores.map((score, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-2 px-3 text-sm">{score.movement}</td>
                    <td className="py-2 px-3 text-sm">
                      {Object.entries(score)
                        .filter(([key]) => key.startsWith("judge"))
                        .map(([key, value]) => (
                          <div key={key}>
                            {key.replace("judge", "")}: {value || "-"}
                          </div>
                        ))}
                    </td>
                    <td className="py-2 px-3 text-sm">{score.maxScore}</td>
                    <td className="py-2 px-3 text-sm">
                      {Object.entries(score)
                        .filter(([key]) => key.startsWith("comment"))
                        .map(([key, value]) => (
                          <div key={key}>
                            {key.replace("comment", "")}: {value || "-"}
                          </div>
                        ))}
                    </td>
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
            {language === "en" ? "Jumping Faults" : "Faltas de Salto"}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Jump" : "Salto"}
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Faults" : "Faltas"}
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Type" : "Tipo"}
                  </th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">
                    {language === "en" ? "Description" : "Descripción"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resultData.faults.map((fault, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-2 px-3 text-sm">
                      {fault.jumpNumber || fault.jump || "-"}
                    </td>
                    <td className="py-2 px-3 text-sm">{fault.faults || "-"}</td>
                    <td className="py-2 px-3 text-sm">
                      {fault.faultType || "-"}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      {fault.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Display sections conditionally with improved spacing and responsive design */}
      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {language === "en" ? "Comments" : "Comentarios"}
        </h4>
        <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
          {resultData?.comments?.map((comment, index) => (
            <li key={index} className="text-sm sm:text-base">
              {comment}
            </li>
          )) || "No Comments!"}
        </ul>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === "en" ? "Strengths" : "Fortalezas"}
          </h4>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData?.strengths?.map((strength, index) => (
              <li key={index} className="text-sm sm:text-base">
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {language === "en" ? "Weaknesses" : "Debilidades"}
          </h4>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData?.weaknesses?.map((weakness, index) => (
              <li key={index} className="text-sm sm:text-base">
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {language === "en" ? "Recommendations" : "Recomendaciones"}
        </h4>
        <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
          {resultData?.recommendations?.map((recommendation, index) => (
            <li key={index} className="text-sm sm:text-base">
              {recommendation}
            </li>
          )) || "No Recommendations!"}
        </ul>
      </Card>

      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {language === "en" ? "Judge Comments" : "Comentarios del Juez"}
        </h4>
        <ul className="text-sm sm:text-base">
          {Object.entries(resultData.generalComments)
            .filter(([_, comment]) => !!comment && comment.trim() !== "")
            .map(([judge, comment], index) => (
              <li key={index} className="text-sm sm:text-base">
                <strong>{judge.replace("judge", "")}:</strong> {comment}
              </li>
            ))}
        </ul>
      </Card>

      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {language === "en" ? "Time Analysis" : "Análisis de Tiempo"}
        </h4>
        {!!resultData.courseTime ? (
          <p className="text-sm sm:text-base mb-2">
            {language === "en" ? "Course Time:" : "Tiempo del Curso:"}{" "}
            <span className="font-medium">{resultData.courseTime}</span>
          </p>
        ) : (
          <p className="text-sm sm:text-base mb-2">
            {language === "en" ? "Course Time:" : "Tiempo del Curso:"}{" "}
            <span>-</span>
          </p>
        )}
        {!!resultData.optimumTime ? (
          <p className="text-sm sm:text-base mb-2">
            {language === "en" ? "Optimum Time:" : "Tiempo Óptimo:"}{" "}
            <span className="font-medium">{resultData.optimumTime}</span>
          </p>
        ) : (
          <p className="text-sm sm:text-base mb-2">
            {language === "en" ? "Optimum Time:" : "Tiempo Óptimo:"}{" "}
            <span>-</span>
          </p>
        )}
        {!!resultData.timePenalties ? (
          <p className="text-sm sm:text-base">
            {language === "en"
              ? "Time Penalties:"
              : "Penalizaciones de Tiempo:"}{" "}
            <span className="font-medium">{resultData.timePenalties}</span>
          </p>
        ) : (
          <p className="text-sm sm:text-base">
            {language === "en"
              ? "Time Penalties:"
              : "Penalizaciones de Tiempo:"}{" "}
            -
          </p>
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3">
          {language === "en" ? "Total Faults" : "Faltas Totales"}
        </h4>
        <p className="text-xl font-bold">{resultData?.totalFaults || 0}</p>
      </Card>

      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3">
          {language === "en" ? "Placing" : "Colocación"}
        </h4>
        <p className="text-xl font-bold">{resultData?.placing || "-"}</p>
      </Card>

      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {language === "en" ? "Jump Types" : "Tipos de Salto"}
        </h4>
        <div className="flex flex-wrap gap-2">
          {resultData?.jumpTypes?.map((type, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-sm bg-blue-50 text-blue-700 border-blue-200"
            >
              {type}
            </Badge>
          ))}
        </div>
      </Card>
      <Card className="p-4 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {language === "en" ? "Common Errors" : "Errores Comunes"}
        </h4>
        <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
          {resultData?.commonErrors?.map((error, index) => (
            <li key={index} className="text-sm sm:text-base">
              {error}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default DocumentAnalysisDisplay;
