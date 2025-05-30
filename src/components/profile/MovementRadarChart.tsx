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

const JumpingHeightsRadarChart = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJumpingData = async () => {
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
          .eq("discipline", "jumping")
          .order("created_at", { ascending: false });

        if (error) throw error;

        processJumpingData(data);
      } catch (error) {
        console.error("Error fetching jumping data:", error);
        setLoading(false);
      }
    };

    const processJumpingData = (data) => {
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Extract jumping analyses from the data
      const jumpingAnalyses = [];

      data.forEach((doc) => {
        if (doc.analysis_results && doc.analysis_results.length > 0) {
          doc.analysis_results.forEach((result) => {
            if (
              result.result_json &&
              result.result_json.en &&
              result.result_json.en.round_summary
            ) {
              const summary = result.result_json.en.round_summary;
              jumpingAnalyses.push({
                test_level: doc.test_level,
                clear_jumps: summary["Clear jumps"],
                total_faults: summary["Total faults"],
                document_date: doc.document_date,
              });
            }
          });
        }
      });

      // Calculate performance scores for each height
      const heightPerformance = {};

      jumpingAnalyses.forEach((analysis) => {
        if (!analysis.clear_jumps || !analysis.test_level) return;

        const height = analysis.test_level;
        const clearMatch = analysis.clear_jumps.match(/(\d+) out of (\d+)/);

        if (clearMatch) {
          const [, clear, total] = clearMatch;
          const clearRate = (parseInt(clear) / parseInt(total)) * 100;
          const score = Math.round(clearRate / 10); // Convert to 0-10 scale

          if (!heightPerformance[height]) {
            heightPerformance[height] = [];
          }
          heightPerformance[height].push(score);
        }
      });

      // Calculate average scores for each height
      const avgPerformance = {};
      Object.keys(heightPerformance).forEach((height) => {
        const scores = heightPerformance[height];
        avgPerformance[height] = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length
        );
      });

      // Create radar chart data with all jumping heights
      const heightCategories = [
        { label: "60cm", height: 0.6 },
        { label: "80cm", height: 0.8 },
        { label: "90cm", height: 0.9 },
        { label: "1.00m", height: 1.0 },
        { label: "1.10m", height: 1.1 },
        { label: "1.20m", height: 1.2 },
        { label: "1.30m", height: 1.3 },
        { label: "1.40m", height: 1.4 },
      ];

      const radarData = heightCategories.map((category) => {
        let score = 0;

        // Find matching performance data for this height
        const matchingKeys = Object.keys(avgPerformance).filter((key) => {
          // Extract height from test_level (e.g., "1.20m (4ft)" -> 1.2)
          const heightMatch = key.match(/(\d+\.?\d*)m/);
          if (heightMatch) {
            const extractedHeight = parseFloat(heightMatch[1]);
            return Math.abs(extractedHeight - category.height) < 0.01;
          }
          return false;
        });

        if (matchingKeys.length > 0) {
          // Use actual data
          score = avgPerformance[matchingKeys[0]];
        } else {
          // Estimate based on difficulty progression
          const knownHeights = Object.keys(avgPerformance);
          if (knownHeights.length > 0) {
            // Find the closest known height
            let closestHeight = null;
            let closestScore = 0;
            let minDiff = Infinity;

            knownHeights.forEach((key) => {
              const heightMatch = key.match(/(\d+\.?\d*)m/);
              if (heightMatch) {
                const extractedHeight = parseFloat(heightMatch[1]);
                const diff = Math.abs(extractedHeight - category.height);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestHeight = extractedHeight;
                  closestScore = avgPerformance[key];
                }
              }
            });

            // Estimate score based on difficulty
            if (category.height < closestHeight) {
              // Easier height, likely higher score
              score = Math.min(
                10,
                closestScore + Math.round((closestHeight - category.height) * 2)
              );
            } else if (category.height > closestHeight) {
              // Harder height, likely lower score
              score = Math.max(
                0,
                closestScore - Math.round((category.height - closestHeight) * 2)
              );
            } else {
              score = closestScore;
            }
          }
        }

        return {
          height: category.label,
          score: score,
          fullMark: 10,
        };
      });

      setPerformanceData(radarData);
      setLoading(false);
    };

    fetchJumpingData();
  }, [user]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const clearRate = score * 10;
      return (
        <div className="bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{`Height: ${label}`}</p>
          <p className="text-blue-600">{`Clear Rate: ${clearRate}%`}</p>
          <p className="text-gray-600">{`Score: ${score}/10`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-4 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Movement Scores
        </h3>
        <div className="h-80 w-full flex items-center justify-center">
          <div className="text-gray-500">Loading performance data...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Movement Scores
      </h3>
      <div className="h-80 w-full flex items-center justify-center">
        <ResponsiveContainer className="!h-[70%] w-full sm:!h-full">
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
            <PolarAngleAxis dataKey="height" tick={{ fontSize: 11 }} />
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

export default JumpingHeightsRadarChart;
