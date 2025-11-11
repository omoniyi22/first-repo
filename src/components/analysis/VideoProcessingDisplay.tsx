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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JumpMark {
  timestamp: number;
  jump_type: "successful" | "failed";
  frame_number: number;
}

interface ProcessingStatus {
  status: "processing" | "completed" | "error" | "debug";
  progress: number;
  message: string;
  video_id: string;
}

interface FrameData {
  type: "frame";
  frame_number: number;
  timestamp: number;
  frame_data: string; // base64 JPEG
}

const PYTHON_API_URL =
  import.meta.env.VITE_PYTHON_API_URL || "https://api.equineaintelligence.com";

const VideoProcessingDisplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  const documentId = searchParams.get("document_id");
  const [pythonVideoId, setPythonVideoId] = useState<string | null>(null);

  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [currentFrameNumber, setCurrentFrameNumber] = useState<number>(0);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [isProcessingComplete, setIsProcessingComplete] =
    useState<boolean>(false);

  const [successfulJumps, setSuccessfulJumps] = useState<JumpMark[]>([]);
  const [failedJumps, setFailedJumps] = useState<JumpMark[]>([]);

  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [processingSpeed, setProcessingSpeed] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number>(0);

  useEffect(() => {
    const initProcessing = async () => {
      if (!documentId || !user) return;

      try {
        const { data: docData, error: docError } = await supabase
          .from("document_analysis")
          .select("python_video_id")
          .eq("id", documentId)
          .eq("user_id", user.id)
          .single();

        if (docError) throw docError;

        if (docData?.python_video_id) {
          setPythonVideoId(docData.python_video_id);
          connectWebSocket(docData.python_video_id);
          await startProcessing(docData.python_video_id);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        toast.error("Failed to load video data");
      }
    };

    initProcessing();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [documentId, user]);

  const connectWebSocket = (videoId: string) => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = PYTHON_API_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}//${wsHost}/ws/${videoId}`;

    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      toast.success("Connected to processing server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "frame") {
          handleFrameData(data as FrameData);
        } else {
          handleStatusUpdate(data as ProcessingStatus);
        }
      } catch (error) {
        // Ignore non-JSON messages
        console.log("Non-JSON WebSocket message:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };
  };

  const startProcessing = async (videoId: string) => {
    try {
      const formData = new FormData();
      formData.append("video_id", videoId);

      const response = await fetch(`${PYTHON_API_URL}/api/process-video`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to start processing");

      const result = await response.json();
      console.log("Processing started:", result);

      startTimeRef.current = Date.now();
      toast.info("Video processing started");
    } catch (error) {
      console.error("Error starting processing:", error);
      toast.error("Failed to start processing");
    }
  };

  const handleFrameData = (frameData: FrameData) => {
    setCurrentFrame(`data:image/jpeg;base64,${frameData.frame_data}`);
    setCurrentFrameNumber(frameData.frame_number);
    setCurrentTimestamp(frameData.timestamp);
  };

  const handleStatusUpdate = (status: ProcessingStatus) => {
    setProcessingStatus(status);

    if (startTimeRef.current && status.progress > lastProgressRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const speed = status.progress / elapsed;
      const eta = (100 - status.progress) / speed;

      setProcessingSpeed(`${speed.toFixed(1)}%/s | ETA ${Math.round(eta)}s`);
      lastProgressRef.current = status.progress;
    }

    if (status.status === "completed") {
      setIsProcessingComplete(true);
      toast.success("Processing complete!");
    } else if (status.status === "error") {
      toast.error(status.message);
    }
  };

  const markJump = (type: "successful" | "failed") => {
    const jump: JumpMark = {
      timestamp: currentTimestamp,
      jump_type: type,
      frame_number: currentFrameNumber,
    };

    if (type === "successful") {
      setSuccessfulJumps([...successfulJumps, jump]);
    } else {
      setFailedJumps([...failedJumps, jump]);
    }

    toast.success(
      `${
        type === "successful" ? "Successful" : "Failed"
      } jump marked at ${formatTime(currentTimestamp)}`
    );
  };

  const removeJump = (index: number, type: "successful" | "failed") => {
    if (type === "successful") {
      setSuccessfulJumps(successfulJumps.filter((_, i) => i !== index));
    } else {
      setFailedJumps(failedJumps.filter((_, i) => i !== index));
    }
    toast.info("Jump removed");
  };

  const generateReport = async () => {
    if (!pythonVideoId || !documentId) return;

    if (successfulJumps.length === 0 && failedJumps.length === 0) {
      toast.error("Please mark at least one jump");
      return;
    }

    setIsGeneratingReport(true);

    try {
      // V2: Send marked jumps to Python API
      const response = await fetch(`${PYTHON_API_URL}/api/analyze-jumps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: pythonVideoId,
          successful_jumps: successfulJumps,
          failed_jumps: failedJumps,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const reportData = await response.json();
      console.log("V2 Report received:", reportData);

      // V2: reportData.report_content is now a JSON object, not HTML
      // Structure: { video_id, timestamp, statistics, biomechanical_summary, ai_analysis, metadata }

      // Store the JSON report in Supabase
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

      // Update document status
      const { error: updateError } = await supabase
        .from("document_analysis")
        .update({ status: "completed" })
        .eq("id", documentId);

      if (updateError) throw updateError;

      toast.success("Analysis report generated successfully!");

      // Navigate to the analysis page to view the report
      navigate(`/analysis?document_id=${documentId}`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Processing Status */}
      {processingStatus && !isProcessingComplete && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border-purple-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {language === "en"
                      ? "AI Processing in Progress"
                      : "Procesamiento IA en Progreso"}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {processingStatus.message}
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
            <Progress
              value={processingStatus.progress}
              className="h-3 bg-purple-100"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-purple-700 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {Math.round(processingStatus.progress)}%
              </span>
              {processingSpeed && (
                <span className="text-gray-600 font-mono bg-white px-3 py-1 rounded-full">
                  {processingSpeed}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Live Frame Display - FIXED SIZE */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-xl font-semibold">
            {language === "en" ? "Live Processing View" : "Vista en Vivo"}
          </h3>
        </div>

        {/* FIXED: Max width container */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative bg-black rounded-lg overflow-hidden mb-4"
            style={{ aspectRatio: "16/9" }}
          >
            {currentFrame ? (
              <>
                <img
                  src={currentFrame}
                  alt="Processing frame"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm backdrop-blur-sm">
                  Frame {currentFrameNumber} | {formatTime(currentTimestamp)}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                  <p>
                    {language === "en"
                      ? "Waiting for frames..."
                      : "Esperando frames..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jump Marking Controls */}
        {currentFrame && (
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-red-50 p-4 rounded-lg max-w-4xl mx-auto">
            <p className="text-center text-sm font-medium text-gray-700 mb-3 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {language === "en"
                ? "Mark jumps in real-time as you see them!"
                : "¡Marca los saltos en tiempo real mientras los ves!"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => markJump("successful")}
                className="bg-green-600 hover:bg-green-700 flex-1 max-w-xs"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {language === "en" ? "Successful Jump" : "Salto Exitoso"}
              </Button>
              <Button
                onClick={() => markJump("failed")}
                className="bg-red-600 hover:bg-red-700 flex-1 max-w-xs"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {language === "en" ? "Failed Jump" : "Salto Fallido"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Marked Jumps */}
      {(successfulJumps.length > 0 || failedJumps.length > 0) && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            {language === "en" ? "Marked Jumps" : "Saltos Marcados"}
            <span className="text-sm text-gray-500 ml-2 font-normal">
              ({successfulJumps.length + failedJumps.length} total)
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Successful Jumps */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-700">
                  {language === "en" ? "Successful" : "Exitosos"} (
                  {successfulJumps.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {successfulJumps.map((jump, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
                  >
                    <span className="font-mono text-sm">
                      {formatTime(jump.timestamp)}{" "}
                      <span className="text-gray-500">
                        #{jump.frame_number}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJump(index, "successful")}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Jumps */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-700">
                  {language === "en" ? "Failed" : "Fallidos"} (
                  {failedJumps.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {failedJumps.map((jump, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-200"
                  >
                    <span className="font-mono text-sm">
                      {formatTime(jump.timestamp)}{" "}
                      <span className="text-gray-500">
                        #{jump.frame_number}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJump(index, "failed")}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Generate Report CTA */}
      {isProcessingComplete && (
        <Card className="p-8 bg-gradient-to-br from-purple-100 via-blue-100 to-purple-100">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-2">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {language === "en"
                ? "Processing Complete!"
                : "¡Procesamiento Completo!"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {language === "en"
                ? `You've marked ${successfulJumps.length} successful and ${failedJumps.length} failed jumps. Ready to generate your AI analysis report?`
                : `Has marcado ${successfulJumps.length} saltos exitosos y ${failedJumps.length} fallidos. ¿Listo para generar tu reporte?`}
            </p>
            <Button
              onClick={generateReport}
              disabled={
                isGeneratingReport ||
                (successfulJumps.length === 0 && failedJumps.length === 0)
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-6 text-lg"
              size="lg"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {language === "en" ? "Generating..." : "Generando..."}
                </>
              ) : (
                <>
                  {language === "en"
                    ? "Generate AI Report"
                    : "Generar Reporte IA"}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              {language === "en" ? "How it works" : "Cómo funciona"}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>✓ Watch real-time AI pose detection on each frame</li>
              <li>✓ Mark successful/failed jumps as they appear</li>
              <li>✓ Generate comprehensive biomechanical analysis</li>
              <li>✓ Get actionable recommendations from AI</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoProcessingDisplay;
