
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO, getPageMetadata } from '@/lib/seo';

const NotFound = () => {
  const location = useLocation();
  const seoMetadata = getPageMetadata('not-found', { noIndex: true });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO {...seoMetadata} />
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-serif font-bold mb-4 text-gray-900">404</h1>
          <p className="text-xl text-gray-700 mb-8">Oops! We couldn't find the page you're looking for.</p>
          <Link to="/">
            <Button className="btn-equestrian">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
