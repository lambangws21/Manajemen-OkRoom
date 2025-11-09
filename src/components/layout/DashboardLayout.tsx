'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  pageTitle?: string;
  children: ReactNode;
}

export default function DashboardLayout({ pageTitle, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      {/* Main Content Wrapper */}
      <motion.div
        animate={{
          marginLeft: isSidebarOpen ? 260 : 80, // ✅ Lebar menyesuaikan sidebar
          filter: isSidebarOpen ? 'blur(0px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'flex flex-col flex-1 relative transition-all duration-300',
          'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
        )}
      >
        {/* Navbar */}
        <Navbar pageTitle={pageTitle} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 h-[calc(100vh-64px)]">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
