
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { RecommendationsLayout, ThreePanelLayout } from "@/components/recommendations/RecommendationsLayout";
import { HeaderSection, JumpingHeaderSection } from "@/components/recommendations/HeaderSection";
import { ScoreHeatmap } from "@/components/recommendations/ScoreVisualization";
import { KeyInsights } from "@/components/recommendations/KeyInsights";
import { JudgeCommentAnalysis } from "@/components/recommendations/JudgeCommentAnalysis";
import { PriorityRecommendations } from "@/components/recommendations/PriorityRecommendations";
import { CourseMap } from "@/components/recommendations/jumping/CourseMap";
import { RecommendationsPanel } from "@/components/recommendations/RecommendationsLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

// Define interfaces for our data structures
interface Movement {
  id: string;
  number: number;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  isAboveAverage: boolean;
  comments?: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  isStrength: boolean;
}

interface CommentCategory {
  name: string;
  value: number;
  color: string;
}

interface JudgeComment {
  id: string;
  text: string;
  category: string;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  exercises: Exercise[];
  priority: number;
}

interface DressageData {
  testInfo: {
    testName: string;
    level: string;
    date: string;
    judge: string;
    score: number;
    percentage: number;
    trend: "up" | "down" | "neutral";
  };
  movements: Movement[];
  average: number;
  strengths: Insight[];
  improvements: Insight[];
  commentCategories: CommentCategory[];
  comments: JudgeComment[];
  recommendations: Recommendation[];
}

interface JumpPosition {
  x: number;
  y: number;
  number: number;
  performance: "excellent" | "good" | "fair" | "poor";
  faults?: number;
  knockdown?: boolean;
  refusal?: boolean;
  timeFault?: boolean;
}

interface CoursePathPoint {
  x: number;
  y: number;
  isApproach?: boolean;
  isLanding?: boolean;
}

interface JumpingData {
  courseInfo: {
    competitionName: string;
    courseHeight: string;
    courseType: string;
    date: string;
    time?: string;
    faults: number;
    trend: "up" | "down" | "neutral";
  };
  jumps: JumpPosition[];
  path: CoursePathPoint[];
  strengths: Insight[];
  improvements: Insight[];
  recommendations: Recommendation[];
}

// This is a mock page demonstrating how the components could be composed
const RecommendationsPage = () => {
  const { id, discipline } = useParams<{ id: string; discipline: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [selectedJump, setSelectedJump] = useState<number | null>(null);
  
  // Determine discipline from the URL parameter
  const isDressage = discipline === "dressage";
  const disciplineType = isDressage ? "dressage" : "jumping";
  
  // Mock data would be replaced with real data from API/database
  const mockDressageData: DressageData = {
    testInfo: {
      testName: "First Level Test 3",
      level: "First Level",
      date: "May 5, 2025",
      judge: "Jane Smith",
      score: 210,
      percentage: 67.74,
      trend: "up"
    },
    movements: [
      { id: "m1", number: 1, name: "Enter working trot", score: 7, maxScore: 10, percentage: 70, isAboveAverage: true, comments: "Good activity" },
      { id: "m2", number: 2, name: "Track left, working trot", score: 6, maxScore: 10, percentage: 60, isAboveAverage: false, comments: "Could be more energetic" },
      // ... more movements
    ],
    average: 65,
    strengths: [
      { id: "s1", title: "Halts", description: "Square, balanced halts with good transitions", isStrength: true },
      { id: "s2", title: "Trot work", description: "Consistent rhythm and good engagement", isStrength: true },
    ],
    improvements: [
      { id: "i1", title: "Canter transitions", description: "Need more preparation and balance", isStrength: false },
      { id: "i2", title: "Bend on circles", description: "Maintain inside bend throughout", isStrength: false },
    ],
    commentCategories: [
      { name: "Balance", value: 5, color: "#9333ea" },
      { name: "Rhythm", value: 3, color: "#4f46e5" },
      { name: "Contact", value: 4, color: "#0ea5e9" },
    ],
    comments: [
      { id: "c1", text: "More engagement from behind needed", category: "Balance" },
      { id: "c2", text: "Good rhythm in extended trot", category: "Rhythm" },
    ],
    recommendations: [
      {
        id: "r1",
        title: "Improve Canter Transitions",
        description: "Work on preparation and balance for canter transitions",
        timeframe: "2-4 weeks",
        priority: 1,
        exercises: [
          {
            id: "e1",
            name: "Trot-Canter Transitions on a Circle",
            description: "Use a 20m circle to practice balanced transitions",
            difficulty: "intermediate",
          }
        ]
      },
    ]
  };

  const mockJumpingData: JumpingData = {
    courseInfo: {
      competitionName: "Spring Classic",
      courseHeight: "1.10m",
      courseType: "Speed",
      date: "May 7, 2025",
      time: "68.32s",
      faults: 4,
      trend: "neutral"
    },
    jumps: [
      { x: 0.2, y: 0.15, number: 1, performance: "good" },
      { x: 0.4, y: 0.3, number: 2, performance: "excellent" },
      { x: 0.6, y: 0.5, number: 3, performance: "fair" },
      { x: 0.8, y: 0.7, number: 4, performance: "poor", faults: 4, knockdown: true },
    ],
    path: [
      { x: 0.1, y: 0.1 },
      { x: 0.2, y: 0.15 },
      { x: 0.4, y: 0.3 },
      { x: 0.6, y: 0.5 },
      { x: 0.8, y: 0.7 },
      { x: 0.9, y: 0.8 },
    ],
    strengths: [
      { id: "s1", title: "Forward Riding", description: "Good pace and forward momentum throughout course", isStrength: true },
      { id: "s2", title: "Turning Technique", description: "Efficient turns between obstacles", isStrength: true },
    ],
    improvements: [
      { id: "i1", title: "Approach to Verticals", description: "Work on approach distances to vertical jumps", isStrength: false },
      { id: "i2", title: "Landing Balance", description: "Improve balance on landing to prepare for next fence", isStrength: false },
    ],
    recommendations: [
      {
        id: "r1",
        title: "Vertical Jump Approach",
        description: "Improve approach and takeoff spot for vertical obstacles",
        timeframe: "3-5 weeks",
        priority: 1,
        exercises: [
          {
            id: "e1",
            name: "Grid Work with Verticals",
            description: "Set up a grid with ground poles and progressive verticals",
            difficulty: "intermediate",
          }
        ]
      },
    ]
  };

  // Use appropriate data based on discipline
  const data = isDressage ? mockDressageData : mockJumpingData;

  // Handle adding exercise to training plan
  const handleAddToTrainingPlan = (exercise: Exercise) => {
    console.log("Adding exercise to training plan:", exercise);
    // Implement logic to add to training plan
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <RecommendationsLayout discipline={disciplineType}>
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground"
            >
              ← {language === "en" ? "Back" : "Volver"}
            </Button>
            
            <h1 className={`text-2xl font-bold ${isDressage ? "text-purple-700" : "text-blue-700"}`}>
              {language === "en" ? "Analysis & Recommendations" : "Análisis y Recomendaciones"}
            </h1>
            
            <div className="w-[72px]"></div> {/* Spacer for alignment */}
          </div>
          
          {/* Header with test/course information */}
          {isDressage ? (
            <HeaderSection {...(data as DressageData).testInfo} discipline="dressage" />
          ) : (
            <JumpingHeaderSection {...(data as JumpingData).courseInfo} />
          )}
          
          {/* Main Three-Panel Layout */}
          <ThreePanelLayout
            leftPanel={
              isDressage ? (
                <RecommendationsPanel title={language === "en" ? "Score Breakdown" : "Desglose de Puntuación"}>
                  <ScoreHeatmap
                    movements={(data as DressageData).movements}
                    average={(data as DressageData).average}
                    onMovementClick={setSelectedMovement as any}
                    selectedMovementId={selectedMovement?.id}
                    discipline="dressage"
                  />
                </RecommendationsPanel>
              ) : (
                <CourseMap
                  jumps={(data as JumpingData).jumps}
                  path={(data as JumpingData).path}
                  onJumpClick={setSelectedJump}
                  selectedJump={selectedJump}
                />
              )
            }
            centerPanel={
              <RecommendationsPanel title={language === "en" ? "Key Insights" : "Ideas Principales"}>
                <KeyInsights
                  strengths={data.strengths}
                  improvements={data.improvements}
                  discipline={disciplineType}
                />
              </RecommendationsPanel>
            }
            rightPanel={
              isDressage ? (
                <RecommendationsPanel title={language === "en" ? "Judge Comments" : "Comentarios del Juez"}>
                  <JudgeCommentAnalysis
                    categories={(data as DressageData).commentCategories}
                    comments={(data as DressageData).comments}
                    discipline="dressage"
                  />
                </RecommendationsPanel>
              ) : (
                <RecommendationsPanel title={language === "en" ? "Jump Analysis" : "Análisis de Saltos"}>
                  {/* Jump analysis would go here */}
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {language === "en" 
                      ? "Jump analysis for the selected obstacle will appear here" 
                      : "El análisis del salto seleccionado aparecerá aquí"}
                  </div>
                </RecommendationsPanel>
              )
            }
          />
          
          {/* Recommendations Section */}
          <div className="mt-10">
            <PriorityRecommendations
              recommendations={data.recommendations}
              discipline={disciplineType}
              onAddToTrainingPlan={handleAddToTrainingPlan}
            />
          </div>
        </RecommendationsLayout>
      </main>
      <Footer />
    </div>
  );
};

export default RecommendationsPage;
