'use client'; // <-- KUNCI UTAMA: Jadikan ini sebagai Client Component

import { useState, useEffect } from 'react';
import { mockScheduledSurgeries } from '@/lib/mock-data';
import { ScheduledSurgery, SurgeryLog } from '@/types';
import PatientWorkflowTracker from '@/components/operasi/PatientWorkflowTracker';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

export default function OperasiDetailPage({ params }: { params: { id: string } }) {
  // State untuk menyimpan data operasi
  // 'undefined' = sedang memuat, 'null' = tidak ditemukan
  const [surgery, setSurgery] = useState<ScheduledSurgery | null | undefined>(undefined);

  // useEffect untuk mencari data setelah komponen dimuat di browser.
  // Ini adalah cara yang benar untuk mengambil data di Client Component.
  useEffect(() => {
    const findSurgery = (id: string) => mockScheduledSurgeries.find(s => s.id === id) || null;
    setSurgery(findSurgery(params.id));
  }, [params.id]);

  // Fungsi untuk memperbarui status (sudah benar)
  const handleUpdate = (id: string, newStatus: ScheduledSurgery['status'], log?: SurgeryLog) => {
    if (!surgery) return;

    const updatedSurgery = { ...surgery, status: newStatus, surgeryLog: log || surgery.surgeryLog };
    setSurgery(updatedSurgery);
    
    console.log("Updated Surgery Data:", updatedSurgery);
    alert(`Status pasien diperbarui menjadi: ${newStatus}`);
  };

  // Tampilan saat data sedang dicari (loading)
  if (surgery === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  // Tampilan jika data tidak ditemukan
  if (surgery === null) {
    return (
      <div className="flex flex-col h-screen">
        <main className="flex-grow flex items-center justify-center p-8">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Data Operasi dengan ID <span className="font-mono bg-red-100 dark:bg-red-900/50 p-1 rounded">{params.id}</span> tidak ditemukan.
            </p>
        </main>
      </div>
    );
  }

  // Tampilan utama jika data ditemukan
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PatientWorkflowTracker surgery={surgery} onUpdate={handleUpdate} />
          </div>
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-bold border-b pb-2 mb-3 dark:border-gray-700 dark:text-gray-100">Detail Pasien</h3>
              <div className="space-y-2 text-sm dark:text-gray-300">
                <p><strong>Nama:</strong> {surgery.patientName}</p>
                <p><strong>No. RM:</strong> {surgery.mrn}</p>
                <p><strong>Dokter:</strong> {surgery.doctorName}</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}