
import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Mail, MoreVertical, Shield, UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User } from '@/components/admin/users/UserManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UserDetailsForm from '@/components/admin/users/UserDetailsForm';
import { Skeleton } from '@/components/ui/skeleton';

interface UsersListProps {
  users: User[];
  onUpdateUser: (userId: string, userData: Partial<User>) => void;
  loading: boolean;
}

const UsersList = ({ users, onUpdateUser, loading }: UsersListProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMountedRef = useRef(true);

  // Add a cleanup effect when the component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleEditUser = useCallback((user: User) => {
    console.log('Opening edit dialog for user:', user.id);
    if (isMountedRef.current) {
      // Set the selected user first
      setSelectedUser(user);
      // Then open the dialog with a slight delay to ensure React has updated the state
      setTimeout(() => {
        if (isMountedRef.current) {
          console.log('Setting dialog open to true');
          setDialogOpen(true);
        }
      }, 50);
    }
  }, []);

  const handleSaveUser = useCallback((userData: Partial<User>) => {
    if (selectedUser) {
      onUpdateUser(selectedUser.id, userData);
      handleCloseDialog();
    }
  }, [selectedUser, onUpdateUser]);
  
  const handleCloseDialog = useCallback(() => {
    console.log('Closing dialog');
    if (isMountedRef.current) {
      setDialogOpen(false);
    }
  }, []);

  // Reset selected user when dialog is closed
  useEffect(() => {
    if (!dialogOpen && selectedUser) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setSelectedUser(null);
          console.log('Selected user cleared');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [dialogOpen, selectedUser]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Debug user effect
  useEffect(() => {
    console.log('Current state - selectedUser:', selectedUser?.id, 'dialogOpen:', dialogOpen);
  }, [selectedUser, dialogOpen]);

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Region</TableHead>
              <TableHead className="hidden md:table-cell">Last Sign In</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array(5).fill(0).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.user_metadata.full_name || 'Unnamed User'}
                        </div>
                        <div className="text-xs text-gray-500 md:hidden">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge
                        variant={user.role === 'admin' ? 'outline' : 'secondary'}
                        className={
                          user.role === 'admin'
                            ? 'border-purple-200 bg-purple-50 text-purple-900'
                            : ''
                        }
                      >
                        {user.role === 'admin' && (
                          <Shield className="mr-1 h-3 w-3" />
                        )}
                        {user.role || 'User'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.region || 'Unknown'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-3 w-3 text-gray-400" />
                      {formatDate(user.last_sign_in_at)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={user.is_active ? 'default' : 'secondary'}
                      className={
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleEditUser(user)}
                        >
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onUpdateUser(user.id, { is_active: !user.is_active })}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controlled Dialog component with debugging */}
      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          console.log("Dialog open state changed to:", open);
          if (!open) {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => {
            // Prevent close on outside click
            console.log("Interaction outside dialog prevented");
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            console.log("Escape key pressed, closing dialog");
            e.preventDefault();
            handleCloseDialog();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user account here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserDetailsForm
              user={selectedUser}
              onSave={handleSaveUser}
              onCancel={handleCloseDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersList;
