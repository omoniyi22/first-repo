
import React from "react";
import { Sparkles, Settings } from "lucide-react";
import { useCourseBuilder } from "./CourseBuilderContext";

const CourseBuilderModeToggle = () => {
  const { designMode, setDesignMode } = useCourseBuilder();

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-center space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setDesignMode("ai")}
          className={`flex-1 py-3 px-6 rounded-md transition-all duration-300 font-medium ${
            designMode === "ai"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-white"
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          AI Course Generator
        </button>
        <button
          onClick={() => setDesignMode("manual")}
          className={`flex-1 py-3 px-6 rounded-md transition-all duration-300 font-medium ${
            designMode === "manual"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
              : "text-gray-600 hover:text-gray-800 hover:bg-white"
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Manual Designer
        </button>
      </div>
    </div>
  );
};

export default CourseBuilderModeToggle;
