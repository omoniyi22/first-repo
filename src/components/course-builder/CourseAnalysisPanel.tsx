
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Eye, Sparkles, Play, BarChart3 } from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';

const CourseAnalysisPanel = () => {
  const { analysis, jumps, designMode } = useCourseBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeCourse = async () => {
    setIsAnalyzing(true);
    try {
      // TODO: Implement course analysis logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate analysis
    } catch (error) {
      console.error('Error analyzing course:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAnalysis = designMode === 'ai' || (analysis && Object.keys(analysis).length > 0);

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
        <CardTitle className="flex items-center space-x-2 font-serif text-gray-800">
          <Eye className="w-5 h-5 text-purple-600" />
          <span>Course Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {jumps.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-sans text-gray-500">
              {designMode === 'ai'
                ? 'Generate a course to see AI analysis'
                : 'Add jumps to see analysis'}
            </p>
          </div>
        ) : (
          <>
            {/* Manual Mode Analysis Button */}
            {designMode === 'manual' && !showAnalysis && (
              <div className="text-center py-8">
                <Button
                  onClick={handleAnalyzeCourse}
                  disabled={isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-sans font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Course'}</span>
                </Button>
                <p className="text-sm font-sans text-gray-500 mt-3">
                  Click to analyze your course design and get feedback
                </p>
              </div>
            )}

            {/* Re-analyze Button for Manual Mode */}
            {designMode === 'manual' && showAnalysis && (
              <div className="mb-4">
                <Button
                  onClick={handleAnalyzeCourse}
                  disabled={isAnalyzing}
                  className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 font-sans font-medium"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span>{isAnalyzing ? 'Re-analyzing...' : 'Re-analyze Course'}</span>
                </Button>
              </div>
            )}

            {/* Analysis Results */}
            {showAnalysis && analysis && (
              <div className="space-y-4">
                {/* AI Score */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <h3 className="font-serif font-semibold text-purple-800">
                      {designMode === 'ai' ? 'AI Optimization Score' : 'Course Quality Score'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          (analysis.aiScore || 0) > 80
                            ? 'bg-green-500'
                            : (analysis.aiScore || 0) > 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.aiScore || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold font-sans text-purple-800">
                      {analysis.aiScore || 0}/100
                    </span>
                  </div>
                  <p className="text-xs font-sans text-purple-600 mt-1">
                    {(analysis.aiScore || 0) > 80
                      ? 'Excellent optimization'
                      : (analysis.aiScore || 0) > 60
                      ? 'Good optimization'
                      : 'Needs improvement'}
                  </p>
                </div>

                {/* Course Metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-sans text-gray-600 block">Total Distance</span>
                    <span className="font-sans font-semibold text-lg text-gray-800">
                      {(analysis.totalDistance || 0).toFixed(0)}m
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-sans text-gray-600 block">Avg Distance</span>
                    <span className="font-sans font-semibold text-lg text-gray-800">
                      {(analysis.averageDistance || 0).toFixed(1)}m
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-sans text-gray-600 block">Sharp Turns</span>
                    <span className="font-sans font-semibold text-lg text-gray-800">
                      {analysis.sharpTurns || 0}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="font-sans text-gray-600 block">Combinations</span>
                    <span className="font-sans font-semibold text-lg text-gray-800">
                      {analysis.combinations || 0}
                    </span>
                  </div>
                </div>

                {/* Compliance */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-sans text-gray-600">Level Compliance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (analysis.compliance || 0) > 80
                            ? 'bg-green-500'
                            : (analysis.compliance || 0) > 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.compliance || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-sans font-semibold text-gray-800">
                      {analysis.compliance || 0}%
                    </span>
                  </div>
                </div>

                {/* Issues */}
                {analysis.issues && analysis.issues.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-serif font-semibold text-red-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Issues Found
                    </h3>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="text-xs font-sans text-red-600 bg-red-50 p-2 rounded border border-red-200"
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
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-serif font-semibold text-green-800 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Perfect Course!
                      </h3>
                      <p className="text-xs font-sans text-green-700 mt-1">
                        This course meets all requirements for this level
                      </p>
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseAnalysisPanel;
