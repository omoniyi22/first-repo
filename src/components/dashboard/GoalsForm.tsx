import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Target,
  Zap,
  Mountain,
  GripVertical,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { goalsService, Goal } from "@/services/goalsService";
import { useToast } from "@/hooks/use-toast";

interface GoalsFormProps {
  onComplete: () => void;
  initialGoals: Goal[];
  editingGoalId?: string | null;
}

const GoalsForm = ({
  onComplete,
  initialGoals,
  editingGoalId,
}: GoalsFormProps) => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeTab, setActiveTab] = useState("short");
  const [loading, setLoading] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Set active tab and editing goal when editingGoalId changes
  useEffect(() => {
    if (editingGoalId) {
      const goal = goals.find((g) => g.id === editingGoalId);
      if (goal) {
        setEditingGoal(editingGoalId);
        // Set the appropriate tab based on goal type
        if (goal.goal_type === "short-term") setActiveTab("short");
        else if (goal.goal_type === "medium-term") setActiveTab("medium");
        else if (goal.goal_type === "long-term") setActiveTab("long");
      }
    }
  }, [editingGoalId, goals]);

  // Group goals by type
  const groupedGoals = {
    shortTerm: goals.filter((goal) => goal.goal_type === "short-term"),
    mediumTerm: goals.filter((goal) => goal.goal_type === "medium-term"),
    longTerm: goals.filter((goal) => goal.goal_type === "long-term"),
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

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case "short-term":
        return "border-yellow-200 bg-yellow-50";
      case "medium-term":
        return "border-blue-200 bg-blue-50";
      case "long-term":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const handleAddGoal = async (
    goalType: "short-term" | "medium-term" | "long-term"
  ) => {
    try {
      const newGoal = await goalsService.createGoal({
        goal_text: "",
        goal_type: goalType,
        progress: 0,
        target_date: new Date().toISOString().split("T")[0],
      });

      setGoals([...goals, newGoal]);
      setEditingGoal(newGoal.id);
      toast({
        title: "Success",
        description: "New goal added successfully!",
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveGoal = async (goalId: string) => {
    try {
      await goalsService.deleteGoal(goalId);
      setGoals(goals.filter((goal) => goal.id !== goalId));
      setPendingChanges((prev) => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoalChange = (
    goalId: string,
    field: string,
    value: string | number
  ) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId ? { ...goal, [field]: value } : goal
      )
    );
    setPendingChanges((prev) => new Set(prev).add(goalId));
  };

  const handleSaveGoal = async (goalId: string) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      await goalsService.updateGoal(goalId, {
        goal_text: goal.goal_text,
        progress: goal.progress,
        target_date: goal.target_date,
      });

      setPendingChanges((prev) => {
        const newSet = new Set(prev);
        newSet.delete(goalId);
        return newSet;
      });
      setEditingGoal(null);

      toast({
        title: "Success",
        description: "Goal saved successfully!",
      });
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save any pending changes
    if (pendingChanges.size > 0) {
      Promise.all(
        Array.from(pendingChanges).map((goalId) => {
          const goal = goals.find((g) => g.id === goalId);
          if (goal) {
            return goalsService.updateGoal(goalId, {
              goal_text: goal.goal_text,
              progress: goal.progress,
              target_date: goal.target_date,
            });
          }
        })
      )
        .then(() => {
          setPendingChanges(new Set());
          onComplete();
        })
        .catch((error) => {
          console.error("Error saving goals:", error);
          toast({
            title: "Error",
            description: "Failed to save some goals. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      onComplete();
    }
  };

  const renderGoalCard = (goal: Goal) => {
    const isEditing = editingGoal === goal.id;
    const hasPendingChanges = pendingChanges.has(goal.id);
    const isHighlighted = editingGoalId === goal.id;

    return (
      <Card
        key={goal.id}
        className={cn(
          "p-4 border-2 transition-all duration-200",
          getGoalTypeColor(goal.goal_type),
          isEditing && "ring-2 ring-blue-500 ring-opacity-50",
          isHighlighted &&
            "ring-2 ring-purple-500 ring-opacity-70 border-purple-300"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getGoalTypeIcon(goal.goal_type)}
                <Badge variant="secondary" className="text-xs">
                  {goal.goal_type.replace("-", " ")}
                </Badge>
                {hasPendingChanges && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    Unsaved
                  </Badge>
                )}
                {isHighlighted && (
                  <Badge variant="outline" className="text-xs text-purple-600">
                    Editing
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasPendingChanges && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveGoal(goal.id)}
                    className="h-7"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveGoal(goal.id)}
                  className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Goal Text */}
            <div className="space-y-2">
              <Label
                htmlFor={`goal-${goal.id}`}
                className="text-sm font-medium"
              >
                Goal Description
              </Label>
              <Textarea
                id={`goal-${goal.id}`}
                value={goal.goal_text}
                onChange={(e) =>
                  handleGoalChange(goal.id, "goal_text", e.target.value)
                }
                placeholder="Describe your goal..."
                className="min-h-[60px] resize-none"
                onFocus={() => setEditingGoal(goal.id)}
              />
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Progress</Label>
                <span className="text-sm font-semibold text-blue-600">
                  {goal.progress}%
                </span>
              </div>
              <Slider
                value={[goal.progress]}
                onValueChange={(value) =>
                  handleGoalChange(goal.id, "progress", value[0])
                }
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !goal.target_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {goal.target_date ? (
                      format(new Date(goal.target_date), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      goal.target_date ? new Date(goal.target_date) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        handleGoalChange(
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
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderGoalSection = (
    title: string,
    goalsList: Goal[],
    goalType: "short-term" | "medium-term" | "long-term",
    description: string
  ) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {getGoalTypeIcon(goalType)}
            {title}
            <Badge variant="secondary">{goalsList.length}</Badge>
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAddGoal(goalType)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {title.split(" ")[0]}
        </Button>
      </div>

      <div className="space-y-3">
        {goalsList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No {title.toLowerCase()} goals yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Add {title.split(" ")[0]}" to get started
            </p>
          </div>
        ) : (
          goalsList.map(renderGoalCard)
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="short" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Short-term
          </TabsTrigger>
          <TabsTrigger value="medium" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Medium-term
          </TabsTrigger>
          <TabsTrigger value="long" className="flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Long-term
          </TabsTrigger>
        </TabsList>

        <TabsContent value="short" className="space-y-6">
          {renderGoalSection(
            "Short-term Goals",
            groupedGoals.shortTerm,
            "short-term",
            "Goals you want to achieve in the next 1-3 months"
          )}
        </TabsContent>

        <TabsContent value="medium" className="space-y-6">
          {renderGoalSection(
            "Medium-term Goals",
            groupedGoals.mediumTerm,
            "medium-term",
            "Goals you want to achieve in the next 3-12 months"
          )}
        </TabsContent>

        <TabsContent value="long" className="space-y-6">
          {renderGoalSection(
            "Long-term Goals",
            groupedGoals.longTerm,
            "long-term",
            "Goals you want to achieve in 1+ years"
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          {pendingChanges.size > 0 && (
            <span className="text-orange-600">
              {pendingChanges.size} unsaved change
              {pendingChanges.size > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Goals
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default GoalsForm;
