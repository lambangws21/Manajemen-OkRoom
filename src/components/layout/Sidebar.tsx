'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, MonitorPlay, ArrowRightLeft, Stethoscope, X, ClipboardList } from 'lucide-react';

// Tipe untuk props, sekarang termasuk fungsi untuk menutup sidebar
interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/papan-kendali", label: "Papan Kendali OK", icon: <ClipboardList size={20} /> },
    { href: "/jadwal-operasi", label: "Jadwal Operasi", icon: <Calendar size={20} /> },
    { href: "/manajemen-tim", label: "Manajemen Tim", icon: <Users size={20} /> },
    { href: "/serah-terima", label: "Serah Terima", icon: <ArrowRightLeft size={20} /> },
    { href: "/live-view/operasi", label: "Live View", icon: <MonitorPlay size={20} /> },
    { href: "/status-pasien", label: "Lacak Pasien", icon: <Stethoscope size={20} /> },
  ];

  return (
    <>
      {/* Backdrop untuk mobile view, muncul saat sidebar terbuka */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      ></div>

      <aside 
        className={`fixed top-0 left-0 h-full z-40 w-64 bg-gray-800 text-white p-4 flex flex-col transition-transform duration-300 ease-in-out 
                  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                  lg:translate-x-0 lg:static lg:flex-shrink-0`}
      >
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="text-2xl font-bold">KlinikApp</div>
          {/* Tombol close hanya muncul di mobile view */}
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="mb-2">
                  <Link
                    href={item.href}
                    onClick={toggleSidebar} // Tutup sidebar setelah link diklik di mobile
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto">
          <p className="text-xs text-center text-gray-500">© 2025 KlinikApp</p>
        </div>
      </aside>
    </>
  );
}