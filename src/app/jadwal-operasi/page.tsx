'use client';

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
import {
  Pencil,
  Search,
  Trash,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
} from "lucide-react";


// 📌 Pagination
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-5 gap-3 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-center sm:justify-start gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Sebelumnya
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40"
        >
          Berikutnya <ChevronRight size={16} />
        </motion.button>
      </div>
      <span className="text-center sm:text-right text-sm text-gray-700 dark:text-gray-300">
        Halaman {currentPage} dari {totalPages}
      </span>
    </div>
  );
};


// 📌 Modal Konfirmasi
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <AlertTriangle className="text-red-500 mx-auto mb-3" size={40} />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          Konfirmasi
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{message}</p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


export default function JadwalOperasiPage() {
  const [schedules, setSchedules] = useState<ScheduledSurgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<ScheduledSurgery | null>(null);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  async function handleConfirmDelete() {
    if (!confirmId) return;
    try {
      await deleteSchedule(confirmId);
      toast.success("Jadwal berhasil dihapus.");
      setConfirmId(null);
      await loadData();
    } catch {
      toast.error("Gagal menghapus jadwal.");
    }
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return schedules.filter((s) => {
      const matchesText =
        s.patientName.toLowerCase().includes(term) ||
        s.doctorName.toLowerCase().includes(term) ||
        s.procedure.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term);

      const date = new Date(s.scheduledAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + "T23:59:59") : null;
      return matchesText && (!start || date >= start) && (!end || date <= end);
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

  useEffect(() => setCurrentPage(1), [sorted]);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-10">
        <motion.div
          className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent dark:border-gray-600 dark:border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-3 sm:p-5 space-y-5 transition-colors duration-300">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Jadwal Operasi
          </h1>
          <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full w-fit">
            <Users size={16} />{" "}
            <span className="font-semibold text-sm">{sorted.length} Pasien</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Cari pasien, dokter, atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border dark:border-gray-700" />
            <span className="text-gray-600 dark:text-gray-300 text-sm self-center">s.d</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2 py-2 rounded-md text-sm bg-white dark:bg-gray-800 border dark:border-gray-700" />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-sm"
          >
            + Tambah Jadwal
          </motion.button>
        </div>
      </div>

      {/* FORM */}
      <AnimatePresence>
        {adding && (
          <ScheduleForm
            key="add"
            mode="create"
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
            isSubmitting={submitting}
          />
        )}
        {editing && (
          <ScheduleForm
            key="edit"
            mode="edit"
            initialData={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
            isSubmitting={submitting}
          />
        )}
      </AnimatePresence>

      {/* 📱 MOBILE CARD VIEW */}
      <div className="grid gap-4 sm:hidden">
        {paginatedSchedules.map((s) => (
          <motion.div
            key={s.id}
            layout
            className={`rounded-xl p-4 border border-gray-300 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800`}
          >
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              {s.patientName}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {s.procedure} • Dr. {s.doctorName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {new Date(s.scheduledAt).toLocaleString("id-ID", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setEditing(s)}
                className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmId(s.id)}
                className="px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 💻 DESKTOP TABLE (ZEBRA STRIPE) */}
      <div className="hidden sm:block overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md shadow bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {["Pasien","MRN","Prosedur","Asuransi","Ruang","OR","Dokter","Waktu","Status","Aksi"].map((head) => (
                <th key={head} className="px-3 py-2 font-semibold text-gray-900 dark:text-slate-100 whitespace-nowrap">
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedSchedules.map((s, i) => (
              <motion.tr
                key={s.id}
                layout
                className={`${i % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/60" : "bg-gray-100 dark:bg-gray-800/30"} border-t border-gray-200 dark:border-gray-700`}
              >
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.patientName}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.mrn}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.procedure}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.assurance}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.room}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">OR {s.assignedOR}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.doctorName}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                  {new Date(s.scheduledAt).toLocaleString("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{s.status}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setEditing(s)}
                      className="rounded bg-yellow-500 px-2 py-1 text-xs text-white hover:bg-yellow-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmId(s.id)}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* MODAL */}
      <AnimatePresence>
        {confirmId && (
          <ConfirmModal
            message="Apakah Anda yakin ingin menghapus jadwal ini?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
