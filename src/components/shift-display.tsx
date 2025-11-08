'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Users,
  User,
  ClipboardClock,
  Sun,
  Moon,
  Sunset,
  Archive,
  DoorOpen,
  Save,
  X,
  UserPlus,
  Search,
  Clock10Icon,
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Toaster, toast } from 'sonner';

/* ============================
   Tipe & Konstanta
   ============================ */
type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];

const OPERATING_ROOMS = [
  { id: 'OK 1', name: 'Kamar Operasi 1', description: 'Bedah Umum, Digestif' },
  { id: 'OK 2', name: 'Kamar Operasi 2', description: 'Orthopedi, Bedah Saraf' },
  { id: 'OK 3', name: 'Kamar Operasi 3', description: 'Mata, THT, Obsgyn' },
];

const SHIFT_DETAILS: { [key in ShiftKey]: { icon: React.ElementType } } = {
  Pagi: { icon: Sun },
  Siang: { icon: Sunset },
  Malam: { icon: Moon },
};

// --- Tipe Data Aplikasi ---
interface Staff {
  id: string;
  name: string;
  role: string;
  department?: string;
}

type NurseShiftTeams = {
  [K in ShiftKey]: Staff[];
};

interface ShiftAssignment {
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
}

interface ActiveStaff extends Staff {
  duty: string;
}

// 🔹 PERUBAHAN: RoomTeam sekarang menggunakan ActiveStaff untuk menyimpan 'duty'
type RoomTeam = ActiveStaff[]; 
type RoomAssignments = Record<string, RoomTeam>;


// --- Tipe Data API ---
type ApiErrorResponse = { error: string };

function isApiError(data: unknown): data is ApiErrorResponse {
  return typeof data === 'object' && data !== null && 'error' in data;
}

const createEmptyAssignment = (): ShiftAssignment => ({
  anesthesiaTeam: [],
  nurseTeams: { Pagi: [], Siang: [], Malam: [] },
});


/* ============================
   Animasi (Varian)
   ============================ */
const mainContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, when: 'beforeChildren', staggerChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};
const listVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};
const statusVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/* ============================
   Utilities
   ============================ */
// 🔹 PERBAIKAN: Fungsi ini tidak lagi digunakan, jadi dikomentari untuk perbaiki warning ESLint
// function getCurrentShift(): ShiftKey {
//   const hour = new Date().getHours();
//   if (hour >= 7 && hour < 14) return 'Pagi';
//   if (hour >= 14 && hour < 21) return 'Siang';
//   return 'Malam';
// }

/* ============================
   Hooks untuk API (Dibersihkan)
   ============================ */

/**
 * Hook untuk mengarsipkan jadwal.
 */
function useArchiveShift() {
  const [isArchiving, setIsLoading] = useState(false);
  const archive = useCallback(async (payload: ShiftAssignment | null) => {
    setIsLoading(true);
    if (
      !payload ||
      (payload.anesthesiaTeam.length === 0 &&
        payload.nurseTeams.Pagi.length === 0 &&
        payload.nurseTeams.Siang.length === 0 &&
        payload.nurseTeams.Malam.length === 0)
    ) {
      toast.error('Tidak ada data jadwal untuk diarsipkan.');
      setIsLoading(false);
      return;
    }
    
    const promise = fetch('/api/shift-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      const data: { message: string } | ApiErrorResponse = await res.json();
      if (!res.ok || isApiError(data)) {
        throw new Error(isApiError(data) ? data.error : 'Gagal terhubung.');
      }
      return data;
    });

    toast.promise(promise, {
      loading: 'Mengarsipkan histori...',
      success: (data) => data.message || 'Histori berhasil diarsipkan!',
      error: (err: Error) => err.message, // Menampilkan pesan error
    });

    try {
      await promise;
    } catch (err) {
      console.error(err); // Log error
    } finally {
      setIsLoading(false);
    }
  }, []);
  return { archive, isArchiving };
}

/**
 * Hook untuk mengelola penugasan kamar operasi.
 */
function useRoomAssignments() {
  // 🔹 Tipe <RoomAssignments> sekarang merujuk ke Record<string, ActiveStaff[]>
  const [assignments, setAssignments] = useState<RoomAssignments>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/room-assignments');
      if (!res.ok) throw new Error('Gagal memuat data kamar operasi');
      const data: RoomAssignments = await res.json();
      setAssignments(data || {});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error tidak diketahui');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔹 Tipe newAssignments sekarang adalah Record<string, ActiveStaff[]>
  const saveAssignments = useCallback(async (newAssignments: RoomAssignments) => {
    setIsSaving(true);
    const promise = fetch('/api/room-assignments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignments),
    }).then(async (res) => {
      if (!res.ok) {
        const data = (await res.json()) as ApiErrorResponse;
        throw new Error(data.error || 'Gagal menyimpan data kamar');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Menyimpan penugasan kamar...',
      success: () => {
        setAssignments(newAssignments);
        return 'Penugasan kamar berhasil disimpan!';
      },
      error: (err: Error) => err.message, // Menampilkan pesan error
    });

    try {
      await promise;
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { roomAssignments: assignments, isLoading, isSaving, saveAssignments, refetch: fetchData };
}

/**
 * Hook untuk mengambil semua staf.
 */
function useAllStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/staffs');
      if (!res.ok) throw new Error('Gagal memuat daftar staf');
      const data: Staff[] = await res.json();
      setStaffList(data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal memuat staf');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return { staffList, isLoading, refetch: fetchStaff };
}

/**
 * Hook untuk menyimpan jadwal shift.
 */
function useSaveShift() {
  const [isSaving, setIsSaving] = useState(false);

  const saveShift = useCallback(async (newAssignment: ShiftAssignment) => {
    setIsSaving(true);
    const promise = fetch('/api/shift-assignments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment),
    }).then(async (res) => {
      if (!res.ok) {
        const data = (await res.json()) as ApiErrorResponse;
        throw new Error(data.error || 'Gagal menyimpan tim jaga');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Menyimpan tim jaga...',
      success: 'Tim jaga berhasil diperbarui!',
      error: (err: Error) => err.message, // Menampilkan pesan error
    });

    try {
      await promise;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { saveShift, isSaving };
}

/* ============================
   Modal: AssignRoomModal (Logika Diubah)
   ============================ */
interface AssignRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTeam: ActiveStaff[]) => void; // 🔹 Diubah ke ActiveStaff[]
  roomName: string;
  availableStaff: ActiveStaff[];
  initialTeam: ActiveStaff[]; // 🔹 Diubah ke ActiveStaff[]
  isSaving: boolean;
}

const AssignRoomModal: React.FC<AssignRoomModalProps> = ({ isOpen, onClose, onSave, roomName, availableStaff, initialTeam, isSaving }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialTeam.map((s) => s.id)));

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initialTeam.map((s) => s.id)));
    }
  }, [initialTeam, isOpen]);

  const handleToggle = (staffId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return next;
    });
  };

  const handleSave = () => {
    // 🔹 PERUBAHAN: .map() dihapus. Kita simpan ActiveStaff[] (termasuk 'duty')
    const newTeam = availableStaff
      .filter((s) => selectedIds.has(s.id));
    onSave(newTeam);
  };
  
  // Grupkan staf berdasarkan 'duty'
  const groupedStaff = useMemo(() => {
    // Tentukan urutan grup
    const groupOrder: Record<string, number> = {
        'Dinas Anestesi': 1,
        'Dinas Pagi': 2,
        'Dinas Siang': 3,
        'Dinas Malam': 4,
    };

    const groups = availableStaff.reduce((acc, staff) => {
        const duty = staff.duty || 'Dinas';
        if (!acc[duty]) {
            acc[duty] = [];
        }
        acc[duty].push(staff);
        return acc;
    }, {} as Record<string, ActiveStaff[]>);

    // Urutkan grup berdasarkan 'groupOrder'
    return Object.entries(groups).sort(([keyA], [keyB]) => {
        const orderA = groupOrder[keyA] || 99;
        const orderB = groupOrder[keyB] || 99;
        return orderA - orderB;
    });

  }, [availableStaff]);

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Atur Tim - {roomName}</h3>
          <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}>
            <X size={24} className="text-slate-500 dark:text-slate-300" />
          </motion.button>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Pilih staf dari semua tim yang dinas hari ini.</p>

        {/* Render list yang digrupkan */}
        <div className="max-h-64 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
          {availableStaff.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center p-4">Tidak ada staf yang dinas hari ini.</p>}
          
          {groupedStaff.map(([duty, staffList]) => (
            <div key={duty} className="mb-2">
                <h4 className="font-semibold text-xs uppercase text-slate-500 dark:text-slate-400 pl-2 pt-1 pb-1 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                    {duty} ({staffList.length})
                </h4>
                <div className="space-y-1 mt-1">
                    {staffList.map((st) => (
                      <label key={st.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                        <input type="checkbox" checked={selectedIds.has(st.id)} onChange={() => handleToggle(st.id)} className="h-4 w-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                        <div className="ml-3">
                          <span className="font-medium text-slate-700 dark:text-slate-100">{st.name}</span>
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({st.role})</span>
                        </div>
                      </label>
                    ))}
                </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <motion.button onClick={onClose} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50" disabled={isSaving}>
            Batal
          </motion.button>
          <motion.button onClick={handleSave} whileTap={{ scale: 0.95 }} className="flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" disabled={isSaving}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="ml-2">Simpan Tim</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============================
   Modal: AssignShiftModal
   ============================ */

// --- Komponen Internal untuk Modal Shift ---

/**
 * Komponen daftar staf dengan checkbox untuk modal.
 */
const StaffCheckboxList: React.FC<{
  staffList: Staff[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  otherAssignedIds?: Set<string>;
  isSaving: boolean;
  searchTerm: string;
}> = ({ staffList, selectedIds, onToggle, otherAssignedIds, isSaving, searchTerm }) => (
  <motion.ul
    className="h-64 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
    variants={listVariants}
    initial="hidden"
    animate="visible"
  >
    {staffList.length === 0 && (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center p-4">
        {searchTerm ? 'Nama tidak ditemukan.' : 'Tidak ada staf di kategori ini.'}
      </p>
    )}
    {staffList.map((st) => {
      const isConflicted = selectedIds.has(st.id) && otherAssignedIds?.has(st.id);
      return (
        <motion.li key={st.id} variants={itemVariants} className="rounded-md">
          <label className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.has(st.id)}
              onChange={() => onToggle(st.id)}
              disabled={isSaving}
              className="h-4 w-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
            />
            <span className="ml-3 font-medium text-slate-700 dark:text-slate-100">{st.name}</span>
            {isConflicted && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full flex items-center gap-1">
                <Clock10Icon size={12} /> extra
              </span>
            )}
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({st.role})</span>
          </label>
        </motion.li>
      );
    })}
  </motion.ul>
);

/**
 * Komponen tombol tab utama (Dokter/Perawat).
 */
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
    }`}
    onClick={onClick}
  >
    {label}
    {isActive && <motion.div layoutId="active-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
  </button>
);

/**
 * Komponen tombol sub-tab (Pagi/Siang/Malam).
 */
const SubTabButton: React.FC<{ label: ShiftKey; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => {
  const Icon = SHIFT_DETAILS[label].icon;
  return (
    <button
      type="button"
      className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
      onClick={onClick}
    >
      <Icon size={16} /> {label}
      {isActive && <motion.div layoutId="active-subtab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
    </button>
  );
};

// --- Komponen Modal Utama ---
interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAssignment: ShiftAssignment) => Promise<boolean>;
  allStaff: Staff[];
  currentAssignment: ShiftAssignment | null;
  isSaving: boolean;
}

const AssignShiftModal: React.FC<AssignShiftModalProps> = ({ isOpen, onClose, onSave, allStaff, currentAssignment, isSaving }) => {
  const [anesthesiaIds, setAnesthesiaIds] = useState<Set<string>>(new Set());
  const [pagiIds, setPagiIds] = useState<Set<string>>(new Set());
  const [siangIds, setSiangIds] = useState<Set<string>>(new Set());
  const [malamIds, setMalamIds] = useState<Set<string>>(new Set());

  const [mainTab, setMainTab] = useState<'anestesi' | 'perawat'>('anestesi');
  const [nurseTab, setNurseTab] = useState<ShiftKey>('Pagi');
  const [searchTerm, setSearchTerm] = useState('');

  // Memisahkan daftar staf (Dokter Anestesi vs Perawat)
  const { doctorAnesthesiaStaff, nurseStaff } = useMemo(() => {
    const lcRole = (s: Staff) => s.role.toLowerCase();
    return {
      doctorAnesthesiaStaff: allStaff.filter((s) => lcRole(s).includes('dokter') && lcRole(s).includes('anestesi')),
      nurseStaff: allStaff.filter((s) => lcRole(s).includes('perawat')), // Termasuk perawat anestesi
    };
  }, [allStaff]);

  // Mengisi state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (currentAssignment) {
        setAnesthesiaIds(new Set(currentAssignment.anesthesiaTeam.map((s) => s.id)));
        setPagiIds(new Set(currentAssignment.nurseTeams.Pagi.map((s) => s.id)));
        setSiangIds(new Set(currentAssignment.nurseTeams.Siang.map((s) => s.id)));
        setMalamIds(new Set(currentAssignment.nurseTeams.Malam.map((s) => s.id)));
      } else {
        // Reset jika tidak ada data
        setAnesthesiaIds(new Set());
        setPagiIds(new Set());
        setSiangIds(new Set());
        setMalamIds(new Set());
      }
      setSearchTerm('');
      setMainTab('anestesi');
      setNurseTab('Pagi');
    }
  }, [isOpen, currentAssignment]);

  // --- Logika Toggle dengan Peringatan ---
  const createToggleHandler = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (id: string) =>
    setter((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });

  const handleAnesthesiaToggle = createToggleHandler(setAnesthesiaIds);
  const handlePagiToggle = createToggleHandler(setPagiIds);

  const findStaffName = (id: string) => allStaff.find((s) => s.id === id)?.name || 'Staf';

  const handleSiangToggle = (id: string) => {
    if (!siangIds.has(id) && pagiIds.has(id)) {
      toast.warning(`Staf ${findStaffName(id)} sudah dinas Pagi!`, {
        description: 'Menugaskan staf di dua shift berurutan tidak disarankan.',
      });
    }
    setSiangIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleMalamToggle = (id: string) => {
    if (!malamIds.has(id) && (pagiIds.has(id) || siangIds.has(id))) {
      toast.warning(`Staf ${findStaffName(id)} sudah dinas Pagi/Siang!`, {
        description: 'Menugaskan staf di shift tambahan tidak disarankan.',
      });
    }
    setMalamIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };


  // Set ID yang konflik untuk UI
  const pagiSiangCombined = useMemo(() => new Set([...pagiIds, ...siangIds]), [pagiIds, siangIds]);

  // --- Logika Simpan ---
  const handleSaveClick = async () => {
    const newAssignment: ShiftAssignment = {
      anesthesiaTeam: doctorAnesthesiaStaff.filter((s) => anesthesiaIds.has(s.id)),
      nurseTeams: {
        Pagi: nurseStaff.filter((s) => pagiIds.has(s.id)),
        Siang: nurseStaff.filter((s) => siangIds.has(s.id)),
        Malam: nurseStaff.filter((s) => malamIds.has(s.id)),
      },
    };

    const success = await onSave(newAssignment);
    if (success) onClose();
  };

  // --- Logika Filter ---
  const term = searchTerm.toLowerCase();
  const filteredDoctorAnesthesia = doctorAnesthesiaStaff.filter((s) => s.name.toLowerCase().includes(term));
  const filteredNurses = nurseStaff.filter((s) => s.name.toLowerCase().includes(term));

  if (!isOpen) return null;

  // --- JSX Modal ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Atur Tim Jaga Harian</h3>
          <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}>
            <X size={24} className="text-slate-500 dark:text-slate-300" />
          </motion.button>
        </div>

        {/* Header Tab dan Search */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 dark:border-slate-700 mb-4 gap-4">
          <div className="flex">
            <TabButton label="Dokter Anestesi" isActive={mainTab === 'anestesi'} onClick={() => setMainTab('anestesi')} />
            <TabButton label="Tim Perawat" isActive={mainTab === 'perawat'} onClick={() => setMainTab('perawat')} />
          </div>
          <div className="relative w-full sm:w-auto">
            <input type="text" placeholder="Cari nama staf..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-auto pl-8 pr-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Konten Tab */}
        <AnimatePresence mode="wait">
          {mainTab === 'anestesi' && (
            <motion.div key="anestesi" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
              <StaffCheckboxList staffList={filteredDoctorAnesthesia} selectedIds={anesthesiaIds} onToggle={handleAnesthesiaToggle} isSaving={isSaving} searchTerm={searchTerm} />
            </motion.div>
          )}

          {mainTab === 'perawat' && (
            <motion.div key="perawat" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
              <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <SubTabButton label="Pagi" isActive={nurseTab === 'Pagi'} onClick={() => setNurseTab('Pagi')} />
                <SubTabButton label="Siang" isActive={nurseTab === 'Siang'} onClick={() => setNurseTab('Siang')} />
                <SubTabButton label="Malam" isActive={nurseTab === 'Malam'} onClick={() => setNurseTab('Malam')} />
              </div>

              <AnimatePresence mode="wait">
                {nurseTab === 'Pagi' && (
                  <motion.div key="pagi" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <StaffCheckboxList staffList={filteredNurses} selectedIds={pagiIds} onToggle={handlePagiToggle} isSaving={isSaving} searchTerm={searchTerm} />
                  </motion.div>
                )}
                {nurseTab === 'Siang' && (
                  <motion.div key="siang" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <StaffCheckboxList staffList={filteredNurses} selectedIds={siangIds} onToggle={handleSiangToggle} otherAssignedIds={pagiIds} isSaving={isSaving} searchTerm={searchTerm} />
                  </motion.div>
                )}
                {nurseTab === 'Malam' && (
                  <motion.div key="malam" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                    <StaffCheckboxList staffList={filteredNurses} selectedIds={malamIds} onToggle={handleMalamToggle} otherAssignedIds={pagiSiangCombined} isSaving={isSaving} searchTerm={searchTerm} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Tombol */}
        <div className="mt-6 flex justify-end gap-3">
          <motion.button onClick={onClose} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50" disabled={isSaving}>Batal</motion.button>
          <motion.button onClick={handleSaveClick} whileTap={{ scale: 0.95 }} className="flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" disabled={isSaving}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="ml-2">Simpan Tim Jaga</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ============================
   Komponen Utama: ShiftDisplay
   ============================ */
const ShiftDisplay: React.FC = () => {
  // --- State ---
  const [assignment, setAssignment] = useState<ShiftAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null);

  // --- Hooks ---
  const { archive, isArchiving } = useArchiveShift();
  const { roomAssignments, isLoading: isRoomLoading, isSaving: isRoomSaving, saveAssignments, refetch: refetchRooms } = useRoomAssignments();
  const { staffList, isLoading: isStaffLoading, refetch: refetchStaff } = useAllStaff();
  const { saveShift, isSaving: isShiftSaving } = useSaveShift();

  // --- Memo & Callbacks ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shift-assignments');
      if (!res.ok) {
        const data = (await res.json()) as ApiErrorResponse;
        throw new Error(data.error || 'Gagal memuat tim jaga');
      }
      const data: ShiftAssignment = await res.json();
      setAssignment({
        anesthesiaTeam: data.anesthesiaTeam || [],
        nurseTeams: data.nurseTeams || { Pagi: [], Siang: [], Malam: [] },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setAssignment(createEmptyAssignment()); // Set default kosong
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleArchiveClick = () => archive(assignment);

  const allDayStaffPool = useMemo((): ActiveStaff[] => {
    if (!assignment) return [];
    
    const pagiNurses: ActiveStaff[] = (assignment.nurseTeams.Pagi || []).map((st) => ({ ...st, duty: 'Dinas Pagi' }));
    const siangNurses: ActiveStaff[] = (assignment.nurseTeams.Siang || []).map((st) => ({ ...st, duty: 'Dinas Siang' }));
    const malamNurses: ActiveStaff[] = (assignment.nurseTeams.Malam || []).map((st) => ({ ...st, duty: 'Dinas Malam' }));
    const activeAnesthesia: ActiveStaff[] = (assignment.anesthesiaTeam || []).map((st) => ({ ...st, duty: 'Dinas Anestesi' }));
    
    const combinedPool = [...activeAnesthesia, ...pagiNurses, ...siangNurses, ...malamNurses];

    const uniqueStaffMap = new Map<string, ActiveStaff>();
    combinedPool.forEach(staff => {
        if (!uniqueStaffMap.has(staff.id)) {
            uniqueStaffMap.set(staff.id, staff);
        } else {
            const existing = uniqueStaffMap.get(staff.id)!;
            if (staff.duty === 'Dinas Anestesi' && existing.duty !== 'Dinas Anestesi') {
                uniqueStaffMap.set(staff.id, staff); 
            }
        }
    });
    
    return Array.from(uniqueStaffMap.values());
  }, [assignment]);

  // ID Perawat yang konflik
  const conflictedNurseIds = useMemo(() => {
    if (!assignment) return new Set<string>();
    const pagi = new Set((assignment.nurseTeams.Pagi || []).map((s) => s.id));
    const siang = new Set((assignment.nurseTeams.Siang || []).map((s) => s.id));
    const malam = new Set((assignment.nurseTeams.Malam || []).map((s) => s.id));
    const conflicts = new Set<string>();
    siang.forEach((id) => { if (pagi.has(id)) conflicts.add(id); });
    malam.forEach((id) => { if (pagi.has(id) || siang.has(id)) conflicts.add(id); });
    return conflicts;
  }, [assignment]);

  const handleOpenRoomModal = (room: { id: string; name: string }) => setSelectedRoom(room);

  // 🔹 PERUBAHAN: Tipe newTeam sekarang ActiveStaff[]
  const handleSaveRoomTeam = (newTeam: ActiveStaff[]) => {
    if (!selectedRoom) return;
    const newRoomAssignments: RoomAssignments = { ...roomAssignments, [selectedRoom.id]: newTeam };
    saveAssignments(newRoomAssignments);
    setSelectedRoom(null);
  };

  const handleSaveShift = async (newAssignment: ShiftAssignment) => {
    const success = await saveShift(newAssignment);
    if (success) {
      fetchData();
      setIsShiftModalOpen(false);
      return true;
    }
    return false;
  };

  // --- Fungsi Render ---
  
  // Fungsi render ini untuk list sederhana (Anestesi & Perawat)
  const renderStaffList = (staffList: Staff[], emptyMessage: string, conflictedIds?: Set<string>) => {
    if (!staffList || staffList.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400 italic">{emptyMessage}</p>;
    return (
      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
        <motion.ul className="space-y-1" variants={listVariants} initial="hidden" animate="visible">
          {staffList.map((st) => {
            const isConflicted = conflictedIds?.has(st.id);
            return (
              <motion.li
                key={st.id}
                className="flex items-center text-sm p-1.5 border border-transparent rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                variants={itemVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <User size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {st.name}
                </span>
                {isConflicted && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full flex items-center gap-1">
                    <Clock10Icon size={12} className='animate-spin duration-1000 transition-all'/> Overtime
                  </span>
                )}
                <span className="text-slate-600 dark:text-slate-400 ml-1.5">({st.role})</span>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    );
  };
  
  // 🔹 FUNGSI RENDER BARU KHUSUS UNTUK KAMAR OPERASI (DENGAN GROUPING)
  const renderRoomTeamList = (team: ActiveStaff[], emptyMessage: string) => {
    if (!team || team.length === 0) {
      return <p className="text-sm text-slate-500 dark:text-slate-400 italic">{emptyMessage}</p>;
    }

    // 1. Tentukan urutan grup
    const groupOrder: Record<string, number> = {
      'Dinas Anestesi': 1,
      'Dinas Pagi': 2,
      'Dinas Siang': 3,
      'Dinas Malam': 4,
    };

    // 2. Grupkan staf berdasarkan 'duty'
    const groups = team.reduce((acc, staff) => {
      const duty = staff.duty || 'DINAS'; // 'Lainnya' sebagai fallback
      if (!acc[duty]) {
        acc[duty] = [];
      }
      acc[duty].push(staff);
      return acc;
    }, {} as Record<string, ActiveStaff[]>);

    // 3. Urutkan grup berdasarkan groupOrder
    const groupedStaff = Object.entries(groups).sort(([keyA], [keyB]) => {
      const orderA = groupOrder[keyA] || 99;
      const orderB = groupOrder[keyB] || 99;
      return orderA - orderB;
    });

    // 4. Render list yang sudah digrupkan
    return (
      <div className="space-x-2 flex items-center justify-between ">
        {groupedStaff.map(([duty, staffList]) => (
          <div key={duty}>
            <h5 className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-700 mb-1 pb-1 ">
              {duty}
            </h5>
            <motion.ul className="space-y-1 pl-3 " variants={listVariants} initial="hidden" animate="visible">
              {staffList.map((st) => (
                <motion.li
                  key={st.id}
                  className="flex items-center text-sm "
                  variants={itemVariants}
                >
                  <User size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {st.name}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 ml-1.5">({st.role})</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ))}
      </div>
    );
  };


  const totalLoading = isLoading || isRoomLoading || isStaffLoading;
  const totalSaving = isArchiving || isRoomSaving || isShiftSaving;

  // --- JSX Utama ---
  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 md:p-8 min-h-screen">
      <Toaster position="top-right" richColors />
      <motion.div
        className="p-4 sm:p-6 mx-auto bg-white dark:bg-slate-900 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center">
            <ClipboardClock size={28} className="text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 ml-3">Penugasan Aktif</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button onClick={() => setIsShiftModalOpen(true)} title="Atur Tim Jaga Harian" className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={totalSaving}>
              <UserPlus size={18} />
            </motion.button>
            <motion.button onClick={handleArchiveClick} disabled={totalLoading || totalSaving || !assignment} title="Arsipkan Jadwal Ini" className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 transition-colors disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {isArchiving ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
            </motion.button>
            <motion.button onClick={() => { fetchData(); refetchRooms(); refetchStaff(); }} disabled={totalLoading || totalSaving} title="Refresh Data" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 transition-colors disabled:opacity-50" whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9, rotate: -15 }}>
              {totalLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Konten Utama */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg border border-red-200 font-medium flex items-center" variants={statusVariants} initial="initial" animate="animate" exit="exit">
              <AlertTriangle size={18} className="mr-2 text-red-600" />
              <div><span className="font-bold">Gagal memuat data:</span> {error}</div>
            </motion.div>
          )}

          {totalLoading && !error && (
            <motion.div key="loading" className="flex justify-center items-center h-48" variants={statusVariants} initial="initial" animate="animate" exit="exit">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="ml-3 text-lg text-slate-600 dark:text-slate-300">Memuat data penugasan...</span>
            </motion.div>
          )}

          {!totalLoading && !error && assignment && (
            <motion.div key="content" className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={mainContentVariants} initial="hidden" animate="visible" exit="exit">
              {/* Kolom Kiri */}
              <motion.div className="lg:col-span-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" variants={sectionVariants}>
                <h3 className="font-semibold text-slate-700 dark:text-slate-100 mb-4 text-lg flex items-center"><DoorOpen size={18} className="mr-2.5 text-indigo-600" />Penugasan Kamar Operasi (Hari Ini)</h3>
                <div className="space-y-4">
                  {OPERATING_ROOMS.map((room) => {
                    // 🔹 Tipe 'team' sekarang adalah ActiveStaff[]
                    const team = roomAssignments[room.id] || []; 
                    return (
                      <div key={room.id} className="p-3 bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-indigo-400 dark:border-indigo-600 rounded-r-lg">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex justify-between items-center">
                          {room.name}
                          <motion.button onClick={() => handleOpenRoomModal(room)} whileTap={{ scale: 0.95 }} disabled={totalSaving} className="text-xs text-indigo-600 dark:text-indigo-300 hover:underline disabled:text-slate-400">[Atur]</motion.button>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2">{room.description}</p>
                        {/* 🔹 PERUBAHAN: Memanggil fungsi render yang baru */}
                        <div className="text-xs">{renderRoomTeamList(team, 'Kamar Kosong')}</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Kolom Kanan */}
              <motion.div className="lg:col-span-1 space-y-6" variants={sectionVariants}>
                <motion.div className="p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 dark:border-blue-600 rounded-r-lg" variants={sectionVariants}>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center text-lg"><Users size={18} className="mr-2.5" />Tim Dokter Anestesi</h3>
                  {renderStaffList(assignment.anesthesiaTeam, 'Tidak ada dokter anestesi yang ditugaskan.')}
                </motion.div>

                <motion.div variants={sectionVariants}>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-100 mb-4 text-lg">Tim Perawat per Shift</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {SHIFTS.map((shift) => {
                      const ShiftIcon = SHIFT_DETAILS[shift].icon;
                      return (
                        <div key={shift} className="p-3 bg-green-50 dark:bg-green-900/40 border-l-4 border-green-400 dark:border-green-600 rounded-r-lg">
                          <h4 className="font-extrabold text-green-900 dark:text-green-200 mb-3 flex items-center"><ShiftIcon size={16} className="mr-2" />Shift {shift}</h4>
                          <div className="text-xs">{renderStaffList(assignment.nurseTeams[shift], 'Shift kosong.', conflictedNurseIds)}</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Render Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <AssignRoomModal
            isOpen={!!selectedRoom}
            onClose={() => setSelectedRoom(null)}
            onSave={handleSaveRoomTeam}
            roomName={selectedRoom.name}
            availableStaff={allDayStaffPool} 
            initialTeam={roomAssignments[selectedRoom.id] || []} // 🔹 Tipe ini sekarang benar (ActiveStaff[])
            isSaving={isRoomSaving}
          />
        )}

        {isShiftModalOpen && (
          <AssignShiftModal
            isOpen={isShiftModalOpen}
            onClose={() => setIsShiftModalOpen(false)}
            onSave={handleSaveShift}
            allStaff={staffList}
            currentAssignment={assignment}
            isSaving={isShiftSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShiftDisplay;