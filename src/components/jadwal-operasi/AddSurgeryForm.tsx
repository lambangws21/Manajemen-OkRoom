"use client";
import { useState, FormEvent } from "react";
import { ScheduledSurgery } from "@/types/schedule";
import Button from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import InputWithIcon from "@/components/ui/InputWithIcon";
import {
  User,
  ClipboardList,
  Stethoscope,
  BriefcaseMedical,
  Clock,
  Tag,
  X,
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

type NewSurgeryData = Omit<ScheduledSurgery, "id">;

const STATUS_OPTIONS: ScheduledSurgery["status"][] = [
  "Terjadwal",
  "Terkonfirmasi",
  "Dibatalkan",
  // "Pasien Diterima",
  "Siap Panggil",
  "Dipanggil",
  // "Operasi Berlangsung",
  // "Operasi Selesai",
  // "Persiapan Operasi",
  // "Ruang Pemulihan",
];

interface AddSurgeryFormProps {
  onClose: () => void;
  onSubmit: (data: NewSurgeryData) => void;
}

export default function AddSurgeryForm({ onClose, onSubmit }: AddSurgeryFormProps) {
  const [formData, setFormData] = useState<NewSurgeryData>({
    patientName: "",
    mrn: "",
    procedure: "",
    doctorName: "",
    scheduledAt: "", // ✅ perbaiki nama
    status: "Terjadwal",
    assignedOR: undefined,
    assignedTeam: undefined,
    surgeryLog: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: ScheduledSurgery["status"]) => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              Tambah Jadwal Operasi Baru
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Isi detail di bawah ini untuk menambahkan jadwal baru.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InputWithIcon
                icon={<User />}
                name="patientName"
                placeholder="Nama Pasien"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
              <InputWithIcon
                icon={<ClipboardList />}
                name="mrn"
                placeholder="Nomor Rekam Medis (MRN)"
                value={formData.mrn}
                onChange={handleChange}
                required
              />
              <InputWithIcon
                icon={<BriefcaseMedical />}
                name="procedure"
                placeholder="Prosedur yang Direncanakan"
                value={formData.procedure}
                onChange={handleChange}
                required
              />
              <InputWithIcon
                icon={<Stethoscope />}
                name="doctorName"
                placeholder="Nama Dokter"
                value={formData.doctorName}
                onChange={handleChange}
                required
              />

              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <Select onValueChange={handleStatusChange} value={formData.status}>
                    <SelectTrigger className="w-full pl-10 ">
                      <SelectValue placeholder="Pilih status operasi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="hover:bg-gray-200 hover:text-gray-900 bg-amber-800 mb-1"
                        >
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="md:col-span-2">
                <InputWithIcon
                  icon={<Clock />}
                  name="scheduledAt" // ✅ ubah name
                  type="datetime-local"
                  value={formData.scheduledAt} // ✅ ubah value
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-gray-200 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan Jadwal
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
