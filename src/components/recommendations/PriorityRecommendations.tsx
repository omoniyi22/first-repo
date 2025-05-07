
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { CircleCheck } from "lucide-react";

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
  priority: number; // 1 is highest priority
}

interface PriorityRecommendationsProps {
  recommendations: Recommendation[];
  discipline: "dressage" | "jumping";
  className?: string;
  onAddToTrainingPlan?: (exercise: Exercise) => void;
}

export const PriorityRecommendations = ({
  recommendations,
  discipline,
  className,
  onAddToTrainingPlan
}: PriorityRecommendationsProps) => {
  const { language } = useLanguage();
  const isPurple = discipline === "dressage";
  
  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className={cn(
        "text-xl font-semibold",
        isPurple ? "text-purple-700" : "text-blue-700"
      )}>
        {language === "en" ? "Priority Recommendations" : "Recomendaciones Prioritarias"}
      </h3>
      
      <div className="space-y-6">
        {sortedRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            discipline={discipline}
            onAddToTrainingPlan={onAddToTrainingPlan}
          />
        ))}
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  discipline: "dressage" | "jumping";
  onAddToTrainingPlan?: (exercise: Exercise) => void;
}

const RecommendationCard = ({
  recommendation,
  discipline,
  onAddToTrainingPlan
}: RecommendationCardProps) => {
  const { language } = useLanguage();
  const isPurple = discipline === "dressage";
  const primaryColor = isPurple ? "purple" : "blue";
  
  return (
    <Card className={cn(
      "overflow-hidden border",
      isPurple ? "border-purple-200" : "border-blue-200"
    )}>
      <div className={cn(
        "px-6 py-3 border-b",
        isPurple ? "border-purple-100 bg-purple-50" : "border-blue-100 bg-blue-50"
      )}>
        <h4 className="font-medium">
          {language === "en" ? `Priority ${recommendation.priority}` : `Prioridad ${recommendation.priority}`}: {recommendation.title}
        </h4>
      </div>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
        
        <div className="text-xs inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          <span className="mr-1">⏱️</span> {recommendation.timeframe}
        </div>
        
        <div className="space-y-3 mt-4">
          <h5 className="text-sm font-medium">
            {language === "en" ? "Recommended Exercises" : "Ejercicios Recomendados"}
          </h5>
          
          {recommendation.exercises.map((exercise) => (
            <div key={exercise.id} className="bg-gray-50 p-3 rounded-md text-sm">
              <div className="flex justify-between items-center mb-1">
                <h6 className="font-medium">{exercise.name}</h6>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  exercise.difficulty === "beginner" ? "bg-green-100 text-green-800" :
                  exercise.difficulty === "intermediate" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {exercise.difficulty === "beginner" ? (language === "en" ? "Beginner" : "Principiante") :
                   exercise.difficulty === "intermediate" ? (language === "en" ? "Intermediate" : "Intermedio") :
                   (language === "en" ? "Advanced" : "Avanzado")}
                </span>
              </div>
              <p className="text-muted-foreground text-xs mb-2">{exercise.description}</p>
              
              <div className="flex justify-between items-center mt-2">
                {exercise.videoUrl && (
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                    {language === "en" ? "Watch Demo" : "Ver Demostración"}
                  </Button>
                )}
                
                {onAddToTrainingPlan && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn(
                      `text-${primaryColor}-700 border-${primaryColor}-200 hover:bg-${primaryColor}-50 text-xs`
                    )}
                    onClick={() => onAddToTrainingPlan(exercise)}
                  >
                    <CircleCheck className="h-3 w-3 mr-1" />
                    {language === "en" ? "Add to Plan" : "Añadir al Plan"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
