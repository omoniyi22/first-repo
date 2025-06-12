
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
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
}

const GoalsForm = ({ onComplete, initialGoals }: GoalsFormProps) => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeTab, setActiveTab] = useState("short");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Group goals by type
  const groupedGoals = {
    shortTerm: goals.filter(goal => goal.goal_type === 'short-term'),
    mediumTerm: goals.filter(goal => goal.goal_type === 'medium-term'),
    longTerm: goals.filter(goal => goal.goal_type === 'long-term')
  };

  const handleAddGoal = async (goalType: 'short-term' | 'medium-term' | 'long-term') => {
    try {
      const newGoal = await goalsService.createGoal({
        goal_text: "",
        goal_type: goalType,
        progress: 0,
        target_date: new Date().toISOString().split("T")[0],
      });

      setGoals([...goals, newGoal]);
      toast({
        title: "Success",
        description: "New goal added successfully!",
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveGoal = async (goalId: string) => {
    try {
      await goalsService.deleteGoal(goalId);
      setGoals(goals.filter(goal => goal.id !== goalId));
      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGoalTextChange = async (goalId: string, text: string) => {
    // Update local state immediately for better UX
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, goal_text: text } : goal
    ));

    try {
      await goalsService.updateGoal(goalId, { goal_text: text });
    } catch (error) {
      console.error('Error updating goal text:', error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProgressChange = async (goalId: string, progress: string) => {
    const progressValue = Math.min(100, Math.max(0, parseInt(progress) || 0));
    
    // Update local state immediately for better UX
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, progress: progressValue } : goal
    ));

    try {
      await goalsService.updateGoal(goalId, { progress: progressValue });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDateChange = async (goalId: string, date: Date | undefined) => {
    if (!date) return;

    const dateString = date.toISOString().split("T")[0];
    
    // Update local state immediately for better UX
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, target_date: dateString } : goal
    ));

    try {
      await goalsService.updateGoal(goalId, { target_date: dateString });
    } catch (error) {
      console.error('Error updating goal date:', error);
      toast({
        title: "Error",
        description: "Failed to update date. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  const renderGoalInputs = (goalsList: Goal[], goalType: 'short-term' | 'medium-term' | 'long-term') => (
    <>
      {goalsList.map((goal, index) => (
        <div key={goal.id} className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-5">
            <Label htmlFor={`${goalType}-goal-${index}`} className="text-xs mb-1 block">
              Goal
            </Label>
            <Input
              id={`${goalType}-goal-${index}`}
              value={goal.goal_text}
              onChange={(e) => handleGoalTextChange(goal.id, e.target.value)}
              placeholder="Enter goal"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor={`${goalType}-progress-${index}`} className="text-xs mb-1 block">
              Progress %
            </Label>
            <Input
              id={`${goalType}-progress-${index}`}
              type="number"
              min="0"
              max="100"
              value={goal.progress}
              onChange={(e) => handleProgressChange(goal.id, e.target.value)}
            />
          </div>
          <div className="col-span-4">
            <Label className="text-xs mb-1 block">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-auto",
                    !goal.target_date && "text-muted-foreground"
                  )}
                  size="sm"
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {goal.target_date ? (
                    format(new Date(goal.target_date), "MM/dd/yyyy")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={goal.target_date ? new Date(goal.target_date) : undefined}
                  onSelect={(date) => handleDateChange(goal.id, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="col-span-1 pt-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveGoal(goal.id)}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleAddGoal(goalType)}
        className="flex items-center gap-1 mt-2"
      >
        <Plus size={16} /> Add Goal
      </Button>
    </>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="short">Short-term</TabsTrigger>
          <TabsTrigger value="medium">Medium-term</TabsTrigger>
          <TabsTrigger value="long">Long-term</TabsTrigger>
        </TabsList>

        <TabsContent value="short" className="space-y-2">
          {renderGoalInputs(groupedGoals.shortTerm, 'short-term')}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          {renderGoalInputs(groupedGoals.mediumTerm, 'medium-term')}
        </TabsContent>

        <TabsContent value="long" className="space-y-4">
          {renderGoalInputs(groupedGoals.longTerm, 'long-term')}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Goals"}
        </Button>
      </div>
    </form>
  );
};

export default GoalsForm;
