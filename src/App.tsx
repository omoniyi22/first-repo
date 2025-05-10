
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dressage from './pages/Dressage';
import Jumping from './pages/Jumping';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import EquestrianAbout from './pages/EquestrianAbout';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import TermsOfService from './pages/TermsOfService';
import Privacy from './pages/Privacy';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import JumpProfileSetup from './pages/JumpProfileSetup';
import Analysis from './pages/Analysis';
import NotFound from './pages/NotFound';
import Analytics from './components/layout/Analytics';

const App = () => {
  return (
    <>
      <Analytics /> {/* Add analytics tracking */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dressage" element={<Dressage />} />
          <Route path="/jumping" element={<Jumping />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<EquestrianAbout />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile-setup" element={<Profile />} />
          <Route path="/jump-profile-setup" element={<JumpProfileSetup />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
