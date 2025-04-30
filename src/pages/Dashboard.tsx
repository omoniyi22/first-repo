
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentVideos from '@/components/dashboard/RecentVideos';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
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
      <main className="container mx-auto px-4 pt-24 pb-16">
        <DashboardHeader />
        <div className="mt-8">
          <DashboardStats />
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
