'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockScheduledSurgeries, mockSurgeryBoard } from '@/lib/mock-data';
import { ScheduledSurgery, OngoingSurgery } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ArrowRightLeft } from 'lucide-react';

export default function SerahTerimaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [surgery, setSurgery] = useState<ScheduledSurgery | null | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  
  useEffect(() => {
    const findSurgery = (id: string) => mockScheduledSurgeries.find(s => s.id === id) || null;
    setSurgery(findSurgery(params.id));
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surgery || !notes.trim()) {
      alert('Catatan serah terima tidak boleh kosong.');
      return;
    }
    
    // 1. Update status di "database" mock
    const patientInDb = mockScheduledSurgeries.find(p => p.id === surgery.id);
    if (patientInDb) {
      patientInDb.status = 'Pasien Diterima';
    }

    // 2. Tambahkan/update ke Live View Board
    const liveEntry: OngoingSurgery = {
      id: surgery.id,
      procedure: surgery.procedure,
      doctorName: surgery.doctorName,
      caseId: `*** *** ${surgery.mrn.slice(-3)}`,
      operatingRoom: surgery.assignedOR || 'OK Antrian',
      status: 'Persiapan Operasi',
      startTime: new Date().toISOString(),
      team: { nurses: surgery.assignedTeam?.nurses || [] },
    };

    const boardWithoutPatient = mockSurgeryBoard.filter(p => p.id !== surgery.id);
    mockSurgeryBoard.length = 0;
    mockSurgeryBoard.push(...boardWithoutPatient, liveEntry);
    
    alert(`Serah terima untuk pasien ${surgery.patientName} berhasil dicatat.`);
    
    // 3. Arahkan kembali ke Papan Kendali setelah selesai
    router.push('/papan-kendali');
  };

  if (surgery === undefined) {
    return <div className="flex h-full w-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (surgery === null) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>Pasien dengan ID Operasi &quot;{params.id}&quot; tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-2xl">
        <header className="flex items-center border-b dark:border-gray-700 pb-4 mb-6">
          <ArrowRightLeft size={28} className="mr-4 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Serah Terima Pasien</h1>
            <p className="text-gray-500 dark:text-gray-400">Pastikan data pasien sudah benar sebelum konfirmasi.</p>
          </div>
        </header>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-2">
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Nama Pasien:</span><strong className="dark:text-white">{surgery.patientName}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">No. RM:</span><strong className="dark:text-white">{surgery.mrn}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Prosedur:</span><strong className="dark:text-white">{surgery.procedure}</strong></div>
          <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Status Terakhir:</span><strong className="dark:text-white">{surgery.status}</strong></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="handoverNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan Penting Saat Serah Terima
            </label>
            <textarea 
              id="handoverNotes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
              rows={6}
              placeholder="Contoh: Kondisi stabil, TTV normal, tidak ada keluhan nyeri. Diterima oleh Ns. Wayan dari Ruang Pemulihan."
              required
            />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full">
              Konfirmasi & Selesaikan Serah Terima
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}