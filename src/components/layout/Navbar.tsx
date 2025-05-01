
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { language, translations } = useLanguage();
  const t = translations[language];
  
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

  const handleProfileClick = () => {
    navigate('/profile-setup');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  // Determine brand name based on current route
  const getBrandName = () => {
    if (location.pathname.startsWith('/dressage')) {
      return language === 'en' ? 'AI Dressage Trainer' : 'Entrenador AI de Doma';
    } else if (location.pathname.startsWith('/jumping')) {
      return language === 'en' ? 'AI Jumping Trainer' : 'Entrenador AI de Salto';
    } else {
      return language === 'en' ? 'AI Equestrian' : 'AI Ecuestre';
    }
  };

  // Determine brand color based on current route
  const getBrandColorClass = () => {
    if (location.pathname.startsWith('/jumping')) {
      return 'text-white';  // Blue theme
    } else if (location.pathname.startsWith('/dressage')) {
      return 'text-white';  // Purple theme
    } else {
      return 'text-white';  // Default theme
    }
  };

  // Determine which "About" link to show based on current route
  const getAboutLink = () => {
    if (location.pathname.startsWith('/dressage')) {
      return '/dressage/about';
    } else if (location.pathname.startsWith('/jumping')) {
      return '/jumping/about';
    } else {
      return '/about';
    }
  };

  // Determine which "How It Works" link to show based on current route
  const getHowItWorksLink = () => {
    if (location.pathname.startsWith('/dressage')) {
      return '/dressage/how-it-works';
    } else if (location.pathname.startsWith('/jumping')) {
      return '/jumping/how-it-works';
    } else {
      return '/how-it-works';
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
            <h1 className={`font-serif text-xl font-semibold ${getBrandColorClass()}`}>
              {getBrandName()}
            </h1>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''} text-white`}
            >
              {t["home"]}
            </Link>
            <Link 
              to={getHowItWorksLink()} 
              className={`nav-link ${isActive('/how-it-works') ? 'active' : ''} text-white`}
            >
              {t["how-it-works"]}
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link ${isActive('/pricing') ? 'active' : ''} text-white`}
            >
              {t["pricing"]}
            </Link>
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'active' : ''} text-white`}
            >
              {t["blog"]}
            </Link>
            <Link 
              to={getAboutLink()}
              className={`nav-link ${isActive('/about') ? 'active' : ''} text-white`}
            >
              {t["about"]}
            </Link>
            
            {user ? (
              <div className="flex items-center ml-3 space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''} text-white`}
                >
                  {t["dashboard"]}
                </Link>
                
                {/* User dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center text-white focus:outline-none">
                    <UserCircle className="h-5 w-5 mr-1" />
                    <span className="hidden lg:inline-block">{user.email?.split('@')[0]}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      <span>{t["profile-setup"]}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>{t["dashboard"]}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>{t["sign-out"]}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button 
                    variant="outline" 
                    className="ml-3 border-white text-purple-950 bg-white hover:bg-purple-50"
                  >
                    {t["sign-in"]}
                  </Button>
                </Link>
                <Link to="/sign-in?signup=true">
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white">
                    {t["get-started"]}
                  </Button>
                </Link>
              </>
            )}
            
            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </nav>
          
          {/* Mobile menu button and language switcher */}
          <div className="md:hidden flex items-center">
            <LanguageSwitcher />
            <button 
              className="ml-4"
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
      </div>
      
      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-purple-950/95 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-white text-lg font-medium ${isActive('/') ? 'text-purple-300' : ''}`}
            >
              {t["home"]}
            </Link>
            <Link 
              to={getHowItWorksLink()}
              className={`text-white text-lg font-medium ${isActive('/how-it-works') ? 'text-purple-300' : ''}`}
            >
              {t["how-it-works"]}
            </Link>
            <Link 
              to="/pricing" 
              className={`text-white text-lg font-medium ${isActive('/pricing') ? 'text-purple-300' : ''}`}
            >
              {t["pricing"]}
            </Link>
            <Link 
              to="/blog" 
              className={`text-white text-lg font-medium ${isActive('/blog') ? 'text-purple-300' : ''}`}
            >
              {t["blog"]}
            </Link>
            <Link 
              to={getAboutLink()}
              className={`text-white text-lg font-medium ${isActive('/about') ? 'text-purple-300' : ''}`}
            >
              {t["about"]}
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-white text-lg font-medium ${isActive('/dashboard') ? 'text-purple-300' : ''}`}
                >
                  {t["dashboard"]}
                </Link>
                <Link 
                  to="/profile-setup" 
                  className={`text-white text-lg font-medium ${isActive('/profile-setup') ? 'text-purple-300' : ''}`}
                >
                  {t["profile-setup"]}
                </Link>
              </>
            )}
            
            <div className="pt-2 flex flex-col space-y-3">
              {user ? (
                <>
                  <div className="text-white py-2">
                    <UserCircle className="inline-block h-5 w-5 mr-2" />
                    {user.email}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-white text-white hover:bg-purple-800"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t["sign-out"]}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full border-white text-purple-950 bg-white hover:bg-purple-50"
                    >
                      {t["sign-in"]}
                    </Button>
                  </Link>
                  <Link to="/sign-in?signup=true" className="w-full">
                    <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                      {t["get-started"]}
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
