
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
      // Call the Supabase function to check if the user is an admin
      const { data, error } = await supabase.rpc('is_admin', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      
      const isAdmin = !!data;
      
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
      toast({
        title: "Error",
        description: "Failed to verify admin status. Please try again.",
        variant: "destructive"
      });
      navigate('/dashboard');
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
