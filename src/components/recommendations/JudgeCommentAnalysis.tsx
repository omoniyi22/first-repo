
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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

interface JudgeCommentAnalysisProps {
  categories: CommentCategory[];
  comments: JudgeComment[];
  discipline: "dressage" | "jumping";
  className?: string;
}

export const JudgeCommentAnalysis = ({
  categories,
  comments,
  discipline,
  className
}: JudgeCommentAnalysisProps) => {
  const { language } = useLanguage();
  const isPurple = discipline === "dressage";
  
  // Group comments by category
  const commentsByCategory: Record<string, JudgeComment[]> = {};
  comments.forEach(comment => {
    if (!commentsByCategory[comment.category]) {
      commentsByCategory[comment.category] = [];
    }
    commentsByCategory[comment.category].push(comment);
  });

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className={cn(
        "text-lg font-semibold",
        isPurple ? "text-purple-700" : "text-blue-700"
      )}>
        {language === "en" ? "Judge Comment Analysis" : "Análisis de Comentarios del Juez"}
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer
            config={{
              // Set colors for each category
              ...categories.reduce((acc, cat) => {
                acc[cat.name] = { color: cat.color };
                return acc;
              }, {} as Record<string, { color: string }>)
            }}
          >
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ChartContainer>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-4 mt-4">
        {Object.entries(commentsByCategory).map(([category, categoryComments]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium text-sm">{category}</h4>
            <div className="space-y-1">
              {categoryComments.map((comment) => (
                <div key={comment.id} className="text-sm text-muted-foreground pl-4 border-l-2" style={{ borderColor: categories.find(c => c.name === category)?.color || "#ccc" }}>
                  {comment.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
