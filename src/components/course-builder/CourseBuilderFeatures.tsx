
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Bot, Palette, Download } from 'lucide-react';

const CourseBuilderFeatures = () => {
  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
        <CardTitle className="flex items-center space-x-2 font-serif text-gray-800">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>Complete Course Design Platform</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-sans">
          <div>
            <h3 className="font-serif font-semibold text-gray-800 mb-3 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-purple-600" />
              AI Course Generator
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
            <h3 className="font-serif font-semibold text-gray-800 mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-purple-600" />
              Manual Designer
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>Drag & Drop:</strong> Move jumps by dragging</li>
              <li>• <strong>Course Upload:</strong> Parse text descriptions</li>
              <li>• <strong>Visual Selection:</strong> Click to select jumps</li>
              <li>• <strong>Jump Types:</strong> 6 different styles</li>
              <li>• Real-time validation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-semibold text-gray-800 mb-3 flex items-center">
              <Download className="w-4 h-4 mr-2 text-purple-600" />
              Export & Share
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>• <strong>JSON Export:</strong> Complete course data</li>
              <li>• <strong>Professional Format:</strong> Ready for sharing</li>
              <li>• <strong>Analysis Included:</strong> All metrics exported</li>
              <li>• <strong>Print Ready:</strong> Professional course maps</li>
              <li>• Share with coaches & competitors</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseBuilderFeatures;
