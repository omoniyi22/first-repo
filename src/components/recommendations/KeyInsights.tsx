
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Insight {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  isStrength: boolean;
}

interface KeyInsightsProps {
  strengths: Insight[];
  improvements: Insight[];
  className?: string;
  discipline: "dressage" | "jumping";
}

export const KeyInsights = ({
  strengths,
  improvements,
  className,
  discipline
}: KeyInsightsProps) => {
  const { language } = useLanguage();
  const isPurple = discipline === "dressage";
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Strengths Section */}
      <div>
        <h3 className={cn(
          "text-lg font-semibold mb-3",
          isPurple ? "text-purple-700" : "text-blue-700"
        )}>
          {language === "en" ? "Strengths" : "Puntos Fuertes"}
        </h3>
        <div className="space-y-4">
          {strengths.map((strength) => (
            <InsightCard 
              key={strength.id} 
              insight={strength} 
              type="strength"
              discipline={discipline}
            />
          ))}
        </div>
      </div>
      
      {/* Areas for Improvement Section */}
      <div>
        <h3 className={cn(
          "text-lg font-semibold mb-3",
          isPurple ? "text-purple-700" : "text-blue-700"
        )}>
          {language === "en" ? "Areas for Improvement" : "Áreas de Mejora"}
        </h3>
        <div className="space-y-4">
          {improvements.map((improvement) => (
            <InsightCard 
              key={improvement.id} 
              insight={improvement} 
              type="improvement"
              discipline={discipline}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface InsightCardProps {
  insight: Insight;
  type: "strength" | "improvement";
  discipline: "dressage" | "jumping";
}

const InsightCard = ({ insight, type, discipline }: InsightCardProps) => {
  const isPurple = discipline === "dressage";
  const isStrength = type === "strength";
  
  return (
    <Card className={cn(
      "overflow-hidden border",
      isStrength 
        ? (isPurple ? "border-purple-200" : "border-blue-200")
        : "border-amber-200"
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {insight.mediaUrl && (
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden bg-gray-100">
              <img 
                src={insight.mediaUrl} 
                alt={insight.title}
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          <div className="flex-grow">
            <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
