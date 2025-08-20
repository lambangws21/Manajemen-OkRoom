'use client';
import { Menu } from 'lucide-react';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';

// DIUBAH: Hapus prop isDarkMode dan toggleDarkMode dari sini
interface NavbarProps {
    userName?: string;
    pageTitle?: string;
    toggleSidebar: () => void;
  }
  
// DIUBAH: Hapus prop isDarkMode dan toggleDarkMode dari parameter
export default function Navbar({ userName = 'Admin', pageTitle = 'Dashboard', toggleSidebar }: NavbarProps) {
  return (
    <header className="w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="lg:hidden mr-4 text-gray-600 dark:text-gray-300">
            <Menu size={24}/>
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* DIUBAH: Panggil komponen tanpa prop, karena ia sudah mandiri */}
        <DarkModeToggle />

        <span className="hidden sm:inline text-gray-600 dark:text-gray-300">
          <span className="hidden md:inline">Selamat datang, </span>
          <span className="font-medium">{userName}</span>
        </span>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}