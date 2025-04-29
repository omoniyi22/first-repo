
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
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
  
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account."
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-purple-950/90 backdrop-blur-md shadow-md' : 'bg-purple-950/50 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className={`font-serif text-xl font-semibold text-white`}>
              AI Dressage Trainer
            </h1>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''} text-white`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`nav-link ${isActive('/how-it-works') ? 'active' : ''} text-white`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link ${isActive('/pricing') ? 'active' : ''} text-white`}
            >
              Pricing
            </Link>
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'active' : ''} text-white`}
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''} text-white`}
            >
              About
            </Link>
            
            {user ? (
              <div className="flex items-center ml-3 space-x-4">
                <div className="text-white">
                  <UserCircle className="inline-block h-5 w-5 mr-1" />
                  <span className="hidden lg:inline-block">{user.email?.split('@')[0]}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-purple-900"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button 
                    variant="outline" 
                    className="ml-3 border-white text-purple-950 bg-white hover:bg-purple-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-in?signup=true">
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-950/95 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-white text-lg font-medium ${isActive('/') ? 'text-purple-300' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`text-white text-lg font-medium ${isActive('/how-it-works') ? 'text-purple-300' : ''}`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`text-white text-lg font-medium ${isActive('/pricing') ? 'text-purple-300' : ''}`}
            >
              Pricing
            </Link>
            <Link 
              to="/blog" 
              className={`text-white text-lg font-medium ${isActive('/blog') ? 'text-purple-300' : ''}`}
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className={`text-white text-lg font-medium ${isActive('/about') ? 'text-purple-300' : ''}`}
            >
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-3">
              {user ? (
                <>
                  <div className="text-white py-2">
                    <UserCircle className="inline-block h-5 w-5 mr-2" />
                    {user.email}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-white text-white hover:bg-purple-900"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full border-white text-purple-950 bg-white hover:bg-purple-50"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/sign-in?signup=true" className="w-full">
                    <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
