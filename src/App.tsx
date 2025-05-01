
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import TestComponent from "./components/TestComponent";
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
import DressageAbout from "./pages/DressageAbout";
import JumpingAbout from "./pages/JumpingAbout";
import EquestrianAbout from "./pages/EquestrianAbout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestComponent />} />
        <Route path="/real" element={
          <HelmetProvider>
            <AuthProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Index />
                </TooltipProvider>
              </LanguageProvider>
            </AuthProvider>
          </HelmetProvider>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
