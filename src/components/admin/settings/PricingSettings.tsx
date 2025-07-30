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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Trash2, Edit, Plus, Save } from "lucide-react";
import { PricingPlan, Feature } from "./types";

const PricingSettings = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingFeatures, setEditingFeatures] = useState<Feature[]>([]);
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
        .order("created_at", { ascending: true });

      if (plansError) throw plansError;

      // Fetch plan features
      const { data: featuresData, error: featuresError } = await supabase
        .from("pricing_features")
        .select("*")
        .order("display_order");

      if (featuresError) throw featuresError;

      setPlans((plansData as PricingPlan[]) || []);
      setFeatures((featuresData as Feature[]) || []);

      if (plansData && plansData.length > 0) {
        setActiveTab(plansData[0].id);
      }
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
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      // Update plan
      const { error: planError } = await supabase
        .from("pricing_plans")
        .update({
          name: editingPlan.name,
          monthly_price: editingPlan.monthly_price,
          annual_price: editingPlan.annual_price,
          tagline_en: editingPlan.tagline_en,
          tagline_es: editingPlan.tagline_es,
          is_highlighted: editingPlan.is_highlighted,
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

  const handleAddFeature = async () => {
    if (!editingPlan || !newFeatureText.en || !newFeatureText.es) return;

    try {
      // Calculate new display_order number (max order + 1)
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
            <div>Edit Pricing Plan: {editingPlan.name}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlighted">Highlighted Plan</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="highlighted"
                    checked={editingPlan.is_highlighted}
                    onCheckedChange={(checked) =>
                      setEditingPlan({
                        ...editingPlan,
                        is_highlighted: checked,
                      })
                    }
                  />
                  <span>
                    {editingPlan.is_highlighted
                      ? "Featured Plan"
                      : "Regular Plan"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price (£)</Label>
                <Input
                  id="monthlyPrice"
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
                <Label htmlFor="annualPrice">Annual Price (£/month)</Label>
                <Input
                  id="annualPrice"
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
                <Label htmlFor="taglineEn">Tagline (English)</Label>
                <Input
                  id="taglineEn"
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
                <Label htmlFor="taglineEs">Tagline (Spanish)</Label>
                <Input
                  id="taglineEs"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Pricing Plans
        </h1>
        <p className="text-gray-500">
          Manage your subscription pricing plans and features
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <Card key={plan.id}>
              <div className="border rounded-lg p-4 space-y-4 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{plan.name}</h3>
                    <p className="text-sm text-gray-500">
                      £{plan.monthly_price}/mo (monthly) · £{plan.annual_price}
                      /mo (annual)
                    </p>
                    <p className="mt-2 text-sm">{plan.tagline_en}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <ul className="space-y-2">
                    {features
                      .filter((feature) => feature.plan_id === plan.id)
                      .map((feature) => (
                        <li key={feature.id} className="flex items-start">
                          <Check
                            className={`h-5 w-5 mr-2 flex-shrink-0 ${
                              feature.included
                                ? "text-purple-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={feature.included ? "" : "text-gray-400"}
                          >
                            {feature.text_en}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No pricing plans found</p>
            <Button className="mt-4">Create First Plan</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingSettings;
