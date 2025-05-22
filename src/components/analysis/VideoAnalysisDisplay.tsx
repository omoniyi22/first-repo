
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const VideoAnalysisDisplay: React.FC<VideoAnalysisDisplayProps> = ({ videoId }) => {
  const { user } = useAuth();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
  const [analysis, setAnalysis] = useState<VideoAnalysisData | null>(null);
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
          .from('document_analysis')
          .select('*')
          .eq('id', videoId)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          console.log("Retrieved video data:", data);
          setAnalysis(data as VideoAnalysisData);
          
          // Properly decode the URL to ensure it works correctly
          if (data.document_url) {
            const decoded = decodeURIComponent(data.document_url);
            setDecodedUrl(decoded);
          }
        } else {
          setError(language === 'en' ? 'Video not found' : 'Video no encontrado');
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching analysis:', err);
        setError(err.message || (language === 'en' 
          ? 'An error occurred while fetching the video analysis.' 
          : 'Ocurrió un error al obtener el análisis de video.'));
        setIsLoading(false);
        toast.error(language === 'en' 
          ? 'Failed to load video analysis' 
          : 'No se pudo cargar el análisis de video');
      }
    };
    
    fetchAnalysis();
  }, [videoId, user, language]);
  
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
            .catch(error => {
              // Auto-play was prevented
              console.error("Video playback failed:", error);
              setIsPlaying(false);
              setVideoError(true);
              
              toast.error(language === 'en' 
                ? 'Failed to play video. The format might not be supported.' 
                : 'No se pudo reproducir el video. El formato puede no ser compatible.');
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
      console.log("Video metadata loaded, duration:", videoRef.current.duration);
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
  
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error event:", e);
    setVideoError(true);
    setIsPlaying(false);
    toast.error(language === 'en' 
      ? 'Failed to load video. The format might not be supported or the URL is invalid.' 
      : 'No se pudo cargar el video. El formato puede no ser compatible o la URL no es válida.');
  };
  
  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };
  
  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  if (isLoading) {
    return (
      <div className="sticky w-screen h-screen flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">{language === 'en' ? "Loading video analysis..." : "Cargando análisis de video..."}</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => setError(null)}>
            {language === 'en' ? "Try Again" : "Intentar de nuevo"}
          </Button>
        </div>
      </Card>
    );
  }
  
  if (!analysis) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          {language === 'en' ? "No video analysis data available" : "No hay datos de análisis de video disponibles"}
        </div>
      </Card>
    );
  }
  
  if (analysis.status === 'pending' || analysis.status === 'processing') {
    return (
      <Card className="p-6 bg-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">
            {analysis.status === 'pending' 
              ? (language === 'en' ? "Analysis Pending" : "Análisis Pendiente") 
              : (language === 'en' ? "Processing Video" : "Procesando Video")}
          </h3>
          <p className="text-gray-500">
            {analysis.status === 'pending'
              ? (language === 'en' ? "Your video is in queue for analysis." : "Tu video está en cola para análisis.")
              : (language === 'en' ? "We're analyzing your video. This may take several minutes." : "Estamos analizando tu video. Esto puede tomar varios minutos.")}
          </p>
        </div>
      </Card>
    );
  }
  
  if (analysis.status === 'error') {
    return (
      <Card className="p-6 bg-white">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">
              {language === 'en' ? "Analysis Failed" : "Análisis Fallido"}
            </h3>
            <p>
              {language === 'en' ? "We couldn't analyze this video. Please try uploading it again or contact support if the problem persists." : "No pudimos analizar este video. Intenta subirlo de nuevo o contacta a soporte si el problema persiste."}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  // For the demo, we'll show a basic video player with the video URL
  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold">
          {language === 'en' ? "Video Analysis" : "Análisis de Video"}
        </h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
          <span>{analysis.horse_name}</span>
          <span>•</span>
          <span>{new Date(analysis.document_date).toLocaleDateString()}</span>
          <span>•</span>
          <span>
            {analysis.discipline === 'dressage' 
              ? (language === 'en' ? "Dressage" : "Doma") 
              : (language === 'en' ? "Jumping" : "Salto")}
            {analysis.video_type && (
              <>
                {" - "}
                {analysis.video_type === 'training' 
                  ? (language === 'en' ? "Training" : "Entrenamiento")
                  : (language === 'en' ? "Competition" : "Competición")
                }
              </>
            )}
          </span>
        </div>
      </div>
      
      {/* Video player */}
      <div className="mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {videoError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 bg-opacity-80 p-4">
              <AlertCircle className="h-12 w-12 mb-2 text-red-400" />
              <p className="text-center mb-4">
                {language === 'en' 
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
                {language === 'en' ? "Try Again" : "Intentar de nuevo"}
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
            <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
            <span className="text-sm text-gray-500">{formatTime(duration)}</span>
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
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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
      
      {/* Notes and tags section */}
      <div className="mt-8">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            {language === 'en' ? "Note" : "Nota"}
          </h3>
          <p className="text-gray-600">
            {language === 'en'
              ? "Video analysis features will be available in an upcoming release. This is currently a preview of the video player component."
              : "Las funciones de análisis de video estarán disponibles en una próxima versión. Esto es actualmente una vista previa del componente de reproductor de video."}
          </p>
          {analysis.notes && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h4 className="font-medium mb-1">{language === 'en' ? "Your Notes" : "Tus Notas"}</h4>
              <p className="text-gray-700">{analysis.notes}</p>
            </div>
          )}
        </div>
        
        {analysis.tags && analysis.tags.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">{language === 'en' ? "Tags" : "Etiquetas"}</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.tags.map((tag, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    analysis.discipline === 'dressage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoAnalysisDisplay;
