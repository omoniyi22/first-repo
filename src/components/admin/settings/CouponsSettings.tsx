// CouponsSettings.tsx - Fixed Main Component
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Copy,
  Calendar,
  Percent,
  Users,
  Gift,
  AlertCircle,
} from "lucide-react";
import CreateCouponDialog from "./CreateCouponDialog";
import EditCouponDialog from "./EditCouponDialog";

// Types
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

// Table Components (inline for compatibility)
const Table = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b transition-colors hover:bg-gray-50">{children}</tr>
);

const TableHead = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-gray-600 ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <td className={`p-4 align-middle ${className}`}>{children}</td>;

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "secondary";
}) => {
  const variants = {
    default: "bg-blue-100 text-blue-800 border-blue-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </div>
  );
};

// Main Component
const CouponsSettings = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);

      // Fetch coupons
      const { data: couponsData, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get usage count for each coupon
      const couponsWithUsage = await Promise.all(
        (couponsData || []).map(async (coupon) => {
          const { count, data } = await supabase
            .from("user_subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("coupon_id", coupon.id);

          return {
            ...coupon,
            current_redemptions: count || 0,
          };
        })
      );

      setCoupons(couponsWithUsage);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", couponId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coupon "${couponCode}" deleted successfully`,
      });

      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  // UTILITY FUNCTIONS
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `Coupon code "${text}" copied to clipboard`,
    });
  };

  const isExpired = (expiresAt: string | null | undefined): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxedOut = (coupon: Coupon): boolean => {
    if (!coupon.max_redemptions) return false;
    return (coupon.current_redemptions || 0) >= coupon.max_redemptions;
  };

  const getCouponStatus = (coupon: Coupon): "active" | "expired" | "maxed" => {
    if (isExpired(coupon.expires_at)) return "expired";
    if (isMaxedOut(coupon)) return "maxed";
    return "active";
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Coupons Management
          </h1>
          <p className="text-gray-500">
            Create and manage discount coupons for subscription plans
          </p>
        </div>
        <CreateCouponDialog onCouponCreated={fetchCoupons} />
      </div>

      {/* Quick Stats */}
      {coupons.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {coupons.length}
                </div>
                <div className="text-sm text-gray-500">Total Coupons</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    coupons.filter((c) => getCouponStatus(c) === "active")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    coupons.filter((c) => getCouponStatus(c) === "expired")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">Expired</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {coupons.reduce(
                    (sum, c) => sum + (c.current_redemptions || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-500">Total Uses</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            Manage your discount coupons and track their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {coupon.discount_percent}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>
                            {coupon.current_redemptions || 0}
                            {coupon.max_redemptions &&
                              ` / ${coupon.max_redemptions}`}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {coupon.expires_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span
                              className={
                                isExpired(coupon.expires_at)
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              {formatDate(coupon.expires_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            status === "active"
                              ? "default"
                              : status === "expired"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {status === "active" && (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          {status === "expired" && (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {status === "maxed" && (
                            <Users className="h-3 w-3 mr-1" />
                          )}
                          {status === "active"
                            ? "Active"
                            : status === "expired"
                            ? "Expired"
                            : "Maxed Out"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDate(coupon.created_at)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Coupon
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the coupon "
                                  {coupon.code}"? This action cannot be undone
                                  and may affect users who have this coupon
                                  saved.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCoupon(coupon.id, coupon.code)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Coupon
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No coupons found
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first discount coupon to get started
              </p>
              <CreateCouponDialog onCouponCreated={fetchCoupons} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditCouponDialog
        coupon={editingCoupon}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onCouponUpdated={fetchCoupons}
      />
    </div>
  );
};

export default CouponsSettings;
