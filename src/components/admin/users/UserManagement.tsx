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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching all users from auth system...");
      
      // Fetch users directly from auth.users using service role (bypassing RLS)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        throw authError;
      }
      
      console.log("Fetched auth users:", authUsers);
      
      if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
        console.warn("No users found in the auth system");
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        toast({
          title: "No users found",
          description: "There are no users in the authentication system.",
          variant: "destructive"
        });
        return;
      }
      
      // Fetch profiles to get additional user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      console.log("Fetched profiles:", profiles || []);
      
      // Create a map of profiles by user ID for easy lookup
      const profilesMap = new Map();
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }
      
      // Process each auth user and combine with profile data if available
      const fetchedUsers: User[] = [];
      
      for (const authUser of authUsers.users) {
        try {
          console.log("Processing user:", authUser.id);
          
          // Get the profile for this user if it exists
          const userProfile = profilesMap.get(authUser.id);
          
          // Check if the user is an admin using the is_admin RPC function
          const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin', {
            user_uuid: authUser.id
          });
          
          if (roleError) {
            console.error(`Error checking role for ${authUser.id}:`, roleError);
          }
          
          console.log(`User ${authUser.id} admin status:`, isAdmin);
          
          // Create a user object that combines auth data and profile data
          const userObj: User = {
            id: authUser.id,
            email: authUser.email || `user-${authUser.id.substring(0, 8)}@example.com`,
            created_at: authUser.created_at || new Date().toISOString(),
            user_metadata: {
              full_name: (userProfile?.coach_name || 
                         authUser.user_metadata?.full_name || 
                         authUser.user_metadata?.name || 
                         `User ${authUser.id.substring(0, 5)}`)
            },
            last_sign_in_at: authUser.last_sign_in_at,
            role: isAdmin ? 'admin' : 'user',
            region: userProfile?.region || 'Unknown',
            is_active: !authUser.banned
          };
          
          fetchedUsers.push(userObj);
        } catch (error) {
          console.error('Error processing user:', authUser.id, error);
        }
      }
      
      console.log("Processed users:", fetchedUsers);
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      
      toast({
        title: "Users loaded",
        description: `${fetchedUsers.length} users retrieved successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: "Please try again later.",
        variant: "destructive"
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
        user => 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.user_metadata.full_name && 
           user.user_metadata.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (regionFilter && regionFilter !== "all") {
      result = result.filter(user => user.region === regionFilter);
    }
    
    if (roleFilter && roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, regionFilter, roleFilter, users]);

  // Add function to set admin role for a user using the database function
  const setAdminRole = async (email: string) => {
    try {
      // Call the database function to set admin role
      const { data, error } = await supabase.rpc('set_admin_role', {
        email_address: email
      });
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: "Admin role assigned",
          description: `${email} has been granted admin privileges.`,
          variant: "default"
        });
        
        // Refresh users to show updated role
        fetchUsers();
      } else {
        toast({
          title: "User not found",
          description: `No user found with email ${email}. They need to register first.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting admin role:', error);
      toast({
        title: "Error assigning admin role",
        description: "Make sure you have the necessary permissions.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      // Update profile in the database if we're changing user data
      if (userData.user_metadata?.full_name || userData.region) {
        const updateData: any = {};
        
        // Map user properties to profile fields
        if (userData.user_metadata?.full_name) {
          updateData.coach_name = userData.user_metadata.full_name;
        }
        
        if (userData.region) {
          updateData.region = userData.region;
        }
        
        // Update the profile
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
          
        if (error) throw error;
      }
      
      // If role is changing, update the role using our function
      if (userData.role === 'admin') {
        // Get the email to use with set_admin_role
        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate?.email) {
          await setAdminRole(userToUpdate.email);
        }
      }

      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));

      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error updating user",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Get unique regions from the user data
  const regions = Array.from(new Set(users.map(user => user.region || 'Unknown'))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
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
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
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
        <Button 
          variant="outline" 
          onClick={fetchUsers} 
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={() => setAdminRole('jenny@appetitecreative.com')}
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
