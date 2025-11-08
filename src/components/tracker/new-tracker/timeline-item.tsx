
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { TimelineStatus } from '@/types/tracker';

// Sub-component untuk Ikon Status
const StatusIcon = ({ status }: { status: TimelineStatus }) => {
  const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0";

  if (status === 'Ruang Pemulihan') {
    return <div className={`${baseClasses} bg-green-500`}><Check size={24} /></div>;
  }
  if (status === 'Operasi Berlangsung') {
    // Animasi pulse untuk menandakan status aktif saat ini
    return <div className={`${baseClasses} bg-blue-500 animate-pulse`}><Clock size={24} /></div>;
  }
  // Status 'Menunggu'
  return <div className={`${baseClasses} bg-gray-300 dark:bg-gray-600`}></div>;
};

interface TimelineItemProps {
  title: string;
  timestamp: string | null | undefined;
  description: string;
  status: TimelineStatus; 
  isLast?: boolean; 
}

/**
 * TimelineItem adalah komponen yang menampilkan satu tahapan (event) 
 * dalam sebuah linimasa vertikal.
 */
export function TimelineItem({ title, timestamp, description, status, isLast = false }: TimelineItemProps) {
  const isPending = status === 'Diterima';
  const timestampDisplay = timestamp ? (
      new Date(timestamp).toLocaleString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'long',
      })
  ) : (
      'Diterima'
  );

  return (
    <div className="flex">
      {/* Kolom Kiri: Ikon dan Garis Penghubung */}
      <div className="flex flex-col items-center mr-4">
        <StatusIcon status={status} />
        {/* Jangan render garis jika ini adalah item terakhir */}
        {!isLast && <div className={`w-px h-20 mt-2 ${status === 'Ruang Pemulihan' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>}
      </div>

      {/* Kolom Kanan: Konten Teks */}
      <div className={`py-1 w-full ${isPending ? 'opacity-50' : ''}`}>
        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{title}</h4>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {timestampDisplay}
        </p>

        <p className="text-base text-gray-600 dark:text-gray-300 mt-2">{description}</p>
      </div>
    </div>
  );
}