'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
    Loader2, 
    AlertTriangle, 
    Users, 
    User,
    CalendarClock, // Ikon untuk histori
    Sun,
    Moon,
    Sunset
} from 'lucide-react';
// Import Framer Motion
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Tipe Data ---

type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];

const SHIFT_DETAILS: { [key in ShiftKey]: { icon: React.ElementType } } = {
  Pagi: { icon: Sun },
  Siang: { icon: Sunset },
  Malam: { icon: Moon },
};

interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
}

type NurseShiftTeams = {
  [K in ShiftKey]: Staff[];
};

interface ShiftAssignment {
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
}

// Tipe data yang kita harapkan dari GET /api/shift-history
interface HistoryEntry extends ShiftAssignment {
  id: string;
  archivedAt: string; // ISO string
}

// --- Varian Animasi ---

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

// --- KOMPONEN PENAMPIL HISTORI ---

const HistoryDisplay = () => {
    // State untuk daftar histori
    const [historyList, setHistoryList] = useState<HistoryEntry[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk mengambil data dari GET /api/shift-history
    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const apiUrl = '/api/shift-history'; 
            const res = await fetch(apiUrl, {
                method: 'GET',
                cache: 'no-store', // Selalu ambil data histori terbaru
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Error ${res.status}`);
            }

            const data: HistoryEntry[] = await res.json();
            setHistoryList(data);

        } catch (e: unknown) {
            console.error('Fetch History Error:', e);
            setError(`Fetch Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mengambil data saat komponen pertama kali dimuat
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Helper untuk memformat tanggal ISO
    const formatDateTime = (isoString: string) => {
        try {
            // Sesuaikan timezone Anda jika perlu (misal: 'Asia/Jakarta' untuk WIB)
            const timeZone = 'Asia/Makassar'; // WITA
            return new Date(isoString).toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: timeZone 
            });
        } catch  {
            return isoString; // Fallback
        }
    };

    // Render list staf (Sama seperti ShiftDisplay, tapi tanpa hover)
    const renderStaffList = (staffList: Staff[], emptyMessage: string) => {
        if (!staffList || staffList.length === 0) {
            return <p className="text-sm text-slate-500 italic">{emptyMessage}</p>;
        }
        return (
            <motion.ul 
              className="space-y-1"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
                {staffList.map(staff => (
                    <motion.li 
                      key={staff.id} 
                      className="flex items-center text-sm p-1.5"
                      variants={itemVariants}
                    >
                        <User size={14} className="mr-2 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800">{staff.name}</span>
                        <span className="text-slate-600 ml-1.5">({staff.role})</span>
                    </motion.li>
                ))}
            </motion.ul>
        );
    };

    return (
        <div className="bg-slate-50 p-4 md:p-8 min-h-svh"> 
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center mb-6">
                    <CalendarClock size={32} className="text-purple-600 mr-3" />
                    <h1 className="text-3xl font-bold text-slate-800">
                        Histori Penugasan Shift
                    </h1>
                </div>

                <AnimatePresence>
                    {/* Status Loading */}
                    {isLoading && (
                        <motion.div
                            key="loading"
                            className="flex justify-center items-center h-64"
                            exit={{ opacity: 0 }}
                        >
                            <Loader2 size={32} className="animate-spin text-purple-600" />
                            <span className="ml-3 text-lg text-slate-600">Memuat histori...</span>
                        </motion.div>
                    )}

                    {/* Status Error */}
                    {error && (
                        <motion.div
                            key="error" 
                            className="p-4 mb-4 bg-red-100 text-red-800 rounded-lg border border-red-300 font-medium flex items-center"
                        >
                            <AlertTriangle size={20} className="mr-3 text-red-600" />
                            <div>
                                <span className="font-bold">Gagal memuat histori:</span>
                                <p>{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Konten Utama (Daftar Histori) */}
                    {!isLoading && !error && historyList && (
                        <div className="space-y-6">
                            {historyList.length === 0 && (
                                <p className="text-center text-slate-500 text-lg italic">
                                    Belum ada histori yang diarsipkan.
                                </p>
                            )}

                            {historyList.map(entry => (
                                <motion.div
                                  key={entry.id}
                                  className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden"
                                  variants={cardVariants}
                                  initial="hidden"
                                  animate="visible"
                                  layout
                                >
                                    {/* Header Kartu (Tanggal Arsip) */}
                                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                                        <h2 className="font-semibold text-purple-800 flex items-center">
                                            <CalendarClock size={16} className="mr-2" />
                                            Diarsipkan pada: {formatDateTime(entry.archivedAt)}
                                        </h2>
                                    </div>

                                    {/* Isi Kartu (Tim) */}
                                    <div className="p-4 space-y-4">
                                        {/* Tim Anestesi */}
                                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                            <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-lg">
                                                <Users size={18} className="mr-2.5" />
                                                Tim Dokter Anestesi ({entry.anesthesiaTeam.length})
                                            </h3>
                                            <div className="text-xs">
                                              {renderStaffList(entry.anesthesiaTeam, "Tidak ada dokter anestesi.")}
                                            </div>
                                        </div>

                                        {/* Tim Perawat */}
                                        <div>
                                            <h3 className="font-semibold text-slate-700 mb-3 text-lg">Tim Perawat</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {SHIFTS.map(shift => {
                                                    // --- PERBAIKAN DI SINI ---
                                                    // 1. Ekstrak Ikon ke variabel PascalCase
                                                    const ShiftIcon = SHIFT_DETAILS[shift].icon;

                                                    return (
                                                        <div key={shift} className="p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                                                            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                                                                {/* 2. Gunakan variabel tersebut */}
                                                                <ShiftIcon size={16} className="mr-2" />
                                                                Shift {shift}
                                                            </h4>
                                                            <div className='text-xs'>
                                                              {renderStaffList(entry.nurseTeams[shift], "Shift kosong.")}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default HistoryDisplay;