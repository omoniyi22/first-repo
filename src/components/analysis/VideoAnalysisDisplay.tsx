
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize } from 'lucide-react';

interface AnalysisMarker {
  id: string;
  timeInSeconds: number;
  type: string;
  label: string;
  description?: string;
  score?: number;
  feedback?: string;
}

interface VideoAnalysisData {
  id: string;
  horse_id: string;
  horse_name?: string;
  discipline: 'dressage' | 'jumping';
  video_type: 'training' | 'competition';
  recording_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url: string;
  file_name: string;
  created_at: string;
  duration_seconds?: number;
  analysis_result?: {
    markers?: AnalysisMarker[];
    overallScore?: number;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    gaits?: {
      walk?: { score: number; feedback: string };
      trot?: { score: number; feedback: string };
      canter?: { score: number; feedback: string };
    };
    jumpAnalysis?: {
      approach?: { score: number; feedback: string };
      takeoff?: { score: number; feedback: string };
      airborne?: { score: number; feedback: string };
      landing?: { score: number; feedback: string };
    };
  };
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
  
  // Video player controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Selected marker
  const [selectedMarker, setSelectedMarker] = useState<AnalysisMarker | null>(null);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !videoId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('video_analysis')
          .select(`
            *,
            horses:horse_id (name)
          `)
          .eq('id', videoId)
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        // Format the data to include the horse name
        const formattedData = {
          ...data,
          horse_name: data.horses?.name
        };
        
        setAnalysis(formattedData);
      } catch (err: any) {
        console.error('Error fetching analysis:', err);
        setError(err.message || 'An error occurred while fetching the analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalysis();
    
    // Set up real-time listener for updates
    if (videoId) {
      const channel = supabase
        .channel('video_analysis_changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'video_analysis',
          filter: `id=eq.${videoId}`
        }, payload => {
          // Update the analysis data when changes occur
          setAnalysis(prevAnalysis => {
            if (prevAnalysis && payload.new.id === prevAnalysis.id) {
              return {
                ...prevAnalysis,
                ...payload.new,
                horse_name: prevAnalysis.horse_name // Preserve horse name
              };
            }
            return prevAnalysis;
          });
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [videoId, user]);
  
  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error attempting to exit fullscreen', err);
      });
    }
  };
  
  const seekToMarker = (marker: AnalysisMarker) => {
    if (videoRef.current) {
      videoRef.current.currentTime = marker.timeInSeconds;
      setCurrentTime(marker.timeInSeconds);
      setSelectedMarker(marker);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">{language === 'en' ? "Loading analysis..." : "Cargando análisis..."}</span>
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
          {language === 'en' ? "No analysis data available" : "No hay datos de análisis disponibles"}
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
              : (language === 'en' ? "We're analyzing your video. This may take a few minutes." : "Estamos analizando tu video. Esto puede tomar unos minutos.")}
          </p>
        </div>
      </Card>
    );
  }
  
  if (analysis.status === 'failed') {
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
          <div className="mt-4">
            <Button>
              {language === 'en' ? "Try Again" : "Intentar de nuevo"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Display completed analysis
  const markers = analysis.analysis_result?.markers || [];
  const markersByTime = [...markers].sort((a, b) => a.timeInSeconds - b.timeInSeconds);
  
  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold">
          {language === 'en' ? "Video Analysis Results" : "Resultados del Análisis de Video"}
        </h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
          <span>{analysis.horse_name}</span>
          <span>•</span>
          <span>{new Date(analysis.recording_date).toLocaleDateString()}</span>
          <span>•</span>
          <span>
            {analysis.video_type === 'training' 
              ? (language === 'en' ? "Training" : "Entrenamiento") 
              : (language === 'en' ? "Competition" : "Competición")}
          </span>
        </div>
      </div>
      
      {/* Custom Video Player with Analysis Overlay */}
      <div 
        ref={videoContainerRef}
        className="relative mb-6 bg-black rounded-lg overflow-hidden"
      >
        <video
          ref={videoRef}
          src={analysis.video_url}
          className="w-full"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Markers on Timeline */}
          <div className="relative h-4 mb-2">
            {markersByTime.map((marker) => {
              const leftPosition = (marker.timeInSeconds / (duration || 1)) * 100;
              const isSelected = selectedMarker?.id === marker.id;
              const markerColor = analysis.discipline === 'dressage' 
                ? 'bg-purple-500' 
                : 'bg-blue-500';
              
              return (
                <div
                  key={marker.id}
                  className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer hover:scale-125 transition-transform ${markerColor} ${isSelected ? 'ring-2 ring-white' : ''}`}
                  style={{ left: `${leftPosition}%` }}
                  onClick={() => seekToMarker(marker)}
                  title={marker.label}
                />
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider 
              defaultValue={[0]} 
              value={[currentTime ? (currentTime / duration) * 100 : 0]} 
              min={0} 
              max={100} 
              step={0.1} 
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </Button>
              
              <div className="flex items-center relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </Button>
                
                {showVolumeSlider && (
                  <div 
                    className="absolute bottom-full left-0 mb-2 bg-black/80 p-2 rounded-md w-24"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Slider
                      defaultValue={[0.5]}
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                )}
              </div>
              
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </Button>
          </div>
        </div>
        
        {/* Analysis Overlay */}
        {selectedMarker && (
          <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-3 rounded-md border border-white/30 backdrop-blur-sm">
            <h3 className="font-medium mb-1">{selectedMarker.label}</h3>
            <p className="text-sm">{selectedMarker.description || selectedMarker.feedback}</p>
          </div>
        )}
      </div>
      
      {/* Analysis Details */}
      <div className="mt-6">
        <Tabs defaultValue="markers" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="markers">{language === 'en' ? "Key Moments" : "Momentos Clave"}</TabsTrigger>
            <TabsTrigger value="analysis">{language === 'en' ? "Analysis" : "Análisis"}</TabsTrigger>
            <TabsTrigger value="recommendations">{language === 'en' ? "Recommendations" : "Recomendaciones"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="markers" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'en' ? "Key Moments in Video" : "Momentos Clave en el Video"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {markersByTime.length > 0 ? (
                  markersByTime.map((marker) => (
                    <div 
                      key={marker.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md border ${
                        selectedMarker?.id === marker.id 
                          ? (analysis.discipline === 'dressage' ? 'border-purple-400 bg-purple-50' : 'border-blue-400 bg-blue-50')
                          : 'border-gray-200'
                      }`}
                      onClick={() => seekToMarker(marker)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{marker.label}</span>
                        <span className="text-sm text-gray-500">{formatTime(marker.timeInSeconds)}</span>
                      </div>
                      {marker.description && (
                        <p className="text-sm text-gray-600">{marker.description}</p>
                      )}
                      {marker.feedback && (
                        <p className="text-sm text-gray-600 mt-1 italic">{marker.feedback}</p>
                      )}
                      {marker.score !== undefined && (
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-gray-500 mr-2">
                            {language === 'en' ? "Score:" : "Puntuación:"}
                          </span>
                          <div className="bg-gray-200 h-2 flex-grow rounded-full overflow-hidden">
                            <div 
                              className={analysis.discipline === 'dressage' ? "bg-purple-500 h-full" : "bg-blue-500 h-full"}
                              style={{ width: `${(marker.score / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium ml-2">{marker.score}/10</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-4 bg-gray-50 rounded-md text-center text-gray-500">
                    {language === 'en' ? "No key moments identified in this video." : "No se identificaron momentos clave en este video."}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            {analysis.discipline === 'dressage' ? (
              <DressageVideoAnalysis analysis={analysis} language={language} />
            ) : (
              <JumpingVideoAnalysis analysis={analysis} language={language} />
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'en' ? "Recommendations" : "Recomendaciones"}
              </h3>
              
              <div className="space-y-4">
                {analysis.analysis_result?.recommendations?.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg ${
                      analysis.discipline === 'dressage' ? 'bg-purple-50' : 'bg-blue-50'
                    }`}
                  >
                    <p className="font-medium text-lg mb-2">
                      {language === 'en' ? `Recommendation ${index + 1}` : `Recomendación ${index + 1}`}
                    </p>
                    <p>{rec}</p>
                  </div>
                )) || (
                  <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                    {language === 'en' ? "No specific recommendations available" : "No hay recomendaciones específicas disponibles"}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

// Component for displaying dressage video analysis
const DressageVideoAnalysis: React.FC<{ analysis: VideoAnalysisData, language: string }> = ({ analysis, language }) => {
  const result = analysis.analysis_result || {};
  const gaits = result.gaits || {};
  
  return (
    <div className="space-y-6">
      {result.overallScore !== undefined && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-purple-800">
            {language === 'en' ? "Overall Assessment" : "Evaluación General"}
          </h3>
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold text-purple-900 mr-2">
              {result.overallScore.toFixed(1)}
            </span>
            <span className="text-gray-500">/10</span>
          </div>
        </div>
      )}
      
      {/* Gait Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-800">
          {language === 'en' ? "Gait Analysis" : "Análisis de Aires"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gaits.walk && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Walk" : "Paso"}</h4>
                <span className="font-medium text-purple-900">{gaits.walk.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{gaits.walk.feedback}</p>
            </div>
          )}
          
          {gaits.trot && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Trot" : "Trote"}</h4>
                <span className="font-medium text-purple-900">{gaits.trot.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{gaits.trot.feedback}</p>
            </div>
          )}
          
          {gaits.canter && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Canter" : "Galope"}</h4>
                <span className="font-medium text-purple-900">{gaits.canter.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{gaits.canter.feedback}</p>
            </div>
          )}
        </div>
        
        {(!gaits.walk && !gaits.trot && !gaits.canter) && (
          <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
            {language === 'en' ? "No gait analysis available" : "No hay análisis de aires disponible"}
          </div>
        )}
      </div>
      
      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-800">
            {language === 'en' ? "Strengths" : "Fortalezas"}
          </h3>
          <ul className="space-y-2">
            {result.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            )) || (
              <li className="text-gray-500 italic">
                {language === 'en' ? "No strengths identified" : "No se identificaron fortalezas"}
              </li>
            )}
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-800">
            {language === 'en' ? "Areas for Improvement" : "Áreas de Mejora"}
          </h3>
          <ul className="space-y-2">
            {result.weaknesses?.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">!</span>
                <span>{weakness}</span>
              </li>
            )) || (
              <li className="text-gray-500 italic">
                {language === 'en' ? "No weaknesses identified" : "No se identificaron debilidades"}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Component for displaying jumping video analysis
const JumpingVideoAnalysis: React.FC<{ analysis: VideoAnalysisData, language: string }> = ({ analysis, language }) => {
  const result = analysis.analysis_result || {};
  const jumpAnalysis = result.jumpAnalysis || {};
  
  return (
    <div className="space-y-6">
      {result.overallScore !== undefined && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">
            {language === 'en' ? "Overall Assessment" : "Evaluación General"}
          </h3>
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold text-blue-900 mr-2">
              {result.overallScore.toFixed(1)}
            </span>
            <span className="text-gray-500">/10</span>
          </div>
        </div>
      )}
      
      {/* Jump Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-800">
          {language === 'en' ? "Jump Analysis" : "Análisis de Salto"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jumpAnalysis.approach && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Approach" : "Aproximación"}</h4>
                <span className="font-medium text-blue-900">{jumpAnalysis.approach.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{jumpAnalysis.approach.feedback}</p>
            </div>
          )}
          
          {jumpAnalysis.takeoff && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Take-off" : "Despegue"}</h4>
                <span className="font-medium text-blue-900">{jumpAnalysis.takeoff.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{jumpAnalysis.takeoff.feedback}</p>
            </div>
          )}
          
          {jumpAnalysis.airborne && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Airborne" : "En el aire"}</h4>
                <span className="font-medium text-blue-900">{jumpAnalysis.airborne.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{jumpAnalysis.airborne.feedback}</p>
            </div>
          )}
          
          {jumpAnalysis.landing && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">{language === 'en' ? "Landing" : "Aterrizaje"}</h4>
                <span className="font-medium text-blue-900">{jumpAnalysis.landing.score}/10</span>
              </div>
              <p className="text-sm text-gray-600">{jumpAnalysis.landing.feedback}</p>
            </div>
          )}
        </div>
        
        {(!jumpAnalysis.approach && !jumpAnalysis.takeoff && !jumpAnalysis.airborne && !jumpAnalysis.landing) && (
          <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
            {language === 'en' ? "No jump analysis available" : "No hay análisis de salto disponible"}
          </div>
        )}
      </div>
      
      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800">
            {language === 'en' ? "Strengths" : "Fortalezas"}
          </h3>
          <ul className="space-y-2">
            {result.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center bg-green-100 text-green-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            )) || (
              <li className="text-gray-500 italic">
                {language === 'en' ? "No strengths identified" : "No se identificaron fortalezas"}
              </li>
            )}
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800">
            {language === 'en' ? "Areas for Improvement" : "Áreas de Mejora"}
          </h3>
          <ul className="space-y-2">
            {result.weaknesses?.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 rounded-full h-5 w-5 text-xs mr-2 mt-0.5">!</span>
                <span>{weakness}</span>
              </li>
            )) || (
              <li className="text-gray-500 italic">
                {language === 'en' ? "No weaknesses identified" : "No se identificaron debilidades"}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysisDisplay;
