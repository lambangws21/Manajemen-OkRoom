'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OngoingSurgery } from '@/types'; // Fokus pada OngoingSurgery
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import {  Play, Square, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

// Tipe untuk status yang bisa di-update
type SurgeryStatus = 'Persiapan Operasi' | 'Operasi Berlangsung' | 'Operasi Selesai' | 'Recovery';

export default function OperasiDetailPage() {
  // 💥 PERBAIKAN: Gunakan useParams untuk client component
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // Ambil ID dari URL

  // 💥 PERBAIKAN: State berfokus pada OngoingSurgery, bukan ScheduledSurgery
  const [surgery, setSurgery] = useState<OngoingSurgery | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 💥 BARU: Fungsi untuk mengambil data operasi yang sedang berlangsung
  const fetchOngoingSurgery = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/operasi/${id}`); // Panggil API baru
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Data operasi tidak ditemukan');
      }
      const data: OngoingSurgery = await res.json();
      setSurgery(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOngoingSurgery();
  }, [fetchOngoingSurgery]);

  // 💥 BARU: Fungsi untuk update status operasi (Mulai, Selesai, dll.)
  const handleUpdateStatus = async (newStatus: SurgeryStatus) => {
    if (!surgery) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/operasi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal update status');
      }
      
      const updatedSurgery: OngoingSurgery = await res.json();
      setSurgery(updatedSurgery); // Update state lokal dengan data baru
      
      toast.success(`Status pasien ${surgery.caseId} diubah ke: ${newStatus}`);

      // Jika selesai, arahkan ke halaman lain (misal: dashboard atau recovery)
      if (newStatus === 'Operasi Selesai' || newStatus === 'Recovery') {
          toast.info("Operasi selesai, mengarahkan kembali ke Papan Kendali...");
          setTimeout(() => {
              router.push('/papan-kendali'); // Arahkan ke papan kendali utama
          }, 2000);
      }

    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // 💥 DIHAPUS: handleSubmit (logika serah terima) dihapus karena sudah di halaman lain.

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (error || !surgery) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>{error || `Pasien dengan ID Operasi "${id}" tidak ditemukan di papan operasi.`}</p>
      </div>
    );
  }

  // Tentukan tombol aksi berdasarkan status saat ini
  const renderActionButtons = () => {
    switch (surgery.status) {
      case 'Persiapan Operasi':
        return (
          <Button onClick={() => handleUpdateStatus('Operasi Berlangsung')} disabled={isUpdating} className="w-full bg-green-600 hover:bg-green-700">
            <Play size={16} className="mr-2" /> Mulai Operasi
          </Button>
        );
      case 'Operasi Berlangsung':
        return (
          <Button onClick={() => handleUpdateStatus('Operasi Selesai')} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700">
            <Square size={16} className="mr-2" /> Selesai Operasi (Menuju Recovery)
          </Button>
        );
      case 'Ruang Pemulihan':
      case 'Ruang Pemulihan':
        return (
          <Button disabled className="w-full bg-gray-500">
            <CheckSquare size={16} className="mr-2" /> Operasi Telah Selesai
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-2xl">
        <header className="flex items-center border-b dark:border-gray-700 pb-4 mb-6">
          {/* 💥 PERBAIKAN: Ganti ikon ke status 'Play' */}
          <Play size={28} className="mr-4 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Papan Kendali Operasi</h1>
            <p className="text-gray-500 dark:text-gray-400">Memulai dan menyelesaikan proses operasi.</p>
          </div>
        </header>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-2">
          {/* 💥 PERBAIKAN: Tampilkan data dari OngoingSurgery */}
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Case ID:</span><strong className="dark:text-white">{surgery.caseId}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Dokter:</span><strong className="dark:text-white">{surgery.doctorName}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Prosedur:</span><strong className="dark:text-white">{surgery.procedure}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Kamar:</span><strong className="dark:text-white">{surgery.operatingRoom}</strong></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Status Saat Ini:</span>
            <strong className="px-3 py-1 rounded-full bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100 text-sm">
              {surgery.status}
            </strong>
          </div>
        </div>

        {/* Logic form serah terima dihapus, diganti dengan tombol aksi */}
        <div className="space-y-4">
          <p className="text-sm text-center text-gray-500">Ubah status operasi pasien:</p>
          <div className="pt-2">
            {renderActionButtons()}
          </div>
        </div>
      </Card>
    </div>
  );
}