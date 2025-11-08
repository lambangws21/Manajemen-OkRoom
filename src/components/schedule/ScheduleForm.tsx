"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { ScheduledSurgery, NewScheduledSurgery } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

type CreateProps = {
  mode: "create";
  onSubmit: (data: NewScheduledSurgery) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: never;
};

type EditProps = {
  mode: "edit";
  onSubmit: (data: ScheduledSurgery) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData: ScheduledSurgery;
};

type Props = CreateProps | EditProps;

const EMPTY_FORM: NewScheduledSurgery = {
  patientName: "",
  mrn: "",
  procedure: "",
  doctorName: "",
  notes: "",
  room: "",
  assurance: "",
  scheduledAt: "",
  status: "Terjadwal",
  assignedOR: "",
};

const STATUS_OPTIONS: ScheduledSurgery["status"][] = [
  "Terjadwal",
  "Terkonfirmasi",
  "Dibatalkan",
  // "Siap Panggil",
  // "Dipanggil",
  // "Pasien Diterima",
  // "Persiapan Operasi",
  // "Operasi Berlangsung",
  // "Operasi Selesai",
  // "Ruang Pemulihan",
];

export function ScheduleForm({ mode, onSubmit, onCancel, isSubmitting, initialData }: Props) {
  const [form, setForm] = useState<NewScheduledSurgery | ScheduledSurgery>(EMPTY_FORM);

  // ✅ Pastikan value selalu defined (tidak undefined)
  const safeValue = <T,>(value: T | undefined): T | string => (value ?? "") as T | string;

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const d = initialData;
      const localDateTime = d.scheduledAt
        ? new Date(d.scheduledAt).toISOString().slice(0, 16)
        : "";
      setForm({ ...d, scheduledAt: localDateTime });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [mode, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === "edit") onSubmit(form as ScheduledSurgery);
    else onSubmit(form as NewScheduledSurgery);
  };

  const title = mode === "edit" ? "Edit Jadwal Operasi" : "Tambah Jadwal Baru";

  return (
    <AnimatePresence>
      <motion.div
        key="schedule-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl rounded-md border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="input-style"
              placeholder="Nama Pasien..."
              name="patientName"
              value={safeValue(form.patientName)}
              onChange={handleChange}
              required
            />
            <input
              className="input-style"
              placeholder="Medical Record Number..."
              name="mrn"
              value={safeValue(form.mrn)}
              onChange={handleChange}
              required
            />
            <input
              className="input-style"
              placeholder="Asuransi pasien..."
              name="assurance"
              value={safeValue(form.assurance)}
              onChange={handleChange}
              required
            />
            <input
              className="input-style"
              placeholder="Ruang Perawatan..."
              name="room"
              value={safeValue(form.room)}
              onChange={handleChange}
              required
            />
            <input
              className="sm:col-span-2 input-style"
              placeholder="Prosedur/Tindakan Operasi..."
              name="procedure"
              value={safeValue(form.procedure)}
              onChange={handleChange}
              required
            />
            <input
              className="input-style"
              placeholder="Nama Dokter"
              name="doctorName"
              value={safeValue(form.doctorName)}
              onChange={handleChange}
              required
            />
            <input
              type="datetime-local"
              className="input-style"
              name="scheduledAt"
              value={safeValue(form.scheduledAt)}
              onChange={handleChange}
              required
            />
            <input
              className="input-style"
              placeholder="Catatan Khusus"
              name="notes"
              value={safeValue(form.notes)}
              onChange={handleChange}
            />
            <select
              className="input-style"
              name="status"
              value={safeValue(form.status)}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              className="input-style"
              placeholder="Ruang Operasi..."
              name="assignedOR"
              value={safeValue(form.assignedOR)}
              onChange={handleChange}
            />

            <div className="col-span-1 mt-2 flex items-center justify-end gap-2 sm:col-span-2">
              <motion.button
                type="button"
                onClick={onCancel}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting}
                className="button-secondary"
              >
                Batal
              </motion.button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting}
                className="button-primary flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting
                  ? mode === "edit"
                    ? "Menyimpan..."
                    : "Membuat..."
                  : mode === "edit"
                  ? "Update Jadwal"
                  : "Simpan Jadwal"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
