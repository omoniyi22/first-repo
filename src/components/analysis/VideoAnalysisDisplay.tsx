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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RiWhatsappFill } from "react-icons/ri";

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

interface VideoAnalysisDisplayProps {
  videoId?: string;
}

const PYTHON_API_URL =
  import.meta.env.VITE_PYTHON_API_URL || "https://api.equineaintelligence.com";

// =========================
// Main Component
// =========================

const VideoAnalysisDisplay: React.FC<VideoAnalysisDisplayProps> = ({
  videoId,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const documentId = videoId || searchParams.get("document_id");

  // State
  const [analysis, setAnalysis] = useState<VideoAnalysisData | null>(null);
  const [reportContent, setReportContent] = useState<ReportContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Jump marking state
  const [successfulJumps, setSuccessfulJumps] = useState<JumpMark[]>([]);
  const [failedJumps, setFailedJumps] = useState<JumpMark[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // =========================
  // Fetch Analysis Data
  // =========================

  const fetchAnalysis = async () => {
    if (!user || !documentId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("document_analysis")
        .select("*")
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        // console.log("📊 Fetched analysis data:", data);
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

  // =========================
  // Polling for Status Updates
  // =========================

  useEffect(() => {
    fetchAnalysis();

    // Set up polling if not completed
    if (analysis?.status && !["completed", "error"].includes(analysis.status)) {
      pollIntervalRef.current = setInterval(() => {
        console.log("🔄 Polling for status update...");
        fetchAnalysis();
      }, 60000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [documentId, user]);

  // Stop polling when completed
  useEffect(() => {
    if (analysis?.status === "completed" || analysis?.status === "error") {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
  }, [analysis?.status]);

  // =========================
  // Jump Marking Functions
  // =========================

  const markJump = (type: "successful" | "failed") => {
    const videoElement = document.querySelector("video");
    if (!videoElement) {
      toast.error("Please wait for video to load");
      return;
    }

    const currentTime = videoElement.currentTime;
    const fps = 30;
    const frameNumber = Math.round(currentTime * fps);

    const jump: JumpMark = {
      timestamp: currentTime,
      jump_type: type,
      frame_number: frameNumber,
    };

    if (type === "successful") {
      setSuccessfulJumps([...successfulJumps, jump]);
      toast.success("Successful jump marked!", {
        description: `At ${formatTime(currentTime)}`,
      });
    } else {
      setFailedJumps([...failedJumps, jump]);
      toast.error("❌ Failed jump marked", {
        description: `At ${formatTime(currentTime)}`,
      });
    }
  };

  const removeJump = (index: number, type: "successful" | "failed") => {
    if (type === "successful") {
      setSuccessfulJumps(successfulJumps.filter((_, i) => i !== index));
    } else {
      setFailedJumps(failedJumps.filter((_, i) => i !== index));
    }
    toast.info("Jump removed");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, "0")}`;
  };

  // =========================
  // Generate Report
  // =========================

  const generateReport = async () => {
    if (!analysis?.python_video_id || !documentId) return;

    const totalJumps = successfulJumps.length + failedJumps.length;
    if (totalJumps === 0) {
      toast.error("Please mark at least one jump");
      return;
    }

    setIsGeneratingReport(true);
    toast.info("🤖 Starting AI analysis...");

    try {
      const response = await fetch(`${PYTHON_API_URL}/api/analyze-jumps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: analysis.python_video_id,
          successful_jumps: successfulJumps,
          failed_jumps: failedJumps,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const reportData = await response.json();

      const { error: insertError } = await supabase
        .from("analysis_results")
        .insert({
          document_id: documentId,
          result_json: {
            ...reportData.report_content,
            processed_video_url: reportData.processed_video_url,
          },
        });

      if (insertError) throw insertError;

      toast.success("Report generated successfully!");

      // Refresh to show report
      await fetchAnalysis();
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

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

  if (error || !analysis) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error ||
              (language === "en" ? "Video not found" : "Video no encontrado")}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            {language === "en" ? "Back to Dashboard" : "Volver al Dashboard"}
          </Button>
        </div>
      </Card>
    );
  }

  // =========================
  // STATUS: PENDING / PROCESSING
  // =========================

  if (analysis.status === "pending" || analysis.status === "processing") {
    const progress = analysis.processing_progress || 0;
    const message =
      analysis.processing_message ||
      (language === "en" ? "Processing..." : "Procesando...");

    const getEstimatedTime = (progress: number) => {
      if (progress === 0)
        return language === "en" ? "Calculating..." : "Calculando...";
      if (progress < 10)
        return language === "en" ? "3-5 minutes" : "3-5 minutos";
      if (progress < 50)
        return language === "en" ? "2-3 minutes" : "2-3 minutos";
      if (progress < 80)
        return language === "en" ? "1-2 minutes" : "1-2 minutos";
      return language === "en" ? "Less than 1 minute" : "Menos de 1 minuto";
    };

    console.log("📊 Rendering progress UI:", {
      progress,
      message,
      status: analysis.status,
    });

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 border-0 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32" />

          <div className="relative p-8 md:p-12 space-y-8">
            <div className="flex flex-col-reverse md:flex-row items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Zap className="h-4 w-4 md:h-8 md:w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                      {language === "en"
                        ? "🎬 AI Processing Your Video"
                        : "🎬 IA Procesando Tu Video"}
                    </h3>
                    <p className="text-blue-100 text-sm sm:text-lg">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <Loader2 className="h-10 w-10 animate-spin text-white flex-shrink-0" />
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-7xl font-bold text-white mb-2">
                  {Math.round(progress)}%
                </div>
                <p className="text-white/80 text-lg">
                  {language === "en"
                    ? "Processing Frames"
                    : "Procesando Fotogramas"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {language === "en"
                        ? "Estimated Time:"
                        : "Tiempo Estimado:"}
                    </span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm font-semibold">
                      {getEstimatedTime(progress)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      {language === "en" ? "Processing..." : "Procesando..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
              <div
                className={`text-center p-4 rounded-lg ${
                  progress >= 10 ? "bg-white/20" : "bg-white/5"
                } transition-all`}
              >
                <div
                  className={`text-2xl mb-2 ${
                    progress >= 10 ? "" : "opacity-30"
                  }`}
                >
                  {progress >= 10 ? "✓" : "1"}
                </div>
                <p
                  className={`text-sm ${
                    progress >= 10
                      ? "text-white font-semibold"
                      : "text-white/60"
                  }`}
                >
                  {language === "en" ? "Loading Model" : "Cargando Modelo"}
                </p>
              </div>

              <div
                className={`text-center p-4 rounded-lg ${
                  progress >= 50 ? "bg-white/20" : "bg-white/5"
                } transition-all`}
              >
                <div
                  className={`text-2xl mb-2 ${
                    progress >= 50 ? "" : "opacity-30"
                  }`}
                >
                  {progress >= 50 ? "✓" : "2"}
                </div>
                <p
                  className={`text-sm ${
                    progress >= 50
                      ? "text-white font-semibold"
                      : "text-white/60"
                  }`}
                >
                  {language === "en"
                    ? "Analyzing Frames"
                    : "Analizando Fotogramas"}
                </p>
              </div>

              <div
                className={`text-center p-4 rounded-lg ${
                  progress >= 95 ? "bg-white/20" : "bg-white/5"
                } transition-all`}
              >
                <div
                  className={`text-2xl mb-2 ${
                    progress >= 95 ? "" : "opacity-30"
                  }`}
                >
                  {progress >= 95 ? "✓" : "3"}
                </div>
                <p
                  className={`text-sm ${
                    progress >= 95
                      ? "text-white font-semibold"
                      : "text-white/60"
                  }`}
                >
                  {language === "en" ? "Finalizing" : "Finalizando"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/90 text-sm bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">
                  {language === "en"
                    ? "What's Happening?"
                    : "¿Qué Está Pasando?"}
                </p>
                <p className="text-white/70">
                  {language === "en"
                    ? "Our AI is analyzing each frame to detect horse movements, posture, and biomechanics."
                    : "Nuestra IA está analizando cada fotograma para detectar movimientos, postura y biomecánica del caballo."}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <PlayCircle className="h-6 w-6 text-purple-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">
                {analysis.file_name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">
                    {language === "en" ? "Horse" : "Caballo"}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {analysis.horse_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">
                    {language === "en" ? "Type" : "Tipo"}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {analysis.video_type === "training"
                      ? language === "en"
                        ? "Training"
                        : "Entrenamiento"
                      : language === "en"
                      ? "Competition"
                      : "Competición"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">
                    {language === "en" ? "Date" : "Fecha"}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(analysis.document_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">
                    {language === "en" ? "Level" : "Nivel"}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {analysis.test_level || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">
                {language === "en"
                  ? "While You Wait..."
                  : "Mientras Esperas..."}
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    {language === "en"
                      ? "Feel free to leave this page - processing continues in the background"
                      : "Puedes dejar esta página - el procesamiento continúa"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    {language === "en"
                      ? "You'll be able to mark jumps once processing is complete"
                      : "Podrás marcar saltos una vez complete el procesamiento"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>
                    {language === "en"
                      ? "The AI analyzes biomechanics and movement patterns"
                      : "La IA analiza biomecánica y patrones de movimiento"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // =========================
  // STATUS: PROCESSED (Mark Jumps)
  // =========================

  if (analysis.status === "processed") {
    const totalMarked = successfulJumps.length + failedJumps.length;
    const processedVideoUrl = `/processed/${analysis.python_video_id}_processed.mp4`;

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Card className="overflow-hidden border-2 border-green-200 shadow-xl">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b-2 border-green-200">
            <div className="flex items-start  gap-3">
              <div className="p-2 bg-green-600 rounded-lg ">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {language === "en"
                    ? "Processing Complete!"
                    : "¡Procesamiento Completo!"}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {language === "en"
                    ? "Review the video and mark each jump"
                    : "Revisa el video y marca cada salto"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === "en"
                    ? "Mark Jumps in Real-Time"
                    : "Marca Saltos en Tiempo Real"}
                </h4>
              </div>
              <div
                className="relative bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-gray-200 max-w-[45vw] mx-auto"
                style={{ aspectRatio: "16/9" }}
              >
                <video
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                >
                  <source
                    src={`${PYTHON_API_URL}${processedVideoUrl}`}
                    type="video/mp4"
                  />
                </video>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <PlayCircle className="h-4 w-4" />
                <span>
                  {language === "en"
                    ? "Tip: Pause at each jump before marking"
                    : "Consejo: Pausa en cada salto antes de marcar"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => markJump("successful")}
                  className="max-h-20 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="hidden sm:block sm:h-7 sm:w-7 mr-1 sm:mr-2" />
                  {language === "en" ? "Successful" : "Exitoso"}
                </Button>
                <Button
                  onClick={() => markJump("failed")}
                  className="max-h-20 text-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  <XCircle className="hidden sm:block sm:h-7 sm:w-7 mr-1 sm:mr-2" />
                  {language === "en" ? "Failed" : "Fallido"}
                </Button>
              </div>

              {totalMarked > 0 && (
                <div className="flex items-center justify-center gap-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">
                      {successfulJumps.length}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold">{failedJumps.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {totalMarked > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">
              {language === "en" ? "Marked Jumps" : "Saltos Marcados"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">
                  Successful ({successfulJumps.length})
                </h4>
                <div className="space-y-2">
                  {successfulJumps.map((jump, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-50 p-3 rounded-lg"
                    >
                      <span className="font-mono text-sm">
                        {formatTime(jump.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJump(index, "successful")}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-700 mb-3">
                  Failed ({failedJumps.length})
                </h4>
                <div className="space-y-2">
                  {failedJumps.map((jump, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-red-50 p-3 rounded-lg"
                    >
                      <span className="font-mono text-sm">
                        {formatTime(jump.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJump(index, "failed")}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 border-0 shadow-2xl">
          <div className="relative p-5 md:p-12 text-center">
            <Sparkles className="h-16 w-16 text-white mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-3">
              {language === "en"
                ? "Ready for AI Analysis?"
                : "¿Listo para el Análisis IA?"}
            </h3>
            <p className="text-white/90 text-lg mb-8">
              {language === "en"
                ? `You've marked ${totalMarked} jump${
                    totalMarked !== 1 ? "s" : ""
                  }`
                : `Has marcado ${totalMarked} salto${
                    totalMarked !== 1 ? "s" : ""
                  }`}
            </p>
            <Button
              onClick={generateReport}
              disabled={isGeneratingReport || totalMarked === 0}
              size="lg"
              className="bg-white text-purple-700 hover:bg-gray-100 px-5 md:px-12 py-6 text-xl font-bold"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  {language === "en" ? "Analyzing..." : "Analizando..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-3" />
                  {language === "en" ? "Generate Report" : "Generar Reporte"}
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================
  // STATUS: ANALYZING
  // =========================

  if (analysis.status === "analyzing") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
          <div className="relative p-8 md:p-16 text-center">
            <Loader2 className="h-10 w-10 md:h-16 md:w-16 animate-spin text-white mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-3">
              {language === "en"
                ? "🤖 AI Analyzing Your Performance"
                : "🤖 IA Analizando Tu Rendimiento"}
            </h3>
            <p className="text-white/90 text-lg">
              {language === "en"
                ? "Analyzing biomechanics and generating insights..."
                : "Analizando biomecánica y generando perspectivas..."}
            </p>
            <p className="text-white/70 text-sm mt-4">
              {language === "en"
                ? "This usually takes 20-30 seconds"
                : "Esto generalmente toma 20-30 segundos"}
            </p>
          </div>
        </Card>
      </div>
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
            <ul className="mb-4 list-disc pl-5">
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
        <Card className="w-full bg-gradient-to-r from-[#7658EB] to-[#3C78EB] text-white p-6 mt-6 flex items-center justify-between rounded-lg shadow-lg flex-col-reverse sm:flex-row gap-5 sm:gap-0">
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
        </Card>

        {/* WhatsApp Share Button */}

        <Card className="p-4 sm:p-6 border-0">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 mb-3 sm:mb-4">
            <Button
              className="bg-gradient-to-r from-[#3AD55A] to-[#00AE23] flex items-center"
              // onClick={handleWhatsAppShare}
            >
              {/* <MessageCircle className="h-10 w-10 text-white" /> */}
              <RiWhatsappFill className="!h-7 !w-7 text-white" size={50} />
              {language === "en"
                ? "Send Results to Coach"
                : "Compartir en WhatsApp"}
            </Button>

            {/* <Button
            className="bg-purple-600 hover:bg-purple-600 flex flex-col items-center p-8"
            onClick={async () => {
              await getPromptForTTS();
            }}
          >
            <CloudDownload className="!h-7 !w-7 text-white " />
            Get your personal ride along training class here
          </Button> */}

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

export default VideoAnalysisDisplay;
