import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface TrainingFocusItem {
  id: number;
  movement: string;
  description: string;
  priority: string;
}

interface TrainingFocusFormProps {
  onComplete: () => void;
  initialFocus: TrainingFocusItem[];
}

const TrainingFocusForm = ({
  onComplete,
  initialFocus,
}: TrainingFocusFormProps) => {
  const [focusItems, setFocusItems] =
    useState<TrainingFocusItem[]>(initialFocus);

  const handleAddFocus = () => {
    const newFocus = {
      id: Date.now(),
      movement: "",
      description: "",
      priority: "medium",
    };

    setFocusItems([...focusItems, newFocus]);
  };

  const handleRemoveFocus = (id: number) => {
    setFocusItems(focusItems.filter((item) => item.id !== id));
  };

  const handleMovementChange = (id: number, movement: string) => {
    setFocusItems(
      focusItems.map((item) => (item.id === id ? { ...item, movement } : item))
    );
  };

  const handleDescriptionChange = (id: number, description: string) => {
    setFocusItems(
      focusItems.map((item) =>
        item.id === id ? { ...item, description } : item
      )
    );
  };

  const handlePriorityChange = (id: number, priority: string) => {
    setFocusItems(
      focusItems.map((item) => (item.id === id ? { ...item, priority } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the focus items data to your backend
    console.log(focusItems);

    // After saving, close the form
    onComplete();
  };

  // Example movements to choose from - could be expanded
  const movements = [
    "Walk - Free Walk",
    "Walk - Medium Walk",
    "Walk - Extended Walk",
    "Walk - Collected Walk",
    "Trot - Working Trot",
    "Trot - Medium Trot",
    "Trot - Extended Trot",
    "Trot - Collected Trot",
    "Canter - Working Canter",
    "Canter - Medium Canter",
    "Canter - Extended Canter",
    "Canter - Collected Canter",
    "Transitions - Walk-Trot",
    "Transitions - Trot-Canter",
    "Transitions - Downward",
    "Halt",
    "Lateral Work - Leg Yield",
    "Lateral Work - Shoulder-In",
    "Lateral Work - Haunches-In",
    "Lateral Work - Half Pass",
    "Advanced - Pirouette",
    "Advanced - Flying Change",
    "Advanced - Piaffe",
    "Advanced - Passage",
  ];

  return (
    <div className="max-h-96 overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {focusItems.map((focus, index) => (
          <div
            key={focus.id}
            className="p-3 border border-gray-200 rounded-md space-y-3"
          >
            <div className="flex justify-between items-center">
              <Label className="font-medium">Focus Area {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFocus(focus.id)}
                className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-1" />
                Remove
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor={`movement-${index}`} className="text-sm">
                  Movement
                </Label>
                <Input
                  id={`movement-${index}`}
                  value={focus.movement}
                  onChange={(e) =>
                    handleMovementChange(focus.id, e.target.value)
                  }
                  placeholder="Enter movement or exercise"
                  list={`movement-list-${index}`}
                />
                <datalist id={`movement-list-${index}`}>
                  {movements.map((movement, idx) => (
                    <option key={idx} value={movement} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label htmlFor={`description-${index}`} className="text-sm">
                  Training Notes
                </Label>
                <Textarea
                  id={`description-${index}`}
                  value={focus.description}
                  onChange={(e) =>
                    handleDescriptionChange(focus.id, e.target.value)
                  }
                  placeholder="Add notes about what to focus on"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor={`priority-${index}`} className="text-sm">
                  Priority
                </Label>
                <Select
                  value={focus.priority}
                  onValueChange={(value) =>
                    handlePriorityChange(focus.id, value)
                  }
                >
                  <SelectTrigger id={`priority-${index}`} className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddFocus}
          className="flex items-center gap-1 w-full"
        >
          <Plus size={16} />
          Add Focus Area
        </Button>

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default TrainingFocusForm;
