import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface VideoAnalysisData {
  id: string;
  user_id: string;
  horse_id: string;
  discipline: "dressage" | "jumping";
  video_type: string;
  video_url: string;
  file_name: string;
  file_type: string;
  recording_date: string;
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
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !videoId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get video analysis record
        const { data: videoData, error: videoError } = await supabase
          .from('video_analysis')
          .select('*')
          .eq('id', videoId)
          .eq('user_id', user.id)
          .single();
          
        if (videoError) {
          throw videoError;
        }

        // Get horse details
        const { data: horseData, error: horseError } = await supabase
          .from('horses')
          .select('name')
          .eq('id', videoData.horse_id)
          .single();
          
        if (horseError) {
          console.error('Error fetching horse details:', horseError);
        }
        
        // Format the data to include the horse name
        const formattedVideo: VideoAnalysisData = {
          ...videoData,
          discipline: videoData.discipline as "dressage" | "jumping",
          horse_name: horseData?.name
        };
        
        setAnalysis(formattedVideo);
      } catch (err: any) {
        console.error('Error fetching analysis:', err);
        setError(err.message || 'An error occurred while fetching the video analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [videoId, user]);
  
  // Video player controls
  const togglePlayPause = () => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (videoElement) {
      setCurrentTime(videoElement.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoElement) {
      setDuration(videoElement.duration);
    }
  };
  
  const handleSliderChange = (value: number[]) => {
    if (videoElement) {
      videoElement.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };
  
  const seekBackward = () => {
    if (videoElement) {
      videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
    }
  };
  
  const seekForward = () => {
    if (videoElement) {
      videoElement.currentTime = Math.min(duration, videoElement.currentTime + 5);
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
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
  // In a real implementation, this would include markers, overlays, and analysis data
  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold">
          {language === 'en' ? "Video Analysis" : "Análisis de Video"}
        </h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
          <span>{analysis.horse_name}</span>
          <span>•</span>
          <span>{new Date(analysis.recording_date).toLocaleDateString()}</span>
          <span>•</span>
          <span>
            {analysis.discipline === 'dressage' 
              ? (language === 'en' ? "Dressage" : "Doma") 
              : (language === 'en' ? "Jumping" : "Salto")}
            {" - "}
            {analysis.video_type === 'training' 
              ? (language === 'en' ? "Training" : "Entrenamiento")
              : (language === 'en' ? "Competition" : "Competición")
            }
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={(el) => setVideoElement(el)}
            src={analysis.video_url}
            className="w-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
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
          />
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={seekBackward}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={seekForward}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
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
