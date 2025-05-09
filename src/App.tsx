
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Analytics from './components/layout/Analytics';

// Lazy-loaded pages
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const EquestrianAbout = lazy(() => import('./pages/EquestrianAbout'));
const Dressage = lazy(() => import('./pages/Dressage'));
const DressageAbout = lazy(() => import('./pages/DressageAbout'));
const DressageHowItWorks = lazy(() => import('./pages/DressageHowItWorks'));
const Jumping = lazy(() => import('./pages/Jumping'));
const JumpingAbout = lazy(() => import('./pages/JumpingAbout'));
const JumpingHowItWorks = lazy(() => import('./pages/JumpingHowItWorks'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost')); // Import BlogPost page
const Admin = lazy(() => import('./pages/Admin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminMedia = lazy(() => import('./pages/AdminMedia'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Skeleton loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-900"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <Suspense fallback={<Loading />}>
            <Analytics />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} /> {/* Add BlogPost route */}
              <Route path="/sign-in" element={<SignIn />} />
              
              {/* Dressage routes */}
              <Route path="/dressage" element={<Dressage />} />
              <Route path="/dressage/about" element={<DressageAbout />} />
              <Route path="/dressage/how-it-works" element={<DressageHowItWorks />} />
              
              {/* Jumping routes */}
              <Route path="/jumping" element={<Jumping />} />
              <Route path="/jumping/about" element={<JumpingAbout />} />
              <Route path="/jumping/how-it-works" element={<JumpingHowItWorks />} />
              
              {/* Authentication required routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile-setup" element={<Profile />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Admin />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Suspense>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
