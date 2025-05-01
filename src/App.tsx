
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Dressage from "./pages/Dressage";
import Jumping from "./pages/Jumping";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
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

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dressage" element={<Dressage />} />
                <Route path="/jumping" element={<Jumping />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/profile-setup" element={<ProfileQuestionnaire />} />
                <Route path="/jump-profile-setup" element={<JumpProfileSetup />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
