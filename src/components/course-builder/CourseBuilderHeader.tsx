
import React from "react";
import { Sparkles } from "lucide-react";

const CourseBuilderHeader = () => {
  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-800 flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-purple-600" />
            AI Jump Course Generator
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered intelligent course design for all competition levels
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderHeader;
