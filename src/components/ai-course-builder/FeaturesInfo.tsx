import { Sparkles } from "lucide-react";
import React from "react";

const FeaturesInfo = () => {
  return (
    <>
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
          Complete Course Design Platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">
              🤖 AI Course Generator
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>• AI selects optimal jump types</li>
              <li>• Smart height variation</li>
              <li>• Automatic safety validation</li>
              <li>• Level-appropriate complexity</li>
              <li>• Three course styles available</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-3">
              🎨 Manual Designer
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>
                • <strong>Drag & Drop:</strong> Move jumps by dragging
              </li>
              <li>
                • <strong>Course Upload:</strong> Parse text descriptions
              </li>
              <li>
                • <strong>Visual Selection:</strong> Click to select jumps
              </li>
              <li>
                • <strong>Jump Types:</strong> 6 different styles
              </li>
              <li>• Real-time validation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-3">
              📤 Export & Share
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>
                • <strong>JSON Export:</strong> Complete course data
              </li>
              <li>
                • <strong>Professional Format:</strong> Ready for sharing
              </li>
              <li>
                • <strong>Analysis Included:</strong> All metrics exported
              </li>
              <li>
                • <strong>Print Ready:</strong> Professional course maps
              </li>
              <li>• Share with coaches & competitors</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeaturesInfo;
