
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileEdit,
  Users,
  Settings,
  FolderOpen,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      path: '/admin/blog', 
      label: 'Blog Management', 
      icon: <FileEdit className="w-5 h-5" /> 
    },
    { 
      path: '/admin/events', 
      label: 'Event Management', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      path: '/admin/users', 
      label: 'User Management', 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      path: '/admin/content', 
      label: 'Content', 
      icon: <FolderOpen className="w-5 h-5" /> 
    },
    { 
      path: '/admin/media', 
      label: 'Media Library', 
      icon: <ImageIcon className="w-5 h-5" /> 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: <Settings className="w-5 h-5" /> 
    },
  ];

  return (
    <div 
      className={cn(
        "bg-white h-screen shadow-md transition-all duration-300 flex flex-col border-r border-gray-200",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100",
                  collapsed && "justify-center"
                )
              }
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {!collapsed && "Back to Site"}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-center mt-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
