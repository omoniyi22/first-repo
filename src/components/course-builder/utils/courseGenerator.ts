
// Generate flowing course pattern
const generateFlowingPattern = (jumpCount: number, arenaWidth: number, arenaLength: number) => {
  const pattern = [];
  const centerX = arenaWidth / 2;
  const centerY = arenaLength / 2;
  const margin = 8;

  for (let i = 0; i < jumpCount; i++) {
    const angle = (i / jumpCount) * 2 * Math.PI + Math.PI / 4;
    const radiusX = (arenaWidth / 2 - margin) * (0.7 + Math.sin(i * 0.5) * 0.2);
    const radiusY = (arenaLength / 2 - margin) * (0.7 + Math.cos(i * 0.3) * 0.2);

    const x = Math.max(
      margin,
      Math.min(arenaWidth - margin, centerX + Math.cos(angle) * radiusX)
    );
    const y = Math.max(
      margin,
      Math.min(arenaLength - margin, centerY + Math.sin(angle) * radiusY)
    );

    pattern.push({ x: Math.round(x), y: Math.round(y) });
  }

  return pattern;
};

// Jump types
const jumpTypes = [
  { id: 'vertical', name: 'Vertical', color: '#8B4513', width: 4, spread: 0, technicality: 0, difficulty: 1 },
  { id: 'oxer', name: 'Oxer', color: '#CD853F', width: 4, spread: 1.5, technicality: 1, difficulty: 2 },
  { id: 'triple', name: 'Triple Bar', color: '#DEB887', width: 6, spread: 2.0, technicality: 2, difficulty: 3 },
  { id: 'water', name: 'Water Jump', color: '#4169E1', width: 4, spread: 3.0, technicality: 1, difficulty: 4 },
  { id: 'liverpool', name: 'Liverpool', color: '#2E8B57', width: 4, spread: 2.0, technicality: 2, difficulty: 3 },
  { id: 'wall', name: 'Wall', color: '#696969', width: 4, spread: 0, technicality: 0, difficulty: 1 }
];

// AI Jump Type Selection
const selectOptimalJumpType = (jumpIndex: number, totalJumps: number, generationSettings: any, level: string) => {
  const availableTypes = jumpTypes.filter((type) => {
    if (!generationSettings.includeSpecialtyJumps && ["water", "liverpool"].includes(type.id)) {
      return false;
    }

    if (level === "intro" || level === "lead_rein") {
      return ["vertical", "oxer"].includes(type.id);
    }

    return true;
  });

  if (jumpIndex === 0 || jumpIndex === totalJumps - 1) {
    return availableTypes.find((type) => type.difficulty <= 2) || availableTypes[0];
  }

  let targetDifficulty;
  const difficultyPreference = "medium"; // This could be passed as parameter
  switch (difficultyPreference) {
    case "easy":
      targetDifficulty = 1;
      break;
    case "challenging":
      targetDifficulty = 3;
      break;
    default:
      targetDifficulty = 2;
  }

  const suitableTypes = availableTypes.filter(
    (type) => Math.abs(type.difficulty - targetDifficulty) <= 1
  );

  return suitableTypes[Math.floor(Math.random() * suitableTypes.length)] || availableTypes[0];
};

// Calculate optimal height for jump
const calculateOptimalHeight = (jumpType: any, currentLevel: any, jumpIndex: number, totalJumps: number) => {
  const baseHeight = currentLevel.minHeight;
  const heightRange = currentLevel.maxHeight - currentLevel.minHeight;

  let heightMultiplier = 0.3;

  if (jumpIndex > totalJumps * 0.3 && jumpIndex < totalJumps * 0.8) {
    heightMultiplier = 0.8;
  } else if (jumpIndex >= totalJumps * 0.8) {
    heightMultiplier = 0.6;
  }

  return baseHeight + heightRange * heightMultiplier;
};

// AI Course Generation Algorithm
export const generateAICourse = async ({
  discipline,
  level,
  arenaWidth,
  arenaLength,
  targetJumps,
  courseStyle,
  difficultyPreference,
  generationSettings,
  setIsGenerating,
  getCurrentLevel,
}: any) => {
  setIsGenerating(true);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const currentLevel = getCurrentLevel();
  const maxJumps = Math.min(targetJumps, currentLevel.maxJumps);

  const newJumps = [];
  const coursePattern = generateFlowingPattern(maxJumps, arenaWidth, arenaLength);

  for (let i = 0; i < maxJumps; i++) {
    const position = coursePattern[i];
    const jumpType = selectOptimalJumpType(i, maxJumps, generationSettings, level);

    newJumps.push({
      id: Date.now() + i,
      x: position.x,
      y: position.y,
      type: jumpType.id,
      number: i + 1,
      height: calculateOptimalHeight(jumpType, currentLevel, i, maxJumps),
    });
  }

  setIsGenerating(false);
  return newJumps;
};
