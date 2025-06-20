
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Competition level definitions
const competitionLevels = {
  showjumping: {
    'intro': { maxHeight: 0.6, minHeight: 0.4, maxJumps: 8, description: 'Beginner level (0.4-0.6m)' },
    'novice': { maxHeight: 0.9, minHeight: 0.7, maxJumps: 10, description: 'Basic competition (0.7-0.9m)' },
    'elementary': { maxHeight: 1.0, minHeight: 0.8, maxJumps: 10, description: 'Intermediate (0.8-1.0m)' },
    'medium': { maxHeight: 1.15, minHeight: 0.95, maxJumps: 12, description: 'Advanced amateur (0.95-1.15m)' },
    'advanced': { maxHeight: 1.25, minHeight: 1.05, maxJumps: 12, description: 'Advanced (1.05-1.25m)' },
    'grand_prix': { maxHeight: 1.6, minHeight: 1.4, maxJumps: 14, description: 'Professional (1.4-1.6m)' }
  },
  eventing: {
    '1star': { maxHeight: 1.05, minHeight: 0.9, maxJumps: 25, description: 'International 1-star (0.9-1.05m)' },
    '2star': { maxHeight: 1.15, minHeight: 1.0, maxJumps: 30, description: 'International 2-star (1.0-1.15m)' },
    '3star': { maxHeight: 1.25, minHeight: 1.1, maxJumps: 35, description: 'International 3-star (1.1-1.25m)' },
    '4star': { maxHeight: 1.25, minHeight: 1.15, maxJumps: 40, description: 'International 4-star (1.15-1.25m)' },
    '5star': { maxHeight: 1.25, minHeight: 1.2, maxJumps: 45, description: 'Olympic level (1.2-1.25m)' }
  },
  ponyclub: {
    'lead_rein': { maxHeight: 0.3, minHeight: 0.2, maxJumps: 6, description: 'Tiny tots (0.2-0.3m)' },
    'first_rung': { maxHeight: 0.4, minHeight: 0.3, maxJumps: 8, description: 'Beginner riders (0.3-0.4m)' },
    'minimus': { maxHeight: 0.5, minHeight: 0.4, maxJumps: 8, description: 'Young riders (0.4-0.5m)' },
    'novice_pc': { maxHeight: 0.7, minHeight: 0.5, maxJumps: 10, description: 'Developing riders (0.5-0.7m)' },
    'intermediate_pc': { maxHeight: 0.9, minHeight: 0.7, maxJumps: 12, description: 'Competent riders (0.7-0.9m)' }
  }
};

// Jump types with properties
const jumpTypes = [
  { id: 'vertical', name: 'Vertical', color: '#8B4513', width: 4, spread: 0, technicality: 0, difficulty: 1 },
  { id: 'oxer', name: 'Oxer', color: '#CD853F', width: 4, spread: 1.5, technicality: 1, difficulty: 2 },
  { id: 'triple', name: 'Triple Bar', color: '#DEB887', width: 6, spread: 2.0, technicality: 2, difficulty: 3 },
  { id: 'water', name: 'Water Jump', color: '#4169E1', width: 4, spread: 3.0, technicality: 1, difficulty: 4 },
  { id: 'liverpool', name: 'Liverpool', color: '#2E8B57', width: 4, spread: 2.0, technicality: 2, difficulty: 3 },
  { id: 'wall', name: 'Wall', color: '#696969', width: 4, spread: 0, technicality: 0, difficulty: 1 }
];

interface CourseBuilderContextType {
  // Basic settings
  discipline: string;
  setDiscipline: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  arenaWidth: number;
  setArenaWidth: (value: number) => void;
  arenaLength: number;
  setArenaLength: (value: number) => void;
  
  // Course data
  jumps: any[];
  setJumps: (jumps: any[]) => void;
  
  // AI settings
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  courseStyle: string;
  setCourseStyle: (value: string) => void;
  targetJumps: number;
  setTargetJumps: (value: number) => void;
  difficultyPreference: string;
  setDifficultyPreference: (value: string) => void;
  generationSettings: any;
  setGenerationSettings: (settings: any) => void;
  
  // Manual design
  designMode: string;
  setDesignMode: (mode: string) => void;
  selectedJumpType: string;
  setSelectedJumpType: (type: string) => void;
  selectedJump: string | null;
  setSelectedJump: (id: string | null) => void;
  
  // UI state
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  courseText: string;
  setCourseText: (text: string) => void;
  
  // Canvas interaction
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;
  
  // Constants and utilities
  competitionLevels: typeof competitionLevels;
  jumpTypes: typeof jumpTypes;
  getCurrentLevel: () => any;
  scale: number;
}

const CourseBuilderContext = createContext<CourseBuilderContextType | undefined>(undefined);

export const CourseBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [discipline, setDiscipline] = useState("showjumping");
  const [level, setLevel] = useState("novice");
  const [arenaWidth, setArenaWidth] = useState(60);
  const [arenaLength, setArenaLength] = useState(40);
  const [jumps, setJumps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseStyle, setCourseStyle] = useState("flowing");
  const [targetJumps, setTargetJumps] = useState(8);
  const [difficultyPreference, setDifficultyPreference] = useState("medium");
  const [showGrid, setShowGrid] = useState(true);
  const [courseText, setCourseText] = useState("");
  const [selectedJump, setSelectedJump] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [designMode, setDesignMode] = useState("ai");
  const [selectedJumpType, setSelectedJumpType] = useState("vertical");
  const [generationSettings, setGenerationSettings] = useState({
    allowCombinations: true,
    preferSmoothTurns: true,
    includeSpecialtyJumps: true,
    optimizeForFlow: true,
  });

  const scale = 8;

  // Get current level configuration
  const getCurrentLevel = () => {
    const levels = competitionLevels[discipline];
    if (!levels || !levels[level]) {
      return {
        maxHeight: 1.0,
        minHeight: 0.8,
        maxJumps: 8,
        description: "Default Level",
      };
    }
    return levels[level];
  };

  // Update target jumps when level changes
  useEffect(() => {
    const currentLevel = getCurrentLevel();
    if (currentLevel && currentLevel.maxJumps) {
      setTargetJumps(Math.min(targetJumps, currentLevel.maxJumps));
    }
  }, [discipline, level]);

  const value = {
    discipline,
    setDiscipline,
    level,
    setLevel,
    arenaWidth,
    setArenaWidth,
    arenaLength,
    setArenaLength,
    jumps,
    setJumps,
    isGenerating,
    setIsGenerating,
    courseStyle,
    setCourseStyle,
    targetJumps,
    setTargetJumps,
    difficultyPreference,
    setDifficultyPreference,
    generationSettings,
    setGenerationSettings,
    designMode,
    setDesignMode,
    selectedJumpType,
    setSelectedJumpType,
    selectedJump,
    setSelectedJump,
    showGrid,
    setShowGrid,
    courseText,
    setCourseText,
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
    competitionLevels,
    jumpTypes,
    getCurrentLevel,
    scale,
  };

  return (
    <CourseBuilderContext.Provider value={value}>
      {children}
    </CourseBuilderContext.Provider>
  );
};

export const useCourseBuilder = () => {
  const context = useContext(CourseBuilderContext);
  if (context === undefined) {
    throw new Error('useCourseBuilder must be used within a CourseBuilderProvider');
  }
  return context;
};
