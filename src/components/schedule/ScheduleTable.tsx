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

export default function ScheduleTable() {
  const [schedules, setSchedules] = useState<ScheduledSurgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<ScheduledSurgery | null>(null);
  const [adding, setAdding] = useState(false);

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

  const sorted = useMemo(
    () =>
      [...(schedules || [])].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      ),
    [schedules]
  );

  if (loading) {
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

  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Manajemen Jadwal Operasi</h1>
        <motion.button
          onClick={() => {
            setAdding(true);
            setEditing(null);
          }}
          whileTap={{ scale: 0.98 }}
          className="self-start rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          + Tambah Jadwal
        </motion.button>
      </div>

      {/* Form */}
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

      {/* Mobile List */}
      <div className="grid gap-3 sm:hidden">
        <AnimatePresence>
          {sorted.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow
                         dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold">{s.patientName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {s.mrn} • {s.procedure}
                  </p>
                </div>
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium
                             bg-gray-100 dark:bg-gray-800"
                >
                  {s.status}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <p>Dokter: {s.doctorName}</p>
                <p>
                  Waktu:{" "}
                  {new Date(s.scheduledAt).toLocaleString("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditing(s);
                    setAdding(false);
                  }}
                  className="rounded-xl bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white
                             hover:bg-yellow-600"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void handleDelete(s.id)}
                  className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white
                             hover:bg-red-700"
                >
                  Hapus
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop Table */}
      <div
        className={`hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 shadow dark:border-gray-700 ${
          sorted.length > 15 ? "max-h-[70vh] overflow-y-auto" : ""
        }`}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left dark:bg-gray-800">
            <tr>
              {[
                "Nama Pasien",
                "MRN",
                "Prosedur",
                "Dokter",
                "Waktu",
                "Status",
                "Aksi",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            <AnimatePresence initial={false}>
              {sorted.map((s) => (
                <motion.tr
                  key={s.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-3 py-2">{s.patientName}</td>
                  <td className="px-3 py-2">{s.mrn}</td>
                  <td className="px-3 py-2">{s.procedure}</td>
                  <td className="px-3 py-2">{s.doctorName}</td>
                  <td className="px-3 py-2">
                    {new Date(s.scheduledAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditing(s);
                          setAdding(false);
                        }}
                        className="rounded-lg bg-yellow-500 px-3 py-1.5 font-medium text-white hover:bg-yellow-600"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => void handleDelete(s.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
                      >
                        Hapus
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
