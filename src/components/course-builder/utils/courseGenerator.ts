
import { Jump, CourseAnalysis, GenerationSettings } from '../CourseBuilderContext';
import { jumpTypes, competitionLevels } from '@/data/aiCourseBuilder';

interface GenerationParams {
  discipline: string;
  level: string;
  arenaWidth: number;
  arenaLength: number;
  targetJumps: number;
  courseStyle: string;
  difficultyPreference: string;
  generationSettings: GenerationSettings;
}

interface GenerationResult {
  jumps: Jump[];
  analysis: CourseAnalysis;
}

export const generateAICourse = async (params: GenerationParams): Promise<GenerationResult | null> => {
  try {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const {
      discipline,
      level,
      arenaWidth,
      arenaLength,
      targetJumps,
      courseStyle,
      difficultyPreference,
      generationSettings
    } = params;

    // Get level constraints
    const levels = competitionLevels[discipline as keyof typeof competitionLevels];
    const levelData = levels?.[level as keyof typeof levels] as any;
    
    if (!levelData) {
      throw new Error('Invalid discipline or level');
    }

    // Generate jumps based on course style and settings
    const jumps = generateJumps({
      targetJumps,
      arenaWidth,
      arenaLength,
      courseStyle,
      difficultyPreference,
      generationSettings,
      levelData
    });

    // Generate analysis
    const analysis = analyzeGeneratedCourse(jumps, levelData);

    return { jumps, analysis };
  } catch (error) {
    console.error('Failed to generate course:', error);
    return null;
  }
};

function generateJumps(params: {
  targetJumps: number;
  arenaWidth: number;
  arenaLength: number;
  courseStyle: string;
  difficultyPreference: string;
  generationSettings: GenerationSettings;
  levelData: any;
}): Jump[] {
  const { targetJumps, arenaWidth, arenaLength, courseStyle, difficultyPreference, generationSettings } = params;
  const jumps: Jump[] = [];

  // Generate jump positions based on course style
  const positions = generateJumpPositions(targetJumps, arenaWidth, arenaLength, courseStyle);

  positions.forEach((pos, index) => {
    const jumpType = selectOptimalJumpType(index, targetJumps, difficultyPreference, generationSettings);
    
    jumps.push({
      id: Date.now() + index,
      x: pos.x,
      y: pos.y,
      type: jumpType,
      number: index + 1,
      height: calculateJumpHeight(jumpType, difficultyPreference, params.levelData)
    });
  });

  return jumps;
}

function generateJumpPositions(
  count: number,
  width: number,
  length: number,
  style: string
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const margin = 10;

  switch (style) {
    case 'flowing':
      // Generate smooth flowing patterns
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const radius = Math.min(width, length) * 0.3;
        const centerX = width / 2;
        const centerY = length / 2;
        
        positions.push({
          x: Math.max(margin, Math.min(width - margin, centerX + radius * Math.cos(angle))),
          y: Math.max(margin, Math.min(length - margin, centerY + radius * Math.sin(angle)))
        });
      }
      break;

    case 'technical':
      // Generate tight technical patterns
      for (let i = 0; i < count; i++) {
        positions.push({
          x: margin + (i % 2) * (width - 2 * margin) + Math.random() * 10 - 5,
          y: margin + Math.floor(i / 2) * ((length - 2 * margin) / Math.ceil(count / 2))
        });
      }
      break;

    case 'power':
      // Generate power-focused straight lines
      for (let i = 0; i < count; i++) {
        const isEven = i % 2 === 0;
        positions.push({
          x: isEven ? width * 0.25 : width * 0.75,
          y: margin + i * ((length - 2 * margin) / (count - 1))
        });
      }
      break;

    default:
      // Default pattern
      for (let i = 0; i < count; i++) {
        positions.push({
          x: margin + Math.random() * (width - 2 * margin),
          y: margin + Math.random() * (length - 2 * margin)
        });
      }
  }

  return positions;
}

function selectOptimalJumpType(
  index: number,
  totalJumps: number,
  difficulty: string,
  settings: GenerationSettings
): string {
  const availableTypes = jumpTypes.filter(type => {
    if (!settings.includeSpecialtyJumps && ['water', 'liverpool'].includes(type.id)) {
      return false;
    }
    return true;
  });

  // Select based on difficulty and position
  let targetDifficulty = 1;
  if (difficulty === 'easy') {
    targetDifficulty = 1;
  } else if (difficulty === 'medium') {
    targetDifficulty = 2;
  } else if (difficulty === 'challenging') {
    targetDifficulty = 3;
  }

  const suitableTypes = availableTypes.filter(type => type.difficulty <= targetDifficulty);
  return suitableTypes[Math.floor(Math.random() * suitableTypes.length)]?.id || 'vertical';
}

function calculateJumpHeight(jumpType: string, difficulty: string, levelData: any): number {
  const baseHeight = (levelData.minHeight + levelData.maxHeight) / 2;
  
  let modifier = 1;
  if (difficulty === 'easy') modifier = 0.9;
  else if (difficulty === 'challenging') modifier = 1.1;

  return Math.max(levelData.minHeight, Math.min(levelData.maxHeight, baseHeight * modifier));
}

function analyzeGeneratedCourse(jumps: Jump[], levelData: any): CourseAnalysis {
  // Calculate total and average distances
  let totalDistance = 0;
  for (let i = 1; i < jumps.length; i++) {
    const prev = jumps[i - 1];
    const curr = jumps[i];
    const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    totalDistance += distance;
  }

  const averageDistance = totalDistance / (jumps.length - 1);

  // Calculate sharp turns (simplified)
  let sharpTurns = 0;
  for (let i = 1; i < jumps.length - 1; i++) {
    const prev = jumps[i - 1];
    const curr = jumps[i];
    const next = jumps[i + 1];
    
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    const angleDiff = Math.abs(angle2 - angle1);
    
    if (angleDiff > Math.PI / 2) {
      sharpTurns++;
    }
  }

  // Basic compliance check
  const compliance = jumps.every(jump => 
    jump.height >= levelData.minHeight && jump.height <= levelData.maxHeight
  ) ? 100 : 80;

  // Generate AI score based on various factors
  const aiScore = Math.min(100, Math.max(50, 
    100 - (sharpTurns * 5) + (averageDistance > 15 ? 10 : 0)
  ));

  return {
    aiScore,
    totalDistance,
    averageDistance,
    sharpTurns,
    combinations: 0, // Simplified for now
    compliance,
    issues: sharpTurns > 3 ? ['Course has too many sharp turns'] : []
  };
}
