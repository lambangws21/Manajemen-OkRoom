'use client';

import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Loader2,
  AlertTriangle,
  Users,
  User,
  CalendarClock,
  Sun,
  Moon,
  Sunset,
  PlusIcon,
  Search,
  Calendar,
  CheckCircle,
  Trash2,
  Printer, // 🔹 Icon baru untuk Print
  // HeartPulse, // 💥 DIHAPUS: Tidak lagi menampilkan pasien
  DoorOpen, // 🔹 Icon baru
} from 'lucide-react';
// 💥 DIHAPUS: Impor komponen lokal yang menyebabkan error
// import StaffTable from '@/components/staffs/staff-tabel';
// import StaffForm from '@/components/staffs/staff-form';
// import Modal from '@/components/ui/modal';
import { Staff } from '@/types'; // Asumsi Staff diimpor dari sini
import clsx from 'clsx';
import { toast } from 'sonner';

type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];
const SHIFT_DETAILS: Record<ShiftKey, { icon: React.ElementType }> = {
  Pagi: { icon: Sun },
  Siang: { icon: Sunset },
  Malam: { icon: Moon },
};

interface NurseShiftTeams {
  Pagi: Staff[];
  Siang: Staff[];
  Malam: Staff[];
}

// 💥 PERUBAHAN: Tipe baru untuk PJ per shift
type ResponsibleStaffByShift = Record<ShiftKey, Staff | null>;

// ----------------------------------------------------------------
// 🔹 DATA BARU (Simulasi/Asumsi dari Backend)
// ----------------------------------------------------------------

// 💥 DIHAPUS: Interface ScheduledSurgery tidak lagi diperlukan di frontend
// interface ScheduledSurgery { ... }

// Asumsi tipe data untuk Penugasan Kamar
type RoomAssignmentsMap = Record<string, Staff[]>; // Misal: { "OK 1": [Staff, Staff], "OK 2": [Staff] }

// 💥 PERUBAHAN: HistoryEntry dengan data Pasien dan Kamar
interface HistoryEntry {
  id: string;
  archivedAt: string;
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
  responsibleStaffByShift: ResponsibleStaffByShift; 
  // 🔹 DATA BARU (Backend Anda harus menyediakan ini)
  // 💥 DIHAPUS: scheduledSurgeries?: ScheduledSurgery[];
  roomAssignments?: RoomAssignmentsMap;
}

// ----------------------------------------------------------------

interface StaffFormData {
  name: string;
  role: string;
  department: string;
}

const INITIAL_STAFF_STATE: StaffFormData = { name: '', role: '', department: '' };

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// 💥 PERUBAHAN: CSS untuk Print (target .printable-entry dan layout A4)
const PrintStyles = () => (
  <style jsx global>{`
    /* 🔹 Atur halaman A4 */
    @page {
      size: A4;
      margin: 15mm; /* Margin 1.5cm */
    }
    
    @media print {
      body {
         font-size: 10pt; /* Set font dasar */
         font-family: Arial, sans-serif;
         background-color: #fff !important;
      }
    
      /* Sembunyikan semua elemen di body secara default */
      body * {
        visibility: hidden;
        margin: 0;
        padding: 0;
        box-shadow: none !important;
        border: none !important;
      }
      
      /* Tampilkan hanya area print yang ditandai .printable-entry dan isinya */
      .printable-entry, .printable-entry * {
        visibility: visible;
      }
      
      /* Atur layout area print agar pas di A4 */
      .printable-entry {
        /* Hapus position absolute */
        width: 100%; /* Lebar penuh A4 (dikurangi margin @page) */
        color: #000 !important; 
        border: 1px solid #ccc !important;
        background-color: #fff !important;
        padding: 15px;
        page-break-inside: avoid; /* Hindari kartu terpotong */
      }

      /* Sembunyikan elemen UI seperti tombol */
      .no-print, .no-print * {
        display: none !important;
      }
      
      /* Hapus background dan pastikan teks terlihat */
      .printable-card-content {
         background-color: #f9f9f9 !important; 
         color: #000 !important;
         border: 1px solid #ccc !important;
         padding: 10px;
         margin-bottom: 10px;
         border-radius: 5px;
         page-break-inside: avoid; /* Hindari sub-card terpotong */
      }
      
      /* Pastikan teks di dalam card juga terlihat */
      .printable-card-content span,
      .printable-card-content p,
      .printable-card-content h2,
      .printable-card-content h3,
      .printable-card-content h4,
      .printable-card-content li,
      .printable-card-content div {
         color: #000 !important;
         background-color: transparent !important;
      }
      
      /* Paksa overflow agar terlihat saat print */
      .printable-overflow {
        overflow: visible !important;
        max-height: none !important;
      }
    }
  `}</style>
);

// ----------------------------------------------------------------
// 💥 PERBAIKAN: Komponen Dummy Lokal (Menggantikan Impor yang Gagal)
// ----------------------------------------------------------------

/**
 * (Dummy) Komponen Modal Sederhana
 */
const Modal: React.FC<React.PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
}>> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4"
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * (Dummy) Komponen Staff Form
 */
const StaffForm: React.FC<{
  formData: StaffFormData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  isEdit: boolean;
}> = ({ formData, onChange, onSubmit, isEdit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={onChange}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departemen</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={onChange}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {isEdit ? 'Update' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

/**
 * (Dummy) Komponen Staff Table
 */
const StaffTable: React.FC<{
  staffs: Staff[];
  loading: boolean;
  onEdit: (staff: Staff) => void;
  onDelete: (id: string) => void;
}> = ({ staffs, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nama</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Departemen</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {staffs.length === 0 ? (
             <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Tidak ada staff ditemukan.
                </td>
             </tr>
          ) : (
            staffs.map((staff) => (
              <tr key={staff.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{staff.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.role}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.department || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => onEdit(staff)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => onDelete(staff.id)} className="text-red-600 hover:text-red-800">Hapus</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


// ----------------------------------------------------------------
// Komponen Utama Halaman
// ----------------------------------------------------------------
export default function CombinedManagementPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>(INITIAL_STAFF_STATE);
  const [editId, setEditId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  /** ---------------- FETCH STAFF ---------------- */
  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staffs');
      const data = await res.json();
      setStaffs(Array.isArray(data) ? data : data.staffs ?? []);
    } catch (err) {
      console.error('Failed to fetch staffs:', err);
      toast.error('Gagal memuat daftar staf.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  /** ---------------- CRUD STAFF ---------------- */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_STAFF_STATE);
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) return toast.error('Nama dan Role wajib diisi!');
    try {
      const url = editId ? `/api/staffs/${editId}` : '/api/staffs';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Gagal menyimpan data staff.');
      toast.success(editId ? 'Staff berhasil diubah!' : 'Staff berhasil ditambahkan!');
      resetForm();
      fetchStaffs();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan staff.');
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditId(staff.id);
    setFormData({
      name: staff.name,
      role: staff.role,
      department: staff.department || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus staff ini?')) return;
    try {
      const res = await fetch(`/api/staffs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal hapus staff');
      toast.success('Staff berhasil dihapus.');
      fetchStaffs();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus staff.');
    }
  };

  /** ---------------- FUNGSI BARU: HAPUS HISTORY ---------------- */
  const handleDeleteHistory = async (id: string, archivedAt: string) => {
    const formattedDate = new Date(archivedAt).toLocaleDateString('id-ID');
    
    if (!confirm(`Yakin ingin menghapus histori shift tanggal ${formattedDate} ini? Aksi ini tidak dapat dibatalkan.`)) {
      return;
    }
    
    const promise = fetch(`/api/shift-history/${id}`, { 
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error('Gagal terhubung atau menghapus entri.');
      }
      return res.json();
    });

    toast.promise(promise, {
        loading: 'Menghapus histori...',
        success: () => {
             // Memperbarui state secara optimis/langsung
            setHistoryList(prev => prev.filter(entry => entry.id !== id));
            setFilteredHistory(prev => prev.filter(entry => entry.id !== id));
            return 'Histori shift berhasil dihapus.';
        },
        error: (err: Error) => err.message,
    });
  };

  /** ---------------- FETCH HISTORY ---------------- */
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      // 🔹 CATATAN: Pastikan API /api/shift-history mengembalikan data BARU
      const res = await fetch('/api/shift-history', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal memuat histori');
      const data: HistoryEntry[] = await res.json();
      setHistoryList(data);
      setFilteredHistory(data);
    } catch {
      setError('Terjadi kesalahan saat memuat histori.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /** ---------------- FILTERS ---------------- */
  const filteredStaffs = staffs.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!selectedDate) {
      setFilteredHistory(historyList);
    } else {
      setFilteredHistory(
        historyList.filter((entry) => entry.archivedAt.startsWith(selectedDate))
      );
    }
  }, [selectedDate, historyList]);
  
  /** ---------------- 💥 FUNGSI PRINT SPESIFIK ---------------- */
  const handlePrintHistory = (entryId: string) => {
    const entryElement = document.getElementById(entryId);
    if (entryElement) {
      // Tambahkan kelas khusus ke elemen yang ingin diprint
      entryElement.classList.add('printable-entry');
      
      // Panggil print dialog
      window.print();
      
      // Hapus kelas setelah dialog print ditutup
      // (Diberi sedikit delay untuk memastikan proses print selesai)
      setTimeout(() => {
        entryElement.classList.remove('printable-entry');
      }, 100);
    }
  };


  /** ---------------- HELPERS ---------------- */
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Makassar', // Sesuaikan timezone
    });

  const renderStaffList = (list: Staff[], msg: string) =>
    list.length === 0 ? (
      <p className="text-sm text-gray-500 italic">{msg}</p>
    ) : (
      <motion.ul variants={listVariants} initial="hidden" animate="visible" className="space-y-1">
        {list.map((s) => (
          <motion.li key={s.id} variants={itemVariants} className="flex items-center text-[11px]">
            <User size={15} className="mr-1 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
            <span className="text-green-400 ml-1 text-[9px]">({s.role})</span>
          </motion.li>
        ))}
      </motion.ul>
    );
    
  // 💥 DIHAPUS: renderPatientList tidak lagi digunakan
  // const renderPatientList = (surgeries?: ScheduledSurgery[]) => { ... };
  
  // 🔹 HELPER BARU: Render Staf Kamar (untuk print)
  const renderRoomAssignments = (assignments?: RoomAssignmentsMap) => {
     if (!assignments || Object.keys(assignments).length === 0) {
      return <p className="text-sm text-gray-500 italic">Tidak ada data penugasan staf kamar.</p>;
    }
    return (
       <div className="space-y-2">
        {Object.entries(assignments).map(([room, staffList]) => (
          <div key={room}>
            <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-[11px] flex items-center">
                <DoorOpen size={14} className="mr-1" /> OK {room}
            </h5>
            {renderStaffList(staffList, 'Tidak ada staf ditugaskan.')}
          </div>
        ))}
       </div>
    );
  };

  return (
    <div className="p-2 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-[70svh]">
      {/* 🔹 Tambahkan style print ke DOM */}
      <PrintStyles />
      
      <div className="flex flex-col md:flex-row gap-6 max-w-full mx-auto transition-all duration-300">
        
        {/* ---------------- STAFF MANAGEMENT (No Print) ---------------- */}
        <motion.div
          layout
          className="flex-1 bg-white dark:bg-gray-800 shadow-xl rounded p-2 border border-gray-200 dark:border-gray-700 text-[13px] no-print"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Staff Operasi</h1>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition text-sm"
              >
                <PlusIcon className="w-4 h-4" /> Tambah
              </button>
            </div>
          </div>

          {/* Scroll aktif jika lebih dari 17 baris */}
          <div className={clsx('transition-all duration-300', filteredStaffs.length > 17 && 'max-h-[80vh] overflow-y-auto pr-2')}>
            {/* 💥 PERBAIKAN: Gunakan komponen dummy lokal */}
            <StaffTable staffs={filteredStaffs} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
          </div>

          {/* 💥 PERBAIKAN: Gunakan komponen dummy lokal */}
          <Modal isOpen={isModalOpen} onClose={resetForm} title={editId ? 'Edit Staff' : 'Tambah Staff'}>
            <StaffForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} isEdit={!!editId} />
          </Modal>
        </motion.div>

        {/* ---------------- HISTORY DISPLAY (Area Print) ---------------- */}
        {/* 🔹 Hapus ID area print global */}
        <div className="flex-1">
          <motion.div
            layout
            className="bg-white dark:bg-gray-800 shadow-xl rounded-md p-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center">
                <CalendarClock size={28} className="text-purple-600 dark:text-purple-400 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Histori Shift</h1>
              </div>
              {/* 🔹 Tombol filter (no-print) */}
              <div className="flex items-center gap-2 no-print">
                <Calendar size={18} className="text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="text-xs text-gray-400 hover:text-gray-200 underline"
                  >
                    Reset
                  </button>
                )}
                {/* 💥 DIHAPUS: Tombol Print Global dipindah */}
              </div>
            </div>

            <AnimatePresence>
              {isLoadingHistory ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 size={28} className="animate-spin text-purple-500" />
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Memuat histori...</span>
                </div>
              ) : error ? (
                <div className="flex items-center p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                  <AlertTriangle size={20} className="mr-3" />
                  {error}
                </div>
              ) : (
                // 🔹 Tambahkan kelas printable-overflow
                <div className={clsx('space-y-4 transition-all printable-overflow', filteredHistory.length > 3 && 'max-h-[80vh] overflow-y-auto pr-2')}>
                  {filteredHistory.length === 0 ? (
                    <p className="text-gray-500 italic">Tidak ada histori pada tanggal ini.</p>
                  ) : (
                    filteredHistory.map((entry) => (
                      // 💥 PERUBAHAN: Tambahkan ID unik untuk target print
                      <motion.div
                        key={entry.id}
                        id={`history-entry-${entry.id}`} // 🔹 ID UNIK
                        layout
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4 printable-card-content"
                      >
                        <div className="flex justify-between items-start mb-3"> 
                          <h2 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center text-md">
                            <CalendarClock size={16} className="mr-2" />
                            {formatDateTime(entry.archivedAt)}
                          </h2>
                          {/* 🔹 Tombol Aksi (Hapus & Print) - no-print */}
                          <div className='flex gap-2 no-print'>
                            {/* 💥 PERUBAHAN: Tombol Print Spesifik */}
                            <button
                              onClick={() => handlePrintHistory(`history-entry-${entry.id}`)}
                              className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Print Histori Ini"
                            >
                              <Printer size={14} className='mr-1' /> Print
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(entry.id, entry.archivedAt)}
                              className="flex items-center text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"
                              title="Hapus Histori Ini"
                            >
                              <Trash2 size={14} className='mr-1' /> Hapus
                            </button>
                          </div>
                        </div>

                        {/* 💥 PERUBAHAN: Penanggung Jawab per Shift */}
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md mb-3 printable-card-content">
                          <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center text-[11px]">
                            <CheckCircle size={16} className="mr-2" />
                            Penanggung Jawab Kamar Operasi
                          </h3>
                          <div className="space-y-2">
                            {SHIFTS.map((shift) => {
                              // 💥 PERBAIKAN: Cek null/undefined sebelum akses [shift]
                              const pj = entry.responsibleStaffByShift ? entry.responsibleStaffByShift[shift] : null;
                              const Icon = SHIFT_DETAILS[shift].icon;
                              return (
                                <div key={shift} className="flex items-center text-[11px] gap-2">
                                  <Icon size={16} className="text-yellow-600 dark:text-yellow-400" />
                                  <span className="font-semibold w-12">{shift}:</span>
                                  {pj ? (
                                    <div className="flex items-center text-[11px]">
                                      <User size={15} className="mr-1 text-yellow-600 dark:text-yellow-400" />
                                      <span className="font-bold text-yellow-900 dark:text-yellow-100">
                                        {pj.name}
                                      </span>
                                      <span className="text-yellow-700 dark:text-yellow-300 ml-1">
                                        ({pj.role})
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">Belum ditetapkan.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>


                        {/* Tim Anestesi */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md mb-3 printable-card-content">
                          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center text-[11px]">
                            <Users size={16} className="mr-2" />
                            Tim Anestesi ({entry.anesthesiaTeam.length})
                          </h3>
                          {renderStaffList(entry.anesthesiaTeam, 'Tidak ada dokter anestesi.')}
                        </div>
                        
                        {/* ---------------- 🔹 KONTEN PRINT BARU 🔹 ---------------- */}
                        
                        {/* 💥 DIHAPUS: 1. Pasien yang di Operasi */}
                        
                        {/* 2. Staf yang Bertugas di Kamar */}
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-md mb-3 printable-card-content">
                          <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center text-[11px]">
                            <DoorOpen size={16} className="mr-2" />
                            Staf Bertugas di Kamar Operasi
                          </h3>
                          {renderRoomAssignments(entry.roomAssignments)}
                        </div>
                        
                        {/* ---------------- 🔹 AKHIR KONTEN PRINT BARU 🔹 ---------------- */}


                        {/* Tim Perawat per Shift */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-wrap">
                          {SHIFTS.map((shift) => {
                            const Icon = SHIFT_DETAILS[shift].icon;
                            return (
                              <div
                                key={shift}
                                className="bg-green-50 dark:bg-green-900/30 p-1.5 rounded border-l-4 border-green-400 dark:border-green-600 text-[12px] printable-card-content"
                              >
                                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
                                  <Icon size={16} className="mr-2" /> Shift {shift}
                                </h4>
                                <div className="text-gray-600 dark:text-gray-400 text-[12px] truncate">
                                  {/* 💥 PERBAIKAN: Cek null/undefined sebelum akses [shift] */}
                                  {renderStaffList(entry.nurseTeams ? entry.nurseTeams[shift] : [], 'Shift kosong.')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

