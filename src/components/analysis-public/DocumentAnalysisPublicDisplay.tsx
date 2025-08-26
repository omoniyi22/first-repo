import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { RiWhatsappFill } from "react-icons/ri";
import {
  ArrowDown,
  CloudDownload,
  CloudUpload,
  FileText,
  Lightbulb,
  Loader2,
  LocateFixed,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  callPodcastScript,
  fill_Template_Make_Prompts,
  formatScriptWithStyles,
} from "@/utils/podcastUtils";
import {
  COLOR_LEGEND,
  COLOR_LEGEND_ES,
  diagramExtractor,
  IExercise,
} from "@/utils/diagramGenerator";

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
  en: {
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
    personalInsight?: string;
  };
  es: {
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
    personalInsight?: string;
  };
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

const DocumentAnalysisPublicDisplay: React.FC<DocumentAnalysisDisplayProps> = ({
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
      // Remove this line: if (!user) return;

      try {
        setIsLoading(true);

        // Fetch the document analysis from Supabase - remove user_id filter
        const { data: documentData, error: documentError } = await supabase
          .from("document_analysis")
          .select("*")
          .eq("id", documentId)
          .maybeSingle();

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

            if (resultError) {
              console.warn("Could not fetch analysis results:", resultError);
            } else if (resultData) {
              setResultData(
                resultData.result_json as unknown as AnalysisResultData
              );
            }
          } else {
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
  }, [documentId, language]);

  const diagrams = useMemo(() => {
    if (!!resultData) {
      return resultData[language]["weaknesses-svg"];
    } else {
      return [];
    }
  }, [resultData]);

  const handleWhatsAppShare = () => {
    const message = `📊 Check out my competition analysis report!

You can view it here: ${window.location.origin}/analysis/${documentId}

Let me know what you think!`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encodedMessage}`;

    window.open(url, "_blank");
  };

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
              {new Date(analysis.created_at).toLocaleString()}
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
    <Card className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Analysis Results */}
      <div className="text-start">
        <h2 className="text-xl font-semibold ">
          {language === "en" ? "Analysis Results" : "Resultados del análisis"}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7658EB] to-[#3C78EB] p-6 text-white shadow-lg">
          <div className="absolute top-4 right-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium opacity-90">
              {language === "en" ? "Total Score" : "Puntuación Total"}
            </h3>
            {resultData[language].percentage ? (
              <p className="text-4xl font-bold text-white">
                {resultData[language].percentage.toFixed(2)}%
              </p>
            ) : (
              <p className="text-lg text-white">
                {language === "en"
                  ? "Score not available"
                  : "Puntuación no disponible"}
              </p>
            )}
          </div>
        </div>

        {/* Highest Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#A38DFC] to-[#7658EB] p-6 text-white shadow-lg">
          <div className="absolute top-4 right-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-white" />
              {/* <img
                src="/TrendingUp.svg"
                className="h-6 w-6"
                alt=""
              /> */}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium opacity-90">
              {language === "en" ? "Highest Score" : "Puntuación más alta"}
            </h3>
            {resultData[language].percentage ? (
              <p className="text-4xl font-bold text-white">
                {language === "en"
                  ? resultData.en["highestScore"].score
                  : resultData.es["highestScore"].score}
              </p>
            ) : (
              <p className="text-lg text-white">
                {language === "en"
                  ? "Score not available"
                  : "Puntuación no disponible"}
              </p>
            )}
            <p className="text-white">at L Pirueta a la izquierda</p>
          </div>
        </div>

        {/* Lowest Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5E92FA] to-[#3C77EC] p-6 text-white shadow-lg">
          <div className="absolute top-4 right-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium opacity-90">
              {language === "en" ? "Lowest Score" : "Puntuación más baja"}
            </h3>
            {resultData[language].percentage ? (
              <p className="text-4xl font-bold text-white">
                {language === "en"
                  ? resultData.en["lowestScore"].score
                  : resultData.es["lowestScore"].score}
              </p>
            ) : (
              <p className="text-lg text-white">
                {language === "en"
                  ? "Score not available"
                  : "Puntuación no disponible"}
              </p>
            )}
            <p className="text-white">at A Doblar a lo largo</p>
          </div>
        </div>
      </div>
      {/* Judge Comments */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h4 className="text-lg sm:text-xl font-semibold">
            {language === "en" ? "Judge Comments" : "Comentarios del Juez"}
          </h4>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] backdrop-blur-sm">
            <User className="h-6 w-6 text-[#7658EB]" />
          </div>
        </div>
        <ul className="text-sm sm:text-base space-y-2">
          {Object.entries(resultData[language].generalComments)
            .filter(([_, comment]) => !!comment && comment.trim() !== "")
            .map(([judge, comment], index) => (
              <li
                key={index}
                className="text-sm sm:text-base bg-[#F1F5F9] p-5 rounded-[15px]"
              >
                <strong>{judge.replace("judge", "")}:</strong> {comment}
              </li>
            ))}
        </ul>
      </Card>

      {/* Personalised Insight */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h4 className="text-lg sm:text-xl font-semibold">
            {language === "en"
              ? "Personalised Insight"
              : "Perspectiva personalizada"}
          </h4>

          <img
            src="/lovable-uploads/1000010999.png"
            alt="Horse and rider jumping over competition obstacle"
            className="w-12 h-12 object-cover object-center"
          />
        </div>
        <div className="max-w-[900px]">
          <p>
            {language === "en"
              ? resultData.en["personalInsight"]
              : resultData.es["personalInsight"]}
          </p>
        </div>
      </Card>

      {resultData.en.scores && resultData.en.scores.length > 0 && (
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
                {resultData[language].scores.map((score, index) => (
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

      {resultData[language].faults &&
        resultData[language].faults.length > 0 && (
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
                  {resultData[language].faults.map((fault, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-3 text-sm">
                        {fault.jumpNumber || fault.jump || "-"}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {fault.faults || "-"}
                      </td>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 ">
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-[#A38DFC] to-[#7658EB] border-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold text-white">
              {language === "en" ? "Strengths" : "Fortalezas"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-[#6344CF]" />
            </div>
          </div>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData[language]?.strengths?.map((strength, index) => (
              <li key={index} className="text-sm sm:text-base text-white">
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-r from-[#5E92FA] to-[#3C77EC] border-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
              {language === "en" ? "Weaknesses" : "Debilidades"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white backdrop-blur-sm">
              <ArrowDown className="h-6 w-6 text-[#3C78EB]" />
            </div>
          </div>
          <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
            {resultData[language]?.weaknesses?.map((weakness, index) => (
              <li key={index} className="text-sm sm:text-base text-white">
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {resultData[language]["focusArea"] && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en"
                ? `Your Top Focus Area${
                    resultData[language]["focusArea"].length > 1 ? "s" : ""
                  } `
                : `Tus áreas principales `}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] backdrop-blur-sm">
              <LocateFixed className="h-6 w-6 text-[#7658EB]" />
            </div>
          </div>
          <ol className="pl-6">
            {resultData[language]["focusArea"].map((item, index) => (
              <li key={index} className="list-none font-semibold">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="!w-8 !h-8 flex justify-center items-center rounded-full bg-gradient-to-r from-[#7658EB] to-[#3C78EB] text-white">
                    {index + 1}
                  </span>
                  <p className="text-lg font-semibold py-2">{item.area}</p>
                </div>
                <ul className="pl-4">
                  <li className="list-disc py-1 font-normal">
                    <b>
                      {language === "en" ? "Quick Fix: " : "Solución rápida:"}
                    </b>
                    <span>{item.tip.quickFix}</span>
                  </li>
                  <li className="list-disc py-1 font-normal">
                    <b>{language === "en" ? "Exercise: " : "Ejercicio:"}</b>
                    <span>{item.tip.Exercise}</span>
                  </li>
                </ul>
              </li>
            ))}
          </ol>
        </Card>
      )}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-3 sm:mb-4">
          <h4 className="text-lg sm:text-xl font-semibold">
            {language === "en" ? "Recommendations" : "Recomendaciones"}
          </h4>
          <div className="mb-6 bg-white p-4 rounded shadow border">
            <h4 className="font-semibold text-gray-800 text-center mb-6">
              Key/Legend
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
              {Object.entries(
                language === "en" ? COLOR_LEGEND : COLOR_LEGEND_ES
              ).map(([label, color]) => (
                <div
                  key={label}
                  className="flex md:justify-center items-center space-x-2"
                >
                  <span
                    className="inline-block w-4 h-4 rounded-sm"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${color.from}, ${color.to})`,
                    }}
                  />

                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ul className="space-y-2 sm:space-y-5">
          {resultData[language]?.recommendations?.map(
            (recommendation, index) => (
              <li
                key={index}
                className="text-sm sm:text-base bg-[#f1f5f9] p-2 md:p-5 rounded-lg flex gap-2 md:gap-5"
              >
                <img
                  src="/lovable-uploads/1000010999.png"
                  alt="Horse and rider jumping over competition obstacle"
                  className="w-8 h-8 object-cover object-center"
                />
                <div className="flex flex-col lg:flex-row gap-8">
                  <div>
                    <b>{recommendation["exercise"]} </b> -{" "}
                    {recommendation["goal"]}
                    <br />
                    <b>
                      {language === "en" ? "To improve:" : "Para mejorar:"}
                    </b>{" "}
                    {recommendation["setup"]}
                    <br />
                    <b>{language === "en" ? "Method:" : ":"}</b>
                    <br />
                    <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
                      {recommendation["method"].map((method, key) => (
                        <li key={key}>{method}</li>
                      ))}
                    </ul>
                    <b>{language === "en" ? "Key Points:" : ":"}</b>
                    <br />
                    {recommendation["keyPoints"] &&
                    typeof recommendation["keyPoints"] == "string" ? (
                      <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
                        <li>{recommendation["keyPoints"]}</li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
                        {recommendation["keyPoints"].map((point, key) => (
                          <li key={key}>{point}</li>
                        ))}
                      </ul>
                    )}
                    <b>{language === "en" ? "Watch For:" : ":"}</b>{" "}
                    <span>{recommendation["watchFor"]}</span>
                    <br />
                    <b>{language === "en" ? "Goal:" : ":"}</b>{" "}
                    <span>{recommendation["goal"]}</span>
                    <br />
                    <b>{language === "en" ? "Quick Fix:" : ":"}</b>{" "}
                    <span>{recommendation["quickFix"]}</span>
                    <br />
                  </div>

                  <div
                    className="bg-white py-8 rounded-xl mx-auto"
                    style={{ maxWidth: "300px" }}
                  >
                    {diagramExtractor(recommendation as unknown as IExercise)}
                  </div>
                </div>
              </li>
            )
          ) || "No Recommendations!"}
        </ul>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xl font-semibold mb-4">
              Recommended Exercises
            </h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] backdrop-blur-sm">
              <ArrowDown className="h-6 w-6 text-[#7658EB]" />
            </div>
          </div>
          <div className="mb-6 bg-white p-4 rounded shadow border">
            <h4 className="font-semibold text-gray-800 text-center mb-6">
              GAITS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
              {Object.entries(COLOR_LEGEND).map(([label, color]) => (
                <div
                  key={label}
                  className="flex md:justify-center items-center space-x-2"
                >
                  <span
                    className="inline-block w-4 h-4 rounded-sm"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${color.from}, ${color.to})`,
                    }}
                  />

                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="w-full bg-gradient-to-r from-[#7658EB] to-[#3C78EB] text-white p-6 mt-6 flex items-center justify-between rounded-lg shadow-lg flex-col-reverse sm:flex-row gap-5 sm:gap-0">
            <div className="">
              <h2 className="text-xl font-medium">
                Want more guidance?
                <br />
                Download the RideAlong Podcast and ride with us.
              </h2>
              <Button
                className="bg-white text-[#2C1A5C] hover:bg-white mt-4"
                disabled
              >
                {language === "en"
                  ? "Download Now – Your Personal Training Session"
                  : "Descarga ahora: Tu sesión de entrenamiento personal"}
              </Button>
            </div>
            <div className="relative w-36 h-36 rounded-full overflow-hidden flex items-center justify-center">
              <div className="relative z-10 w-40 h-40 rounded-full bg-[#3f77eb]/20 backdrop-blur-sm flex items-center justify-center">
                <img
                  src={"/lovable-uploads/report-cta.png"}
                  alt="Horse and rider jumping over competition obstacle"
                  className="w-full h-full object-cover object-center rounded-full"
                />
              </div>
            </div>
          </Card>
        </div>
      </Card>
      <Card className="p-4 sm:p-6 border-0">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 mb-3 sm:mb-4">
          <Button
            className="bg-gradient-to-r from-[#3AD55A] to-[#00AE23] flex items-center"
            disabled={!user}
            onClick={handleWhatsAppShare}
          >
            <RiWhatsappFill className="!h-7 !w-7 text-white" size={50} />
            Send Results to Coach
          </Button>

          <div className="space-x-2 flex items-center">
            <p className="text-center">Powered by</p>
            <img
              src="/lovable-uploads/1000010999.png"
              alt="Horse and rider jumping over competition obstacle"
              className="w-12 h-12 object-cover object-center"
            />
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default DocumentAnalysisPublicDisplay;
