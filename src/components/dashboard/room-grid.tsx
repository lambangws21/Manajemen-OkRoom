'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, User, Users, UserCircle2,ChevronLeft, ChevronRight, Syringe, Bed, Sun, MoonStarIcon, SunsetIcon } from 'lucide-react';
import { toast } from 'sonner';
// 🔹 Impor Tipe Jadwal (Asumsi Tipe ini ada di @/types)
import { OperatingRoom, StaffMember, ScheduledSurgery } from '@/types'; 
import Card from '@/components/ui/card'; // Asumsi Card adalah komponen UI dasar

// ----------------------------------------------------------------
// 🔹 TIPE DATA DAN UTILITAS
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

type Shift = 'Pagi' | 'Siang' | 'Malam';

// 🔹 Fungsi untuk menentukan shift saat ini
const getCurrentShift = (): Shift => {
  const hour = new Date().getHours();
  // Asumsi shift: Pagi (7-14), Siang (14-21), Malam (21-7)
  if (hour >= 7 && hour < 14) return 'Pagi';
  if (hour >= 14 && hour < 21) return 'Siang';
  return 'Malam';
};

// 🔹 Helper untuk mendapatkan tanggal hari ini (YYYY-MM-DD)
const getTodayDateString = () => new Date().toISOString().split('T')[0];


// ----------------------------------------------------------------
// 🔹 VARIAN & HELPER VISUAL
// ----------------------------------------------------------------

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } },
};

const getShiftIcon = (shift: string) => {
    switch (shift) {
        case 'Pagi': return <Sun size={12} className="text-yellow-500" />;
        case 'Siang': return <SunsetIcon size={12} className="text-orange-500" />;
        case 'Malam': return <MoonStarIcon size={12} className="text-purple-500" />;
        default: return <Bed size={12} className="text-blue-500" />;
    }
};

// 🔹 HELPER: Fungsi untuk menerjemahkan status jadwal ke GAYA (warna) kamar
const mapScheduleStatusToRoomStyle = (surgeryStatus?: string): { statusCategory: string, colorClass: string, cardBg: string, textColorClass: string } => {
  switch (surgeryStatus) {
    case 'Operasi Berlangsung':
    case 'Sedang Tindakan': 
      return { 
        statusCategory: 'Operasi Berlangsung', 
        colorClass: 'border-red-600', 
        cardBg: 'bg-white dark:bg-gray-800/80 hover:shadow-red-500/30',
        textColorClass: 'text-red-700 dark:text-red-300' 
      };
    case 'Persiapan Operasi':
    case 'Terkonfirmasi': 
    case 'Pasien Diterima': 
      return { 
        statusCategory: 'Persiapan', 
        colorClass: 'border-yellow-600', 
        cardBg: 'bg-white dark:bg-gray-800/80 hover:shadow-yellow-500/30',
        textColorClass: 'text-yellow-700 dark:text-yellow-300'
      };
    case 'Operasi Selesai':
    case 'Ruang Pemulihan':
      return { 
        statusCategory: 'Pembersihan', 
        colorClass: 'border-indigo-600', 
        cardBg: 'bg-white dark:bg-gray-800/80 hover:shadow-indigo-500/30',
        textColorClass: 'text-indigo-700 dark:text-indigo-300'
      };
    case 'Dibatalkan': 
    case 'Selesai':
    default:
      return { 
        statusCategory: 'Tersedia', 
        colorClass: 'border-green-600', 
        cardBg: 'bg-white dark:bg-gray-800/80 hover:shadow-green-500/30', 
        textColorClass: 'text-green-700 dark:text-green-300' 
      }; 
  }
};

// 💥 BARU: Definisi Tipe Filters
export interface Filters {
  search: string;
  status: 'All' | string;
}

interface RoomGridProps {
  filters: Filters;
}

// ----------------------------------------------------------------
// 🔹 SUB-KOMPONEN: RoomCardWithSlider (DIPERBAIKI)
// ----------------------------------------------------------------
interface RoomCardWithSliderProps {
    room: ProcessedRoom;
    currentShift: Shift;
    staffShiftMap: StaffShiftMap;
}

const RoomCardWithSlider: React.FC<RoomCardWithSliderProps> = ({ room, currentShift, staffShiftMap }) => {
    
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const scheduledSurgeries = room.scheduledSurgeries || [];
    const maxIndex = scheduledSurgeries.length > 0 ? scheduledSurgeries.length - 1 : 0;
    
    const activeSurgery = scheduledSurgeries[activeSlideIndex] || null;

    const displayStatus = activeSurgery ? activeSurgery.status : room.status;
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
            setActiveSlideIndex(0);
        }
    }, [scheduledSurgeries.length]);
    
    // Filter staf hanya untuk shift saat ini + Anestesi
    const relevantTeam = room.team.filter(staff => {
        const shift = staffShiftMap[staff.id];
        return shift === currentShift || shift === 'Anestesi';
    });
    const relevantTeamCount = relevantTeam.length;

    return (
        <motion.div 
            key={room.id} 
            className={`p-4 rounded-xl shadow-lg border-l-4 ${colorClass} ${cardBg} transition-all duration-300 hover:shadow-xl`}
            variants={itemVariants}
        >
            {/* Header & Status Tag */}
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{room.name}</h4>
                <div className={`text-xs font-semibold py-1 px-3 rounded-full inline-block border ${colorClass} ${textColorClass} bg-white dark:bg-slate-900 shadow-sm whitespace-nowrap`}>
                    {displayStatus}
                </div>
            </div>
            
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
                            className="text-sm space-y-2 mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 relative overflow-hidden"
                        >
                            {/* Slide Indicator & Navigasi Manual */}
                            {scheduledSurgeries.length > 1 && (
                                <div className="absolute top-0 right-0 p-1 flex items-center bg-slate-200/80 dark:bg-slate-900/80 rounded-bl-lg shadow-sm border-l border-b border-slate-300 dark:border-slate-600 z-10">
                                    <button onClick={handlePrev} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 p-0.5" aria-label="Previous patient"><ChevronLeft size={16} /></button>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mx-1">
                                        {activeSlideIndex + 1}/{scheduledSurgeries.length}
                                    </span>
                                    <button onClick={handleNext} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 p-0.5" aria-label="Next patient"><ChevronRight size={16} /></button>
                                </div>
                            )}

                            <p className="font-bold text-lg text-red-700 dark:text-red-400 flex items-center pt-1">
                                <UserCircle2 size={20} className="mr-2 flex-shrink-0" /> 
                                {activeSurgery.patientName || 'Pasien N/A'}
                            </p>
                            <div className="space-y-1 pl-1">
                                <p className="text-gray-700 dark:text-gray-300 flex items-center">
                                    <Syringe size={14} className="mr-2 text-indigo-500 flex-shrink-0" /> 
                                    Prosedur: <span className="font-medium ml-1 truncate">{activeSurgery.procedure || '-'}</span>
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 flex items-center">
                                    <User size={14} className="mr-2 text-blue-500 flex-shrink-0" />
                                    Dokter Bedah: <span className="font-medium ml-1 truncate">{activeSurgery.doctorName || 'Belum Ditugaskan'}</span>
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            ) : (
                // Tampilkan info kamar default jika tidak ada jadwal aktif
                <Card className="p-4 mt-3 bg-slate-50 dark:bg-slate-700 border-dashed border-slate-300 dark:border-slate-600">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                        <Bed size={16} className="mr-2"/> Kamar siap digunakan.
                    </p>
                </Card>
            )}

            {/* Tim Bertugas (Bawah) */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex items-center mb-2">
                <Users size={14} className="mr-1" />
                Tim Dinas {currentShift} ({relevantTeamCount} Staf)
              </span>
              
              {relevantTeamCount > 0 ? (
                // Responsif: Gunakan grid 2 kolom di layar kecil dan 3 di medium
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 text-sm max-h-32 overflow-y-auto pr-1">
                  {relevantTeam.map((staff) => (
                    <p key={staff.id} className="flex items-center text-gray-700 dark:text-gray-300 truncate pr-1">
                        <span className="mr-1 flex-shrink-0">{getShiftIcon(staffShiftMap[staff.id] || '')}</span>
                        {staff.name}
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
// 🔹 KOMPONEN UTAMA ROOM GRID
// ----------------------------------------------------------------
export default function RoomGrid({ filters }: RoomGridProps) {
  // 🔹 State untuk data dinamis
  const [masterRooms, setMasterRooms] = useState<ProcessedRoom[]>([]); 
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>([]); 
  const [shiftAssignment, setShiftAssignment] = useState<ShiftAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentShift = useMemo(getCurrentShift, []); 

  // 🔹 Fungsi Fetch Data
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
          number: roomId, 
          name: `Kamar Operasi ${roomId.replace('OK', '')}`, 
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

  // 🔹 Logika Penggabungan Data (Merge Tim + Jadwal HARI INI)
  const processedRooms: ProcessedRoom[] = useMemo(() => { 
    
    // 💥 BARU: Filter jadwal HANYA untuk hari ini
    const today = getTodayDateString();
    const todaySchedule = schedule.filter(s => s.scheduledAt.startsWith(today));

    // Map untuk mengumpulkan SEMUA jadwal yang relevan per kamar HARI INI
    const roomScheduleMap = new Map<string, ScheduledSurgery[]>();
    // Gunakan todaySchedule
    for (const surgery of todaySchedule) { 
      const roomNumber = surgery.assignedOR;
      if (!roomNumber) continue;

      const { statusCategory: liveStatusCategory } = mapScheduleStatusToRoomStyle(surgery.status);
      
      // HANYA masukkan operasi yang BUKAN 'Tersedia' (yaitu sedang berjalan, persiapan, atau pembersihan)
      if (liveStatusCategory !== 'Tersedia') {
          if (!roomScheduleMap.has(roomNumber)) {
              roomScheduleMap.set(roomNumber, []);
          }
          roomScheduleMap.get(roomNumber)!.push(surgery);
      }
    }

    // Sort semua array jadwal berdasarkan scheduledAt
    roomScheduleMap.forEach(surgeries => {
        surgeries.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    });


    return masterRooms.map(room => {
      // Ambil semua jadwal (hari ini) untuk kamar ini
      const activeSurgeries = roomScheduleMap.get(room.number) || []; 
      
      // Ambil operasi paling pertama (paling pagi) untuk menentukan status utama kamar
      const primarySurgery = activeSurgeries[0]; 

      if (primarySurgery) {
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
  }, [schedule, masterRooms]);


  // 🔹 Logika Filter (dari prop)
  const filteredRooms: ProcessedRoom[] = useMemo(() => { 
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
        searchFilter.toLowerCase() === currentShift.toLowerCase() || // Izinkan filter berdasarkan shift
        scheduleSearchMatch 
      );
      
      return statusMatch && searchMatch;
    });
  }, [filters, processedRooms, currentShift]);


  // Tampilan Loading & Error
  if (isLoading) {
    return (
      <Card className="flex justify-center items-center h-48 p-4 bg-white dark:bg-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-4 text-lg text-gray-500 dark:text-gray-300">Memuat data kamar operasi...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex justify-center items-center h-48 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
        <AlertTriangle className="w-6 h-6 mr-3" />
        <span className="font-medium">{error}</span>
      </Card>
    );
  }

  // 🔹 Tampilan Grid Utama (RESPONSIF)
  return (
    <motion.div 
      // 💥 Kunci Responsif: 1 kolom di ponsel, 2 di medium, 3 di large
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredRooms.length === 0 && (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400 italic py-10">
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