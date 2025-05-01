
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
import { User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <DashboardHeader />
          <Button 
            className="text-purple-700 border-purple-200 hover:bg-purple-50 text-sm sm:text-base mt-2 sm:mt-0" 
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {language === 'en' ? 'View Profile' : 'Ver Perfil'}
          </Button>
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
