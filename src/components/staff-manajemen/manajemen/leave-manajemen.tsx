'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, PlusIcon, Calendar, Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LeaveForm, { LeavePayload } from '@/components/staff-manajemen/manajemen/leave-form';
import { LeaveRequest } from '@/types';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  /** ---------------- FETCH DATA ---------------- */
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leave');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeaves(data);
    } catch {
      toast.error('Gagal memuat daftar cuti');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  /** ---------------- UPDATE STATUS ---------------- */
  const updateStatus = async (id: string, status: 'Disetujui' | 'Ditolak') => {
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Cuti ${status}`);
      fetchLeaves();
    } catch {
      toast.error('Gagal memperbarui status cuti');
    }
  };

  /** ---------------- UI ---------------- */
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Clipboard className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Permohonan Cuti / Sakit / Izin
          </h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Tambah Pengajuan
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      ) : leaves.length === 0 ? (
        <p className="text-gray-500 italic text-sm text-center py-8">
          Belum ada permohonan cuti, sakit, atau izin.
        </p>
      ) : (
        <>
          {/* 💻 DESKTOP VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <motion.table
              layout
              className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700"
            >
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">Jenis</th>
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-left">Alasan</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {leaves.map((l) => (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-3 py-2">{l.staffName}</td>
                      <td className="px-3 py-2">{l.type}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {l.startDate} - {l.endDate}
                      </td>
                      <td className="px-3 py-2">{l.reason || '-'}</td>
                      <td
                        className={`px-3 py-2 font-semibold ${
                          l.status === 'Disetujui'
                            ? 'text-green-600'
                            : l.status === 'Ditolak'
                            ? 'text-red-500'
                            : 'text-yellow-500'
                        }`}
                      >
                        {l.status}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {l.status === 'Menunggu' && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => updateStatus(l.id, 'Disetujui')}
                              className="text-green-600 hover:text-green-800 transition"
                              title="Setujui"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => updateStatus(l.id, 'Ditolak')}
                              className="text-red-500 hover:text-red-700 transition"
                              title="Tolak"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </motion.table>
          </div>

          {/* 📱 MOBILE VIEW */}
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {leaves.map((l) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {l.staffName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Calendar size={14} /> {l.startDate} - {l.endDate}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        l.status === 'Disetujui'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : l.status === 'Ditolak'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Jenis:
                    </span>{' '}
                    {l.type}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Alasan:
                    </span>{' '}
                    {l.reason || '-'}
                  </p>

                  {l.status === 'Menunggu' && (
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => updateStatus(l.id, 'Disetujui')}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 transition text-sm"
                      >
                        <CheckCircle size={16} /> Setujui
                      </button>
                      <button
                        onClick={() => updateStatus(l.id, 'Ditolak')}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 transition text-sm"
                      >
                        <XCircle size={16} /> Tolak
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* 🧩 Form Modal */}
      <AnimatePresence>
        {showForm && (
          <LeaveForm
            onSuccess={() => {
              fetchLeaves();
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
