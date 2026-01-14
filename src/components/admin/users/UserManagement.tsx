import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  UserPlus,
  CreditCard,
  Calendar,
  Crown,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import EditUserModal from "./EditUserModal";

export interface PricingPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  max_horses: number;
}

export interface UserSubscription {
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

export interface User {
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

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching users with subscriptions...");

      // First get users via Edge Function
      const { data: usersData, error: usersError } =
        await supabase.functions.invoke("get-admin-users");

      if (usersError) {
        console.error("Error calling Edge Function:", usersError);
        throw usersError;
      }
      console.log("🚀 ~ fetchUsers ~ usersData:", usersData);

      if (!usersData || !usersData.users || usersData.users.length === 0) {
        console.warn("No users found via Edge Function");
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        return;
      }

      // Get user IDs for subscription lookup
      const userIds = usersData.users.map((u) => u.id);

      // Fetch subscriptions for all users with plan details
      const { data: subscriptionsData, error: subscriptionsError } =
        await supabase
          .from("user_subscriptions")
          .select(
            `
          *,
          pricing_plans (
            id,
            name,
            monthly_price,
            annual_price,
            max_horses
          ),
          coupons (
            code,
            discount_percent
          )
        `
          )
          .in("user_id", userIds)
          .eq("is_active", true);

      if (subscriptionsError) {
        console.error("Error fetching subscriptions:", subscriptionsError);
        // Continue without subscriptions data rather than failing completely
      }

      // Process the user data with subscriptions
      const fetchedUsers: User[] = usersData.users.map((user) => {
        const userProfile = user.profile || {};

        // Find active subscription for this user
        const userSubscription = subscriptionsData?.find(
          (sub) => sub.user_id === user.id && sub.is_active
        );

        return {
          id: user.id,
          email: user.email || `user-${user.id.substring(0, 8)}@example.com`,
          created_at: user.created_at || new Date().toISOString(),
          user_metadata: {
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              `User ${user.id.substring(0, 5)}`,
          },
          last_sign_in_at: user.last_sign_in_at,
          role: userProfile.role === "admin" ? "admin" : "user",
          region: userProfile.region || "Unknown",
          is_active: !user.banned_at,
          subscription: userSubscription || null,
        };
      });

      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setCurrentPage(1); // Reset to first page when data refreshes

      toast({
        title: "Users loaded",
        description: `${fetchedUsers.length} users retrieved with subscription data.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.user_metadata.full_name &&
            user.user_metadata.full_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Region filter
    if (regionFilter && regionFilter !== "all") {
      result = result.filter((user) => user.region === regionFilter);
    }

    // Role filter
    if (roleFilter && roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Subscription filter
    if (subscriptionFilter && subscriptionFilter !== "all") {
      result = result.filter((user) => {
        switch (subscriptionFilter) {
          case "active":
            return user.subscription?.is_active;
          case "trial":
            return user.subscription?.is_trial;
          case "expired":
            return user.subscription && !user.subscription.is_active;
          case "none":
            return !user.subscription;
          default:
            return true;
        }
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, regionFilter, roleFilter, subscriptionFilter, users]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Open edit modal
  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Handle user updated callback
  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the users list
  };

  const setAdminRole = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "update-user-profile",
        {
          body: {
            updateData: {
              role: "admin",
              email: email,
            },
            requestingUserId: user?.id,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Admin role assigned",
          description: `${email} has been granted admin privileges.`,
          variant: "default",
        });
        fetchUsers();
      } else {
        toast({
          title: "User not found",
          description: `No user found with email ${email}. They need to register first.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error setting admin role:", error);
      toast({
        title: "Error assigning admin role",
        description: "Make sure you have the necessary permissions.",
        variant: "destructive",
      });
    }
  };

  // Helper function to get subscription status badge
  const getSubscriptionStatus = (user: User) => {
    if (!user.subscription) {
      return { label: "No Plan", color: "bg-gray-100 text-gray-800" };
    }

    if (user.subscription.is_trial) {
      return { label: "Trial", color: "bg-blue-100 text-blue-800" };
    }

    if (user.subscription.is_active) {
      return { label: "Active", color: "bg-green-100 text-green-800" };
    }

    return { label: "Expired", color: "bg-red-100 text-red-800" };
  };

  // Helper function to check if subscription is ending soon
  const isSubscriptionEndingSoon = (subscription: UserSubscription | null) => {
    if (!subscription || !subscription.ends_at) return false;

    const endDate = new Date(subscription.ends_at);
    const now = new Date();
    const daysUntilEnd = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  };

  // Get unique regions from the user data
  const regions = Array.from(
    new Set(users.map((user) => user.region || "Unknown"))
  ).filter(Boolean);

  // Get subscription statistics
  const subscriptionStats = {
    total: users.length,
    active: users.filter((u) => u.subscription?.is_active).length,
    trial: users.filter((u) => u.subscription?.is_trial).length,
    expired: users.filter((u) => u.subscription && !u.subscription.is_active)
      .length,
    none: users.filter((u) => !u.subscription).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          User Management
        </h1>
        <p className="text-gray-500">
          Manage user accounts, permissions, and subscriptions
        </p>
      </div>

      {/* Subscription Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {subscriptionStats.total}
          </div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {subscriptionStats.active}
          </div>
          <div className="text-sm text-gray-500">Active Subs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {subscriptionStats.trial}
          </div>
          <div className="text-sm text-gray-500">On Trial</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {subscriptionStats.expired}
          </div>
          <div className="text-sm text-gray-500">Expired</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">
            {subscriptionStats.none}
          </div>
          <div className="text-sm text-gray-500">No Plan</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={subscriptionFilter}
          onValueChange={setSubscriptionFilter}
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Filter by subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscriptions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="none">No Plan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchUsers} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        <Button
          onClick={() => setAdminRole("jenny@appetitecreative.com")}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Jenny as Admin
        </Button>
      </div>

      {/* Enhanced Users List */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="animate-spin h-6 w-6 text-gray-400 mr-2" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const subscriptionStatus = getSubscriptionStatus(user);
                  const isEndingSoon = isSubscriptionEndingSoon(
                    user.subscription
                  );

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.user_metadata.full_name?.charAt(0) ||
                                  user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.user_metadata.full_name || "No name"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "admin" && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {user.role || "user"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscriptionStatus.color}`}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {subscriptionStatus.label}
                          </span>
                          {user.subscription && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.subscription.pricing_plans.name} - £
                              {user.subscription.pricing_plans.monthly_price}/mo
                              {user.subscription.coupons && (
                                <span className="text-green-600 ml-1">
                                  ({user.subscription.coupons.discount_percent}%
                                  off)
                                </span>
                              )}
                            </div>
                          )}
                          {isEndingSoon && (
                            <div className="text-xs text-orange-600 mt-1 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Ends soon
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.region}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              }
                            )
                          : "Never"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </span>
              <Select
                value={usersPerPage.toString()}
                onValueChange={(value) => {
                  setUsersPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {/* Show page numbers intelligently */}
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  )
                ) : (
                  // Smart pagination for many pages
                  <>
                    {/* First page */}
                    <Button
                      variant={currentPage === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(1)}
                      className="w-8 h-8 p-0"
                    >
                      1
                    </Button>

                    {/* Left ellipsis */}
                    {currentPage > 3 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}

                    {/* Middle pages */}
                    {Array.from({ length: 5 }, (_, i) => {
                      let pageNum;
                      if (currentPage <= 3) {
                        pageNum = i + 2;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      if (pageNum > 1 && pageNum < totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              currentPage === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}

                    {/* Right ellipsis */}
                    {currentPage < totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}

                    {/* Last page */}
                    <Button
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default UserManagement;
