'use client';

import {Badge} from '@/components/ui/ui/badge';
import { motion, Variants } from 'framer-motion'; 
import { cn } from '@/lib/utils';
// 🔹 Impor Tipe dasar dari @/types
import { OperatingRoom, StaffMember } from '@/types';

// -----------------------------------------------------------------
// 🔹 DEFINISI TIPE (Disalin dari RoomGrid.tsx agar sinkron)
// -----------------------------------------------------------------

// Tipe ini mendefinisikan staf yang aktif (mungkin memiliki info shift)
interface ActiveStaff extends StaffMember {
  duty: string;
}
// Tipe ini adalah array dari staf aktif yang ditugaskan ke kamar
type RoomTeam = ActiveStaff[]; 

// Tipe ini adalah Tipe 'room' yang SEBENARNYA dikirim dari RoomGrid
// Ini adalah gabungan dari OperatingRoom + data tim
interface ProcessedRoom extends OperatingRoom {
  name: string;
  description: string;
  team: RoomTeam; // Tim yang ditugaskan
}
// -----------------------------------------------------------------


// 🔹 Props sekarang menerima Tipe 'ProcessedRoom' yang sudah kita definisikan
interface RoomCardProps {
  room: ProcessedRoom;
}

// 🔹 PERBAIKAN: Mengubah cara 'StatusConfig' didefinisikan
// 1. Definisikan tipe untuk *nilai* config
type StatusConfigValue = { 
    color: 'green' | 'red' | 'yellow' | 'indigo' | 'gray'; 
    label: string;
    borderColor: string;
};
// 2. Definisikan StatusConfig sebagai Record (dictionary)
type StatusConfig = Record<string, StatusConfigValue>;
// 🔹 AKHIR PERBAIKAN

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  },
};

export default function RoomCard({ room }: RoomCardProps) {
  // 🔹 Tipe (Partial<StatusConfig>) sekarang sudah benar
  const statusConfig: Partial<StatusConfig> = {
    'Tersedia': { color: 'green', label: 'Tersedia', borderColor: 'border-green-500' },
    'Operasi Berlangsung': { color: 'red', label: 'Operasi Berlangsung', borderColor: 'border-red-500' },
    'Kotor': { color: 'yellow', label: 'Kotor', borderColor: 'border-yellow-500' },
    'Dibersihkan': { color: 'indigo', label: 'Dibersihkan', borderColor: 'border-indigo-500' },
    'Perbaikan': { color: 'gray', label: 'Perbaikan', borderColor: 'border-gray-500' },
    
    // 🔹 Fallback untuk status dari 'getRoomStatusFromSurgery' di RoomGrid
    'Dipakai': { color: 'red', label: 'Sedang Operasi', borderColor: 'border-red-500' },
    'Persiapan': { color: 'yellow', label: 'Persiapan', borderColor: 'border-yellow-500' },
    'Pembersihan': { color: 'indigo', label: 'Pembersihan', borderColor: 'border-indigo-500' },
  };

  const config = statusConfig[room.status];

  // 🔹 Pencegahan Error: Jika status tidak dikenal, jangan render card (atau beri default)
  if (!config) {
    console.warn(`Status tidak dikenal: ${room.status} untuk OK ${room.number}`);
    // Beri status default agar tidak crash
    // 🔹 PERBAIKAN: Berikan Tipe eksplisit ke defaultConfig
    const defaultConfig: StatusConfigValue = { color: 'gray', label: room.status, borderColor: 'border-gray-500' };
    return <BaseRoomCard room={room} config={defaultConfig} />;
  }

  return <BaseRoomCard room={room} config={config} />;
}

// 🔹 Memisahkan JSX Card agar lebih bersih
// 🔹 PERBAIKAN: Ubah tipe prop 'config'
function BaseRoomCard({ room, config }: { room: ProcessedRoom, config: StatusConfigValue }) {
  return (
    <motion.div
      className={cn("bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 shadow-sm hover:shadow-lg transition-shadow", config.borderColor)}
      variants={cardVariants}
      whileHover={{
        scale: 1.03, // Sedikit kurangi efek hover agar tidak terlalu 'melompat'
        boxShadow: "0px 8px 16px rgba(0,0,0,0.1)",
        transition: { type: "spring", stiffness: 300 }
      }}
    >
      <div className="flex justify-between items-center mb-2">
        {/* 🔹 PERBAIKAN: Typo '...' diperbaiki dan warna disesuaikan */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">OK {room.number}</h3>
        <Badge >{config.label}</Badge>
      </div>
      
      {/* 🔹 Menampilkan deskripsi kamar (lebih relevan daripada 'type') */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{room.description}</p>

      {/* 🔹 Menampilkan tim perawat yang ditugaskan */}
      {room.team && room.team.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Tim Bertugas:</h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            {room.team.map(staff => (
              <li key={staff.id}>{staff.name} ({staff.role})</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

