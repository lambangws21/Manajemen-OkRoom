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
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Jadwal Operasi', icon: LayoutDashboard },
    { href: "/jadwal-operasi", label:'Jadwal Operasi', icon: CalendarDays },

    { href: '/manajemen-tim', label: 'Manajemen Tim', icon: Users },

    { href: '/serah-terima', label: 'Serah Terima', icon: ArrowRightLeft },
    { href: '/live-view/operasi', label: 'Live View', icon: MonitorPlay },
    { href: '/status-pasien', label: 'Lacak Pasien', icon: Stethoscope },
    { href: '/staff-manager', label: 'My Staff', icon: Users },
  ];

  return (
    <>
      {/* Overlay untuk mobile */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-64 flex flex-col 
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-white border-r border-slate-700/40 shadow-2xl 
          transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/50">
          {/* 🔹 Logo Modern */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="p-2 bg-blue-600/20 rounded-xl shadow-inner"
            >
              <HeartPulse className="text-blue-400" size={20} />
            </motion.div>
            <div className="leading-tight">
              <h1 className="text-lg font-extrabold tracking-wide text-white">
                Med<span className="text-blue-400">Ops</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Operation Room Manager
              </p>
            </div>
          </div>

          {/* Tombol tutup mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/30">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={toggleSidebar}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium relative overflow-hidden
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500 shadow-inner'
                          : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                  >
                    <Icon
                      size={19}
                      className={`transition-colors ${
                        isActive ? 'text-blue-400' : 'group-hover:text-blue-300'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-700/40 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} <span className="text-blue-400 font-semibold">MedOps</span> ORM
          </p>
        </div>
      </aside>
    </>
  );
}
