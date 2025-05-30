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

interface Goal {
  id: number;
  text: string;
  progress: number;
  targetDate: string;
}

interface GoalsData {
  shortTerm: Goal[];
  mediumTerm: Goal[];
  longTerm: Goal[];
}

interface GoalsFormProps {
  onComplete: () => void;
  initialGoals: GoalsData;
}

const GoalsForm = ({ onComplete, initialGoals }: GoalsFormProps) => {
  const [goals, setGoals] = useState<GoalsData>(initialGoals);
  const [activeTab, setActiveTab] = useState("short");

  const handleAddGoal = (term: keyof GoalsData) => {
    const newGoal = {
      id: Date.now(),
      text: "",
      progress: 0,
      targetDate: new Date().toISOString().split("T")[0],
    };

    setGoals({
      ...goals,
      [term]: [...goals[term], newGoal],
    });
  };

  const handleRemoveGoal = (term: keyof GoalsData, id: number) => {
    setGoals({
      ...goals,
      [term]: goals[term].filter((goal) => goal.id !== id),
    });
  };

  const handleGoalTextChange = (
    term: keyof GoalsData,
    id: number,
    text: string
  ) => {
    setGoals({
      ...goals,
      [term]: goals[term].map((goal) =>
        goal.id === id ? { ...goal, text } : goal
      ),
    });
  };

  const handleProgressChange = (
    term: keyof GoalsData,
    id: number,
    progress: string
  ) => {
    const progressValue = Math.min(100, Math.max(0, parseInt(progress) || 0));
    setGoals({
      ...goals,
      [term]: goals[term].map((goal) =>
        goal.id === id ? { ...goal, progress: progressValue } : goal
      ),
    });
  };

  const handleDateChange = (
    term: keyof GoalsData,
    id: number,
    date: Date | undefined
  ) => {
    if (!date) return;

    setGoals({
      ...goals,
      [term]: goals[term].map((goal) =>
        goal.id === id
          ? { ...goal, targetDate: date.toISOString().split("T")[0] }
          : goal
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the goals data to your backend
    console.log(goals);

    // After saving, close the form
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="short">Short-term</TabsTrigger>
          <TabsTrigger value="medium">Medium-term</TabsTrigger>
          <TabsTrigger value="long">Long-term</TabsTrigger>
        </TabsList>

        <TabsContent value="short" className="space-y-2">
          {goals.shortTerm.map((goal, index) => (
            <div key={goal.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <Label
                  htmlFor={`short-goal-${index}`}
                  className="text-xs mb-1 block"
                >
                  Goal
                </Label>
                <Input
                  id={`short-goal-${index}`}
                  value={goal.text}
                  onChange={(e) =>
                    handleGoalTextChange("shortTerm", goal.id, e.target.value)
                  }
                  placeholder="Enter goal"
                />
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor={`short-progress-${index}`}
                  className="text-xs mb-1 block"
                >
                  Progress %
                </Label>
                <Input
                  id={`short-progress-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) =>
                    handleProgressChange("shortTerm", goal.id, e.target.value)
                  }
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
                        !goal.targetDate && "text-muted-foreground"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {goal.targetDate ? (
                        format(new Date(goal.targetDate), "MM/dd/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        goal.targetDate ? new Date(goal.targetDate) : undefined
                      }
                      onSelect={(date) =>
                        handleDateChange("shortTerm", goal.id, date)
                      }
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
                  onClick={() => handleRemoveGoal("shortTerm", goal.id)}
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
            onClick={() => handleAddGoal("shortTerm")}
            className="flex items-center gap-1 mt-2"
          >
            <Plus size={16} /> Add Goal
          </Button>
        </TabsContent>

        <TabsContent value="medium" className="space-y-4">
          {goals.mediumTerm.map((goal, index) => (
            <div key={goal.id} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-5">
                <Label
                  htmlFor={`medium-goal-${index}`}
                  className="text-xs mb-1 block"
                >
                  Goal
                </Label>
                <Input
                  id={`medium-goal-${index}`}
                  value={goal.text}
                  onChange={(e) =>
                    handleGoalTextChange("mediumTerm", goal.id, e.target.value)
                  }
                  placeholder="Enter goal"
                />
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor={`medium-progress-${index}`}
                  className="text-xs mb-1 block"
                >
                  Progress %
                </Label>
                <Input
                  id={`medium-progress-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) =>
                    handleProgressChange("mediumTerm", goal.id, e.target.value)
                  }
                />
              </div>
              <div className="col-span-4">
                <Label className="text-xs mb-1 block">Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !goal.targetDate && "text-muted-foreground"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {goal.targetDate ? (
                        format(new Date(goal.targetDate), "MM/dd/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        goal.targetDate ? new Date(goal.targetDate) : undefined
                      }
                      onSelect={(date) =>
                        handleDateChange("mediumTerm", goal.id, date)
                      }
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
                  onClick={() => handleRemoveGoal("mediumTerm", goal.id)}
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
            onClick={() => handleAddGoal("mediumTerm")}
            className="flex items-center gap-1 mt-2"
          >
            <Plus size={16} /> Add Goal
          </Button>
        </TabsContent>

        <TabsContent value="long" className="space-y-4">
          {goals.longTerm.map((goal, index) => (
            <div key={goal.id} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-5">
                <Label
                  htmlFor={`long-goal-${index}`}
                  className="text-xs mb-1 block"
                >
                  Goal
                </Label>
                <Input
                  id={`long-goal-${index}`}
                  value={goal.text}
                  onChange={(e) =>
                    handleGoalTextChange("longTerm", goal.id, e.target.value)
                  }
                  placeholder="Enter goal"
                />
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor={`long-progress-${index}`}
                  className="text-xs mb-1 block"
                >
                  Progress %
                </Label>
                <Input
                  id={`long-progress-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) =>
                    handleProgressChange("longTerm", goal.id, e.target.value)
                  }
                />
              </div>
              <div className="col-span-4">
                <Label className="text-xs mb-1 block">Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !goal.targetDate && "text-muted-foreground"
                      )}
                      size="sm"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {goal.targetDate ? (
                        format(new Date(goal.targetDate), "MM/dd/yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        goal.targetDate ? new Date(goal.targetDate) : undefined
                      }
                      onSelect={(date) =>
                        handleDateChange("longTerm", goal.id, date)
                      }
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
                  onClick={() => handleRemoveGoal("longTerm", goal.id)}
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
            onClick={() => handleAddGoal("longTerm")}
            className="flex items-center gap-1 mt-2"
          >
            <Plus size={16} /> Add Goal
          </Button>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">Save Goals</Button>
      </div>
    </form>
  );
};

export default GoalsForm;
