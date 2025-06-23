
import { AlertTriangle, CheckCircle, Eye, Sparkles, Play } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const AIAnalysisPanel = ({
  analysis,
  jumps,
  designMode,
  currentLevel,
  analyzeCourse,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeCourse = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeCourse();
    } catch (error) {
      console.error("Error analyzing course:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAnalysis =
    designMode === "ai" || (analysis && Object.keys(analysis).length > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4 flex items-center">
        <Eye className="w-5 h-5 mr-2 text-purple-600" />
        Course Analysis
      </h2>

      {jumps.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-sans">
            {designMode === "ai"
              ? "Generate a course to see AI analysis"
              : "Add jumps to see analysis"}
          </p>
        </div>
      ) : (
        <>
          {/* Manual Mode Analysis Button */}
          {designMode === "manual" && !showAnalysis && (
            <div className="text-center py-8">
              <Button
                onClick={handleAnalyzeCourse}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-sans"
              >
                <Play className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Analyze Course"}
              </Button>
              <p className="text-sm text-gray-500 mt-3 font-sans">
                Click to analyze your course design and get feedback
              </p>
            </div>
          )}

          {/* Re-analyze Button for Manual Mode */}
          {designMode === "manual" && showAnalysis && (
            <div className="mb-4">
              <Button
                onClick={handleAnalyzeCourse}
                disabled={isAnalyzing}
                variant="outline"
                className="w-full font-sans border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Play className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Re-analyzing..." : "Re-analyze Course"}
              </Button>
            </div>
          )}

          {/* Analysis Results */}
          {showAnalysis && analysis && (
            <div className="space-y-4">
              {/* AI Score */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2 font-serif">
                  {designMode === "ai"
                    ? "AI Optimization Score"
                    : "Course Quality Score"}
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        analysis.aiScore > 80
                          ? "bg-green-500"
                          : analysis.aiScore > 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${analysis.aiScore || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-purple-800 font-sans">
                    {analysis.aiScore || 0}/100
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-1 font-sans">
                  {(analysis.aiScore || 0) > 80
                    ? "Excellent optimization"
                    : (analysis.aiScore || 0) > 60
                    ? "Good optimization"
                    : "Needs improvement"}
                </p>
              </div>

              {/* Course Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-gray-600 block font-sans">Total Distance</span>
                  <span className="font-semibold text-lg font-sans">
                    {(analysis.totalDistance || 0).toFixed(0)}m
                  </span>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-gray-600 block font-sans">Avg Distance</span>
                  <span className="font-semibold text-lg font-sans">
                    {(analysis.averageDistance || 0).toFixed(1)}m
                  </span>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-gray-600 block font-sans">Sharp Turns</span>
                  <span className="font-semibold text-lg font-sans">
                    {analysis.sharpTurns || 0}
                  </span>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <span className="text-gray-600 block font-sans">Combinations</span>
                  <span className="font-semibold text-lg font-sans">
                    {analysis.combinations || 0}
                  </span>
                </div>
              </div>

              {/* Compliance */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-sans">
                  Level Compliance
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        (analysis.compliance || 0) > 80
                          ? "bg-green-500"
                          : (analysis.compliance || 0) > 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${analysis.compliance || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium font-sans">
                    {analysis.compliance || 0}%
                  </span>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues && analysis.issues.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-red-800 mb-2 flex items-center font-serif">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Issues Found
                  </h3>
                  <div className="space-y-2">
                    {analysis.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="text-xs text-red-600 bg-red-50 p-2 rounded font-sans"
                      >
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {(analysis.compliance || 0) === 100 &&
                (!analysis.issues || analysis.issues.length === 0) &&
                (analysis.aiScore || 0) > 80 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-800 flex items-center font-serif">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Perfect Course!
                    </h3>
                    <p className="text-xs text-green-700 mt-1 font-sans">
                      This course meets all requirements for{" "}
                      {currentLevel?.description || "this level"}
                    </p>
                  </div>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIAnalysisPanel;
