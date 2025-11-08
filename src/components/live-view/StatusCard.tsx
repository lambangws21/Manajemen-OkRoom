'use client';

import { OngoingSurgery } from '@/types/index';
import Card from '@/components/ui/card';
import { Clock, Syringe, Bed, Check, Clock1, User, HeartPulse, Hospital, Tag, } from 'lucide-react';

// Tipe yang diperluas karena ongoingSurgeries menyimpan ID, nama pasien, dan MRN
interface ExtendedOngoingSurgery extends OngoingSurgery {
  team?: {
    anesthesiologistId: string;
    nurseIds: string[];
  };
}



const statusConfig = {
  'Persiapan Operasi': {
    label: 'PERSIAPAN',
    color: 'bg-yellow-500',
    icon: <Syringe size={36} className="text-white" />
  },
  'Operasi Berlangsung': {
    label: 'OPERASI BERLANGSUNG',
    color: 'bg-red-600 animate-pulse',
    icon: <Clock size={36} className="text-white" />
  },
  'Ruang Pemulihan': {
    label: 'RUANG PEMULIHAN',
    color: 'bg-blue-500',
    icon: <Bed size={36} className="text-white" />
  },
  'Operasi Selesai': {
    label: 'SELESAI',
    color: 'bg-gray-500',
    icon: <Check size={36} className="text-white" />
  },
};

interface StatusCardProps {
  data: ExtendedOngoingSurgery;
}

// Fungsi untuk memformat waktu ISO ke HH:MM (WITA/WIB)
const formatTime = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            // timeZone: 'Asia/Makassar' 
        });
    } catch {
        return 'Format Waktu Error';
    }
};


export default function StatusCard({ data }: StatusCardProps) {
  const config = statusConfig[data.status as keyof typeof statusConfig] || {
    label: 'STATUS TIDAK DIKENAL',
    color: 'bg-gray-500',
    icon: <Clock size={36} className="text-white" />
  };

  const formattedStartTime = formatTime(data.startTime);
  
  return (
    // 💥 PERBAIKAN UI: Card layout fleksibel penuh
    <Card className="p-0 overflow-hidden min-h-[250px] dark:bg-gray-800 shadow-xl flex flex-col">
      
      {/* STATUS BAR (Header Utama) */}
      <div className={`p-4 flex items-center ${config.color} shadow-lg`}>
        {config.icon}
        <p className="ml-4 font-bold text-xl sm:text-2xl text-white">{config.label}</p>
      </div>
      
      {/* KONTEN UTAMA */}
      <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between">
        
        {/* WAKTU & INFO PASIEN (Atas) */}
        <div className="mb-4">
            
            {/* Waktu Mulai */}
            <div className="flex items-center justify-between text-sm mb-2 text-gray-500 dark:text-gray-400">
                <span className="flex items-center font-semibold">
                    <Clock1 size={24} className="mr-1 text-blue-500 flex-shrink-0" />
                    Diterima: <span className="ml-1 text-gray-700 dark:text-gray-100">{formattedStartTime}</span>
                </span>
                
                {/* Kamar Operasi */}
                <span className="flex items-center font-semibold text-gray-700 dark:text-gray-200">
                     <Hospital size={34} className="mr-1 text-purple-500" />
                     {data.operatingRoom}
                </span>
            </div>

            {/* NAMA PASIEN & MRN */}
            {/* <p className="text-xs font-medium text-gray-500 dark:text-gray-400">PASIEN ({data.mrn || 'N/A'})</p> */}
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
                {data.patientName || 'N/A'}
            </p>
        </div>
        
        {/* PROSEDUR & DOKTER (Bawah) */}
        <div>
            {/* Prosedur */}
            <p className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center">
                <HeartPulse size={16} className="mr-2" />
                {data.procedure}
            </p>
            
            <hr className="my-3 border-gray-200 dark:border-gray-700" />
            
            {/* Dokter Operator & Case ID */}
            <div className="space-y-1">
                 <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dokter Operator</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Tag size={12} className="mr-1" /> ID: {data.caseId}
                    </span>
                 </div>
                 
                 <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                    <User size={18} className="mr-2 flex-shrink-0" />
                    {data.doctorName || 'Belum Ditugaskan'}
                 </p>
            </div>
        </div>

        {/* 💥 DIHAPUS: Tim Jaga Anestesi & Perawat */}
      </div>
    </Card>
  );
}