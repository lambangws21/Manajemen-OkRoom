'use client';

import { useState, useEffect } from 'react';
// 💥 PERBAIKAN: Impor ikon baru untuk statistik
import { Bed, Activity, CheckCircle, Users } from 'lucide-react';
// 💥 PERBAIKAN: Memastikan path import Card benar (menggunakan path dari konteks sebelumnya, bukan ui/ui)
import { Card } from '@/components/ui/ui/card';

// 💥 DIHAPUS: Semua impor Firebase (initializeApp, getAuth, getFirestore, dll.)
// tidak lagi diperlukan karena kita menggunakan fetch API.

// ----------------------------------------------------------------
// Definisi Tipe Data (Asumsi)
// ----------------------------------------------------------------
interface ScheduledSurgery {
  id: string;
  scheduledAt: string; // ISO string
  status: string;
  // 💥 PERBAIKAN: Tambahkan assignedOR (sesuai permintaan Anda)
  assignedOR?: string; 
  // ... bidang lainnya
}

interface OperatingRoom {
  id: string;
  status: string; // Status master list (mungkin tidak real-time)
  // ... bidang lainnya
}

// 💥 PERBAIKAN: Tipe data shift (Asumsi berdasarkan RoomGrid)
interface ShiftAssignment {
    anesthesiaTeam: StaffMember[];
    nurseTeams: {
        Pagi: StaffMember[];
        Siang: StaffMember[];
        Malam: StaffMember[];
    };
}
// (Asumsi StaffMember diimpor di tempat lain atau tidak krusial untuk .length)
interface StaffMember { id: string; name: string; }


// 💥 PERBAIKAN: Interface Stats baru sesuai permintaan
interface Stats {
  operasiBerlangsung: number;
  pasienSelesai: number;
  okTersedia: number;
  staffDinas: number;
}

// ----------------------------------------------------------------
// Komponen StatCard (Tidak berubah)
// ----------------------------------------------------------------
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <Card className="flex items-center p-4">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </Card>
);

// Helper untuk mendapatkan tanggal hari ini (YYYY-MM-DD)
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// ----------------------------------------------------------------
// Komponen Utama DashboardHeader
// ----------------------------------------------------------------
export default function DashboardHeader() {
  
  // 🔹 State untuk Firebase dan Data
  // 💥 DIHAPUS: State db dan userId tidak lagi diperlukan
  // const [db, setDb] = useState<Firestore | null>(null);
  // const [userId, setUserId] = useState<string | null>(null);
  
  // 💥 PERBAIKAN: State baru untuk statistik
  const [stats, setStats] = useState<Stats>({
    operasiBerlangsung: 0,
    pasienSelesai: 0,
    okTersedia: 0,
    staffDinas: 0,
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Inisialisasi Firebase (DIHAPUS)
  // useEffect(() => { ... }, []);

  // 💥 PERBAIKAN: Menggunakan fetch API untuk mengambil data statistik
  useEffect(() => {
    
    const fetchAllStats = async () => {
      setLoading(true);
      const today = getTodayDateString();

      try {
        // 1. Ambil semua data secara paralel dari API handler
        const [scheduleRes, roomsRes, shiftRes] = await Promise.all([
          fetch('/api/schedule'),
          // (Mengambil master list kamar dari /api/room-assignments sesuai kode Anda)
          fetch('/api/room-assignments'), 
          // (Mengambil data staff dinas)
          fetch('/api/shift-assignments') 
        ]);

        if (!scheduleRes.ok) throw new Error('Gagal memuat data jadwal.');
        if (!roomsRes.ok) throw new Error('Gagal memuat data master kamar operasi.');
        if (!shiftRes.ok) throw new Error('Gagal memuat data shift dinas.');

        const scheduleData: ScheduledSurgery[] = await scheduleRes.json();
        const roomsData: OperatingRoom[] = await roomsRes.json();
        // Asumsi /api/shift-assignments mengembalikan array, dan kita ambil data pertama
        const shiftDataArray: ShiftAssignment[] = await shiftRes.json();
        const shiftData = shiftDataArray.length > 0 ? shiftDataArray[0] : null;

        // 2. Proses data untuk menghitung statistik
        let departuresToday = 0;
        let operasiBerlangsungToday = 0;
        let totalStaff = 0;
        
        // 💥 PERBAIKAN: Gunakan Set untuk melacak kamar yang "sibuk" hari ini
        const occupiedRoomIDsToday = new Set<string>();

        // Proses Jadwal (Schedule)
        for (const surgery of scheduleData) {
          if (surgery.scheduledAt && surgery.scheduledAt.startsWith(today)) {
            
            // Hitung Pasien Selesai Hari Ini
            if (surgery.status === 'Operasi Selesai' || surgery.status === 'Ruang Pemulihan' || surgery.status === 'Selesai') {
              departuresToday++;
            }
            
            // Hitung Operasi Berlangsung Hari Ini
            if (surgery.status === 'Operasi Berlangsung' || surgery.status === 'Sedang Tindakan') {
              operasiBerlangsungToday++;
            }

            // 💥 PERBAIKAN: Cek apakah status ini membuat kamar "sibuk"
            // (Asumsi: 'Selesai' atau 'Dibatalkan' berarti kamar sudah/akan tersedia)
            const isBusyStatus = surgery.status !== 'Selesai' && 
                                 surgery.status !== 'Dibatalkan' &&
                                 surgery.status !== 'Tersedia'; // (Jika 'Tersedia' adalah status di jadwal)

            // Tandai kamar sebagai sibuk jika ada jadwal hari ini (dari assignedOR)
            if (isBusyStatus && surgery.assignedOR) {
              occupiedRoomIDsToday.add(surgery.assignedOR);
            }
          }
        }

        // 💥 PERBAIKAN (NaN): Pastikan roomsData adalah array sebelum mengambil .length
        const totalRooms = Array.isArray(roomsData) ? roomsData.length : 0;
        
        // 💥 PERBAIKAN: Hitung OK Tersedia berdasarkan (Total Kamar - Kamar Sibuk Hari Ini)
        // Ini sekarang dihitung berdasarkan data 'assignedOR' dari schedule
        const okTersedia = totalRooms - occupiedRoomIDsToday.size;
        
        // Proses Shift (Staff Dinas)
        if (shiftData) {
           totalStaff += (shiftData.anesthesiaTeam || []).length;
           totalStaff += (shiftData.nurseTeams?.Pagi || []).length;
           totalStaff += (shiftData.nurseTeams?.Siang || []).length;
           totalStaff += (shiftData.nurseTeams?.Malam || []).length;
        }

        // 3. Set state statistik
        setStats({
          // 💥 PERBAIKAN (NaN): Pastikan nilai default ke 0 jika NaN
          operasiBerlangsung: operasiBerlangsungToday || 0,
          pasienSelesai: departuresToday || 0,
          okTersedia: okTersedia || 0, // Menggunakan kalkulasi baru
          staffDinas: totalStaff || 0,
        });

      } catch (error) {
        console.error("Gagal memuat statistik dashboard:", error);
        // Jika gagal, tampilkan 0
        setStats({
          operasiBerlangsung: 0,
          pasienSelesai: 0,
          okTersedia: 0,
          staffDinas: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    // Panggil fungsi fetch
    fetchAllStats();
    
  }, []); // Hanya berjalan sekali saat komponen dimuat


  // 🔹 Tampilkan data (atau placeholder "...") saat loading
  const statsToDisplay = loading ? {
    operasiBerlangsung: '...',
    pasienSelesai: '...',
    okTersedia: '...',
    staffDinas: '...',
  } : stats;

  return (
    // 💥 PERBAIKAN: Tampilkan 4 kartu statistik baru
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard icon={<Activity size={24} className="text-red-800"/>} label="Operasi Berlangsung" value={statsToDisplay.operasiBerlangsung} color="bg-red-100" />
      <StatCard icon={<CheckCircle size={24} className="text-green-800"/>} label="Pasien Selesai (Hari Ini)" value={statsToDisplay.pasienSelesai} color="bg-green-100" />
      <StatCard icon={<Bed size={24} className="text-blue-800"/>} label="OK Tersedia" value={statsToDisplay.okTersedia} color="bg-blue-100" />
      <StatCard icon={<Users size={24} className="text-indigo-800"/>} label="Staff Dinas Hari Ini" value={statsToDisplay.staffDinas} color="bg-indigo-100" />
    </div>
  );
}

