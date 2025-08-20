'use client';

import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Room } from '@/types';
import { motion, Variants } from 'framer-motion'; // <-- Impor motion & Variants

export interface Filters {
  search: string;
  status: 'All' | Room['status'];
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

export default function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    // Gunakan motion.div sebagai pembungkus Card
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/2 text-slate-500">
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
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Semua Status</option>
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