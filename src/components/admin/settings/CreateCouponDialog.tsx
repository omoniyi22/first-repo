// CreateCouponDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Percent } from "lucide-react";

interface NewCouponData {
  code: string;
  discount_percent: number;
  max_redemptions: number | null;
  expires_at: string;
}

interface CreateCouponDialogProps {
  onCouponCreated: () => void;
}

const CreateCouponDialog = ({ onCouponCreated }: CreateCouponDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<NewCouponData>({
    code: "",
    discount_percent: 10,
    max_redemptions: null,
    expires_at: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateCoupon = async () => {
    // Validation
    if (
      !newCoupon.code ||
      newCoupon.discount_percent <= 0 ||
      newCoupon.discount_percent > 100
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

      const couponData = {
        code: newCoupon.code.toUpperCase().trim(),
        discount_percent: newCoupon.discount_percent,
        max_redemptions: newCoupon.max_redemptions || null,
        expires_at: newCoupon.expires_at || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("coupons").insert(couponData);

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
        description: "Coupon created successfully",
      });

      // Reset form and close dialog
      setIsOpen(false);
      setNewCoupon({
        code: "",
        discount_percent: 10,
        max_redemptions: null,
        expires_at: "",
      });
      onCouponCreated();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogDescription>
            Add a new discount coupon for users to apply to subscriptions
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-code">Coupon Code *</Label>
            <Input
              id="new-code"
              value={newCoupon.code}
              onChange={(e) =>
                setNewCoupon({
                  ...newCoupon,
                  code: e.target.value.toUpperCase(),
                })
              }
              placeholder="SAVE20"
              className="font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Will be automatically converted to uppercase
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-discount">Discount Percentage *</Label>
            <div className="relative">
              <Input
                id="new-discount"
                type="number"
                min="1"
                max="100"
                value={newCoupon.discount_percent}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    discount_percent: parseInt(e.target.value) || 0,
                  })
                }
                disabled={isLoading}
              />
              <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-max-redemptions">
              Max Redemptions (Optional)
            </Label>
            <Input
              id="new-max-redemptions"
              type="number"
              min="1"
              value={newCoupon.max_redemptions || ""}
              onChange={(e) =>
                setNewCoupon({
                  ...newCoupon,
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
            <Label htmlFor="new-expires">Expiry Date (Optional)</Label>
            <Input
              id="new-expires"
              type="datetime-local"
              value={newCoupon.expires_at}
              onChange={(e) =>
                setNewCoupon({ ...newCoupon, expires_at: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateCoupon} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCouponDialog;
