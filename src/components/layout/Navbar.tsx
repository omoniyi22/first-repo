
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, LogOut, Settings, User, Home, Mail, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
  
  // Check if user is an admin using the backend function
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        // Call the Supabase function to check if user is admin
        const { data, error } = await supabase.rpc('is_admin', {
          user_uuid: user.id
        });
        
        if (error) {
          console.error("Failed to check admin status:", error);
          return;
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-purple-950/90 backdrop-blur-md shadow-md' : 'bg-purple-950/50 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/ddb7f47e-072a-4346-9fd3-a8a055f13bba.png" 
                alt="AI Equestrian Logo" 
                className="h-10 w-10 mr-2"
              />
              <h1 className={`font-serif text-xl font-semibold ${getBrandColorClass()}`}>
                {getBrandName()}
              </h1>
            </Link>
          </div>
          
          {/* Desktop navigation with streamlined dropdowns */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-5">
              <Link 
                to="/" 
                className={`text-white font-sans text-sm ${isActive('/') ? 'font-semibold text-purple-300' : 'hover:text-purple-200'}`}
              >
                {t["home"]}
              </Link>
              
              {/* How It Works Dropdown - Simplified */}
              <div className="relative group">
                <button className="text-white font-sans text-sm flex items-center hover:text-purple-200">
                  {t["how-it-works"]}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-1">
                    <Link to="/how-it-works" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                      AI Equestrian
                    </Link>
                    <Link to="/dressage/how-it-works" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                      AI Dressage
                    </Link>
                    <Link to="/jumping/how-it-works" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                      AI Jumping
                    </Link>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/pricing" 
                className={`text-white font-sans text-sm ${isActive('/pricing') ? 'font-semibold text-purple-300' : 'hover:text-purple-200'}`}
              >
                {t["pricing"]}
              </Link>
              
              <Link 
                to="/blog" 
                className={`text-white font-sans text-sm ${isActive('/blog') ? 'font-semibold text-purple-300' : 'hover:text-purple-200'}`}
              >
                {t["blog"]}
              </Link>
              
              {/* About page - Single link */}
              <Link 
                to="/about" 
                className={`text-white font-sans text-sm ${isActive('/about') ? 'font-semibold text-purple-300' : 'hover:text-purple-200'}`}
              >
                {t["about"]}
              </Link>
            </nav>
            
            {user ? (
              <div className="flex items-center ml-3 space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`text-white font-sans text-sm ${isActive('/dashboard') ? 'font-semibold text-purple-300' : 'hover:text-purple-200'}`}
                >
                  {t["dashboard"]}
                </Link>
                
                {/* User dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center text-white focus:outline-none">
                    <UserCircle className="h-5 w-5 mr-1" />
                    <span className="hidden lg:inline-block font-sans text-sm">{user.email?.split('@')[0]}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white py-1.5 px-1 rounded-md shadow-md">
                    <DropdownMenuLabel className="font-sans text-sm px-2.5 py-1.5">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer font-sans text-sm px-2.5 py-1.5 rounded-sm">
                      <User className="h-4 w-4 mr-2" />
                      <span>{t["profile-setup"]}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer font-sans text-sm px-2.5 py-1.5 rounded-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>{t["dashboard"]}</span>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => navigate('/admin')}
                        className="cursor-pointer font-sans text-sm px-2.5 py-1.5 rounded-sm"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 font-sans text-sm px-2.5 py-1.5 rounded-sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>{t["sign-out"]}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/sign-in?signup=true">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 font-sans text-sm"
                  >
                    {t["get-started"]}
                  </Button>
                </Link>
                <Link to="/sign-in">
                  <Button 
                    variant="outline" 
                    className="border-white text-white bg-transparent hover:bg-gradient-to-r hover:from-purple-800 hover:to-blue-700 hover:text-white hover:border-transparent transition-all font-sans text-sm"
                  >
                    Log In
                  </Button>
                </Link>
              </>
            )}
            
            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
          
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
              className={`text-white text-base font-medium font-sans ${isActive('/') ? 'text-purple-300' : ''}`}
            >
              {t["home"]}
            </Link>
            
            {/* Mobile How It Works submenu */}
            <div className="flex flex-col space-y-2">
              <div className="text-white text-base font-medium font-sans">
                {t["how-it-works"]}
              </div>
              <div className="pl-4 flex flex-col space-y-2">
                <Link 
                  to="/how-it-works"
                  className={`text-white/80 font-sans ${isActive('/how-it-works') ? 'text-purple-300' : ''}`}
                >
                  AI Equestrian
                </Link>
                <Link 
                  to="/dressage/how-it-works"
                  className={`text-white/80 font-sans ${isActive('/dressage/how-it-works') ? 'text-purple-300' : ''}`}
                >
                  AI Dressage
                </Link>
                <Link 
                  to="/jumping/how-it-works"
                  className={`text-white/80 font-sans ${isActive('/jumping/how-it-works') ? 'text-blue-300' : ''}`}
                >
                  AI Jumping
                </Link>
              </div>
            </div>
            
            <Link 
              to="/pricing" 
              className={`text-white text-base font-medium font-sans ${isActive('/pricing') ? 'text-purple-300' : ''}`}
            >
              {t["pricing"]}
            </Link>
            
            <Link 
              to="/blog" 
              className={`text-white text-base font-medium font-sans ${isActive('/blog') ? 'text-purple-300' : ''}`}
            >
              {t["blog"]}
            </Link>
            
            {/* Single About link for mobile */}
            <Link 
              to="/about" 
              className={`text-white text-base font-medium font-sans ${isActive('/about') ? 'text-purple-300' : ''}`}
            >
              {t["about"]}
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-white text-base font-medium font-sans ${isActive('/dashboard') ? 'text-purple-300' : ''}`}
                >
                  {t["dashboard"]}
                </Link>
                <Link 
                  to="/profile-setup" 
                  className={`text-white text-base font-medium font-sans ${isActive('/profile-setup') ? 'text-purple-300' : ''}`}
                >
                  {t["profile-setup"]}
                </Link>
                
                {/* Add admin dashboard link for mobile users */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`text-white text-base font-medium font-sans ${isActive('/admin') ? 'text-purple-300' : ''}`}
                  >
                    Admin Dashboard
                  </Link>
                )}
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
                  <Link to="/sign-in?signup=true" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600">
                      {t["get-started"]}
                    </Button>
                  </Link>
                  <Link to="/sign-in" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full border-white text-white bg-transparent hover:bg-gradient-to-r hover:from-purple-800 hover:to-blue-700 hover:text-white hover:border-transparent transition-all"
                    >
                      Log In
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
