
import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Bot } from 'lucide-react';
import CourseBuilderModeToggle from './CourseBuilderModeToggle';
import { useCourseBuilder } from './CourseBuilderContext';

const CourseBuilderHeader = () => {
  const { designMode } = useCourseBuilder();

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
          AI Course Builder
        </h1>
        <p className="text-xl font-sans text-gray-600 max-w-3xl mx-auto">
          Design professional show jumping courses with AI assistance or manual tools
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl shadow-lg border border-purple-100">
        <div className="flex items-center space-x-3">
          {designMode === 'ai' ? (
            <Bot className="w-6 h-6 text-purple-600" />
          ) : (
            <Palette className="w-6 h-6 text-purple-600" />
          )}
          <div>
            <h2 className="text-lg font-serif font-semibold text-gray-800">
              {designMode === 'ai' ? 'AI-Powered Design' : 'Manual Design'}
            </h2>
            <p className="text-sm font-sans text-gray-600">
              {designMode === 'ai' 
                ? 'Let AI create optimized courses for you'
                : 'Design courses manually with full control'
              }
            </p>
          </div>
        </div>

        <CourseBuilderModeToggle />
      </div>
    </div>
  );
};

export default CourseBuilderHeader;
