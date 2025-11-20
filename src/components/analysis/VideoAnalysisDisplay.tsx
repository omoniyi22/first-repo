import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertCircle,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RiWhatsappFill } from "react-icons/ri";

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
  created_at: string;
  updated_at: string;
  tags?: string[];
  notes: string | null;
  horse_name?: string;
}

// Report Structure (JSON format)
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
  statistics: {
    successful_jumps_count: number;
    failed_jumps_count: number;
    success_rate: number;
    successful_timestamps: number[];
    failed_timestamps: number[];
  };
  biomechanical_summary: string;
  ai_analysis: AIAnalysis;
  metadata: {
    has_angle_data: boolean;
    representative_frames_used: boolean;
  };
  processed_video_url?: string;
}

interface VideoAnalysisDisplayProps {
  videoId?: string;
}

const VideoAnalysisDisplay: React.FC<VideoAnalysisDisplayProps> = ({
  videoId,
}) => {
  const { user } = useAuth();
  const { language, translations } = useLanguage();
  const t = translations[language];

  const [analysis, setAnalysis] = useState<VideoAnalysisData | null>(null);
  const [reportContent, setReportContent] = useState<ReportContent | null>(
    null
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !videoId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch the video analysis data from Supabase
        const { data, error } = await supabase
          .from("document_analysis")
          .select("*")
          .eq("id", videoId)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          console.log("Retrieved video data:", data);
          setAnalysis(data as VideoAnalysisData);

          if (data.status === "completed") {
            const { data: resultData, error: resultError } = await supabase
              .from("analysis_results")
              .select("result_json")
              .eq("document_id", videoId)
              .single();

            if (resultError) {
              console.error("Error fetching results:", resultError);
              toast.error(
                language === "en"
                  ? "Failed to load analysis results"
                  : "Error al cargar resultados"
              );
            } else if (resultData?.result_json) {
              console.log("✅ Report data loaded:", resultData.result_json);

              // result_json contains the structured report (en/es)
              setReportContent(resultData.result_json as ReportContent);

              // Get processed video URL (if available - might be deleted after report)
              if (resultData.result_json?.processed_video_url) {
                const PYTHON_API_URL =
                  import.meta.env.VITE_PYTHON_API_URL ||
                  "https://api.equineaintelligence.com";
                const videoUrl = `${PYTHON_API_URL}${resultData.result_json.processed_video_url}`;
                console.log("📹 Processed video URL:", videoUrl);
                setDecodedUrl(videoUrl);
              } else {
                console.log(
                  "ℹ️ No processed video URL (video may have been cleaned up)"
                );
              }
            }
          }
        } else {
          setError(
            language === "en" ? "Video not found" : "Video no encontrado"
          );
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching analysis:", err);
        setError(
          err.message ||
            (language === "en"
              ? "An error occurred while fetching the video analysis."
              : "Ocurrió un error al obtener el análisis de video.")
        );
        setIsLoading(false);
        toast.error(
          language === "en"
            ? "Failed to load video analysis"
            : "No se pudo cargar el análisis de video"
        );
      }
    };

    fetchAnalysis();
  }, [videoId, user?.id, language]);

  // Video player controls
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setVideoError(false);
          })
          .catch((error) => {
            console.error("Video playback failed:", error);
            setIsPlaying(false);
            setVideoError(true);
            toast.error(
              language === "en"
                ? "Failed to play video. The format might not be supported."
                : "No se pudo reproducir el video. El formato puede no ser compatible."
            );
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      console.log(
        "Video metadata loaded, duration:",
        videoRef.current.duration
      );
      setDuration(videoRef.current.duration);
      setVideoError(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("Video error event:", e);
    setVideoError(true);
    setIsPlaying(false);
    toast.error(
      language === "en"
        ? "Failed to load video. The format might not be supported or the URL is invalid."
        : "No se pudo cargar el video. El formato puede no ser compatible o la URL no es válida."
    );
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 5
      );
    }
  };

  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        duration,
        videoRef.current.currentTime + 5
      );
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="sticky w-full h-screen flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">
          {language === "en"
            ? "Loading video analysis..."
            : "Cargando análisis de video..."}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => setError(null)}>
            {language === "en" ? "Try Again" : "Intentar de nuevo"}
          </Button>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {language === "en"
            ? "No video analysis data available"
            : "No hay datos de análisis de video disponibles"}
        </div>
      </Card>
    );
  }

  if (analysis.status === "pending" || analysis.status === "processing") {
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
              ? "Processing Video"
              : "Procesando Video"}
          </h3>
          <p className="text-gray-500">
            {analysis.status === "pending"
              ? language === "en"
                ? "Your video is in queue for analysis."
                : "Tu video está en cola para análisis."
              : language === "en"
              ? "We're analyzing your video. This may take several minutes."
              : "Estamos analizando tu video. Esto puede tomar varios minutos."}
          </p>
        </div>
      </Card>
    );
  }

  if (analysis.status === "error") {
    return (
      <Card className="p-6 bg-white">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">
              {language === "en" ? "Analysis Failed" : "Análisis Fallido"}
            </h3>
            <p>
              {language === "en"
                ? "We couldn't analyze this video. Please try uploading it again or contact support if the problem persists."
                : "No pudimos analizar este video. Intenta subirlo de nuevo o contacta a soporte si el problema persiste."}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Use the structured JSON report
  return (
    <Card className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Video Player - FIXED SIZE */}
      {/* <Card className="p-6 bg-white">
        <div className="mb-6">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative bg-black overflow-hidden rounded-lg"
              style={{ aspectRatio: "16/9" }}
            >
              {videoError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 bg-opacity-80 p-4">
                  <AlertCircle className="h-12 w-12 mb-2 text-red-400" />
                  <p className="text-center mb-4">
                    {language === "en"
                      ? "There was a problem playing this video."
                      : "Hubo un problema al reproducir este video."}
                  </p>
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-gray-900"
                    onClick={() => {
                      setVideoError(false);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                  >
                    {language === "en" ? "Try Again" : "Intentar de nuevo"}
                  </Button>
                </div>
              ) : null}

              <video
                ref={videoRef}
                src={decodedUrl || analysis.document_url}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                preload="metadata"
                playsInline
                controls={false}
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="mt-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                {formatTime(currentTime)}
              </span>
              <span className="text-sm text-gray-500">
                {formatTime(duration)}
              </span>
            </div>

            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSliderChange}
              className="mb-4"
              disabled={videoError}
            />

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={seekBackward}
                aria-label="Skip backward 5 seconds"
                disabled={videoError}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
                disabled={videoError}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={seekForward}
                aria-label="Skip forward 5 seconds"
                disabled={videoError}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card> */}

      {/* Analysis Results Header */}
      <div className="text-start">
        <h2 className="text-xl font-semibold">
          {language === "en" ? "Analysis Results" : "Resultados del análisis"}
        </h2>
      </div>

      {/* Statistics Cards - Using JSON data */}
      {reportContent?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Course Stats */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7658EB] to-[#3C78EB] p-6 text-white shadow-lg">
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-lg font-medium opacity-90 mb-8">
                {language === "en" ? "Course Stats" : "Estadísticas del curso"}
              </h3>
              <p className="text-base text-white mt-auto">
                {reportContent.statistics.successful_jumps_count +
                  reportContent.statistics.failed_jumps_count}{" "}
                Jumps Total
              </p>
            </div>
          </div>

          {/* Points System */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7658EB] to-[#3C78EB] p-6 text-white shadow-lg">
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-lg font-medium opacity-90 mb-8">
                {language === "en" ? "Points System" : "Sistema de Puntos"}
              </h3>
              <p className="text-base text-white mt-auto">
                {reportContent.statistics.failed_jumps_count * 4} Points Lost
              </p>
            </div>
          </div>

          {/* Clear Rate */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5E92FA] to-[#3C77EC] p-6 text-white shadow-lg">
            <div className="w-full h-full flex flex-col justify-between">
              <h3 className="text-lg font-medium opacity-90 mb-8">
                {language === "en" ? "Clear Rate" : "Tasa de Éxito"}
              </h3>
              <p className="text-base text-white mt-auto">
                {reportContent.statistics.successful_jumps_count}/
                {reportContent.statistics.successful_jumps_count +
                  reportContent.statistics.failed_jumps_count}{" "}
                Jumps Clear ({Math.round(reportContent.statistics.success_rate)}
                %)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis - Overall Assessment */}
      {reportContent?.ai_analysis && (
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-[#7658EB] to-[#3C78EB]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold text-white">
              {language === "en" ? "AI Assessment" : "Evaluación IA"}
            </h4>
            <img
              src="/lovable-uploads/transpareant-logo.png"
              alt="Logo"
              className="w-12 h-12 object-cover object-center"
            />
          </div>
          <div className="max-w-[900px]">
            <p className="text-white text-base">
              {reportContent.ai_analysis.overall_assessment}
            </p>
          </div>
        </Card>
      )}

      {/* Biomechanical Summary */}
      {reportContent?.biomechanical_summary && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en"
                ? "Biomechanical Analysis"
                : "Análisis biomecánico"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9]">
              <img src="/icon/Search-Document.svg" alt="" />
            </div>
          </div>
          <div className="w-full bg-[#F1F5F9] rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-line">
              {reportContent.biomechanical_summary}
            </p>

            {/* Strengths */}
            {reportContent.ai_analysis.biomechanical_analysis.strengths.length >
              0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-green-700">
                  {language === "en" ? "Strengths" : "Fortalezas"}
                </h3>
                <ul className="list-disc pl-5 mt-2">
                  {reportContent.ai_analysis.biomechanical_analysis.strengths.map(
                    (strength, idx) => (
                      <li key={idx} className="text-gray-700">
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {reportContent.ai_analysis.biomechanical_analysis.weaknesses
              .length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-red-700">
                  {language === "en"
                    ? "Areas for Improvement"
                    : "Áreas de Mejora"}
                </h3>
                <ul className="list-disc pl-5 mt-2">
                  {reportContent.ai_analysis.biomechanical_analysis.weaknesses.map(
                    (weakness, idx) => (
                      <li key={idx} className="text-gray-700">
                        {weakness}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Key Findings */}
      {reportContent?.ai_analysis.key_findings && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en" ? "Key Findings" : "Hallazgos Clave"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9]">
              <img src="/icon/eye.svg" alt="" />
            </div>
          </div>
          <div className="w-full p-6">
            <ul className="list-disc pl-5 space-y-2">
              {reportContent.ai_analysis.key_findings.map((finding, idx) => (
                <li key={idx} className="text-gray-700">
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {reportContent?.ai_analysis.recommendations && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h4 className="text-lg sm:text-xl font-semibold">
              {language === "en"
                ? "Training Recommendations"
                : "Recomendaciones de Entrenamiento"}
            </h4>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9]">
              <img src="/icon/Space-Shuttle.svg" alt="" />
            </div>
          </div>
          <Card className="w-full p-6 bg-[#F1F5F9]">
            <ul className="list-disc pl-5 space-y-2">
              {reportContent.ai_analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="text-gray-700">
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        </Card>
      )}

      {/* CTA */}
      <Card className="w-full bg-gradient-to-r from-[#7658EB] to-[#3C78EB] text-white p-6 mt-6 flex items-center justify-between rounded-lg shadow-lg flex-col-reverse sm:flex-row gap-5 sm:gap-0">
        <div>
          <h2 className="text-xl font-medium">
            {language === "en"
              ? "Based on today's analysis, we've created personalized training recommendations"
              : "Basado en el análisis de hoy, hemos creado recomendaciones personalizadas"}
          </h2>
          <Button className="bg-white text-[#2C1A5C] h-auto hover:bg-white mt-4">
            {language === "en"
              ? "Get Your Training Plan"
              : "Obtén tu Plan de Entrenamiento"}
          </Button>
        </div>
        <div className="relative z-10 w-40 h-40 rounded-full bg-[#3f77eb]/20 backdrop-blur-sm flex items-center justify-center">
          <img
            src="/lovable-uploads/report-cta.png"
            alt="Training"
            className="w-full h-full object-cover object-center rounded-full"
          />
        </div>
      </Card>

      {/* WhatsApp Share */}
      <Card className="p-4 sm:p-6 border-0">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
          <Button className="bg-gradient-to-r from-[#3AD55A] to-[#00AE23] flex items-center">
            <RiWhatsappFill className="h-7 w-7 text-white mr-2" />
            {language === "en"
              ? "Send Results to Coach"
              : "Enviar a Entrenador"}
          </Button>

          <div className="space-x-2 flex items-center">
            <p className="text-center">
              {language === "en" ? "Powered by" : "Desarrollado por"}
            </p>
            <img
              src="/lovable-uploads/1000010999.png"
              alt="Logo"
              className="w-12 h-12 object-cover object-center"
            />
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default VideoAnalysisDisplay;
