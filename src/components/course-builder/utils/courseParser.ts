
// Parse course text upload
export const parseCourseText = (courseText: string, arenaWidth: number, arenaLength: number, getCurrentLevel: () => any) => {
  if (!courseText.trim()) return [];

  const lines = courseText.split("\n").filter((line) => line.trim());
  const newJumps = [];

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    let jumpType = "vertical";

    if (lowerLine.includes("oxer")) jumpType = "oxer";
    else if (lowerLine.includes("triple")) jumpType = "triple";
    else if (lowerLine.includes("water")) jumpType = "water";
    else if (lowerLine.includes("liverpool")) jumpType = "liverpool";
    else if (lowerLine.includes("wall")) jumpType = "wall";

    const cols = Math.ceil(Math.sqrt(lines.length));
    const col = index % cols;
    const row = Math.floor(index / cols);
    const spacingX = (arenaWidth - 20) / Math.max(1, cols - 1);
    const spacingY = (arenaLength - 20) / Math.max(1, Math.ceil(lines.length / cols) - 1);

    const x = 10 + (cols === 1 ? (arenaWidth - 20) / 2 : col * spacingX);
    const y = 10 + (Math.ceil(lines.length / cols) === 1 ? (arenaLength - 20) / 2 : row * spacingY);

    const currentLevel = getCurrentLevel();
    newJumps.push({
      id: Date.now() + index,
      x: Math.round(x),
      y: Math.round(y),
      type: jumpType,
      number: index + 1,
      height: currentLevel.minHeight + (currentLevel.maxHeight - currentLevel.minHeight) * 0.5,
    });
  });

  return newJumps;
};
