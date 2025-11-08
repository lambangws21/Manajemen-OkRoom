'use client';
import useSWR from 'swr';
// Asumsi StatusCard diimpor dari sini, jika tidak, Anda harus memperbaikinya di lingkungan lokal
import StatusCard from './StatusCard'; 
import Spinner from '@/components/ui/Spinner';
import { OngoingSurgery } from '@/types';
import { AlertTriangle } from 'lucide-react'; // Impor AlertTriangle




/**
 * Mendapatkan tanggal hari ini dalam format YYYY-MM-DD (misal: "2025-11-07")
 * Ini penting untuk query parameter
 */
const getTodayYYYYMMDD = (): string => {
  const today = new Date(); // Menggunakan zona waktu lokal
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
      
// Fungsi fetcher (tidak berubah)
const fetcher = async (url: string): Promise<OngoingSurgery[]> => {
    const res = await fetch(url);
    if (!res.ok) {
        // Jika respons tidak OK, lempar error agar SWR menangkapnya
        throw new Error(`Gagal memuat data. Status: ${res.status}`);
    }
    return res.json();
};

export default function SurgeryStatusBoard() {
  // 💥 PERUBAHAN 1: Dapatkan tanggal hari ini
  const today = getTodayYYYYMMDD();

  // 💥 PERUBAHAN 2: Tambahkan tanggal ke kunci SWR (URL API)
  // SWR akan otomatis memanggil URL ini: /api/operasi?tanggal=2025-11-07
  const { data: surgeryList, error, isLoading } = useSWR(
    `/api/operasi?tanggal=${today}`, 
    fetcher,
    { 
        // Refresh setiap 30 detik untuk papan live view
        refreshInterval: 30000 
    }
  );

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-48 w-full">
            <Spinner size="lg" />
            <span className="ml-3 text-lg text-gray-400">Memuat status operasi...</span>
        </div>
    );
  }

  if (error || !surgeryList) {
    return (
        <div className="text-center p-8 bg-red-900/30 rounded-lg">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-400 mb-3" />
            <p className="text-red-300 text-lg">Gagal memuat data: {error ? error.message : 'Koneksi terputus.'}</p>
        </div>
    );
  }
  
  if (surgeryList.length === 0) {
    // 💥 PERUBAHAN 3: Pesan disesuaikan untuk filter tanggal
    return <p className="text-center text-gray-500 text-2xl mt-12">Tidak ada operasi yang sedang berlangsung untuk hari ini.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {surgeryList.map((surgery) => (
        // Asumsi StatusCard menerima prop 'data'
        <StatusCard
        key={surgery.id}
        data={{
          ...surgery,
          team: surgery.assignedTeam ?? { anesthesiologistId: '', nurseIds: [] },
        }}
      />
      
      ))}
    </div>
  );
}