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
    A: { x: 200, y: 440 },
    C: { x: 200, y: 160 },
    H: { x: 160, y: 160 },
    E: { x: 160, y: 300 },
    K: { x: 160, y: 440 },
    G: { x: 200, y: 160 },
    X: { x: 200, y: 300 },
    D: { x: 200, y: 440 },
    M: { x: 240, y: 160 },
    B: { x: 240, y: 300 },
    F: { x: 240, y: 440 },
  },
  large: {
    A: { x: 200, y: 640 },
    C: { x: 200, y: 160 },
    H: { x: 160, y: 160 },
    S: { x: 160, y: 275 },
    E: { x: 160, y: 400 },
    V: { x: 160, y: 525 },
    K: { x: 160, y: 640 },
    G: { x: 200, y: 160 },
    I: { x: 200, y: 275 },
    X: { x: 200, y: 400 },
    L: { x: 200, y: 525 },
    D: { x: 200, y: 640 },
    M: { x: 240, y: 160 },
    R: { x: 240, y: 275 },
    B: { x: 240, y: 400 },
    P: { x: 240, y: 525 },
    F: { x: 240, y: 640 },
  }
}


const exerciseGenerators = {
  contact: (arena: ArenaTemplate, positions: string[]) => {
    return {
      svg: `
        ${positions.map(pos => {
          const chars = pos.split('');
          const points = chars.map(char => {
            const x = arena.letters[char]?.x ?? arena.width/2;
            const y = arena.letters[char]?.y ?? arena.height/2;
            return `${x},${y}`;
          }).join(' ');

          return `
            <polyline points="${points}" 
                     fill="none"
                     stroke="green"
                     stroke-width="2"
                     class="contact-line" />
            ${chars.map((char, i) => `
              <circle cx="${arena.letters[char]?.x ?? arena.width/2}"
                      cy="${arena.letters[char]?.y ?? arena.height/2}"
                      r="4"
                      fill="green"
                      class="contact-point" />
            `).join('')}
          `;
        }).join('')}
      `,
    };
  },
  accuracy: (arena: ArenaTemplate, positions: string[], circlePositions: object) => {
    return {
      svg: positions.map(pos => `
        <circle cx=${circlePositions[pos[0]].x} cy=${circlePositions[pos[0]].y} r="50" class="svg-exercise"/>
      `).join(''),
    };
  },
  transitions: (arena: ArenaTemplate, positions: string[]) => ({
    svg: positions.map(pos => `
      <rect x="${arena.letters[pos[0]].x - 10}" 
            y="${arena.letters[pos[0]].y + 5}" 
            width="30" height="10" 
            class="transition-zone" />
    `).join(''),
  }),
  straightness: (arena: ArenaTemplate, positions: string[]) => ({
   svg: `
        ${positions.map(pos => {
          const chars = pos.split('');
          const points = chars.map(char => {
            const x = arena.letters[char]?.x ?? arena.width/2;
            const y = arena.letters[char]?.y ?? arena.height/2;
            return `${x},${y}`;
          }).join(' ');

          return `
            <polyline points="${points}" 
                     fill="none"
                     stroke="blue"
                     stroke-width="2"
                     class="straightness-line" />
            ${chars.map((char, i) => `
              <circle cx="${arena.letters[char]?.x ?? arena.width/2}"
                      cy="${arena.letters[char]?.y ?? arena.height/2}"
                      r="4"
                      fill="blue"
                      class="straightness-point" />
            `).join('')}
          `;
        }).join('')}
      `,
  }),
  rhythm: (arena: ArenaTemplate, positions: string[]) => ({
    svg: `
      ${positions.map(pos => {
          const chars = pos.split('');
          const points = chars.map(char => {
            const x = arena.letters[char]?.x ?? arena.width/2;
            const y = arena.letters[char]?.y ?? arena.height/2;
            return `${x},${y}`;
          }).join(' ');

          return `
            <polyline points="${points}" 
                     fill="none"
                     stroke="gray"
                     stroke-width="2"
                     class="straightness-line" />
            ${chars.map((char, i) => `
              <circle cx="${arena.letters[char]?.x ?? arena.width/2}"
                      cy="${arena.letters[char]?.y ?? arena.height/2}"
                      r="4"
                      fill="gray"
                      class="straightness-point" />
            `).join('')}
          `;
        }).join('')}
    `,
  })
};

/*** Main Functions ***/
export function generateWeaknessSvg(weakness: WeaknessSvg): string {
  const arena = arenaTemplates[weakness.size];
  const accuracyCircle = accuracyCircleExercisePos[weakness.size];
  const generator = exerciseGenerators[weakness.type] || exerciseGenerators.accuracy;

  let svg;
  if (weakness.type == "accuracy") {
    console.log(accuracyCircle);
    svg = generator(arena, weakness.positions, accuracyCircle);
  } else {
    svg = generator(arena, weakness.positions);
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