'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
// import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, LogOut, Settings, TrendingUp, Shield, Users, DollarSign, Bell, BarChart3, Menu, X, Globe, Trophy, ShoppingBag } from 'lucide-react';
import NotificationCenter from '@/components/notifications/notification-center';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  // const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng các overlay (Radix Select/Popover/Menu) khi route thay đổi để tránh "overlay không biến mất"
  useEffect(() => {
    // Đóng mobile menu nếu đang mở
    setIsMobileMenuOpen(false);
    // Thử đóng các overlay phổ biến bằng cách gửi phím Escape và ẩn các node data-state=open
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escEvent);
    // Fallback: ẩn các phần tử Radix đang mở
    const openNodes = document.querySelectorAll('[data-state="open"]');
    openNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        node.style.display = 'none';
        node.setAttribute('data-state', 'closed');
      }
    });
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu on escape key
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileNavClick = (e, href) => {
    e.preventDefault();
    handleMobileMenuClose();
    
    // Smooth scroll to anchor if it starts with #
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to page
      window.location.href = href;
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    const params = searchParams.toString();
    const newPath = `/${newLocale}${currentPath}${params ? `?${params}` : ''}`;
    router.push(newPath);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? 'border-b border-border bg-background/95 backdrop-blur-sm shadow-sm' 
        : 'border-b border-border bg-background/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
            <span className="font-bold text-xl">ApexRebate</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center space-x-8">
            <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">
              Tính toán
            </Link>
            <Link href="/wall-of-fame" className="text-muted-foreground hover:text-foreground transition-colors">
              Danh vọng
            </Link>
            <Link href="/hang-soi" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
              <Users className="w-4 h-4 inline mr-1" />
              Hang Sói
            </Link>
            <Link href={`/${locale}/tools`} className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              <ShoppingBag className="w-4 h-4 inline mr-1" />
              Chợ Công Cụ
            </Link>
            <Link href={`/${locale}/faq`} className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              Cách hoạt động
            </Link>
          </div>

          {/* Desktop Right side */}
          <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
            {/* Notification Bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
              </Button>

            {/* Dashboard Button */}
            <Link href={`/${locale}/dashboard`}>
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            Dashboard
            <div className="w-4 h-4 bg-purple-600 rounded-full ml-2 flex items-center justify-center">
            <span className="text-white text-xs">M</span>
            </div>
            </Button>
            </Link>

             {/* User Menu Dropdown */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                     <AvatarFallback className="bg-blue-600 text-white text-xs">
                       {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                     </AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-56" align="end" forceMount>
                 <div className="flex items-center justify-start gap-2 p-2">
                   <div className="flex flex-col space-y-1 leading-none">
                     <p className="font-medium text-sm">{session.user?.name}</p>
                     <p className="w-[200px] truncate text-xs text-muted-foreground">
                       {session.user?.email}
                     </p>
                     {session.user?.role && (
                       <Badge variant="secondary" className="w-fit text-xs">
                         {session.user.role}
                       </Badge>
                     )}
                   </div>
                 </div>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                   <Link href={`/${locale}/profile`}>
                     <User className="mr-2 h-4 w-4" />
                     Profile
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href={`/${locale}/payouts`}>
                     <DollarSign className="mr-2 h-4 w-4" />
                     Payouts
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link href={`/${locale}/referrals`}>
                     <Users className="mr-2 h-4 w-4" />
                     Referrals
                   </Link>
                 </DropdownMenuItem>
                 {(session?.user?.role === 'ADMIN' || session?.user?.role === 'CONCIERGE') && (
                   <>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href="/admin">
                         <Settings className="mr-2 h-4 w-4" />
                         Admin Panel
                       </Link>
                     </DropdownMenuItem>
                   </>
                 )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => signOut()}>
                   <LogOut className="mr-2 h-4 w-4" />
                   Log out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
              </>
            ) : (
              <>
                {/* Auth Buttons for Guests */}
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Selector for mobile */}
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-16 h-9">
                <Globe className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">VI</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Theme Toggle for mobile */}
            <ThemeToggle />
            
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            ) : session && (
              <NotificationCenter />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              className="text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-transform"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 border-t border-border bg-card' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Navigation Links */}
            <Link 
              href="/calculator" 
              onClick={handleMobileMenuClose}
              className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              Tính toán
            </Link>
            <Link 
              href="/wall-of-fame" 
              onClick={handleMobileMenuClose}
              className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              Bức tường danh vọng
            </Link>
            <Link 
              href="/hang-soi" 
              onClick={handleMobileMenuClose}
              className="block px-4 py-3 rounded-lg text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              <Users className="inline w-4 h-4 mr-2" />
              Hang Sói
            </Link>
            <Link 
              href={`/${locale}/tools`} 
              onClick={handleMobileMenuClose}
              className="block px-4 py-3 rounded-lg text-base font-medium text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              <ShoppingBag className="inline w-4 h-4 mr-2" />
              Chợ Công Cụ
            </Link>
            <Link 
              href={`/${locale}/faq`} 
              onClick={handleMobileMenuClose}
              className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              FAQ
            </Link>
            <Link 
              href="/how-it-works" 
              onClick={handleMobileMenuClose}
              className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
              role="menuitem"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              Cách hoạt động
            </Link>
            
            {/* Mobile Auth Section */}
            <div className="border-t border-border mt-3 pt-3">
              {session ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-3 bg-accent rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        {session.user?.role && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {session.user.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile User Menu */}
                  <Link
                  href={`/${locale}/dashboard`}
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <TrendingUp className="inline w-4 h-4 mr-2" />
                  Dashboard
                  </Link>
                  <Link
                  href={`/${locale}/profile`}
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <User className="inline w-4 h-4 mr-2" />
                  Profile
                  </Link>
                  <Link
                  href={`/${locale}/payouts`}
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <DollarSign className="inline w-4 h-4 mr-2" />
                  Payouts
                  </Link>
                  <Link
                  href={`/${locale}/referrals`}
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <Users className="inline w-4 h-4 mr-2" />
                  Referrals
                  </Link>
                  {(session?.user?.role === 'ADMIN' || session?.user?.role === 'CONCIERGE') && (
                  <Link
                  href="/admin"
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <Settings className="inline w-4 h-4 mr-2" />
                  Admin
                  </Link>
                  )}
                  <button
                  onClick={() => {
                  handleSignOut();
                  handleMobileMenuClose();
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <LogOut className="inline w-4 h-4 mr-2" />
                  Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                  href="/auth/signin"
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  Đăng nhập
                  </Link>
                  <Link
                  href="/auth/signup"
                  onClick={handleMobileMenuClose}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] flex items-center"
                  role="menuitem"
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                  <Shield className="inline w-4 h-4 mr-2" />
                  Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}