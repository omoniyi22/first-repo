import React, { useState, useEffect } from "react";
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
import { EnhancedAIGenerator } from "@/utils/enhancedAIGenerator";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/ai-course-builder/Header";
import CourseCanvas from "@/components/ai-course-builder/CourseCanvas";
import AIAnalysisPanel from "@/components/ai-course-builder/AIAnalysisPanel";
import FeaturesInfo from "@/components/ai-course-builder/FeaturesInfo";
import { competitionLevels, jumpTypes } from "@/data/aiCourseBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  JERSEY_FRESH_CCI3,
  JERSEY_FRESH_VARIATION_1_ROTATE_25,
  JERSEY_FRESH_VARIATION_2_MIRROR_H,
  JERSEY_FRESH_VARIATION_3_MIRROR_V_POSITION,
  JERSEY_FRESH_VARIATION_4_ROTATE_35_HEIGHT,
  MACON_GRAND_INDOOR,
  MACON_VARIATION_1_ROTATE_15,
  MACON_VARIATION_2_MIRROR_H,
  MACON_VARIATION_3_MIRROR_V_POSITION,
  MACON_VARIATION_4_ROTATE_30_HEIGHT,
  PARIS_GRAND_INDOOR,
  PARIS_VARIATION_1_ROTATE_20,
  PARIS_VARIATION_2_MIRROR_H,
  PARIS_VARIATION_3_MIRROR_V_POSITION,
  PARIS_VARIATION_4_ROTATE_30_HEIGHT,
} from "@/data/courseData";
// Type definitions
interface GeneratedJump {
  id: string;
  x: number;
  y: number;
  type: "vertical" | "oxer" | "triple" | "water";
  height?: number;
  width?: number;
  number?: number;
}

interface CourseGenerationResult {
  jumps: GeneratedJump[];
  method: string;
}

interface CourseAnalysis {
  totalDistance: number;
  averageDistance: number;
  difficulty: number;
  compliance: number;
  issues: string[];
  sharpTurns: number;
  combinations: number;
  technicality: number;
  aiScore: number;
}

const AiCourseBuilder = () => {
  // Core state management
  const [discipline, setDiscipline] = useState("showjumping");
  const [level, setLevel] = useState("novice");
  const [arenaWidth, setArenaWidth] = useState(60);
  const [arenaLength, setArenaLength] = useState(40);
  const [jumps, setJumps] = useState<GeneratedJump[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseStyle, setCourseStyle] = useState("flowing");
  const [targetJumps, setTargetJumps] = useState(8);
  const [difficultyPreference, setDifficultyPreference] = useState("medium");
  const [courseText, setCourseText] = useState("");
  const [selectedJump, setSelectedJump] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState("ai");
  const [selectedJumpType, setSelectedJumpType] = useState("vertical");
  const [analysis, setAnalysis] = useState<CourseAnalysis | undefined>();
  const [userDiscipline, setUserDiscipline] = useState<string>("");
  const [generationSettings, setGenerationSettings] = useState({
    allowCombinations: true,
    preferSmoothTurns: true,
    includeSpecialtyJumps: true,
    optimizeForFlow: true,
  });

  // Enhanced AI state
  const [generationMethod, setGenerationMethod] = useState<string>("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const scale = 8;
  const GEMINI_API_KEY = "AIzaSyDZ6WsChZLWXldvn0OPKYSrVZhw5gs8Rtg";

  // Fetch user data and handle authentication
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        navigate("/dashboard", { state: { from: "/ai-course-builder" } });
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("discipline")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData?.discipline) {
          setUserDiscipline(profileData.discipline);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  // Redirect dressage users
  useEffect(() => {
    if (userDiscipline === "dressage") {
      navigate("/dashboard", { state: { from: "/ai-course-builder" } });
    }
  }, [userDiscipline, navigate]);

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
  const calculateDistance = (
    jump1: GeneratedJump,
    jump2: GeneratedJump
  ): number => {
    const dx = jump2.x - jump1.x;
    const dy = jump2.y - jump1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate angle between three points
  const calculateAngle = (
    jump1: GeneratedJump,
    jump2: GeneratedJump,
    jump3: GeneratedJump
  ): number => {
    const angle1 = Math.atan2(jump2.y - jump1.y, jump2.x - jump1.x);
    const angle2 = Math.atan2(jump3.y - jump2.y, jump3.x - jump2.x);
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  // Enhanced AI Course Generation
  const generateAICourse = async (): Promise<void> => {
    setIsGenerating(true);
    setGenerationMethod("");

    try {
      // 1. Pick a professional course based on user settings
      let selectedCourse;
      if (difficultyPreference === "easy") {
        selectedCourse = JERSEY_FRESH_CCI3;
      } else if (difficultyPreference === "medium") {
        selectedCourse = JERSEY_FRESH_VARIATION_3_MIRROR_V_POSITION;
      } else {
        selectedCourse = PARIS_GRAND_INDOOR;
      }

      // 2. Scale to user's arena size
      const scaleX = arenaWidth / selectedCourse.arena.width;
      const scaleY = arenaLength / selectedCourse.arena.length;

      // 3. Convert to your app format
      const convertedJumps = selectedCourse.jumps.map((jump, index) => ({
        id: `jump_${jump.number}`,
        number: jump.number,
        x: jump.x * scaleX,
        y: jump.y * scaleY,
        // height:
        // getCurrentLevel().minHeight +
        // (getCurrentLevel().maxHeight - getCurrentLevel().minHeight) * 0.5,
        height: jump.height,
        type: jump.type,
        rotation: jump.rotation,
      }));

      setJumps(convertedJumps);
      setGenerationMethod(`Professional Course: ${selectedCourse.name}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Course generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  // Basic course generation fallback
  const generateBasicCourse = (
    width: number,
    length: number,
    numJumps: number,
    levelConfig: any
  ): GeneratedJump[] => {
    const jumps: GeneratedJump[] = [];
    const margin = 8;
    const patterns = ["figure8", "serpentine", "circle"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    for (let i = 0; i < numJumps; i++) {
      let x: number, y: number;

      switch (pattern) {
        case "serpentine":
          x = margin + (i / (numJumps - 1)) * (width - 2 * margin);
          y =
            length / 2 + (length / 4) * Math.sin((i / numJumps) * 4 * Math.PI);
          break;
        case "circle":
          const angle = (i / numJumps) * 2 * Math.PI;
          const radius = Math.min(width, length) / 3;
          x = width / 2 + radius * Math.cos(angle);
          y = length / 2 + radius * Math.sin(angle);
          break;
        default: // figure8
          const figureAngle = (i / numJumps) * 4 * Math.PI;
          x =
            width / 2 +
            (width / 4) * Math.cos(figureAngle) * Math.sin(figureAngle * 2);
          y = length / 2 + (length / 4) * Math.sin(figureAngle);
      }

      jumps.push({
        id: `jump_${Date.now()}_${i}`,
        x: Math.round(Math.max(margin, Math.min(width - margin, x))),
        y: Math.round(Math.max(margin, Math.min(length - margin, y))),
        type: i % 3 === 0 ? "oxer" : "vertical",
        number: i + 1,
        height:
          levelConfig.minHeight +
          (levelConfig.maxHeight - levelConfig.minHeight) * 0.5,
      });
    }

    return jumps;
  };

  // Parse course text upload
  const parseCourseText = (): void => {
    if (!courseText.trim()) return;

    const lines = courseText.split("\n").filter((line) => line.trim());
    const newJumps: GeneratedJump[] = [];

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      let jumpType: string = "vertical";

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
        id: `text_jump_${Date.now()}_${index}`,
        x: Math.round(x),
        y: Math.round(y),
        type: jumpType as "vertical" | "oxer" | "triple" | "water",
        number: index + 1,
        height:
          currentLevel.minHeight +
          (currentLevel.maxHeight - currentLevel.minHeight) * 0.5,
      });
    });

    setJumps(newJumps);
    setCourseText("");
  };

  // Course analysis function
  const analyzeCourse = (): CourseAnalysis => {
    console.log("🔧 Running local analysis...");
    console.log("Jumps for local analysis:", jumps);

    if (jumps.length < 2) {
      const defaultAnalysis = {
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
      console.log("📈 Default analysis (less than 2 jumps):", defaultAnalysis);
      return defaultAnalysis;
    }

    const sortedJumps = [...jumps].sort(
      (a, b) => (a.number || 0) - (b.number || 0)
    );
    let totalDistance = 0;
    let sharpTurns = 0;
    let combinations = 0;
    let technicality = 0;
    let issues: string[] = [];

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

      if (distance < 8) combinations++;

      if (i > 0) {
        const angle = calculateAngle(
          sortedJumps[i - 1],
          sortedJumps[i],
          sortedJumps[i + 1]
        );
        if (angle > 90) sharpTurns++;
      }
    }

    jumps.forEach((jump) => {
      const jumpType = jumpTypes.find((type) => type.id === jump.type);
      if (jumpType) technicality += jumpType.technicality || 0;
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

    const result = {
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

    console.log("📊 Local analysis result:", result);
    return result;
  };

  // Delete selected jump
  const deleteSelectedJump = (): void => {
    if (selectedJump) {
      const updatedJumps = jumps.filter((jump) => jump.id !== selectedJump);
      const renumberedJumps = updatedJumps.map((jump, index) => ({
        ...jump,
      }));
      setJumps(renumberedJumps);
      setSelectedJump(null);
    }
  };

  // Update target jumps when level changes
  useEffect(() => {
    const currentLevel = getCurrentLevel();
    if (currentLevel && currentLevel.maxJumps) {
      setTargetJumps(Math.min(targetJumps, currentLevel.maxJumps));
    }
  }, [discipline, level, targetJumps]);

  // AI Analysis function
  const analysisAICourse = async (): Promise<void> => {
    console.log("🔍 Starting AI analysis...");
    console.log("Jumps to analyze:", jumps);

    try {
      const currentLevel = getCurrentLevel();

      // Ensure we have jumps to analyze
      if (jumps.length === 0) {
        console.log("❌ No jumps to analyze");
        setAnalysis(undefined);
        return;
      }

      // Create a more detailed prompt with step-by-step calculations
      const jumpData = jumps.map((j) => ({
        number: j.number,
        x: j.x,
        y: j.y,
        type: j.type,
        height: j.height,
      }));

      const prompt = `You are an expert equestrian course designer and analyzer. Analyze this ${discipline} course step by step.

COURSE SETUP:
- Discipline: ${discipline}
- Level: ${level} (Max height: ${currentLevel.maxHeight}m, Max jumps: ${
        currentLevel.maxJumps
      })  
- Arena: ${arenaWidth}m × ${arenaLength}m
- Total jumps: ${jumps.length}

JUMP SEQUENCE (in order):
${jumpData
  .map((j) => `Jump ${j.number}: Position (${j.x}, ${j.y}) - Type: ${j.type}`)
  .join("\n")}

STEP-BY-STEP ANALYSIS:

1. DISTANCE CALCULATIONS:
Calculate distance between each consecutive jump using: √[(x2-x1)² + (y2-y1)²]
- Jump 1→2: Distance = ?
- Jump 2→3: Distance = ?
(continue for all jumps)
- Total Distance = sum of all distances
- Average Distance = total distance ÷ (number of jumps - 1)

2. TURN ANALYSIS:
For each set of 3 consecutive jumps, calculate the turn angle.
Sharp turns = angles > 90°

3. COMBINATIONS:
Count jumps that are less than 8 meters apart (combinations)

4. TECHNICALITY SCORING:
- vertical = 1 point
- oxer = 2 points  
- triple = 3 points
- water = 4 points
Sum all technicality points

5. COMPLIANCE CHECK:
- Are there more than ${currentLevel.maxJumps} jumps? (violation)
- Any dangerous distances (3-6m apart)? (safety issue)

6. OVERALL SCORE:
Rate the course quality 0-100 based on flow, safety, and design

IMPORTANT: Do the actual mathematical calculations with the provided coordinates. Don't return placeholder zeros.

Return ONLY this JSON with your calculated values:
{
  "totalDistance": [your calculated total],
  "averageDistance": [your calculated average], 
  "sharpTurns": [your count],
  "combinations": [your count],
  "technicality": [your sum],
  "compliance": [0-100],
  "aiScore": [0-100],
  "issues": [array of issues you found]
}`;

      console.log("📤 Sending enhanced request to AI...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3, // Slightly higher for better reasoning
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 2048, // More tokens for detailed analysis
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📥 AI Response:", result);

      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("📄 Raw AI text:", rawText);

      if (rawText) {
        const cleaned = rawText.replace(/```json\n?|```/g, "").trim();
        console.log("🧹 Cleaned text:", cleaned);

        const analysisResult: CourseAnalysis = JSON.parse(cleaned);
        console.log("✅ Parsed analysis result:", analysisResult);

        // Validate that we got actual analysis (not all zeros)
        if (
          analysisResult.totalDistance === 0 &&
          analysisResult.averageDistance === 0 &&
          jumps.length > 1
        ) {
          console.log("⚠️ AI still returned zeros, using local analysis");
          throw new Error("AI returned empty analysis");
        }

        // Additional validation - check if values are reasonable
        if (
          analysisResult.totalDistance > 0 &&
          analysisResult.averageDistance > 0
        ) {
          setAnalysis(analysisResult);
          console.log("💾 AI analysis successfully set to state");
        } else {
          throw new Error("AI analysis values seem unrealistic");
        }
      } else {
        throw new Error("No content in AI response");
      }
    } catch (error) {
      console.error("❌ AI analysis failed:", error);

      // Always fall back to local analysis which we know works
      console.log("🔄 Using reliable local analysis...");
      const localAnalysis = analyzeCourse();
      console.log("📊 Local analysis result:", localAnalysis);

      setAnalysis(localAnalysis);
      console.log("💾 Local analysis set to state");
    }
  };

  useEffect(() => {
    if (jumps.length > 0) {
      // Auto-analyze when jumps change
      const localAnalysis = analyzeCourse();
      setAnalysis(localAnalysis);
    }
  }, [jumps]);

  const currentLevel = getCurrentLevel();

  // Early return for unauthorized users
  if (!userDiscipline || userDiscipline === "dressage") {
    return null;
  }

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
              {generationMethod && (
                <div className="xl:col-span-4 text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="inline w-4 h-4 mr-2" />
                  Generated using:{" "}
                  <span className="font-medium">{generationMethod}</span>
                </div>
              )}

              <CourseCanvas
                designMode={designMode}
                jumps={jumps}
                arenaWidth={arenaWidth}
                arenaLength={arenaLength}
                scale={scale}
                selectedJump={selectedJump}
                setJumps={setJumps}
                setSelectedJump={setSelectedJump}
                getCurrentLevel={getCurrentLevel}
                selectedJumpType={selectedJumpType}
                discipline={discipline}
                analyzeCourse={analyzeCourse}
                level={level}
                calculateDistance={calculateDistance}
              />

              <AIAnalysisPanel
                analysis={analysis}
                jumps={jumps}
                designMode={designMode}
                currentLevel={currentLevel}
                analyzeCourse={analysisAICourse}
              />
            </div>

            <FeaturesInfo />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AiCourseBuilder;
