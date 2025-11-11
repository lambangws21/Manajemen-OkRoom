'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Sidebar responsive behaviour
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔐 Auth redirect
  useEffect(() => {
    const publicRoutes = ['/login', '/share/status'];
    const isPublic = publicRoutes.some((path) => pathname.startsWith(path));

    if (!loading && !user && !isPublic) router.push('/login');
  }, [user, loading, pathname, router]);

  if (loading) return null;
  if (!user) return <>{children}</>;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const noLayoutPages = ['/live-view/operasi', '/login'];
  const useMainLayout = !noLayoutPages.some((path) =>
    pathname.startsWith(path)
  );

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
        'flex h-screen w-full relative overflow-hidden',
        'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100'
      )}
    >
      {/* 🧭 Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* 🧱 Main Content Area */}
      <motion.main
        animate={{
          marginLeft:
            isSidebarOpen && !isCollapsed
              ? 288 // sidebar penuh
              : isSidebarOpen && isCollapsed
              ? 80 // sidebar mini
              : 0, // sidebar tertutup (mobile)
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex flex-col flex-1 transition-all duration-300 bg-slate-100/60 dark:bg-slate-800/50 backdrop-blur-sm"
      >
        {/* Navbar di atas */}
        <Navbar
          pageTitle={getPageTitle(pathname)}
          toggleSidebar={toggleSidebar}
        />

        {/* Konten bisa scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 rounded-t-lg shadow-inner">
          {children}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 py-4 border-t bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 backdrop-blur-lg">
          © {new Date().getFullYear()} MedOps ORM — Powered by Lambang
        </footer>
      </motion.main>
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
