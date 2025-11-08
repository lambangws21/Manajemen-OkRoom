'use client';

import { Search } from 'lucide-react';
// Asumsi Input dan Card tersedia
// import {Input} from '@/components/ui/Input'; 
// import Card from '@/components/ui/card';
import { motion, Variants } from 'framer-motion'; 
import React from 'react'; // Diperlukan untuk React.ChangeEvent

// 💥 PERBAIKAN: Definisikan tipe status yang pasti (string literal union)
export type RoomStatus = 'Tersedia' | 'Operasi Berlangsung' | 'Kotor' | 'Dibersihkan' | 'Perbaikan'| 'Persiapan';

export interface Filters {
  search: string;
  status: 'All' | RoomStatus;
}

interface FilterControlsProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
}

// Definisikan varian animasi
const containerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 15 }
  }
};

// 🔹 Fungsi dummy Card dan Input karena aslinya diimpor
const Card: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        {children}
    </div>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
);

export default function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Memastikan nilai status dari select/input adalah salah satu dari tipe yang diizinkan
    const value = e.target.value as 'All' | RoomStatus; 
    
    onFilterChange({
      ...filters,
      [e.target.name]: value,
    });
  };

  return (
    // Gunakan motion.div sebagai pembungkus Card
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/2 text-slate-500">
            {/* Menggunakan komponen Input dummy */}
            <Input 
              placeholder="Cari nomor kamar..."
              value={filters.search}
              onChange={handleInputChange}
              name="search" 
            
            />
            <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="w-full md:w-1/4">
            <select 
              name="status"
              value={filters.status} 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Semua Status</option>
              {/* Status yang didefinisikan di RoomStatus */}
              <option value="Tersedia">Tersedia</option>
              <option value="Sedang Operasi">Sedang Operasi</option>
              <option value="Kotor">Kotor</option>
              <option value="Dibersihkan">Dibersihkan</option>
              <option value="Perbaikan">Perbaikan</option>
            </select>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
