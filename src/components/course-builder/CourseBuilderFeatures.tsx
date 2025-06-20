
import React from "react";
import { Sparkles, Settings, TrendingUp, Target } from "lucide-react";

const CourseBuilderFeatures = () => {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Generation",
      description: "Create professional courses instantly with our intelligent algorithm that considers flow, difficulty, and competition standards."
    },
    {
      icon: <Settings className="w-8 h-8 text-blue-600" />,
      title: "Manual Design Tools",
      description: "Take full control with drag-and-drop design, custom jump placement, and text-based course import capabilities."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Real-time Analysis",
      description: "Get instant feedback on course quality, difficulty levels, and compliance with competition regulations."
    },
    {
      icon: <Target className="w-8 h-8 text-orange-600" />,
      title: "Competition Standards",
      description: "Built-in knowledge of FEI, national, and regional competition requirements for accurate course design."
    }
  ];

  return (
    <div className="glass-card p-8 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
          Professional Course Design Made Simple
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Whether you're designing for competitions, training, or educational purposes, 
          our AI-powered tools help you create courses that challenge and inspire riders at every level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-6 bg-white/50 rounded-lg">
            <div className="flex justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-serif font-semibold text-gray-800 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseBuilderFeatures;
