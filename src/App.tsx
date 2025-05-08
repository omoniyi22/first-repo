
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Analytics } from './components/layout/Analytics';

// Lazy-loaded pages
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
            <Analytics /> {/* Add analytics component */}
            <Routes>
              <Route path="/" element={<Index />} />
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
