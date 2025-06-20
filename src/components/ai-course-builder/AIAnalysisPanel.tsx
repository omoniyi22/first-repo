import { AlertTriangle, CheckCircle, Eye, Sparkles } from "lucide-react";
import React from "react";

const AIAnalysisPanel = ({ analysis, jumps, designMode, currentLevel }) => {
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
                      analysis.aiScore > 80
                        ? "bg-green-500"
                        : analysis.aiScore > 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.aiScore}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  {analysis.aiScore}/100
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {analysis.aiScore > 80
                  ? "Excellent optimization"
                  : analysis.aiScore > 60
                  ? "Good optimization"
                  : "Needs improvement"}
              </p>
            </div>

            {/* Course Metrics */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600 block">Total Distance</span>
                <span className="font-semibold text-lg">
                  {analysis.totalDistance.toFixed(0)}m
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600 block">Avg Distance</span>
                <span className="font-semibold text-lg">
                  {analysis.averageDistance.toFixed(1)}m
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600 block">Sharp Turns</span>
                <span className="font-semibold text-lg">
                  {analysis.sharpTurns}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600 block">Combinations</span>
                <span className="font-semibold text-lg">
                  {analysis.combinations}
                </span>
              </div>
            </div>

            {/* Compliance */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Level Compliance</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      analysis.compliance > 80
                        ? "bg-green-500"
                        : analysis.compliance > 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.compliance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {analysis.compliance}%
                </span>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
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
            {analysis.compliance === 100 &&
              analysis.issues.length === 0 &&
              analysis.aiScore > 80 && (
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
      </div>
    </>
  );
};

export default AIAnalysisPanel;
