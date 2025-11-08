'use client';

import { useState } from 'react';
import { Menu, LogOut, ChevronDown, User } from 'lucide-react';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useAuth } from '@/components/AuthProvider';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  pageTitle?: string;
  toggleSidebar: () => void;
}

export default function Navbar({ pageTitle = 'Dashboard', toggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Anda berhasil logout.');
    } catch {
      toast.error('Gagal untuk logout.');
    }
  };

  const userName = user?.displayName || user?.email || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border-b border-gray-200/60 dark:border-gray-700/50 shadow-sm transition-all">
      <div className="flex justify-between items-center px-5 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Sidebar toggle (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <DarkModeToggle />

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <motion.div
                className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full font-bold"
                layoutId="user-avatar"
              >
                {userInitial}
              </motion.div>
              <span className="hidden sm:inline text-sm truncate max-w-[120px]">{userName}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {/* Header User Info */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400 font-semibold">
                        <User size={18} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
