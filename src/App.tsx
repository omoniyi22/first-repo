
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import TestComponent from "./components/TestComponent";
import Index from "./pages/Index";
import Dressage from "./pages/Dressage";
import DressageSimple from "./components/DressageSimple";
import Jumping from "./pages/Jumping";
import HowItWorks from "./pages/HowItWorks";
import DressageHowItWorks from "./pages/DressageHowItWorks";
import JumpingHowItWorks from "./pages/JumpingHowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import Privacy from "./pages/Privacy";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProfileQuestionnaire from "./pages/ProfileQuestionnaire";
import JumpProfileSetup from "./pages/JumpProfileSetup";
import Analysis from "./pages/Analysis";

// Admin Routes
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBlog from "./pages/AdminBlog";
import AdminUsers from "./pages/AdminUsers";
import AdminContent from "./pages/AdminContent";
import AdminMedia from "./pages/AdminMedia";
import AdminSettings from "./pages/AdminSettings";

// Ensure we create the QueryClient outside of component render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HelmetProvider>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/test" element={<TestComponent />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/dressage" element={<Dressage />} />
                  <Route path="/dressage-simple" element={<DressageSimple />} />
                  <Route path="/jumping" element={<Jumping />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/dressage/how-it-works" element={<DressageHowItWorks />} />
                  <Route path="/jumping/how-it-works" element={<JumpingHowItWorks />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/profile-setup" element={<ProfileQuestionnaire />} />
                  <Route path="/jump-profile-setup" element={<JumpProfileSetup />} />
                  <Route path="/analysis" element={<Analysis />} />
                  
                  {/* Redirect old discipline-specific About routes to main About page */}
                  <Route path="/dressage/about" element={<Navigate to="/about" replace />} />
                  <Route path="/jumping/about" element={<Navigate to="/about" replace />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<Admin />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </HelmetProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
