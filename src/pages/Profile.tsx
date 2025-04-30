
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PerformanceOverview from '@/components/profile/PerformanceOverview';
import RecentTests from '@/components/profile/RecentTests';
import UpcomingEvents from '@/components/profile/UpcomingEvents';
import Horses from '@/components/profile/Horses';
import Goals from '@/components/profile/Goals';
import TrainingFocus from '@/components/profile/TrainingFocus';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
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

  // Only render the profile if we have a user
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <ProfileHeader />
        
        {/* Performance Overview */}
        <div className="mt-8">
          <PerformanceOverview />
        </div>
        
        {/* Main content layout - two columns for desktop, single column for mobile */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Horses Section */}
            <Horses />
            
            {/* Recent Tests Section */}
            <RecentTests />
          </div>
          
          {/* Side column - 1/3 width on desktop */}
          <div className="space-y-8">
            {/* Upcoming Events Section */}
            <UpcomingEvents />
            
            {/* Goals Section */}
            <Goals />
            
            {/* Training Focus Section */}
            <TrainingFocus />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
