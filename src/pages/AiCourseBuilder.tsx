
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/ai-course-builder/Header";
import CourseCanvas from "@/components/ai-course-builder/CourseCanvas";
import AIAnalysisPanel from "@/components/ai-course-builder/AIAnalysisPanel";
import FeaturesInfo from "@/components/ai-course-builder/FeaturesInfo";

const AiCourseBuilder = () => {
  // Competition level definitions
  //   prettier-ignore
  const competitionLevels = {
    showjumping: {
      'intro': { maxHeight: 0.6, minHeight: 0.4, maxJumps: 8, description: 'Beginner level (0.4-0.6m)' },
      'novice': { maxHeight: 0.9, minHeight: 0.7, maxJumps: 10, description: 'Basic competition (0.7-0.9m)' },
      'elementary': { maxHeight: 1.0, minHeight: 0.8, maxJumps: 10, description: 'Intermediate (0.8-1.0m)' },
      'medium': { maxHeight: 1.15, minHeight: 0.95, maxJumps: 12, description: 'Advanced amateur (0.95-1.15m)' },
      'advanced': { maxHeight: 1.25, minHeight: 1.05, maxJumps: 12, description: 'Advanced (1.05-1.25m)' },
      'grand_prix': { maxHeight: 1.6, minHeight: 1.4, maxJumps: 14, description: 'Professional (1.4-1.6m)' }
    },

    eventing: {
      '1star': { maxHeight: 1.05, minHeight: 0.9, maxJumps: 25, description: 'International 1-star (0.9-1.05m)' },
      '2star': { maxHeight: 1.15, minHeight: 1.0, maxJumps: 30, description: 'International 2-star (1.0-1.15m)' },
      '3star': { maxHeight: 1.25, minHeight: 1.1, maxJumps: 35, description: 'International 3-star (1.1-1.25m)' },
      '4star': { maxHeight: 1.25, minHeight: 1.15, maxJumps: 40, description: 'International 4-star (1.15-1.25m)' },
      '5star': { maxHeight: 1.25, minHeight: 1.2, maxJumps: 45, description: 'Olympic level (1.2-1.25m)' }
    },

    ponyclub: {
      'lead_rein': { maxHeight: 0.3, minHeight: 0.2, maxJumps: 6, description: 'Tiny tots (0.2-0.3m)' },
      'first_rung': { maxHeight: 0.4, minHeight: 0.3, maxJumps: 8, description: 'Beginner riders (0.3-0.4m)' },
      'minimus': { maxHeight: 0.5, minHeight: 0.4, maxJumps: 8, description: 'Young riders (0.4-0.5m)' },
      'novice_pc': { maxHeight: 0.7, minHeight: 0.5, maxJumps: 10, description: 'Developing riders (0.5-0.7m)' },
      'intermediate_pc': { maxHeight: 0.9, minHeight: 0.7, maxJumps: 12, description: 'Competent riders (0.7-0.9m)' }
    }
  };

  // Jump types with properties
  //   prettier-ignore
  const jumpTypes = [
    { id: 'vertical', name: 'Vertical', color: '#8B4513', width: 4, spread: 0, technicality: 0, difficulty: 1 },
    { id: 'oxer', name: 'Oxer', color: '#CD853F', width: 4, spread: 1.5, technicality: 1, difficulty: 2 },
    { id: 'triple', name: 'Triple Bar', color: '#DEB887', width: 6, spread: 2.0, technicality: 2, difficulty: 3 },
    { id: 'water', name: 'Water Jump', color: '#4169E1', width: 4, spread: 3.0, technicality: 1, difficulty: 4 },
    { id: 'liverpool', name: 'Liverpool', color: '#2E8B57', width: 4, spread: 2.0, technicality: 2, difficulty: 3 },
    { id: 'wall', name: 'Wall', color: '#696969', width: 4, spread: 0, technicality: 0, difficulty: 1 }
  ];

  // State management
  const [discipline, setDiscipline] = useState("showjumping");
  const [level, setLevel] = useState("novice");
  const [arenaWidth, setArenaWidth] = useState(60);
  const [arenaLength, setArenaLength] = useState(40);
  const [jumps, setJumps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseStyle, setCourseStyle] = useState("flowing");
  const [targetJumps, setTargetJumps] = useState(8);
  const [difficultyPreference, setDifficultyPreference] = useState("medium");
  const [showGrid, setShowGrid] = useState(true);
  const [courseText, setCourseText] = useState("");
  const [selectedJump, setSelectedJump] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [designMode, setDesignMode] = useState("ai");
  const [selectedJumpType, setSelectedJumpType] = useState("vertical");
  const [generationSettings, setGenerationSettings] = useState({
    allowCombinations: true,
    preferSmoothTurns: true,
    includeSpecialtyJumps: true,
    optimizeForFlow: true,
  });

  const canvasRef = useRef(null);
  const scale = 8;

  // Get current level configuration
  const getCurrentLevel = () => {
    const levels = competitionLevels[discipline];
    if (!levels || !levels[level]) {
      return {
        maxHeight: 1.0,
        minHeight: 0.8,
        maxJumps: 8,
        description: "Default Level",
      };
    }
    return levels[level];
  };

  // Calculate distance between two points
  const calculateDistance = (jump1, jump2) => {
    const dx = jump2.x - jump1.x;
    const dy = jump2.y - jump1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate angle between three points
  const calculateAngle = (jump1, jump2, jump3) => {
    const angle1 = Math.atan2(jump2.y - jump1.y, jump2.x - jump1.x);
    const angle2 = Math.atan2(jump3.y - jump2.y, jump3.x - jump2.x);
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  // Generate flowing course pattern
  const generateFlowingPattern = (jumpCount) => {
    const pattern = [];
    const centerX = arenaWidth / 2;
    const centerY = arenaLength / 2;
    const margin = 8;

    for (let i = 0; i < jumpCount; i++) {
      const angle = (i / jumpCount) * 2 * Math.PI + Math.PI / 4;
      const radiusX =
        (arenaWidth / 2 - margin) * (0.7 + Math.sin(i * 0.5) * 0.2);
      const radiusY =
        (arenaLength / 2 - margin) * (0.7 + Math.cos(i * 0.3) * 0.2);

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

  // AI Jump Type Selection
  const selectOptimalJumpType = (jumpIndex, totalJumps) => {
    const availableTypes = jumpTypes.filter((type) => {
      if (
        !generationSettings.includeSpecialtyJumps &&
        ["water", "liverpool"].includes(type.id)
      ) {
        return false;
      }

      if (level === "intro" || level === "lead_rein") {
        return ["vertical", "oxer"].includes(type.id);
      }

      return true;
    });

    if (jumpIndex === 0 || jumpIndex === totalJumps - 1) {
      return (
        availableTypes.find((type) => type.difficulty <= 2) || availableTypes[0]
      );
    }

    let targetDifficulty;
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

    return (
      suitableTypes[Math.floor(Math.random() * suitableTypes.length)] ||
      availableTypes[0]
    );
  };

  // Calculate optimal height for jump
  const calculateOptimalHeight = (
    jumpType,
    currentLevel,
    jumpIndex,
    totalJumps
  ) => {
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
  const generateAICourse = async () => {
    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentLevel = getCurrentLevel();
    const maxJumps = Math.min(targetJumps, currentLevel.maxJumps);

    const newJumps = [];
    const coursePattern = generateFlowingPattern(maxJumps);

    for (let i = 0; i < maxJumps; i++) {
      const position = coursePattern[i];
      const jumpType = selectOptimalJumpType(i, maxJumps);

      newJumps.push({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        type: jumpType.id,
        number: i + 1,
        height: calculateOptimalHeight(jumpType, currentLevel, i, maxJumps),
      });
    }

    setJumps(newJumps);
    setIsGenerating(false);
  };

  // Parse course text upload
  const parseCourseText = () => {
    if (!courseText.trim()) return;

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
      const spacingY =
        (arenaLength - 20) / Math.max(1, Math.ceil(lines.length / cols) - 1);

      const x = 10 + (cols === 1 ? (arenaWidth - 20) / 2 : col * spacingX);
      const y =
        10 +
        (Math.ceil(lines.length / cols) === 1
          ? (arenaLength - 20) / 2
          : row * spacingY);

      const currentLevel = getCurrentLevel();
      newJumps.push({
        id: Date.now() + index,
        x: Math.round(x),
        y: Math.round(y),
        type: jumpType,
        number: index + 1,
        height:
          currentLevel.minHeight +
          (currentLevel.maxHeight - currentLevel.minHeight) * 0.5,
      });
    });

    setJumps(newJumps);
    setCourseText("");
  };

  // Handle canvas interactions for manual design
  const handleCanvasMouseDown = (event) => {
    if (designMode !== "manual") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const clickedJump = jumps.find((jump) => {
      const jumpType = jumpTypes.find((type) => type.id === jump.type);
      const jumpWidth = jumpType?.width || 4;
      return (
        Math.abs(jump.x - x) < jumpWidth / 2 + 2 && Math.abs(jump.y - y) < 4
      );
    });

    if (clickedJump) {
      setSelectedJump(clickedJump.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedJump.x,
        y: y - clickedJump.y,
      });
    } else {
      const currentLevel = getCurrentLevel();
      const newJump = {
        id: Date.now(),
        x: Math.round(Math.max(5, Math.min(x, arenaWidth - 5))),
        y: Math.round(Math.max(5, Math.min(y, arenaLength - 5))),
        type: selectedJumpType,
        number: jumps.length + 1,
        height:
          currentLevel.minHeight +
          (currentLevel.maxHeight - currentLevel.minHeight) * 0.5,
      };
      setJumps([...jumps, newJump]);
      setSelectedJump(newJump.id);
    }
  };

  const handleCanvasMouseMove = (event) => {
    if (!isDragging || !selectedJump || designMode !== "manual") return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const newX = Math.round(
      Math.max(5, Math.min(x - dragOffset.x, arenaWidth - 5))
    );
    const newY = Math.round(
      Math.max(5, Math.min(y - dragOffset.y, arenaLength - 5))
    );

    setJumps(
      jumps.map((jump) =>
        jump.id === selectedJump ? { ...jump, x: newX, y: newY } : jump
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Course analysis function
  const analyzeCourse = () => {
    if (jumps.length < 2) {
      return {
        totalDistance: 0,
        averageDistance: 0,
        difficulty: 0,
        compliance: 100,
        issues: [],
        sharpTurns: 0,
        combinations: 0,
        technicality: 0,
        aiScore: 100,
      };
    }

    const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);
    let totalDistance = 0;
    let sharpTurns = 0;
    let combinations = 0;
    let technicality = 0;
    let issues = [];

    for (let i = 0; i < sortedJumps.length - 1; i++) {
      const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);
      totalDistance += distance;

      if (distance >= 3 && distance <= 6) {
        issues.push(
          `Potentially dangerous distance between jumps ${
            sortedJumps[i].number
          } and ${sortedJumps[i + 1].number}: ${distance.toFixed(1)}m`
        );
      }

      if (distance < 8) {
        combinations++;
      }

      if (i > 0) {
        const angle = calculateAngle(
          sortedJumps[i - 1],
          sortedJumps[i],
          sortedJumps[i + 1]
        );
        if (angle > 90) {
          sharpTurns++;
        }
      }
    }

    jumps.forEach((jump) => {
      const jumpType = jumpTypes.find((type) => type.id === jump.type);
      technicality += jumpType.technicality;
    });

    const currentLevel = getCurrentLevel();
    if (jumps.length > currentLevel.maxJumps) {
      issues.push(
        `Too many jumps: ${jumps.length}/${currentLevel.maxJumps} allowed for ${level}`
      );
    }

    const flowScore = Math.max(0, 100 - sharpTurns * 10);
    const safetyScore = Math.max(0, 100 - issues.length * 25);
    const varietyScore = Math.min(100, technicality * 10);
    const aiScore = (flowScore + safetyScore + varietyScore) / 3;

    const difficulty =
      sharpTurns * 15 + combinations * 10 + technicality * 5 + jumps.length * 2;
    const levelAdjustedDifficulty = difficulty * (currentLevel.maxHeight / 1.0);

    const complianceIssues = issues.filter((issue) =>
      issue.includes("Too many jumps")
    ).length;
    const compliance = Math.max(0, 100 - complianceIssues * 50);

    return {
      totalDistance: totalDistance,
      averageDistance:
        jumps.length > 1 ? totalDistance / (jumps.length - 1) : 0,
      difficulty: Math.min(100, levelAdjustedDifficulty),
      compliance,
      issues,
      sharpTurns,
      combinations,
      technicality,
      aiScore: Math.round(aiScore),
    };
  };

  // Canvas drawing function
  const drawCourse = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      for (let x = 0; x <= arenaWidth; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, arenaLength * scale);
        ctx.stroke();
      }
      for (let y = 0; y <= arenaLength; y += 5) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(arenaWidth * scale, y * scale);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, arenaWidth * scale, arenaLength * scale);

    if (jumps.length > 1) {
      const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);

      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);

      for (let i = 0; i < sortedJumps.length - 1; i++) {
        const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);

        if (distance >= 3 && distance <= 6) {
          ctx.strokeStyle = "#ef4444";
        } else if (distance < 8) {
          ctx.strokeStyle = "#f59e0b";
        } else {
          ctx.strokeStyle = "#10b981";
        }

        ctx.beginPath();
        ctx.moveTo(sortedJumps[i].x * scale, sortedJumps[i].y * scale);
        ctx.lineTo(sortedJumps[i + 1].x * scale, sortedJumps[i + 1].y * scale);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    jumps.forEach((jump) => {
      const jumpType = jumpTypes.find((type) => type.id === jump.type);
      const x = jump.x * scale;
      const y = jump.y * scale;
      const width = jumpType.width * scale;
      const height = 8;

      const isSelected = selectedJump === jump.id;

      if (isSelected) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          x - width / 2 - 5,
          y - height / 2 - 5,
          width + 10,
          height + 10
        );
        ctx.setLineDash([]);
      }

      const gradient = ctx.createLinearGradient(
        x - width / 2,
        y - height / 2,
        x + width / 2,
        y + height / 2
      );
      gradient.addColorStop(0, jumpType.color);
      gradient.addColorStop(1, isSelected ? "#1e40af" : "#000000");

      ctx.fillStyle = gradient;
      ctx.fillRect(x - width / 2, y - height / 2, width, height);

      ctx.strokeStyle = isSelected ? "#3b82f6" : "#000000";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(x - width / 2, y - height / 2, width, height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeText(jump.number.toString(), x, y + 4);
      ctx.fillText(jump.number.toString(), x, y + 4);

      const jumpHeight = jump.height || getCurrentLevel().minHeight || 1.0;
      ctx.fillStyle = "#374151";
      ctx.font = "11px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${jumpHeight.toFixed(1)}m`, x, y + 25);

      ctx.fillStyle = "#6b7280";
      ctx.font = "9px Arial";
      ctx.fillText(jumpType.name, x, y - 15);
    });

    if (jumps.length > 1) {
      const sortedJumps = [...jumps].sort((a, b) => a.number - b.number);
      for (let i = 0; i < sortedJumps.length - 1; i++) {
        const distance = calculateDistance(sortedJumps[i], sortedJumps[i + 1]);
        const midX = ((sortedJumps[i].x + sortedJumps[i + 1].x) / 2) * scale;
        const midY = ((sortedJumps[i].y + sortedJumps[i + 1].y) / 2) * scale;

        let distanceColor = "#10b981";
        if (distance < 8) distanceColor = "#f59e0b";
        if (distance >= 3 && distance <= 6) distanceColor = "#ef4444";

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(midX - 15, midY - 8, 30, 16);

        ctx.fillStyle = distanceColor;
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${distance.toFixed(1)}m`, midX, midY + 3);
      }
    }
  };

  // Export course data
  const exportCourse = () => {
    const analysis = analyzeCourse();
    const exportData = {
      course: {
        name: `Course-${discipline}-${level}-${new Date().toLocaleDateString()}`,
        discipline,
        level,
        arena: { width: arenaWidth, length: arenaLength },
        jumps,
        analysis,
        metadata: {
          aiGenerated: designMode === "ai",
          designMode,
          createdAt: new Date().toISOString(),
          totalJumps: jumps.length,
        },
      },
      version: "1.0",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-course-${discipline}-${level}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Delete selected jump
  const deleteSelectedJump = () => {
    if (selectedJump) {
      const updatedJumps = jumps.filter((jump) => jump.id !== selectedJump);
      const renumberedJumps = updatedJumps.map((jump, index) => ({
        ...jump,
        number: index + 1,
      }));
      setJumps(renumberedJumps);
      setSelectedJump(null);
    }
  };

  // Clear course
  const clearCourse = () => {
    setJumps([]);
    setSelectedJump(null);
  };

  // Update target jumps when level changes
  useEffect(() => {
    const currentLevel = getCurrentLevel();
    if (currentLevel && currentLevel.maxJumps) {
      setTargetJumps(Math.min(targetJumps, currentLevel.maxJumps));
    }
  }, [discipline, level]);

  // Update canvas when data changes
  useEffect(() => {
    drawCourse();
  }, [jumps, arenaWidth, arenaLength, showGrid, selectedJump]);

  const analysis = analyzeCourse();
  const currentLevel = getCurrentLevel();

  return (
    <CourseBuilderProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-navbar pb-16">
          <div className="max-w-7xl mx-auto">
            <Header
              setDesignMode={setDesignMode}
              designMode={designMode}
              discipline={discipline}
              setDiscipline={setDiscipline}
              level={level}
              setLevel={setLevel}
              competitionLevels={competitionLevels}
              arenaWidth={arenaWidth}
              setArenaWidth={setArenaWidth}
              arenaLength={arenaLength}
              setArenaLength={setArenaLength}
              targetJumps={targetJumps}
              setTargetJumps={setTargetJumps}
              courseStyle={courseStyle}
              setCourseStyle={setCourseStyle}
              difficultyPreference={difficultyPreference}
              setDifficultyPreference={setDifficultyPreference}
              jumpTypes={jumpTypes}
              selectedJumpType={selectedJumpType}
              setSelectedJumpType={setSelectedJumpType}
              currentLevel={currentLevel}
              generateAICourse={generateAICourse}
              isGenerating={isGenerating}
              generationSettings={generationSettings}
              setGenerationSettings={setGenerationSettings}
              courseText={courseText}
              setCourseText={setCourseText}
              parseCourseText={parseCourseText}
              selectedJump={selectedJump}
              deleteSelectedJump={deleteSelectedJump}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <CourseCanvas
                designMode={designMode}
                clearCourse={clearCourse}
                exportCourse={exportCourse}
                jumps={jumps}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                canvasRef={canvasRef}
                arenaWidth={arenaWidth}
                arenaLength={arenaLength}
                scale={scale}
                handleCanvasMouseDown={handleCanvasMouseDown}
                handleCanvasMouseMove={handleCanvasMouseMove}
                handleCanvasMouseUp={handleCanvasMouseUp}
                selectedJump={selectedJump}
              />

              <AIAnalysisPanel
                analysis={analysis}
                jumps={jumps}
                designMode={designMode}
                currentLevel={currentLevel}
              />
            </div>

            {/* Features Info */}
            <FeaturesInfo/>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AiCourseBuilder;
