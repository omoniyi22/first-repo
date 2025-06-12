
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoalsForm from "./GoalsForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { goalsService, Goal } from "@/services/goalsService";

const Goals = () => {
  const [showEditGoalsForm, setShowEditGoalsForm] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, translations } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = translations[language];

  // Fetch goals from backend
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userGoals = await goalsService.getUserGoals();
        setGoals(userGoals);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast({
          title: "Error",
          description: "Failed to load goals. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user, toast]);

  // Group goals by type
  const groupedGoals = {
    shortTerm: goals.filter(goal => goal.goal_type === 'short-term'),
    mediumTerm: goals.filter(goal => goal.goal_type === 'medium-term'),
    longTerm: goals.filter(goal => goal.goal_type === 'long-term')
  };

  const handleGoalsUpdate = async () => {
    try {
      const userGoals = await goalsService.getUserGoals();
      setGoals(userGoals);
      setShowEditGoalsForm(false);
      toast({
        title: "Success",
        description: "Goals updated successfully!",
      });
    } catch (error) {
      console.error('Error updating goals:', error);
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          {t["goals"]}
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEditGoalsForm(true)}
        >
          <Edit size={16} className="mr-1" />
          {t["edit"]}
        </Button>
      </div>

      <Card className="border border-gray-100 p-4">
        <div className="space-y-6">
          {/* Short-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t["short-term"]}
            </h3>
            <div className="space-y-3">
              {groupedGoals.shortTerm.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  {language === "en" ? "No short-term goals set" : "No hay objetivos a corto plazo establecidos"}
                </p>
              ) : (
                groupedGoals.shortTerm.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {goal.goal_text}
                      </span>
                      <span className="text-xs text-gray-600">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Progress value={goal.progress} className="h-2" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {t["by"]}{" "}
                        {new Date(goal.target_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Medium-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t["medium-term"]}
            </h3>
            <div className="space-y-3">
              {groupedGoals.mediumTerm.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  {language === "en" ? "No medium-term goals set" : "No hay objetivos a medio plazo establecidos"}
                </p>
              ) : (
                groupedGoals.mediumTerm.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {goal.goal_text}
                      </span>
                      <span className="text-xs text-gray-600">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Progress value={goal.progress} className="h-2" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {t["by"]}{" "}
                        {new Date(goal.target_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Long-term goals */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {t["long-term"]}
            </h3>
            <div className="space-y-3">
              {groupedGoals.longTerm.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  {language === "en" ? "No long-term goals set" : "No hay objetivos a largo plazo establecidos"}
                </p>
              ) : (
                groupedGoals.longTerm.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {goal.goal_text}
                      </span>
                      <span className="text-xs text-gray-600">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Progress value={goal.progress} className="h-2" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {t["by"]}{" "}
                        {new Date(goal.target_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Goals Dialog */}
      <Dialog open={showEditGoalsForm} onOpenChange={setShowEditGoalsForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "en" ? "Edit Goals" : "Editar Objetivos"}
            </DialogTitle>
          </DialogHeader>
          <GoalsForm
            onComplete={handleGoalsUpdate}
            initialGoals={goals}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
