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

    return `You are a professional show jumping course designer. Design a course using these professional examples as reference.

PROFESSIONAL TRAINING EXAMPLES:
${trainingExamplesText}

REQUIREMENTS:
- Arena: ${arenaWidth}m × ${arenaLength}m  
- Jumps: ${numberOfJumps}
- Style: ${courseStyle}
- Level: ${difficultyLevel}
- Allow combinations: ${allowCombinations}
- Prefer smooth turns: ${preferSmoothTurns}
- Include specialty jumps: ${includeSpecialtyJumps}
- Optimize for flow: ${optimizeForFlow}

CRITICAL RULES:
1. ALL jumps must be INSIDE arena boundaries (x: 5-${arenaWidth-5}, y: 5-${arenaLength-5})
2. Minimum 10m between consecutive jumps (except combinations if allowed)
3. Use professional patterns from examples above
4. Return ONLY valid JSON array format

OUTPUT FORMAT:
[
  {"id": "jump1", "x": 15, "y": 12, "type": "vertical"},
  {"id": "jump2", "x": 35, "y": 18, "type": "oxer"}
]

Valid jump types: vertical, oxer, triple, water, liverpool, wall
Generate exactly ${numberOfJumps} jumps with coordinates that stay within boundaries.`;
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