'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ✅ Responsif Sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // default open di desktop
      } else {
        setSidebarOpen(false); // hide di mobile
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔒 Auth Redirect
  useEffect(() => {
    const publicRoutes = ['/login', '/share/status'];
    const isPublic = publicRoutes.some((path) => pathname.startsWith(path));
    if (!loading && !user && !isPublic) router.push('/login');
  }, [user, loading, pathname, router]);

  if (loading) return null;
  if (!user) return <>{children}</>;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const noLayoutPages = ['/live-view/operasi', '/login'];
  const useMainLayout = !noLayoutPages.some((path) => pathname.startsWith(path));

  const getPageTitle = (path: string): string => {
    if (path.startsWith('/dashboard')) return 'Dashboard Operasional';
    if (path.startsWith('/jadwal-operasi')) return 'Jadwal Operasi';
    if (path.startsWith('/manajemen-tim')) return 'Manajemen Tim';
    if (path.startsWith('/serah-terima')) return 'Serah Terima Shift';
    if (path.startsWith('/staff-manager')) return 'Staff Management';
    return 'Selamat Datang';
  };

  if (!useMainLayout) return <>{children}</>;

  return (
    <div
      className={cn(
        'relative flex h-screen w-full overflow-hidden',
        'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100'
      )}
    >
      {/* 🌙 Overlay untuk mobile */}
      <AnimatePresence>
        {!isDesktop && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* 🧱 Sidebar sebagai overlay */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 🧭 Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Navbar pageTitle={getPageTitle(pathname)} toggleSidebar={toggleSidebar} />

        <motion.div
          layout
          className="flex-1 overflow-y-auto p-5 md:p-8 bg-slate-100/70 dark:bg-slate-800/40 backdrop-blur-md rounded-t-lg shadow-inner transition-all"
        >
          {children}
        </motion.div>

        <footer className="text-center text-xs text-slate-500 py-4 border-t bg-slate-100/60 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200/30 dark:border-slate-700/60 backdrop-blur-lg">
          © {new Date().getFullYear()} MedOps ORM — Powered by Lambang
        </footer>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Toaster richColors position="top-right" />
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
