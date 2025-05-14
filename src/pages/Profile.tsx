import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PerformanceOverview from "@/components/profile/PerformanceOverview";
import RecentTests from "@/components/profile/RecentTests";
import UpcomingEvents from "@/components/profile/UpcomingEvents";
import Horses from "@/components/profile/Horses";
import Goals from "@/components/profile/Goals";
import TrainingFocus from "@/components/profile/TrainingFocus";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEO, getPageMetadata } from "@/lib/seo";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Get profile SEO metadata
  const seoMetadata = getPageMetadata("profile", {
    // Add noindex tag since this is a private page
    noIndex: true,
  });

  // If not logged in and not loading, redirect to sign in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in");
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
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-purple-900">
            {language === "en" ? "Your Profile" : "Tu Perfil"}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="text-white bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
              onClick={() => navigate("/analysis")}
            >
              <Upload className="mr-2 h-4 w-4" />
              {language === "en" ? "Upload Test" : "Subir Prueba"}
            </Button>
            <Button
              variant="outline"
              className="text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-700 text-sm sm:text-base"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {language === "en" ? "Dashboard" : "Panel"}
            </Button>
          </div>
        </div>

        <ProfileHeader />
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
