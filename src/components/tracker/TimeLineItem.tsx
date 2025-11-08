import { Check, Clock } from 'lucide-react';

// Menambahkan prop opsional 'isLast' untuk styling
interface TimelineItemProps {
  title: string;
  timestamp: string | null;
  description: string;
  status: 'Diterima' | 'Operasi Berlangsung' | 'Ruang Pemulihan';
  isLast?: boolean; // Untuk mengetahui apakah ini item terakhir
}

// Sub-komponen untuk Ikon Status
const StatusIcon = ({ status }: { status: TimelineItemProps['status'] }) => {
  const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0";

  if (status === 'Diterima') {
    return <div className={`${baseClasses} bg-green-500`}><Check size={24} /></div>;
  }
  if (status === 'Operasi Berlangsung') {
    // Animasi pulse untuk menandakan status aktif saat ini
    return <div className={`${baseClasses} bg-blue-500 animate-pulse`}><Clock size={24} /></div>;
  }
  // Status 'pending'
  return <div className={`${baseClasses} bg-gray-300`}></div>;
};

/**
 * TimelineItem adalah komponen yang menampilkan satu tahapan (event) 
 * dalam sebuah linimasa vertikal.
 */
export default function TimelineItem({ title, timestamp, description, status, isLast = false }: TimelineItemProps) {
  const isPending = status === 'Ruang Pemulihan';

  return (
    <div className="flex">
      {/* Kolom Kiri: Ikon dan Garis Penghubung */}
      <div className="flex flex-col items-center mr-4">
        <StatusIcon status={status} />
        {/* Jangan render garis jika ini adalah item terakhir */}
        {!isLast && <div className="w-px h-20 bg-gray-300 mt-2"></div>}
      </div>

      {/* Kolom Kanan: Konten Teks */}
      <div className={`py-1 w-full ${isPending ? 'opacity-50' : ''}`}>
        <h4 className="font-bold text-gray-200 text-lg">{title}</h4>
        
        {/* Tampilkan timestamp hanya jika ada */}
        {timestamp ? (
          <p className="text-sm text-gray-500 mt-1">
            {new Date(timestamp).toLocaleString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1 italic">Menunggu</p>
        )}

        <p className="text-base text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  );
}