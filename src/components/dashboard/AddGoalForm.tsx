import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Target, Zap, Mountain, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { goalsService } from "@/services/goalsService";
import { useToast } from "@/hooks/use-toast";

interface AddGoalFormProps {
  onComplete: () => void;
}

const AddGoalForm = ({ onComplete }: AddGoalFormProps) => {
  const [formData, setFormData] = useState({
    goal_text: "",
    goal_type: "short-term" as "short-term" | "medium-term" | "long-term",
    progress: 0,
    target_date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const getGoalTypeDescription = (type: string) => {
    switch (type) {
      case "short-term":
        return "Goals you want to achieve in the next 1-3 months";
      case "medium-term":
        return "Goals you want to achieve in the next 3-12 months";
      case "long-term":
        return "Goals you want to achieve in 1+ years";
      default:
        return "";
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goal_text.trim()) {
      toast({
        title: "Error",
        description: "Goal description is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await goalsService.createGoal(formData);

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });

      onComplete();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        {getGoalTypeIcon(formData.goal_type)}
        <Badge variant="secondary" className="text-sm">
          {formData.goal_type.replace("-", " ")} goal
        </Badge>
      </div>

      {/* Form */}
      <Card className={cn("p-6", getGoalTypeColor(formData.goal_type))}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Goal Type</Label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  value: "short-term",
                  icon: <Zap className="h-4 w-4 text-yellow-500" />,
                  label: "Short",
                },
                {
                  value: "medium-term",
                  icon: <Target className="h-4 w-4 text-blue-500" />,
                  label: "Medium",
                },
                {
                  value: "long-term",
                  icon: <Mountain className="h-4 w-4 text-purple-500" />,
                  label: "Long",
                },
              ].map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={
                    formData.goal_type === item.value ? "default" : "outline"
                  }
                  onClick={() => handleInputChange("goal_type", item.value)}
                  className="flex items-center gap-1 px-3 py-1 text-sm"
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              {getGoalTypeDescription(formData.goal_type)}
            </p>
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <Label htmlFor="goal-text" className="text-sm font-medium">
              Goal Description
            </Label>
            <Textarea
              id="goal-text"
              value={formData.goal_text}
              onChange={(e) => handleInputChange("goal_text", e.target.value)}
              placeholder="Describe what you want to achieve..."
              className="min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Initial Progress</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    handleInputChange("progress", parseInt(e.target.value) || 0)
                  }
                  className="w-20 h-8 text-sm"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
            <Slider
              value={[formData.progress]}
              onValueChange={(value) => handleInputChange("progress", value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-gray-600">
              Set your current progress towards this goal
            </p>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.target_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date ? (
                    format(new Date(formData.target_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formData.target_date
                      ? new Date(formData.target_date)
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      handleInputChange(
                        "target_date",
                        date.toISOString().split("T")[0]
                      );
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-600">
              When do you want to achieve this goal?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddGoalForm;
