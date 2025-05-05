
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SEO, getPageMetadata } from '@/lib/seo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // SEO metadata for admin dashboard (with noindex)
  const seoMetadata = getPageMetadata('admin', {
    noIndex: true
  });
  
  // Check if user has admin privileges
  const checkAdmin = async () => {
    if (!user) return false;
    
    try {
      // Check if the user is jenny@appetitecreative.com or has admin role
      const isJenny = user.email === 'jenny@appetitecreative.com';
      
      // Check for admin role in user metadata
      const hasAdminRole = user.user_metadata?.role === 'admin';
      
      // Only allow access to jenny or users with admin role
      const isAdmin = isJenny || hasAdminRole;
      
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area.",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
      
      return isAdmin;
    } catch (error) {
      console.error("Failed to verify admin status:", error);
      return false;
    }
  };
  
  useEffect(() => {
    // If not logged in and not loading, redirect to sign in
    if (!loading && !user) {
      navigate('/sign-in');
    } 
    // If logged in, check admin status
    else if (!loading && user) {
      checkAdmin();
    }
  }, [user, loading, navigate]);

  // Show nothing while checking auth status
  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SEO {...seoMetadata} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
