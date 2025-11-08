"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/lib/scheduleApi";
import type { ScheduledSurgery, NewScheduledSurgery } from "@/types";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { toast } from "sonner";
import { Pencil, Search, Trash, Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react"; // Impor ikon baru

// 🔹 1. Komponen Pagination (BARU) 🔹
// -------------------------------------------------------------------
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  
  // Jangan tampilkan pagination jika hanya ada 1 halaman
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-5 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
      <motion.button
        onClick={handlePrev}
        disabled={currentPage === 1}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1 rounded-md bg-gray-200 dark:bg-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
      >
        <ChevronLeft size={16} />
        Sebelumnya
      </motion.button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Halaman {currentPage} dari {totalPages}
      </span>
      <motion.button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1 rounded-md bg-gray-200 dark:bg-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
      >
        Berikutnya
        <ChevronRight size={16} />
      </motion.button>
    </div>
  );
};
// -------------------------------------------------------------------
// 🔹 AKHIR Komponen Pagination 🔹
// -------------------------------------------------------------------


export default function JadwalOperasiPage() {
  const [schedules, setSchedules] = useState<ScheduledSurgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<ScheduledSurgery | null>(null);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🔹 2. Filter Default ke Hari Ini (PERUBAHAN) 🔹
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today); // Default: hari ini
  const [endDate, setEndDate] = useState(today); // Default: hari ini

  // 🔹 3. State Pagination (BARU) 🔹
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Atur jumlah item per halaman

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch {
      toast.error("Gagal memuat jadwal dari database.");
    } finally {
      setLoading(false);
    }
  }

  // ... (Fungsi handleAdd, handleEdit, handleDelete tetap sama) ...
  async function handleAdd(schedule: NewScheduledSurgery) {
    setSubmitting(true);
    try {
      await createSchedule(schedule);
      toast.success("Jadwal baru berhasil ditambahkan.");
      setAdding(false);
      await loadData();
    } catch {
      toast.error("Gagal menambahkan jadwal.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(schedule: ScheduledSurgery) {
    setSubmitting(true);
    try {
      await updateSchedule(schedule);
      toast.success("Jadwal berhasil diperbarui.");
      setEditing(null);
      await loadData();
    } catch {
      toast.error("Gagal memperbarui jadwal.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      try {
        await deleteSchedule(id);
        toast.success("Jadwal berhasil dihapus.");
        await loadData();
      } catch {
        toast.error("Gagal menghapus jadwal.");
      }
    }
  }


  // 🔹 Filter pencarian + tanggal (Logika tetap sama)
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return schedules.filter((s) => {
      const matchesText =
        s.patientName.toLowerCase().includes(term) ||
        s.doctorName.toLowerCase().includes(term) ||
        s.procedure.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term) ||
        // 🔹 PERMINTAAN 2: Pasien 'Dibatalkan' akan tetap muncul jika dicari
        // atau jika filternya cocok.
        (term === 'dibatalkan' && s.status === 'Dibatalkan');

      const scheduleDate = new Date(s.scheduledAt);
      
      // Penyesuaian logika tanggal agar lebih inklusif
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;
      
      if(start) start.setHours(0,0,0,0); // Set ke awal hari

      const afterStart = start ? scheduleDate >= start : true;
      const beforeEnd = end ? scheduleDate <= end : true;

      return matchesText && afterStart && beforeEnd;
    });
  }, [schedules, searchTerm, startDate, endDate]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      ),
    [filtered]
  );
  
  // 🔹 4. Reset halaman saat filter berubah (BARU) 🔹
  useEffect(() => {
    setCurrentPage(1); // Kembali ke halaman 1 setiap kali filter berubah
  }, [sorted]);

  // 🔹 5. Logika Slicing untuk Pagination (BARU) 🔹
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);


  // ... (Fungsi getStatusColor tetap sama) ...
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terjadwal":
        return "bg-blue-300 dark:bg-blue-800/30";
      case "Terkonfirmasi":
        return "bg-yellow-300 dark:bg-yellow-400/60";
      case "Dibatalkan":
        return "bg-red-500 dark:bg-red-700/50";
      case "Siap Panggil":
        return "bg-orange-300 dark:bg-orange-400/60";
      case "Dipanggil":
        return "bg-green-300 dark:bg-green-900";
      case "Pasien Diterima":
        return "bg-sky-300 dark:bg-sky-700/60";
      case "Persiapan Operasi":
        return "bg-purple-300 dark:bg-purple-700/60";
      case "Operasi Berlangsung":
        return "bg-gray-300 dark:bg-gray-800/40";
      case "Operasi Selesai":
        return "bg-emerald-300 dark:bg-emerald-700/70";
      case "Ruang Pemulihan":
        return "bg-cyan-300 dark:bg-cyan-400/80";
      default:
        return "bg-white dark:bg-gray-700";
    }
  };


  if (loading) {
    // ... (Indikator loading tetap sama) ...
    return (
      <div className="flex items-center justify-center py-10">
        <motion.div
          className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent dark:border-gray-600 dark:border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  // 🔹 6. Hapus logika 'shouldScroll' (PERUBAHAN) 🔹
  // const shouldScroll = sorted.length > 15; // Tidak diperlukan lagi

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 space-y-5 transition-colors duration-300">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Jadwal Operasi
          </h1>
          
          {/* 🔹 7. Tampilkan Jumlah Pasien (BARU) 🔹 */}
          <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full">
            <Users size={16} />
            <span className="font-bold text-sm">
              {sorted.length} Pasien
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* ... (Search bar dan filter tanggal tetap sama) ... */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Cari pasien, dokter, atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                         border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-8 pr-2 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200"
              />
            </div>
            <span className="text-gray-600 dark:text-gray-300 text-sm">s.d</span>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-8 pr-2 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          
          <motion.button
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            whileTap={{ scale: 0.98 }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white
                       hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-sm"
          >
            + Tambah Jadwal
          </motion.button>
        </div>
      </div>

      {/* 🔹 Form Area (Tetap sama) */}
      <AnimatePresence mode="wait">
        {adding && (
          <ScheduleForm
            key="create-form"
            mode="create"
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
            isSubmitting={submitting}
          />
        )}
        {editing && (
          <ScheduleForm
            key="edit-form"
            mode="edit"
            initialData={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
            isSubmitting={submitting}
          />
        )}
      </AnimatePresence>

      {/* 🔹 8. Mobile Card View (PERUBAHAN) 🔹 */}
      <div
        // Hapus: max-h-[70vh] overflow-y-auto
        className="grid gap-4 sm:hidden"
      >
        {/* Map menggunakan 'paginatedSchedules' BUKAN 'sorted' */}
        {paginatedSchedules.map((s) => (
          <motion.div
            key={s.id}
            layout
            className={`rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 ${getStatusColor(
              s.status
            )}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{s.patientName}</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/60 dark:bg-black/40">
                {s.status}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>MRN:</strong> {s.mrn}</p>
              <p><strong>Prosedur:</strong> {s.procedure}</p>
              <p><strong>Dokter:</strong> {s.doctorName}</p>
              <p><strong>Waktu:</strong>
                {new Date(s.scheduledAt).toLocaleString("id-ID", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              {s.notes && (
                <p className="italic text-gray-600 dark:text-gray-400">{s.notes}</p>
              )}
            </div>
            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => {
                  setEditing(s);
                  setAdding(false);
                }}
                className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => void handleDelete(s.id)}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🔹 9. Desktop Table View (PERUBAHAN) 🔹 */}
      <div
        // Hapus: max-h-[70vh] overflow-y-auto
        className="hidden sm:block border border-gray-200 dark:border-gray-700 rounded-md shadow"
      >
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
            {/* ... (Header tabel tetap sama) ... */}
            <tr>
              {[
                "Nama Pasien", "MRN", "Prosedur", "Assuransi", "Ruang", "OR",
                "Dokter", "Waktu", "Catatan", "status", "",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {/* Map menggunakan 'paginatedSchedules' BUKAN 'sorted' */}
              {paginatedSchedules.map((s) => (
                <motion.tr
                  key={s.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`${getStatusColor(
                    s.status
                  )} border-t border-gray-200 dark:border-gray-700`}
                >
                  <td className="px-3 py-2 truncate">{s.patientName}</td>
                  <td className="px-3 py-2 truncate">{s.mrn}</td>
                  <td className="px-3 py-2 truncate">{s.procedure}</td>
                  <td className="px-3 py-2 truncate">{s.assurance}</td>
                  <td className="px-3 py-2 truncate">{s.room}</td>
                  <td className="px-3 py-2 truncate">OR {s.assignedOR}</td>
                  <td className="px-3 py-2 truncate">{s.doctorName}</td>
                  
                  <td className="px-3 py-2 truncate">
                    {new Date(s.scheduledAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  {/* <td className="px-3 py-2 truncate font-semibold">{s.status}</td> */}
                  <td className="px-3 py-2 truncate">{s.notes}</td>
                  <td className="px-3 py-2 truncate">{s.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(s);
                          setAdding(false);
                        }}
                        className="rounded bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(s.id)}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* 🔹 10. Tambahkan Kontrol Pagination (BARU) 🔹 */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}