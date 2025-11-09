// 'use client';

// import './globals.css';
// import Sidebar from '@/components/layout/Sidebar';
// import Navbar from '@/components/layout/Navbar';
// import { ReactNode, useState, useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { ThemeProvider } from '@/components/ThemeProvider';
// import { Toaster } from 'sonner';
// import { AuthProvider, useAuth } from '@/components/AuthProvider'; // 1. Impor AuthProvider & useAuth


// // Komponen baru yang bertugas melindungi halaman dan menampilkan layout
// function AppLayout({ children }: { children: ReactNode }) {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isSidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     // Jika pengecekan selesai dan tidak ada user, paksa ke halaman login
//     if (!loading && !user && pathname !== '/login') {
//       router.push('/login');
//     }
//   }, [user, loading, pathname, router]);

//   // Selama pengecekan, jangan tampilkan apa-apa (AuthProvider sudah menampilkan spinner)
//   if (loading) {
//     return null;
//   }
  
//   // Jika tidak ada user, halaman login akan dirender
//   if (!user) {
//     return <>{children}</>;
//   }

//   // Jika user sudah login, tampilkan layout utama
//   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
//   const getPageTitle = (path: string): string => {
//     if (path.startsWith('/dashboard')) return 'Dashboard Operasional';
//     if (path.startsWith('/jadwal-operasi')) return 'Jadwal Operasi';
//     // ... tambahkan judul halaman lain
//     return 'Selamat Datang';
//   };
  
//   const noLayoutPages = ['/live-view/operasi', '/status-pasien'];
//   const useMainLayout = !noLayoutPages.some(path => pathname.startsWith(path));

//   if (!useMainLayout) {
//     return <>{children}</>;
//   }

//   return (
//     <div className="flex h-full w-full bg-gray-100 dark:bg-gray-800">
//       <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//       <main className="flex-1 flex flex-col">
//         <Navbar pageTitle={getPageTitle(pathname)} toggleSidebar={toggleSidebar} />
//         <div className="flex-grow overflow-y-auto">{children}</div>
//       </main>
//     </div>
//   );
// }

// // Komponen RootLayout utama
// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="id" suppressHydrationWarning>
//       <body>
//         <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//           {/* 2. Bungkus semua dengan AuthProvider */}
//           <AuthProvider>
//             <Toaster richColors position="top-right" />
//             {/* 3. Render AppLayout yang akan menangani logika */}
//             <AppLayout>{children}</AppLayout>
//           </AuthProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }

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

// 🔹 Komponen utama untuk menangani login & layout
function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Sidebar auto menyesuaikan layar (responsive)
  useEffect(() => {
    setSidebarOpen(window.innerWidth > 1024);

    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔐 Redirect ke login kalau belum login
  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) return null;
  if (!user) return <>{children}</>;

  // Sidebar toggle
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Tentukan halaman tanpa layout (misal live view atau status pasien)
  const noLayoutPages = ['/live-view/operasi', '/login'];
  const useMainLayout = !noLayoutPages.some((path) =>
    pathname.startsWith(path)
  );

  // Fungsi judul halaman di navbar
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
      {/* Sidebar Glass Fixed */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Konten Utama */}
      <motion.main
        animate={{
          marginLeft: isSidebarOpen ? 260 : 80,
          filter: isSidebarOpen ? 'blur(0px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* Navbar */}
        <Navbar
          pageTitle={getPageTitle(pathname)}
          toggleSidebar={toggleSidebar}
        />

        {/* Konten Scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 backdrop-blur-sm bg-slate-100 dark:bg-slate-700/50">
          {children}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 py-4 border-t bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400 border-slate-200 dark:border-slate-800/60">
          © {new Date().getFullYear()} MedOps ORM — Powered by Lambang
        </footer>
      </motion.main>

      {/* Cahaya Latar Belakang (Refleksi Gradient) */}
      <motion.div
        initial={{ opacity: 0.2, scale: 0.9 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="pointer-events-none absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl"
      />
    </div>
  );
}

// 🔹 RootLayout Utama
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

