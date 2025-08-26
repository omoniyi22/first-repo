import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

interface PricingPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  tagline_en: string;
  tagline_es: string;
  is_highlighted: boolean;
  max_horses: number;
  max_documents_monthly: number;
  created_at: string;
  updated_at: string;
}

const CreatePlanDialog = ({ isCreating, setIsCreating, fetchPricingData }) => {
  const { toast } = useToast();
  const [newPlan, setNewPlan] = useState<Partial<PricingPlan>>({
    name: "",
    monthly_price: 0,
    annual_price: 0,
    tagline_en: "",
    tagline_es: "",
    is_highlighted: false,
    max_horses: 1,
    max_documents_monthly: 3,
  });

  // CREATE NEW PLAN
  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.monthly_price || !newPlan.annual_price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .insert({
          name: newPlan.name,
          monthly_price: newPlan.monthly_price,
          annual_price: newPlan.annual_price,
          tagline_en: newPlan.tagline_en || "",
          tagline_es: newPlan.tagline_es || "",
          is_highlighted: newPlan.is_highlighted || false,
          max_horses: newPlan.max_horses || 1,
          max_documents_monthly: newPlan.max_documents_monthly || 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing plan created successfully",
      });

      setIsCreating(false);
      resetNewPlanForm(); // Fixed: Use dedicated reset function
      fetchPricingData();
    } catch (error) {
      console.error("Error creating plan:", error);
      toast({
        title: "Error",
        description: "Failed to create pricing plan",
        variant: "destructive",
      });
    }
  };
  // Fixed: Reset form properly and prevent unnecessary re-renders
  const resetNewPlanForm = () => {
    setNewPlan({
      name: "",
      monthly_price: 0,
      annual_price: 0,
      tagline_en: "",
      tagline_es: "",
      is_highlighted: false,
      max_horses: 1,
      max_documents_monthly: 3,
    });
  };

  return (
    <>
      <Dialog
        open={isCreating}
        onOpenChange={(open) => {
          setIsCreating(open);
          if (!open) {
            resetNewPlanForm();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Pricing Plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan with features and horse limits
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Plan Name *</Label>
                <Input
                  id="new-name"
                  value={newPlan.name || ""}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  placeholder="e.g., Basic, Premium, Enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-max-horses">Max Horses *</Label>
                <Input
                  id="new-max-horses"
                  type="number"
                  min="1"
                  max="999"
                  value={newPlan.max_horses || 1}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      max_horses: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Use -1 for unlimited horses
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-max-docs">Max Documents/Month *</Label>
                <Input
                  id="new-max-docs"
                  type="number"
                  min="-1"
                  max="999"
                  value={newPlan.max_documents_monthly || 3}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      max_documents_monthly: parseInt(e.target.value) || 3,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Use -1 for unlimited documents
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-monthly">Monthly Price (£) *</Label>
                <Input
                  id="new-monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPlan.monthly_price || 0}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      monthly_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-annual">Annual Price (£/month) *</Label>
                <Input
                  id="new-annual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPlan.annual_price || 0}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      annual_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-tagline-en">Tagline (English)</Label>
                <Input
                  id="new-tagline-en"
                  value={newPlan.tagline_en || ""}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, tagline_en: e.target.value })
                  }
                  placeholder="Perfect for individuals"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-tagline-es">Tagline (Spanish)</Label>
                <Input
                  id="new-tagline-es"
                  value={newPlan.tagline_es || ""}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, tagline_es: e.target.value })
                  }
                  placeholder="Perfecto para individuos"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="new-highlighted"
                checked={newPlan.is_highlighted || false}
                onCheckedChange={(checked) =>
                  setNewPlan({ ...newPlan, is_highlighted: checked })
                }
              />
              <Label htmlFor="new-highlighted">Featured/Highlighted Plan</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePlanDialog;
