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
import Header from "@/components/ai-course-builder/Header";
import CourseCanvas from "@/components/ai-course-builder/CourseCanvas";
import AIAnalysisPanel from "@/components/ai-course-builder/AIAnalysisPanel";
import FeaturesInfo from "@/components/ai-course-builder/FeaturesInfo";
import { competitionLevels, jumpTypes } from "@/data/aiCourseBuilder";

const AiCourseBuilder = () => {
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
  const [aiAnalysis, setAiAnalysis] = useState();
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

  // AI Course Generation Algorithm
  const generateAICourse = async () => {
    setIsGenerating(true);

    try {
      const currentLevel = getCurrentLevel();
      const prompt = `
You're an equestrian AI course designer and analyzer. Based on the following settings, generate a realistic course and return both the jump data AND analysis in a structured JSON format.

Course Settings:
Discipline: ${discipline}
Level: International ${level}
Jump Height Range: ${currentLevel?.minHeight || 0.8}m to ${
        currentLevel?.maxHeight || 1.2
      }m
Arena Size: ${arenaWidth}m x ${arenaLength}m
Target Number of Jumps: ${targetJumps}
Course Style: ${courseStyle.replace("_", " ")}
Preferred Difficulty: ${difficultyPreference}

Generation Rules:
- Allow combinations (spacing <8m): ${generationSettings.allowCombinations}
- Prefer smooth turns (< 90°): ${generationSettings.preferSmoothTurns}
- Include specialty jumps (water, liverpool, wall): ${
        generationSettings.includeSpecialtyJumps
      }
- Optimize for course flow: ${generationSettings.optimizeForFlow}

Output Format (strictly JSON):
{
  "jumps": [
    {
      "id": 1750414508272,
      "x": 71,
      "y": 44,
      "type": "vertical",
      "number": 1,
      "height": 1.045
    },
    ...
  ],
  "analysis": {
    "totalDistance": 320,
    "averageDistance": 21.3,
    "sharpTurns": 2,
    "combinations": 3,
    "technicality": 9,
    "compliance": 85,
    "aiScore": 79,
    "issues": [
      "Potentially dangerous distance between jumps 2 and 3: 4.2m",
      "Too many jumps for the level"
    ]
  }
}

Rules:
- Do not include explanations or commentary
- The entire response must be valid JSON
- Round distances and scores appropriately (1 decimal max)
`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDZ6WsChZLWXldvn0OPKYSrVZhw5gs8Rtg`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );
      const result = await geminiResponse.text();
      const geminiResult = JSON.parse(result);
      const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Missing content in Gemini response.");
      }
      // Remove markdown formatting like ```json\n and ```
      const cleaned = rawText.replace(/```json\n?|```/g, "").trim();

      const cleanedArray = JSON.parse(cleaned);

      const updatedJumpsArray = cleanedArray.jumps.map((jump) => ({
        ...jump,
        id: Date.now(),
      }));

      setAiAnalysis(cleanedArray.analysis);
      setJumps(updatedJumpsArray);
      setIsGenerating(false);
    } catch (error) {
      setJumps([]);
      setIsGenerating(false);
      console.log("🚀 ~ generateAICourse ~ error:", error);
    }
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

  const analysis = designMode === "ai" ? aiAnalysis : analyzeCourse();
  const currentLevel = getCurrentLevel();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
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
            <FeaturesInfo />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AiCourseBuilder;
