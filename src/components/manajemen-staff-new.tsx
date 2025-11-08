'use client';

// 🔹 UserPlus, Search, dll masih diimpor
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
    Search 
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Toaster, toast } from 'sonner';

// --- Tipe Data & Konstanta (Tidak Berubah) ---

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

type RoomTeam = Staff[];
type RoomAssignments = Record<string, RoomTeam>; 

interface ActiveStaff extends Staff {
  duty: string; 
}

// --- Varian Animasi (Tidak Berubah) ---
const mainContentVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1, }, }, exit: { opacity: 0, transition: { duration: 0.2 } } };
const sectionVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }, };
const listVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05, }, }, };
const itemVariants: Variants = { hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }, };
const statusVariants: Variants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

// --- Utility (Tidak Berubah) ---
function getCurrentShift(): ShiftKey {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 14) return 'Pagi';
    if (hour >= 14 && hour < 21) return 'Siang';
    return 'Malam';
}

// --- 🔹 Hook useDarkMode Dihapus 🔹 ---

// --- Hook: useArchiveShift (Tidak Berubah) ---
function useArchiveShift() {
  const [isArchiving, setIsLoading] = useState(false);
  const archive = useCallback(async (payload: ShiftAssignment | null) => {
    setIsLoading(true);
    if (!payload || (payload.anesthesiaTeam.length === 0 && payload.nurseTeams.Pagi.length === 0 && payload.nurseTeams.Siang.length === 0 && payload.nurseTeams.Malam.length === 0)) {
      toast.error("Tidak ada data jadwal untuk diarsipkan."); setIsLoading(false); return;
    }
    const promise = fetch('/api/shift-history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal terhubung.');
      return data;
    });
    toast.promise(promise, { loading: 'Mengarsipkan histori...', success: (data) => data.message || 'Histori berhasil diarsipkan!', error: (err) => `Gagal: ${err.message}`, });
    try { await promise; } catch {} finally { setIsLoading(false); }
  }, []);
  return { archive, isArchiving };
}

// --- Hook: useRoomAssignments (Tidak Berubah) ---
function useRoomAssignments() {
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

    useEffect(() => { fetchData(); }, [fetchData]);

    const saveAssignments = useCallback(async (newAssignments: RoomAssignments) => {
        setIsSaving(true);
        const promise = fetch('/api/room-assignments', { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssignments),
        }).then(async (res) => {
            if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan data kamar');
            return res.json();
        });
        toast.promise(promise, { loading: 'Menyimpan penugasan kamar...',
            success: () => { setAssignments(newAssignments); return 'Penugasan kamar berhasil disimpan!'; },
            error: (err) => err.message,
        });
        try { await promise; } catch {} finally { setIsSaving(false); }
    }, []);
    
    return { roomAssignments: assignments, isLoading, isSaving, saveAssignments };
}

// --- Hook: useAllStaff (Tidak Berubah) ---
function useAllStaff() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStaff = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/staffs'); 
            if (!res.ok) throw new Error('Gagal memuat daftar staf');
            const data: Staff[] = await res.json();
            setStaffList(data);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal memuat staf');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    return { staffList, isLoading: isLoading, refetch: fetchStaff };
}

// --- Hook: useSaveShift (Tidak Berubah) ---
function useSaveShift() {
    const [isSaving, setIsSaving] = useState(false);

    const saveShift = useCallback(async (newAssignment: ShiftAssignment) => {
        setIsSaving(true);
        const promise = fetch('/api/shift-assignments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssignment),
        }).then(async (res) => {
            if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan tim jaga');
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Menyimpan tim jaga...',
            success: 'Tim jaga berhasil diperbarui!',
            error: (err) => err.message,
        });

        try {
            await promise;
            return true; 
        } catch {
            return false; 
        } finally {
            setIsSaving(false);
        }
    }, []);

    return { saveShift, isSaving };
}


// --- Komponen Modal: AssignRoomModal (Perbaikan ESLint) ---
interface AssignRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newTeam: Staff[]) => void;
    roomName: string; 
    availableStaff: ActiveStaff[]; 
    initialTeam: Staff[];
    isSaving: boolean;
}

const AssignRoomModal: React.FC<AssignRoomModalProps> = ({
    isOpen, onClose, onSave, roomName, availableStaff, initialTeam, isSaving
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        () => new Set(initialTeam.map(s => s.id))
    );

    useEffect(() => {
        setSelectedIds(new Set(initialTeam.map(s => s.id)));
    }, [isOpen, initialTeam]);

    const handleToggle = (staffId: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(staffId)) newSelection.delete(staffId);
        else newSelection.add(staffId);
        setSelectedIds(newSelection);
    };

    const handleSave = () => {
        const newTeam: Staff[] = availableStaff
            .filter(s => selectedIds.has(s.id))
            .map(({ ...staff }) => staff); 
        onSave(newTeam);
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                        Atur Tim - {roomName} 
                    </h3>
                    <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}>
                        <X size={24} className="text-slate-500" />
                    </motion.button>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">
                    Pilih staf dari daftar tim yang sedang dinas.
                </p>

                <div className="max-h-64 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-md border border-slate-200">
                    {availableStaff.length === 0 && (
                        <p className="text-sm text-slate-500 italic text-center p-4">
                            Tidak ada staf yang sedang dinas.
                        </p>
                    )}
                    {availableStaff.map(staff => (
                        <label
                            key={staff.id}
                            className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.has(staff.id)}
                                onChange={() => handleToggle(staff.id)}
                                className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                              <span className="font-medium text-slate-700">{staff.name}</span>
                              <span className="ml-2 text-xs text-blue-600">({staff.duty})</span>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <motion.button onClick={onClose} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200" disabled={isSaving}>
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


// --- Komponen Modal: AssignShiftModal (Filter + Hapus Dark Mode) ---

// Varian animasi (Tidak Berubah)
const tabContentVariants: Variants = {
  hidden: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
const listVariantsModal: Variants = {
  visible: { transition: { staggerChildren: 0.03 } }
};
const itemVariantsModal: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// Helper (Tidak Berubah)
const createToggleHandler = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (id: string) => {
  setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
  });
};

interface AssignShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newAssignment: ShiftAssignment) => Promise<boolean>; 
    allStaff: Staff[];
    currentAssignment: ShiftAssignment | null;
    isSaving: boolean;
}

const AssignShiftModal: React.FC<AssignShiftModalProps> = ({
    isOpen, onClose, onSave, allStaff, currentAssignment, isSaving
}) => {
    // State untuk ID
    const [anesthesiaIds, setAnesthesiaIds] = useState<Set<string>>(new Set());
    const [pagiIds, setPagiIds] = useState<Set<string>>(new Set());
    const [siangIds, setSiangIds] = useState<Set<string>>(new Set());
    const [malamIds, setMalamIds] = useState<Set<string>>(new Set());

    // State untuk Tab
    const [mainTab, setMainTab] = useState<'anestesi' | 'perawat'>('anestesi');
    const [nurseTab, setNurseTab] = useState<ShiftKey>('Pagi');

    // State Filter
    const [searchTerm, setSearchTerm] = useState('');

    // Memfilter daftar staf (hanya dijalankan jika allStaff berubah)
    const { anesthesiaStaff, nurseStaff } = useMemo(() => {
        return {
            anesthesiaStaff: allStaff.filter(s => s.role.toLowerCase().includes('anestesi')),
            nurseStaff: allStaff.filter(s => s.role.toLowerCase().includes('perawat')),
        };
    }, [allStaff]);

    // Mengisi state modal dengan data saat ini ketika modal dibuka
    useEffect(() => {
        if (currentAssignment) {
            setAnesthesiaIds(new Set(currentAssignment.anesthesiaTeam.map(s => s.id)));
            setPagiIds(new Set(currentAssignment.nurseTeams.Pagi.map(s => s.id)));
            setSiangIds(new Set(currentAssignment.nurseTeams.Siang.map(s => s.id)));
            setMalamIds(new Set(currentAssignment.nurseTeams.Malam.map(s => s.id)));
        }
        // Reset filter saat modal dibuka
        setSearchTerm('');
    }, [isOpen, currentAssignment]);

    // Fungsi toggle (Tidak Berubah)
    const handleAnesthesiaToggle = createToggleHandler(setAnesthesiaIds);
    const handlePagiToggle = createToggleHandler(setPagiIds);
    const handleSiangToggle = createToggleHandler(setSiangIds);
    const handleMalamToggle = createToggleHandler(setMalamIds);

    const handleSaveClick = async () => {
        const newAssignment: ShiftAssignment = {
            anesthesiaTeam: allStaff.filter(s => anesthesiaIds.has(s.id)), // Filter dari allStaff
            nurseTeams: {
                Pagi: allStaff.filter(s => pagiIds.has(s.id)),
                Siang: allStaff.filter(s => siangIds.has(s.id)),
                Malam: allStaff.filter(s => malamIds.has(s.id)),
            }
        };
        
        const success = await onSave(newAssignment);
        if (success) {
            onClose(); 
        }
    };

    // Filter list sebelum di-render
    const term = searchTerm.toLowerCase();
    const filteredAnesthesia = anesthesiaStaff.filter(s => s.name.toLowerCase().includes(term));
    const filteredNurses = nurseStaff.filter(s => s.name.toLowerCase().includes(term));

    // Helper component untuk list staff dengan checkbox (Tidak Berubah)
    const StaffCheckboxList = ({ staffList, selectedIds, onToggle }: {
        staffList: Staff[];
        selectedIds: Set<string>;
        onToggle: (id: string) => void;
    }) => (
        <motion.ul 
          className="h-64 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-md border border-slate-200"
          variants={listVariantsModal}
          initial="hidden"
          animate="visible"
        >
            {staffList.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center p-4">
                    {searchTerm ? 'Nama tidak ditemukan.' : 'Tidak ada staf di kategori ini.'}
                </p>
            )}
            {staffList.map(staff => (
                <motion.li key={staff.id} variants={itemVariantsModal}>
                    <label className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedIds.has(staff.id)}
                            onChange={() => onToggle(staff.id)}
                            disabled={isSaving}
                            className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 font-medium text-slate-700">{staff.name}</span>
                        <span className="ml-2 text-xs text-slate-500">({staff.role})</span>
                    </label>
                </motion.li>
            ))}
        </motion.ul>
    );

    // Helper untuk Tombol Tab (Tidak Berubah)
    const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
      <button
        onClick={onClick}
        className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {label}
        {isActive && (
          <motion.div
            layoutId="active-tab-underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          />
        )}
      </button>
    );
    
    // Helper untuk Tombol Sub-Tab (Tidak Berubah)
    const SubTabButton = ({ label, isActive, onClick, icon: Icon }: { label: string; isActive: boolean; onClick: () => void; icon: React.ElementType }) => (
      <button
        onClick={onClick}
        className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActive ? 'text-green-700 bg-green-100' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <Icon size={16} />
        {label}
        {isActive && (
          <motion.div
            layoutId="active-subtab-underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
          />
        )}
      </button>
    );


    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                        Atur Tim Jaga Harian
                    </h3>
                    <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}>
                        <X size={24} className="text-slate-500" />
                    </motion.button>
                </div>

                {/* --- Navigasi Tab Utama --- */}
                <div className="flex justify-between items-center border-b border-slate-200 mb-4">
                    <div className="flex">
                        <TabButton 
                          label="Tim Anestesi" 
                          isActive={mainTab === 'anestesi'} 
                          onClick={() => setMainTab('anestesi')} 
                        />
                        <TabButton 
                          label="Tim Perawat" 
                          isActive={mainTab === 'perawat'} 
                          onClick={() => setMainTab('perawat')} 
                        />
                    </div>
                    {/* INPUT FILTER */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama staf..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-2 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>


                {/* --- Konten Tab dengan Animasi --- */}
                <AnimatePresence mode="wait">
                    {mainTab === 'anestesi' && (
                        <motion.div
                            key="anestesi"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <StaffCheckboxList
                                staffList={filteredAnesthesia} // Gunakan list yang sudah difilter
                                selectedIds={anesthesiaIds}
                                onToggle={handleAnesthesiaToggle}
                            />
                        </motion.div>
                    )}

                    {mainTab === 'perawat' && (
                        <motion.div
                            key="perawat"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Navigasi Sub-Tab Perawat */}
                            <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-lg">
                                <SubTabButton 
                                  label="Pagi" 
                                  isActive={nurseTab === 'Pagi'} 
                                  onClick={() => setNurseTab('Pagi')}
                                  icon={SHIFT_DETAILS['Pagi'].icon}
                                />
                                <SubTabButton 
                                  label="Siang" 
                                  isActive={nurseTab === 'Siang'} 
                                  onClick={() => setNurseTab('Siang')}
                                  icon={SHIFT_DETAILS['Siang'].icon}
                                />
                                <SubTabButton 
                                  label="Malam" 
                                  isActive={nurseTab === 'Malam'} 
                                  onClick={() => setNurseTab('Malam')}
                                  icon={SHIFT_DETAILS['Malam'].icon}
                                />
                            </div>

                            {/* Konten Sub-Tab dengan Animasi */}
                            <AnimatePresence mode="wait">
                                {nurseTab === 'Pagi' && (
                                    <motion.div key="pagi" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                        <StaffCheckboxList staffList={filteredNurses} selectedIds={pagiIds} onToggle={handlePagiToggle} />
                                    </motion.div>
                                )}
                                {nurseTab === 'Siang' && (
                                    <motion.div key="siang" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                        <StaffCheckboxList staffList={filteredNurses} selectedIds={siangIds} onToggle={handleSiangToggle} />
                                    </motion.div>
                                )}
                                {nurseTab === 'Malam' && (
                                    <motion.div key="malam" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit">
                                        <StaffCheckboxList staffList={filteredNurses} selectedIds={malamIds} onToggle={handleMalamToggle} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Footer Tombol --- */}
                <div className="mt-6 flex justify-end gap-3">
                    <motion.button onClick={onClose} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200" disabled={isSaving}>
                        Batal
                    </motion.button>
                    <motion.button onClick={handleSaveClick} whileTap={{ scale: 0.95 }} className="flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" disabled={isSaving}>
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span className="ml-2">Simpan Tim Jaga</span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// --- Komponen Utama Penampil Data (ShiftDisplay) ---

const ShiftDisplay = () => {
    // State & Hook (Tim Jaga)
    const [assignment, setAssignment] = useState<ShiftAssignment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { archive, isArchiving } = useArchiveShift();
    
    // State & Hook (Kamar Operasi)
    const { roomAssignments, isLoading: isRoomLoading, isSaving: isRoomSaving, saveAssignments } = useRoomAssignments();

    // Hook (Staf & Simpan)
    const { staffList, isLoading: isStaffLoading } = useAllStaff();
    const { saveShift, isSaving: isShiftSaving } = useSaveShift();

    // State Modal
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<{ id: string, name: string } | null>(null);

    // 🔹 Hook Dark Mode Dihapus 🔹

    // Fungsi fetch data shift (Tim Jaga)
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAssignment(null); 
        try {
            const res = await fetch('/api/shift-assignments');
            if (!res.ok) throw new Error((await res.json()).error || 'Gagal memuat tim jaga');
            const data: ShiftAssignment = await res.json();
            setAssignment({
                anesthesiaTeam: data.anesthesiaTeam || [],
                nurseTeams: data.nurseTeams || { Pagi: [], Siang: [], Malam: [] }
            });
        } catch (e: unknown) {
            setError(`Fetch Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    // Handler arsip
    const handleArchiveClick = () => { archive(assignment); };

    // Staf Aktif (Tidak Berubah)
    const activeStaffPool = useMemo((): ActiveStaff[] => {
        if (!assignment) return [];
        const currentShiftKey = getCurrentShift();
        
        const activeNurses: ActiveStaff[] = (assignment.nurseTeams[currentShiftKey] || []).map(staff => ({
            ...staff,
            duty: `Dinas ${currentShiftKey}`
        }));
        
        const activeAnesthesia: ActiveStaff[] = (assignment.anesthesiaTeam || []).map(staff => ({
            ...staff,
            duty: 'Dinas Anestesi'
        }));
        
        return [...activeAnesthesia, ...activeNurses];
    }, [assignment]);

    // Handler Modal Kamar Operasi (Tidak berubah)
    const handleOpenRoomModal = (room: { id: string, name: string }) => {
        setSelectedRoom(room);
    };

    const handleSaveRoomTeam = (newTeam: Staff[]) => {
        if (!selectedRoom) return;
        const newRoomAssignments: RoomAssignments = {
            ...roomAssignments,
            [selectedRoom.id]: newTeam 
        };
        saveAssignments(newRoomAssignments);
        setSelectedRoom(null);
    };

    // Handler Modal Tim Jaga (Tidak berubah)
    const handleSaveShift = async (newAssignment: ShiftAssignment) => {
        const success = await saveShift(newAssignment);
        if (success) {
            fetchData(); 
            setIsShiftModalOpen(false);
            return true;
        }
        return false;
    };

    // renderStaffList (Hapus Dark Mode)
    const renderStaffList = (staffList: Staff[], emptyMessage: string) => {
        if (!staffList || staffList.length === 0) {
            return <p className="text-sm text-slate-500 italic">{emptyMessage}</p>;
        }
        return (
            // Wrapper div dengan max-h dan overflow
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                <motion.ul className="space-y-1" variants={listVariants} initial="hidden" animate="visible">
                    {staffList.map(staff => (
                        <motion.li 
                            key={staff.id} 
                            className="flex items-center text-sm p-1.5 border border-transparent rounded-lg cursor-pointer" 
                            variants={itemVariants} 
                            whileHover={{ 
                                backgroundColor: "#f8fafc", // slate-50
                                borderColor: "#e2e8f0", // slate-200
                                x: 5 
                            }} 
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <User size={14} className="mr-2 text-slate-400 flex-shrink-0" />
                            <motion.span 
                                className="font-medium text-slate-800" 
                                whileHover={{ x: 4, color: "#2563eb" }} // blue-600
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {staff.name}
                            </motion.span>
                            <span className="text-slate-600 ml-1.5">({staff.role})</span>
                        </motion.li>
                    ))}
                </motion.ul>
            </div>
        );
    };


    const totalLoading = isLoading || isRoomLoading || isStaffLoading;
    const totalSaving = isArchiving || isRoomSaving || isShiftSaving;

    return (
        // Latar belakang utama
        <div className="bg-slate-50 p-4 md:p-8 min-h-svh">
            <Toaster position="top-right" richColors />
            
            {/* 🔹 KONTAINER UTAMA: max-w-7xl dihapus 🔹 */}
            <motion.div 
                className="p-4 sm:p-6 mx-auto bg-white shadow-lg rounded-xl border border-slate-200" 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* --- Header --- */}
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center">
                        <ClipboardClock size={28} className="text-blue-600 mr-3" />
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                            Penugasan Aktif
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        
                        {/* 🔹 TOMBOL ATUR TIM JAGA (PINDAH KE SINI) 🔹 */}
                        <motion.button 
                            onClick={() => setIsShiftModalOpen(true)} 
                            title="Atur Tim Jaga Harian" 
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors disabled:opacity-50" 
                            whileHover={{ scale: 1.1 }} 
                            whileTap={{ scale: 0.9 }}
                            disabled={totalSaving}
                        >
                            <UserPlus size={18} />
                        </motion.button>

                        {/* Tombol Arsip */}
                        <motion.button onClick={handleArchiveClick} disabled={totalLoading || totalSaving || !assignment} title="Arsipkan Jadwal Ini" className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-purple-600 transition-colors disabled:opacity-50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            {isArchiving ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                        </motion.button>
                        
                        {/* Tombol Refresh */}
                        <motion.button onClick={fetchData} disabled={totalLoading || totalSaving} title="Refresh Data" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50" whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9, rotate: -15 }}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* --- Status Error --- */}
                    {error && (
                        <motion.div key="error" className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg border border-red-200 font-medium flex items-center" variants={statusVariants} initial="initial" animate="animate" exit="exit">
                            <AlertTriangle size={18} className="mr-2 text-red-600" />
                            <div><span className="font-bold">Gagal memuat data:</span> {error}</div>
                        </motion.div>
                    )}

                    {/* --- Status Loading --- */}
                    {totalLoading && !error && (
                        <motion.div key="loading" className="flex justify-center items-center h-48" variants={statusVariants} initial="initial" animate="animate" exit="exit">
                            <Loader2 size={24} className="animate-spin text-blue-600" />
                            <span className="ml-3 text-lg text-slate-600">Memuat data penugasan...</span>
                        </motion.div>
                    )}

                    {/* --- Konten Utama --- */}
                    {!totalLoading && !error && (
                        <motion.div key="content" className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={mainContentVariants} initial="hidden" animate="visible" exit="exit">
                            
                            {/* KOLOM KIRI (Kamar Operasi) */}
                            <motion.div className="lg:col-span-2 p-4 bg-white border border-slate-200 rounded-lg" variants={sectionVariants}>
                                <h3 className="font-semibold text-slate-700 mb-4 text-lg flex items-center">
                                    <DoorOpen size={18} className="mr-2.5 text-indigo-600" />
                                    Penugasan Kamar Operasi (Shift Ini: {getCurrentShift()})
                                </h3>
                                <div className="space-y-4">
                                    {OPERATING_ROOMS.map(room => {
                                        const team = roomAssignments[room.id] || [];
                                        return (
                                            <div key={room.id} className="p-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                                                <h4 className="font-bold text-indigo-900 mb-2 flex justify-between items-center">
                                                    {room.name}
                                                    <motion.button onClick={() => handleOpenRoomModal(room)} whileTap={{ scale: 0.95 }} disabled={totalSaving} className="text-xs text-indigo-600 hover:underline disabled:text-slate-400">
                                                        [Atur]
                                                    </motion.button>
                                                </h4>
                                                <p className="text-xs text-slate-500 italic mb-2">{room.description}</p>
                                                <div className='text-xs'>
                                                    {renderStaffList(team, "Kamar Kosong")}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                            
                            {/* KOLOM KANAN (Tim Jaga) */}
                            <motion.div className="lg:col-span-1 space-y-6" variants={sectionVariants}>
                              
                              {/* 🔹 Tombol "Atur Tim Jaga" sudah dipindah ke header 🔹 */}

                              <motion.div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg" variants={sectionVariants}>
                                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center text-lg">
                                      <Users size={18} className="mr-2.5" />
                                      Tim Dokter Anestesi (Jaga 24 Jam)
                                  </h3>
                                  {renderStaffList(assignment?.anesthesiaTeam || [], "Tidak ada dokter anestesi yang ditugaskan.")}
                              </motion.div>

                              <motion.div variants={sectionVariants}>
                                  <h3 className="font-semibold text-slate-700 mb-4 text-lg">
                                      Tim Perawat per Shift
                                  </h3>
                                  <div className="grid grid-cols-1 gap-4">
                                      {SHIFTS.map(shift => {
                                          const ShiftIcon = SHIFT_DETAILS[shift].icon;
                                          return (
                                              <div key={shift} className="p-2 truncate bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                                                  <h4 className="font-extrabold text-green-900 mb-3 flex items-center">
                                                      <ShiftIcon size={16} className="mr-2 " />
                                                      Shift {shift}
                                                  </h4>
                                                  <div className='text-xs'>
                                                    {renderStaffList(assignment?.nurseTeams[shift] || [], "Shift kosong.")}
                                                  </div>
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

            {/* Render Semua Modal */}
            <AnimatePresence>
                {/* Modal untuk Kamar Operasi */}
                {selectedRoom && (
                    <AssignRoomModal
                        isOpen={!!selectedRoom}
                        onClose={() => setSelectedRoom(null)}
                        onSave={handleSaveRoomTeam}
                        roomName={selectedRoom.name} 
                        availableStaff={activeStaffPool} 
                        initialTeam={roomAssignments[selectedRoom.id] || []}
                        isSaving={isRoomSaving}
                    />
                )}
                
                {/* Modal untuk Tim Jaga Harian */}
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
}

export default ShiftDisplay;