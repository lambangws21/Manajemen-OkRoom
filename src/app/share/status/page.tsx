'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ShieldCheck, Clock, Hospital, RefreshCw, User2 } from 'lucide-react';
// import Link from 'next/link';
import { motion } from 'framer-motion';

interface PublicSurgeryData {
  patientName: string;
  operatingRoom: string;
  status: string;
  lastUpdated: string;
}

export default function PublicSharePage() {
  const { mrn } = useParams();
  const [data, setData] = useState<PublicSurgeryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!mrn) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${mrn}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Data tidak ditemukan');
      setData(json);
      setLastFetch(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [mrn]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const statusColor = (status: string) => {
    if (status.includes('Menunggu')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status.includes('Berlangsung')) return 'bg-red-100 text-red-800 border-red-300';
    if (status.includes('Selesai') || status.includes('Pemulihan')) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-gray-800 flex flex-col items-center justify-center px-6 py-10 relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Hospital className="mx-auto mb-3 text-sky-600" size={50} />
        <h1 className="text-3xl font-extrabold text-sky-800 tracking-tight">
          Status Operasi Pasien
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tampilan informasi real-time untuk keluarga pasien
        </p>
      </motion.div>

      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-sky-500" size={38} />
            <p className="text-sm text-gray-500 mt-4">Memuat status operasi...</p>
          </div>
        ) : error ? (
          <p className="text-red-600 font-semibold">{error}</p>
        ) : (
          <div>
            {/* 🧍 Nama Pasien */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <User2 className="text-sky-500" size={20} />
              <p className="font-semibold text-lg text-sky-700">
                {data!.patientName}
              </p>
            </div>

            {/* 🩺 Status Operasi */}
            <div
              className={`px-5 py-4 rounded-xl border font-bold text-lg ${statusColor(
                data!.status
              )}`}
            >
              {data!.status}
            </div>

            {/* 📍 Info Tambahan */}
            <div className="mt-5 space-y-2">
              <p className="text-gray-700 text-base">
                <b>Kamar Operasi:</b> {data!.operatingRoom}
              </p>
              <p className="text-xs text-gray-400 flex justify-center items-center gap-1">
                <Clock size={14} /> Diperbarui:{' '}
                {new Date(data!.lastUpdated).toLocaleTimeString('id-ID')}
              </p>
              {lastFetch && (
                <p className="text-[10px] text-gray-400 italic">
                  Disinkronkan: {lastFetch.toLocaleTimeString('id-ID')}
                </p>
              )}
            </div>

            {/* 🔄 Tombol Refresh */}
            <button
              onClick={fetchData}
              className="mt-6 inline-flex items-center px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw size={14} className="mr-2" /> Perbarui Sekarang
            </button>

            {/* 🔒 Info keamanan */}
            <div className="mt-6 flex flex-col items-center border-t border-gray-100 pt-4">
              <ShieldCheck className="text-green-500 mb-1" />
              <p className="text-xs text-gray-400 text-center max-w-sm">
                Data ini hanya menampilkan nama dan status operasi pasien,
                tanpa informasi medis pribadi lainnya.
              </p>
            </div>
          </div>
        )}

        {/* <Link
          href="/"
          className="block mt-8 text-sky-600 hover:text-sky-700 text-sm underline"
        >
          ← Kembali ke Beranda
        </Link> */}
      </motion.div>

      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-sky-200/40 via-white to-transparent blur-3xl -z-10"></div>
    </div>
  );
}
