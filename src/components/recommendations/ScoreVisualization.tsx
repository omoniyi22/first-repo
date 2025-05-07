
import React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Movement {
  id: string;
  number: number;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  comments?: string;
  isAboveAverage: boolean;
}

interface ScoreHeatmapProps {
  movements: Movement[];
  average: number;
  onMovementClick?: (movement: Movement) => void;
  selectedMovementId?: string;
  className?: string;
  discipline: "dressage" | "jumping";
}

export const ScoreHeatmap = ({
  movements,
  average,
  onMovementClick,
  selectedMovementId,
  className,
  discipline
}: ScoreHeatmapProps) => {
  const { language } = useLanguage();
  const isPurple = discipline === "dressage";
  
  // Prepare data for the chart
  const data = movements.map(m => ({
    name: `${m.number}`,
    score: m.percentage,
    fullScore: m.score,
    maxScore: m.maxScore,
    id: m.id,
    movement: m.name,
    isAboveAverage: m.isAboveAverage,
    comments: m.comments
  }));
  
  const getScoreColor = (score: number, isAboveAverage: boolean) => {
    if (isAboveAverage) {
      return isPurple ? "#9a6cb5" : "#6c8cbb";  // Secondary color
    } else {
      // Red tones for below average
      if (score < 40) return "#ef4444";
      if (score < 60) return "#f97316";
      return "#f59e0b";
    }
  };

  return (
    <div className={cn("w-full h-full min-h-[300px]", className)}>
      <div className="mb-3 text-sm font-medium">
        {language === "en" ? "Movement Scores" : "Puntuaciones de Movimientos"}
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ChartContainer
          config={{
            average: { color: "#64748b" },
            score: { color: "#64748b" }
          }}
        >
          <BarChart
            data={data}
            margin={{ top: 5, right: 0, left: 0, bottom: 25 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              hide
              domain={[0, 100]}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <ChartTooltipContent>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {language === "en" ? "Movement" : "Movimiento"} {data.name}: {data.movement}
                        </p>
                        <p className="text-sm">
                          {language === "en" ? "Score" : "Puntuación"}: {data.fullScore}/{data.maxScore} ({data.score.toFixed(1)}%)
                        </p>
                        {data.comments && (
                          <p className="text-xs text-muted-foreground mt-1 border-t pt-1">
                            {data.comments}
                          </p>
                        )}
                      </div>
                    </ChartTooltipContent>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="score"
              radius={[4, 4, 0, 0]}
              onClick={(data) => {
                if (onMovementClick) {
                  const movement = movements.find(m => m.id === data.id);
                  if (movement) onMovementClick(movement);
                }
              }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getScoreColor(entry.score, entry.isAboveAverage)}
                  stroke={entry.id === selectedMovementId ? "#000" : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
};

// Add more visualization components as needed
