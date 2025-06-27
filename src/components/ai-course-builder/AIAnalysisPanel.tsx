import { AlertTriangle, CheckCircle, Eye, Sparkles, Play } from "lucide-react";
import React, { useState } from "react";

const AIAnalysisPanel = ({
  analysis,
  jumps,
  designMode,
  currentLevel,
  analyzeCourse, // Function to analyze the course
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeCourse = async () => {
    setIsAnalyzing(true);
    try {
      // Add a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      await analyzeCourse();
    } catch (error) {
      console.error("Error analyzing course:", error);
      // You could add a toast notification here to show the error to the user
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAnalysis =
    designMode === "ai" || (analysis && Object.keys(analysis).length > 0);

  return (
    <>
      {/* AI Analysis Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-600" />
          Course Analysis
        </h2>

        {jumps.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
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
                <button
                  onClick={handleAnalyzeCourse}
                  disabled={isAnalyzing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-4 h-4" />
                  <span>{isAnalyzing ? "Analyzing..." : "Analyze Course"}</span>
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Click to analyze your course design and get feedback
                </p>
              </div>
            )}

            {/* Re-analyze Button for Manual Mode */}
            {designMode === "manual" && showAnalysis && (
              <div className="mb-4">
                <button
                  onClick={handleAnalyzeCourse}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-blue-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {isAnalyzing ? "Re-analyzing..." : "Re-analyze Course"}
                  </span>
                </button>
              </div>
            )}

            {/* Show loading state while analyzing */}
            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Analyzing course...</p>
              </div>
            )}

            {/* Analysis Results */}
            {showAnalysis && analysis && !isAnalyzing && (
              <div className="space-y-4">
                {/* AI Score */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">
                    {designMode === "ai"
                      ? "AI Optimization Score"
                      : "Course Quality Score"}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          (analysis.aiScore || 0) > 80
                            ? "bg-green-500"
                            : (analysis.aiScore || 0) > 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${analysis.aiScore || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-blue-800">
                      {analysis.aiScore || 0}/100
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {(analysis.aiScore || 0) > 80
                      ? "Excellent optimization"
                      : (analysis.aiScore || 0) > 60
                      ? "Good optimization"
                      : "Needs improvement"}
                  </p>
                </div>

                {/* Course Metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block">Total Distance</span>
                    <span className="font-semibold text-lg">
                      {(analysis.totalDistance || 0).toFixed(0)}m
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block">Avg Distance</span>
                    <span className="font-semibold text-lg">
                      {(analysis.averageDistance || 0).toFixed(1)}m
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block">Sharp Turns</span>
                    <span className="font-semibold text-lg">
                      {analysis.sharpTurns || 0}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block">Combinations</span>
                    <span className="font-semibold text-lg">
                      {analysis.combinations || 0}
                    </span>
                  </div>
                </div>

                {/* Compliance */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
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
                    <span className="text-sm font-medium">
                      {analysis.compliance || 0}%
                    </span>
                  </div>
                </div>

                {/* Issues */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-red-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Issues Found
                    </h3>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="text-xs text-red-600 bg-red-50 p-2 rounded"
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
                      <h3 className="font-medium text-green-800 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Perfect Course!
                      </h3>
                      <p className="text-xs text-green-700 mt-1">
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
    </>
  );
};

export default AIAnalysisPanel;