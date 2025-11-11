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
  CalendarDaysIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

/**
 * Menggunakan shadcn tooltip components
 * Pastikan file '@/components/ui/tooltip' ada dan mengekspor:
 * TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
 */
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/ui/tooltip';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  isCollapsed,
  toggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jadwal-operasi', label: 'Jadwal Operasi', icon: CalendarDaysIcon },
    { href: '/manajemen-tim', label: 'Manajemen Tim', icon: Users },
    { href: '/serah-terima', label: 'Serah Terima', icon: ArrowRightLeft },
    { href: '/live-view/operasi', label: 'Live View', icon: MonitorPlay },
    { href: '/status-pasien', label: 'Lacak Pasien', icon: Stethoscope },
    { href: '/staff-manager', label: 'My Staff', icon: Users },
  ];

  // width values used for animation & layout
  const expandedWidth = 288; // w-72 ~ 288px
  const collapsedWidth = 80; // ~80px (icon-only)

  return (
    <AnimatePresence>
      {/* Overlay transparan untuk mobile */}
      {!isDesktop && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      {(isDesktop || isSidebarOpen) && (
        <motion.aside
          key="sidebar"
          initial={{ x: -300, opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
            width: isCollapsed ? collapsedWidth : expandedWidth,
          }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          className={cn(
            'fixed top-0 left-0 z-50 flex flex-col h-screen',
            'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
            'border-r border-slate-700/40 shadow-2xl backdrop-blur-xl text-gray-200 overflow-hidden'
          )}
          style={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="p-2 bg-blue-500/20 rounded-xl shadow-inner"
              >
                <HeartPulse className="text-blue-400" size={20} />
              </motion.div>

              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold tracking-wide">
                    Med<span className="text-blue-400">Ops</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                    ORM System
                  </p>
                </div>
              )}
            </div>

            {/* Tombol: close mobile / collapse desktop */}
            <div>
              {!isDesktop ? (
                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              ) : (
                <button
                  onClick={toggleCollapse}
                  className="text-gray-400 hover:text-white transition"
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* Navigasi - bungkus TooltipProvider di level nav */}
          <TooltipProvider>
            <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-slate-900/30">
              <ul className="space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  const baseLinkClass = cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-blue-600/30 text-blue-300 border-l-4 border-blue-500'
                      : 'text-gray-400 hover:text-blue-300 hover:bg-slate-800/40'
                  );

                  // If collapsed: show tooltip + icon-only visual
                  if (isCollapsed) {
                    return (
                      <li key={href}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={href}
                              onClick={() => !isDesktop && toggleSidebar()}
                              className={cn(
                                'flex items-center justify-center w-full h-10 rounded-md',
                                isActive
                                  ? 'bg-blue-600/30 text-blue-300 border-l-4 border-blue-500'
                                  : 'text-gray-400 hover:text-blue-300 hover:bg-slate-800/40'
                              )}
                            >
                              <Icon
                                size={20}
                                className={cn(
                                  'transition-transform duration-300',
                                  isActive ? 'text-blue-400 scale-110' : 'group-hover:scale-110'
                                )}
                              />
                            </Link>
                          </TooltipTrigger>

                          <TooltipContent side="right" className="text-xs px-2 py-1 bg-slate-800/90 text-white rounded-md">
                            {label}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  // Expanded case: icon + label
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => !isDesktop && toggleSidebar()}
                        className={baseLinkClass}
                      >
                        <Icon
                          size={20}
                          className={cn(
                            'transition-transform duration-300',
                            isActive ? 'text-blue-400 scale-110' : 'group-hover:scale-110'
                          )}
                        />
                        <span className="truncate">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </TooltipProvider>

          {/* Footer - tampilkan hanya saat expanded */}
          {!isCollapsed && (
            <div className="border-t border-slate-700/50 bg-slate-900/60 px-4 py-4 text-center text-xs text-gray-500 backdrop-blur-sm">
              © {new Date().getFullYear()} MedOps ORM
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
