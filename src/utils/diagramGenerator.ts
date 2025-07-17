interface ArenaLetter {
  x: number;
  y: number;
}

interface ArenaTemplate {
  width: number;
  height: number;
  letters: Record<string, ArenaLetter>;
}

export interface WeaknessSvg {
  title: string;
  weakness: string;
  type: string; // Expanded to include 'contact' and other types
  positions: string[];
  size: 'small' | 'large';
  instruction: string;
  speed: string;
}

/*** Arena Templates ***/
const arenaTemplates = {
  large: {
    width: 200,
    height: 600,
    letters: {
      A: { x: 200, y: 720 },
      C: { x: 200, y: 90 },
      H: { x: 80, y: 150 },
      S: { x: 80, y: 275 },
      E: { x: 80, y: 400 },
      V: { x: 80, y: 525 },
      K: { x: 80, y: 650 },
      G: { x: 200, y: 150 },
      I: { x: 200, y: 275 },
      X: { x: 200, y: 400 },
      L: { x: 200, y: 525 },
      D: { x: 200, y: 650 },
      M: { x: 320, y: 150 },
      R: { x: 320, y: 275 },
      B: { x: 320, y: 400 },
      P: { x: 320, y: 525 },
      F: { x: 320, y: 650 },
    }
  },
  small: {
    width: 200,
    height: 400,
    letters: {
      A: { x: 200, y: 520 },
      C: { x: 200, y: 90 },
      H: { x: 80, y: 150 },
      E: { x: 80, y: 300 },
      K: { x: 80, y: 450 },
      G: { x: 200, y: 150 },
      X: { x: 200, y: 300 },
      D: { x: 200, y: 450 },
      M: { x: 320, y: 150 },
      B: { x: 320, y: 300 },
      F: { x: 320, y: 450 },
    }
  }
};

const accuracyCircleExercisePos = {
  small: {
    A: { x: 205, y: 445 },
    C: { x: 205, y: 155 },
    H: { x: 160, y: 155 },
    E: { x: 160, y: 300 },
    K: { x: 160, y: 445 },
    G: { x: 205, y: 155 },
    X: { x: 205, y: 300 },
    D: { x: 205, y: 445 },
    M: { x: 240, y: 155 },
    B: { x: 240, y: 300 },
    F: { x: 240, y: 445 },
  },
  large: {
    A: { x: 205, y: 645 },
    C: { x: 205, y: 155 },
    H: { x: 160, y: 155 },
    S: { x: 160, y: 270 },
    E: { x: 160, y: 395 },
    V: { x: 160, y: 520 },
    K: { x: 160, y: 645 },
    G: { x: 205, y: 155 },
    I: { x: 205, y: 270 },
    X: { x: 205, y: 395 },
    L: { x: 205, y: 520 },
    D: { x: 205, y: 645 },
    M: { x: 240, y: 155 },
    R: { x: 240, y: 270 },
    B: { x: 240, y: 395 },
    P: { x: 240, y: 520 },
    F: { x: 240, y: 645 },
  }
}

const exercisePos = {
  small: {
    A: { x: 205, y: 490 },
    C: { x: 205, y: 110 },
    H: { x: 110, y: 145 },
    E: { x: 110, y: 295 },
    K: { x: 110, y: 445 },
    G: { x: 205, y: 155 },
    X: { x: 205, y: 305 },
    D: { x: 205, y: 455 },
    M: { x: 290, y: 145 },
    B: { x: 290, y: 295 },
    F: { x: 290, y: 445 },
  },
  large: {
    A: { x: 205, y: 690 },
    C: { x: 205, y: 110 },
    H: { x: 110, y: 145 },
    S: { x: 110, y: 270 },
    E: { x: 110, y: 395 },
    V: { x: 110, y: 520 },
    K: { x: 110, y: 645 },
    G: { x: 205, y: 160 },
    I: { x: 205, y: 285 },
    X: { x: 205, y: 410 },
    L: { x: 205, y: 535 },
    D: { x: 205, y: 660 },
    M: { x: 290, y: 145 },
    R: { x: 290, y: 270 },
    B: { x: 290, y: 395 },
    P: { x: 290, y: 520 },
    F: { x: 290, y: 645 },
  }
}

export const COLOR_BY_SPEED = {
  "Walk": "#3AD55A",
  "Trot": "#FFD766",
  "Canter": "#5E92FA",
  "Halt": "#F67DB5",
  "Transition": "#F67DB5",
  "Free Walk": "#A38DFC",
};

export const COLOR_LEGEND = {
  "Walk": { from: "#3AD55A", to: "#00AE23" },
  "Trot": { from: "#FFD766", to: "#FF821C" },
  "Canter": { from: "#5E92FA", to: "#3C77EC" },
  "Halt/Transition": { from: "#F67DB5", to: "#D80568" },
  "Free Walk": { from: "#A38DFC", to: "#7658EB" },
};

function getConditionalAxisAlignedPoints(
  chars: string[],
  positionMap: Object,
  arena: ArenaTemplate
): { x: number; y: number }[] {
  const resolved: { x: number; y: number }[] = [];

  for (let i = 0; i < chars.length - 1; i++) {
    const currChar = chars[i];
    const nextChar = chars[i + 1];

    const curr = positionMap[currChar] || { x: arena.width / 2, y: arena.height / 2 };
    const next = positionMap[nextChar] || { x: arena.width / 2, y: arena.height / 2 };

    resolved.push(curr);

    const needsZigzag = curr.x !== next.x && curr.y !== next.y;

    // Special vertical insertion for H/M → C or K/F → A
    const specialVerticalCase =
      ((currChar === 'H' || currChar === 'M') && nextChar === 'C') ||
      ((currChar === 'K' || currChar === 'F') && nextChar === 'A');

    if (needsZigzag) {
      if (specialVerticalCase) {
        resolved.push({ x: curr.x, y: next.y }); // vertical first
      } else if (currChar === 'A' || currChar === 'C') {
        resolved.push({ x: next.x, y: curr.y }); // horizontal first
      }
    }
  }

  const lastChar = chars[chars.length - 1];
  const last = positionMap[lastChar] || { x: arena.width / 2, y: arena.height / 2 };
  resolved.push(last);

  return resolved;
}

function generateArrowOverlays(points: { x: number, y: number }[], color: string): string {
  const arrows: string[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (p1.x === p2.x && p1.y === p2.y) continue;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

    arrows.push(`
      <path d="M -5 -5 L 5 0 L -5 5 Z"
            transform="translate(${midX}, ${midY}) rotate(${angle})"
            fill="${color}" />
    `);
  }

  return arrows.join('');
}


const exerciseGenerators = {
  contact: (arena: ArenaTemplate, positions: string[], exPositions: object, speed: string) => {
    const allChars = ['A', 'F', 'B', 'M', 'C', 'H', 'E', 'K', 'A'];
    const resolvedPoints = getConditionalAxisAlignedPoints(allChars, exPositions, arena);
    const points = resolvedPoints.map(p => `${p.x},${p.y}`).join(' ');
    const isDashed = speed === 'Halt' || speed === 'Transition';
    const circles = allChars.map(char => `
      <circle cx="${exPositions[char]?.x ?? arena.width / 2}"
              cy="${exPositions[char]?.y ?? arena.height / 2}"
              r="4"
              fill="${COLOR_BY_SPEED[speed]}"
              />
    `).join('');

    const arrows = generateArrowOverlays(resolvedPoints, COLOR_BY_SPEED[speed]);

    return {
      svg: `
        <polyline points="${points}" 
                  fill="none"
                  stroke="${COLOR_BY_SPEED[speed]}"
                  stroke-width="2"
                  stroke-linecap="round"
                  ${isDashed ? 'stroke-dasharray="5,5"' : ''}
                />
        ${arrows}
        ${circles}
      `,
    };
  },

  accuracy: (arena: ArenaTemplate, positions: string[], circlePositions: object, speed: string) => {
    const RADIUS = 50;
    const isDashed = speed === 'Halt' || speed === 'Transition';
    const svgParts = positions.map(pos => {
      const center = circlePositions[pos[0]];
      if (!center) return '';

      const arrowX = center.x + RADIUS; // slight spacing from circle
      const arrowY = center.y;

      return `
        <circle cx="${center.x}" cy="${center.y}" r="${RADIUS}" stroke="${COLOR_BY_SPEED[speed]}"
                  stroke-width="2" fill="none" />

        <path d="M -5 -5 L 5 0 L -5 5 Z"
              transform="translate(${arrowX}, ${arrowY}) rotate(90)"
              fill="${COLOR_BY_SPEED[speed]}" />
      `;
    }).join('');

    return {
      svg: svgParts,
    };
  },

  circleExercise: (arena: ArenaTemplate, positions: string[], circlePositions: object, speed: string) => {
    const color = COLOR_BY_SPEED[speed];
    const RADIUS = 50;
    const circles = positions.map(char => `
      <circle cx="${circlePositions[char]?.x ?? arena.width / 2}"
        cy="${circlePositions[char]?.y ?? arena.height / 2}"
        r="${RADIUS}"
        stroke-width="2"
        stroke="${COLOR_BY_SPEED[speed]}"
        fill="none"
      />
      <path d="M -5 -5 L 5 0 L -5 5 Z"
        transform="translate(${circlePositions[char]?.x + RADIUS}, ${circlePositions[char]?.y}) rotate(90)"
        fill="${color}" />
    `).join('');
    return {
      svg: `
        ${circles}
      `
    };
  },

  lateral: (arena: ArenaTemplate, positions: string[], exPositions: object, speed: string) => {
    const color = COLOR_BY_SPEED[speed];
    const isDashed = speed === 'Halt' || speed === 'Transition';
    const pair1 = getConditionalAxisAlignedPoints(['M', 'B'], exPositions, arena);
    const pair2 = getConditionalAxisAlignedPoints(['H', 'E'], exPositions, arena);

    const points1 = pair1.map(p => `${p.x},${p.y}`).join(' ');
    const points2 = pair2.map(p => `${p.x},${p.y}`).join(' ');

    const arrows1 = generateArrowOverlays(pair1, color);
    const arrows2 = generateArrowOverlays(pair2, color);

    return {
      svg: `
        <polyline points="${points1}" 
                  fill="none" 
                  stroke="${color}" 
                  stroke-width="2"
                  ${isDashed ? 'stroke-dasharray="5,5"' : ''} />
        <polyline points="${points2}" 
                  fill="none" 
                  stroke="${color}" 
                  stroke-width="2" 
                  ${isDashed ? 'stroke-dasharray="5,5"' : ''} />
        ${arrows1}
        ${arrows2}
      `
    };
  },

  flyingChanges: (arena: ArenaTemplate, positions: string[], exPositions: object, speed: string) => {
    const color = COLOR_BY_SPEED[speed];
    const isLarge = arena.height > 500;
    
    const letters = isLarge 
      ? ['M', 'H', 'S', 'R', 'B', 'E', 'V', 'P', 'F', 'K']
      : ['M', 'H', 'E', 'B', 'F', 'K'];

    const points = letters.map(letter => {
      return exPositions[letter] || { x: arena.width / 2, y: arena.height / 2 };
    });

    let d = `M ${points[0].x},${points[0].y} `;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      d += `Q ${curr.x},${curr.y} ${midX},${midY} `;
    }
    // Finish the curve with a "T" command to smoothly transition to the last point.
    d += `T ${points[points.length - 1].x},${points[points.length - 1].y}`;

    // Optionally, display markers for the key waypoints.
    const markers = letters.map(letter => {
      const pos = exPositions[letter] || { x: arena.width / 2, y: arena.height / 2 };
      return `<circle cx="${pos.x}" cy="${pos.y}" r="4" fill="${color}" />`;
    }).join('');

    return {
      svg: `
        <path d="${d}" 
              fill="none" 
              stroke="${color}" 
              stroke-width="2" 
              stroke-linecap="round" />
      `
    };
  },

  transitions: (arena: ArenaTemplate, positions: string[], exPositions: object, speed: string) => {
    const allChars = ['A', 'X', 'C'];
    const resolvedPoints = getConditionalAxisAlignedPoints(allChars, exPositions, arena);
    const points = resolvedPoints.map(p => `${p.x},${p.y}`).join(' ');
    const isDashed = speed === 'Halt' || speed === 'Transition';
    const circles = allChars.map(char => `
      <circle cx="${exPositions[char]?.x ?? arena.width / 2}"
              cy="${exPositions[char]?.y ?? arena.height / 2}"
              r="4"
              fill="${COLOR_BY_SPEED[speed]}"
              />
    `).join('');

    const arrows = generateArrowOverlays(resolvedPoints, COLOR_BY_SPEED[speed]);

    return {
      svg: `
        <polyline points="${points}" 
                  fill="none"
                  stroke="${COLOR_BY_SPEED[speed]}"
                  stroke-width="2"
                  stroke-linecap="round"
                  ${isDashed ? 'stroke-dasharray="5,5"' : ''}
                />
        ${arrows}
        ${circles}
      `,
    };
  }
};


/*** Main Functions ***/
export function generateWeaknessSvg(weakness: WeaknessSvg): string {
  const arena = arenaTemplates[weakness.size];
  const accuracyCircle = accuracyCircleExercisePos[weakness.size];
  const exercisePosition = exercisePos[weakness.size];
  const generator = exerciseGenerators[weakness.type] || exerciseGenerators.accuracy;

  let svg;
  if (weakness.type == "circleExercise" ) {
    console.log(accuracyCircle);
    svg = generator(arena, weakness.positions, accuracyCircle, weakness.speed);
  } else {
    svg = generator(arena, weakness.positions, exercisePosition, weakness.speed);
  }

  return `
    <svg width="${arena.width + 200}" 
         height="${arena.height + 200}" 
         viewBox="0 0 ${arena.width + 200} ${arena.height + 200}" 
         xmlns="http://www.w3.org/2000/svg">
      <rect x="100" y="100" 
        width="${arena.width}" 
        height="${arena.height}" 
        fill="#f8f8f8" 
        stroke="#ccc" />
      
      ${Object.entries(arena.letters).map(([letter, pos]) => `
        <text x="${pos.x}" 
              y="${pos.y}" 
              class="arena-letter ${weakness.positions.some(p => p.includes(letter)) ? 'highlight' : ''}">
          ${letter}
        </text>
      `).join('')}
      
      ${svg.svg}
      
      <text x="${arena.width / 2}" 
            y="${arena.height - 5}" 
            text-anchor="middle" 
            class="instruction">
      </text>
    </svg>
  `;
}

export function generateAllDiagrams(weaknesses: WeaknessSvg[]): string[] {
  return weaknesses.map(generateWeaknessSvg);
}