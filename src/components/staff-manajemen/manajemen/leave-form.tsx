'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Send, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export interface LeavePayload {
  staffName: string;
  type: 'Cuti' | 'Sakit' | 'Izin';
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function LeaveForm({ onSuccess, onClose }: LeaveFormProps) {
  const [formData, setFormData] = useState<LeavePayload>({
    staffName: '',
    type: 'Cuti',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.staffName || !formData.startDate || !formData.endDate) {
      toast.error('Nama staf dan tanggal wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'Menunggu Persetujuan' }),
      });

      if (!res.ok) throw new Error('Gagal mengirim pengajuan.');

      toast.success('Pengajuan berhasil dikirim!');
      setFormData({
        staffName: '',
        type: 'Cuti',
        startDate: '',
        endDate: '',
        reason: '',
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengirim pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-md relative border border-gray-200 dark:border-gray-700"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-red-400 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center mb-4">
          <CalendarDays size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Form Pengajuan Cuti / Sakit / Izin
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Nama Staf
            </label>
            <input
              type="text"
              name="staffName"
              value={formData.staffName}
              onChange={handleChange}
              placeholder="Masukkan nama staf"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Jenis Pengajuan
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Cuti">Cuti</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Tanggal Selesai
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Alasan
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Tuliskan alasan cuti / izin / sakit..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
