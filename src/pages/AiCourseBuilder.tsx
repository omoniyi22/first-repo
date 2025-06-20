import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  RotateCcw,
  Settings,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                    AI Jump Course Generator
                  </h1>
                  <p className="text-gray-600 mt-2">
                    AI-powered intelligent course design for all competition
                    levels
                  </p>
                </div>
              </div>

              {/* Design Mode Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setDesignMode("ai")}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      designMode === "ai"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    AI Course Generator
                  </button>
                  <button
                    onClick={() => setDesignMode("manual")}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      designMode === "manual"
                        ? "bg-green-600 text-white shadow-md"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Manual Designer
                  </button>
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {designMode === "ai"
                      ? "AI Course Parameters"
                      : "Manual Design Settings"}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discipline
                      </label>
                      <select
                        value={discipline}
                        onChange={(e) => setDiscipline(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="showjumping">Show Jumping</option>
                        <option value="eventing">Eventing</option>
                        <option value="ponyclub">Pony Club</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Competition Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(competitionLevels[discipline]).map(
                          ([key, levelData]) => (
                            <option key={key} value={key}>
                              {levelData.description}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arena Width (m)
                      </label>
                      <input
                        type="number"
                        value={arenaWidth}
                        onChange={(e) =>
                          setArenaWidth(parseInt(e.target.value) || 60)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="20"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arena Length (m)
                      </label>
                      <input
                        type="number"
                        value={arenaLength}
                        onChange={(e) =>
                          setArenaLength(parseInt(e.target.value) || 40)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="20"
                        max="100"
                      />
                    </div>
                  </div>

                  {designMode === "ai" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Jumps
                          </label>
                          <input
                            type="number"
                            value={targetJumps}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) || 4;
                              setTargetJumps(
                                Math.min(newValue, currentLevel?.maxJumps || 8)
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="4"
                            max={currentLevel?.maxJumps || 8}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Max for {level}: {currentLevel?.maxJumps || 8}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Style
                          </label>
                          <select
                            value={courseStyle}
                            onChange={(e) => setCourseStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="flowing">Flowing & Smooth</option>
                            <option value="technical">
                              Technical & Challenging
                            </option>
                            <option value="educational">
                              Educational & Simple
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Preference
                        </label>
                        <select
                          value={difficultyPreference}
                          onChange={(e) =>
                            setDifficultyPreference(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="easy">
                            Easy - Simple jumps, smooth flow
                          </option>
                          <option value="medium">
                            Medium - Balanced challenge
                          </option>
                          <option value="challenging">
                            Challenging - Complex jumps, tight turns
                          </option>
                        </select>
                      </div>
                    </>
                  )}

                  {designMode === "manual" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Jump Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {jumpTypes.map((jumpType) => (
                          <button
                            key={jumpType.id}
                            onClick={() => setSelectedJumpType(jumpType.id)}
                            className={`p-2 rounded-lg text-sm transition-colors ${
                              selectedJumpType === jumpType.id
                                ? "bg-blue-100 border-2 border-blue-500"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: jumpType.color }}
                              ></div>
                              <span className="font-medium">
                                {jumpType.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click to select, then click on arena to place jumps
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - AI Settings or Manual Tools */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {designMode === "ai"
                      ? "AI Generation Settings"
                      : "Course Upload & Tools"}
                  </h2>

                  {designMode === "ai" && (
                    <>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={generationSettings.allowCombinations}
                            onChange={(e) =>
                              setGenerationSettings({
                                ...generationSettings,
                                allowCombinations: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Allow combination jumps (less than 8m spacing)
                          </span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={generationSettings.preferSmoothTurns}
                            onChange={(e) =>
                              setGenerationSettings({
                                ...generationSettings,
                                preferSmoothTurns: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Prefer smooth turns (less than 90° changes)
                          </span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={generationSettings.includeSpecialtyJumps}
                            onChange={(e) =>
                              setGenerationSettings({
                                ...generationSettings,
                                includeSpecialtyJumps: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Include specialty jumps (water, liverpool, etc.)
                          </span>
                        </label>

                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={generationSettings.optimizeForFlow}
                            onChange={(e) =>
                              setGenerationSettings({
                                ...generationSettings,
                                optimizeForFlow: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Optimize for horse & rider flow
                          </span>
                        </label>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">
                          Selected Level:{" "}
                          {currentLevel?.description || "Loading..."}
                        </h3>
                        <div className="text-sm text-blue-600 space-y-1">
                          <p>
                            • Height Range: {currentLevel?.minHeight || 0.8}m -{" "}
                            {currentLevel?.maxHeight || 1.0}m
                          </p>
                          <p>• Maximum Jumps: {currentLevel?.maxJumps || 8}</p>
                          <p>
                            • Current Arena: {arenaWidth}m × {arenaLength}m
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={generateAICourse}
                        disabled={isGenerating}
                        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                          isGenerating
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        }`}
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            AI Generating Course...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate AI Course
                          </div>
                        )}
                      </button>
                    </>
                  )}

                  {designMode === "manual" && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Upload Course Description
                        </h3>
                        <textarea
                          value={courseText}
                          onChange={(e) => setCourseText(e.target.value)}
                          placeholder="Enter course description... e.g.:
Jump 1: Vertical
Jump 2: Oxer
Jump 3: Water jump
Jump 4: Triple bar"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm"
                        />
                        <button
                          onClick={parseCourseText}
                          disabled={!courseText.trim()}
                          className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Parse & Create Course
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Manual Design Tools
                        </h3>
                        <button
                          onClick={deleteSelectedJump}
                          disabled={!selectedJump}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 inline mr-2" />
                          Delete Selected Jump
                        </button>
                      </div>

                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-2">
                          Manual Design Tips
                        </h3>
                        <div className="text-sm text-green-600 space-y-1">
                          <p>• Click arena to add jumps</p>
                          <p>• Click jumps to select them</p>
                          <p>• Drag selected jumps to move</p>
                          <p>• Upload text for bulk creation</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Course Canvas */}
              <div className="xl:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {designMode === "ai"
                      ? "AI Generated Course"
                      : "Manual Course Designer"}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={clearCourse}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 inline mr-2" />
                      Clear
                    </button>
                    <button
                      onClick={exportCourse}
                      disabled={jumps.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Download className="w-4 h-4 inline mr-2" />
                      Export
                    </button>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Grid</span>
                    </label>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-green-50">
                  <canvas
                    ref={canvasRef}
                    width={arenaWidth * scale}
                    height={arenaLength * scale}
                    className={`w-full h-auto ${
                      designMode === "manual" ? "cursor-crosshair" : ""
                    }`}
                    style={{ maxHeight: "600px" }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Safe Distance (8m+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Combination (&lt;8m)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Dangerous (3-6m)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>
                      Arena: {arenaWidth}m × {arenaLength}m | Jumps:{" "}
                      {jumps.length}
                    </p>
                    {designMode === "manual" && (
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedJump
                          ? "Click and drag to move selected jump"
                          : "Click to add jumps • Click jumps to select"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Analysis Panel */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-600" />
                  Course Analysis
                </h2>

                {jumps.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {designMode === "ai"
                        ? "Generate a course to see AI analysis"
                        : "Add jumps to see analysis"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* AI Score */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">
                        {designMode === "ai"
                          ? "AI Optimization Score"
                          : "Course Quality Score"}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              analysis.aiScore > 80
                                ? "bg-green-500"
                                : analysis.aiScore > 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${analysis.aiScore}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-blue-800">
                          {analysis.aiScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {analysis.aiScore > 80
                          ? "Excellent optimization"
                          : analysis.aiScore > 60
                          ? "Good optimization"
                          : "Needs improvement"}
                      </p>
                    </div>

                    {/* Course Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 block">
                          Total Distance
                        </span>
                        <span className="font-semibold text-lg">
                          {analysis.totalDistance.toFixed(0)}m
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 block">
                          Avg Distance
                        </span>
                        <span className="font-semibold text-lg">
                          {analysis.averageDistance.toFixed(1)}m
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 block">Sharp Turns</span>
                        <span className="font-semibold text-lg">
                          {analysis.sharpTurns}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 block">
                          Combinations
                        </span>
                        <span className="font-semibold text-lg">
                          {analysis.combinations}
                        </span>
                      </div>
                    </div>

                    {/* Compliance */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Level Compliance
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              analysis.compliance > 80
                                ? "bg-green-500"
                                : analysis.compliance > 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${analysis.compliance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {analysis.compliance}%
                        </span>
                      </div>
                    </div>

                    {/* Issues */}
                    {analysis.issues.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium text-red-800 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Issues Found
                        </h3>
                        <div className="space-y-2">
                          {analysis.issues.map((issue, index) => (
                            <div
                              key={index}
                              className="text-xs text-red-600 bg-red-50 p-2 rounded"
                            >
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {analysis.compliance === 100 &&
                      analysis.issues.length === 0 &&
                      analysis.aiScore > 80 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <h3 className="font-medium text-green-800 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Perfect Course!
                          </h3>
                          <p className="text-xs text-green-700 mt-1">
                            This course meets all requirements for{" "}
                            {currentLevel?.description || "this level"}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Features Info */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
                Complete Course Design Platform
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">
                    🤖 AI Course Generator
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• AI selects optimal jump types</li>
                    <li>• Smart height variation</li>
                    <li>• Automatic safety validation</li>
                    <li>• Level-appropriate complexity</li>
                    <li>• Three course styles available</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">
                    🎨 Manual Designer
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>
                      • <strong>Drag & Drop:</strong> Move jumps by dragging
                    </li>
                    <li>
                      • <strong>Course Upload:</strong> Parse text descriptions
                    </li>
                    <li>
                      • <strong>Visual Selection:</strong> Click to select jumps
                    </li>
                    <li>
                      • <strong>Jump Types:</strong> 6 different styles
                    </li>
                    <li>• Real-time validation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">
                    📤 Export & Share
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>
                      • <strong>JSON Export:</strong> Complete course data
                    </li>
                    <li>
                      • <strong>Professional Format:</strong> Ready for sharing
                    </li>
                    <li>
                      • <strong>Analysis Included:</strong> All metrics exported
                    </li>
                    <li>
                      • <strong>Print Ready:</strong> Professional course maps
                    </li>
                    <li>• Share with coaches & competitors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AiCourseBuilder;
