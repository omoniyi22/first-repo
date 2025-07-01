import { arenaTrainingExamples } from '../data/arenaTrainingExamples.js';

export class EnhancedAIGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  // Main course generation method with enhanced fallbacks
  async generateCourse(arenaWidth, arenaLength, numberOfJumps, courseStyle, difficultyLevel, options = {}) {
    console.log('Starting enhanced course generation...');
    
    // Extract options with safe defaults
    const settings = options.generationSettings || {
      allowCombinations: true,
      preferSmoothTurns: true,
      includeSpecialtyJumps: true,
      optimizeForFlow: true
    };
    
    const levelConfig = options.levelConfig || {
      minHeight: 0.8,
      maxHeight: 1.2,
      maxJumps: 12
    };

    try {
      // Create enhanced prompt with training examples
      const prompt = this.createEnhancedPrompt(
        arenaWidth, 
        arenaLength, 
        numberOfJumps, 
        courseStyle, 
        difficultyLevel,
        settings
      );

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('No content received from Gemini API');
      }

      // Parse and validate AI response
      const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
      const aiJumps = JSON.parse(cleaned);

      // Validate and process AI jumps
      const processedJumps = this.validateAndProcessJumps(aiJumps, arenaWidth, arenaLength, levelConfig);

      if (processedJumps.length >= Math.max(6, numberOfJumps - 2)) {
        console.log('✅ Gemini AI generation successful');
        return {
          jumps: processedJumps.slice(0, numberOfJumps),
          method: 'Gemini AI Generator'
        };
      } else {
        throw new Error('AI generated insufficient valid jumps');
      }

    } catch (error) {
      console.log('⚠️ AI generation failed:', error.message);
      
      // Fallback to professional examples
      console.log('Using professional training examples...');
      return this.generateProfessionalFallback(
        arenaWidth, 
        arenaLength, 
        numberOfJumps, 
        courseStyle,
        levelConfig
      );
    }
  }

  // Create enhanced prompt with professional training examples
  createEnhancedPrompt(arenaWidth, arenaLength, numberOfJumps, courseStyle, difficultyLevel, settings = {}) {
    // Settings with safe defaults
    const allowCombinations = settings.allowCombinations !== false;
    const preferSmoothTurns = settings.preferSmoothTurns !== false;
    const includeSpecialtyJumps = settings.includeSpecialtyJumps !== false;
    const optimizeForFlow = settings.optimizeForFlow !== false;

    // Find relevant training examples
    const relevantExamples = this.findRelevantTrainingExamples(arenaWidth, arenaLength, numberOfJumps, courseStyle);
    
    const trainingExamplesText = relevantExamples.map(example => 
      `${example.name} (${example.arenaSize}): ${JSON.stringify(example.jumps)}`
    ).join('\n\n');

    return `You are a professional show jumping course designer. Generate a safe, logical, and competition-quality course using professional design standards and patterns.

PROFESSIONAL TRAINING EXAMPLES:
${trainingExamplesText}

COURSE REQUIREMENTS:
- Arena Size: ${arenaWidth}m × ${arenaLength}m
- Total Jumps: ${numberOfJumps}
- Course Style: ${courseStyle}
- Difficulty Level: ${difficultyLevel}
- Allow Combinations: ${allowCombinations}
- Prefer Smooth Turns: ${preferSmoothTurns}
- Include Specialty Jumps: ${includeSpecialtyJumps}
- Optimize for Flow: ${optimizeForFlow}

FLOW PATTERN SELECTION:
Choose a professional multi-directional flow pattern (do NOT place jumps randomly):
- Figure-8 (clockwise/counter-clockwise)
- Progressive Serpentine
- Outside Track with Diagonals
- Cross Pattern or Diamond Pattern
Each pattern must:
- Flow in 4 or more directions
- Include at least one diagonal line across the arena
- Have a balance of clockwise and counterclockwise turns
- Avoid more than 2 consecutive turns in the same direction

FLOW STRATEGY & JUMP LOGIC:
Use intelligent jump progression:
- Jumps 1–2: Easy verticals (confidence/rhythm)
- Jumps 3–4: Oxers or verticals (establish technique)
- Jumps 5–6: Technical jumps (triple, liverpool, etc.)
- Jumps 7–8+: Flow finish (oxer/vertical)

Apply level-appropriate height progression:
- Intro: 0.4–0.6m opening → 0.6m max → 0.5m finish
- Novice: 0.7–0.9m opening → 1.0m max → 0.8m finish
- Advanced: 1.2–1.6m peak height, with logical ramp-up and down

VALIDATION RULES:
Turn Angle Validation (for each triplet A→B→C):
- Calculate vectors and turning angle (degrees)
- Maximum allowed per level:
  • Intro: ≤60° | Novice: ≤75° | Elementary: ≤90°
  • Medium: ≤105° | Advanced: ≤120°
- If angle exceeds limit → REJECT pattern and retry

Distance Validation (each pair A→B):
- Intro: 15–25m | Novice: 18–30m | Elementary: 20–35m
- Medium: 22–40m | Advanced: 25–45m
- If outside range → REJECT course

Flow Direction Checks:
- Must include 3 or more cardinal directions (N, S, E, W)
- No excessive repetition of one direction
- Must include a diagonal and natural riding lines

COURSE PLACEMENT CONSTRAINTS:
- All jumps must stay within arena bounds (x: 5 to ${arenaWidth - 5}, y: 5 to ${arenaLength - 5})
- Minimum 10m between non-combination jumps
- Use professional example patterns as guidance

IMPLEMENTATION LOGIC (internal flow):
Step 1: Choose pattern by level (e.g., Intro → Simple Figure-8, Advanced → Outside Track + Diagonals)  
Step 2: Use geometry to place coordinates using loops/angles (e.g., sin/cos logic for loops)  
Step 3: Validate full sequence:
- Turn angles
- Distances
- Direction changes
Step 4: Assign:
- Jump types by position
- Heights based on level and phase of course

EXAMPLE OUTPUT FORMAT:
Return only a valid JSON array of jump objects:
[
  {"id": "jump1", "x": 30, "y": 10, "type": "vertical", "height": 0.4},
  {"id": "jump2", "x": 45, "y": 18, "type": "vertical", "height": 0.5},
  {"id": "jump3", "x": 50, "y": 30, "type": "oxer", "height": 0.6}
]

Allowed types: vertical, oxer, triple, water, liverpool, wall  
Include "height" (in meters) in each object.  
Use geometry and flow logic to create a ridable, level-specific, and natural-feeling course.

GOAL:
Design a complete show jumping course that:
- Flows naturally in multiple directions
- Respects turn angle and distance rules by level
- Uses real-world design logic
- Has progressive difficulty
- Looks and feels like a real professional layout
`;
  }

  // Find relevant training examples based on arena size and style
  findRelevantTrainingExamples(arenaWidth, arenaLength, numberOfJumps, courseStyle) {
    const arenaArea = arenaWidth * arenaLength;
    let relevantExamples = [];

    // Filter examples by arena size similarity
    arenaTrainingExamples.forEach(example => {
      const exampleArea = example.arenaWidth * example.arenaLength;
      const sizeRatio = Math.min(arenaArea, exampleArea) / Math.max(arenaArea, exampleArea);
      
      if (sizeRatio > 0.6) { // Similar size arenas
        relevantExamples.push({
          ...example,
          relevanceScore: sizeRatio + (example.style === courseStyle ? 0.3 : 0)
        });
      }
    });

    // Sort by relevance and return top 3
    relevantExamples.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return relevantExamples.slice(0, 3);
  }

  // Validate and fix AI-generated jumps
  validateAndProcessJumps(aiJumps, arenaWidth, arenaLength, levelConfig) {
    if (!Array.isArray(aiJumps)) {
      throw new Error('AI response is not an array');
    }

    const processedJumps = [];
    const validTypes = ['vertical', 'oxer', 'triple', 'water', 'liverpool', 'wall'];

    aiJumps.forEach((jump, index) => {
      if (jump && typeof jump.x === 'number' && typeof jump.y === 'number') {
        // Ensure boundaries (with 5m margin)
        const safeX = Math.max(5, Math.min(arenaWidth - 5, jump.x));
        const safeY = Math.max(5, Math.min(arenaLength - 5, jump.y));
        
        // Validate jump type
        const jumpType = validTypes.includes(jump.type) ? jump.type : 'vertical';
        
        processedJumps.push({
          id: jump.id || `jump${index + 1}`,
          x: Math.round(safeX),
          y: Math.round(safeY),
          type: jumpType,
          height: levelConfig.minHeight + (levelConfig.maxHeight - levelConfig.minHeight) * 0.5
        });
      }
    });

    return processedJumps;
  }

  // Professional fallback using training examples
  generateProfessionalFallback(arenaWidth, arenaLength, numberOfJumps, courseStyle, levelConfig = { minHeight: 0.8, maxHeight: 1.2 }) {
    console.log('🏆 Using professional training examples...');
    
    // Find best matching training example
    const relevantExamples = this.findRelevantTrainingExamples(arenaWidth, arenaLength, numberOfJumps, courseStyle);
    
    if (relevantExamples.length === 0) {
      // Basic fallback pattern
      return this.generateBasicFallback(arenaWidth, arenaLength, numberOfJumps, levelConfig);
    }

    const bestExample = relevantExamples[0];
    
    // Scale the professional example to current arena
    const scaleX = arenaWidth / bestExample.arenaWidth;
    const scaleY = arenaLength / bestExample.arenaLength;
    
    // Take jumps from training example and scale them
    const scaledJumps = bestExample.jumps.slice(0, numberOfJumps).map((jump, index) => ({
      id: `jump${index + 1}`,
      x: Math.round(Math.max(5, Math.min(arenaWidth - 5, jump.x * scaleX))),
      y: Math.round(Math.max(5, Math.min(arenaLength - 5, jump.y * scaleY))),
      type: jump.type || 'vertical',
      height: levelConfig.minHeight + (levelConfig.maxHeight - levelConfig.minHeight) * 0.5,
    }));

    // If we need more jumps, add some using pattern
    while (scaledJumps.length < numberOfJumps) {
      const additionalJump = this.generateAdditionalJump(scaledJumps, arenaWidth, arenaLength, levelConfig);
      scaledJumps.push(additionalJump);
    }

    return {
      jumps: scaledJumps,
      method: `Professional Training Examples (${bestExample.name})`
    };
  }

  // Generate additional jump when needed
  generateAdditionalJump(existingJumps, arenaWidth, arenaLength, levelConfig) {
    const margin = 8;
    let attempts = 0;
    
    while (attempts < 50) {
      const x = margin + Math.random() * (arenaWidth - 2 * margin);
      const y = margin + Math.random() * (arenaLength - 2 * margin);
      
      // Check distance from existing jumps
      const tooClose = existingJumps.some(jump => {
        const distance = Math.sqrt(Math.pow(x - jump.x, 2) + Math.pow(y - jump.y, 2));
        return distance < 10;
      });
      
      if (!tooClose) {
        return {
          id: `jump${existingJumps.length + 1}`,
          x: Math.round(x),
          y: Math.round(y),
          type: 'vertical',
          height: levelConfig.minHeight + (levelConfig.maxHeight - levelConfig.minHeight) * 0.5,
        };
      }
      attempts++;
    }
    
    // Fallback if no good position found
    return {
      id: `jump${existingJumps.length + 1}`,
      x: Math.round(arenaWidth / 2),
      y: Math.round(arenaLength / 2),
      type: 'vertical',
      height: levelConfig.minHeight + (levelConfig.maxHeight - levelConfig.minHeight) * 0.5,
    };
  }

  // Basic geometric fallback (emergency)
  generateBasicFallback(arenaWidth, arenaLength, numberOfJumps, levelConfig) {
    console.log('📐 Using basic pattern generator...');
    
    const jumps = [];
    const margin = 8;
    const patterns = [
      'figure8', 'serpentine', 'circle', 'zigzag'
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    for (let i = 0; i < numberOfJumps; i++) {
      let x, y;
      
      switch (pattern) {
        case 'figure8':
          const angle = (i / numberOfJumps) * 4 * Math.PI;
          x = (arenaWidth / 2) + (arenaWidth / 4) * Math.cos(angle) * Math.sin(angle * 2);
          y = (arenaLength / 2) + (arenaLength / 4) * Math.sin(angle);
          break;
          
        case 'serpentine':
          x = margin + (i / (numberOfJumps - 1)) * (arenaWidth - 2 * margin);
          y = (arenaLength / 2) + (arenaLength / 4) * Math.sin((i / numberOfJumps) * 4 * Math.PI);
          break;
          
        case 'circle':
          const circleAngle = (i / numberOfJumps) * 2 * Math.PI;
          const radius = Math.min(arenaWidth, arenaLength) / 3;
          x = (arenaWidth / 2) + radius * Math.cos(circleAngle);
          y = (arenaLength / 2) + radius * Math.sin(circleAngle);
          break;
          
        default: // zigzag
          x = margin + (i % 2) * (arenaWidth - 2 * margin - 20) + 10;
          y = margin + (i / numberOfJumps) * (arenaLength - 2 * margin);
      }
      
      jumps.push({
        id: `jump${i + 1}`,
        x: Math.round(Math.max(margin, Math.min(arenaWidth - margin, x))),
        y: Math.round(Math.max(margin, Math.min(arenaLength - margin, y))),
        type: i % 3 === 0 ? 'oxer' : 'vertical',
        height: levelConfig.minHeight + (levelConfig.maxHeight - levelConfig.minHeight) * 0.5,
      });
    }

    return {
      jumps,
      method: `Basic Pattern Generator (${pattern})`
    };
  }
}