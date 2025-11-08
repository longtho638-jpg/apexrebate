'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';

interface RootLayoutClientProps {
  children: ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  
  // Pages that should NOT show navbar and footer
  const hideNavbarFooterRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];
  
  const shouldHideNavbarFooter = hideNavbarFooterRoutes.some(route => pathname.includes(route));

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNavbarFooter && <Navbar />}
      <main className={`flex-1 flex flex-col ${!shouldHideNavbarFooter ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!shouldHideNavbarFooter && <Footer />}
    </div>
  );
}
