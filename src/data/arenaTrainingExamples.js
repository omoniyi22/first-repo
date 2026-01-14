// src/data/arenaTrainingExamples.js
// Professional arena training examples based on your 12 real competition images

export const arenaTrainingExamples = [
  {
    name: "Paris Grand Indoor 2018",
    description: "Professional indoor arena, 13 jumps, flowing pattern with combinations",
    arenaSize: { width: 70, length: 45 },
    jumpPattern: "flowing",
    jumpPositions: [
      { x: 35, y: 38, type: "vertical" },    // Jump 1 (Start area)
      { x: 55, y: 35, type: "vertical" },    // Jump 2
      { x: 25, y: 25, type: "water" },       // Jump 3 (Water jump - blue)
      { x: 15, y: 15, type: "vertical" },    // Jump 4a
      { x: 20, y: 15, type: "vertical" },    // Jump 4b (combination)
      { x: 25, y: 15, type: "vertical" },    // Jump 4c (combination)
      { x: 55, y: 15, type: "oxer" },        // Jump 5
      { x: 50, y: 35, type: "vertical" },    // Jump 6
      { x: 12, y: 25, type: "vertical" },    // Jump 8
      { x: 30, y: 8, type: "vertical" },     // Jump 9
      { x: 45, y: 25, type: "vertical" },    // Jump 10a
      { x: 45, y: 28, type: "vertical" },    // Jump 10b (combination)
      { x: 50, y: 8, type: "vertical" },     // Jump 11
      { x: 55, y: 8, type: "water" },        // Jump 12 (Water jump)
      { x: 15, y: 30, type: "triple" }       // Jump 13
    ]
  },
  {
    name: "Speed Competition Arena",
    description: "Technical grid arena, 11 jumps, systematic pattern for speed",
    arenaSize: { width: 80, length: 50 },
    jumpPattern: "technical",
    jumpPositions: [
      { x: 60, y: 15, type: "vertical" },    // Jump 1 (Start)
      { x: 25, y: 10, type: "oxer" },        // Jump 2
      { x: 25, y: 25, type: "vertical" },    // Jump 3
      { x: 20, y: 25, type: "vertical" },    // Jump 10 (combination)
      { x: 65, y: 25, type: "oxer" },        // Jump 4
      { x: 45, y: 25, type: "vertical" },    // Jump 5
      { x: 15, y: 35, type: "oxer" },        // Jump 6
      { x: 40, y: 30, type: "vertical" },    // Jump 7a
      { x: 40, y: 35, type: "vertical" },    // Jump 7b (combination)
      { x: 25, y: 45, type: "vertical" },    // Jump 8
      { x: 25, y: 48, type: "vertical" },    // Jump 9
      { x: 70, y: 25, type: "vertical" }     // Jump 11 (Finish)
    ]
  },
  {
    name: "Macon Grand Indoor 2019",
    description: "Flowing indoor course, 12 jumps, smooth curves and combinations",
    arenaSize: { width: 65, length: 40 },
    jumpPattern: "flowing",
    jumpPositions: [
      { x: 35, y: 25, type: "vertical" },    // Start area
      { x: 15, y: 8, type: "oxer" },         // Jump 2
      { x: 25, y: 20, type: "vertical" },    // Jump 3
      { x: 55, y: 8, type: "oxer" },         // Jump 4
      { x: 55, y: 15, type: "oxer" },        // Jump 5
      { x: 12, y: 15, type: "vertical" },    // Jump 6a
      { x: 18, y: 15, type: "vertical" },    // Jump 6b (combination)
      { x: 50, y: 25, type: "vertical" },    // Jump 8
      { x: 40, y: 30, type: "vertical" },    // Jump 9a
      { x: 40, y: 32, type: "vertical" },    // Jump 9b (combination)
      { x: 15, y: 25, type: "vertical" },    // Jump 10
      { x: 30, y: 8, type: "vertical" },     // Jump 11a
      { x: 35, y: 8, type: "vertical" },     // Jump 11b (combination)
      { x: 45, y: 8, type: "oxer" }          // Jump 12 (Finish)
    ]
  },
  {
    name: "Deauville Grand National 2018",
    description: "Large outdoor arena, 16 jumps, complex technical pattern",
    arenaSize: { width: 90, length: 60 },
    jumpPattern: "technical",
    jumpPositions: [
      { x: 45, y: 15, type: "vertical" },    // Jump 1 (Start)
      { x: 15, y: 45, type: "vertical" },    // Jump 2
      { x: 15, y: 25, type: "vertical" },    // Jump 3
      { x: 20, y: 35, type: "vertical" },    // Jump 4A
      { x: 25, y: 35, type: "vertical" },    // Jump 4B (combination)
      { x: 45, y: 50, type: "vertical" },    // Jump 5
      { x: 35, y: 30, type: "water" },       // Jump 6 (Water jump)
      { x: 50, y: 20, type: "vertical" },    // Jump 7
      { x: 80, y: 45, type: "vertical" },    // Jump 8
      { x: 25, y: 15, type: "vertical" },    // Jump 9
      { x: 70, y: 30, type: "vertical" },    // Jump 10A
      { x: 70, y: 25, type: "vertical" },    // Jump 10B (combination)
      { x: 70, y: 20, type: "vertical" },    // Jump 10C (triple combination)
      { x: 75, y: 15, type: "vertical" },    // Jump 11
      { x: 60, y: 40, type: "vertical" },    // Jump 12
      { x: 20, y: 50, type: "water" },       // Jump 13 (Water jump)
      { x: 55, y: 10, type: "vertical" },    // Jump 14
      { x: 85, y: 25, type: "vertical" }     // Jump 15
    ]
  },
  {
    name: "Grand Prix Arena Layout 1",
    description: "Professional Grand Prix course, 12 jumps, complex routing",
    arenaSize: { width: 110, length: 70 },
    jumpPattern: "technical",
    jumpPositions: [
      { x: 55, y: 15, type: "vertical" },    // Jump 1 (Start)
      { x: 85, y: 15, type: "vertical" },    // Jump 2
      { x: 25, y: 35, type: "vertical" },    // Jump 3
      { x: 20, y: 30, type: "vertical" },    // Jump 4
      { x: 15, y: 20, type: "vertical" },    // Jump 5A
      { x: 20, y: 20, type: "vertical" },    // Jump 5B (combination)
      { x: 55, y: 50, type: "vertical" },    // Jump 6
      { x: 70, y: 35, type: "vertical" },    // Jump 7
      { x: 60, y: 40, type: "vertical" },    // Jump 8A
      { x: 65, y: 40, type: "oxer" },        // Jump 8B (combination)
      { x: 25, y: 55, type: "vertical" },    // Jump 9A
      { x: 30, y: 55, type: "vertical" },    // Jump 9B (combination)
      { x: 85, y: 50, type: "vertical" },    // Jump 10
      { x: 95, y: 35, type: "oxer" },        // Jump 11
      { x: 80, y: 20, type: "vertical" },    // Jump 12 (Finish)
      { x: 65, y: 15, type: "vertical" }     // Jump 15 (Alternative)
    ]
  },
  {
    name: "Haras de Jardy Amateur 110",
    description: "Amateur level course, 11 jumps, flowing pattern with combinations",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "flowing",
    jumpPositions: [
      { x: 50, y: 15, type: "oxer" },        // Jump 1 (Start)
      { x: 80, y: 35, type: "vertical" },    // Jump 2
      { x: 90, y: 35, type: "oxer" },        // Jump 3
      { x: 75, y: 25, type: "vertical" },    // Jump 4
      { x: 35, y: 40, type: "vertical" },    // Jump 5A
      { x: 35, y: 35, type: "vertical" },    // Jump 5B (combination)
      { x: 15, y: 45, type: "vertical" },    // Jump 6
      { x: 50, y: 50, type: "vertical" },    // Jump 7
      { x: 85, y: 50, type: "vertical" },    // Jump 8
      { x: 25, y: 30, type: "vertical" },    // Jump 9A
      { x: 30, y: 25, type: "vertical" },    // Jump 9B (combination)
      { x: 15, y: 20, type: "vertical" },    // Jump 10
      { x: 25, y: 15, type: "vertical" }     // Jump 11 (Finish)
    ]
  },
  {
    name: "Haras de Jardy Amateur 120",
    description: "Intermediate amateur course, 11 jumps, technical elements",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "technical",
    jumpPositions: [
      { x: 40, y: 45, type: "oxer" },        // Jump 1 (Start)
      { x: 75, y: 25, type: "vertical" },    // Jump 2
      { x: 90, y: 35, type: "oxer" },        // Jump 3
      { x: 75, y: 35, type: "vertical" },    // Jump 4
      { x: 40, y: 12, type: "vertical" },    // Jump 5A
      { x: 50, y: 12, type: "oxer" },        // Jump 5B (combination)
      { x: 15, y: 35, type: "oxer" },        // Jump 6
      { x: 45, y: 40, type: "vertical" },    // Jump 7
      { x: 25, y: 45, type: "vertical" },    // Jump 8A
      { x: 30, y: 45, type: "vertical" },    // Jump 8B (combination)
      { x: 25, y: 25, type: "vertical" },    // Jump 9
      { x: 75, y: 45, type: "oxer" }         // Jump 11 (Finish)
    ]
  },
  {
    name: "Haras de Jardy Amateur 125",
    description: "Advanced amateur course, 11 jumps, challenging combinations",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "technical",
    jumpPositions: [
      { x: 35, y: 45, type: "oxer" },        // Jump 1 (Start)
      { x: 75, y: 25, type: "vertical" },    // Jump 2
      { x: 90, y: 35, type: "oxer" },        // Jump 3
      { x: 75, y: 35, type: "vertical" },    // Jump 4
      { x: 40, y: 12, type: "vertical" },    // Jump 5A
      { x: 50, y: 12, type: "oxer" },        // Jump 5B (combination)
      { x: 15, y: 35, type: "oxer" },        // Jump 6
      { x: 45, y: 40, type: "vertical" },    // Jump 7
      { x: 30, y: 15, type: "vertical" },    // Jump 8A
      { x: 35, y: 15, type: "vertical" },    // Jump 8B (combination)
      { x: 25, y: 25, type: "vertical" },    // Jump 9
      { x: 30, y: 30, type: "vertical" },    // Jump 10A
      { x: 25, y: 30, type: "vertical" },    // Jump 10B (combination)
      { x: 75, y: 45, type: "oxer" }         // Jump 11 (Finish)
    ]
  },
  {
    name: "Pro Vitesse 120",
    description: "Professional speed course, 11 jumps, time-optimized layout",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "power",
    jumpPositions: [
      { x: 75, y: 35, type: "oxer" },        // Jump 1 (Start)
      { x: 35, y: 25, type: "vertical" },    // Jump 2
      { x: 15, y: 45, type: "vertical" },    // Jump 3
      { x: 30, y: 10, type: "oxer" },        // Jump 4A
      { x: 35, y: 10, type: "vertical" },    // Jump 4B (combination)
      { x: 45, y: 40, type: "oxer" },        // Jump 5
      { x: 15, y: 30, type: "oxer" },        // Jump 6
      { x: 40, y: 12, type: "vertical" },    // Jump 7A
      { x: 50, y: 12, type: "oxer" },        // Jump 7B (combination)
      { x: 80, y: 30, type: "vertical" },    // Jump 8
      { x: 90, y: 35, type: "oxer" },        // Jump 9
      { x: 75, y: 45, type: "vertical" },    // Jump 10
      { x: 45, y: 45, type: "vertical" }     // Jump 11 (Finish)
    ]
  },
  {
    name: "Pro Vitesse 130",
    description: "Advanced professional speed course, 11 jumps, complex routing",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "technical",
    jumpPositions: [
      { x: 55, y: 45, type: "vertical" },    // Jump 1 (Start)
      { x: 90, y: 35, type: "oxer" },        // Jump 2
      { x: 75, y: 35, type: "vertical" },    // Jump 3
      { x: 45, y: 10, type: "oxer" },        // Jump 4
      { x: 25, y: 45, type: "vertical" },    // Jump 5
      { x: 30, y: 25, type: "vertical" },    // Jump 6A
      { x: 35, y: 25, type: "oxer" },        // Jump 6B (combination)
      { x: 15, y: 35, type: "oxer" },        // Jump 8
      { x: 35, y: 45, type: "vertical" },    // Jump 9 (Finish)
      { x: 65, y: 25, type: "oxer" },        // Jump 10
      { x: 85, y: 20, type: "vertical" },    // Jump 11
      { x: 40, y: 12, type: "vertical" },    // Jump 7A
      { x: 50, y: 12, type: "oxer" }         // Jump 7B (combination)
    ]
  },
  {
    name: "Grand Prix 125",
    description: "Grand Prix level course, 12 jumps, championship layout",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "flowing",
    jumpPositions: [
      { x: 25, y: 10, type: "vertical" },    // Jump 1 (Start)
      { x: 45, y: 10, type: "oxer" },        // Jump 2
      { x: 65, y: 30, type: "oxer" },        // Jump 3
      { x: 25, y: 35, type: "vertical" },    // Jump 4
      { x: 35, y: 40, type: "oxer" },        // Jump 5
      { x: 55, y: 10, type: "oxer" },        // Jump 6A
      { x: 60, y: 10, type: "vertical" },    // Jump 6B (combination)
      { x: 85, y: 25, type: "oxer" },        // Jump 7
      { x: 45, y: 30, type: "vertical" },    // Jump 8
      { x: 45, y: 12, type: "vertical" },    // Jump 9
      { x: 85, y: 12, type: "oxer" },        // Jump 10
      { x: 65, y: 45, type: "vertical" },    // Jump 11A
      { x: 70, y: 40, type: "oxer" },        // Jump 11B (combination)
      { x: 25, y: 20, type: "vertical" }     // Jump 12 (Finish)
    ]
  },
  {
    name: "Grand Prix 120 Two Phase",
    description: "Two-phase Grand Prix course, 12 jumps, time-critical second phase",
    arenaSize: { width: 100, length: 60 },
    jumpPattern: "power",
    jumpPositions: [
      { x: 25, y: 10, type: "vertical" },    // Jump 1 (Start)
      { x: 45, y: 10, type: "oxer" },        // Jump 2
      { x: 65, y: 25, type: "oxer" },        // Jump 3
      { x: 25, y: 30, type: "vertical" },    // Jump 4
      { x: 35, y: 35, type: "oxer" },        // Jump 5
      { x: 55, y: 10, type: "oxer" },        // Jump 6A
      { x: 60, y: 10, type: "vertical" },    // Jump 6B (combination)
      { x: 85, y: 25, type: "oxer" },        // Jump 7
      { x: 45, y: 30, type: "vertical" },    // Jump 8
      { x: 25, y: 20, type: "vertical" },    // Jump 9
      { x: 30, y: 20, type: "oxer" },        // Jump 10A
      { x: 35, y: 20, type: "vertical" },    // Jump 10B (combination)
      { x: 65, y: 35, type: "vertical" },    // Jump 11
      { x: 85, y: 45, type: "vertical" },    // Jump 12 (Finish)
      { x: 90, y: 15, type: "vertical" }     // Jump 15 (Phase 2)
    ]
  }
];

// Helper function to find similar arena examples
export const findSimilarArenas = (targetWidth, targetLength, targetStyle = null) => {
  return arenaTrainingExamples
    .filter(example => {
      const widthDiff = Math.abs(example.arenaSize.width - targetWidth);
      const lengthDiff = Math.abs(example.arenaSize.length - targetLength);
      const sizeSimilar = widthDiff <= 30 && lengthDiff <= 20;
      
      if (targetStyle) {
        return sizeSimilar && example.jumpPattern === targetStyle;
      }
      return sizeSimilar;
    })
    .sort((a, b) => {
      const aDiff = Math.abs(a.arenaSize.width - targetWidth) + Math.abs(a.arenaSize.length - targetLength);
      const bDiff = Math.abs(b.arenaSize.width - targetWidth) + Math.abs(b.arenaSize.length - targetLength);
      return aDiff - bDiff;
    });
};

// Get course style recommendations based on training examples
export const getStyleRecommendations = (targetStyle) => {
  const styleExamples = arenaTrainingExamples.filter(ex => ex.jumpPattern === targetStyle);
  
  if (styleExamples.length === 0) return [];
  
  return styleExamples.map(ex => ({
    name: ex.name,
    description: ex.description,
    jumpCount: ex.jumpPositions.length,
    arenaSize: ex.arenaSize
  }));
};