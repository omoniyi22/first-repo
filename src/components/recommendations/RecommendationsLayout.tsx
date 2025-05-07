
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecommendationsLayoutProps {
  children: React.ReactNode;
  className?: string;
  discipline: "dressage" | "jumping";
}

export const RecommendationsLayout = ({ 
  children, 
  className,
  discipline 
}: RecommendationsLayoutProps) => {
  const themeColor = discipline === "dressage" ? "purple" : "blue";
  
  return (
    <div className={cn(
      "recommendations-container w-full max-w-7xl mx-auto px-4 py-6",
      `theme-${themeColor}`,
      className
    )}>
      {children}
    </div>
  );
};

interface RecommendationsPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const RecommendationsPanel = ({ 
  children, 
  className,
  title
}: RecommendationsPanelProps) => {
  return (
    <Card className={cn("h-full shadow-sm", className)}>
      {title && (
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      <CardContent className={cn("p-4", !title && "pt-6")}>
        {children}
      </CardContent>
    </Card>
  );
};

export const ThreePanelLayout = ({ 
  leftPanel, 
  centerPanel, 
  rightPanel,
  className
}: {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      <div className="md:col-span-1">
        {leftPanel}
      </div>
      <div className="md:col-span-1">
        {centerPanel}
      </div>
      <div className="md:col-span-1">
        {rightPanel}
      </div>
    </div>
  );
};
