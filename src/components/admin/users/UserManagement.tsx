
import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
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
      // Fetch profiles from Supabase - in a real app with admin access,
      // you'd fetch from auth.users instead
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      // Use the profiles data to build our user objects
      const fetchedUsers: User[] = (profiles || []).map((profile: any) => ({
        id: profile.id || `user-${Math.random().toString(36).substr(2, 9)}`,
        email: `${profile.coach_name?.toLowerCase().replace(/\s+/g, '.') || 'user'}@example.com`,
        created_at: profile.created_at || new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        user_metadata: {
          full_name: profile.coach_name || `User ${Math.floor(Math.random() * 1000)}`
        },
        last_sign_in_at: profile.updated_at || null,
        role: Math.random() > 0.8 ? 'admin' : 'user',
        region: profile.region || 'Unknown',
        is_active: true
      }));

      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
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

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      // In a real app with admin access, you would update auth.users via admin API
      // For now, we're just updating our local state
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
            <SelectItem value="">All Regions</SelectItem>
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
            <SelectItem value="">All Roles</SelectItem>
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
