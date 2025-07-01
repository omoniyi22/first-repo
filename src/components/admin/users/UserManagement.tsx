import { useState, useEffect } from "react";
import { Search, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UsersList from "@/components/admin/users/UsersList";
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
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching users via Edge Function...");

      // Call the Edge Function to get users
      const { data, error } = await supabase.functions.invoke(
        "get-admin-users"
      );

      if (error) {
        console.error("Error calling Edge Function:", error);
        throw error;
      }

      if (!data || !data.users || data.users.length === 0) {
        console.warn("No users found via Edge Function");
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        toast({
          title: "No users found",
          description: "There are no users in the system.",
          variant: "destructive",
        });
        return;
      }

      // Process the user data
      const fetchedUsers: User[] = data.users.map((user) => {
        const userProfile = user.profile || {};

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
          is_active: !user.banned_at, // Using banned_at instead of banned
        };
      });

      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);

      toast({
        title: "Users loaded",
        description: `${fetchedUsers.length} users retrieved successfully.`,
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

    if (regionFilter && regionFilter !== "all") {
      result = result.filter((user) => user.region === regionFilter);
    }

    if (roleFilter && roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, regionFilter, roleFilter, users]);

  // Updated function to use the secure edge function
  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      // console.log("Updating user:", userId, userData);

      if (!user) {
        throw new Error("You must be logged in to update users");
      }

      const updatePayload: {
        profile: Record<string, any>;
        role?: string;
        email?: string;
      } = {
        profile: {},
      };

      // Handle profile fields
      if (userData.user_metadata?.full_name) {
        updatePayload.profile.coach_name = userData.user_metadata.full_name;
      }

      if (userData.region) {
        updatePayload.profile.region = userData.region;
      }

      // Handle role change - directly pass the role value in the update payload
      if (userData.role) {
        updatePayload.role = userData.role;
        const userToUpdate = users.find((u) => u.id === userId);
        if (userToUpdate?.email) {
          updatePayload.email = userToUpdate.email;
        }
      }

      // console.log("Sending update to edge function:", updatePayload);

      // Call the secure edge function for updates
      const { data, error } = await supabase.functions.invoke(
        "update-user-profile",
        {
          body: {
            userId,
            updateData: updatePayload,
            requestingUserId: user.id,
          },
        }
      );

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      // console.log("Edge function response:", data);

      if (!data || !data.success) {
        throw new Error(data?.message || "Failed to update user");
      }

      // Update the local state with the new data
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, ...userData } : u))
      );

      // console.log("User updated successfully");

      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });

      // Fetch users again to ensure the updated data is displayed
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Add function to set admin role for a user using the database function
  const setAdminRole = async (email: string) => {
    try {
      // Call the secure edge function
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

        // Refresh users to show updated role
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

  // Get unique regions from the user data
  const regions = Array.from(
    new Set(users.map((user) => user.region || "Unknown"))
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          User Management
        </h1>
        <p className="text-gray-500">Manage user accounts and permissions</p>
      </div>

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

      <UsersList
        users={filteredUsers}
        onUpdateUser={handleUpdateUser}
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;
