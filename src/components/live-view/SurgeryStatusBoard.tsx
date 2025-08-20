'use client';
import useSWR from 'swr';
import StatusCard from './StatusCard';
import Spinner from '@/components/ui/Spinner';
import { mockSurgeryBoard } from '@/lib/mock-data'; // Impor data dummy
import { OngoingSurgery } from '@/types';

// Fungsi 'fetcher' untuk SWR.
// Di dunia nyata, ini akan memanggil API Anda.
// Untuk sekarang, kita kembalikan data dummy dengan sedikit delay.
const fetcher = (url: string): Promise<OngoingSurgery[]> => 
  new Promise(resolve => setTimeout(() => resolve(mockSurgeryBoard), 1000));

export default function SurgeryStatusBoard() {
  // Gunakan SWR untuk mengambil data dan refresh otomatis setiap 30 detik
  const { data: surgeryList, error, isLoading } = useSWR(
    '/api/surgery-status', // Kunci API unik
    fetcher,
    { refreshInterval: 30000 } // Refresh setiap 30 detik (30000 ms)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  }

  if (error || !surgeryList) {
    return <p className="text-center text-red-500 text-2xl">Gagal memuat data.</p>;
  }
  
  if (surgeryList.length === 0) {
    return <p className="text-center text-gray-500 text-2xl">Tidak ada operasi yang sedang berlangsung.</p>;
  }

  return (
    // Grid untuk menampilkan beberapa status sekaligus
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {surgeryList.map((surgery) => (
        <StatusCard key={surgery.caseId} data={surgery} />
      ))}
    </div>
  );
}