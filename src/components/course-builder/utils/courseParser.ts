
import { Jump } from '../CourseBuilderContext';
import { jumpTypes } from '@/data/aiCourseBuilder';

export const parseCourseText = (text: string, arenaWidth: number, arenaLength: number): Jump[] => {
  const jumps: Jump[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  lines.forEach((line, index) => {
    const parsedJump = parseJumpLine(line, index + 1, arenaWidth, arenaLength);
    if (parsedJump) {
      jumps.push(parsedJump);
    }
  });

  return jumps;
};

function parseJumpLine(line: string, number: number, arenaWidth: number, arenaLength: number): Jump | null {
  // Clean and normalize the line
  const cleanLine = line.toLowerCase().trim();
  
  // Extract jump type
  let jumpType = 'vertical'; // default
  
  for (const type of jumpTypes) {
    if (cleanLine.includes(type.name.toLowerCase()) || cleanLine.includes(type.id)) {
      jumpType = type.id;
      break;
    }
  }

  // Generate random position (can be enhanced to parse coordinates if provided)
  const x = 10 + Math.random() * (arenaWidth - 20);
  const y = 10 + Math.random() * (arenaLength - 20);

  return {
    id: Date.now() + number,
    x,
    y,
    type: jumpType,
    number,
    height: 1.0 // default height
  };
}
