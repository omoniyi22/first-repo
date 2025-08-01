// EditCouponDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Percent } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_redemptions?: number | null;
  current_redemptions?: number;
  expires_at?: string | null;
  created_at: string;
  is_active?: boolean;
}

interface EditCouponDialogProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onCouponUpdated: () => void;
}

const EditCouponDialog = ({
  coupon,
  isOpen,
  onClose,
  onCouponUpdated,
}: EditCouponDialogProps) => {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (coupon && isOpen) {
      setEditingCoupon({ ...coupon });
    }
  }, [coupon, isOpen]);

  const handleSaveCoupon = async () => {
    if (!editingCoupon) return;

    // Validation
    if (
      !editingCoupon.code ||
      editingCoupon.discount_percent <= 0 ||
      editingCoupon.discount_percent > 100
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please provide a valid coupon code and discount percentage (1-100%)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("coupons")
        .update({
          code: editingCoupon.code.toUpperCase().trim(),
          discount_percent: editingCoupon.discount_percent,
          max_redemptions: editingCoupon.max_redemptions || null,
          expires_at: editingCoupon.expires_at || null,
        })
        .eq("id", editingCoupon.id);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast({
            title: "Error",
            description: "A coupon with this code already exists",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });

      onClose();
      onCouponUpdated();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
          <DialogDescription>Modify coupon details</DialogDescription>
        </DialogHeader>

        {editingCoupon && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Coupon Code *</Label>
              <Input
                id="edit-code"
                value={editingCoupon.code}
                onChange={(e) =>
                  setEditingCoupon({
                    ...editingCoupon,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="font-mono"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-discount">Discount Percentage *</Label>
              <div className="relative">
                <Input
                  id="edit-discount"
                  type="number"
                  min="1"
                  max="100"
                  value={editingCoupon.discount_percent}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      discount_percent: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={isLoading}
                />
                <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-max-redemptions">Max Redemptions</Label>
              <Input
                id="edit-max-redemptions"
                type="number"
                min="1"
                value={editingCoupon.max_redemptions || ""}
                onChange={(e) =>
                  setEditingCoupon({
                    ...editingCoupon,
                    max_redemptions: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="Leave empty for unlimited"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expires">Expiry Date</Label>
              <Input
                id="edit-expires"
                type="datetime-local"
                value={editingCoupon.expires_at || ""}
                onChange={(e) =>
                  setEditingCoupon({
                    ...editingCoupon,
                    expires_at: e.target.value || null,
                  })
                }
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveCoupon} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCouponDialog;
