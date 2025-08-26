// EditUserModal.tsx
import { useState, useEffect } from "react";
import { Edit, X, Save, Crown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types
interface PricingPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  max_horses: number;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  is_active: boolean;
  is_trial: boolean;
  started_at: string;
  ends_at: string;
  stripe_subscription_id?: string;
  pricing_plans: PricingPlan;
  coupon_id?: string;
  coupons?: {
    code: string;
    discount_percent: number;
  };
}

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    full_name?: string;
  };
  last_sign_in_at: string | null;
  role?: string;
  region?: string;
  is_active?: boolean;
  subscription?: UserSubscription | null;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
  currentUserId?: string;
}

interface EditFormData {
  full_name: string;
  email: string;
  role: string;
  region: string;
  is_active: boolean;
  subscription: {
    plan_id: string;
    is_active: boolean;
    is_trial: boolean;
    ends_at: string;
  };
}

const EditUserModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUserUpdated, 
  currentUserId 
}: EditUserModalProps) => {
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    full_name: "",
    email: "",
    role: "user",
    region: "",
    is_active: true,
    subscription: {
      plan_id: "none",
      is_active: false,
      is_trial: false,
      ends_at: "",
    },
  });

  const { toast } = useToast();

  // Load available plans and populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailablePlans();
      if (user) {
        populateFormData(user);
      }
    }
  }, [isOpen, user]);

  const loadAvailablePlans = async () => {
    try {
      console.log("Loading available pricing plans...");
      
      const { data: plansData, error: plansError } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (plansError) {
        console.error("Error fetching plans:", plansError);
        throw plansError;
      }

      console.log("Available plans loaded:", plansData);
      setAvailablePlans(plansData || []);
    } catch (error) {
      console.error("Error loading pricing plans:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    }
  };

  const populateFormData = (userData: User) => {
    console.log("Populating form data for user:", userData);
    
    setEditFormData({
      full_name: userData.user_metadata.full_name || "",
      email: userData.email,
      role: userData.role || "user",
      region: userData.region || "",
      is_active: userData.is_active ?? true,
      subscription: {
        plan_id: userData.subscription?.plan_id || "none",
        is_active: userData.subscription?.is_active || false,
        is_trial: userData.subscription?.is_trial || false,
        ends_at: userData.subscription?.ends_at 
          ? new Date(userData.subscription.ends_at).toISOString().split('T')[0] 
          : "",
      },
    });
  };

  const handleClose = () => {
    setEditFormData({
      full_name: "",
      email: "",
      role: "user",
      region: "",
      is_active: true,
      subscription: {
        plan_id: "none",
        is_active: false,
        is_trial: false,
        ends_at: "",
      },
    });
    onClose();
  };

  const handleSave = async () => {
    if (!user || !currentUserId) return;

    setIsLoading(true);
    try {
      console.log("Starting user update process...");
      console.log("Current user ID:", currentUserId);
      console.log("Target user ID:", user.id);
      console.log("Form data:", editFormData);

      // First, try to check if we can access user_subscriptions table
      const { data: testQuery, error: testError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .limit(1);

      if (testError) {
        console.error("RLS Error - Cannot access user_subscriptions:", testError);
        toast({
          title: "Permission Error",
          description: "Cannot access subscription data. Please check your admin permissions.",
          variant: "destructive",
        });
        return;
      }

      // Prepare update payload for user profile
      const updatePayload: any = {
        profile: {},
        role: editFormData.role,
        email: editFormData.email,
      };

      // Update profile fields
      if (editFormData.full_name) {
        updatePayload.profile.coach_name = editFormData.full_name;
      }
      if (editFormData.region) {
        updatePayload.profile.region = editFormData.region;
      }

      console.log("Calling edge function with payload:", updatePayload);

      // Call edge function to update user
      const { data, error } = await supabase.functions.invoke(
        "update-user-profile",
        {
          body: {
            userId: user.id,
            updateData: updatePayload,
            requestingUserId: currentUserId,
          },
        }
      );

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }
      
      if (!data?.success) {
        throw new Error(data?.message || "Failed to update user");
      }

      console.log("User profile updated successfully");

      // Handle subscription updates
      try {
        await handleSubscriptionUpdate();
        console.log("Subscription update completed");
      } catch (subError) {
        console.error("Subscription update failed:", subError);
        // Don't fail the entire operation if only subscription update fails
        toast({
          title: "Partial Success",
          description: "User information updated, but subscription update failed. Please try updating the subscription again.",
          variant: "destructive",
        });
        
        handleClose();
        onUserUpdated();
        return;
      }

      toast({
        title: "Success",
        description: "User information and subscription updated successfully.",
      });

      handleClose();
      onUserUpdated();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionUpdate = async () => {
    if (!user) return;

    const currentPlanId = user.subscription?.plan_id || "none";
    const newPlanId = editFormData.subscription.plan_id;

    console.log("Subscription update check:", {
      currentPlanId,
      newPlanId,
      hasExistingSubscription: !!user.subscription,
      formData: editFormData.subscription
    });

    // Only update if subscription changed
    if (newPlanId !== currentPlanId) {
      console.log("Updating subscription from", currentPlanId, "to", newPlanId);

      if (newPlanId && newPlanId !== "none") {
        // Creating or updating subscription
        const subscriptionUpdate: any = {
          plan_id: newPlanId,
          is_active: editFormData.subscription.is_active,
          is_trial: editFormData.subscription.is_trial,
          updated_at: new Date().toISOString(),
        };

        if (editFormData.subscription.ends_at) {
          subscriptionUpdate.ends_at = new Date(editFormData.subscription.ends_at).toISOString();
        } else {
          // Set default end date to 30 days from now if not specified
          const defaultEndDate = new Date();
          defaultEndDate.setDate(defaultEndDate.getDate() + 30);
          subscriptionUpdate.ends_at = defaultEndDate.toISOString();
        }

        if (user.subscription) {
          // Update existing subscription
          console.log("Updating existing subscription with:", subscriptionUpdate);
          
          const { data: updateResult, error: subError } = await supabase
            .from('user_subscriptions')
            .update(subscriptionUpdate)
            .eq('id', user.subscription.id)
            .select();

          if (subError) {
            console.error("Error updating subscription:", subError);
            throw new Error(`Failed to update subscription: ${subError.message}`);
          }

          console.log("Subscription updated successfully:", updateResult);
        } else {
          // Create new subscription
          console.log("Creating new subscription with:", subscriptionUpdate);
          
          const { data: createResult, error: createError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              ...subscriptionUpdate,
              started_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })
            .select();

          if (createError) {
            console.error("Error creating subscription:", createError);
            throw new Error(`Failed to create subscription: ${createError.message}`);
          }

          console.log("Subscription created successfully:", createResult);
        }
      } else if (user.subscription && newPlanId === "none") {
        // Deactivate existing subscription
        console.log("Deactivating existing subscription");
        
        const { data: deactivateResult, error: deactivateError } = await supabase
          .from('user_subscriptions')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.subscription.id)
          .select();

        if (deactivateError) {
          console.error("Error deactivating subscription:", deactivateError);
          throw new Error(`Failed to deactivate subscription: ${deactivateError.message}`);
        }

        console.log("Subscription deactivated successfully:", deactivateResult);
      }
    } else {
      // Even if plan didn't change, update other subscription fields if they changed
      if (user.subscription) {
        const subscriptionFieldsUpdate: any = {};
        let hasChanges = false;

        if (user.subscription.is_active !== editFormData.subscription.is_active) {
          subscriptionFieldsUpdate.is_active = editFormData.subscription.is_active;
          hasChanges = true;
        }

        if (user.subscription.is_trial !== editFormData.subscription.is_trial) {
          subscriptionFieldsUpdate.is_trial = editFormData.subscription.is_trial;
          hasChanges = true;
        }

        const currentEndDate = user.subscription.ends_at ? new Date(user.subscription.ends_at).toISOString().split('T')[0] : "";
        if (currentEndDate !== editFormData.subscription.ends_at && editFormData.subscription.ends_at) {
          subscriptionFieldsUpdate.ends_at = new Date(editFormData.subscription.ends_at).toISOString();
          hasChanges = true;
        }

        if (hasChanges) {
          subscriptionFieldsUpdate.updated_at = new Date().toISOString();
          
          console.log("Updating subscription fields:", subscriptionFieldsUpdate);
          
          const { data: updateResult, error: updateError } = await supabase
            .from('user_subscriptions')
            .update(subscriptionFieldsUpdate)
            .eq('id', user.subscription.id)
            .select();

          if (updateError) {
            console.error("Error updating subscription fields:", updateError);
            throw new Error(`Failed to update subscription fields: ${updateError.message}`);
          }

          console.log("Subscription fields updated successfully:", updateResult);
        }
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit User: {user.user_metadata.full_name || user.email}
          </DialogTitle>
          <DialogDescription>
            Update user information, role, and subscription details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Input
                  id="edit-region"
                  value={editFormData.region}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="Enter region"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editFormData.is_active}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-active">Account Active</Label>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Subscription Plan</Label>
                <Select
                  value={editFormData.subscription.plan_id}
                  onValueChange={(value) => setEditFormData(prev => ({ 
                    ...prev, 
                    subscription: { ...prev.subscription, plan_id: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Plan</SelectItem>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - £{plan.monthly_price}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availablePlans.length === 0 && (
                  <p className="text-xs text-gray-500">Loading plans...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ends-at">Subscription Ends</Label>
                <Input
                  id="edit-ends-at"
                  type="date"
                  value={editFormData.subscription.ends_at}
                  onChange={(e) => setEditFormData(prev => ({ 
                    ...prev, 
                    subscription: { ...prev.subscription, ends_at: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-sub-active"
                  checked={editFormData.subscription.is_active}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ 
                    ...prev, 
                    subscription: { ...prev.subscription, is_active: checked }
                  }))}
                />
                <Label htmlFor="edit-sub-active">Subscription Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-sub-trial"
                  checked={editFormData.subscription.is_trial}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ 
                    ...prev, 
                    subscription: { ...prev.subscription, is_trial: checked }
                  }))}
                />
                <Label htmlFor="edit-sub-trial">Trial Period</Label>
              </div>
            </div>

            {/* Current Subscription Info */}
            {user.subscription && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Subscription</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Plan:</strong> {user.subscription.pricing_plans.name}</p>
                  <p><strong>Price:</strong> £{user.subscription.pricing_plans.monthly_price}/month</p>
                  <p><strong>Status:</strong> {user.subscription.is_active ? 'Active' : 'Inactive'}</p>
                  <p><strong>Trial:</strong> {user.subscription.is_trial ? 'Yes' : 'No'}</p>
                  <p><strong>Ends:</strong> {new Date(user.subscription.ends_at).toLocaleDateString()}</p>
                  {user.subscription.stripe_subscription_id && (
                    <p><strong>Stripe ID:</strong> {user.subscription.stripe_subscription_id}</p>
                  )}
                  {user.subscription.coupons && (
                    <p><strong>Coupon:</strong> {user.subscription.coupons.code} ({user.subscription.coupons.discount_percent}% off)</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Account Statistics */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">User ID:</p>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Created:</p>
                <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Sign In:</p>
                <p className="font-medium">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Account Status:</p>
                <p className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;