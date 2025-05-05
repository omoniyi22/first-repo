
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, UserCircle, LogOut, Settings, User, Home } from 'lucide-react';
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

  // Custom NavigationMenuLink component for standard nav links
  const NavLink = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </a>
    );
  });
  NavLink.displayName = "NavLink";
  
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
          
          {/* Desktop navigation with dropdowns */}
          <div className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={`text-white ${isActive('/') ? 'font-semibold text-purple-300' : ''}`}>
                    {t["home"]}
                  </Link>
                </NavigationMenuItem>
                
                {/* How It Works Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white hover:bg-purple-700/40">
                    {t["how-it-works"]}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-600 to-purple-800 p-6 no-underline outline-none"
                            to="/how-it-works"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              AI Equestrian
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Learn how our AI technology works for all equestrian disciplines
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link to="/dressage/how-it-works" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">AI Dressage</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            How the AI Dressage Trainer works
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/jumping/how-it-works" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">AI Jumping</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            How the AI Jumping Trainer works
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/pricing" className={`text-white ${isActive('/pricing') ? 'font-semibold text-purple-300' : ''}`}>
                    {t["pricing"]}
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/blog" className={`text-white ${isActive('/blog') ? 'font-semibold text-purple-300' : ''}`}>
                    {t["blog"]}
                  </Link>
                </NavigationMenuItem>
                
                {/* About Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white hover:bg-purple-700/40">
                    {t["about"]}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-600 to-purple-800 p-6 no-underline outline-none"
                            to="/about"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              AI Equestrian
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              About our mission and the team behind our AI equestrian platform
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link to="/dressage/about" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">AI Dressage</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            About the AI Dressage Trainer
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/jumping/about" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">AI Jumping</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            About the AI Jumping Trainer
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
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
                <Link to="/sign-in?signup=true">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
                  >
                    {t["get-started"]}
                  </Button>
                </Link>
                <Link to="/sign-in">
                  <Button 
                    variant="outline" 
                    className="border-white text-white bg-transparent hover:bg-gradient-to-r hover:from-purple-800 hover:to-blue-700 hover:text-white hover:border-transparent transition-all"
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
              className={`text-white text-lg font-medium ${isActive('/') ? 'text-purple-300' : ''}`}
            >
              {t["home"]}
            </Link>
            
            {/* Mobile How It Works submenu */}
            <div className="flex flex-col space-y-2">
              <div className="text-white text-lg font-medium">
                {t["how-it-works"]}
              </div>
              <div className="pl-4 flex flex-col space-y-2">
                <Link 
                  to="/how-it-works"
                  className={`text-white/80 ${isActive('/how-it-works') ? 'text-purple-300' : ''}`}
                >
                  AI Equestrian
                </Link>
                <Link 
                  to="/dressage/how-it-works"
                  className={`text-white/80 ${isActive('/dressage/how-it-works') ? 'text-purple-300' : ''}`}
                >
                  AI Dressage
                </Link>
                <Link 
                  to="/jumping/how-it-works"
                  className={`text-white/80 ${isActive('/jumping/how-it-works') ? 'text-purple-300' : ''}`}
                >
                  AI Jumping
                </Link>
              </div>
            </div>
            
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
            
            {/* Mobile About submenu */}
            <div className="flex flex-col space-y-2">
              <div className="text-white text-lg font-medium">
                {t["about"]}
              </div>
              <div className="pl-4 flex flex-col space-y-2">
                <Link 
                  to="/about"
                  className={`text-white/80 ${isActive('/about') ? 'text-purple-300' : ''}`}
                >
                  AI Equestrian
                </Link>
                <Link 
                  to="/dressage/about"
                  className={`text-white/80 ${isActive('/dressage/about') ? 'text-purple-300' : ''}`}
                >
                  AI Dressage
                </Link>
                <Link 
                  to="/jumping/about"
                  className={`text-white/80 ${isActive('/jumping/about') ? 'text-purple-300' : ''}`}
                >
                  AI Jumping
                </Link>
              </div>
            </div>
            
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
