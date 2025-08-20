'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider'; // 1. Impor ThemeProvider

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  
  const getPageTitle = (path: string): string => {
    if (path === '/') return 'Selamat Datang';
    if (path.startsWith('/dashboard')) return 'Dashboard Operasional';
    if (path.startsWith('/jadwal-operasi')) return 'Jadwal Operasi';
    if (path.startsWith('/manajemen-tim')) return 'Manajemen Tim';
    if (path.startsWith('/serah-terima')) return 'Serah Terima Pasien';
    if (path.startsWith('/operasi')) return 'Manajemen Operasi Pasien';
    return 'KlinikApp';
  };
  
  const noLayoutPages = ['/live-view/operasi', '/status-pasien'];
  const useMainLayout = !noLayoutPages.some(path => pathname.startsWith(path));

  return (
    // 2. Tambahkan suppressHydrationWarning pada <html>
    <html lang="id" suppressHydrationWarning>
      <body>
        {/* 3. Bungkus semua konten dengan ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {useMainLayout ? (
            // Layout untuk halaman internal
            <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
              <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar  
                  pageTitle={getPageTitle(pathname)} 
                  toggleSidebar={toggleSidebar}
                  // Navbar tidak lagi butuh prop untuk dark mode
                />
                <div className="flex-grow overflow-y-auto">{children}</div>
              </main>
            </div>
          ) : (
            // Layout untuk halaman khusus (tanpa sidebar/navbar)
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}