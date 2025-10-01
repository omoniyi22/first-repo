import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Check,
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  Star,
  Heart,
  FileText,
} from "lucide-react";
import CreatePlanDialog from "./CreatePlan";

// Types

interface Feature {
  id: string;
  plan_id: string;
  text_en: string;
  text_es: string;
  included: boolean;
  display_order: number;
}

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
  analysis_limit: number;
  created_at: string;
  updated_at: string;
}

const PricingSettings = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingFeatures, setEditingFeatures] = useState<Feature[]>([]);

  // Create new plan states - Fixed: Initialize with proper defaults
  const [isCreating, setIsCreating] = useState(false);

  const [newFeatureText, setNewFeatureText] = useState({ en: "", es: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setIsLoading(true);

      // Fetch pricing plans
      const { data: plansData, error: plansError } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("monthly_price", { ascending: true });

      if (plansError) throw plansError;

      // Fetch plan features
      const { data: featuresData, error: featuresError } = await supabase
        .from("pricing_features")
        .select("*")
        .order("display_order");

      if (featuresError) throw featuresError;

      setPlans(
        (plansData || []).map((plan: any) => ({
          ...plan,
          max_horses: plan.max_horses !== undefined ? plan.max_horses : 0,
          max_documents_monthly:
            plan.max_documents_monthly !== undefined
              ? plan.max_documents_monthly
              : 3,
          analysis_limit:
            plan.analysis_limit !== undefined ? plan.analysis_limit : 10,
        }))
      );
      setFeatures((featuresData as Feature[]) || []);
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // EDIT PLAN
  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan({ ...plan });
    setEditingFeatures(
      features.filter((feature) => feature.plan_id === plan.id)
    );
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPlan(null);
    setEditingFeatures([]);
    setNewFeatureText({ en: "", es: "" });
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      // Update plan - Removed Stripe fields
      const { error: planError } = await supabase
        .from("pricing_plans")
        .update({
          name: editingPlan.name,
          monthly_price: editingPlan.monthly_price,
          annual_price: editingPlan.annual_price,
          tagline_en: editingPlan.tagline_en,
          tagline_es: editingPlan.tagline_es,
          is_highlighted: editingPlan.is_highlighted,
          max_horses: editingPlan.max_horses,
          max_documents_monthly: editingPlan.max_documents_monthly,
          analysis_limit: editingPlan.analysis_limit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPlan.id);

      if (planError) throw planError;

      // Update features
      for (const feature of editingFeatures) {
        const { error: featureError } = await supabase
          .from("pricing_features")
          .update({
            text_en: feature.text_en,
            text_es: feature.text_es,
            included: feature.included,
          })
          .eq("id", feature.id);

        if (featureError) throw featureError;
      }

      toast({
        title: "Success",
        description: "Pricing plan updated successfully",
      });

      setIsEditing(false);
      setEditingPlan(null);
      setEditingFeatures([]);
      fetchPricingData();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to update pricing plan",
        variant: "destructive",
      });
    }
  };

  // DELETE PLAN
  const handleDeletePlan = async (planId: string, planName: string) => {
    try {
      // First delete associated features
      const { error: featuresError } = await supabase
        .from("pricing_features")
        .delete()
        .eq("plan_id", planId);

      if (featuresError) throw featuresError;

      // Then delete the plan
      const { error: planError } = await supabase
        .from("pricing_plans")
        .delete()
        .eq("id", planId);

      if (planError) throw planError;

      toast({
        title: "Success",
        description: `Plan "${planName}" deleted successfully`,
      });

      fetchPricingData();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete pricing plan",
        variant: "destructive",
      });
    }
  };

  // FEATURE MANAGEMENT
  const handleAddFeature = async () => {
    if (!editingPlan || !newFeatureText.en || !newFeatureText.es) return;

    try {
      const maxOrder =
        editingFeatures.length > 0
          ? Math.max(...editingFeatures.map((f) => f.display_order))
          : 0;

      const newFeature = {
        plan_id: editingPlan.id,
        text_en: newFeatureText.en,
        text_es: newFeatureText.es,
        included: true,
        display_order: maxOrder + 1,
      };

      const { data, error } = await supabase
        .from("pricing_features")
        .insert(newFeature)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setEditingFeatures([...editingFeatures, data[0] as Feature]);
        setNewFeatureText({ en: "", es: "" });
      }

      toast({
        title: "Success",
        description: "Feature added successfully",
      });
    } catch (error) {
      console.error("Error adding feature:", error);
      toast({
        title: "Error",
        description: "Failed to add feature",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    try {
      const { error } = await supabase
        .from("pricing_features")
        .delete()
        .eq("id", featureId);

      if (error) throw error;

      setEditingFeatures(editingFeatures.filter((f) => f.id !== featureId));

      toast({
        title: "Success",
        description: "Feature removed successfully",
      });
    } catch (error) {
      console.error("Error removing feature:", error);
      toast({
        title: "Error",
        description: "Failed to remove feature",
        variant: "destructive",
      });
    }
  };

  const updateFeatureValue = (id: string, field: keyof Feature, value: any) => {
    setEditingFeatures(
      editingFeatures.map((feature) =>
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show plan editor when editing
  if (isEditing && editingPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Edit Plan: {editingPlan.name}</span>
              {editingPlan.is_highlighted && (
                <Star className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSavePlan}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-planName">Plan Name</Label>
                <Input
                  id="edit-planName"
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxHorses">Max Horses</Label>
                <Input
                  id="edit-maxHorses"
                  type="number"
                  min="-1"
                  max="999"
                  value={editingPlan.max_horses}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      max_horses: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-gray-500">Use -1 for unlimited</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxDocs">Max Documents/Month</Label>
                <Input
                  id="edit-maxDocs"
                  type="number"
                  min="-1"
                  max="999"
                  value={editingPlan.max_documents_monthly}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      max_documents_monthly: parseInt(e.target.value) || 3,
                    })
                  }
                />
                <p className="text-xs text-gray-500">Use -1 for unlimited</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-analysisLimit">Max Analysis/Month</Label>
                <Input
                  id="edit-analysisLimit"
                  type="number"
                  min="-1"
                  max="999"
                  value={editingPlan.analysis_limit}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      analysis_limit: parseInt(e.target.value) || 10,
                    })
                  }
                />
                <p className="text-xs text-gray-500">Use -1 for unlimited</p>
              </div>
              <div className="space-y-2 flex items-center">
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="edit-highlighted"
                    checked={editingPlan.is_highlighted}
                    onCheckedChange={(checked) =>
                      setEditingPlan({
                        ...editingPlan,
                        is_highlighted: checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-highlighted">Featured Plan</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-monthlyPrice">Monthly Price (£)</Label>
                <Input
                  id="edit-monthlyPrice"
                  type="number"
                  step="0.01"
                  value={editingPlan.monthly_price}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      monthly_price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-annualPrice">Annual Price (£/month)</Label>
                <Input
                  id="edit-annualPrice"
                  type="number"
                  step="0.01"
                  value={editingPlan.annual_price}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      annual_price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-taglineEn">Tagline (English)</Label>
                <Input
                  id="edit-taglineEn"
                  value={editingPlan.tagline_en}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      tagline_en: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-taglineEs">Tagline (Spanish)</Label>
                <Input
                  id="edit-taglineEs"
                  value={editingPlan.tagline_es}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      tagline_es: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Plan Features</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature (English)</TableHead>
                    <TableHead>Feature (Spanish)</TableHead>
                    <TableHead className="w-[100px]">Included</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingFeatures.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell>
                        <Input
                          value={feature.text_en}
                          onChange={(e) =>
                            updateFeatureValue(
                              feature.id,
                              "text_en",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={feature.text_es}
                          onChange={(e) =>
                            updateFeatureValue(
                              feature.id,
                              "text_es",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={feature.included}
                          onCheckedChange={(checked) =>
                            updateFeatureValue(feature.id, "included", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(feature.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Add New Feature</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <Input
                    placeholder="Feature text (English)"
                    value={newFeatureText.en}
                    onChange={(e) =>
                      setNewFeatureText({
                        ...newFeatureText,
                        en: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Feature text (Spanish)"
                    value={newFeatureText.es}
                    onChange={(e) =>
                      setNewFeatureText({
                        ...newFeatureText,
                        es: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAddFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main pricing plans view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Pricing Plans Management
          </h1>
          <p className="text-gray-500">
            Create and manage subscription plans, features, and horse limits
          </p>
        </div>
        <CreatePlanDialog
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          fetchPricingData={fetchPricingData}
        />
      </div>

      {/* Quick Stats */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {plans.length}
                </div>
                <div className="text-sm text-gray-500">Total Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {plans.filter((p) => p.is_highlighted).length}
                </div>
                <div className="text-sm text-gray-500">Featured Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  £{Math.min(...plans.map((p) => p.monthly_price))} - £
                  {Math.max(...plans.map((p) => p.monthly_price))}
                </div>
                <div className="text-sm text-gray-500">Price Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {features.length}
                </div>
                <div className="text-sm text-gray-500">Total Features</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.is_highlighted ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {plan.is_highlighted && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Featured
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {plan.tagline_en}
                    </CardDescription>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      £{plan.monthly_price}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-green-600">
                      £{plan.annual_price}
                    </span>
                    <span className="text-gray-500 text-sm">
                      /month (billed annually)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-lg">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Max Horses:{" "}
                    {plan.max_horses === -1 ? "Unlimited" : plan.max_horses}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Max Documents:{" "}
                    {plan.max_documents_monthly === -1
                      ? "Unlimited"
                      : plan.max_documents_monthly}
                    /month
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 p-2 bg-purple-50 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Max Analysis:{" "}
                    {plan.analysis_limit === -1
                      ? "Unlimited"
                      : plan.analysis_limit}
                    /month
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Features</h4>
                    <ul className="space-y-2">
                      {features
                        .filter((feature) => feature.plan_id === plan.id)
                        .map((feature) => (
                          <li
                            key={feature.id}
                            className="flex items-start text-sm"
                          >
                            <Check
                              className={`h-4 w-4 mr-2 flex-shrink-0 mt-0.5 ${
                                feature.included
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={
                                feature.included
                                  ? ""
                                  : "text-gray-400 line-through"
                              }
                            >
                              {feature.text_en}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Pricing Plan
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{plan.name}"
                            plan? This will also delete all associated features.
                            This action cannot be undone.
                            <br />
                            <br />
                            <strong>Warning:</strong> Users with active
                            subscriptions to this plan may be affected.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Plan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pricing plans found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first pricing plan
            </p>
            <CreatePlanDialog
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              fetchPricingData={fetchPricingData}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingSettings;
