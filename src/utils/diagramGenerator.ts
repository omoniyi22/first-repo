export const arenaTemplates = {
  small: {
    width: 400,
    height: 200,
    letters: {
      A: { x: 200, y: 0 },
      C: { x: 200, y: 400 },
      G: { x: 200, y: 300 },
      X: { x: 200, y: 200 },
      D: { x: 200, y: 100 },
      E: { x: 50, y: 200 },
      B: { x: 350, y: 200 },
      H: { x: 50, y: 300 },
      M: { x: 350, y: 300 },
      K: { x: 50, y: 100 },
      F: { x: 350, y: 100 }
    }
  },
  large: {
    width: 600,
    height: 200,
    letters: {
      A: { x: 300, y: 0 },
      C: { x: 300, y: 600 },
      G: { x: 300, y: 500 },
      I: { x: 300, y: 400 },
      X: { x: 300, y: 300 },
      L: { x: 300, y: 200 },
      D: { x: 300, y: 100 },
      E: { x: 75, y: 300 },
      B: { x: 525, y: 300 },
      H: { x: 75, y: 500 },
      M: { x: 525, y: 500 },
      S: { x: 75, y: 400 },
      R: { x: 525, y: 400 },
      V: { x: 75, y: 200 },
      P: { x: 525, y: 200 },
      K: { x: 75, y: 100 },
      F: { x: 525, y: 100 }
    }
  }
};

type ExerciseType = "accuracy" | "transitions" | "straightness" | "rhythm";

export const exercises = {
  accuracy: (arenaType) => {
    const arena = arenaTemplates[arenaType];
    const { x, y } = arena.letters.C;
    return `
      <svg width="${arena.width}" height="${arena.height}" viewBox="0 0 ${arena.width} ${arena.height}">
        <circle cx="${x}" cy="${y}" r="60" class="exercise" stroke="blue" stroke-width="2" fill="none"/>
      </svg>
    `;
  },

  transitions: (arenaType) => {
    const arena = arenaTemplates[arenaType];
    const { x, y } = arena.letters.X;
    return `
      <svg width="${arena.width}" height="${arena.height}" viewBox="0 0 ${arena.width} ${arena.height}">
        <rect x="${x - 20}" y="${y - 10}" width="40" height="20" class="prep-zone" fill="orange" stroke="black"/>
      </svg>
    `;
  },

  straightness: (arenaType) => {
    const arena = arenaTemplates[arenaType];
    const from = arena.letters.A;
    const to = arena.letters.C;
    return `
      <svg width="${arena.width}" height="${arena.height}" viewBox="0 0 ${arena.width} ${arena.height}">
        <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="green" stroke-width="2" class="center-line"/>
      </svg>
    `;
  }
};


export const exerciseMeta = {
  accuracy: {
    title: "Circle Accuracy Exercise",
    instructions: "Practice 20m circles at C to improve geometry and accuracy."
  },
  transitions: {
    title: "Transition Zone Practice",
    instructions: "Practice walk-trot or trot-canter transitions at X with focus on balance and preparation."
  },
  straightness: {
    title: "Centerline Straightness Drill",
    instructions: "Ride from A to C focusing on maintaining straightness along the center line."
  }
};

export const weaknessMap = {
  accuracy: ["accuracy", "geometry", "precise"],
  transitions: ["transition", "preparation", "change"],
  straightness: ["straight", "center line", "alignment"],
  rhythm: ["rhythm", "tempo", "consistency"]
};

export function generateDiagramsFromWeaknesses(keywords, arenaType = "small") {
  const matched = new Set();

  for (const word of keywords.map(w => w.toLowerCase())) {
    for (const [key, triggers] of Object.entries(weaknessMap)) {
      if (triggers.some(trigger => word.includes(trigger))) {
        matched.add(key);
      }
    }
  }

  // Limit to 3 diagrams max
  const selectedKeys = Array.from(matched).slice(0, 3) as ExerciseType[];

  const diagrams = selectedKeys.map((key) => ({
    title: exerciseMeta[key].title,
    svg: exercises[key](arenaType),
    instructions: exerciseMeta[key].instructions
  }));

  return { diagrams };
}