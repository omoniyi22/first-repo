import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Loader2,
  Target,
  Calendar,
  Plus,
  Check,
  X,
  Trophy,
  Clock,
  Zap,
  Mountain,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import GoalsForm from "./GoalsForm";
import SingleGoalEditForm from "./SingleGoalEditForm";
import AddGoalForm from "./AddGoalForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { goalsService, Goal } from "@/services/goalsService";
import { ScrollArea } from "@radix-ui/react-scroll-area";

const Goals = () => {
  const [showEditGoalsForm, setShowEditGoalsForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
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
        console.error("Error fetching goals:", error);
        toast({
          title: "Error",
          description: "Failed to load goals. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user, toast]);

  // Group goals by type
  const groupedGoals = {
    shortTerm: goals.filter((goal) => goal.goal_type === "short-term"),
    mediumTerm: goals.filter((goal) => goal.goal_type === "medium-term"),
    longTerm: goals.filter((goal) => goal.goal_type === "long-term"),
  };

  const handleGoalsUpdate = async () => {
    try {
      const userGoals = await goalsService.getUserGoals();
      setGoals(userGoals);
      setShowEditGoalsForm(false);
      setShowAddGoalForm(false);
      setEditingGoalId(null);
      toast({
        title: "Success",
        description: "Goals updated successfully!",
      });
    } catch (error) {
      console.error("Error updating goals:", error);
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async () => {
    // Refresh the goals list after deletion
    try {
      const userGoals = await goalsService.getUserGoals();
      setGoals(userGoals);
      setShowEditGoalsForm(false);
      setEditingGoalId(null);
    } catch (error) {
      console.error("Error refreshing goals:", error);
      toast({
        title: "Error",
        description: "Failed to refresh goals. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInlineEdit = async (
    goalId: string,
    field: string,
    value: string | number
  ) => {
    try {
      await goalsService.updateGoal(goalId, { [field]: value });
      const userGoals = await goalsService.getUserGoals();
      setGoals(userGoals);
      setEditingGoal(null);
      setEditingProgress(null);
      setEditingDate(null);
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = (goalId: string) => {
    setEditingGoalId(goalId);
    setShowEditGoalsForm(true);
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case "short-term":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "medium-term":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "long-term":
        return <Mountain className="h-4 w-4 text-purple-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", color: "text-red-500" };
    if (diffDays === 0) return { text: "Today", color: "text-orange-500" };
    if (diffDays === 1) return { text: "Tomorrow", color: "text-yellow-500" };
    if (diffDays <= 7)
      return { text: `${diffDays} days`, color: "text-yellow-500" };
    if (diffDays <= 30)
      return {
        text: `${Math.ceil(diffDays / 7)} weeks`,
        color: "text-blue-500",
      };
    return {
      text: `${Math.ceil(diffDays / 30)} months`,
      color: "text-gray-500",
    };
  };

  const renderGoalCard = (goal: Goal) => {
    const timeRemaining = getTimeRemaining(goal.target_date);
    const isCompleted = goal.progress >= 100;

    return (
      <Card
        key={goal.id}
        className={cn(
          "p-4 border transition-all duration-200 hover:shadow-md",
          isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-200"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getGoalTypeIcon(goal.goal_type)}
            {isCompleted && <Trophy className="h-4 w-4 text-yellow-500" />}
            <Badge
              variant={isCompleted ? "default" : "secondary"}
              className="text-xs"
            >
              {goal.goal_type.replace("-", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span className={timeRemaining.color}>{timeRemaining.text}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditGoal(goal.id)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mb-3">
          {editingGoal === goal.id ? (
            <div className="flex items-center gap-2">
              <Input
                defaultValue={goal.goal_text}
                className="text-sm"
                onBlur={(e) => {
                  if (e.target.value !== goal.goal_text) {
                    handleInlineEdit(goal.id, "goal_text", e.target.value);
                  } else {
                    setEditingGoal(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.currentTarget.value !== goal.goal_text) {
                      handleInlineEdit(
                        goal.id,
                        "goal_text",
                        e.currentTarget.value
                      );
                    } else {
                      setEditingGoal(null);
                    }
                  }
                  if (e.key === "Escape") {
                    setEditingGoal(null);
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingGoal(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <h4
              className={cn(
                "font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors",
                isCompleted && "line-through text-gray-500"
              )}
              onClick={() => setEditingGoal(goal.id)}
            >
              {goal.goal_text}
            </h4>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Progress</span>
            {editingProgress === goal.id ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={goal.progress}
                  className="w-16 h-6 text-xs"
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value !== goal.progress) {
                      handleInlineEdit(
                        goal.id,
                        "progress",
                        Math.min(100, Math.max(0, value))
                      );
                    } else {
                      setEditingProgress(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = parseInt(e.currentTarget.value) || 0;
                      if (value !== goal.progress) {
                        handleInlineEdit(
                          goal.id,
                          "progress",
                          Math.min(100, Math.max(0, value))
                        );
                      } else {
                        setEditingProgress(null);
                      }
                    }
                    if (e.key === "Escape") {
                      setEditingProgress(null);
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingProgress(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span
                className="text-xs font-medium cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingProgress(goal.id)}
              >
                {goal.progress}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={goal.progress}
              className="h-2 flex-1"
              // Apply custom color based on progress
              style={
                {
                  "--progress-background": getProgressColor(goal.progress),
                } as React.CSSProperties
              }
            />
            {isCompleted && <Check className="h-4 w-4 text-green-500" />}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600">Target:</span>
          </div>
          {editingDate === goal.id ? (
            <Popover open={true} onOpenChange={() => setEditingDate(null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 text-xs">
                  {format(new Date(goal.target_date), "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={new Date(goal.target_date)}
                  onSelect={(date) => {
                    if (date) {
                      handleInlineEdit(
                        goal.id,
                        "target_date",
                        date.toISOString().split("T")[0]
                      );
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <span
              className="text-xs font-medium cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setEditingDate(goal.id)}
            >
              {format(new Date(goal.target_date), "MMM dd, yyyy")}
            </span>
          )}
        </div>
      </Card>
    );
  };

  const renderGoalSection = (
    title: string,
    goals: Goal[],
    emptyMessage: string
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {title}
        <Badge variant="secondary" className="text-xs">
          {goals.length}
        </Badge>
      </h3>
      {goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-3">{goals.map(renderGoalCard)}</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {t["goals"]}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {language === "en" ? "Track your progress and achieve your dreams" : "Sigue tu progreso y alcanza tus sueños"}
            
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddGoalForm(true)}
          >
          <Plus size={16} className="mr-1" />
          
          {language === "en" ? "Add Goal" : "Añadir objetivo"}
        </Button>
      </div>

      <div className="space-y-8">
        {groupedGoals.shortTerm.length >= 1 &&
          renderGoalSection(
            "Short-term Goals",
            groupedGoals.shortTerm,
            language === "en"
            ? "No short-term goals set"
            : "No hay objetivos a corto plazo establecidos"
          )}

        {groupedGoals.mediumTerm.length >= 1 &&
          renderGoalSection(
            "Medium-term Goals",
            groupedGoals.mediumTerm,
            language === "en"
            ? "No medium-term goals set"
            : "No hay objetivos a medio plazo establecidos"
          )}

        {groupedGoals.longTerm.length >= 1 &&
          renderGoalSection(
            "Long-term Goals",
            groupedGoals.longTerm,
            language === "en"
            ? "No long-term goals set"
            : "No hay objetivos a largo plazo establecidos"
          )}
      </div>

      {/* Edit Individual Goal Dialog */}
      <Dialog open={showEditGoalsForm} onOpenChange={setShowEditGoalsForm}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "en" ? "Edit Goal" : "Editar Objetivo"}
            </DialogTitle>
          </DialogHeader>
          {editingGoalId && (
            <ScrollArea className="max-h-[80vh] pr-4">
              <SingleGoalEditForm
                goal={goals.find((g) => g.id === editingGoalId)!}
                onComplete={handleGoalsUpdate}
                onDelete={handleDeleteGoal}
                />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoalForm} onOpenChange={setShowAddGoalForm}>
        <DialogContent className="sm:max-w-md max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "en" ? "Add New Goal" : "Agregar Nuevo Objetivo"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <AddGoalForm
              onComplete={() => {
                handleGoalsUpdate();
                setShowAddGoalForm(false);
              }}
              />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
