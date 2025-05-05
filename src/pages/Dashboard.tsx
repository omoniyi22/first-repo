
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentVideos from '@/components/dashboard/RecentVideos';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Upload, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO, getPageMetadata } from '@/lib/seo';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Get dashboard SEO metadata
  const seoMetadata = getPageMetadata('dashboard', {
    // Add noindex tag since this is a private page
    noIndex: true
  });
  
  // If not logged in and not loading, redirect to sign in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in');
    }
  }, [user, loading, navigate]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show nothing while checking auth status
  if (loading) {
    return null;
  }

  // Only render the dashboard if we have a user
  if (!user) {
    return null;
  }

  // Check if user is an admin (by email or role)
  const isAdmin = user.email === 'jenny@appetitecreative.com' || 
                  user.user_metadata?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <DashboardHeader />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="text-white bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
              onClick={() => navigate('/analysis')}
            >
              <Upload className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Upload Test' : 'Subir Prueba'}
            </Button>
            <Button 
              variant="outline" 
              className="text-purple-700 border-purple-200 hover:bg-purple-50 text-sm sm:text-base"
              onClick={() => navigate('/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              {language === 'en' ? 'View Profile' : 'Ver Perfil'}
            </Button>
            
            {isAdmin && (
              <Button 
                variant="outline" 
                className="text-blue-700 border-blue-200 hover:bg-blue-50 text-sm sm:text-base"
                onClick={() => navigate('/admin')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>
        <DashboardStats />
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <RecentVideos />
          </div>
          <div>
            <UpcomingEvents />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
