// Dressage Skills Mapped by Difficulty Level
// This controls what movements and exercises are appropriate for each level

export interface SkillLevel {
  difficultyRange: [number, number]; // e.g., [1, 2] for beginner
  name: string;
  description: string;
  allowedMovements: string[];
  allowedExercises: string[];
  forbiddenMovements: string[];
  forbiddenExercises: string[];
  focusAreas: string[];
}

export const SKILLS_BY_DIFFICULTY: SkillLevel[] = [
  // =========================================
  // DIFFICULTY 1-2: INTRODUCTORY/BEGINNER
  // =========================================
  // Countries: UK (Intro, Prelim), US (Intro, Training), Germany (Class E), Australia (Prep, Prelim)
  {
    difficultyRange: [1, 2],
    name: "Introductory/Beginner",
    description: "Focus on rhythm, forward movement, and basic balance. Establishing foundation.",
    
    allowedMovements: [
      "walk",
      "free walk",
      "working trot",
      "rising trot",
      "sitting trot",
      "working canter",
      "halt",
      "transitions walk-trot-canter",
      "20m circles",
      "changes of rein across diagonal",
      "changes of rein through circle",
      "straightness on center line"
    ],
    
    allowedExercises: [
      "rhythm stabilization",
      "forward drive development",
      "straightness correction",
      "basic upward transitions",
      "basic downward transitions",
      "circle accuracy (20m only)",
      "tempo control",
      "accepting contact",
      "relaxation exercises",
      "confidence building"
    ],
    
    forbiddenMovements: [
      "leg yield",
      "shoulder-in",
      "shoulder-fore",
      "travers",
      "renvers",
      "half-pass",
      "flying changes",
      "simple changes",
      "counter canter",
      "collection",
      "medium gaits",
      "extended gaits",
      "lengthening",
      "10m circles",
      "15m circles",
      "pirouettes",
      "turn on haunches",
      "rein back",
      "piaffe",
      "passage"
    ],
    
    forbiddenExercises: [
      "lateral work",
      "leg yield training",
      "shoulder-in precision",
      "collection development",
      "flying change training",
      "half-pass development",
      "pirouette training",
      "extended gait work",
      "medium gait development",
      "counter canter exercises",
      "simple change practice",
      "small circle work"
    ],
    
    focusAreas: [
      "establishing rhythm and tempo",
      "developing forward movement",
      "straightness on lines and circles",
      "basic balance",
      "accepting contact",
      "relaxation and confidence",
      "accurate geometry (20m circles)",
      "smooth transitions"
    ]
  },

  // =========================================
  // DIFFICULTY 3: EARLY INTERMEDIATE
  // =========================================
  // Countries: UK (Novice), US (First Level), Germany (Class A), Australia (Novice)
  {
    difficultyRange: [3, 3],
    name: "Early Intermediate",
    description: "Introducing lateral movements and simple changes. Developing collection.",
    
    allowedMovements: [
      // All from previous level, plus:
      "leg yield",
      "15m circles",
      "10m circles (intro)",
      "medium walk",
      "lengthening stride (trot/canter)",
      "simple changes",
      "counter canter (intro)",
      "shallow loops (5m)",
      "rein back"
    ],
    
    allowedExercises: [
      // All from previous level, plus:
      "leg yield training",
      "leg yield clarity training",
      "simple change practice",
      "lengthening development",
      "10m circle practice",
      "15m circle accuracy",
      "counter canter intro",
      "intro to collection",
      "medium walk development"
    ],
    
    forbiddenMovements: [
      "shoulder-in (full)",
      "travers",
      "renvers",
      "half-pass",
      "flying changes",
      "medium gaits (full)",
      "extended gaits",
      "collection (full)",
      "pirouettes",
      "turn on haunches",
      "piaffe",
      "passage",
      "canter pirouettes"
    ],
    
    forbiddenExercises: [
      "shoulder-in precision",
      "flying change training",
      "half-pass development",
      "full collection work",
      "pirouette training",
      "extended gait work",
      "piaffe/passage development",
      "change sequences"
    ],
    
    focusAreas: [
      "lateral flexibility and bend",
      "simple changes with balance",
      "lengthening vs. rushing",
      "basic collection introduction",
      "10m circles with bend",
      "counter canter balance",
      "connection and throughness"
    ]
  },

  // =========================================
  // DIFFICULTY 4-5: INTERMEDIATE
  // =========================================
  // Countries: UK (Elementary), US (Second Level), Germany (Class L), Australia (Elementary)
  {
    difficultyRange: [4, 5],
    name: "Intermediate",
    description: "Developing collection, lateral work, and introducing flying changes.",
    
    allowedMovements: [
      // All from previous levels, plus:
      "shoulder-in",
      "shoulder-fore",
      "travers",
      "renvers",
      "half-pass (intro)",
      "flying changes (single)",
      "counter canter (full)",
      "medium trot",
      "medium canter",
      "collection (working level)",
      "10m circles (full)",
      "walk pirouette (intro)",
      "turn on haunches (intro)"
    ],
    
    allowedExercises: [
      // All from previous levels, plus:
      "shoulder-in precision training",
      "travers and renvers development",
      "half-pass development",
      "flying change training (single)",
      "collection work",
      "counter canter training",
      "medium gait development",
      "10m circle suppling",
      "turn on haunches practice"
    ],
    
    forbiddenMovements: [
      "extended gaits (full)",
      "canter pirouettes",
      "flying changes (sequences)",
      "piaffe",
      "passage",
      "half-pass zig-zag",
      "pirouette (full)"
    ],
    
    forbiddenExercises: [
      "pirouette training (full)",
      "piaffe development",
      "passage training",
      "tempi changes (4s, 3s, 2s, 1s)",
      "extended gait work (full)",
      "half-pass zig-zag practice"
    ],
    
    focusAreas: [
      "collection and engagement",
      "flying change quality",
      "half-pass balance",
      "lateral work precision",
      "medium gait expression",
      "self-carriage",
      "suppleness and throughness"
    ]
  },

  // =========================================
  // DIFFICULTY 6-7: ADVANCED INTERMEDIATE
  // =========================================
  // Countries: UK (Medium, Advanced Medium), US (Third Level), Germany (Class M), Australia (Medium)
  {
    difficultyRange: [6, 7],
    name: "Advanced Intermediate",
    description: "Refining collection, developing change sequences and pirouette work.",
    
    allowedMovements: [
      // All from previous levels, plus:
      "flying changes every 4 strides",
      "flying changes every 3 strides",
      "simple pirouettes (walk/canter intro)",
      "turn on haunches (full)",
      "half-pass zig-zag (intro)",
      "extended trot",
      "extended canter",
      "travers/renvers on circle",
      "collected walk",
      "collected trot",
      "collected canter"
    ],
    
    allowedExercises: [
      // All from previous levels, plus:
      "change sequences (4s, 3s)",
      "pirouette intro",
      "turn on haunches refinement",
      "half-pass zig-zag practice",
      "extended gait work",
      "advanced collection work",
      "canter pirouette preparation"
    ],
    
    forbiddenMovements: [
      "piaffe",
      "passage",
      "one-time changes",
      "canter pirouettes (full)"
    ],
    
    forbiddenExercises: [
      "piaffe training",
      "passage development",
      "one-time change work",
      "full pirouette training (canter)"
    ],
    
    focusAreas: [
      "flying change sequences",
      "collection refinement",
      "pirouette preparation",
      "half-pass quality and balance",
      "extended gait expression",
      "self-carriage and lightness",
      "advanced suppleness"
    ]
  },

  // =========================================
  // DIFFICULTY 8-9: ADVANCED
  // =========================================
  // Countries: UK (Advanced), US (Fourth Level), Germany (Class S), Australia (Advanced), FEI (PSG, Inter I)
  {
    difficultyRange: [8, 9],
    name: "Advanced",
    description: "Mastering Grand Prix movements including piaffe, passage, and one-time changes.",
    
    allowedMovements: [
      // All from previous levels, plus:
      "flying changes every 2 strides",
      "one-time changes",
      "canter pirouettes (full)",
      "half-pass zig-zag (full)",
      "piaffe (developing)",
      "passage (developing)",
      "piaffe-passage transitions",
      "all lateral movements (mastery)"
    ],
    
    allowedExercises: [
      // All from previous levels, plus:
      "pirouette training (full)",
      "change sequences (2s, 1s)",
      "piaffe development",
      "passage training",
      "piaffe-passage transitions",
      "advanced collection work",
      "Grand Prix preparation"
    ],
    
    forbiddenMovements: [],
    
    forbiddenExercises: [],
    
    focusAreas: [
      "piaffe quality and rhythm",
      "passage development",
      "one-time changes",
      "pirouette refinement",
      "Grand Prix movements",
      "expression and brilliance",
      "harmony and partnership"
    ]
  },

  // =========================================
  // DIFFICULTY 10: GRAND PRIX
  // =========================================
  // FEI (Inter II, Grand Prix)
  {
    difficultyRange: [10, 10],
    name: "Grand Prix",
    description: "All movements at the highest level of refinement and expression.",
    
    allowedMovements: ["all movements"],
    allowedExercises: ["all exercises"],
    forbiddenMovements: [],
    forbiddenExercises: [],
    
    focusAreas: [
      "refinement and precision",
      "maximum expression",
      "harmony and lightness",
      "brilliance and athleticism",
      "Grand Prix perfection"
    ]
  }
];

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Get the skill level data for a given difficulty number
 */
export function getSkillsByDifficulty(difficulty: number): SkillLevel | null {
  return SKILLS_BY_DIFFICULTY.find(
    skill => difficulty >= skill.difficultyRange[0] && difficulty <= skill.difficultyRange[1]
  ) || null;
}

/**
 * Check if a movement is allowed for a given difficulty level
 */
export function isMovementAllowedForDifficulty(difficulty: number, movement: string): boolean {
  const skills = getSkillsByDifficulty(difficulty);
  if (!skills) return true; // Default to allowing if level not found
  
  // Check if movement is explicitly forbidden
  const isForbidden = skills.forbiddenMovements.some(forbidden => 
    movement.toLowerCase().includes(forbidden.toLowerCase())
  );
  
  return !isForbidden;
}

/**
 * Check if an exercise is allowed for a given difficulty level
 */
export function isExerciseAllowedForDifficulty(difficulty: number, exercise: string): boolean {
  const skills = getSkillsByDifficulty(difficulty);
  if (!skills) return true; // Default to allowing if level not found
  
  // Check if exercise is explicitly forbidden
  const isForbidden = skills.forbiddenExercises.some(forbidden => 
    exercise.toLowerCase().includes(forbidden.toLowerCase())
  );
  
  return !isForbidden;
}

/**
 * Generate a prompt-friendly description of allowed/forbidden movements
 */
export function generateLevelRestrictionsPrompt(difficulty: number): string {
  const skills = getSkillsByDifficulty(difficulty);
  
  if (!skills) {
    return "No specific restrictions apply to this level.";
  }
  
  return `
**Level: ${skills.name} (Difficulty ${difficulty}/10)**
${skills.description}

**ALLOWED MOVEMENTS:**
${skills.allowedMovements.join(", ")}

**FORBIDDEN MOVEMENTS (DO NOT SUGGEST THESE):**
${skills.forbiddenMovements.join(", ")}

**ALLOWED EXERCISES:**
${skills.allowedExercises.join(", ")}

**FORBIDDEN EXERCISES (DO NOT SUGGEST THESE):**
${skills.forbiddenExercises.join(", ")}

**FOCUS AREAS FOR THIS LEVEL:**
${skills.focusAreas.join(", ")}
`;
}