
import React from "react";
import { useCourseBuilder } from "./CourseBuilderContext";
import { TrendingUp, Clock, Target } from "lucide-react";

const CourseAnalysisPanel = () => {
  const { jumps, arenaWidth, arenaLength, getCurrentLevel } = useCourseBuilder();
  
  const currentLevel = getCurrentLevel();

  // Calculate basic course metrics
  const totalDistance = jumps.reduce((total, jump, index) => {
    if (index === 0) return 0;
    const prevJump = jumps[index - 1];
    const distance = Math.sqrt(
      Math.pow(jump.x - prevJump.x, 2) + Math.pow(jump.y - prevJump.y, 2)
    );
    return total + distance;
  }, 0);

  const averageHeight = jumps.length > 0 
    ? jumps.reduce((sum, jump) => sum + jump.height, 0) / jumps.length 
    : 0;

  const estimatedTime = Math.round((totalDistance * 0.25) + (jumps.length * 3));

  return (
    <div className="space-y-6">
      {/* Course Statistics */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
          Course Analysis
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium">Total Jumps</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{jumps.length}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium">Average Height</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {averageHeight.toFixed(2)}m
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium">Est. Time</span>
            </div>
            <span className="text-lg font-bold text-purple-600">
              {estimatedTime}s
            </span>
          </div>
        </div>
      </div>

      {/* Level Requirements */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-serif font-semibold text-gray-800 mb-4">
          Level Requirements
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Height Range:</span>
            <span className="font-medium">
              {currentLevel?.minHeight}m - {currentLevel?.maxHeight}m
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Max Jumps:</span>
            <span className="font-medium">{currentLevel?.maxJumps}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Arena Size:</span>
            <span className="font-medium">{arenaWidth}m × {arenaLength}m</span>
          </div>
        </div>

        {jumps.length > (currentLevel?.maxJumps || 8) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              ⚠️ Course exceeds maximum jumps for this level
            </p>
          </div>
        )}
      </div>

      {/* Course Quality Indicators */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-serif font-semibold text-gray-800 mb-4">
          Course Quality
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Flow Score:</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: '75%' }}
                ></div>
              </div>
              <span className="text-sm font-medium">Good</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Difficulty:</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: '60%' }}
                ></div>
              </div>
              <span className="text-sm font-medium">Moderate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalysisPanel;
