'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ReactNode, useState, useEffect } from 'react';
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

  useEffect(() => {
    setSidebarOpen(window.innerWidth > 1024);
    const handleResize = () =>
      setSidebarOpen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔓 Cek route publik
  useEffect(() => {
    const publicRoutes = ['/login', '/share/status'];
    const isPublic = publicRoutes.some((path) =>
      pathname.startsWith(path)
    );

    if (!loading && !user && !isPublic) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) return null;
  if (!user) return <>{children}</>;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
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
        'flex h-screen w-full overflow-hidden relative',
        'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100'
      )}
    >
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <motion.main
        animate={{
          marginLeft: isSidebarOpen ? 260 : 80,
        }}
        transition={{ duration: 0.25 }}
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      >
        <Navbar pageTitle={getPageTitle(pathname)} toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-y-auto p-6 md:p-8 backdrop-blur-sm bg-slate-100 dark:bg-slate-700/50">
          {children}
        </div>

        <footer className="text-center text-xs text-slate-500 py-4 border-t bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400 border-slate-200 dark:border-slate-800/60">
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
