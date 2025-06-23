
import React from "react";
import { Sparkles, Brain, Target, BarChart3, Shield, Users } from "lucide-react";

const FeaturesInfo = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Generate optimized courses using advanced AI algorithms trained on professional course designs.",
    },
    {
      icon: Brain,
      title: "Intelligent Analysis",
      description: "Get detailed feedback on course flow, difficulty, safety, and compliance with competition standards.",
    },
    {
      icon: Target,
      title: "Level-Specific Design",
      description: "Courses automatically adapt to competition levels from novice to grand prix with appropriate heights and complexity.",
    },
    {
      icon: BarChart3,
      title: "Performance Metrics",
      description: "Track distances, turn angles, combinations, and technical difficulty to optimize your course design.",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Built-in safety checks ensure proper distances, turning radii, and compliance with FEI regulations.",
    },
    {
      icon: Users,
      title: "Professional Standard",
      description: "Designs meet international competition standards and best practices used by professional course designers.",
    },
  ];

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-purple-800 mb-4">
          Professional Course Design Tools
        </h2>
        <p className="text-lg text-gray-600 font-sans max-w-3xl mx-auto">
          Whether you're a course designer, trainer, or competitor, our AI-powered tools help you create
          safe, challenging, and regulation-compliant show jumping courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-gray-800">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-600 font-sans leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-xl font-serif font-semibold text-purple-800 mb-2">
            Ready to Design Your Course?
          </h3>
          <p className="text-purple-600 font-sans">
            Start with AI generation for quick results, or use manual design for complete control.
            Both modes provide professional analysis and feedback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesInfo;
