'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MonitorPlay,
  ArrowRightLeft,
  Stethoscope,
  X,
  HeartPulse,
  ChevronRight,
  CalendarDaysIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setHovered] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1024) {
      setSidebarWidth(80);
      if (isSidebarOpen) toggleSidebar();
    } else {
      setSidebarWidth(260);
    }
  }, [isSidebarOpen, toggleSidebar]);

  useEffect(() => {
    if (window.innerWidth > 1024) setSidebarWidth(260);
    else setSidebarWidth(80);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const expanded = isSidebarOpen || isHovered;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jadwal-operasi', label: 'Jadwal Operasi', icon: CalendarDaysIcon },
    { href: '/manajemen-tim', label: 'Manajemen Tim', icon: Users },
    { href: '/serah-terima', label: 'Serah Terima', icon: ArrowRightLeft },
    { href: '/live-view/operasi', label: 'Live View', icon: MonitorPlay },
    { href: '/status-pasien', label: 'Lacak Pasien', icon: Stethoscope },
    { href: '/staff-manager', label: 'My Staff', icon: Users },
  ];

  return (
    <>
      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: expanded ? 0.5 : 0.3 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 w-[260px] h-full bg-gradient-to-b from-blue-500/30 via-indigo-500/20 to-transparent blur-3xl pointer-events-none z-20"
      />

      {/* Overlay untuk mobile */}
      <div
        className={cn(
          'fixed inset-0 bg-white dark:bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300',
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar utama */}
      <motion.aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ width: expanded ? 260 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-slate-700/40 shadow-xl',
          'bg-slate-100 dark:bg-slate-900/70 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-2xl text-white overflow-hidden',
          'transition-all duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-2 bg-blue-500/20 rounded-xl shadow-inner backdrop-blur-md"
            >
              <HeartPulse className="text-blue-400" size={20} />
            </motion.div>

            {/* Logo Text */}
            <AnimatePresence mode="popLayout">
              {expanded && (
                <motion.div
                  key="logo-text"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3 }}
                  className="leading-tight"
                >
                  <h1 className="text-lg font-bold dark:text-white text-slate-500 tracking-wide">
                    Med<span className="text-blue-400">Ops</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                    ORM System
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {expanded && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white transition"
            >
              <X size={22} />
            </button>
          )}
        </div>

        {/* Navigasi */}
        <nav className="flex-1 overflow-y-auto px-2 mt-3 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-slate-900/40">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <motion.li key={href} whileHover={{ scale: 1.02 }}>
                  <Link
                    href={href}
                    onClick={toggleSidebar}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-blue-600/30 text-blue-300 border-l-4 border-blue-500 shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                    )}
                  >
                    <Icon
                      size={20}
                      className={cn(
                        'transition-transform duration-300',
                        isActive
                          ? 'text-blue-400 scale-110'
                          : 'group-hover:text-blue-300 group-hover:scale-110'
                      )}
                    />

                    <AnimatePresence>
                      {expanded && (
                        <motion.span
                          key={label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t dark:border-slate-700/50 bg-slate-200 dark:bg-slate-800/50 px-4 py-4 text-center text-xs text-gray-500">
          <AnimatePresence>
            {expanded ? (
              <motion.p
                key="footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                © {new Date().getFullYear()} MedOps ORM
              </motion.p>
            ) : (
              <motion.div
                key="collapse-icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <ChevronRight className="text-slate-500" size={16} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
