
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Palette } from 'lucide-react';
import { useCourseBuilder } from './CourseBuilderContext';

const CourseBuilderModeToggle = () => {
  const { designMode, setDesignMode } = useCourseBuilder();

  return (
    <div className="flex bg-purple-50 rounded-lg p-1">
      <Button
        variant={designMode === 'ai' ? 'default' : 'ghost'}
        onClick={() => setDesignMode('ai')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all font-sans ${
          designMode === 'ai'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-purple-700 hover:bg-purple-100'
        }`}
      >
        <Bot className="w-4 h-4" />
        <span>AI Mode</span>
      </Button>
      <Button
        variant={designMode === 'manual' ? 'default' : 'ghost'}
        onClick={() => setDesignMode('manual')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all font-sans ${
          designMode === 'manual'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-purple-700 hover:bg-purple-100'
        }`}
      >
        <Palette className="w-4 h-4" />
        <span>Manual</span>
      </Button>
    </div>
  );
};

export default CourseBuilderModeToggle;
