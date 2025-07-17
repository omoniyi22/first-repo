import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  Tooltip,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MovementRadarChart = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDiscipline, setUserDiscipline] = useState("");
  const { language } = useLanguage();
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user profile to get discipline
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
  }, [user]);

  useEffect(() => {
    const fetchDressageData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("document_analysis")
          .select(
            `
            *,
            analysis_results(*)
          `
          )
          .eq("user_id", user.id)
          .eq("discipline", "dressage")
          .order("created_at", { ascending: false });

        if (error) throw error;

        processDressageData(data);
        // console.log("🚀 ~ fetchDressageData ~ data:", data)
      } catch (error) {
        console.error("Error fetching dressage data:", error);
        setLoading(false);
      }
    };

    const processDressageData = (data) => {
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // console.log("🏇 Processing dressage data from", data, "documents");

      // Extract movement categories and scores
      const movementScores = {
        Walk: [],
        Trot: [],
        Canter: [],
        Transitions: [],
        Submission: [],
        "Rider Position": [],
      };

      // Helper function to categorize movements from array
      const categorizeMovementArray = (
        movements,
        score,
        targetCategory = null
      ) => {
        if (!Array.isArray(movements)) {
          console.warn("Movement is not an array:", movements);
          // Fallback for single movement
          if (movements) {
            categorizeMovementSingle(movements, score, targetCategory);
          }
          return;
        }

        // console.log(
        //   `🔍 Categorizing movement array:`,
        //   movements,
        //   `Score: ${score}`
        // );

        movements.forEach((movement) => {
          categorizeMovementSingle(movement, score, targetCategory);
        });
      };

      // Helper function to categorize a single movement
      const categorizeMovementSingle = (
        movement,
        score,
        targetCategory = null
      ) => {
        if (!movement) return;

        const movementLower = movement.toLowerCase();
        // console.log(
        //   `  - Processing movement: "${movement}" with score: ${score}`
        // );

        // Define movement categories with keywords
        const categoryMap = {
          Walk: ["walk", "paso", "step", "free walk", "paso libre"],
          Trot: [
            "trot",
            "trote",
            "passage",
            "piaffe",
            "medium trot",
            "trote medio",
          ],
          Canter: [
            "canter",
            "galope",
            "flying change",
            "cambio de pie",
            "flying",
            "pirouette",
            "pirueta",
          ],
          Transitions: [
            "transition",
            "transicion",
            "halt",
            "parada",
            "start",
            "partir",
            "entrada",
            "entry",
            "salute",
            "saludo",
            "immobility",
            "inmovilidad",
          ],
          Submission: [
            "contact",
            "contacto",
            "submission",
            "sumision",
            "acceptance",
            "mouth",
            "boca",
            "bit",
            "bocado",
            "relaxation",
            "relajacion",
          ],
          "Rider Position": [
            "geometry",
            "geometria",
            "accuracy",
            "precision",
            "circle",
            "circulo",
            "serpentine",
            "serpentina",
            "figure",
            "figura",
            "position",
            "posicion",
          ],
        };

        // If targetCategory is specified, only add to that category
        if (targetCategory && movementScores[targetCategory]) {
          movementScores[targetCategory].push(score);
          // console.log(`    ✅ Added to ${targetCategory}: ${score}`);
          return;
        }

        // Find matching category
        let categorized = false;
        for (const [category, keywords] of Object.entries(categoryMap)) {
          if (keywords.some((keyword) => movementLower.includes(keyword))) {
            movementScores[category].push(score);
            // console.log(`    ✅ Added to ${category}: ${score}`);
            categorized = true;
            break;
          }
        }

        // If no category found, try to infer from context
        if (!categorized) {
          // Default to Rider Position for geometry-related movements
          movementScores["Rider Position"].push(score);
          // console.log(`    ⚠️ Added to Rider Position (default): ${score}`);
        }
      };

      // Process each dressage analysis
      data.forEach((doc, docIndex) => {
        // console.log(`📄 Processing document ${docIndex + 1}:`, doc.file_name);

        if (doc.analysis_results && doc.analysis_results.length > 0) {
          doc.analysis_results.forEach((result, resultIndex) => {
            if (result.result_json && result.result_json.en) {
              const analysis = result.result_json.en;
              // console.log(`  📊 Processing analysis result ${resultIndex + 1}`);

              // Extract overall percentage and convert to movement scores
              if (analysis.percentage) {
                const baseScore = analysis.percentage / 10; // Convert percentage to 0-10 scale
                // console.log(
                //   `  📈 Base score from percentage: ${baseScore} (${analysis.percentage}%)`
                // );

                // Analyze strengths and weaknesses to adjust individual movement scores
                const strengths = analysis.strengths || [];
                const weaknesses = analysis.weaknesses || [];
                const focusAreas = analysis.focusArea || [];

                // console.log("  💪 Strengths:", strengths);
                // console.log("  ⚠️ Weaknesses:", weaknesses);
                // console.log(
                //   "  🎯 Focus areas:",
                //   focusAreas.map((f) => f.area)
                // );

                // Calculate individual movement scores based on analysis
                Object.keys(movementScores).forEach((movement) => {
                  let score = baseScore;

                  // Check if this movement is mentioned in strengths/weaknesses
                  const isStrength = strengths.some(
                    (strength) =>
                      strength.toLowerCase().includes(movement.toLowerCase()) ||
                      (movement === "Transitions" &&
                        strength.toLowerCase().includes("flying changes")) ||
                      (movement === "Rider Position" &&
                        strength.toLowerCase().includes("geometry"))
                  );

                  const isWeakness = weaknesses.some(
                    (weakness) =>
                      weakness.toLowerCase().includes(movement.toLowerCase()) ||
                      (movement === "Transitions" &&
                        weakness.toLowerCase().includes("transition")) ||
                      (movement === "Submission" &&
                        weakness.toLowerCase().includes("contact")) ||
                      (movement === "Trot" &&
                        weakness.toLowerCase().includes("trot"))
                  );

                  const isFocusArea = focusAreas.some(
                    (area) =>
                      area.area &&
                      (area.area
                        .toLowerCase()
                        .includes(movement.toLowerCase()) ||
                        (movement === "Transitions" &&
                          area.area.toLowerCase().includes("transition")) ||
                        (movement === "Submission" &&
                          area.area.toLowerCase().includes("contact")))
                  );

                  // Adjust score based on analysis
                  if (isStrength) {
                    score = Math.min(10, score + 0.5);
                  }
                  if (isWeakness || isFocusArea) {
                    score = Math.max(0, score - 0.8);
                  }

                  // Add some variation for different movements
                  if (movement === "Walk") score = Math.min(10, score + 0.2);
                  if (movement === "Canter") score = Math.max(0, score - 0.1);

                  movementScores[movement].push(Math.round(score * 10) / 10);
                });
              }

              // FIXED: Extract specific movement scores if available (handling arrays)
              if (analysis.lowestScore && analysis.highestScore) {
                const lowScore = analysis.lowestScore.score;
                const highScore = analysis.highestScore.score;

                const lowMovements = analysis.lowestScore.movement; // Array of strings
                const highMovements = analysis.highestScore.movement; // Array of strings

                // console.log(
                //   "  📉 Lowest score movements:",
                //   lowMovements,
                //   "Score:",
                //   lowScore
                // );
                // console.log(
                //   "  📈 Highest score movements:",
                //   highMovements,
                //   "Score:",
                //   highScore
                // );

                // Process lowest scoring movements
                categorizeMovementArray(lowMovements, lowScore);

                // Process highest scoring movements
                categorizeMovementArray(highMovements, highScore);

                // Additional specific mappings for common patterns
                if (Array.isArray(lowMovements)) {
                  lowMovements.forEach((movement) => {
                    const movementLower = movement.toLowerCase();
                    if (
                      movementLower.includes("trot") ||
                      movementLower.includes("trote")
                    ) {
                      movementScores["Trot"].push(lowScore);
                    }
                    if (
                      movementLower.includes("shoulder") ||
                      movementLower.includes("espalda")
                    ) {
                      movementScores["Submission"].push(lowScore); // Lateral work often relates to submission
                    }
                  });
                }

                if (Array.isArray(highMovements)) {
                  highMovements.forEach((movement) => {
                    const movementLower = movement.toLowerCase();
                    if (
                      movementLower.includes("change") ||
                      movementLower.includes("cambio")
                    ) {
                      movementScores["Transitions"].push(highScore);
                    }
                    if (
                      movementLower.includes("serpentine") ||
                      movementLower.includes("serpentina")
                    ) {
                      movementScores["Rider Position"].push(highScore);
                    }
                    if (
                      movementLower.includes("circle") ||
                      movementLower.includes("circulo")
                    ) {
                      movementScores["Rider Position"].push(highScore);
                    }
                  });
                }
              }
            }
          });
        }
      });

      // console.log("📊 Final movement scores before averaging:", movementScores);

      // Calculate average scores for each movement
      const radarData = Object.keys(movementScores).map((movement) => {
        const scores = movementScores[movement];
        let avgScore = 0;

        if (scores.length > 0) {
          avgScore =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          // console.log(
          //   `📈 ${movement}: ${
          //     scores.length
          //   } scores, average: ${avgScore.toFixed(2)}`
          // );
        } else {
          // REMOVED: Default random scores when no data available
          // Instead, return null or 0 to indicate no data
          avgScore = 0; // or you could return null and filter out later
          // console.log(`📈 ${movement}: No data available, setting to 0`);
        }

        return {
          movement: movement,
          score: Math.round(avgScore * 10) / 10,
          fullMark: 10,
        };
      });

      // Optional: Filter out movements with no data (score = 0)
      // const filteredRadarData = radarData.filter(item => item.score > 0);

      // console.log("🎯 Final radar data:", radarData);

      setPerformanceData(radarData);
      setLoading(false);
    };

    fetchDressageData();
  }, [user]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Movement: ${label}`}</p>
          <p className="text-blue-600">{`Score: ${score}/10`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-4 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {language === "en" ? "Movement Scores" : "Puntuaciones de movimiento"}
        </h3>
        <div className="h-80 w-full flex items-center justify-center">
          <div className="text-gray-500">
            {language === "en"
              ? "Loading performance data..."
              : "Cargando datos de rendimiento..."}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {language === "en" ? "Movement Scores" : "Puntuaciones de movimiento"}
      </h3>
      <div className="h-80 w-full flex items-center justify-center">
        <ResponsiveContainer className="!h-[70%] w-full sm:!h-full ">
          <RadarChart outerRadius="70%" data={performanceData}>
            <defs>
              {/* Left to right linear gradient for the radar fill */}
              <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7658eb" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#3d78ec" stopOpacity={0.7} />
              </linearGradient>

              {/* Left to right linear gradient for the radar stroke */}
              <linearGradient
                id="radarStrokeGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#7658eb" />
                <stop offset="100%" stopColor="#3d78ec" />
              </linearGradient>
            </defs>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="movement" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis
              domain={[0, 10]}
              axisLine={false}
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="Scores"
              dataKey="score"
              stroke="url(#radarStrokeGradient)"
              fill="url(#radarGradient)"
            />
            <Legend wrapperStyle={{ fontSize: "12px", marginTop: "5px" }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MovementRadarChart;
