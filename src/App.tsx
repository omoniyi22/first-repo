
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Analytics from "@/components/layout/Analytics";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

// Pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Analysis from "@/pages/Analysis";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Pricing from "@/pages/Pricing";
import Events from "@/pages/Events";
import TermsOfService from "@/pages/TermsOfService";
import Privacy from "@/pages/Privacy";
import ProfileQuestionnaire from "@/pages/ProfileQuestionnaire";
import JumpProfileSetup from "@/pages/JumpProfileSetup";
import Dressage from "@/pages/Dressage";
import Jumping from "@/pages/Jumping";
import HowItWorks from "@/pages/HowItWorks";
import DressageHowItWorks from "@/pages/DressageHowItWorks";
import JumpingHowItWorks from "@/pages/JumpingHowItWorks";
import EquestrianAbout from "@/pages/EquestrianAbout";
import DressageAbout from "@/pages/DressageAbout";
import JumpingAbout from "@/pages/JumpingAbout";

// Admin pages
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminBlog from "@/pages/AdminBlog";
import AdminEvents from "@/pages/AdminEvents";
import AdminUsers from "@/pages/AdminUsers";
import AdminContent from "@/pages/AdminContent";
import AdminMedia from "@/pages/AdminMedia";
import AdminSettings from "@/pages/AdminSettings";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

// In a real app, this should be loaded from your backend
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <LanguageProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <Router>
                <Analytics />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />

                  {/* Discipline-specific routes */}
                  <Route path="/dressage" element={<Dressage />} />
                  <Route path="/jumping" element={<Jumping />} />
                  <Route path="/dressage/how-it-works" element={<DressageHowItWorks />} />
                  <Route path="/jumping/how-it-works" element={<JumpingHowItWorks />} />
                  <Route path="/equestrian/about" element={<EquestrianAbout />} />
                  <Route path="/dressage/about" element={<DressageAbout />} />
                  <Route path="/jumping/about" element={<JumpingAbout />} />

                  {/* Protected user routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile-questionnaire" element={<ProfileQuestionnaire />} />
                  <Route path="/jump-profile-setup" element={<JumpProfileSetup />} />
                  <Route path="/analysis" element={<Analysis />} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<Admin />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <SonnerToaster />
              </Router>
            </SubscriptionProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
