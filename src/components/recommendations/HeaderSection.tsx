
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TestInfoProps {
  testName: string;
  level: string;
  date: string;
  judge?: string;
  score: number;
  percentage: number;
  trend: "up" | "down" | "neutral";
  discipline: "dressage" | "jumping";
}

export const HeaderSection = ({ 
  testName,
  level,
  date,
  judge,
  score,
  percentage,
  trend,
  discipline
}: TestInfoProps) => {
  const { language } = useLanguage();
  const isPurple = discipline === "dressage";
  
  return (
    <Card className={cn(
      "mb-6 overflow-hidden border",
      isPurple ? "border-purple-200" : "border-blue-200"
    )}>
      <CardContent className="p-0">
        <div className={cn(
          "px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4",
          isPurple ? "bg-purple-50" : "bg-blue-50"
        )}>
          <div>
            <h2 className="text-xl font-bold">{testName}</h2>
            <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground mt-1">
              <span>{level}</span>
              <span className="hidden sm:block">•</span>
              <span>{date}</span>
              {judge && (
                <>
                  <span className="hidden sm:block">•</span>
                  <span>{language === "en" ? `Judge: ${judge}` : `Juez: ${judge}`}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                isPurple ? "text-purple-700" : "text-blue-700"
              )}>
                {score}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === "en" ? "Score" : "Puntuación"}
              </div>
            </div>
            
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                isPurple ? "text-purple-700" : "text-blue-700"
              )}>
                {percentage.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {language === "en" ? "Percentage" : "Porcentaje"}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              {trend === "up" ? (
                <TrendingUp className="text-green-600" />
              ) : trend === "down" ? (
                <TrendingDown className="text-red-600" />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">—</div>
              )}
              <div className="text-xs text-muted-foreground">
                {language === "en" ? "Trend" : "Tendencia"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// For jumping courses, we need a slightly different header
interface CourseInfoProps {
  competitionName: string;
  courseHeight: string;
  courseType: string;
  date: string;
  time?: string;
  faults: number;
  trend: "up" | "down" | "neutral";
}

export const JumpingHeaderSection = ({
  competitionName,
  courseHeight,
  courseType,
  date,
  time,
  faults,
  trend
}: CourseInfoProps) => {
  const { language } = useLanguage();
  
  return (
    <Card className="mb-6 overflow-hidden border border-blue-200">
      <CardContent className="p-0">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50">
          <div>
            <h2 className="text-xl font-bold">{competitionName}</h2>
            <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground mt-1">
              <span>{courseHeight}</span>
              <span className="hidden sm:block">•</span>
              <span>{courseType}</span>
              <span className="hidden sm:block">•</span>
              <span>{date}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {time && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{time}</div>
                <div className="text-xs text-muted-foreground">
                  {language === "en" ? "Time" : "Tiempo"}
                </div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{faults}</div>
              <div className="text-xs text-muted-foreground">
                {language === "en" ? "Faults" : "Faltas"}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              {trend === "up" ? (
                <TrendingUp className="text-green-600" />
              ) : trend === "down" ? (
                <TrendingDown className="text-red-600" />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">—</div>
              )}
              <div className="text-xs text-muted-foreground">
                {language === "en" ? "Trend" : "Tendencia"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
