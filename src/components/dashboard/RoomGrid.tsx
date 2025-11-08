'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
// 💥 PERBAIKAN: Hapus impor Filters dari FilterControls
// import { Filters } from '@/components/dashboard/FilterControls'; 
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, User, Users, UserCircle2, HeartPulse, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
// 🔹 Impor Tipe Jadwal (Asumsi Tipe ini ada di @/types)
import { OperatingRoom, StaffMember, ScheduledSurgery } from '@/types'; 

// ----------------------------------------------------------------
// 🔹 TIPE DATA DAN UTILITAS BARU
// ----------------------------------------------------------------

// Tipe Shift Assignment (asumsi dari API /api/shift-assignments)
interface ShiftAssignment {
    anesthesiaTeam: StaffMember[];
    nurseTeams: {
        Pagi: StaffMember[];
        Siang: StaffMember[];
        Malam: StaffMember[];
    };
    responsibleStaff?: StaffMember;
}

// Tipe untuk data yang dikirimkan di proses
interface ProcessedRoom extends Omit<OperatingRoom, 'status' | 'patientName' | 'procedure'> {
  name: string;
  description: string;
  team: StaffMember[]; 
  patientName: string | null; 
  procedure: string | null;  
  status: string; 
  doctorName: string | null;
  scheduledSurgeries: ScheduledSurgery[]; 
}

type RoomAssignmentsMap = Record<string, StaffMember[]>; 
type StaffShiftMap = Record<string, 'Pagi' | 'Siang' | 'Malam' | 'Anestesi'>;

// 🔹 Fungsi untuk menentukan shift saat ini
const getCurrentShift = (): 'Pagi' | 'Siang' | 'Malam' => {
  const hour = new Date().getHours();
  // Asumsi shift: Pagi (7-14), Siang (14-21), Malam (21-7)
  if (hour >= 7 && hour < 14) return 'Pagi';
  if (hour >= 14 && hour < 21) return 'Siang';
  return 'Malam';
};

// 💥 BARU: Helper untuk mendapatkan tanggal hari ini (YYYY-MM-DD)
const getTodayDateString = () => new Date().toISOString().split('T')[0];


// ----------------------------------------------------------------
// 🔹 VARIAN & HELPER
// ----------------------------------------------------------------

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } },
};

// 🔹 HELPER: Fungsi untuk menerjemahkan status jadwal ke GAYA (warna) kartu
// (Logika status 'Tersedia' tetap penting untuk filter di useMemo)
const mapScheduleStatusToRoomStyle = (surgeryStatus?: string): { statusCategory: string, colorClass: string, cardBg: string, textColorClass: string } => {
  switch (surgeryStatus) {
    case 'Operasi Berlangsung':
    case 'Sedang Tindakan': 
      return { 
        statusCategory: 'Operasi Berlangsung', 
        colorClass: 'border-red-600', 
        cardBg: 'bg-red-50 dark:bg-red-900/30',
        textColorClass: 'text-red-700 dark:text-red-300' 
      };
    case 'Persiapan Operasi':
    case 'Terkonfirmasi': 
    case 'Pasien Diterima': 
      return { 
        statusCategory: 'Persiapan', 
        colorClass: 'border-yellow-600', 
        cardBg: 'bg-yellow-50 dark:bg-yellow-900/30',
        textColorClass: 'text-yellow-700 dark:text-yellow-300'
      };
    case 'Operasi Selesai':
    case 'Ruang Pemulihan':
      return { 
        statusCategory: 'Pembersihan', 
        colorClass: 'border-indigo-600', 
        cardBg: 'bg-indigo-50 dark:bg-indigo-900/30',
        textColorClass: 'text-indigo-700 dark:text-indigo-300'
      };
    case 'Dibatalkan': 
    case 'Selesai':
    default:
      return { 
        statusCategory: 'Tersedia', 
        colorClass: 'border-green-600', 
        cardBg: 'bg-white dark:bg-slate-800/50', 
        textColorClass: 'text-green-700 dark:text-green-300' 
      }; 
  }
};

// 💥 BARU: Definisi Tipe Filters (karena FilterControls dihapus)
// Tipe ini harus cocok dengan yang diharapkan oleh DashboardPage saat memanggil RoomGrid
export interface Filters {
  search: string;
  status: 'All' | string; // Menggunakan string umum agar cocok dengan { status: 'All' }
}

interface RoomGridProps {
  filters: Filters;
}

// ----------------------------------------------------------------
// 🔹 SUB-KOMPONEN: RoomCardWithSlider
// ----------------------------------------------------------------
interface RoomCardWithSliderProps {
    room: ProcessedRoom;
    currentShift: 'Pagi' | 'Siang' | 'Malam';
    staffShiftMap: StaffShiftMap;
}

const RoomCardWithSlider: React.FC<RoomCardWithSliderProps> = ({ room, currentShift, staffShiftMap }) => {
    
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const scheduledSurgeries = room.scheduledSurgeries || [];
    const maxIndex = scheduledSurgeries.length - 1;
    
    // Tentukan slide yang sedang aktif untuk ditampilkan
    const activeSurgery = scheduledSurgeries[activeSlideIndex] || null;

    // 💥 PERBAIKAN: Tampilkan status asli dari jadwal (activeSurgery.status) jika ada,
    // jika tidak, gunakan status kamar default (room.status, yaitu 'Tersedia')
    const displayStatus = activeSurgery ? activeSurgery.status : room.status;
    
    // 💥 PERBAIKAN: Tetap gunakan mapScheduleStatusToRoomStyle untuk mendapatkan GAYA (warna/bg)
    // berdasarkan status asli (activeSurgery.status) atau status kamar (room.status)
    const { colorClass, cardBg, textColorClass } = mapScheduleStatusToRoomStyle(activeSurgery ? activeSurgery.status : room.status);

    // 🔹 Logic Slide Manual
    const handleNext = () => {
        setActiveSlideIndex(prevIndex => (prevIndex === maxIndex ? 0 : prevIndex + 1));
    };

    const handlePrev = () => {
        setActiveSlideIndex(prevIndex => (prevIndex === 0 ? maxIndex : prevIndex - 1));
    };

    // Auto-slide effect (15 detik)
    useEffect(() => {
        if (scheduledSurgeries.length > 1) {
            const timer = setInterval(() => {
                setActiveSlideIndex(prevIndex => 
                    (prevIndex + 1) % scheduledSurgeries.length
                );
            }, 15000); 
            return () => clearInterval(timer);
        } else {
            setActiveSlideIndex(0); // Reset index jika hanya ada satu atau nol
        }
    }, [scheduledSurgeries.length]);
    
    // 💥 PERBAIKAN (REVERT): Kembali ke logika HANYA menampilkan staf untuk SHIFT SAAT INI + Anestesi
    const relevantTeam = room.team.filter(staff => {
        const shift = staffShiftMap[staff.id];
        return shift === currentShift || shift === 'Anestesi'; // Logic lama (sesuai permintaan)
        // return shift !== undefined; // Logic baru: Semua staf dinas (Pagi, Siang, Malam, Anestesi)
    });
    const relevantTeamCount = relevantTeam.length;

    return (
        <motion.div 
            key={room.id} 
            className={`p-4 rounded-lg shadow-md border-l-4 ${colorClass} ${cardBg} border-slate-200 dark:border-slate-700 overflow-hidden`}
            variants={itemVariants}
        >
            {/* Status Tag - Menampilkan status asli */}
            <div className={`text-xs font-semibold py-1 px-2 rounded-full mb-2 inline-block border ${colorClass} ${textColorClass} bg-white dark:bg-slate-900`}>
              {displayStatus}
            </div>
            
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{room.name}</h4>
            
            {scheduledSurgeries.length > 0 && activeSurgery ? (
                // 🔹 SLIDE CONTAINER UTAMA
                <motion.div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeSurgery.id} 
                            initial={{ opacity: 0, x: 50 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm space-y-1 mt-2 p-2 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 relative overflow-hidden"
                        >
                            {/* Slide Indicator & Navigasi Manual */}
                            {scheduledSurgeries.length > 1 && (
                                <div className="absolute top-0 right-0 p-1 flex items-center bg-white/80 dark:bg-slate-800/80 rounded-bl-lg shadow-sm border-l border-b border-slate-200 dark:border-slate-600 z-10">
                                    {/* Tombol Prev */}
                                    <button 
                                        onClick={handlePrev} 
                                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 p-0.5"
                                        aria-label="Previous patient"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mx-1">
                                        {activeSlideIndex + 1}/{scheduledSurgeries.length}
                                    </span>
                                    
                                    {/* Tombol Next */}
                                    <button 
                                        onClick={handleNext} 
                                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 p-0.5"
                                        aria-label="Next patient"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}

                            <p className="font-medium text-red-600 dark:text-red-300 flex items-center text-md pt-2">
                                <UserCircle2 size={16} className="mr-1 text-red-500" /> 
                                Pasien: {activeSurgery.patientName || 'N/A'}
                            </p>
                            <p className="font-medium text-blue-600 dark:text-blue-300 flex items-center text-md">
                                <User size={16} className="mr-1 text-blue-500" />
                                Dokter: {activeSurgery.doctorName || 'Belum Ditugaskan'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 truncate flex items-center">
                                <HeartPulse size={16} className="mr-1 text-red-500 animate-pulse" /> Prosedur: {activeSurgery.procedure || '-'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            ) : (
                // Tampilkan info kamar default jika tidak ada jadwal aktif
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{room.description}</p>
            )}

            {/* Tim Bertugas (Bawah) */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              {/* 💥 PERBAIKAN (REVERT): Ubah judul kembali ke shift saat ini */}
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex items-center mb-1">
                <Users size={14} className="mr-1" />
                Tim {currentShift} ({relevantTeamCount} Staf)
              </span>
              
              {relevantTeamCount > 0 ? (
                // 💥 PERBAIKAN: Tinggikan max-h agar muat lebih banyak staf
                <div className="max-h-24 overflow-y-auto space-y-0.5 text-sm">
                  {relevantTeam.map((staff) => (
                    <p key={staff.id} className="flex items-center text-gray-700 dark:text-gray-300">
                      <User size={12} className="mr-1 text-indigo-400 flex-shrink-0" />
                      {staff.name} 
                      {/* 💥 PERBAIKAN: Tampilkan shift dinas (Pagi/Siang/Anestesi) */}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({staffShiftMap[staff.id] || staff.role})
                      </span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Tidak ada staf yang bertugas shift ini.</p>
              )}
            </div>
        </motion.div>
    );
}

// ----------------------------------------------------------------
// 🔹 KOMPONEN UTAMA
// ----------------------------------------------------------------
export default function RoomGrid({ filters }: RoomGridProps) {
  // 🔹 3. State untuk data dinamis
  const [masterRooms, setMasterRooms] = useState<ProcessedRoom[]>([]); 
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>([]); 
  const [shiftAssignment, setShiftAssignment] = useState<ShiftAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentShift = useMemo(getCurrentShift, []); 

  // 🔹 4. Fungsi Fetch Data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [assignmentsRes, scheduleRes, shiftRes] = await Promise.all([
        fetch('/api/room-assignments'), 
        fetch('/api/schedule'),
        fetch('/api/shift-assignments')
      ]);

      if (!assignmentsRes.ok) throw new Error('Gagal memuat penugasan tim kamar.'); 
      if (!scheduleRes.ok) throw new Error('Gagal memuat jadwal operasi.'); 
      if (!shiftRes.ok) throw new Error('Gagal memuat penugasan shift.');

      const roomAssignmentsData: RoomAssignmentsMap = await assignmentsRes.json();
      const scheduleData: ScheduledSurgery[] = await scheduleRes.json();
      const shiftData: ShiftAssignment = await shiftRes.json();
      
      setSchedule(scheduleData);
      setShiftAssignment(shiftData);

      // Membuat master list kamar dari roomAssignments keys
      const baseMasterRooms = Object.keys(roomAssignmentsData).map(roomId => {
        const team = roomAssignmentsData[roomId] || [];
        
        return {
          id: roomId,
          number: roomId.replace('OK ', ''), 
          name: `Kamar Operasi ${roomId.replace('OK ', '')}`, 
          status: 'Tersedia', 
          patientName: null,
          procedure: null,
          doctorName: null,
          description: `Penugasan untuk ${roomId}`, 
          team: team,
          scheduledSurgeries: [], // Inisialisasi daftar
        } as ProcessedRoom;
      });
      
      setMasterRooms(baseMasterRooms);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // 🔹 Hitung staffShiftMap
  const staffShiftMap: StaffShiftMap = useMemo(() => {
      const map: StaffShiftMap = {};
      if (shiftAssignment) {
          shiftAssignment.anesthesiaTeam.forEach(s => { map[s.id] = 'Anestesi'; }); 
          shiftAssignment.nurseTeams.Pagi.forEach(s => { map[s.id] = 'Pagi'; });
          shiftAssignment.nurseTeams.Siang.forEach(s => { map[s.id] = 'Siang'; });
          shiftAssignment.nurseTeams.Malam.forEach(s => { map[s.id] = 'Malam'; });
      }
      return map;
  }, [shiftAssignment]);

  // 🔹 5. Logika Penggabungan Data (Merge Tim + Jadwal HARI INI)
  const processedRooms: ProcessedRoom[] = useMemo(() => { 
    
    // 💥 BARU: Filter jadwal HANYA untuk hari ini
    const today = getTodayDateString();
    const todaySchedule = schedule.filter(s => s.scheduledAt.startsWith(today));

    // Map untuk mengumpulkan SEMUA jadwal yang relevan per kamar HARI INI
    const roomScheduleMap = new Map<string, ScheduledSurgery[]>();
    // 💥 BARU: Gunakan todaySchedule
    for (const surgery of todaySchedule) { 
      const roomNumber = surgery.assignedOR;
      if (!roomNumber) continue;

      // 💥 PERBAIKAN: Gunakan mapScheduleStatusToRoomStyle (fungsi yang diganti namanya)
      const { statusCategory: liveStatusCategory } = mapScheduleStatusToRoomStyle(surgery.status);
      
      // HANYA masukkan operasi yang BUKAN 'Tersedia' (yaitu sedang berjalan, persiapan, atau pembersihan)
      if (liveStatusCategory !== 'Tersedia') {
          if (!roomScheduleMap.has(roomNumber)) {
              roomScheduleMap.set(roomNumber, []);
          }
          roomScheduleMap.get(roomNumber)!.push(surgery);
      }
    }

    // Sort semua array jadwal berdasarkan scheduledAt (Pengurutan sesuai permintaan)
    roomScheduleMap.forEach(surgeries => {
        // 💥 PERBAIKAN (Error 2339 & 1005): Memperbaiki typo .getTime() dan tanda kurung
        surgeries.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    });


    return masterRooms.map(room => {
      // Ambil semua jadwal (hari ini) untuk kamar ini
      const activeSurgeries = roomScheduleMap.get(room.number) || []; 
      
      // Ambil operasi paling pertama (paling pagi) untuk menentukan status utama kamar
      const primarySurgery = activeSurgeries[0]; 

      if (primarySurgery) {
        // 💥 PERBAIKAN: Gunakan mapScheduleStatusToRoomStyle (fungsi yang diganti namanya)
        const { statusCategory: liveStatusCategory } = mapScheduleStatusToRoomStyle(primarySurgery.status);
        
        return {
          ...room,
          status: liveStatusCategory, // Status kategori (Persiapan, Berlangsung, Pembersihan)
          patientName: primarySurgery.patientName || null, 
          procedure: primarySurgery.procedure || null,
          doctorName: primarySurgery.doctorName || null,
          // 🔹 SIMPAN SEMUA DAFTAR JADWAL (HARI INI)
          scheduledSurgeries: activeSurgeries,
        };
      } else {
        // Kembalikan status 'Tersedia' jika tidak ada operasi aktif hari ini
        return { ...room, status: 'Tersedia', scheduledSurgeries: [] };
      }
    });
  // 💥 BARU: Tambahkan 'schedule' sebagai dependensi
  }, [schedule, masterRooms]);


  // 🔹 6. Logika Filter (dari prop)
  const filteredRooms: ProcessedRoom[] = useMemo(() => { 
    // Karena DashboardPage tidak lagi memiliki FilterControls,
    // 'filters' akan selalu { search: '', status: 'All' }
    const statusToFilter = filters?.status || 'All';
    const searchFilter = filters?.search || '';

    return processedRooms.filter(room => {
      const roomStatus = room.status || 'Tersedia'; 
      
      const statusMatch = statusToFilter === 'All' || roomStatus === statusToFilter;
      
      const search = searchFilter.toLowerCase();
      // Pencarian juga harus memeriksa semua jadwal (hari ini) jika ada
      const scheduleSearchMatch = (room.scheduledSurgeries || []).some(s => 
          (s.patientName && s.patientName.toLowerCase().includes(search)) ||
          (s.procedure && s.procedure.toLowerCase().includes(search)) ||
          (s.doctorName && s.doctorName.toLowerCase().includes(search))
      );

      const searchMatch = (
        room.number.toLowerCase().includes(search) ||
        room.name.toLowerCase().includes(search) ||
        room.description.toLowerCase().includes(search) ||
        searchFilter.toLowerCase() === roomStatus.toLowerCase() ||
        scheduleSearchMatch 
      );
      
      return statusMatch && searchMatch;
    });
  }, [filters, processedRooms]);


  // Tampilan Loading & Error
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
        <AlertTriangle className="w-6 h-6 mr-3" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  // 🔹 Tampilan Grid Utama
  return (
    <motion.div 
      className="flex flex-col md:flex-1 lg:flex-2 xl:flex-3 gap-4 overflow-auto" // Disesuaikan untuk 3 kolom di layar besar
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredRooms.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 italic">
            Tidak ada kamar yang sesuai dengan filter.
          </p>
      )}
      
      {filteredRooms.map((room) => (
        <RoomCardWithSlider 
            key={room.id}
            room={room}
            currentShift={currentShift}
            staffShiftMap={staffShiftMap}
        />
      ))}
    </motion.div>
  );
}

