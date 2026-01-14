import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  TrendingUp,
  Zap,
  Sparkles,
  PlayCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RiWhatsappFill } from "react-icons/ri";
import { useAnalysisLimit } from "@/hooks/useAnalysisLimit";

// =========================
// Interfaces
// =========================

interface VideoAnalysisData {
  id: string;
  user_id: string;
  horse_id: string;
  discipline: "dressage" | "jumping";
  video_type: string | null;
  document_url: string;
  file_name: string;
  file_type: string;
  document_date: string;
  status: string;
  processing_progress?: number;
  processing_message?: string;
  created_at: string;
  updated_at: string;
  python_video_id: string;
  test_level?: string;
  horse_name?: string;
}

interface JumpMark {
  timestamp: number;
  jump_type: "successful" | "failed";
  frame_number: number;
}

interface AIAnalysis {
  overall_assessment: string;
  key_findings: string[];
  biomechanical_analysis: {
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: string[];
  severity_level: string;
}

interface ReportContent {
  video_id: string;
  timestamp: string;

  personalised_insight: string;

  biomechanical_analysis: {
    rider_position_stability: string[];
    horse_takeoff_analysis: string[];
    landing_form: string[];
    jump_approach: string[];
  };

  jump_by_jump: Array<{
    jump_number: number;
    result: "Clear" | "Fault";
    technical_insight: string;
    biomechanical_data: string;
  }>;

  pattern_recognition: string[];

  personalized_training: string[];

  course_stats: {
    total_jumps: number;
    average_height: string;
    points_lost: number;
    clear_rate: string;
  };

  metadata: {
    has_angle_data: boolean;
    representative_frames_used: boolean;
  };
}

interface VideoAnalysisPublicDisplayProps {
  videoId?: string;
}

const PYTHON_API_URL =
  import.meta.env.VITE_PYTHON_API_URL || "https://api.equineaintelligence.com";

// =========================
// Main Component
// =========================

const VideoAnalysisPublicDisplay: React.FC<VideoAnalysisPublicDisplayProps> = ({
  videoId,
}) => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const documentId = videoId || searchParams.get("document_id");

  // State
  const [analysis, setAnalysis] = useState<VideoAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<ReportContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // =========================
  // Fetch Analysis Data
  // =========================

  const fetchAnalysis = async () => {
    if (!documentId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("document_analysis")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) throw error;

      if (data) {
        setAnalysis(data as VideoAnalysisData);

        // If completed, fetch report
        if (data.status === "completed") {
          const { data: resultData, error: resultError } = await supabase
            .from("analysis_results")
            .select("result_json")
            .eq("document_id", documentId)
            .single();

          if (!resultError && resultData?.result_json) {
            setReportContent(resultData.result_json as ReportContent);
          }
        }
      } else {
        setError(language === "en" ? "Video not found" : "Video no encontrado");
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching analysis:", err);
      setError(err.message || "Failed to load analysis");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [documentId]);

  // =========================
  // Render Functions
  // =========================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">
          {language === "en" ? "Loading..." : "Cargando..."}
        </span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {language === "en" ? "Video not found" : "Video no encontrado"}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            {language === "en" ? "Back to Dashboard" : "Volver al Dashboard"}
          </Button>
        </div>
      </Card>
    );
  }

  // =========================
  // STATUS: COMPLETED (Show Report)
  // =========================

  if (analysis.status === "completed" && reportContent) {
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7658EB] to-[#3C78EB] p-6 text-white shadow-lg w-full h-full">
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-lg font-medium opacity-90 mb-8">
                {language === "en" ? "Course Stats" : "Estadísticas del curso"}
              </h3>
              <p className="text-base text-white mt-auto">
                {reportContent.course_stats.total_jumps} Jumps Total | Average
                Height: {reportContent.course_stats.average_height}
              </p>
            </div>
          </div>

          {/* Highest Score Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7658EB] to-[#3C78EB] p-6 text-white shadow-lg">
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-lg font-medium opacity-90 mb-8">
                {language === "en" ? "Points System" : "Estadísticas del curso"}
              </h3>
              <p className="text-base text-white mt-auto">
                {reportContent.course_stats.points_lost} Points
              </p>
            </div>
          </div>

          {/* Lowest Score Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5E92FA] to-[#3C77EC] p-6 text-white shadow-lg">
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-lg font-medium opacity-90 mb-8">
                {language === "en" ? "Clear Rate" : "Estadísticas del curso"}
              </h3>
              <p className="text-base text-white mt-auto">
                {reportContent.course_stats.clear_rate}
              </p>
            </div>
          </div>
        </div>

        {/* Personalised Insight */}
        <Card className="p-4 sm:p-6  bg-gradient-to-r from-[#7658EB] to-[#3C78EB]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold text-white">
              {language === "en"
                ? "Personalised Insight"
                : "Perspectiva personalizada"}
            </h4>

            <img
              src="/lovable-uploads/transpareant-logo.png"
              alt="Horse and rider jumping over competition obstacle"
              className="w-12 h-12 object-cover object-center"
            />
          </div>
          <div className="max-w-[900px]">
            <p className="text-white text-base">
              {reportContent.personalised_insight}
            </p>
          </div>
        </Card>

        {/* Biomechanical Analysis */}
        <Card className="p-4 sm:p-6 ">
          <div className="flex items-center justify-between mb-3 sm:mb-4 ">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en"
                ? "Biomechanical Analysis"
                : "Análisis biomecánico"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] backdrop-blur-sm">
              <img src="/icon/search-document-icon.svg" alt="" />
            </div>
          </div>
          <div className="w-full bg-[#F1F5F9] rounded-lg p-6">
            <h3 className="text-lg font-semibold">Rider Position Stability</h3>
            <ul className="mb-4 list-disc pl-5">
              {reportContent.biomechanical_analysis.rider_position_stability.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>
            <h3 className="text-lg font-semibold">Horse Takeoff Analysis</h3>
            <ul className="mb-4 list-disc pl-5">
              {reportContent.biomechanical_analysis.horse_takeoff_analysis.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>
            <h3 className="text-lg font-semibold">Landing Form</h3>
            <ul className="mb-4 list-disc pl-5">
              {reportContent.biomechanical_analysis.landing_form.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>
            <h3 className="text-lg font-semibold">Jumps Approach</h3>
            <ul className="mb-4 list-disc pl-5">
              {reportContent.biomechanical_analysis.jump_approach.map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>
          </div>
        </Card>

        {/* Jump by jump Analysis */}
        <Card className="my-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-[#f1f5f9]">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700 font-bold">
                    {language === "en" ? "Individual Jump Analysis" : "Salto #"}
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700 font-bold">
                    {language === "en" ? "Result Badge" : "Tipo"}
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700 font-bold">
                    {language === "en" ? "Technical Insight" : "Resultado"}
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700 font-bold">
                    {language === "en" ? "Biomechanical Data" : "Resultado"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportContent.jump_by_jump.map((jump, index) => (
                  <tr key={index} className="border-none border-gray-200">
                    <td className="px-4 py-2 text-sm border border-gray-200 capitalize">
                      Jump {jump.jump_number}
                    </td>
                    <td className="px-4 py-2 text-sm border border-gray-200 uppercase">
                      {jump.result}
                    </td>
                    <td className="px-4 py-2 text-sm border border-gray-200 capitalize">
                      {jump.technical_insight}
                    </td>
                    <td className="px-4 py-2 text-sm border border-gray-200 capitalize">
                      {jump.biomechanical_data}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pattern Recognition */}
        <Card className="p-4 sm:p-6 ">
          <div className="flex items-center justify-between mb-3 sm:mb-4 ">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en"
                ? "Pattern Recognition"
                : "Reconocimiento de patrones"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] backdrop-blur-sm">
              <img src="/icon/eye-icon.svg" alt="" />
            </div>
          </div>
          <div className="w-full p-6">
            <ul className="mb-4 list-disc pl-5">
              {reportContent.pattern_recognition.map((item, index) => {
                const parts = item.split(/[:\-]/);
                const label = parts[0].trim();
                const value = item.replace(parts[0], "").trim();

                return (
                  <li key={index}>
                    <b>{label}</b> {value}
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>

        {/* Personalised Training */}
        <Card className="p-4 sm:p-6 ">
          <div className="flex items-center justify-between mb-3 sm:mb-4 ">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en"
                ? "Personalised Training"
                : "Entrenamiento personalizado"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] backdrop-blur-sm">
              <img src="/icon/space-shuttle-icon.svg" alt="" />
            </div>
          </div>
          <Card className="w-full p-6 bg-[#F1F5F9]">
            <ul className="list-disc pl-5">
              {reportContent.personalized_training.map((item, index) => {
                const parts = item.split(/[:\-]/);
                const label = parts[0].trim();
                const value = item.replace(parts[0], "").trim();

                return (
                  <li key={index}>
                    <b>{label}</b> {value}
                  </li>
                );
              })}
              {/* <li>
                <b>This Week's Focus:</b>
                Practice grid work - 4 bounces to improve rhythm
              </li>
              <li>
                <b>Biomechanical Goal:</b> Increase takeoff impulsion - front
                leg extension needs 21
              </li>
              <li>
                <b>Next Session Plan:</b> Work on approach consistency with
                ground pole exercises
              </li> */}
            </ul>
          </Card>
        </Card>

        {/* Want more guidance? */}
        {/* <Card className="w-full bg-gradient-to-r from-[#7658EB] to-[#3C78EB] text-white p-6 mt-6 flex items-center justify-between rounded-lg shadow-lg flex-col-reverse sm:flex-row gap-5 sm:gap-0">
          <div className="">
            <h2 className="text-xl font-medium">
              Based on today's analysis, we've created a 20-minute
              <br />
              exercise routine focusing on approach rhythm
            </h2>
            <Button
              className="bg-white text-[#2C1A5C] h-auto hover:bg-white mt-4 text-wrap"
              onClick={async () => {
                // await getPromptForTTS();
              }}
            >
              {language === "en"
                ? "Get Your Ride-Along Podcast"
                : "Obtén tu podcast Ride-Along"}
            </Button>
          </div>
          <div className="relative z-10 w-40 h-40 rounded-full bg-[#3f77eb]/20 backdrop-blur-sm flex items-center justify-center">
            <img
              src={"/lovable-uploads/report-cta.png"}
              alt="Horse and rider jumping over competition obstacle"
              className="w-full h-full object-cover object-center rounded-full"
            />
          </div>
        </Card> */}

        {/* WhatsApp Share Button */}

        <Card className="p-4 sm:p-6 border-0">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 mb-3 sm:mb-4">
            <Button
              className="bg-gradient-to-r from-[#3AD55A] to-[#00AE23] flex items-center"
              disabled
            >
              <RiWhatsappFill className="!h-7 !w-7 text-white" size={50} />
              {language === "en"
                ? "Send Results to Coach"
                : "Compartir en WhatsApp"}
            </Button>

            <div className="space-x-2 flex items-center">
              <p className="text-center">
                {language === "en" ? "Powered by" : "Desarrollado por"}
              </p>
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
  }

  // =========================
  // STATUS: ERROR
  // =========================

  return (
    <Card className="p-6 bg-white">
      <div className="text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium mb-2">
            {language === "en" ? "Analysis Failed" : "Análisis Fallido"}
          </h3>
          <p>
            {language === "en"
              ? "Something went wrong. Please try again."
              : "Algo salió mal. Por favor intenta de nuevo."}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default VideoAnalysisPublicDisplay;
