import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useScroll } from '@/hooks/use-scroll';
import { ModeToggle } from '@/components/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface NavbarProps {
  transparent?: boolean;
}

const Navbar = ({ transparent = false }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, translations } = useLanguage();
  const t = translations[language];
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isAtTop = useScroll(0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isAtTop && transparent ? 'bg-transparent' : 'bg-white shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="AI Equestrian Logo" className="h-8 mr-2" />
            <span className="font-bold text-xl">AI Equestrian</span>
          </Link>

          {/* Language Switcher */}
          <ModeToggle />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink to="/" className="nav-link">
              {t["home"]}
            </NavLink>
            <NavLink to="/about" className="nav-link">
              {t["about"]}
            </NavLink>
            <NavLink to="/how-it-works" className="nav-link">
              {t["how-it-works"]}
            </NavLink>
            <NavLink to="/pricing" className="nav-link">
              {t["pricing"]}
            </NavLink>
            <NavLink to="/blog" className="nav-link">
              {t["blog"]}
            </NavLink>
            <NavLink to="/events" className="nav-link">
              Events
            </NavLink>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || ""} alt={user?.name || "Avatar"} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile-setup')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin')}>Admin</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/sign-in')}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/sign-in">
                <Button variant="outline">{t["sign-in"]}</Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-2/3 md:w-1/2">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Explore AI Equestrian
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-2">
                <NavLink to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                  {t["home"]}
                </NavLink>
                <NavLink to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
                  {t["about"]}
                </NavLink>
                <NavLink to="/how-it-works" className="mobile-nav-link" onClick={closeMobileMenu}>
                  {t["how-it-works"]}
                </NavLink>
                <NavLink to="/pricing" className="mobile-nav-link" onClick={closeMobileMenu}>
                  {t["pricing"]}
                </NavLink>
                <NavLink to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
                  {t["blog"]}
                </NavLink>
                <NavLink to="/events" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Events
                </NavLink>
                {!isAuthenticated && (
                  <Link to="/sign-in">
                    <Button variant="outline" className="w-full">{t["sign-in"]}</Button>
                  </Link>
                )}
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard">
                      <Button variant="secondary" className="w-full">Dashboard</Button>
                    </Link>
                    <Link to="/profile-setup">
                      <Button variant="secondary" className="w-full">Profile</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
