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
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  console.log("🚀 ~ VideoAnalysisDisplay ~ decodedUrl:", decodedUrl);

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

        if (error) {
          throw error;
        }

        if (data) {
          console.log("Retrieved video data:", data);
          setAnalysis(data as VideoAnalysisData);
          if (data.status === "completed") {
            const { data: resultData, error: resultError } = await supabase
              .from("analysis_results")
              .select("result_json")
              .eq("document_id", videoId)
              .single();

            console.log("🚀 ~ fetchAnalysis ~ resultData:", resultData);
            setAnalysisResult(resultData.result_json);
            // Properly decode the URL to ensure it works correctly
            if (resultData.result_json?.processed_video_url) {
              const PYTHON_API_URL =
                import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
              setDecodedUrl(
                `${PYTHON_API_URL}${resultData.result_json.processed_video_url}`
              );
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
  }, [videoId, user.id, language]);

  // Video player controls
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Ensure video is loaded before playing
      try {
        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video started playing successfully
              setIsPlaying(true);
              setVideoError(false);
            })
            .catch((error) => {
              // Auto-play was prevented
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
      } catch (error) {
        console.error("Video playback error:", error);
        setVideoError(true);
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

  console.log("🚀 ~ VideoAnalysisDisplay ~ analysisResult:", analysisResult);
  // For the demo, we'll show a basic video player with the video URL
  return (
    <Card className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <Card className="p-6 bg-white">
        {/* Video player */}
        <div className="mb-6">
          <div className="relative bg-black overflow-hidden aspect-video">
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
              className="w-full h-full"
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

          <div className="mt-4">
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
      </Card>

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
              {analysisResult[language].jump_by_jump_results.length} Jumps Total
              | Average Height: 1.3m
            </p>
          </div>
        </div>

        {/* Highest Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7658EB] to-[#3C78EB] p-6 text-white shadow-lg">
          <div className="w-full h-full flex flex-col justify-between">
            <h3 className="text-lg font-medium opacity-90 mb-8">
              {language === "en" ? "Points System" : "Estadísticas del curso"}
            </h3>
            <p className="text-base text-white mt-auto">4 Points Lost</p>
          </div>
        </div>

        {/* Lowest Score Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5E92FA] to-[#3C77EC] p-6 text-white shadow-lg">
          <div className="w-full h-full flex flex-col justify-between">
            <h3 className="text-lg font-medium opacity-90 mb-8">
              {language === "en" ? "Clear Rate" : "Estadísticas del curso"}
            </h3>
            <p className="text-base text-white mt-auto">
              8/10 Jumps Clear (80%)
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
            {analysisResult[language].personalInsight}
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
            <img src="/public/icon/Search-Document.svg" alt="" />
          </div>
        </div>
        <div className="w-full bg-[#F1F5F9] rounded-lg p-6">
          <h3 className="text-lg font-semibold">Rider Position Stability</h3>
          <ul className="mb-4 list-disc pl-5">
            <li>Maintained secure seat through 7/10 jumps</li>
          </ul>
          <h3 className="text-lg font-semibold">Horse Takeoff Analysis</h3>
          <ul className="mb-4 list-disc pl-5">
            <li>Average front leg extension: 98° (Optimal: 119°)</li>
          </ul>
          <h3 className="text-lg font-semibold">Landing Form</h3>
          <ul className="mb-4 list-disc pl-5">
            <li>Consistent hind leg engagement on clear</li>
          </ul>
          <h3 className="text-lg font-semibold">Jumps Approach</h3>
          <ul className="mb-4 list-disc pl-5">
            <li>
              Quality Straight approaches: 80% | Angled approaches: 60% success
            </li>
          </ul>
        </div>
      </Card>

      {/* Jump by jump Analysis */}
      <Card className="my-4 overflow-hidden">
        {/* <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
          {language === "en"
            ? "Jump by jump Analysis"
            : "Análisis Salto por Salto"}
        </h3> */}
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
              {analysisResult[language].jump_by_jump_results.map(
                (jump, index) => (
                  <tr key={index} className="border-none border-gray-200">
                    <td className="px-4 py-2 text-sm border border-gray-200 capitalize">
                      Jump {jump.jump_number}
                    </td>
                    <td className="px-4 py-2 text-sm border border-gray-200 uppercase">
                      {jump.result}
                    </td>
                    <td className="px-4 py-2 text-sm border border-gray-200 capitalize">
                      {jump.jump_type}
                    </td>
                    <td className="px-4 py-2 text-sm border border-gray-200 capitalize">
                      {jump.jump_type}
                    </td>
                  </tr>
                )
              )}
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
            <img src="/public/icon/eye.svg" alt="" />
          </div>
        </div>
        <div className="w-full p-6">
          <ul className="mb-4 list-disc pl-5">
            <li>
              <b>Success Rate by Height: 1.2m:</b>
              100% | 1.3m: 70% | 1.4m: 50%
            </li>
            <li>
              <b>Failure Patterns:</b> 3 of 4 faults occurred on unstable
              approach angles
            </li>
            <li>
              <b>Session Comparison:</b> 20% improvement from last session
            </li>
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
            <img src="/public/icon/Space-Shuttle.svg" alt="" />
          </div>
        </div>
        <Card className="w-full p-6 bg-[#F1F5F9]">
          <ul className="mb-4 list-disc pl-5">
            <li>
              <b>This Week's Focus:</b>
              Practice grid work - 4 bounces to improve rhythm
            </li>
            <li>
              <b>Biomechanical Goal:</b> Increase takeoff impulsion - front leg
              extension needs 21
            </li>
            <li>
              <b>Next Session Plan:</b> Work on approach consistency with ground
              pole exercises
            </li>
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
};

export default VideoAnalysisDisplay;
