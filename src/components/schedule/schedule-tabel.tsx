'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScheduledSurgery } from '@/types'; // Asumsi ScheduledSurgery ada di sini
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Helper untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function ControlBoard() {
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>([]);
  const [filtered, setFiltered] = useState<ScheduledSurgery[]>([]);
  const [search, setSearch] = useState('');
  // 💥 PERBAIKAN: Inisialisasi dateFilter dengan tanggal hari ini
  const [dateFilter, setDateFilter] = useState(getTodayDateString()); 
  const [loading, setLoading] = useState(true);

  // 🔹 Definisikan semua kemungkinan status dan kelas warnanya
  const getStatusClasses = useCallback((status: string) => {
    switch (status) {
      case 'Operasi Berlangsung':
      case 'Sedang Tindakan':
        return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100'; // Merah
      case 'Persiapan Operasi':
      case 'Terkonfirmasi':
      case 'Pasien Diterima':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100'; // Kuning/Persiapan
      case 'Operasi Selesai':
      case 'Ruang Pemulihan':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100'; // Biru/Selesai
      case 'Dibatalkan':
        return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'; // Abu-abu/Dibatalkan
      default:
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100'; // Default/Status Lain
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Format tanggal + jam 24 jam (misal: 30 Okt 2025, 14:30)
  const formatDateTime = (isoDate: string) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24 jam format
    }).format(date);
  };

  // 💥 PERUBAHAN: Logika filter menggunakan dateFilter yang sudah diinisialisasi
  useEffect(() => {
    const lowerSearch = search.toLowerCase();

    const filteredData = schedule.filter(
      (item) => {
        const dateMatch = dateFilter 
          ? item.scheduledAt.startsWith(dateFilter) 
          : true; // Jika dateFilter kosong (direset), tampilkan semua tanggal
        
        const searchMatch = lowerSearch === '' || 
          item.patientName.toLowerCase().includes(lowerSearch) ||
          item.mrn.toLowerCase().includes(lowerSearch) ||
          item.procedure.toLowerCase().includes(lowerSearch);
          
        return dateMatch && searchMatch;
      }
    );

    setFiltered(filteredData);
  }, [schedule, dateFilter, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setSchedule(data);
    } catch {
      toast.error('Gagal memuat data jadwal operasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 transition-all duration-300">
      {/* FILTER SECTION */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Cari nama, MRN, atau tindakan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                     focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <input
          type="date"
          // 💥 MODIFIKASI: Mengatur dateFilter ke nilai state (yang sudah terinisialisasi hari ini)
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full md:w-1/4 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 
                     focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {/* 🔹 Tombol reset hanya muncul jika dateFilter diatur ke tanggal lain atau direset */}
        {dateFilter && dateFilter !== getTodayDateString() && (
             <motion.button
                onClick={() => setDateFilter(getTodayDateString())} // Reset ke hari ini
                className="w-full md:w-auto px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 transition"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
             >
                Reset ke Hari Ini
             </motion.button>
        )}
        {/* Tombol Hapus Filter jika filter tanggal tidak kosong */}
        {dateFilter && (
             <motion.button
                onClick={() => setDateFilter('')}
                className="w-full md:w-auto px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-200 transition"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
             >
                Tampilkan Semua
             </motion.button>
        )}
      </div>

      {/* DATA TABLE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <motion.div
            className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto ${
              filtered.length > 15 ? 'max-h-[500px]' : ''
            }`}
          >
            <table className="w-full text-sm md:text-base border-collapse">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 shadow-sm z-10">
                <tr>
                  <th className="py-2 px-3 text-left min-w-[150px]">Tanggal & Waktu</th>
                  <th className="py-2 px-3 text-left">MRN</th>
                  <th className="py-2 px-3 text-left min-w-[120px]">Nama Pasien</th>
                  <th className="py-2 px-3 text-left min-w-[180px]">Jenis Tindakan</th>
                  <th className="py-2 px-3 text-left">Operator</th>
                  <th className="py-2 px-3 text-left">Note</th>
                  <th className="py-2 px-3 text-left">OR</th>
                  <th className="py-2 px-3 text-left min-w-[120px]">Status</th>
                </tr>
              </thead>

              <motion.tbody layout>
                {filtered.map((surgery, index) => (
                  <motion.tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 
                               hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-200">
                      {formatDateTime(surgery.scheduledAt)}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-200">
                      {surgery.mrn} </td> 
                    <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-100">
                      {surgery.patientName}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                      {surgery.procedure}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                      {surgery.doctorName}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                      {surgery.notes}
                    </td>
                    <td className="py-2 px-3 text-gray-700 font-extrabold  dark:text-gray-300">
                     OR {surgery.assignedOR}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(surgery.status)}`}>
                        {surgery.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
              Tidak ada jadwal operasi yang ditemukan.
            </p>
          )}
        </>
      )}
    </div>
  );
}
