
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Jump {
  id: number;
  x: number;
  y: number;
  type: string;
  number: number;
  height: number;
}

export interface CourseAnalysis {
  aiScore?: number;
  totalDistance?: number;
  averageDistance?: number;
  sharpTurns?: number;
  combinations?: number;
  compliance?: number;
  issues?: string[];
}

export interface GenerationSettings {
  allowCombinations: boolean;
  preferSmoothTurns: boolean;
  includeSpecialtyJumps: boolean;
  optimizeForFlow: boolean;
}

interface CourseBuilderContextType {
  // Design mode
  designMode: 'ai' | 'manual';
  setDesignMode: (mode: 'ai' | 'manual') => void;
  
  // Course settings
  discipline: string;
  setDiscipline: (discipline: string) => void;
  level: string;
  setLevel: (level: string) => void;
  arenaWidth: number;
  setArenaWidth: (width: number) => void;
  arenaLength: number;
  setArenaLength: (length: number) => void;
  
  // AI specific settings
  targetJumps: number;
  setTargetJumps: (jumps: number) => void;
  courseStyle: string;
  setCourseStyle: (style: string) => void;
  difficultyPreference: string;
  setDifficultyPreference: (difficulty: string) => void;
  generationSettings: GenerationSettings;
  setGenerationSettings: (settings: GenerationSettings) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  
  // Manual specific settings
  selectedJumpType: string;
  setSelectedJumpType: (type: string) => void;
  courseText: string;
  setCourseText: (text: string) => void;
  selectedJump: number | null;
  setSelectedJump: (id: number | null) => void;
  
  // Course data
  jumps: Jump[];
  setJumps: (jumps: Jump[]) => void;
  analysis: CourseAnalysis | null;
  setAnalysis: (analysis: CourseAnalysis | null) => void;
}

const CourseBuilderContext = createContext<CourseBuilderContextType | undefined>(undefined);

export const useCourseBuilder = () => {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilder must be used within a CourseBuilderProvider');
  }
  return context;
};

interface CourseBuilderProviderProps {
  children: ReactNode;
}

export const CourseBuilderProvider: React.FC<CourseBuilderProviderProps> = ({ children }) => {
  const [designMode, setDesignMode] = useState<'ai' | 'manual'>('ai');
  const [discipline, setDiscipline] = useState('showjumping');
  const [level, setLevel] = useState('novice');
  const [arenaWidth, setArenaWidth] = useState(60);
  const [arenaLength, setArenaLength] = useState(40);
  const [targetJumps, setTargetJumps] = useState(8);
  const [courseStyle, setCourseStyle] = useState('flowing');
  const [difficultyPreference, setDifficultyPreference] = useState('medium');
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    allowCombinations: true,
    preferSmoothTurns: true,
    includeSpecialtyJumps: false,
    optimizeForFlow: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedJumpType, setSelectedJumpType] = useState('vertical');
  const [courseText, setCourseText] = useState('');
  const [selectedJump, setSelectedJump] = useState<number | null>(null);
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [analysis, setAnalysis] = useState<CourseAnalysis | null>(null);

  const value: CourseBuilderContextType = {
    designMode,
    setDesignMode,
    discipline,
    setDiscipline,
    level,
    setLevel,
    arenaWidth,
    setArenaWidth,
    arenaLength,
    setArenaLength,
    targetJumps,
    setTargetJumps,
    courseStyle,
    setCourseStyle,
    difficultyPreference,
    setDifficultyPreference,
    generationSettings,
    setGenerationSettings,
    isGenerating,
    setIsGenerating,
    selectedJumpType,
    setSelectedJumpType,
    courseText,
    setCourseText,
    selectedJump,
    setSelectedJump,
    jumps,
    setJumps,
    analysis,
    setAnalysis,
  };

  return (
    <CourseBuilderContext.Provider value={value}>
      {children}
    </CourseBuilderContext.Provider>
  );
};
