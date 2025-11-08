'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/AuthProvider'; // 1. Impor AuthProvider & useAuth


// Komponen baru yang bertugas melindungi halaman dan menampilkan layout
function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Jika pengecekan selesai dan tidak ada user, paksa ke halaman login
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  // Selama pengecekan, jangan tampilkan apa-apa (AuthProvider sudah menampilkan spinner)
  if (loading) {
    return null;
  }
  
  // Jika tidak ada user, halaman login akan dirender
  if (!user) {
    return <>{children}</>;
  }

  // Jika user sudah login, tampilkan layout utama
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const getPageTitle = (path: string): string => {
    if (path.startsWith('/dashboard')) return 'Dashboard Operasional';
    if (path.startsWith('/jadwal-operasi')) return 'Jadwal Operasi';
    // ... tambahkan judul halaman lain
    return 'Selamat Datang';
  };
  
  const noLayoutPages = ['/live-view/operasi', '/status-pasien'];
  const useMainLayout = !noLayoutPages.some(path => pathname.startsWith(path));

  if (!useMainLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full w-full bg-gray-100 dark:bg-gray-800">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="flex-1 flex flex-col">
        <Navbar pageTitle={getPageTitle(pathname)} toggleSidebar={toggleSidebar} />
        <div className="flex-grow overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

// Komponen RootLayout utama
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* 2. Bungkus semua dengan AuthProvider */}
          <AuthProvider>
            <Toaster richColors position="top-right" />
            {/* 3. Render AppLayout yang akan menangani logika */}
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
