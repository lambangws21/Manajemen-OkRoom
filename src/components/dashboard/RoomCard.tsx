'use client';

import { Room } from '@/types';
import Badge from '@/components/ui/Badge';
// DIUBAH: Impor 'Variants' dari framer-motion
import { motion, Variants } from 'framer-motion'; 
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
}

type StatusConfig = {
    [key in Room['status']]: { 
        color: 'green' | 'red' | 'yellow' | 'indigo' | 'gray'; 
        label: string;
        borderColor: string;
    };
};

// DIUBAH: Berikan tipe 'Variants' dan hapus properti 'hover'
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  },
};

export default function RoomCard({ room }: RoomCardProps) {
  const statusConfig: StatusConfig = {
    'Tersedia': { color: 'green', label: 'Tersedia', borderColor: 'border-green-500' },
    'Sedang Operasi': { color: 'red', label: 'Sedang Operasi', borderColor: 'border-red-500' },
    'Kotor': { color: 'yellow', label: 'Kotor', borderColor: 'border-yellow-500' },
    'Dibersihkan': { color: 'indigo', label: 'Dibersihkan', borderColor: 'border-indigo-500' },
    'Perbaikan': { color: 'gray', label: 'Perbaikan', borderColor: 'border-gray-500' },
  };

  const config = statusConfig[room.status];

  return (
    <motion.div
      className={cn("bg-white dark:bg-slate-100 rounded-lg p-4 border-l-4", config.borderColor)}
      variants={cardVariants}
      // DIUBAH: Definisikan animasi hover langsung di prop 'whileHover'
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
        transition: { type: "spring", stiffness: 300 }
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-800">OK {room.number}</h3>
        <Badge colorScheme={config.color}>{config.label}</Badge>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-500">{room.type}</p>
    </motion.div>
  );
}