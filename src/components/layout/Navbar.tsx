
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-navy-900 font-serif text-2xl font-semibold">
              AI Dressage Trainer
            </h1>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
            <Link to="/sign-in">
              <Button 
                variant="outline" 
                className="ml-3 border-navy-800 text-navy-800 hover:bg-navy-50"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/sign-in?signup=true">
              <Button className="bg-navy-700 hover:bg-navy-800">
                Get Started
              </Button>
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-navy-800" />
            ) : (
              <Menu className="h-6 w-6 text-navy-800" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-navy-900 text-lg font-medium ${isActive('/') ? 'text-navy-600' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`text-navy-900 text-lg font-medium ${isActive('/how-it-works') ? 'text-navy-600' : ''}`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`text-navy-900 text-lg font-medium ${isActive('/pricing') ? 'text-navy-600' : ''}`}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`text-navy-900 text-lg font-medium ${isActive('/about') ? 'text-navy-600' : ''}`}
            >
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-3">
              <Link to="/sign-in" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full border-navy-800 text-navy-800 hover:bg-navy-50"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-in?signup=true" className="w-full">
                <Button className="w-full bg-navy-700 hover:bg-navy-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
