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
  is_default?: boolean;
  document_limit_type?: "one_time" | "monthly";
  max_horses: number;
  max_documents_monthly: number;
  analysis_limit: number;
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
    is_default: false,
    document_limit_type: "monthly",
    max_horses: 1,
    max_documents_monthly: 3,
    analysis_limit: 10,
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
      // 🆕 If setting this plan as default, unset other defaults first
      if (newPlan.is_default) {
        await supabase.from("pricing_plans").update({ is_default: false });
      }

      const { data, error } = await supabase
        .from("pricing_plans")
        .insert({
          name: newPlan.name,
          monthly_price: newPlan.monthly_price,
          annual_price: newPlan.annual_price,
          tagline_en: newPlan.tagline_en || "",
          tagline_es: newPlan.tagline_es || "",
          is_highlighted: newPlan.is_highlighted || false,
          is_default: newPlan.is_default || false,
          document_limit_type: newPlan.document_limit_type || "monthly",
          max_horses: newPlan.max_horses || 1,
          max_documents_monthly: newPlan.max_documents_monthly || 3,
          analysis_limit: newPlan.analysis_limit || 10,
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
      resetNewPlanForm();
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

  const resetNewPlanForm = () => {
    setNewPlan({
      name: "",
      monthly_price: 0,
      annual_price: 0,
      tagline_en: "",
      tagline_es: "",
      is_highlighted: false,
      is_default: false,
      document_limit_type: "monthly",
      max_horses: 1,
      max_documents_monthly: 3,
      analysis_limit: 10,
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
              Add a new subscription plan with features and limits
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Plan Name and Max Horses Row */}
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
                  min="-1"
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
            </div>

            {/* Document Limits Row */}
            <div className="grid grid-cols-2 gap-4">
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

              {/* 🆕 DOCUMENT LIMIT TYPE */}
              <div className="space-y-2">
                <Label htmlFor="new-document-limit-type">
                  Document Limit Type *
                </Label>
                <select
                  id="new-document-limit-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newPlan.document_limit_type || "monthly"}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      document_limit_type: e.target.value as
                        | "one_time"
                        | "monthly",
                    })
                  }
                >
                  <option value="monthly">Monthly (Resets)</option>
                  <option value="one_time">One-Time (Lifetime)</option>
                </select>
                <p className="text-xs text-gray-500">
                  {newPlan.document_limit_type === "one_time"
                    ? "🔒 Limit never resets"
                    : "🔄 Resets every month"}
                </p>
              </div>
            </div>

            {/* 🆕 ANALYSIS LIMIT ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-analysis-limit">Max Analysis/Month *</Label>
                <Input
                  id="new-analysis-limit"
                  type="number"
                  min="-1"
                  max="999"
                  value={newPlan.analysis_limit || 10}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      analysis_limit: parseInt(e.target.value) || 10,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Use -1 for unlimited analysis
                </p>
              </div>
            </div>

            {/* Pricing Row */}
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

            {/* Taglines Row */}
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

            {/* Switches Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="new-highlighted"
                  checked={newPlan.is_highlighted || false}
                  onCheckedChange={(checked) =>
                    setNewPlan({ ...newPlan, is_highlighted: checked })
                  }
                />
                <Label htmlFor="new-highlighted" className="cursor-pointer">
                  Featured/Highlighted Plan
                </Label>
              </div>

              {/* 🆕 DEFAULT PLAN SWITCH */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="new-is-default"
                  checked={newPlan.is_default || false}
                  onCheckedChange={(checked) =>
                    setNewPlan({ ...newPlan, is_default: checked })
                  }
                />
                <Label htmlFor="new-is-default" className="cursor-pointer">
                  Set as Default Plan (Auto-assigned to new users)
                </Label>
              </div>

              {/* Info Box for Default Plan */}
              {newPlan.is_default && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <strong>ℹ️ Default Plan:</strong> This plan will be
                  automatically assigned to all new users when they sign up.
                </div>
              )}

              {/* Info Box for One-Time Limit */}
              {newPlan.document_limit_type === "one_time" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                  <strong>🔒 One-Time Limit:</strong> Users will only be able to
                  upload{" "}
                  {newPlan.max_documents_monthly === -1
                    ? "unlimited"
                    : newPlan.max_documents_monthly}{" "}
                  document{newPlan.max_documents_monthly !== 1 ? "s" : ""}{" "}
                  total. This limit will never reset.
                </div>
              )}
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
