
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { RecommendationsPanel } from "../RecommendationsLayout";

interface JumpPosition {
  x: number;
  y: number;
  number: number;
  performance: "excellent" | "good" | "fair" | "poor";
  faults?: number;
  timeFault?: boolean;
  knockdown?: boolean;
  refusal?: boolean;
}

interface CoursePathPoint {
  x: number;
  y: number;
  isApproach?: boolean;
  isLanding?: boolean;
}

interface CourseMapProps {
  jumps: JumpPosition[];
  path: CoursePathPoint[];
  imageUrl?: string;
  onJumpClick?: (jumpNumber: number) => void;
  selectedJump?: number;
  className?: string;
}

export const CourseMap = ({
  jumps,
  path,
  imageUrl,
  onJumpClick,
  selectedJump,
  className
}: CourseMapProps) => {
  const { language } = useLanguage();
  const [hoveredJump, setHoveredJump] = useState<number | null>(null);

  // Performance colors
  const getJumpColor = (performance: JumpPosition["performance"]) => {
    switch (performance) {
      case "excellent": return "#22c55e"; // Green
      case "good": return "#3b82f6";      // Blue
      case "fair": return "#f59e0b";      // Amber
      case "poor": return "#ef4444";      // Red
      default: return "#3b82f6";
    }
  };

  return (
    <RecommendationsPanel 
      title={language === "en" ? "Course Map" : "Mapa del Recorrido"}
      className={className}
    >
      <div className="relative w-full aspect-square border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
        {/* Background image if provided */}
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Course layout" 
            className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
          />
        )}
        
        {/* Draw path between jumps */}
        <svg className="absolute top-0 left-0 w-full h-full">
          {/* Connect path points with lines */}
          <path
            d={path.map((point, i) => 
              `${i === 0 ? 'M' : 'L'} ${point.x * 100}% ${point.y * 100}%`
            ).join(' ')}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray={path.some(p => p.isApproach || p.isLanding) ? "4" : "none"}
            className="opacity-70"
          />
        </svg>
        
        {/* Position jumps on the map */}
        {jumps.map((jump) => (
          <div
            key={jump.number}
            className={cn(
              "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all",
              (selectedJump === jump.number || hoveredJump === jump.number) && "scale-110 z-10"
            )}
            style={{
              left: `${jump.x * 100}%`,
              top: `${jump.y * 100}%`,
            }}
            onClick={() => onJumpClick && onJumpClick(jump.number)}
            onMouseEnter={() => setHoveredJump(jump.number)}
            onMouseLeave={() => setHoveredJump(null)}
          >
            <div 
              className={cn(
                "flex items-center justify-center rounded-full w-8 h-8 text-white font-bold text-sm border-2",
                jump.faults ? "border-red-300" : "border-white"
              )}
              style={{ backgroundColor: getJumpColor(jump.performance) }}
            >
              {jump.number}
            </div>
            
            {/* Fault indicators */}
            {(jump.knockdown || jump.refusal || jump.timeFault) && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {jump.faults}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {/* Legend */}
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
          <span>{language === "en" ? "Excellent" : "Excelente"}</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
          <span>{language === "en" ? "Good" : "Bueno"}</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
          <span>{language === "en" ? "Fair" : "Aceptable"}</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
          <span>{language === "en" ? "Poor" : "Deficiente"}</span>
        </div>
      </div>
    </RecommendationsPanel>
  );
};
